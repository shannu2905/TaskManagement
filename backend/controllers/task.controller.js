import Task from '../models/Task.model.js';
import Comment from '../models/Comment.model.js';
import Project from '../models/Project.model.js';
import Notification from '../models/Notification.model.js';
import { createTaskSchema, updateTaskSchema, createCommentSchema } from '../validators/task.validator.js';

export const getTasks = async (req, res, next) => {
  try {
    const { 
      projectId, 
      status, 
      priority, 
      assignee, 
      dueDateFrom, 
      dueDateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    const userId = req.user._id;

    let query = {};

    if (projectId) {
      // Verify user has access to project
      const project = await Project.findOne({
        _id: projectId,
        $or: [{ owner: userId }, { members: userId }]
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      query.projectId = projectId;
    } else {
      // Get all projects user has access to
      const projects = await Project.find({
        $or: [{ owner: userId }, { members: userId }]
      }).select('_id');

      const projectIds = projects.map(p => p._id);
      query.projectId = { $in: projectIds };
    }

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignee) {
      if (assignee === 'unassigned') {
        query.assignee = null;
      } else {
        query.assignee = assignee;
      }
    }

    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) {
        query.dueDate.$gte = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        query.dueDate.$lte = new Date(dueDateTo);
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar')
      .populate('projectId', 'title')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email avatar'
        },
        options: { sort: { createdAt: -1 } }
      })
      .populate('attachments.uploadedBy', 'name email avatar')
      .sort(sort);

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id)
      .populate('assignee', 'name email avatar')
      .populate('projectId', 'title owner members')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email avatar'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access to project
    const project = task.projectId;
    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.toString() === userId.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user._id;

    // Verify project access
    const project = await Project.findById(value.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';
    const isMember = project.members.some(m => m.toString() === userId.toString());

    if (!isOwner && !isAdmin && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = await Task.create({
      ...value,
      status: value.status || 'todo',
      priority: value.priority || 'medium'
    });

    await task.populate('assignee', 'name email avatar');
    await task.populate('projectId', 'title');

    // Create notification if assignee is set
    const io = req.app.get('io');
    if (value.assignee && value.assignee !== userId.toString()) {
      const notification = await Notification.create({
        userId: value.assignee,
        type: 'task_assigned',
        payload: {
          taskId: task._id,
          taskTitle: task.title,
          projectId: project._id,
          projectTitle: project.title,
          assignedBy: userId
        }
      });

      if (io) {
        io.to(`user-${value.assignee}`).emit('notification', notification);
      }
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id).populate('projectId', 'owner members');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.projectId;
    const isOwner = project.owner.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignee?.toString() === userId.toString();

    // Check permissions
    if (!isOwner && !isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Members can only update their assigned tasks
    if (req.user.role === 'member' && !isAssignee && !isOwner) {
      return res.status(403).json({ message: 'You can only update your assigned tasks' });
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignee?.toString();

    Object.assign(task, value);
    await task.save();

    await task.populate('assignee', 'name email avatar');
    await task.populate('projectId', 'title');

    const io = req.app.get('io');

    // Create notification for status change
    if (value.status && value.status !== oldStatus && task.assignee) {
      const notification = await Notification.create({
        userId: task.assignee._id,
        type: 'status_changed',
        payload: {
          taskId: task._id,
          taskTitle: task.title,
          oldStatus,
          newStatus: value.status,
          projectId: project._id,
          projectTitle: project.title
        }
      });

      if (io) {
        io.to(`user-${task.assignee._id}`).emit('notification', notification);
      }
    }

    // Create notification for assignee change
    if (value.assignee && value.assignee !== oldAssignee && value.assignee !== userId.toString()) {
      const notification = await Notification.create({
        userId: value.assignee,
        type: 'task_assigned',
        payload: {
          taskId: task._id,
          taskTitle: task.title,
          projectId: project._id,
          projectTitle: project.title,
          assignedBy: userId
        }
      });

      if (io) {
        io.to(`user-${value.assignee}`).emit('notification', notification);
      }
    }

    // Emit socket event for real-time updates
    if (io) {
      io.to(`project-${project._id}`).emit('task-updated', task);
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id).populate('projectId', 'owner');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.projectId;
    const isOwner = project.owner.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only owner or admin can delete tasks' });
    }

    // Delete comments
    await Comment.deleteMany({ taskId: id });

    await Task.findByIdAndDelete(id);

    const io = req.app.get('io');
    if (io) {
      io.to(`project-${project._id}`).emit('task-deleted', { taskId: id });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { error, value } = createCommentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id).populate('projectId', 'owner members');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.projectId;
    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.toString() === userId.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = await Comment.create({
      taskId: id,
      author: userId,
      text: value.text
    });

    task.comments.push(comment._id);
    await task.save();

    await comment.populate('author', 'name email avatar');

    const io = req.app.get('io');

    // Create notification for task assignee (if different from comment author)
    if (task.assignee && task.assignee.toString() !== userId.toString()) {
      const notification = await Notification.create({
        userId: task.assignee,
        type: 'comment_added',
        payload: {
          taskId: task._id,
          taskTitle: task.title,
          commentId: comment._id,
          commentText: comment.text,
          projectId: project._id,
          projectTitle: project.title,
          authorId: userId
        }
      });

      if (io) {
        io.to(`user-${task.assignee}`).emit('notification', notification);
      }
    }

    // Emit socket event
    if (io) {
      io.to(`project-${project._id}`).emit('comment-added', comment);
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const task = await Task.findById(id).populate('projectId', 'owner members');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.projectId;
    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.toString() === userId.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add attachment to task
    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: userId
    };

    task.attachments.push(attachment);
    await task.save();

    await task.populate('attachments.uploadedBy', 'name email avatar');
    await task.populate('projectId', 'title');

    const io = req.app.get('io');
    if (io) {
      io.to(`project-${project._id}`).emit('task-updated', task);
    }

    res.status(201).json({ attachment, task });
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req, res, next) => {
  try {
    const { id, attachmentId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id).populate('projectId', 'owner members');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.projectId;
    const isOwner = project.owner.toString() === userId.toString();
    const isMember = project.members.some(m => m.toString() === userId.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find and remove attachment
    const attachment = task.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Only allow deletion by uploader, owner, or admin
    const isUploader = attachment.uploadedBy.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isUploader && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own attachments' });
    }

    // Delete file from filesystem
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../uploads', attachment.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    task.attachments.pull(attachmentId);
    await task.save();

    await task.populate('projectId', 'title');

    const io = req.app.get('io');
    if (io) {
      io.to(`project-${project._id}`).emit('task-updated', task);
    }

    res.json({ message: 'Attachment deleted successfully', task });
  } catch (error) {
    next(error);
  }
};


import Project from '../models/Project.model.js';
import Task from '../models/Task.model.js';
import Notification from '../models/Notification.model.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    })
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .sort({ createdAt: -1 });

    // Get task counts for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id });
        const totalTasks = tasks.length;
        const doneTasks = tasks.filter(t => t.status === 'done').length;
        const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          stats: {
            totalTasks,
            doneTasks,
            progress
          }
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: id,
      $or: [{ owner: userId }, { members: userId }]
    })
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Get projects for a specific member (by id param)
export const getMemberProjects = async (req, res, next) => {
  try {
    const { id } = req.params; // memberId
    const requesterId = req.user._id;

    if (id.toString() !== requesterId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const projects = await Project.find({
      $or: [{ owner: id }, { members: id }]
    })
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .sort({ createdAt: -1 });

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id });
        const totalTasks = tasks.length;
        const doneTasks = tasks.filter((t) => t.status === 'done').length;
        const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

        return {
          ...project.toObject(),
          stats: { totalTasks, doneTasks, progress },
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    next(error);
  }
};

// Detailed project info with owner, members, and computed stats
export const getProjectDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: id,
      $or: [{ owner: userId }, { members: userId }]
    })
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: project._id });
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    res.json({
      ...project.toObject(),
      stats: { totalTasks, doneTasks, progress },
      tasksCount: totalTasks,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description } = value;
    const userId = req.user._id;

    const project = await Project.create({
      title,
      description: description || '',
      owner: userId,
      members: [userId]
    });

  await project.populate('owner members', 'name email avatar role');

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { error, value } = updateProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    const isOwner = project.owner.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';
    const isMember = project.members.some(m => m.toString() === userId.toString());

    if (!isOwner && !isAdmin && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only owner or admin can update members
    if (value.members && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only owner or admin can update members' });
    }

    Object.assign(project, value);
    await project.save();

  await project.populate('owner members', 'name email avatar role');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    // Delete all tasks and comments
    await Task.deleteMany({ projectId: id });

    await Project.findByIdAndDelete(id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, message } = req.body;
    const userId = req.user._id;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner or admin can invite
    const isOwner = project.owner.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only owner or admin can invite members' });
    }

    // Find user by email
    const User = (await import('../models/User.model.js')).default;
    const userToInvite = await User.findOne({ email: email.toLowerCase() });

    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Owners may only invite admins to projects (per requirement)
    if (isOwner && userToInvite.role !== 'admin') {
      return res.status(403).json({ message: 'Owners can only invite admins to projects' });
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(
      m => m.toString() === userToInvite._id.toString()
    );
    const isOwnerUser = project.owner.toString() === userToInvite._id.toString();

    if (isAlreadyMember || isOwnerUser) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Add user to members
    project.members.push(userToInvite._id);
    await project.save();

  await project.populate('owner members', 'name email avatar role');

    // Create notification (include optional message text)
    const Notification = (await import('../models/Notification.model.js')).default;
    const notification = await Notification.create({
      userId: userToInvite._id,
      type: 'project_invite',
      payload: {
        projectId: project._id,
        projectTitle: project.title,
        invitedBy: userId
      },
      message: message || `You were invited to join project "${project.title}" by ${req.user.name}`
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userToInvite._id}`).emit('notification', notification);
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner or admin can remove members
    const isOwner = project.owner.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only owner or admin can remove members' });
    }

    // Cannot remove owner
    if (project.owner.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    // Prevent admin from removing other admins
    const User = (await import('../models/User.model.js')).default;
    const memberUser = await User.findById(memberId);
    if (!memberUser) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (isAdmin && (memberUser.role === 'admin' || memberUser.role === 'owner')) {
      return res.status(403).json({ message: 'Admins cannot remove other admins or the owner' });
    }

    // Remove member
    project.members = project.members.filter(
      m => m.toString() !== memberId
    );
    await project.save();

  await project.populate('owner members', 'name email avatar role');

    res.json(project);
  } catch (error) {
    next(error);
  }
};


import Project from '../models/Project.model.js';
import ProjectComment from '../models/ProjectComment.model.js';
import Notification from '../models/Notification.model.js';

// Get comments for a project
export const getProjectComments = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;

    const comments = await ProjectComment.find({ projectId })
      .sort({ createdAt: -1 })
      .populate('author', 'name email avatar');

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// Add comment to a project
export const addProjectComment = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const { text } = req.body;
    const user = req.user;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Authorization: allow if user is owner or a member of the project or a system admin
    const isOwner = project.owner.toString() === user._id.toString();
    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isSystemAdmin = user.role === 'admin';

    if (!(isOwner || isMember || isSystemAdmin)) {
      return res.status(403).json({ message: 'You are not allowed to comment on this project' });
    }

    const comment = await ProjectComment.create({ projectId, author: user._id, text: text.trim() });
    const populated = await comment.populate('author', 'name email avatar');

    // Optionally emit socket notification to project room if io is available
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`project-${projectId}`).emit('project:comment', populated);
      }
    } catch (e) {
      // ignore socket errors
    }

    // If the author is a system admin, create notifications for all project members
    // so they receive the admin message as a personal notification as well.
    try {
      if (user.role === 'admin') {
        const io = req.app.get('io');

        // Build list of recipients: project members + owner (dedupe)
        const recipients = new Set();
        if (Array.isArray(project.members)) project.members.forEach(m => recipients.add(m.toString()));
        if (project.owner) recipients.add(project.owner.toString());

        // Remove the admin commenter from recipients
        recipients.delete(user._id.toString());

        // Create notifications for each recipient and emit via socket
        for (const userId of recipients) {
          try {
            const notification = await Notification.create({
              userId,
              type: 'comment_added',
              payload: {
                projectId,
                projectTitle: project.title,
                commentId: populated._id,
                text: populated.text,
                author: { _id: populated.author._id, name: populated.author.name }
              }
            });

            if (io) {
              io.to(`user-${userId}`).emit('notification', notification);
            }
          } catch (err) {
            // continue creating other notifications even if one fails
            console.error('Failed to notify user for project comment', err);
          }
        }
      }
    } catch (err) {
      // swallow notification errors to avoid breaking comment creation
      console.error('Error creating project comment notifications', err);
    }

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

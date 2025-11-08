import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Task from '../models/Task.model.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Only admin or owner can see all users
    if (userRole !== 'admin' && userRole !== 'owner') {
      return res.status(403).json({ message: 'Access denied. Admin or Owner only.' });
    }

    const users = await User.find({})
      .select('name email role avatar createdAt')
      .sort({ createdAt: -1 });

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const projects = await Project.find({
          $or: [{ owner: user._id }, { members: user._id }]
        });
        
        const tasks = await Task.find({
          $or: [
            { assignee: user._id },
            { projectId: { $in: projects.map(p => p._id) } }
          ]
        });

        return {
          ...user.toObject(),
          stats: {
            totalProjects: projects.length,
            ownedProjects: projects.filter(p => p.owner.toString() === user._id.toString()).length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'done').length
          }
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Admin or owner can get stats for any user, others can only get their own
    const targetUserId = req.params.id || userId;
    
    if (userRole !== 'admin' && userRole !== 'owner' && targetUserId !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const projects = await Project.find({
      $or: [{ owner: user._id }, { members: user._id }]
    });

    const tasks = await Task.find({
      $or: [
        { assignee: user._id },
        { projectId: { $in: projects.map(p => p._id) } }
      ]
    });

    const stats = {
      totalProjects: projects.length,
      ownedProjects: projects.filter(p => p.owner.toString() === user._id.toString()).length,
      memberProjects: projects.filter(p => p.owner.toString() !== user._id.toString()).length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};


import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Task from '../models/Task.model.js';
import mongoose from 'mongoose';

// List all admins
export const listAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-passwordHash').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    next(err);
  }
};

// Delete an admin (owner-only expected to call)
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid user id' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'admin') return res.status(400).json({ message: 'User is not an admin' });

    // Prevent deleting an owner via this route
    if (user.role === 'owner') return res.status(400).json({ message: 'Cannot delete an owner via this endpoint' });

    // Remove user references from projects' members arrays
    await Project.updateMany({ members: user._id }, { $pull: { members: user._id } });

    // Remove user document
    await User.deleteOne({ _id: user._id });

    res.json({ message: 'Admin deleted' });
  } catch (err) {
    next(err);
  }
};

// Fetch an admin's projects with per-project progress and task breakdown
export const getAdminProjectsDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid user id' });

    // Find projects where user is owner or member
    const projects = await Project.find({ $or: [{ owner: id }, { members: id }] }).lean();

    const projectIds = projects.map(p => p._id);

    // Aggregate tasks grouped by project and status
    const tasksAgg = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: { projectId: '$projectId', status: '$status' }, count: { $sum: 1 } } }
    ]);

    // Overdue counts per project
    const overdueAgg = await Task.aggregate([
      { $match: { projectId: { $in: projectIds }, dueDate: { $exists: true, $ne: null }, status: { $ne: 'done' } } },
      { $match: { dueDate: { $lt: new Date() } } },
      { $group: { _id: '$projectId', overdue: { $sum: 1 } } }
    ]);

    const tasksByProject = {};
    tasksAgg.forEach(t => {
      const pid = t._id.projectId.toString();
      tasksByProject[pid] = tasksByProject[pid] || { todo: 0, in_progress: 0, done: 0, total: 0 };
      tasksByProject[pid][t._id.status] = t.count;
      tasksByProject[pid].total += t.count;
    });

    overdueAgg.forEach(o => {
      const pid = o._id.toString();
      tasksByProject[pid] = tasksByProject[pid] || { todo: 0, in_progress: 0, done: 0, total: 0 };
      tasksByProject[pid].overdue = o.overdue;
    });

    const result = projects.map(p => {
      const pid = p._id.toString();
      const stats = tasksByProject[pid] || { todo: 0, in_progress: 0, done: 0, total: 0 };
      const progressPercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
      return {
        _id: p._id,
        title: p.title,
        owner: p.owner,
        members: p.members,
        stats: {
          ...stats,
          overdue: stats.overdue || 0,
          progressPercent
        }
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Organization-wide statistics for charts
export const getOrgStats = async (req, res, next) => {
  try {
    // Users by role
    const usersByRoleAgg = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const usersByRole = usersByRoleAgg.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});

    // Tasks by status
    const tasksByStatusAgg = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const tasksByStatus = tasksByStatusAgg.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});

    // Tasks by priority
    const tasksByPriorityAgg = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const tasksByPriority = tasksByPriorityAgg.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});

    // Projects per owner (top owners)
    const projectsByOwnerAgg = await Project.aggregate([
      { $group: { _id: '$owner', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Also compute tasks created per month for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const tasksPerMonthAgg = await Task.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $project: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } } },
      { $group: { _id: '$month', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      usersByRole,
      tasksByStatus,
      tasksByPriority,
      projectsByOwner: projectsByOwnerAgg,
      tasksPerMonth: tasksPerMonthAgg
    });
  } catch (err) {
    next(err);
  }
};

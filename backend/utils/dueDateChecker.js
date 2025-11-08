import Task from '../models/Task.model.js';
import Notification from '../models/Notification.model.js';
import Project from '../models/Project.model.js';

export const checkDueDates = async (io) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      dueDate: {
        $gte: now,
        $lte: tomorrow
      },
      status: { $ne: 'done' }
    }).populate('assignee').populate('projectId');

    for (const task of tasks) {
      if (task.assignee) {
        // Check if notification already exists
        const existingNotification = await Notification.findOne({
          userId: task.assignee._id,
          type: 'due_date_reminder',
          'payload.taskId': task._id.toString(),
          createdAt: {
            $gte: new Date(now.getTime() - 60 * 60 * 1000) // Within last hour
          }
        });

        if (!existingNotification) {
          const notification = await Notification.create({
            userId: task.assignee._id,
            type: 'due_date_reminder',
            payload: {
              taskId: task._id,
              taskTitle: task.title,
              dueDate: task.dueDate,
              projectId: task.projectId._id,
              projectTitle: task.projectId.title
            }
          });

          // Emit socket event
          if (io) {
            io.to(`user-${task.assignee._id}`).emit('notification', notification);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking due dates:', error);
  }
};


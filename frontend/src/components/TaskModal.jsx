import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import useTaskStore from '../store/taskStore';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Send, Calendar, User } from 'lucide-react';
import FileUpload from './FileUpload';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  desc: z.string().max(1000, 'Description too long').optional(),
  assignee: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

export default function TaskModal({ task, projectId, onClose }) {
  const { createTask, updateTask, addComment, fetchTask } = useTaskStore();
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState(task);

  useEffect(() => {
    if (task?._id) {
      const loadTask = async () => {
        try {
          const taskData = await fetchTask(task._id);
          if (taskData) {
            setCurrentTask(taskData);
          }
        } catch (error) {
          console.error('Failed to fetch task:', error);
        }
      };
      loadTask();
    } else {
      setCurrentTask(null);
    }
  }, [task?._id, fetchTask]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          desc: task.desc || '',
          assignee: task.assignee?._id || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : '',
        }
      : {
          status: 'todo',
          // Read system settings for default priority/due date
          priority: (() => {
            try {
              const raw = localStorage.getItem('systemSettings');
              const s = raw ? JSON.parse(raw) : null;
              return s?.taskDefaults?.defaultPriority || 'medium';
            } catch (e) {
              return 'medium';
            }
          })(),
          dueDate: (() => {
            try {
              const raw = localStorage.getItem('systemSettings');
              const s = raw ? JSON.parse(raw) : null;
              const days = s?.taskDefaults?.dueDateRuleDays;
              if (days && !isNaN(Number(days))) {
                return dayjs().add(Number(days), 'day').format('YYYY-MM-DD');
              }
              return '';
            } catch (e) {
              return '';
            }
          })(),
        },
  });

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      if (task) {
        await updateTask(task._id, {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          assignee: data.assignee || null,
        });
        toast.success('Task updated successfully!');
      } else {
        await createTask({
          ...data,
          projectId,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          assignee: data.assignee || null,
        });
        toast.success('Task created successfully!');
      }
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentTask?._id) return;

    setCommentLoading(true);
    try {
      await addComment(currentTask._id, commentText);
      setCommentText('');
      const taskData = await fetchTask(currentTask._id);
      if (taskData) {
        setCurrentTask(taskData);
      }
      toast.success('Comment added!');
    } catch (error) {
      toast.error(error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const canEdit = () => {
    if (!task) return true; // New task creation
    if (!currentTask) return true;
    const isOwner = currentProject?.owner?._id === user?._id;
    const isAdmin = user?.role === 'admin';
    const isAssignee = currentTask.assignee?._id === user?._id;
    return isOwner || isAdmin || isAssignee;
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Input
          label="Task Title"
          placeholder="Enter task title"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2.5 rounded-xl border bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            rows="4"
            placeholder="Enter task description (optional)"
            {...register('desc')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              {...register('status')}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Priority
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              {...register('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assignee
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              {...register('assignee')}
            >
              <option value="">Unassigned</option>
              {currentProject?.members?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Due Date
            </label>
            <Input
              type="date"
              {...register('dueDate')}
            />
          </div>
        </div>

        {task && currentTask && (
          <>
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Attachments
              </h3>
              <FileUpload
                taskId={currentTask._id}
                attachments={currentTask.attachments || []}
                onUploadSuccess={() => {
                  fetchTask(currentTask._id).then(setCurrentTask);
                }}
                onDelete={() => {
                  fetchTask(currentTask._id).then(setCurrentTask);
                }}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Comments</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
              {currentTask.comments && currentTask.comments.length > 0 ? (
                currentTask.comments.map((comment) => (
                  <Card key={comment._id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar
                        name={comment.author?.name}
                        src={comment.author?.avatar}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-gray-900">
                            {comment.author?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddComment}
                disabled={!commentText.trim() || commentLoading}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
          </>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !canEdit()}>
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


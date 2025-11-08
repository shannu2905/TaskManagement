import React, { useEffect, useState, useMemo } from 'react';
import useTaskStore from '../store/taskStore';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import TaskModal from '../components/TaskModal';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, deleteTask, updateTask } = useTaskStore();
  const { projects, fetchProjects, fetchProject } = useProjectStore();

  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [createProjectId, setCreateProjectId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchProjects();
        // Always fetch full task list from the server and apply client-side filtering
        // This ensures the status filter works even if the backend doesn't honor the status param.
        await fetchTasks();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchProjects, fetchTasks]);

  const openCreate = async () => {
    // default project for creation: use first project if available
    const pid = createProjectId || (projects[0] && projects[0]._id) || '';
    if (pid) {
      await fetchProject(pid);
    }
    setSelectedTask(null);
    setShowModal(true);
  };

  const openEdit = async (task) => {
    if (task?.projectId?._id) {
      await fetchProject(task.projectId._id);
    } else if (task?.projectId) {
      await fetchProject(task.projectId);
    }
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
      // Refresh task list from server
      await fetchTasks();
    } catch (err) {
      toast.error(err || 'Delete failed');
    }
  };

  const markComplete = async (task) => {
    try {
      await updateTask(task._id, { status: 'done' });
      toast.success('Marked complete');
      // Refresh task list from server
      await fetchTasks();
    } catch (err) {
      toast.error(err || 'Update failed');
    }
  };

  // Compute displayed tasks using client-side filter so UI works even when backend ignores status param
  const displayedTasks = useMemo(() => {
    if (!statusFilter || statusFilter === 'all') return tasks;
    return tasks.filter((t) => (t.status || 'todo') === statusFilter);
  }, [tasks, statusFilter]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">All tasks assigned to you and across your projects.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 mr-4">
              <label className="text-sm text-gray-600 dark:text-gray-400">Status:</label>
              <select
                value={statusFilter}
                onChange={async (e) => { setStatusFilter(e.target.value); }}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          {/* Removed default project dropdown per admin request */}
          <Button onClick={openCreate}>+ New Task</Button>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        {loading ? (
          <div className="text-sm text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-sm text-gray-500">No tasks available.</div>
        ) : (
          <div className="space-y-3">
            {displayedTasks.map(task => (
              <div key={task._id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</div>
                      <div className="text-xs text-gray-500">{task.projectId?.title || 'Project'}</div>
                    </div>
                    <div className="text-sm text-gray-500">{task.assignee?.name || 'Unassigned'}</div>
                    <div className="text-sm text-gray-500">{task.priority}</div>
                    <div className="text-sm text-gray-500">{task.dueDate ? dayjs(task.dueDate).format('MMM D') : ''}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.status !== 'done' && (
                    <button onClick={() => markComplete(task)} className="px-3 py-1 rounded-md bg-green-600 text-white text-sm">Complete</button>
                  )}
                  <button onClick={() => openEdit(task)} className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm">View / Edit</button>
                  <button onClick={() => handleDelete(task._id)} className="px-3 py-1 rounded-md bg-red-600 text-white text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          task={selectedTask}
          projectId={selectedTask ? (selectedTask.projectId?._id || selectedTask.projectId) : createProjectId}
          onClose={() => { setShowModal(false); fetchTasks(); }}
        />
      )}
    </div>
  );
}

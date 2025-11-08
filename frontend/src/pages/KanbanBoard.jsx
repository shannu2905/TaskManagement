import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Settings } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import TaskFilter from '../components/TaskFilter';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import getSocket from '../lib/socket';

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

export default function KanbanBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, fetchProject, loading: projectLoading } = useProjectStore();
  const { tasks, fetchTasks, updateTask, createTask, loading: taskLoading } = useTaskStore();
  const { user } = useAuthStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProject(id);
    fetchTasks(id, { ...filters, search: searchQuery });
  }, [id, fetchProject, fetchTasks, filters, searchQuery]);

  useEffect(() => {
    const socket = getSocket();
    
    socket.on('connect', () => {
      socket.emit('join:project', { projectId: id });
      socket.emit('join:user', { userId: user?._id });
    });

    socket.on('task-updated', (task) => {
      fetchTasks(id, { ...filters, search: searchQuery });
    });

    socket.on('task-deleted', () => {
      fetchTasks(id, { ...filters, search: searchQuery });
    });

    socket.on('comment-added', () => {
      fetchTasks(id, { ...filters, search: searchQuery });
    });

    socket.on('task:moved', ({ taskId, newStatus }) => {
      fetchTasks(id, { ...filters, search: searchQuery });
    });

    return () => {
      socket.emit('leave:project', { projectId: id });
    };
  }, [id, fetchTasks, filters, searchQuery, user?._id]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const task = tasks.find(t => t._id === draggableId);
    const oldStatus = task?.status;

    try {
      await updateTask(draggableId, { status: newStatus });
      
      // Emit socket event for real-time updates
      const socket = getSocket();
      socket.emit('task:moved', {
        taskId: draggableId,
        projectId: id,
        newStatus,
        oldStatus
      });
      
      toast.success('Task moved successfully');
    } catch (error) {
      toast.error(error || 'Failed to move task');
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  // Get available assignees for filter
  const availableAssignees = useMemo(() => {
    const assigneesSet = new Set();
    tasks.forEach(task => {
      if (task.assignee) {
        assigneesSet.add(JSON.stringify(task.assignee));
      }
    });
    return Array.from(assigneesSet).map(str => JSON.parse(str));
  }, [tasks]);

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'danger',
      medium: 'warning',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  if (projectLoading || taskLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading board...</p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentProject.title}</h1>
            {currentProject.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{currentProject.description}</p>
            )}
          </div>
          <Button onClick={() => {
            setSelectedTask(null);
            setShowTaskModal(true);
          }}>
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.length} tasks
          </span>
          <div className="flex items-center space-x-2">
            {currentProject.members?.map((member) => (
              <Avatar
                key={member._id}
                name={member.name}
                src={member.avatar}
                size="sm"
                title={member.name}
              />
            ))}
          </div>
          {(user?.role === 'owner' || user?.role === 'admin' || currentProject.owner?._id === user?._id) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${id}/team`)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Team Settings
            </Button>
          )}
        </div>
      </div>

      {/* Task Filter */}
      <TaskFilter
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onSearchChange={(query) => setSearchQuery(query)}
        availableAssignees={availableAssignees}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {column.title}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[400px] rounded-xl p-4 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                    }`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-4 cursor-grab active:cursor-grabbing ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskModal(true);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">
                                {task.title}
                              </h3>
                              <Badge variant={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>

                            {task.desc && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {task.desc}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              {task.assignee ? (
                                <Avatar
                                  name={task.assignee.name}
                                  src={task.assignee.avatar}
                                  size="sm"
                                />
                              ) : (
                                <span className="text-xs text-gray-400">Unassigned</span>
                              )}

                              {task.dueDate && (
                                <span
                                  className={`text-xs ${
                                    dayjs(task.dueDate).isBefore(dayjs(), 'day')
                                      ? 'text-red-600'
                                      : dayjs(task.dueDate).diff(dayjs(), 'day') <= 1
                                      ? 'text-orange-600'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {dayjs(task.dueDate).format('MMM D')}
                                </span>
                              )}
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          projectId={id}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}


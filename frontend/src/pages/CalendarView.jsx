import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import useTaskStore from '../store/taskStore';
import useProjectStore from '../store/projectStore';
import TaskModal from '../components/TaskModal';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function CalendarView() {
  const { tasks, fetchTasks, updateTask, loading } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = startOfMonth.day();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Add previous month's trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(startOfMonth.subtract(i + 1, 'day'));
    }
    
    // Add current month's days
    for (let i = 0; i < daysInMonth; i++) {
      days.push(startOfMonth.add(i, 'day'));
    }
    
    // Add next month's leading days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(endOfMonth.add(i, 'day'));
    }
    
    return days;
  }, [currentDate, firstDayOfMonth, daysInMonth, startOfMonth, endOfMonth]);

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return dayjs(task.dueDate).isSame(date, 'day');
    });
  };

  // Handle drag start
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop
  const handleDrop = async (e, targetDate) => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      await updateTask(draggedTask._id, {
        dueDate: targetDate.format('YYYY-MM-DD')
      });
      toast.success('Task rescheduled successfully');
      setDraggedTask(null);
    } catch (error) {
      toast.error(error || 'Failed to reschedule task');
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const previousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const nextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'danger',
      medium: 'warning',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <CalendarIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Calendar View
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </div>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentDate.format('MMMM YYYY')}
            </h2>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week Day Headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.month() === currentDate.month();
            const isToday = date.isSame(dayjs(), 'day');
            const dayTasks = getTasksForDate(date);

            return (
              <div
                key={index}
                onDrop={(e) => handleDrop(e, date)}
                onDragOver={handleDragOver}
                className={`
                  min-h-[120px] p-2 border rounded-lg
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                  ${isToday ? 'ring-2 ring-primary-500' : ''}
                  ${draggedTask ? 'hover:bg-primary-50 dark:hover:bg-primary-900/20' : ''}
                  transition-colors
                `}
              >
                <div
                  className={`
                    text-sm font-medium mb-2
                    ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}
                    ${isToday ? 'text-primary-600 dark:text-primary-400 font-bold' : ''}
                  `}
                >
                  {date.format('D')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className="cursor-pointer p-1.5 rounded text-xs bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Badge variant={getPriorityColor(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {task.title}
                      </p>
                      {task.assignee && (
                        <div className="mt-1">
                          <Avatar
                            name={task.assignee.name}
                            src={task.assignee.avatar}
                            size="xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          projectId={selectedTask?.projectId?._id || selectedTask?.projectId}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}


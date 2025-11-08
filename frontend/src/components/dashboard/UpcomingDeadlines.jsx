import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../ui/Badge';
import dayjs from 'dayjs';

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export default function UpcomingDeadlines({ tasks }) {
  const [expanded, setExpanded] = useState(false);

  // Filter tasks with due dates and sort by date
  const upcomingTasks = (tasks || [])
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, expanded ? 10 : 5);

  const today = dayjs();
  const todayTasks = upcomingTasks.filter((task) =>
    dayjs(task.dueDate).isSame(today, 'day')
  );
  const upcoming = upcomingTasks.filter(
    (task) => !dayjs(task.dueDate).isSame(today, 'day')
  );

  if (upcomingTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <CardTitle>Upcoming Deadlines</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No upcoming deadlines
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <CardTitle>Upcoming Deadlines</CardTitle>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todayTasks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">
                Today
              </h4>
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {task.project?.title}
                        </p>
                      </div>
                      <Badge className={priorityColors[task.priority] || priorityColors['medium']}>
                        {task.priority || 'medium'}
                      </Badge>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">
                      Due today
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Upcoming
              </h4>
              <div className="space-y-2">
                {upcoming.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {task.project?.title}
                        </p>
                      </div>
                      <Badge className={priorityColors[task.priority] || priorityColors['medium']}>
                        {task.priority || 'medium'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Due {dayjs(task.dueDate).format('MMM D, YYYY')} ({dayjs(task.dueDate).fromNow()})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


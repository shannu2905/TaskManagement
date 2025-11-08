import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { CheckSquare, MessageSquare, UserPlus, Calendar, Bell } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const activityIcons = {
  task_assigned: CheckSquare,
  status_changed: CheckSquare,
  comment_added: MessageSquare,
  due_date_reminder: Calendar,
  member_added: UserPlus,
};

const activityColors = {
  task_assigned: 'text-blue-600 dark:text-blue-400',
  status_changed: 'text-green-600 dark:text-green-400',
  comment_added: 'text-purple-600 dark:text-purple-400',
  due_date_reminder: 'text-orange-600 dark:text-orange-400',
  member_added: 'text-indigo-600 dark:text-indigo-400',
};

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No recent activity
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || Bell;
            const color = activityColors[activity.type] || 'text-gray-600 dark:text-gray-400';

            return (
              <div
                key={activity._id}
                className="flex items-start space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <Avatar
                  name={activity.user?.name || 'User'}
                  src={activity.user?.avatar}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-2">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">{activity.user?.name || 'Someone'}</span>{' '}
                      {activity.message || activity.type}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dayjs(activity.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


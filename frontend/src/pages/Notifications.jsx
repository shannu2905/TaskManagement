import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { CheckCheck, Bell, CheckSquare, MessageSquare, Calendar, UserPlus } from 'lucide-react';
import { io } from 'socket.io-client';

const getNotificationIcon = (type) => {
  const icons = {
    task_assigned: CheckSquare,
    status_changed: CheckSquare,
    comment_added: MessageSquare,
    due_date_reminder: Calendar,
  };
  const Icon = icons[type] || Bell;
  return <Icon className="w-5 h-5" />;
};

const getNotificationMessage = (notification) => {
  const { type, payload } = notification;
  const messages = {
    task_assigned: `Assigned to task "${payload.taskTitle}" in ${payload.projectTitle}`,
    status_changed: `Task "${payload.taskTitle}" status changed from ${payload.oldStatus} to ${payload.newStatus}`,
    comment_added: `New comment on task "${payload.taskTitle}"`,
    due_date_reminder: `Task "${payload.taskTitle}" due soon (${dayjs(payload.dueDate).format('MMM D, YYYY')})`,
  };
  return messages[type] || 'New notification';
};

export default function Notifications() {
  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    addNotification,
  } = useNotificationStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socket.on('connect', () => {
      socket.emit('join-project', `user-${user._id}`);
    });

    socket.on('notification', (notification) => {
      addNotification(notification);
      toast.success('New notification!');
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, addNotification]);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} disabled={loading} variant="outline">
            <CheckCheck className="w-5 h-5 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`p-4 cursor-pointer transition-all ${
                !notification.read ? 'bg-primary-50 border-primary-200' : ''
              }`}
              onClick={() => !notification.read && handleMarkAsRead(notification._id)}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-2 rounded-xl ${
                    !notification.read
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getNotificationMessage(notification)}
                    </p>
                    {!notification.read && (
                      <Badge variant="primary" className="ml-2">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {dayjs(notification.createdAt).format('MMM D, YYYY h:mm A')}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


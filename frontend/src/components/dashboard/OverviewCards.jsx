import { FolderOpen, CheckSquare2, Clock, Users } from 'lucide-react';
import { Card } from '../ui/Card';

export default function OverviewCards({ stats }) {
  const cards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Tasks Completed',
      value: stats?.completedTasks || 0,
      total: stats?.totalTasks || 0,
      icon: CheckSquare2,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      showProgress: true,
    },
    {
      title: 'Upcoming Deadlines',
      value: stats?.upcomingDeadlines || 0,
      icon: Clock,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Active Team Members',
      value: stats?.activeMembers || 0,
      icon: Users,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const progress = card.showProgress && card.total > 0 
          ? Math.round((card.value / card.total) * 100) 
          : 0;

        return (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {card.title}
                </p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </h3>
                  {card.total && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      / {card.total}
                    </span>
                  )}
                </div>
                {card.showProgress && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${card.gradient} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {progress}% completed
                    </p>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}


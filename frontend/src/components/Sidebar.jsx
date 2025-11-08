import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Settings,
  Calendar,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: FolderOpen,
    label: 'My Projects',
    path: '/my-projects',
  },
  {
    icon: CheckSquare,
    label: 'Tasks',
    path: '/tasks', // TODO: add /my-tasks page
  },
  {
    icon: Calendar,
    label: 'Calendar',
    path: '/calendar',
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/settings', // Placeholder
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems
              .filter((item) => {
                // Hide the standalone Tasks page link from Owners if desired
                if (item.path === '/tasks' && user?.role === 'owner') return false;
                return true;
              })
              .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              const linkBase = 'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200';
              const linkClasses = active
                ? `${linkBase} bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm`
                : `${linkBase} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`;

              const iconClass = active
                ? 'w-5 h-5 text-primary-600 dark:text-primary-400'
                : 'w-5 h-5 text-gray-500 dark:text-gray-400';

              const labelClass = active
                ? 'text-sm font-medium text-primary-600 dark:text-primary-400'
                : 'text-sm font-medium text-gray-700 dark:text-gray-300';

              return (
                <Link key={item.path} to={item.path} onClick={onClose} className={linkClasses}>
                  <Icon className={iconClass} />
                  <span className={labelClass}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section - Optional */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">TaskFlow Pro</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Upgrade for advanced features</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


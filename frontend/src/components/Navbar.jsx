import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Menu,
  Search,
  Plus,
  Bell,
  Moon,
  Sun,
  User,
  HelpCircle,
  LogOut,
  CheckSquare,
  FolderPlus,
  UserPlus,
  X,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import useThemeStore from '../store/themeStore';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Navbar({ onSidebarToggle, sidebarOpen }) {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchUnreadCount, notifications, fetchNotifications } = useNotificationStore();
  const [orgName, setOrgName] = useState('TaskFlow');
  const [orgLogo, setOrgLogo] = useState(null);
  const { darkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const addMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    // Load organization name/logo from system settings if available
    try {
      const raw = localStorage.getItem('systemSettings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.organization?.name) setOrgName(s.organization.name);
        if (s.organization?.logo) setOrgLogo(s.organization.logo);
      }
    } catch (e) {}
    if (unreadCount === 0) {
      fetchUnreadCount();
    }
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount, unreadCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setShowNotificationMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showNotificationMenu) {
      fetchNotifications();
    }
  }, [showNotificationMenu, fetchNotifications]);

  // Watch for changes to system settings (other tabs) and update branding/appearance
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'systemSettings') {
        try {
          const s = JSON.parse(e.newValue || '{}');
          if (s.organization?.name) setOrgName(s.organization.name);
          if (s.organization?.logo) setOrgLogo(s.organization.logo);
          // apply accent as a class for quick theming
          if (s.appearance?.accent) {
            document.documentElement.dataset.accent = s.appearance.accent;
          }
          if (s.appearance?.theme) {
            // theme: system | light | dark
            if (s.appearance.theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else if (s.appearance.theme === 'light') {
              document.documentElement.classList.remove('dark');
            }
          }
        } catch (err) {}
      }
    };

    const onCustom = (e) => {
      try {
        const s = e.detail;
        if (!s) return;
        if (s.organization?.name) setOrgName(s.organization.name);
        if (s.organization?.logo) setOrgLogo(s.organization.logo);
        if (s.appearance?.accent) document.documentElement.dataset.accent = s.appearance.accent;
        if (s.appearance?.theme) {
          if (s.appearance.theme === 'dark') document.documentElement.classList.add('dark');
          else if (s.appearance.theme === 'light') document.documentElement.classList.remove('dark');
        }
      } catch (err) {}
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('systemSettings:changed', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('systemSettings:changed', onCustom);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Debounced search: query tasks and projects
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setShowSearchResults(false);
      setSearchResults({ tasks: [], projects: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks', { params: { search: searchQuery, sortBy: 'createdAt', sortOrder: 'desc' } }),
          api.get('/projects')
        ]);

        // Filter projects by title locally (projects endpoint doesn't support search yet)
        const projects = (projectsRes.data || []).filter(p => p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase()));

        setSearchResults({ tasks: tasksRes.data || [], projects });
        setShowSearchResults(true);
      } catch (err) {
        console.error('Search error', err);
        setSearchResults({ tasks: [], projects: [] });
        setShowSearchResults(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] });

  const openTaskProject = (task) => {
    if (task?.projectId && task.projectId._id) {
      navigate(`/projects/${task.projectId._id}`);
    } else if (task?.projectId) {
      navigate(`/projects/${task.projectId}`);
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const openProjectWorkspace = (project) => {
    navigate(`/workspace/${project._id}`);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleAddClick = (type) => {
    setShowAddMenu(false);
    switch (type) {
      case 'task':
        toast.info('Task creation - Navigate to project board');
        break;
      case 'project':
        navigate('/dashboard');
        // Trigger project modal - this will be handled by Dashboard
        break;
      case 'member':
        toast.info('Invite member feature coming soon!');
        break;
      default:
        break;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Branding */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSidebarToggle}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 group"
            >
              <div className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              {orgLogo ? (
                <img src={orgLogo} alt="logo" className="w-24 h-8 object-contain" />
              ) : (
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent">
                  {orgName}
                </span>
              )}
            </Link>
          </div>

          {/* Center Section: Search & Quick Actions */}
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
            <div className="relative" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search tasks, projects, or people..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-200 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Search results for "{searchQuery}"</p>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {/* Projects */}
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-2">Projects</p>
                      {searchResults.projects.length === 0 && <p className="text-xs text-gray-500">No projects found.</p>}
                      {searchResults.projects.slice(0,5).map((p) => (
                        <button key={p._id} onClick={() => openProjectWorkspace(p)} className="w-full text-left px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{p.owner?.name}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Tasks */}
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-2">Tasks</p>
                      {searchResults.tasks.length === 0 && <p className="text-xs text-gray-500">No tasks found.</p>}
                      {searchResults.tasks.slice(0,8).map((t) => (
                        <button key={t._id} onClick={() => openTaskProject(t)} className="w-full text-left px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t.projectId?.title || 'Project'}</p>
                            </div>
                            <div className="text-xs text-gray-400">{t.assignee?.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section: User & System Controls */}
          <div className="flex items-center space-x-2">
            {/* Add button removed from navbar per admin dashboard requirement */}

            {/* Calendar icon removed per admin request */}

            {/* Notification Bell */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotificationMenu(false)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification._id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => {
                            setShowNotificationMenu(false);
                            navigate('/notifications');
                          }}
                        >
                          <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Avatar Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">My Profile</span>
                  </Link>
                  {/* Settings removed from profile dropdown per request */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/help');
                    }}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">Help & Support</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-600 dark:text-red-400">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


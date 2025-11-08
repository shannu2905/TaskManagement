import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FolderOpen, CheckSquare2, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import ProjectComments from '../components/ProjectComments';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, fetchProjects, loading: projectsLoading } = useProjectStore();
  const { tasks, fetchTasks, loading: tasksLoading } = useTaskStore();
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [systemSettings, setSystemSettings] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchAllUsers();
  }, [fetchProjects, fetchTasks]);

  // Load system settings for display rules (dashboard visibility, etc.)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('systemSettings');
      if (raw) setSystemSettings(JSON.parse(raw));
    } catch (e) {}

    const onStorage = (e) => {
      if (e.key === 'systemSettings') {
        try {
          setSystemSettings(JSON.parse(e.newValue || '{}'));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Calculate admin-specific stats
  const stats = useMemo(() => {
    const totalUsers = allUsers.length;
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    
    // Calculate overdue tasks
    const overdueTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return dayjs(task.dueDate).isBefore(dayjs(), 'day');
    }).length;

    // Calculate active projects (with tasks in progress)
    const activeProjects = projects.filter(project => {
      const projectTasks = tasks.filter(t => t.projectId === project._id);
      return projectTasks.some(t => t.status === 'in_progress');
    }).length;

    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    return {
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      activeProjects,
      completionRate
    };
  }, [allUsers, projects, tasks]);

  // Get recent users
  const recentUsers = useMemo(() => {
    // Show only members in Recent Users
    return allUsers
      .filter(u => u.role === 'member')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [allUsers]);

  // Get projects needing attention
  const projectsNeedingAttention = useMemo(() => {
    // Threshold for number of in-progress tasks to consider a project attention-worthy
    const IN_PROGRESS_THRESHOLD = 3;

    return projects
      .map(project => {
        // Normalize projectId comparison (task.projectId might be populated object or an id)
        const projectTasks = tasks.filter((t) => {
          const pid = t.projectId?._id || t.projectId;
          if (!pid || !project._id) return false;
          return pid.toString() === project._id.toString();
        });

        const taskCount = projectTasks.length;
        const doneCount = projectTasks.filter(t => t.status === 'done').length;
        const inProgressCount = projectTasks.filter(t => t.status === 'in_progress').length;

        const overdueCount = projectTasks.filter(t => {
          if (!t.dueDate) return false;
          return dayjs(t.dueDate).isBefore(dayjs(), 'day') && t.status !== 'done';
        }).length;

        const progressPercent = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 100;

        return { ...project, overdueCount, inProgressCount, taskCount, doneCount, progressPercent };
      })
      // Include projects that meet any attention criteria:
      // - has overdue tasks
      // - has low overall progress (below 50%)
      // - has many tasks currently in progress (above threshold)
      .filter(p => p.overdueCount > 0 || p.progressPercent < 50 || p.inProgressCount > IN_PROGRESS_THRESHOLD)
      // Sort by: overdueCount desc, then progressPercent asc (lower = higher priority), then inProgressCount desc
      .sort((a, b) => {
        if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
        if (a.progressPercent !== b.progressPercent) return a.progressPercent - b.progressPercent;
        return b.inProgressCount - a.inProgressCount;
      })
      .slice(0, 5);
  }, [projects, tasks]);

  

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}! Manage and monitor all system activities.
        </p>
      </div>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(!systemSettings || systemSettings.dashboard?.showOverdueCard) && (
          <Card className="p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Users
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalUsers}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          </Card>
        )}

        <Card className="p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Projects
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalProjects}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {stats.activeProjects} active
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <FolderOpen className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Completion Rate
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.completionRate}%
              </h3>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Overdue Tasks
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.overdueTasks}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        {(!systemSettings || systemSettings.dashboard?.showRecentUsers) && (
          <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Recent Users
            </h2>
            <button
              onClick={() => navigate('/users')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              View all →
            </button>
          </div>
          {loadingUsers ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users yet</div>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {user.stats?.totalProjects || 0} projects
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          </Card>
        )}

        {/* Projects Needing Attention */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Projects Needing Attention
            </h2>
          </div>
          {projectsNeedingAttention.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              All projects are on track! 🎉
            </div>
          ) : (
            <div className="space-y-4">
              {projectsNeedingAttention.map((project) => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {project.title}
                    </h3>
                    {project.overdueCount > 0 ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        {project.overdueCount} overdue
                      </span>
                    ) : project.progressPercent < 50 ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                        {project.progressPercent}% complete
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        {project.inProgressCount} in progress
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {project.taskCount} total tasks
                  </p>
                  <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                    {/* Comments component; stop click propagation so comment actions don't trigger card navigation */}
                    <ProjectComments project={project} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      
    </div>
  );
}


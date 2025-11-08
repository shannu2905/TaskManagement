import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, FolderOpen, CheckSquare2, Users, TrendingUp, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import OverviewCards from '../components/dashboard/OverviewCards';
import ProjectsGrid from '../components/dashboard/ProjectsGrid';
import { ProjectModal } from '../components/ProjectModal';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../lib/api';
import OwnerOrgCharts from '../components/OwnerOrgCharts';
import AdminsPanel from '../components/AdminsPanel';
import dayjs from 'dayjs';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, fetchProjects, createProject, loading: projectsLoading } = useProjectStore();
  const { tasks, fetchTasks, loading: tasksLoading, deleteTask } = useTaskStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchNotifications();
    loadOrgStats();
  }, [fetchProjects, fetchTasks, fetchNotifications]);

  const [orgStats, setOrgStats] = useState(null);

  const loadOrgStats = async () => {
    try {
      const res = await api.get('/admins/stats/org');
      setOrgStats(res.data);
    } catch (err) {
      console.error('Failed to load org stats', err);
    }
  };

  // Filter to only show projects owned by the user
  const ownedProjects = useMemo(() => {
    return projects.filter(p => p.owner?._id === user?._id || p.owner === user?._id);
  }, [projects, user]);

  // Calculate owner-specific stats
  const stats = useMemo(() => {
    const totalProjects = ownedProjects.length;
    const ownedProjectIds = ownedProjects.map(p => p._id);
    const ownedTasks = tasks.filter(t => ownedProjectIds.includes(t.projectId));
    const totalTasks = ownedTasks.length;
    const completedTasks = ownedTasks.filter((t) => t.status === 'done').length;
    
    // Calculate upcoming deadlines (tasks due in next 7 days)
    const upcomingDeadlines = ownedTasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = dayjs(task.dueDate);
      const today = dayjs();
      return dueDate.isAfter(today) && dueDate.isBefore(today.add(7, 'days'));
    }).length;

    // Get unique members from owned projects
    const allMembers = new Set();
    ownedProjects.forEach((project) => {
      if (project.members) {
        project.members.forEach((member) => {
          const memberId = typeof member === 'object' ? member._id : member;
          if (memberId !== user?._id) {
            allMembers.add(memberId);
          }
        });
      }
    });
    const activeMembers = allMembers.size;

    // Calculate project progress
    const projectsWithProgress = ownedProjects.map(project => {
      const projectTasks = ownedTasks.filter(t => t.projectId === project._id);
      const doneTasks = projectTasks.filter(t => t.status === 'done').length;
      const progress = projectTasks.length > 0 
        ? Math.round((doneTasks / projectTasks.length) * 100) 
        : 0;
      return { ...project, progress };
    });

    const averageProgress = projectsWithProgress.length > 0
      ? Math.round(projectsWithProgress.reduce((sum, p) => sum + p.progress, 0) / projectsWithProgress.length)
      : 0;

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      upcomingDeadlines,
      activeMembers,
      averageProgress
    };
  }, [ownedProjects, tasks, user]);

  // Get recent tasks from owned projects
  const recentTasks = useMemo(() => {
    const ownedProjectIds = ownedProjects.map(p => p._id);
    return tasks
      .filter(t => ownedProjectIds.includes(t.projectId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [tasks, ownedProjects]);

  const handleDeleteTask = async (task) => {
    if (!task || !task._id) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(task._id);
      toast.success('Task deleted');
      // Refresh lists
      await fetchTasks();
      await fetchProjects();
    } catch (err) {
      toast.error(err || 'Failed to delete task');
    }
  };

  // Get top performing projects
  const topProjects = useMemo(() => {
    return ownedProjects
      .map(project => {
        const projectTasks = tasks.filter(t => t.projectId === project._id);
        const doneTasks = projectTasks.filter(t => t.status === 'done').length;
        const progress = projectTasks.length > 0 
          ? Math.round((doneTasks / projectTasks.length) * 100) 
          : 0;
        return { ...project, progress, taskCount: projectTasks.length };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6);
  }, [ownedProjects, tasks]);

  const handleCreateProject = async (data) => {
    try {
      await createProject(data);
      toast.success('Project created successfully!');
      setShowProjectModal(false);
    } catch (error) {
      toast.error(error || 'Failed to create project');
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Owner Dashboard
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}! Manage your projects and team.
        </p>
      </div>

      {/* Overview Cards */}
      <OverviewCards stats={stats} />

      {/* Additional Owner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Average Project Progress
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.averageProgress}%
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Team Members
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.activeMembers}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Upcoming Deadlines
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.upcomingDeadlines}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Organization Charts & Admins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Organization Overview</h2>
            {orgStats ? <OwnerOrgCharts stats={orgStats} /> : <div className="text-sm text-gray-500">Loading charts...</div>}
          </Card>
        </div>

        <div>
          <AdminsPanel />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Projects & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Projects */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                My Projects
              </h2>
              <button
                onClick={() => setShowProjectModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                + New Project
              </button>
            </div>
            <ProjectsGrid
              projects={topProjects}
              onCreateProject={() => setShowProjectModal(true)}
              loading={projectsLoading}
            />
          </div>

          {/* Tasks section removed from Owner Dashboard as requested */}
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowProjectModal(true)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Create New Project
              </button>
              <button
                onClick={() => navigate('/my-projects')}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Manage Projects
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
}


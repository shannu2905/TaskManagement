import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import OverviewCards from '../components/dashboard/OverviewCards';
import ProjectsGrid from '../components/dashboard/ProjectsGrid';
import TasksTable from '../components/dashboard/TasksTable';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import { ProjectModal } from '../components/ProjectModal';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';
import AdminDashboard from './AdminDashboard';
import OwnerDashboard from './OwnerDashboard';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function Dashboard() {
  const { user } = useAuthStore();

  // Route to appropriate dashboard based on role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'owner') {
    return <OwnerDashboard />;
  }

  // Default member dashboard
  const navigate = useNavigate();
  const { projects, fetchProjects, createProject, loading: projectsLoading } = useProjectStore();
  const { tasks, fetchTasks, loading: tasksLoading } = useTaskStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchNotifications();
  }, [fetchProjects, fetchTasks, fetchNotifications]);

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    
    // Calculate upcoming deadlines (tasks due in next 7 days)
    const upcomingDeadlines = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = dayjs(task.dueDate);
      const today = dayjs();
      return dueDate.isAfter(today) && dueDate.isBefore(today.add(7, 'days'));
    }).length;

    // Get unique members from all projects
    const allMembers = new Set();
    projects.forEach((project) => {
      if (project.members) {
        project.members.forEach((member) => allMembers.add(member._id));
      }
    });
    const activeMembers = allMembers.size;

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      upcomingDeadlines,
      activeMembers,
    };
  }, [projects, tasks]);

  // Get recent tasks (last 10)
  const recentTasks = useMemo(() => {
    return tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [tasks]);

  // Get recent activities from notifications
  const recentActivities = useMemo(() => {
    return notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [notifications]);

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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Overview Cards */}
      <OverviewCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Projects & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                My Projects
              </h2>
              <button
                onClick={() => setShowProjectModal(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                View all →
              </button>
            </div>
            <ProjectsGrid
              projects={projects.slice(0, 6)}
              onCreateProject={() => setShowProjectModal(true)}
              loading={projectsLoading}
            />
          </div>

          {/* Recent Tasks Table */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Recent Tasks
              </h2>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                View all →
              </button>
            </div>
            <TasksTable tasks={recentTasks} />
          </div>
        </div>

        {/* Right Column - Activity Feed & Deadlines */}
        <div className="space-y-8">
          {/* Upcoming Deadlines */}
          <UpcomingDeadlines tasks={tasks} />

          {/* Activity Feed */}
          <ActivityFeed activities={recentActivities} />
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

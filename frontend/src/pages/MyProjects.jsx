import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';
import ProjectsGrid from '../components/dashboard/ProjectsGrid';

export default function MyProjects() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, fetchMemberProjects, loading } = useProjectStore();

  useEffect(() => {
    if (user?._id) {
      fetchMemberProjects(user._id);
    }
  }, [user?._id, fetchMemberProjects]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Projects you're a member of</p>
        </div>
      </div>

      <ProjectsGrid
        projects={projects}
        loading={loading}
        onCreateProject={() => navigate('/dashboard')}
      />
    </div>
  );
}



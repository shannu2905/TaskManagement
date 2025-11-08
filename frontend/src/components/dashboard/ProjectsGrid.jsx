import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import dayjs from 'dayjs';

export default function ProjectsGrid({ projects, onCreateProject, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const progress = project.stats?.progress || 0;
        const members = project.members || [];
        const displayMembers = members.slice(0, 3);
        const remainingMembers = Math.max(0, members.length - 3);

        return (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {project.title}
              </h3>
              {project.owner?._id && (
                <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                  Owner
                </span>
              )}
            </div>

            {project.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            {project.stats && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {project.stats.doneTasks || 0} of {project.stats.totalTasks || 0} tasks completed
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {dayjs(project.createdAt).format('MMM D, YYYY')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {displayMembers.map((member) => (
                  <Avatar
                    key={member._id}
                    name={member.name}
                    src={member.avatar}
                    size="sm"
                  />
                ))}
                {remainingMembers > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    +{remainingMembers} more
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="group-hover:text-primary-600 dark:group-hover:text-primary-400"
              >
                Open Board
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Link>
        );
      })}

      {/* New Project Card */}
      <Card
        className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 cursor-pointer group min-h-[200px] flex items-center justify-center"
        onClick={onCreateProject}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
            <Plus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            New Project
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a new project to get started
          </p>
        </div>
      </Card>
    </div>
  );
}


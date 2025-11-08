import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, UserPlus, X, Mail, Crown, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function TeamSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentProject, fetchProject, updateProject } = useProjectStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);

  const isOwner = currentProject?.owner?._id === user?._id || currentProject?.owner === user?._id;
  const isAdmin = user?.role === 'admin';
  const canManage = isOwner || isAdmin;

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/projects/${id}/invite`, { email: inviteEmail });
      toast.success('Member invited successfully!');
      setInviteEmail('');
      fetchProject(id); // Refresh project data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }

    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      toast.success('Member removed successfully');
      fetchProject(id); // Refresh project data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading project...</p>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You don't have permission to manage team settings</p>
        <Button onClick={() => navigate(`/projects/${id}`)}>Back to Project</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Team Settings
          </h1>
          <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>
            Back to Project
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage team members and permissions for {currentProject.title}
        </p>
      </div>

      {/* Invite Member Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Invite Team Member
          </h2>
        </div>
        <form onSubmit={handleInviteMember} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Inviting...' : 'Invite'}
          </Button>
        </form>
      </Card>

      {/* Team Members List */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Team Members
          </h2>
        </div>

        <div className="space-y-4">
          {/* Project Owner */}
          {currentProject.owner && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar
                  name={currentProject.owner.name}
                  src={currentProject.owner.avatar}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {currentProject.owner.name}
                    </p>
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                      Owner
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentProject.owner.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          {currentProject.members && currentProject.members.length > 0 ? (
            currentProject.members
              .filter(member => {
                const memberId = typeof member === 'object' ? member._id : member;
                const ownerId = typeof currentProject.owner === 'object' 
                  ? currentProject.owner._id 
                  : currentProject.owner;
                return memberId !== ownerId;
              })
              .map((member) => {
                const memberId = typeof member === 'object' ? member._id : member;
                const memberName = typeof member === 'object' ? member.name : 'Unknown';
                const memberEmail = typeof member === 'object' ? member.email : '';
                const memberAvatar = typeof member === 'object' ? member.avatar : '';

                return (
                  <div
                    key={memberId}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        name={memberName}
                        src={memberAvatar}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {memberName}
                          </p>
                          {typeof member === 'object' && member.role === 'admin' && (
                            <>
                              <Shield className="w-4 h-4 text-blue-500" />
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                Admin
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {memberEmail}
                        </p>
                      </div>
                    </div>
                    {
                      (() => {
                        const memberRole = typeof member === 'object' ? member.role : 'member';
                        const canRemoveMember = isOwner || (isAdmin && memberRole === 'member');

                        return (
                          <Button
                            variant="outline"
                            onClick={() => handleRemoveMember(memberId)}
                            disabled={!canRemoveMember}
                            className={cn(
                              'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20',
                              !canRemoveMember && 'opacity-50 cursor-not-allowed'
                            )}
                            title={!canRemoveMember ? 'You do not have permission to remove this member' : 'Remove member'}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        );
                      })()
                    }
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No team members yet. Invite someone to get started!
            </div>
          )}
        </div>
      </Card>

      {/* Permissions Info */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Permissions
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            <strong>Owner:</strong> Full control over the project, can delete project and manage all members
          </li>
          <li>
            <strong>Admin:</strong> Can manage team members and all tasks
          </li>
          <li>
            <strong>Member:</strong> Can view and work on assigned tasks
          </li>
        </ul>
      </Card>
    </div>
  );
}


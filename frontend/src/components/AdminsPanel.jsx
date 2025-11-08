import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Card } from './ui/Card';
import useAuthStore from '../store/authStore';
import useProjectStore from '../store/projectStore';

export default function AdminsPanel() {
  const { user } = useAuthStore();
  const [admins, setAdmins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { projects: allProjects, fetchProjects } = useProjectStore();
  const [inviteProjectId, setInviteProjectId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const loadAdmins = async () => {
    try {
      const res = await api.get('/admins');
      setAdmins(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admins');
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  useEffect(() => {
    // ensure projects are loaded for owner to pick
    fetchProjects().catch(() => {});
  }, [fetchProjects]);

  const openAdmin = async (a) => {
    setSelected(a);
    setProjects([]);
    try {
      setLoading(true);
      const res = await api.get(`/admins/${a._id}/projects-details`);
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin details');
    } finally { setLoading(false); }
  };

  const removeAdmin = async (adminId) => {
    if (!confirm('Remove this admin? This is irreversible.')) return;
    try {
      await api.delete(`/admins/${adminId}`);
      toast.success('Admin removed');
      setAdmins(prev => prev.filter(x => x._id !== adminId));
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admins</h3>
        </div>
        <div className="space-y-2">
          {admins.map(a => (
            <button key={a._id} onClick={() => openAdmin(a)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{a.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{a.email}</div>
              </div>
              <div className="text-sm text-gray-500">View →</div>
            </button>
          ))}
        </div>
      </Card>

      {selected && (
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selected.name}</h4>
              <p className="text-sm text-gray-500">{selected.email}</p>
            </div>
            {user?.role === 'owner' && (
              <button onClick={() => removeAdmin(selected._id)} className="px-3 py-1 bg-red-600 text-white rounded">Remove Admin</button>
            )}
          </div>

          <div className="mt-4">
            {user?.role === 'owner' && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Invite to project</h5>
                <div className="flex gap-2">
                  <select value={inviteProjectId} onChange={(e) => setInviteProjectId(e.target.value)} className="px-3 py-2 rounded border bg-white dark:bg-gray-800">
                    <option value="">Select project</option>
                    {allProjects.filter(p => (p.owner?._id === user?._id || p.owner === user?._id)).map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                  <input value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} placeholder="Message (optional)" className="flex-1 px-3 py-2 rounded border bg-white dark:bg-gray-800" />
                  <button onClick={async () => {
                    if (!inviteProjectId) return toast.error('Select a project');
                    try {
                      await api.post(`/projects/${inviteProjectId}/invite`, { email: selected.email, message: inviteMessage });
                      toast.success('Invitation sent');
                      setInviteMessage('');
                    } catch (err) {
                      console.error(err);
                      toast.error(err?.response?.data?.message || 'Invite failed');
                    }
                  }} className="px-3 py-2 bg-primary-600 text-white rounded">Invite</button>
                </div>
              </div>
            )}
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Projects</h5>
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-sm text-gray-500">No projects</div>
            ) : (
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{p.title}</div>
                        <div className="text-xs text-gray-500">{p.stats.total || 0} tasks • {p.stats.overdue || 0} overdue</div>
                      </div>
                      <div className="text-sm font-medium text-primary-600 dark:text-primary-400">{p.stats.progressPercent}%</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex gap-3">
                      <div>To Do: {p.stats.todo || 0}</div>
                      <div>In Prog: {p.stats.in_progress || 0}</div>
                      <div>Done: {p.stats.done || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

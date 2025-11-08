import { useEffect, useState } from 'react';
import api from '../lib/api';
import getSocket from '../lib/socket';
import useAuthStore from '../store/authStore';
import dayjs from 'dayjs';

export default function ProjectComments({ project }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canComment = (() => {
    if (!user) return false;
    if (user.role === 'admin') return true; // system admin allowed
    if (!project) return false;
    const isOwner = project.owner && project.owner.toString() === user._id.toString();
    const isMember = project.members && project.members.some(m => m.toString() === user._id.toString());
    return isOwner || isMember;
  })();

  useEffect(() => {
    if (!project || !project._id) return;
    let mounted = true;
    setLoading(true);
    api.get(`/projects/${project._id}/comments`)
      .then(res => {
        if (!mounted) return;
        setComments(res.data || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    const socket = getSocket();
    const handler = (payload) => {
      if (!payload) return;
      // payload may or may not include projectId; ensure matching
      if (payload.projectId && payload.projectId.toString() !== project._id.toString()) return;
      setComments(prev => [payload, ...prev]);
    };

    socket.on('project:comment', handler);

    return () => {
      mounted = false;
      try { socket.off('project:comment', handler); } catch (e) {}
    };
  }, [project]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!text || !text.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/projects/${project._id}/comments`, { text: text.trim() });
      setComments(prev => [res.data, ...prev]);
      setText('');
    } catch (err) {
      console.error('Comment failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="text-sm text-gray-500 mb-2">Comments</div>

      {canComment ? (
        <form onSubmit={submit} className="flex gap-2 mb-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-3 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      ) : (
        <div className="text-xs text-gray-400 mb-2">Only project members and admins can comment.</div>
      )}

      <div className="space-y-2 max-h-44 overflow-y-auto">
        {loading ? (
          <div className="text-xs text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-gray-500">No comments yet.</div>
        ) : (
          comments.map(c => (
            <div key={c._id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.author?.name || 'User'}</div>
                <div className="text-xs text-gray-400">{dayjs(c.createdAt).format('MMM D, YYYY HH:mm')}</div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{c.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

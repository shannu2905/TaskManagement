import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    if (!accessToken) {
      toast.error('OAuth failed: missing access token');
      navigate('/login');
      return;
    }

    // Save tokens so api instance will use them
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    // Fetch user info from backend and set auth store
    api.get('/auth/me')
      .then(res => {
        const user = res.data.user;
        setAuth(user, accessToken, refreshToken);
        toast.success(`Welcome, ${user.name}`);
        navigate('/dashboard', { replace: true });
      })
      .catch(err => {
        console.error('Failed to fetch user after OAuth', err);
        toast.error('OAuth login failed');
        navigate('/login');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl">Signing you in…</p>
      </div>
    </div>
  );
}

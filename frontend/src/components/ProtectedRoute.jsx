import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, setAuth } = useAuthStore();

  // Rehydrate auth from localStorage if needed (guards against timing issues)
  useEffect(() => {
    if (!isAuthenticated) {
      const accessToken = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      const refreshToken = localStorage.getItem('refreshToken');
      if (accessToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          setAuth(user, accessToken, refreshToken);
        } catch {}
      }
    }
  }, [isAuthenticated, setAuth]);

  // Show loading state while checking authentication
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !localStorage.getItem('accessToken')) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


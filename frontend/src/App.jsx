import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import MyProjects from './pages/MyProjects';
import ProjectWorkspace from './pages/ProjectWorkspace';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import TeamSettings from './pages/TeamSettings';
import CalendarView from './pages/CalendarView';
import Tasks from './pages/Tasks';
import TeamMembers from './pages/TeamMembers';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';
import useAuthStore from './store/authStore';
import getSocket from './lib/socket';

function App() {
  const { isAuthenticated } = useAuthStore();
  const isAuthed = isAuthenticated || !!localStorage.getItem('accessToken');

  // Initialize global socket when app mounts and user is authenticated so
  // the client joins the user room and receives notifications app-wide.
  useEffect(() => {
    if (isAuthed) {
      try {
        getSocket();
      } catch (e) {
        // ignore socket init errors here
      }
    }
  }, [isAuthed]);

  // Redirect to login if not authenticated and on protected route
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthed ? <Navigate to="/dashboard" replace /> : <Signup />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-projects" element={<MyProjects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team-members" element={<TeamMembers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="workspace/:id" element={<ProjectWorkspace />} />
          <Route path="projects/:id" element={<KanbanBoard />} />
          <Route path="projects/:id/team" element={<TeamSettings />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="help" element={<HelpSupport />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


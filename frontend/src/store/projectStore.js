import { create } from 'zustand';
import api from '../lib/api';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/projects');
      set({ projects: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch projects',
        loading: false,
      });
    }
  },

  fetchMemberProjects: async (memberId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/projects/member/${memberId}`);
      set({ projects: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch member projects',
        loading: false,
      });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/projects/${id}/details`);
      set({ currentProject: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch project',
        loading: false,
      });
    }
  },

  createProject: async (data) => {
    try {
      const response = await api.post('/projects', data);
      set((state) => ({
        projects: [response.data, ...state.projects],
      }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create project';
    }
  },

  updateProject: async (id, data) => {
    try {
      const response = await api.patch(`/projects/${id}`, data);
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === id ? response.data : p
        ),
        currentProject:
          state.currentProject?._id === id
            ? response.data
            : state.currentProject,
      }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update project';
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
        currentProject:
          state.currentProject?._id === id ? null : state.currentProject,
      }));
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete project';
    }
  },
}));

export default useProjectStore;


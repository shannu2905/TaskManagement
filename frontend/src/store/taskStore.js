import { create } from 'zustand';
import api from '../lib/api';

const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,

  fetchTasks: async (projectId, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = projectId ? { projectId } : {};
      
      // Add filter parameters
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignee) params.assignee = filters.assignee;
      if (filters.dueDateFrom) params.dueDateFrom = filters.dueDateFrom;
      if (filters.dueDateTo) params.dueDateTo = filters.dueDateTo;
      if (filters.search) params.search = filters.search;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await api.get('/tasks', { params });
      set({ tasks: response.data, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch tasks',
        loading: false,
      });
    }
  },

  fetchTask: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/tasks/${id}`);
      set({ currentTask: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch task',
        loading: false,
      });
      throw error;
    }
  },

  createTask: async (data) => {
    try {
      const response = await api.post('/tasks', data);
      set((state) => ({
        tasks: [response.data, ...state.tasks],
      }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create task';
    }
  },

  updateTask: async (id, data) => {
    try {
      const response = await api.patch(`/tasks/${id}`, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? response.data : t)),
        currentTask:
          state.currentTask?._id === id ? response.data : state.currentTask,
      }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update task';
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
        currentTask:
          state.currentTask?._id === id ? null : state.currentTask,
      }));
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete task';
    }
  },

  addComment: async (taskId, text) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { text });
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t._id === taskId
            ? { ...t, comments: [...(t.comments || []), response.data] }
            : t
        ),
        currentTask:
          state.currentTask?._id === taskId
            ? {
                ...state.currentTask,
                comments: [...(state.currentTask.comments || []), response.data],
              }
            : state.currentTask,
      }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to add comment';
    }
  },
}));

export default useTaskStore;


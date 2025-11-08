import { create } from 'zustand';

const useThemeStore = create((set) => {
  // Load from localStorage on initialization
  const stored = localStorage.getItem('theme-storage');
  const initialDarkMode = stored ? JSON.parse(stored).darkMode : false;

  // Apply dark mode class to document
  if (initialDarkMode) {
    document.documentElement.classList.add('dark');
  }

  return {
    darkMode: initialDarkMode,
    toggleDarkMode: () => {
      set((state) => {
        const newDarkMode = !state.darkMode;
        // Toggle dark class on document
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        // Save to localStorage
        localStorage.setItem('theme-storage', JSON.stringify({ darkMode: newDarkMode }));
        return { darkMode: newDarkMode };
      });
    },
    setDarkMode: (darkMode) => {
      set({ darkMode });
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme-storage', JSON.stringify({ darkMode }));
    },
  };
});

export default useThemeStore;


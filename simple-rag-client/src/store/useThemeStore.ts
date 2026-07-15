import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Check initial system preference or localStorage if we had it
  const initialTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (initialTheme) {
    document.documentElement.classList.add('dark');
  }

  return {
    isDarkMode: initialTheme,
    toggleTheme: () => set((state) => {
      const newIsDark = !state.isDarkMode;
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDarkMode: newIsDark };
    }),
  };
});

import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

// Check if we're in browser and get initial theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('vocabquest-theme') as Theme;
  if (stored) return stored;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  return {
    subscribe,
    toggle: () => {
      update((current) => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
          localStorage.setItem('vocabquest-theme', newTheme);
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
        return newTheme;
      });
    },
    set: (theme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vocabquest-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
      set(theme);
    },
    init: () => {
      if (typeof window !== 'undefined') {
        const theme = getInitialTheme();
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set(theme);
      }
    },
  };
}

export const theme = createThemeStore();

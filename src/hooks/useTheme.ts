import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'resqlink_theme';

/** Applies/removes the `dark` class on <html> and updates the theme-color meta.
 *  Light (white + Rwanda flag colours) is the default brand experience. */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme !== 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#060d19' : '#ffffff');
  const schemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (schemeMeta) schemeMeta.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
}

/** Precedence: `?theme=light|dark` URL param → saved preference → light. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('theme');
      if (param === 'light' || param === 'dark') return param;
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
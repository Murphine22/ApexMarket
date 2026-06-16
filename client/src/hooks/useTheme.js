import { useEffect } from 'react';
import { useUiStore } from '../store/useUiStore';

// Applies the selected theme to <html> by toggling the `dark`/`light` classes.
export default function useTheme() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B1220' : '#f1f5f9');
  }, [theme]);
  return theme;
}

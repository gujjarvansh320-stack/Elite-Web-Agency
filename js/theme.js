/* ==========================================================
   Theme toggle — dark/light mode with localStorage persistence
   Takes an `onThemeChange(theme)` callback so other modules
   (like the 3D scene) can react when the theme flips.
========================================================== */

const STORAGE_KEY = 'ewa-theme';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {
    /* storage unavailable — fall through to system preference */
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function initTheme(onThemeChange) {
  const root = document.documentElement;
  const toggleButton = document.getElementById('themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* storage unavailable */ }
    if (typeof onThemeChange === 'function') onThemeChange(theme);
  }

  applyTheme(getInitialTheme());

  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  return { applyTheme };
}

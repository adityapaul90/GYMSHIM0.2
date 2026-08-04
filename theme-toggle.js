/* ==============================================================
   GYMSHIM — THEME TOGGLE (light / dark)
   Standalone file, no dependency on digital-marketing.js.

   Load this with a plain <script src="theme-toggle.js"></script>
   (no defer/async) placed in <head>, BEFORE </head> closes, so the
   saved theme is applied before the page paints — otherwise you'll
   see a flash of the wrong theme on load.
   ============================================================== */
(() => {
  const STORAGE_KEY = 'gymshim-theme';
  const root = document.documentElement;

  // Apply saved preference immediately (this runs synchronously in
  // <head>, before body content paints).
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  }

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', String(theme === 'light'));
  }

  // Wire the button once the DOM exists.
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(currentTheme() === 'light'));
    btn.addEventListener('click', () => {
      setTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
  });
})();
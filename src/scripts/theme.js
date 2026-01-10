export function handleThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Check for saved theme preference or default to 'dark'
  const savedTheme = localStorage.getItem('theme') || 'dark';

  // Set initial theme
  if (savedTheme === 'light') {
    html.setAttribute('data-theme', 'light');
  }

  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      // Update theme
      if (newTheme === 'light') {
        html.setAttribute('data-theme', 'light');
      } else {
        html.removeAttribute('data-theme');
      }

      // Save preference
      localStorage.setItem('theme', newTheme);
    });
  }
}

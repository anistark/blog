const THEMES = {
  night:   { icon: '🌙' },
  reading: { icon: '📖' },
  forest:  { icon: '🌲' },
  beach:   { icon: '🏖️' },
};

function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'night') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', theme);
  }
}

function updateActiveIcon(theme) {
  const iconEl = document.getElementById('theme-active-icon');
  if (iconEl && THEMES[theme]) {
    iconEl.textContent = THEMES[theme].icon;
  }
}

function updateActiveOption(theme) {
  const options = document.querySelectorAll('.theme-option');
  options.forEach(opt => {
    opt.classList.toggle('active', opt.getAttribute('data-theme-value') === theme);
  });
}

export function handleThemeToggle() {
  const btn = document.getElementById('theme-switcher-btn');
  const dropdown = document.getElementById('theme-dropdown');
  if (!btn || !dropdown) return;

  const savedTheme = localStorage.getItem('theme') || 'night';

  // Apply saved theme
  applyTheme(savedTheme);
  updateActiveIcon(savedTheme);
  updateActiveOption(savedTheme);

  // Toggle dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Theme option click
  dropdown.addEventListener('click', (e) => {
    const option = e.target.closest('.theme-option');
    if (!option) return;

    const theme = option.getAttribute('data-theme-value');
    applyTheme(theme);
    updateActiveIcon(theme);
    updateActiveOption(theme);
    localStorage.setItem('theme', theme);

    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  // Close on outside click
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

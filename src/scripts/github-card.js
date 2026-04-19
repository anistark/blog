const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

class GitHubCard extends HTMLElement {
  connectedCallback() {
    const repo = this.getAttribute('repo');
    if (!repo) {
      this.innerHTML = '<p>Missing repo attribute</p>';
      return;
    }

    const cached = this.getCache(repo);
    if (cached) {
      this.render(cached);
      return;
    }

    this.innerHTML = '<div class="github-card loading">Loading...</div>';
    this.fetchRepo(repo);
  }

  getCache(repo) {
    try {
      const raw = localStorage.getItem(`github-card:${repo}`);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) {
        localStorage.removeItem(`github-card:${repo}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  setCache(repo, data) {
    try {
      localStorage.setItem(`github-card:${repo}`, JSON.stringify({ data, ts: Date.now() }));
    } catch {
      // localStorage full or unavailable, ignore
    }
  }

  async fetchRepo(repo) {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`);
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = await res.json();
      this.setCache(repo, data);
      this.render(data);
    } catch (err) {
      this.innerHTML = `<div class="github-card error">Failed to load repo: ${repo}</div>`;
    }
  }

  render(data) {
    const lang = data.language
      ? `<span class="github-card-lang">
           <span class="github-card-lang-dot" style="background:${this.langColor(data.language)}"></span>
           ${data.language}
         </span>`
      : '';

    this.innerHTML = `
      <a href="${data.html_url}" target="_blank" rel="noopener noreferrer" class="github-card">
        <div class="github-card-header">
          <img src="${data.owner.avatar_url}&s=80" alt="${data.owner.login}" class="github-card-avatar" loading="lazy" width="40" height="40">
          <span class="github-card-name">${data.full_name}</span>
        </div>
        <p class="github-card-desc">${data.description || ''}</p>
        <div class="github-card-meta">
          ${lang}
          <span class="github-card-stat">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
            </svg>
            ${this.formatCount(data.stargazers_count)}
          </span>
          <span class="github-card-stat">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
            </svg>
            ${this.formatCount(data.forks_count)}
          </span>
        </div>
      </a>
    `;
  }

  formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toString();
  }

  langColor(lang) {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Go: '#00ADD8',
      Rust: '#dea584',
      Java: '#b07219',
      Ruby: '#701516',
      'C++': '#f34b7d',
      C: '#555555',
      Shell: '#89e051',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Swift: '#F05138',
      Kotlin: '#A97BFF',
      Dart: '#00B4AB',
      PHP: '#4F5D95',
    };
    return colors[lang] || '#8b949e';
  }
}

customElements.define('github-card', GitHubCard);

export { GitHubCard };

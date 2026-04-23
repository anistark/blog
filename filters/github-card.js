const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', '.cache', 'github');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Curated from github-linguist/linguist languages.yml.
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399',
  SCSS: '#c6538c', Less: '#1d365d', Vue: '#41b883', Svelte: '#ff3e00',
  Python: '#3572A5', Go: '#00ADD8', Rust: '#dea584', Java: '#b07219',
  Kotlin: '#A97BFF', Ruby: '#701516', PHP: '#4F5D95', 'C#': '#178600',
  Scala: '#c22d40', Groovy: '#4298b8',
  C: '#555555', 'C++': '#f34b7d', Zig: '#ec915c', Nim: '#ffc200', D: '#ba595e',
  Swift: '#F05138', 'Objective-C': '#438eff', Dart: '#00B4AB',
  Haskell: '#5e5086', OCaml: '#3be133', Elixir: '#6e4a7e', Erlang: '#B83998',
  Clojure: '#db5855', 'F#': '#b845fc', Elm: '#60B5CC',
  Shell: '#89e051', Bash: '#89e051', PowerShell: '#012456', Dockerfile: '#384d54',
  Makefile: '#427819', CMake: '#DA3434', Just: '#384d54', Nix: '#7e7eff',
  SQL: '#e38c00', R: '#198CE7', Julia: '#a270ba', MATLAB: '#e16737',
  TeX: '#3D6117', 'Jupyter Notebook': '#DA5B0B',
  Lua: '#000080', Perl: '#0298c3', Crystal: '#000100', V: '#4f87c4',
  Assembly: '#6E4C13', WebAssembly: '#04133b', GraphQL: '#e10098', Solidity: '#AA6746',
  Astro: '#ff5d01', MDX: '#fcb32c',
};

const STAR_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>';
const FORK_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>';
const ISSUE_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path></svg>';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function relativeTime(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days < 1) return 'today';
  if (days < 2) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function cachePath(repo) {
  return path.join(CACHE_DIR, repo.replace(/\//g, '__') + '.json');
}

function readCache(repo) {
  try {
    const file = cachePath(repo);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeCache(repo, data) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cachePath(repo), JSON.stringify({ ts: Date.now(), data }, null, 2));
  } catch (err) {
    console.warn(`[githubCard] cache write failed for ${repo}: ${err.message}`);
  }
}

function ghHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'anistark-blog-build',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: ghHeaders() });
  if (res.status === 202) return null;
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Bucket raw commits into 52 week slots ending at the current week.
// For high-traffic repos this may undercount older weeks since we fetch at most
// 100 commits without paginating.
function bucketCommitsByWeek(commits) {
  if (!Array.isArray(commits) || commits.length === 0) return null;
  const weeks = new Array(52).fill(0);
  const endOfWeek = new Date();
  endOfWeek.setUTCHours(23, 59, 59, 999);
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + (6 - endOfWeek.getUTCDay()));
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const oldestMs = endOfWeek.getTime() - 52 * msPerWeek;

  let counted = 0;
  for (const c of commits) {
    const dateIso = c && c.commit && c.commit.author && c.commit.author.date;
    if (!dateIso) continue;
    const t = new Date(dateIso).getTime();
    if (Number.isNaN(t) || t <= oldestMs || t > endOfWeek.getTime()) continue;
    const weekIndex = Math.floor((t - oldestMs) / msPerWeek);
    if (weekIndex >= 0 && weekIndex < 52) {
      weeks[weekIndex]++;
      counted++;
    }
  }
  if (counted === 0) return null;
  return weeks.map((total) => ({ total }));
}

async function fetchAll(repo) {
  const headers = ghHeaders();
  const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!repoRes.ok) throw new Error(`GitHub API ${repoRes.status}`);
  const repoData = await repoRes.json();

  const [release, commits] = await Promise.all([
    fetchJson(`https://api.github.com/repos/${repo}/releases/latest`).catch(() => null),
    fetchJson(`https://api.github.com/repos/${repo}/commits?per_page=100`).catch(() => null),
  ]);

  return { repo: repoData, release, commitActivity: bucketCommitsByWeek(commits) };
}

function splitRepoName(fullName, fallback) {
  const src = fullName || fallback || '';
  const slashIdx = src.indexOf('/');
  if (slashIdx === -1) return { owner: '', name: src };
  return { owner: src.slice(0, slashIdx), name: src.slice(slashIdx + 1) };
}

function renderSparkline(commitActivity) {
  if (!Array.isArray(commitActivity) || commitActivity.length === 0) return '';
  const weeks = commitActivity.slice(-52);
  const totals = weeks.map((w) => (w && typeof w.total === 'number' ? w.total : 0));
  const max = Math.max(...totals, 1);
  const sum = totals.reduce((a, b) => a + b, 0);
  if (sum === 0) return '';

  const width = 520;
  const height = 36;
  const gap = 2;
  const barW = (width - gap * (weeks.length - 1)) / weeks.length;

  const bars = totals
    .map((t, i) => {
      const h = Math.max((t / max) * height, t > 0 ? 2 : 0);
      const x = i * (barW + gap);
      const y = height - h;
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${h.toFixed(2)}" rx="0.5"></rect>`;
    })
    .join('');

  return (
    `<div class="github-card-activity">` +
    `<svg class="github-card-spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>` +
    `<span class="github-card-spark-label">${sum} commit${sum === 1 ? '' : 's'} in the last year</span>` +
    `</div>`
  );
}

function renderPills(data, release) {
  const pills = [];
  const version = release && release.tag_name ? String(release.tag_name) : '';
  if (version) {
    pills.push(`<span class="github-card-pill github-card-pill-version">${escapeHtml(version)}</span>`);
  }
  const license = data.license && data.license.spdx_id && data.license.spdx_id !== 'NOASSERTION'
    ? data.license.spdx_id
    : '';
  if (license) {
    pills.push(`<span class="github-card-pill">${escapeHtml(license)}</span>`);
  }
  if (data.archived) {
    pills.push('<span class="github-card-pill github-card-pill-archived">Archived</span>');
  }
  if (data.is_template) {
    pills.push('<span class="github-card-pill github-card-pill-template">Template</span>');
  }
  if (data.fork) {
    pills.push('<span class="github-card-pill github-card-pill-fork">Fork</span>');
  }
  if (!pills.length) return '';
  return `<div class="github-card-pills">${pills.join('')}</div>`;
}

function renderTopics(data) {
  const topics = Array.isArray(data.topics) ? data.topics.slice(0, 5) : [];
  if (!topics.length) return '';
  return `<div class="github-card-topics">${topics
    .map((t) => `<span class="github-card-topic">${escapeHtml(t)}</span>`)
    .join('')}</div>`;
}

function appendAvatarSize(url, size) {
  if (!url) return '';
  return url + (url.includes('?') ? '&' : '?') + `s=${size}`;
}

function renderCard(repo, combined) {
  const data = combined.repo || combined; // backward compat with older cache shape
  const release = combined.release || null;
  const commitActivity = combined.commitActivity || null;

  const { owner, name } = splitRepoName(data.full_name, repo);
  const ownerHtml = escapeHtml(owner);
  const nameHtml = escapeHtml(name);
  const description = escapeHtml(data.description || '');
  const htmlUrl = escapeHtml(data.html_url || `https://github.com/${repo}`);
  const stars = formatCount(data.stargazers_count || 0);
  const forks = formatCount(data.forks_count || 0);
  const openIssues = formatCount(data.open_issues_count || 0);
  const language = data.language ? escapeHtml(data.language) : '';
  const langColor = data.language ? LANG_COLORS[data.language] || '#8b949e' : '';
  const updatedRel = data.pushed_at ? relativeTime(data.pushed_at) : '';
  const updatedIso = data.pushed_at ? escapeHtml(data.pushed_at) : '';

  const avatarUrlRaw = data.owner && data.owner.avatar_url;
  const avatarUrl = avatarUrlRaw ? escapeHtml(appendAvatarSize(avatarUrlRaw, 120)) : '';
  const ownerLogin = escapeHtml((data.owner && data.owner.login) || '');

  const titleHtml = ownerHtml
    ? `<h3 class="github-card-heading"><span class="github-card-owner">${ownerHtml}</span><span class="github-card-slash">/</span><span class="github-card-name">${nameHtml}</span></h3>`
    : `<h3 class="github-card-heading"><span class="github-card-name">${nameHtml}</span></h3>`;

  const avatarHtml = avatarUrl
    ? `<div class="github-card-avatar-wrap"><img src="${avatarUrl}" alt="${ownerLogin}" class="github-card-avatar" loading="lazy" width="56" height="56"></div>`
    : '';

  const descHtml = description ? `<p class="github-card-desc">${description}</p>` : '';

  const langHtml = language
    ? `<span class="github-card-stat github-card-lang"><span class="github-card-lang-dot" style="background:${langColor}"></span>${language}</span>`
    : '';

  const updatedHtml = updatedRel
    ? `<span class="github-card-updated" title="Last push: ${updatedIso}">Updated ${escapeHtml(updatedRel)}</span>`
    : '';

  return (
    `<div class="github-card-wrapper">` +
    `<a href="${htmlUrl}" target="_blank" rel="noopener noreferrer" class="github-card">` +
    `<div class="github-card-top">` +
      `<div class="github-card-primary">` +
        titleHtml +
        renderPills(data, release) +
        descHtml +
        renderTopics(data) +
      `</div>` +
      avatarHtml +
    `</div>` +
    renderSparkline(commitActivity) +
    `<div class="github-card-stats">` +
      langHtml +
      `<span class="github-card-stat" aria-label="${stars} stars">${STAR_ICON}${stars}</span>` +
      `<span class="github-card-stat" aria-label="${forks} forks">${FORK_ICON}${forks}</span>` +
      `<span class="github-card-stat" aria-label="${openIssues} open issues">${ISSUE_ICON}${openIssues}</span>` +
      updatedHtml +
    `</div>` +
    `</a>` +
    `</div>`
  );
}

function renderFallback(repo) {
  const { owner, name } = splitRepoName(repo, repo);
  const ownerHtml = escapeHtml(owner);
  const nameHtml = escapeHtml(name);
  const titleHtml = ownerHtml
    ? `<h3 class="github-card-heading"><span class="github-card-owner">${ownerHtml}</span><span class="github-card-slash">/</span><span class="github-card-name">${nameHtml}</span></h3>`
    : `<h3 class="github-card-heading"><span class="github-card-name">${nameHtml}</span></h3>`;
  return (
    `<div class="github-card-wrapper">` +
    `<a href="https://github.com/${escapeHtml(repo)}" target="_blank" rel="noopener noreferrer" class="github-card github-card-fallback">` +
    `<div class="github-card-top"><div class="github-card-primary">${titleHtml}<p class="github-card-desc">View on GitHub &rarr;</p></div></div>` +
    `</a>` +
    `</div>`
  );
}

module.exports = async function githubCard(repo) {
  if (!repo || typeof repo !== 'string' || !repo.includes('/')) {
    return renderFallback(String(repo || ''));
  }

  const cached = readCache(repo);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS && cached.data && cached.data.repo) {
    return renderCard(repo, cached.data);
  }

  try {
    const combined = await fetchAll(repo);
    writeCache(repo, combined);
    return renderCard(repo, combined);
  } catch (err) {
    console.warn(`[githubCard] fetch failed for ${repo}: ${err.message}`);
    if (cached && cached.data) return renderCard(repo, cached.data);
    return renderFallback(repo);
  }
};

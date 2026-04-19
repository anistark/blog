const LANG_LABELS = {
  js: 'JavaScript', javascript: 'JavaScript',
  ts: 'TypeScript', typescript: 'TypeScript',
  jsx: 'JSX', tsx: 'TSX',
  py: 'Python', python: 'Python',
  rb: 'Ruby', ruby: 'Ruby',
  go: 'Go', rs: 'Rust', rust: 'Rust',
  java: 'Java', kotlin: 'Kotlin', swift: 'Swift',
  c: 'C', cpp: 'C++', 'c++': 'C++',
  cs: 'C#', 'csharp': 'C#',
  php: 'PHP',
  html: 'HTML', css: 'CSS', scss: 'SCSS',
  json: 'JSON', yaml: 'YAML', yml: 'YAML', toml: 'TOML', xml: 'XML',
  md: 'Markdown', markdown: 'Markdown',
  sql: 'SQL',
  dockerfile: 'Dockerfile', docker: 'Dockerfile',
  text: 'Text', txt: 'Text', '': 'Text',
};

class CodeBlock extends HTMLElement {
  connectedCallback() {
    const rawLang = (this.getAttribute('lang') || '').toLowerCase();
    const label = LANG_LABELS[rawLang] || (rawLang ? rawLang.toUpperCase() : 'Text');

    const preEl = this.querySelector('pre');
    if (!preEl) return;

    const codeText = (preEl.querySelector('code') || preEl).textContent || '';

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    wrapper.innerHTML = `
      <div class="code-block-header">
        <span class="code-block-lang">${label}</span>
        <button class="code-block-copy" type="button" aria-label="Copy code">
          <svg class="code-block-copy-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
          </svg>
          <svg class="code-block-check-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
          </svg>
        </button>
      </div>
      <div class="code-block-body"></div>
    `;
    wrapper.querySelector('.code-block-body').appendChild(preEl);
    this.innerHTML = '';
    this.appendChild(wrapper);

    const btn = wrapper.querySelector('.code-block-copy');
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeText);
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
      } catch {
        // clipboard unavailable, ignore
      }
    });
  }
}

customElements.define('code-block', CodeBlock);

export { CodeBlock };

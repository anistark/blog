class TerminalBlock extends HTMLElement {
  connectedCallback() {
    const cmdAttr = this.getAttribute('cmd');
    const raw = (cmdAttr !== null ? cmdAttr : this.textContent).replace(/^\n+|\n+$/g, '');
    const output = this.getAttribute('output');
    const mode = this.getAttribute('mode');
    const lines = raw.split('\n');

    this.innerHTML = `
      <div class="terminal-block">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="terminal-dot terminal-dot-red"></span>
            <span class="terminal-dot terminal-dot-yellow"></span>
            <span class="terminal-dot terminal-dot-green"></span>
          </div>
          <button class="terminal-copy" type="button" aria-label="Copy command">
            <svg class="terminal-copy-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
            </svg>
            <svg class="terminal-check-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
            </svg>
          </button>
        </div>
        <div class="terminal-body">
          <div class="terminal-cmd"></div>
          ${output !== null ? '<pre class="terminal-output"></pre>' : ''}
        </div>
      </div>
    `;

    const cmdEl = this.querySelector('.terminal-cmd');
    if (mode === 'tree') {
      cmdEl.classList.add('terminal-cmd-tree');
      const pre = document.createElement('pre');
      pre.className = 'terminal-tree';
      pre.textContent = raw;
      cmdEl.appendChild(pre);
    } else {
      lines.forEach((line) => {
        const row = document.createElement('div');
        row.className = 'terminal-line';
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = '>';
        const code = document.createElement('code');
        code.textContent = line;
        row.append(prompt, document.createTextNode(' '), code);
        cmdEl.appendChild(row);
      });
    }

    if (output !== null) {
      this.querySelector('.terminal-output').textContent = output;
    }

    const btn = this.querySelector('.terminal-copy');
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(raw);
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
      } catch {
        // clipboard unavailable, ignore
      }
    });
  }
}

customElements.define('terminal-block', TerminalBlock);

export { TerminalBlock };

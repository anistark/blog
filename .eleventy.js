module.exports = (config) => {
  const markdownIt = new require('markdown-it')({
    typographer: true,
    linkify: true,
    html: true,
  });

  const markdownItAnchor = require('markdown-it-anchor');
  markdownIt.use(markdownItAnchor);

  // Render mermaid code blocks as <pre class="mermaid"> for client-side rendering.
  // Render shell-like code blocks (sh, bash, zsh, shell, console) as <terminal-block>.
  const shellLangs = new Set(['sh', 'bash', 'zsh', 'shell', 'console']);
  const shellVariants = new Set(['tree']);
  const defaultFence = markdownIt.renderer.rules.fence;
  markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const info = token.info.trim();
    if (info === 'mermaid') {
      return `<pre class="mermaid">${token.content}</pre>`;
    }
    const [baseLang, variant] = info.split('=');
    if (shellLangs.has(baseLang)) {
      const escaped = markdownIt.utils.escapeHtml(token.content.replace(/\n+$/, ''));
      const modeAttr = variant && shellVariants.has(variant) ? ` mode="${variant}"` : '';
      return `<terminal-block${modeAttr}>${escaped}</terminal-block>`;
    }
    const rendered = defaultFence(tokens, idx, options, env, self);
    const lang = markdownIt.utils.escapeHtml(info.split(/\s+/)[0] || 'text');
    return `<code-block lang="${lang}">${rendered}</code-block>`;
  };

  config.setLibrary('md', markdownIt);

  config.addPlugin(require('eleventy-plugin-nesting-toc'), {
    tags: ['h2', 'h3'],
    ul: false,
  });

  config.addPlugin(require('@11ty/eleventy-plugin-syntaxhighlight'));
  config.addPlugin(require('@11ty/eleventy-plugin-rss'));

  config.addFilter('dateDisplay', require('./filters/date-display.js'));
  config.addFilter('readingTime', require('./filters/reading-time.js'));

  config.addPassthroughCopy({ public: './' });

  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: true,
    callbacks: {
      ready: function(err, bs) {
        bs.addMiddleware("*", (req, res) => {
          const content_404 = require('fs').readFileSync('dist/404.html');
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content_404);
          res.end();
        });
      }
    }
  });

  config.setDataDeepMerge(true);

  config.addCollection('postsWithoutDrafts', (collection) =>
    [...collection.getFilteredByGlob('src/posts/*.md')].filter(
      (post) => !post.data.draft
    )
  );

  return {
    pathPrefix: require('./src/globals/site.json').baseUrl,
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'includes',
      layouts: 'includes/layouts',
      data: 'globals',
    },
  };
};

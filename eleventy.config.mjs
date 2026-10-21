import markdownItFactory from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import pluginRss from '@11ty/eleventy-plugin-rss';
import pluginSyntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

import dateDisplay from './filters/date-display.js';
import readingTime from './filters/reading-time.js';
import titleCase from './filters/title-case.js';
import socialCard from './filters/social-image.js';
import githubCard from './filters/github-card.js';
import site from './src/globals/site.json' with { type: 'json' };

export default function (config) {
  const markdownIt = markdownItFactory({
    typographer: true,
    linkify: true,
    html: true,
  });
  // markdown-it 15 stopped linking bare domains like example.com, keep them linked.
  markdownIt.linkify.set({ fuzzyLink: true });

  markdownIt.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      symbol: '#',
      class: 'header-anchor',
    }),
  });

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

  config.addPlugin(pluginSyntaxHighlight);
  config.addPlugin(pluginRss);

  config.addFilter('dateDisplay', dateDisplay);
  config.addFilter('readingTime', readingTime);
  config.addFilter('titleCase', titleCase);
  config.addFilter('socialCard', socialCard);

  config.addNunjucksAsyncShortcode('githubCard', githubCard);
  config.addLiquidShortcode('githubCard', githubCard);

  config.addPassthroughCopy({ public: './' });

  // Rollup writes the bundle into dist/assets on its own, so reload on that too.
  // The dev server already serves dist/404.html for missing pages.
  config.setServerOptions({ watch: ['dist/assets/**'] });

  config.addCollection('postsWithoutDrafts', (collection) =>
    [...collection.getFilteredByGlob('src/posts/*.md')].filter(
      (post) => !post.data.draft
    )
  );

  return {
    pathPrefix: site.baseUrl,
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'includes',
      layouts: 'includes/layouts',
      data: 'globals',
    },
  };
}

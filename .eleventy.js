module.exports = (config) => {
  const markdownIt = new require('markdown-it')({
    typographer: true,
    linkify: true,
  });

  const markdownItAnchor = require('markdown-it-anchor');
  markdownIt.use(markdownItAnchor);

  config.setLibrary('md', markdownIt);

  config.addPlugin(require('eleventy-plugin-nesting-toc'), {
    tags: ['h2', 'h3'],
    ul: false,
  });

  config.addPlugin(require('@11ty/eleventy-plugin-syntaxhighlight'));
  config.addPlugin(require('@11ty/eleventy-plugin-rss'));

  config.addFilter('dateDisplay', require('./filters/date-display.js'));

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

const path = require('path');
const imageSize = require('./image-size.js');
const site = require('../src/globals/site.json');

// Formats every scraper actually renders. SVG is refused outright by X,
// LinkedIn, Slack and Facebook, and WEBP is only half supported, so a post
// using either needs a `socialImage:` in its front matter pointing at a raster
// sibling. `pnpm run social-image <path>` generates one.
const SHAREABLE = new Set(['.png', '.jpg', '.jpeg', '.gif']);

const warned = new Set();

function warn(candidate, reason) {
  if (warned.has(candidate)) return;
  warned.add(candidate);
  console.warn(
    `[social-image] ${candidate} ${reason}, so the site card is being used instead. Fix with: pnpm run social-image ${candidate}`
  );
}

// Picks the first candidate a link preview can show, falling back to the site
// card, and returns it with the dimensions scrapers want stated up front.
module.exports = function socialCard(...candidates) {
  const fallback = `${site.baseUrl}${site.images.og}`;

  for (const candidate of [...candidates, fallback]) {
    if (!candidate) continue;

    if (!SHAREABLE.has(path.extname(candidate).toLowerCase())) {
      warn(candidate, 'is a format link previews will not render');
      continue;
    }

    const size = imageSize(path.join(__dirname, '..', 'public', candidate));
    if (!size) {
      warn(candidate, `could not be read from public${candidate}`);
      continue;
    }

    return { url: site.url + candidate, ...size };
  }

  return null;
};

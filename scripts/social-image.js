#!/usr/bin/env node

// Builds a link-preview safe copy of a featured image.
//
//   pnpm run social-image /images/posts/agent-sandbox.svg
//
// SVG heroes are rasterised, WEBP is re-encoded, and anything oversized is
// scaled down, because scrapers refuse SVG, are patchy on WEBP, and cap how
// large an image they will fetch. Writes a `-og` sibling next to the original;
// point the post's `socialImage:` at it and leave `featuredImage:` alone so the
// page itself keeps the sharper original.

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// 1200x630 is the card size every platform crops towards; 1600 wide leaves a
// little headroom for taller images without tripping any size limit.
const RASTER_WIDTH = 1200;
const MAX_WIDTH = 1600;

const publicDir = path.join(__dirname, '..', 'public');

function usage(message) {
  if (message) console.error(`Error: ${message}`);
  console.error('Usage: pnpm run social-image <path-under-public> [output-path]');
  process.exit(1);
}

// qlmanage renders an SVG into a square canvas, so read the viewBox to know how
// much of that square is padding and crop it back off.
function svgAspect(file) {
  const head = fs.readFileSync(file, 'utf8').slice(0, 2000);
  const viewBox = head.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/);
  if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) };

  const width = head.match(/\bwidth\s*=\s*["']([\d.]+)/);
  const height = head.match(/\bheight\s*=\s*["']([\d.]+)/);
  if (width && height) return { width: Number(width[1]), height: Number(height[1]) };

  usage(`could not read the size of ${file}`);
}

function rasteriseSvg(source, target) {
  const { width, height } = svgAspect(source);
  const scale = RASTER_WIDTH / Math.max(width, height);
  const outWidth = Math.round(width * scale);
  const outHeight = Math.round(height * scale);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'social-image-'));
  try {
    execFileSync('qlmanage', ['-t', '-s', String(RASTER_WIDTH), '-o', tmp, source], {
      stdio: 'ignore',
    });
    const thumbnail = path.join(tmp, `${path.basename(source)}.png`);
    if (!fs.existsSync(thumbnail)) usage(`qlmanage could not render ${source}`);

    fs.copyFileSync(thumbnail, target);
    execFileSync('sips', [
      '--cropToHeightWidth', String(outHeight), String(outWidth),
      '--matchTo', '/System/Library/ColorSync/Profiles/sRGB Profile.icc',
      target,
    ], { stdio: 'ignore' });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  return `${outWidth}x${outHeight}`;
}

function reencode(source, target) {
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', source,
    '-vf', `scale='min(${MAX_WIDTH},iw)':-2:flags=lanczos`,
    '-q:v', '3',
    target,
  ], { stdio: 'inherit' });

  const size = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', target])
    .toString()
    .match(/pixelWidth: (\d+)[\s\S]*pixelHeight: (\d+)/);
  return size ? `${size[1]}x${size[2]}` : 'unknown size';
}

const [input, output] = process.argv.slice(2);
if (!input) usage();

const relative = input.replace(/^public\//, '');
const source = path.join(publicDir, relative);
if (!fs.existsSync(source)) usage(`no such file: ${source}`);

const extension = path.extname(source).toLowerCase();
const suffix = extension === '.svg' ? '-og.png' : '-og.jpg';
const targetRelative = output
  ? output.replace(/^public\//, '')
  : path.join(path.dirname(relative), path.basename(relative, extension) + suffix);
const target = path.join(publicDir, targetRelative);

const dimensions =
  extension === '.svg' ? rasteriseSvg(source, target) : reencode(source, target);

const webPath = `/${targetRelative.replace(/^\/+/, '')}`;
console.log(`Wrote ${webPath} (${dimensions})`);
console.log(`Add to the post's front matter:\n  socialImage: ${webPath}`);

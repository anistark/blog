#!/usr/bin/env node
// Generates the images for the "Act Slow Fast" post: the cover, and the board
// pause diagram that sits above "Take a break from the board".
//
// The cover:
//
// It is a long-exposure star trail over a horizon of silhouettes. Every star
// turns through the same angle, so arc length is just radius times that angle:
// the ones near the pole barely smear, the ones out at the frame edge draw long
// sweeps. Same elapsed time, wildly different distance travelled.
//
// Under it, people at their own paces. Most are running. A few sit, a couple
// are asleep, and one is walking, directly beneath the still point of the sky.
// That is the essay's argument as a picture, which is why it carries no text.
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const W = 1200
const H = 520

// The still point sits slightly right of and above centre, so the long arcs
// have room to sweep across the wide side of the frame. Card crops centre on
// roughly (600, 260), which keeps the quiet middle in view.
const CX = 620
const CY = 248

// One exposure, one rotation. Constant for every trail: that is the whole point.
const SWEEP = (26 * Math.PI) / 180

const R_MIN = 9
const R_MAX = 1050
const TRAILS = 820

// Ground and figures are the same ink, so the people read as part of one shadow
// mass rather than as stickers pasted onto it.
const INK = '#070708'
const GROUND = 468

// Horizon line with a little undulation, so it does not read as a ruler.
const g = (d) => GROUND + d

// Mostly cool whites, a few carrying the site's blue, a couple warm so the
// field does not read as monochrome noise. The saturated site colours are kept
// rare on purpose: at any real weight they turn the sky electric, and this is
// meant to be a quiet image.
const STARS = [
  { c: '#e8ecf2', w: 32 },
  { c: '#c9d4e2', w: 26 },
  { c: '#8fb6e8', w: 14 },
  { c: '#c3c2b7', w: 17 },
  { c: '#3987e5', w: 4 },
  { c: '#e0a074', w: 5 },
  { c: '#d95926', w: 2 },
]
const STAR_TOTAL = STARS.reduce((sum, s) => sum + s.w, 0)

function mulberry32(seed) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260827)

function star() {
  let roll = rand() * STAR_TOTAL
  for (const s of STARS) {
    roll -= s.w
    if (roll <= 0) return s.c
  }
  return STARS[0].c
}

// An arc only earns a place in the file if some of it lands on the canvas.
function onCanvas(r, from, to) {
  const steps = 14
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps
    const x = CX + r * Math.cos(a)
    const y = CY + r * Math.sin(a)
    if (x > -40 && x < W + 40 && y > -40 && y < H + 40) return true
  }
  return false
}

const arcs = []

for (let i = 0; i < TRAILS; i++) {
  // Biased outwards, because most of the frame is far from the pole.
  const r = R_MIN + (R_MAX - R_MIN) * Math.pow(rand(), 0.85)
  const from = rand() * Math.PI * 2
  // A little jitter, so the field does not look mechanically clocked.
  const to = from + SWEEP * (0.85 + 0.3 * rand())

  if (!onCanvas(r, from, to)) continue

  // Most stars are faint; a handful are bright. That spread is what reads as
  // depth rather than static.
  const bright = Math.pow(rand(), 2.7)
  const falloff = Math.min(1, 0.45 + (0.55 * r) / 420)
  const opacity = Math.min(0.8, (0.06 + 0.68 * bright) * falloff)
  const width = 0.6 + 1.5 * Math.pow(bright, 1.4)

  const x0 = CX + r * Math.cos(from)
  const y0 = CY + r * Math.sin(from)
  const x1 = CX + r * Math.cos(to)
  const y1 = CY + r * Math.sin(to)

  arcs.push(
    `  <path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ` +
      `${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${star()}" stroke-width="${width.toFixed(2)}" ` +
      `stroke-opacity="${opacity.toFixed(3)}" stroke-linecap="round" fill="none"/>`
  )
}

// ------------------------------------------------------------------- figures
//
// Each pose is drawn in a local space 100 units tall with the feet at y = 0, so
// a scale of 0.45 gives a 45px person. Limbs are round-capped strokes, which is
// the only thing that still reads as a body at this size.

function limb(points, width) {
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ')
  return `<path d="${d}" stroke-width="${width}" fill="none"/>`
}

function head(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}"/>`
}

const POSES = {
  // Mid-stride, airborne, leaning into it.
  run: () =>
    head(6, -86, 9.5) +
    limb([[4, -77], [0, -44]], 13) +
    limb([[0, -44], [16, -28], [26, -12]], 8) +
    limb([[0, -44], [-14, -30], [-28, -30]], 8) +
    limb([[3, -70], [16, -60], [10, -46]], 7) +
    limb([[3, -70], [-12, -62], [-24, -70]], 7),

  // Upright, unhurried, a short stride.
  walk: () =>
    head(2, -88, 9.5) +
    limb([[1, -79], [0, -44]], 13) +
    limb([[0, -44], [9, -24], [13, -2]], 8) +
    limb([[0, -44], [-8, -24], [-15, -1]], 8) +
    limb([[1, -71], [7, -58], [9, -46]], 7) +
    limb([[1, -71], [-6, -58], [-9, -46]], 7),

  // On the ground, knees up, one hand resting on a knee. The knee has to break
  // well above the hip or the whole thing just reads as a lump.
  sit: () =>
    head(-4, -57, 10) +
    limb([[-3, -47], [0, -9]], 13) +
    limb([[0, -9], [19, -32], [31, -3]], 8) +
    limb([[0, -9], [15, -27], [26, -3]], 7) +
    limb([[-2, -41], [11, -31], [19, -29]], 7),

  // Lying on one side, knees folded.
  sleep: () =>
    head(-32, -13, 9) +
    limb([[-24, -11], [6, -9]], 15) +
    limb([[6, -9], [24, -13], [38, -7]], 8) +
    limb([[-16, -13], [-2, -19], [10, -15]], 6.5),
}

// x, pose, scale, facing (-1 mirrors), lean in degrees.
const FIGURES = [
  { x: 95, pose: 'run', s: 0.42, face: 1, lean: 10 },
  { x: 168, pose: 'run', s: 0.38, face: 1, lean: 12 },
  { x: 232, pose: 'run', s: 0.46, face: 1, lean: 9 },
  { x: 296, pose: 'sleep', s: 0.6, face: 1, lean: 0 },
  { x: 358, pose: 'run', s: 0.4, face: 1, lean: 11 },
  { x: 432, pose: 'run', s: 0.44, face: 1, lean: 8 },
  { x: 508, pose: 'sit', s: 0.50, face: 1, lean: 0 },
  // Directly beneath the still point of the sky.
  { x: 612, pose: 'walk', s: 0.46, face: 1, lean: 0 },
  { x: 702, pose: 'sit', s: 0.46, face: -1, lean: 0 },
  { x: 812, pose: 'run', s: 0.41, face: 1, lean: 10 },
  { x: 886, pose: 'run', s: 0.47, face: 1, lean: 12 },
  { x: 958, pose: 'sit', s: 0.52, face: -1, lean: 0 },
  { x: 1036, pose: 'sleep', s: 0.58, face: -1, lean: 0 },
  { x: 1122, pose: 'run', s: 0.39, face: 1, lean: 9 },
]

const figures = FIGURES.map(({ x, pose, s, face, lean }) => {
  const transform =
    `translate(${x} ${GROUND}) scale(${face * s} ${s})` + (lean ? ` rotate(${lean})` : '')
  return `  <g transform="${transform}">${POSES[pose]()}</g>`
}).join('\n')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="sky" cx="${CX / W}" cy="${CY / H}" r="0.95">
      <stop offset="0" stop-color="#1d1d1b"/>
      <stop offset="0.55" stop-color="#161615"/>
      <stop offset="1" stop-color="#101010"/>
    </radialGradient>
    <radialGradient id="pole" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#c6d4e4" stop-opacity="0.14"/>
      <stop offset="0.45" stop-color="#8fa4bd" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#8fa4bd" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fa4bd" stop-opacity="0"/>
      <stop offset="1" stop-color="#9db0c6" stop-opacity="0.08"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="${CX}" cy="${CY}" r="265" fill="url(#pole)"/>

${arcs.join('\n')}

  <!-- haze near the horizon, so the silhouettes have something to sit against -->
  <rect x="0" y="${g(-150)}" width="${W}" height="${153}" fill="url(#haze)"/>

  <!-- the ground, and the people on it -->
  <path d="M 0 ${H} L 0 ${g(-1)} C 160 ${g(-5)}, 280 ${g(2)}, 420 ${g(-3)} C 560 ${g(-7)}, 680 ${g(1)}, 820 ${g(-4)} C 960 ${g(-8)}, 1080 ${g(0)}, 1200 ${g(-4)} L ${W} ${H} Z" fill="${INK}"/>

  <g fill="${INK}" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
${figures}
  </g>

  <!-- the centre itself: it moves too, just not enough to smear -->
  <circle cx="${CX}" cy="${CY}" r="1.7" fill="#f2f5f9" fill-opacity="0.85"/>
</svg>
`

const posts = join(here, '..', 'public', 'images', 'posts')

function write(name, markup) {
  writeFileSync(join(posts, name), markup, 'utf8')
  console.log(`Wrote /images/posts/${name}`)
}

// The cover ships as PNG, so its SVG is only ever an intermediate: rendered to
// a temp file, rasterised at both sizes, thrown away. qlmanage fits the art
// into a square canvas, so the padding gets cropped back off afterwards.
function raster(markup, name, width) {
  const scale = width / Math.max(W, H)
  const outW = Math.round(W * scale)
  const outH = Math.round(H * scale)
  const tmp = mkdtempSync(join(tmpdir(), 'act-slow-fast-'))

  try {
    const source = join(tmp, 'cover.svg')
    writeFileSync(source, markup, 'utf8')
    execFileSync('qlmanage', ['-t', '-s', String(width), '-o', tmp, source], { stdio: 'ignore' })

    const target = join(posts, name)
    copyFileSync(join(tmp, 'cover.svg.png'), target)
    execFileSync(
      'sips',
      [
        '--cropToHeightWidth', String(outH), String(outW),
        '--matchTo', '/System/Library/ColorSync/Profiles/sRGB Profile.icc',
        target,
      ],
      { stdio: 'ignore' }
    )
    console.log(`Wrote /images/posts/${name} (${outW}x${outH})`)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

// 2400 keeps the banner sharp at the layout's max-w-6xl on a retina screen.
// 1200 is the link-preview copy, kept small because scrapers cap the fetch.
raster(svg, 'act-slow-fast.png', 2400)
raster(svg, 'act-slow-fast-og.png', 1200)
console.log(`  ${arcs.length} trails, ${FIGURES.length} figures`)

// -------------------------------------------------- illustration: the board
//
// One figure for "Take a break from the board": the shape of a deliberate
// pause, from undifferentiated noise through to execution that is aimed at
// something. House in-body size is 900 wide on the same dark palette as
// ram-residents.svg and queue-pipeline.svg.

const BG = '#1a1a19'
const PANEL = '#242423'
const BORDER = '#3a3a38'
const TEXT = '#ffffff'
const MUTED = '#c3c2b7'
const BLUE = '#3987e5'
const GREEN = '#199e70'
const FONT = 'system-ui, sans-serif'

// Everything on the main run sits on one line.
const MID = 175

function arrowRight(x1, x2, y, color) {
  return (
    `<path d="M ${x1} ${y} L ${x2 - 9} ${y}" stroke="${color}" stroke-width="2"/>` +
    `<path d="M ${x2} ${y} l -10 -6 v 12 z" fill="${color}"/>`
  )
}

function arrowDown(x, y1, y2, color) {
  return (
    `<path d="M ${x} ${y1} L ${x} ${y2 - 9}" stroke="${color}" stroke-width="2"/>` +
    `<path d="M ${x} ${y2} l -6 -10 h 12 z" fill="${color}"/>`
  )
}

// The two deliberate acts are the only boxed things: they are what you do,
// as opposed to what arrives (noise) or what comes out (execution).
function step(x, w, label) {
  return (
    `<rect x="${x}" y="${MID - 27}" width="${w}" height="54" rx="9" fill="${PANEL}" stroke="${BLUE}"/>` +
    `<text x="${x + w / 2}" y="${MID + 6}" font-size="17" font-weight="600" fill="${TEXT}" text-anchor="middle">${label}</text>`
  )
}

write(
  'act-slow-fast-board-pause.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 340" font-family="${FONT}">
  <rect width="900" height="340" fill="${BG}"/>
  <rect x="40" y="40" width="820" height="260" rx="14" fill="#1e1e1d" stroke="${BORDER}"/>

  <text x="450" y="86" font-size="14" font-weight="700" letter-spacing="3" fill="${MUTED}" text-anchor="middle">THE BOARD PAUSE</text>

  <text x="118" y="${MID + 6}" font-size="17" fill="${MUTED}" text-anchor="middle">Noise</text>
  ${arrowRight(158, 206, MID, BLUE)}

  ${step(212, 150, 'Step Back')}
  ${arrowRight(374, 422, MID, BLUE)}

  ${step(432, 130, 'Assess')}
  ${arrowRight(574, 622, MID, GREEN)}

  <text x="712" y="${MID - 4}" font-size="17" font-weight="600" fill="${GREEN}" text-anchor="middle">Targeted</text>
  <text x="712" y="${MID + 20}" font-size="17" font-weight="600" fill="${GREEN}" text-anchor="middle">Execution</text>

  ${arrowDown(497, MID + 33, 244, BLUE)}
  <text x="497" y="270" font-size="17" fill="${BLUE}" text-anchor="middle">First Principles</text>
</svg>
`
)

#!/usr/bin/env node
// Generates the two SVG illustrations for the "World-building with WASM" post.
// The seed strip uses the same RNG + bookshelf generator as the docs landing
// page, so the determinism it illustrates is real, not mocked.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const BG = '#03050a'
const PANEL = '#090e15'
const BORDER = '#15202a'
const TEXT = '#cfe6db'
const MUTED = '#5f7d75'
const GREEN = '#3df58a'
const BLUE = '#2aa7ff'
const RED = '#ff5566'
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"

// ---------------------------------------------------------------- frame budget

function frameBudget() {
  const W = 960
  const H = 470
  const chartX = 50
  const chartW = 860
  const frames = 12
  const slot = chartW / frames
  const barW = 42
  const pxPerMs = 6
  const budgetMs = 16.6

  // [script, physics, render, gc] in ms per frame
  const jsFrames = [
    [4, 5, 5, 0],
    [4, 5.5, 5, 0],
    [4, 5, 5.5, 0],
    [4, 6, 5, 0],
    [4, 5, 5, 0],
    [4, 5, 5, 12.5], // GC pause blows the frame
    [4, 5.5, 5, 0],
    [4, 5, 5.5, 0],
    [4, 6, 5, 0],
    [4, 5, 5, 0],
    [4, 5.5, 5, 0],
    [4, 5, 5, 0],
  ]
  const wasmFrames = jsFrames.map(([s, , r], i) => [s, 4 + 0.4 * ((i * 7) % 3), r, 0])

  const seg = (x, y, h, color, opacity = 1) =>
    `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" fill="${color}" opacity="${opacity}"/>`

  function chart(baseY, data, title) {
    const budgetY = baseY - budgetMs * pxPerMs
    let out = ''
    out += `<text x="${chartX}" y="${baseY - 150}" fill="${TEXT}" font-family="${MONO}" font-size="15" font-weight="600">${title}</text>`
    data.forEach((f, i) => {
      const x = chartX + i * slot + (slot - barW) / 2
      let y = baseY
      const colors = [BLUE, GREEN, MUTED, RED]
      f.forEach((ms, k) => {
        if (ms <= 0) return
        const h = ms * pxPerMs
        y -= h
        out += seg(x, y, h, colors[k], k === 2 ? 0.55 : 1)
      })
    })
    out += `<line x1="${chartX}" y1="${baseY}" x2="${chartX + chartW}" y2="${baseY}" stroke="${BORDER}" stroke-width="2"/>`
    out += `<line x1="${chartX}" y1="${budgetY}" x2="${chartX + chartW}" y2="${budgetY}" stroke="${GREEN}" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.8"/>`
    out += `<text x="${chartX + chartW}" y="${budgetY - 7}" fill="${GREEN}" font-family="${MONO}" font-size="12" text-anchor="end">16.6 ms budget</text>`
    return out
  }

  const gcFrame = 5
  const gcX = chartX + gcFrame * slot + (slot - barW) / 2
  const gcTotal = jsFrames[gcFrame].reduce((a, b) => a + b, 0)
  const gcTopY = 215 - gcTotal * pxPerMs

  const legend = [
    ['script', BLUE],
    ['physics', GREEN],
    ['render', MUTED],
    ['GC pause', RED],
  ]
    .map(
      ([label, color], i) =>
        `<rect x="${640 + i * 80}" y="18" width="10" height="10" fill="${color}"/>` +
        `<text x="${654 + i * 80}" y="28" fill="${MUTED}" font-family="${MONO}" font-size="11">${label}</text>`,
    )
    .join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${MONO}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  ${legend}
  ${chart(215, jsFrames, 'JavaScript physics')}
  <text x="${gcX + barW / 2}" y="${gcTopY - 24}" fill="${RED}" font-family="${MONO}" font-size="12" text-anchor="middle">GC pause</text>
  <text x="${gcX + barW / 2}" y="${gcTopY - 9}" fill="${RED}" font-family="${MONO}" font-size="12" text-anchor="middle">→ dropped frame</text>
  ${chart(435, wasmFrames, 'WASM physics (Rapier)')}
</svg>
`
  writeFileSync(join(here, '../public/images/posts/world-building-wasm-frame-budget.svg'), svg)
}

// ----------------------------------------------------------- seed determinism

// Identical to @runek/core rng — and to the docs landing artifact.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s)
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s)
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296
  }
}

function spines(seed) {
  const next = rng(seed)
  const out = []
  const left = 22
  const right = 198
  const planks = [76, 138, 200, 262]
  for (const plankY of planks) {
    let x = left
    while (x < right) {
      const w = 7 + next() * 9
      if (x + w > right) break
      const h = 30 + next() * 24
      const blue = next() < 0.18
      const hue = blue ? 207 : 140 + next() * 40
      const lit = 38 + next() * 22
      if (next() < 0.82) {
        out.push({ x, y: plankY - h, w, h, fill: `hsl(${Math.round(hue)}, 65%, ${Math.round(lit)}%)` })
      }
      x += w + 2.5
    }
  }
  return out
}

function shelfPanel(seed, ox, oy) {
  const frame = `
    <rect x="14" y="10" width="192" height="256" fill="none" stroke="${GREEN}" stroke-width="2"/>
    <line x1="14" y1="76" x2="206" y2="76" stroke="${GREEN}" stroke-width="2"/>
    <line x1="14" y1="138" x2="206" y2="138" stroke="${GREEN}" stroke-width="2"/>
    <line x1="14" y1="200" x2="206" y2="200" stroke="${GREEN}" stroke-width="2"/>`
  const books = spines(seed)
    .map(
      (s) =>
        `<rect x="${s.x.toFixed(1)}" y="${s.y.toFixed(1)}" width="${s.w.toFixed(1)}" height="${s.h.toFixed(1)}" fill="${s.fill}"/>`,
    )
    .join('')
  return `<g transform="translate(${ox},${oy})">
    <rect x="-12" y="-14" width="244" height="304" rx="10" fill="${PANEL}" stroke="${BORDER}"/>
    ${frame}${books}
    <text x="110" y="312" fill="${MUTED}" font-family="${MONO}" font-size="15" text-anchor="middle">seed <tspan fill="${GREEN}" font-weight="600">${seed}</tspan></text>
  </g>`
}

function seedStrip() {
  const W = 1080
  const H = 400
  const seeds = [42, 42, 42, 7]
  const panels = seeds.map((s, i) => shelfPanel(s, 30 + i * 262, 40)).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${MONO}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  ${panels}
  <text x="${30 + 110}" y="390" fill="${MUTED}" font-size="13" font-family="${MONO}" text-anchor="start">same seed → pixel-identical, on every machine</text>
  <text x="${30 + 3 * 262 + 220}" y="390" fill="${MUTED}" font-size="13" font-family="${MONO}" text-anchor="end">new seed → new shelf</text>
</svg>
`
  writeFileSync(join(here, '../public/images/posts/world-building-wasm-seed-determinism.svg'), svg)
}

// --------------------------------------------------------------- worlds as data

function worldData() {
  const W = 1240
  const H = 560

  // ----- left half: the world JSON, syntax-highlighted -----
  const lines = [
    '{',
    '  "version": 1,',
    '  "nodes": [',
    '    { "type": "Terrain",',
    '      "props": { "size": [120,120], "relief": 3, "seed": 9 } },',
    '    { "type": "House",',
    '      "props": { "position": [0, 0, 0] } },',
    '    { "type": "Trees",',
    '      "props": { "position": [-12, 0, -7], "seed": 4 } },',
    '    { "type": "Player",',
    '      "props": { "position": [-1, 3, 13] } }',
    '  ]',
    '}',
  ]

  const panelX = 24
  const panelY = 24
  const panelW = 580
  const panelH = 452
  const textX = panelX + 22
  const firstLineY = 96
  const lineH = 27
  const FS = 14

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Tiny JSON tokenizer: keys muted, string values green, numbers blue.
  function tokenize(line) {
    const out = []
    let i = 0
    const push = (t, c) => {
      if (t) out.push(`<tspan fill="${c}">${esc(t)}</tspan>`)
    }
    while (i < line.length) {
      const c = line[i]
      if (c === ' ') {
        let j = i
        while (line[j] === ' ') j++
        push(line.slice(i, j), TEXT)
        i = j
        continue
      }
      if (c === '"') {
        let j = i + 1
        while (j < line.length && line[j] !== '"') j++
        const str = line.slice(i, j + 1)
        i = j + 1
        let k = i
        while (line[k] === ' ') k++
        push(str, line[k] === ':' ? MUTED : GREEN)
        continue
      }
      if (/[-\d.]/.test(c)) {
        let j = i
        while (j < line.length && /[-\d.]/.test(line[j])) j++
        push(line.slice(i, j), BLUE)
        i = j
        continue
      }
      push(c, '#9fb4ad')
      i++
    }
    return out.join('')
  }

  const codePanel =
    `<rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="10" fill="${PANEL}" stroke="${BORDER}"/>` +
    `<text x="${textX}" y="${panelY + 30}" fill="${MUTED}" font-family="${MONO}" font-size="12">helicon.world.json</text>` +
    `<line x1="${panelX}" y1="${panelY + 44}" x2="${panelX + panelW}" y2="${panelY + 44}" stroke="${BORDER}"/>` +
    lines
      .map(
        (ln, i) =>
          `<text x="${textX}" y="${firstLineY + i * lineH}" font-family="${MONO}" font-size="${FS}" xml:space="preserve">${tokenize(ln)}</text>`,
      )
      .join('')

  // ----- right half: an isometric low-poly world -----
  const S = 30
  const OX = 920
  const OY = 300
  const iso = (x, y, z) => [OX + (x - z) * 0.866 * S, OY + (x + z) * 0.5 * S - y * S]
  const pt = (x, y, z) => {
    const [sx, sy] = iso(x, y, z)
    return `${sx.toFixed(1)},${sy.toFixed(1)}`
  }

  // Iso cuboid: visible top + the two viewer-facing (+x, +z) side faces.
  function cuboid(cx, cz, w, d, h, baseY, top, right, left) {
    const x0 = cx - w / 2
    const x1 = cx + w / 2
    const z0 = cz - d / 2
    const z1 = cz + d / 2
    const y0 = baseY
    const y1 = baseY + h
    const topF = `${pt(x0, y1, z0)} ${pt(x1, y1, z0)} ${pt(x1, y1, z1)} ${pt(x0, y1, z1)}`
    const rightF = `${pt(x1, y1, z0)} ${pt(x1, y1, z1)} ${pt(x1, y0, z1)} ${pt(x1, y0, z0)}`
    const leftF = `${pt(x0, y1, z1)} ${pt(x1, y1, z1)} ${pt(x1, y0, z1)} ${pt(x0, y0, z1)}`
    return (
      `<polygon points="${leftF}" fill="${left}"/>` +
      `<polygon points="${rightF}" fill="${right}"/>` +
      `<polygon points="${topF}" fill="${top}"/>`
    )
  }

  function house(cx, cz, w, d, h) {
    const walls = cuboid(cx, cz, w, d, h, 0, '#6d4f37', '#7d5a3e', '#553f2c')
    const x0 = cx - w / 2
    const x1 = cx + w / 2
    const z0 = cz - d / 2 - 0.2
    const z1 = cz + d / 2 + 0.2
    const ex = 0.28
    const yr = h + 1.0
    const Rl = [cx, yr, z0]
    const Rr = [cx, yr, z1]
    const El0 = [x0 - ex, h, z0]
    const El1 = [x0 - ex, h, z1]
    const Er0 = [x1 + ex, h, z0]
    const Er1 = [x1 + ex, h, z1]
    const quad = (a, b, c, d2, col) =>
      `<polygon points="${pt(...a)} ${pt(...b)} ${pt(...c)} ${pt(...d2)}" fill="${col}"/>`
    const tri = (a, b, c, col) => `<polygon points="${pt(...a)} ${pt(...b)} ${pt(...c)}" fill="${col}"/>`
    const back = quad(Rl, Rr, El1, El0, '#7a4a30') // -x slope (shadow)
    const front = quad(Rl, Rr, Er1, Er0, '#9a6442') // +x slope (lit)
    const gable = tri(El1, Er1, Rr, '#5e4330') // +z end, toward viewer
    return walls + back + gable + front
  }

  // Stylized low-poly tree: trunk + an octahedral foliage crown.
  function tree(cx, cz, scale) {
    const trunkH = 0.6 * scale
    const tw = 0.24 * scale
    const fr = 0.95 * scale
    const fcy = trunkH + fr * 0.65
    const ht = fr * 1.25
    const hb = fr * 0.9
    const trunk = cuboid(cx, cz, tw, tw, trunkH, 0, '#5b3f29', '#6b4a30', '#46301f')
    const T = [cx, fcy + ht, cz]
    const B = [cx, fcy - hb, cz]
    const N = [cx, fcy, cz - fr]
    const E = [cx + fr, fcy, cz]
    const Sp = [cx, fcy, cz + fr]
    const Wp = [cx - fr, fcy, cz]
    const tri = (a, b, c, col) => `<polygon points="${pt(...a)} ${pt(...b)} ${pt(...c)}" fill="${col}"/>`
    const lit = '#6f9e49'
    const mid = '#557d3c'
    const dark = '#3c5a2b'
    return (
      trunk +
      tri(B, N, E, dark) +
      tri(B, Sp, Wp, dark) +
      tri(B, E, Sp, mid) +
      tri(T, N, E, mid) +
      tri(T, Sp, Wp, dark) +
      tri(T, E, Sp, lit)
    )
  }

  // Faint elevation contours on the terrain's top face (hint at "relief").
  const contour = (f) => {
    const a = `920,${(300 - 150 * f).toFixed(1)}`
    const b = `${(920 + 260 * f).toFixed(1)},300`
    const c = `920,${(300 + 150 * f).toFixed(1)}`
    const d = `${(920 - 260 * f).toFixed(1)},300`
    return `<polygon points="${a} ${b} ${c} ${d}" fill="none" stroke="#5d8a40" stroke-width="1.1" opacity="0.22"/>`
  }

  // Connector: panel-edge dot → thin line → ring around the matching object.
  const conn = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${GREEN}" stroke-width="1" opacity="0.5"/>` +
    `<circle cx="${x1}" cy="${y1}" r="2.5" fill="${GREEN}"/>` +
    `<circle cx="${x2}" cy="${y2}" r="4.5" fill="none" stroke="${GREEN}" stroke-width="1.4" opacity="0.85"/>`

  const terrain = cuboid(0, 0, 10, 10, 1.0, -1.0, '#3c5a2b', '#46682f', '#2c4420')

  const scene =
    `<ellipse cx="920" cy="250" rx="320" ry="150" fill="url(#fog)"/>` +
    terrain +
    contour(0.62) +
    contour(0.34) +
    house(-0.8, -1.4, 2.6, 2.2, 1.7) +
    tree(-3.2, 2.4, 0.85) +
    cuboid(-1.2, 3.2, 0.5, 0.5, 1.1, 0, '#3db0ff', '#2aa7ff', '#1d77c0') +
    tree(3.6, -0.6, 0.9) +
    tree(2.8, 2.2, 1.05)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${MONO}">
  <defs><radialGradient id="fog" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#dfe9f5" stop-opacity="0.10"/>
    <stop offset="100%" stop-color="#dfe9f5" stop-opacity="0"/>
  </radialGradient></defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  ${scene}
  ${codePanel}
  ${conn(604, 226, 936, 201)}
  ${conn(604, 280, 936, 336)}
  ${conn(604, 334, 806, 309)}
</svg>
`
  writeFileSync(join(here, '../public/images/posts/world-building-wasm-world-data.svg'), svg)
}

frameBudget()
seedStrip()
worldData()
console.log('wrote world-building-wasm illustrations to public/images/posts/')

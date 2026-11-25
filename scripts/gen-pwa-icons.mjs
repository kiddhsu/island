import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')

// Soft-geo floating island: wide plateau silhouette, no monument tower.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Island Quest">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f3e4ef"/>
      <stop offset="48%" stop-color="#d9e4f2"/>
      <stop offset="100%" stop-color="#b8c9e0"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="url(#sky)"/>

  <ellipse cx="256" cy="404" rx="152" ry="36" fill="#2a2438" opacity="0.12"/>

  <!-- Deep undercut cliff -->
  <g>
    <path fill="#3d4f6f" d="M256 300 L408 224 L408 292 L256 368 Z"/>
    <path fill="#5a6f92" d="M104 224 L256 300 L256 368 L104 292 Z"/>
  </g>

  <!-- Mid cliff band -->
  <g>
    <path fill="#4a5d7a" d="M256 272 L392 204 L392 240 L256 308 Z"/>
    <path fill="#7b9ecf" d="M120 204 L256 272 L256 308 L120 240 Z"/>
  </g>

  <!-- Main plateau top -->
  <g>
    <path fill="#5a6f92" d="M256 236 L392 168 L392 204 L256 272 Z"/>
    <path fill="#9bb4d6" d="M120 168 L256 236 L256 272 L120 204 Z"/>
    <path fill="#f7f2ea" d="M120 168 L256 100 L392 168 L256 236 Z"/>
    <path fill="#ebe3d6" d="M168 176 L256 132 L344 176 L256 220 Z"/>
  </g>

  <!-- Low second terrace (still flat island language) -->
  <g>
    <path fill="#5a6f92" d="M256 172 L320 140 L320 164 L256 196 Z"/>
    <path fill="#9bb4d6" d="M192 140 L256 172 L256 196 L192 164 Z"/>
    <path fill="#fffaf3" d="M192 140 L256 108 L320 140 L256 172 Z"/>
  </g>

  <!-- Mint plant cube -->
  <g>
    <path fill="#3f7a64" d="M172 180 L200 166 L200 194 L172 208 Z"/>
    <path fill="#6fbfa0" d="M144 166 L172 180 L172 208 L144 194 Z"/>
    <path fill="#d8f0e6" d="M144 166 L172 152 L200 166 L172 180 Z"/>
  </g>

  <!-- Coral pebble slab -->
  <g>
    <path fill="#c46852" d="M300 188 L328 174 L328 198 L300 212 Z"/>
    <path fill="#e07a5f" d="M272 174 L300 188 L300 212 L272 198 Z"/>
    <path fill="#f0b5a4" d="M272 174 L300 160 L328 174 L300 188 Z"/>
  </g>
</svg>
`

fs.writeFileSync(path.join(publicDir, 'icon-source.svg'), svg, 'utf8')
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg, 'utf8')

const outs = [
  ['pwa-512.png', 512],
  ['pwa-192.png', 192],
  ['apple-touch-icon.png', 180],
  ['pwa-maskable-512.png', 512],
]

for (const [file, size] of outs) {
  const png = new Resvg(Buffer.from(svg, 'utf8'), {
    fitTo: { mode: 'width', value: size },
  })
    .render()
    .asPng()
  fs.writeFileSync(path.join(publicDir, file), png)
  console.log(file, png.length)
}

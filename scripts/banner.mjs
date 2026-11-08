#!/usr/bin/env node
/**
 * Renders README graphics from the screenshots in docs/screenshots:
 *   docs/banner.jpg          1600×800  — README header
 *   docs/social-preview.jpg  1280×640  — GitHub → Settings → Social preview
 *   docs/templates.jpg       1600×1000 — 2×2 template collage
 *
 *   npm run screenshots && npm run banner
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve(import.meta.dirname, '..')
const shots = resolve(root, 'docs/screenshots')
const img = (name) => `data:image/jpeg;base64,${readFileSync(resolve(shots, `${name}.jpg`)).toString('base64')}`
const channel = process.env.BROWSER_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : 'chrome')

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400..800&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">`

const base = `
  *{margin:0;box-sizing:border-box}
  body{width:var(--w);height:var(--h);overflow:hidden;background:#09090b;color:#f4f4f5;font-family:Geist,system-ui,sans-serif;position:relative}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 80% 80% at 30% 40%,#000 20%,transparent 75%)}
  .glow{position:absolute;inset:0;background:radial-gradient(35% 45% at 18% 30%,rgba(74,222,128,.22),transparent 70%),radial-gradient(35% 45% at 85% 70%,rgba(56,189,248,.2),transparent 70%),radial-gradient(30% 40% at 60% 10%,rgba(255,90,54,.14),transparent 70%);filter:blur(30px)}
`

function heroHtml({ w, h, scale }) {
  return `<!doctype html><html><head>${fonts}<style>
  :root{--w:${w}px;--h:${h}px;--s:${scale}}
  ${base}
  .copy{position:absolute;left:calc(80px*var(--s));top:50%;translate:0 -50%;width:calc(560px*var(--s));z-index:3}
  .logo{display:flex;align-items:center;gap:calc(14px*var(--s));margin-bottom:calc(34px*var(--s))}
  .logo svg{width:calc(54px*var(--s));height:calc(54px*var(--s))}
  .logo span{font-family:'Geist Mono';font-size:calc(17px*var(--s));letter-spacing:.14em;text-transform:uppercase;color:#a1a1aa}
  h1{font-size:calc(80px*var(--s));line-height:.92;letter-spacing:-.055em;font-weight:700}
  h1 em{font-family:'Instrument Serif';font-style:italic;font-weight:400;letter-spacing:-.02em;background:linear-gradient(100deg,#4ade80,#38bdf8);-webkit-background-clip:text;color:transparent;padding-right:.08em}
  p{margin-top:calc(22px*var(--s));font-size:calc(21px*var(--s));line-height:1.45;color:#a1a1aa;max-width:28ch}
  .chips{display:flex;flex-wrap:wrap;gap:calc(10px*var(--s));margin-top:calc(34px*var(--s))}
  .chips b{font-weight:500;font-family:'Geist Mono';font-size:calc(15px*var(--s));padding:calc(8px*var(--s)) calc(14px*var(--s));border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(255,255,255,.04)}
  .chips b i{font-style:normal;color:#4ade80}
  .fade{position:absolute;inset:0;z-index:2;background:linear-gradient(90deg,#09090b 36%,rgba(9,9,11,.85) 46%,transparent 64%)}
  .stage{position:absolute;right:calc(-330px*var(--s));top:50%;width:calc(1000px*var(--s));height:calc(700px*var(--s));translate:0 -50%;perspective:2400px}
  .card{position:absolute;width:calc(640px*var(--s));aspect-ratio:16/10;border-radius:calc(16px*var(--s));overflow:hidden;border:1px solid rgba(255,255,255,.14);box-shadow:0 40px 80px -20px rgba(0,0,0,.8),0 0 0 1px rgba(0,0,0,.4);transform-style:preserve-3d}
  .card img{width:100%;height:100%;object-fit:cover;object-position:top}
  .card span{position:absolute;left:calc(14px*var(--s));bottom:calc(14px*var(--s));font-family:'Geist Mono';font-size:calc(13px*var(--s));padding:calc(5px*var(--s)) calc(11px*var(--s));border-radius:999px;background:rgba(0,0,0,.6);color:#fff;backdrop-filter:blur(6px)}
  .c1{left:calc(40px*var(--s));top:calc(10px*var(--s));transform:rotateY(-22deg) rotateX(6deg) rotateZ(-2deg)}
  .c2{left:calc(300px*var(--s));top:calc(60px*var(--s));transform:rotateY(-22deg) rotateX(6deg) rotateZ(-2deg) translateZ(-60px)}
  .c3{left:calc(80px*var(--s));top:calc(330px*var(--s));transform:rotateY(-22deg) rotateX(6deg) rotateZ(-2deg) translateZ(40px)}
  .c4{left:calc(360px*var(--s));top:calc(380px*var(--s));transform:rotateY(-22deg) rotateX(6deg) rotateZ(-2deg) translateZ(-20px)}
  .credit{position:absolute;left:calc(80px*var(--s));top:calc(36px*var(--s));font-family:'Geist Mono';font-size:calc(14px*var(--s));color:#71717a;z-index:3}
  </style></head><body>
  <div class="grid"></div><div class="glow"></div><div class="fade"></div>
  <div class="copy">
    <div class="logo">
      <svg viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="#111114"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-opacity=".4" stroke-width="2"/><path d="M22 46V18h12a9 9 0 0 1 0 18H22" fill="none" stroke="url(#g)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="46" r="4" fill="#4ade80"/></svg>
      <span>Open-source portfolio engine</span>
    </div>
    <h1>One codebase.<br><em>Many portfolios.</em></h1>
    <p>Pick a persona in <code style="color:#f4f4f5;font-family:'Geist Mono'">.env</code> — developer, designer, photographer or CV — and ship.</p>
    <div class="chips"><b><i>⚡</i> Vite 8</b><b>React 19</b><b>TypeScript 7</b><b>Tailwind 4</b></div>
  </div>
  <div class="stage">
    <div class="card c2"><img src="${img('designer-light')}"><span>designer</span></div>
    <div class="card c4"><img src="${img('minimal-light')}"><span>minimal</span></div>
    <div class="card c1"><img src="${img('developer-dark')}"><span>developer</span></div>
    <div class="card c3"><img src="${img('photographer-dark')}"><span>photographer</span></div>
  </div>
  <div class="credit">github.com/OskarTrzaskawka · MIT</div>
  </body></html>`
}

const tile = (name, label, sub) => `<figure><img src="${img(name)}"><figcaption><b>${label}</b><span>${sub}</span></figcaption></figure>`

function collageHtml() {
  return `<!doctype html><html><head>${fonts}<style>
  :root{--w:1600px;--h:1000px}
  ${base}
  .wrap{position:absolute;inset:48px;display:grid;grid-template-columns:1fr 1fr;gap:28px;z-index:1}
  figure{position:relative;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 60px -25px rgba(0,0,0,.9)}
  img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
  figcaption{position:absolute;left:16px;bottom:16px;display:flex;align-items:center;gap:10px;padding:8px 16px 8px 14px;border-radius:999px;background:rgba(9,9,11,.75);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.12)}
  figcaption b{font-weight:600;font-size:17px}
  figcaption span{font-family:'Geist Mono';font-size:13px;color:#a1a1aa}
  </style></head><body><div class="grid"></div><div class="glow"></div><div class="wrap">
  ${tile('developer-dark', 'Developer', 'Terminal Noir')}
  ${tile('designer-light', 'Designer', 'Studio')}
  ${tile('photographer-dark', 'Photographer', 'Darkroom')}
  ${tile('minimal-light', 'Minimal', 'Paper')}
  </div></body></html>`
}

const browser = await chromium.launch({ channel })
async function render(html, w, h, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  await page.screenshot({ path: resolve(root, 'docs', file), type: 'jpeg', quality: 88 })
  console.log('  ✓ docs/' + file)
  await page.close()
}
try {
  await render(heroHtml({ w: 1600, h: 800, scale: 1.25 }), 1600, 800, 'banner.jpg')
  await render(heroHtml({ w: 1280, h: 640, scale: 1 }), 1280, 640, 'social-preview.jpg')
  await render(collageHtml(), 1600, 1000, 'templates.jpg')
} finally {
  await browser.close()
}

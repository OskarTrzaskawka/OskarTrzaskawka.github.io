#!/usr/bin/env node
/**
 * Generates README screenshots for every persona.
 *
 *   npm run screenshots                 # uses installed Chrome / Edge
 *   BROWSER_CHANNEL=chromium npm run screenshots
 *
 * Builds the showcase, starts `vite preview`, then captures each persona
 * (hero + full page, desktop + mobile, dark + light) into docs/screenshots.
 */
import { spawn, execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const root = resolve(import.meta.dirname, '..')
const out = resolve(root, 'docs/screenshots')
const PORT = 4789
const personas = (process.env.PERSONAS ?? 'developer,designer,photographer,minimal').split(',')
const channel = process.env.BROWSER_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : 'chrome')

mkdirSync(out, { recursive: true })

if (!process.env.SKIP_BUILD) {
  console.log('› building showcase…')
  execSync('npx vite build --mode showcase', { cwd: root, stdio: 'inherit' })
}

const server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: root,
  stdio: 'pipe',
})
await new Promise((ok, fail) => {
  server.stdout.on('data', (d) => String(d).includes(String(PORT)) && ok())
  server.on('exit', (c) => fail(new Error(`preview exited ${c}`)))
  setTimeout(() => fail(new Error('preview timeout')), 20_000)
})

const browser = await chromium.launch({ channel })
const hideChrome = `.showcase-dock,.back-to-top,.cursor-glow{display:none!important}`

async function shoot(persona, { width, height, scheme, full, name }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width < 600 ? 2 : 1, colorScheme: scheme })
  await ctx.addInitScript((s) => localStorage.setItem('pf:scheme', s), scheme)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.log('    [pageerror]', e.message))
  page.on('console', (m) => m.type() === 'error' && console.log('    [console]', m.text()))
  await page.goto(`http://localhost:${PORT}/?persona=${persona}`, { waitUntil: 'load', timeout: 60_000 })
  // Override the persona's default scheme for this capture.
  await page.evaluate((s) => {
    document.documentElement.dataset.scheme = s
  }, scheme)
  await page.addStyleTag({ content: hideChrome })
  await page.evaluate(() => document.fonts.ready)
  if (full) {
    // Scroll through so in-view animations and lazy images run.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 140))
      }
      scrollTo(0, 0)
    })
    await page.waitForTimeout(1200)
  } else {
    await page.waitForTimeout(1800)
  }
  const file = resolve(out, `${name}.jpg`)
  await page.screenshot({ path: file, fullPage: full, type: 'jpeg', quality: 82 })
  console.log('  ✓', file.replace(root, '.'))
  await ctx.close()
}

/** Captures an interaction (palette, dialog, lightbox, terminal). */
async function interact(persona, name, scheme, act) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme })
  await ctx.addInitScript((s) => localStorage.setItem('pf:scheme', s), scheme)
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${PORT}/?persona=${persona}`, { waitUntil: 'load', timeout: 60_000 })
  await page.evaluate((s) => (document.documentElement.dataset.scheme = s), scheme)
  await page.addStyleTag({ content: hideChrome })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  await act(page)
  await page.waitForTimeout(1200)
  const file = resolve(out, `${name}.jpg`)
  await page.screenshot({ path: file, type: 'jpeg', quality: 82 })
  console.log('  ✓', file.replace(root, '.'))
  await ctx.close()
}

const only = (p) => personas.includes(p)

try {
  for (const p of personas) {
    console.log(`› ${p}`)
    const def = p === 'designer' || p === 'minimal' ? 'light' : 'dark'
    await shoot(p, { width: 1440, height: 900, scheme: 'dark', full: false, name: `${p}-dark` })
    await shoot(p, { width: 1440, height: 900, scheme: 'light', full: false, name: `${p}-light` })
    await shoot(p, { width: 1440, height: 900, scheme: def, full: true, name: `${p}-full` })
    await shoot(p, { width: 390, height: 844, scheme: def, full: false, name: `${p}-mobile` })
  }
  console.log('› interactions')
  if (only('developer')) {
    await interact('developer', 'feature-command-palette', 'dark', async (page) => {
      await page.keyboard.press('Control+k')
      await page.waitForTimeout(400)
      await page.keyboard.type('s')
    })
    await interact('developer', 'feature-project-dialog', 'dark', async (page) => {
      await page.locator('#work').scrollIntoViewIfNeeded()
      await page.waitForTimeout(800)
      await page.locator('.project-hit').first().click()
    })
    await interact('developer', 'feature-terminal', 'dark', async (page) => {
      await page.locator('#terminal').scrollIntoViewIfNeeded()
      await page.waitForTimeout(900)
      for (const cmd of ['whoami', 'projects', 'sudo']) {
        await page.locator('#term-input').fill(cmd)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(150)
      }
    })
  }
  if (only('photographer')) {
    await interact('photographer', 'feature-lightbox', 'dark', async (page) => {
      await page.locator('#gallery').scrollIntoViewIfNeeded()
      await page.waitForTimeout(1500)
      await page.locator('.gallery-item').nth(2).click()
      await page.waitForTimeout(1500)
    })
  }
} finally {
  await browser.close()
  server.kill()
}

#!/usr/bin/env node
/**
 * Deploy without GitHub Actions: build locally and push `dist/` to the `gh-pages` branch.
 * GitHub Pages must be set to "Deploy from a branch → gh-pages / (root)".
 *
 *   npm run deploy                 # pushes to the `origin` remote
 *   npm run deploy -- upstream     # or any other remote
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const remoteName = process.argv[2] ?? 'origin'
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: 'inherit' })
const out = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8' }).trim()

const remote = out('git', ['remote', 'get-url', remoteName])
const sha = out('git', ['rev-parse', '--short', 'HEAD'])

console.log(`\n▸ Building…`)
// npm is a .cmd shim on Windows, so it needs a shell; the command is a fixed string.
execFileSync('npm run build', { cwd: root, stdio: 'inherit', shell: true })

// Copy dist to a temp dir so the push never touches your working tree.
const tmp = mkdtempSync(join(tmpdir(), 'pf-deploy-'))
try {
  cpSync(join(root, 'dist'), tmp, { recursive: true })
  writeFileSync(join(tmp, '.nojekyll'), '') // serve files/folders starting with "_" as-is

  console.log(`\n▸ Pushing to ${remote} (gh-pages)…`)
  run('git', ['init', '-q', '-b', 'gh-pages'], tmp)
  run('git', ['add', '-A'], tmp)
  run('git', ['-c', 'core.safecrlf=false', 'commit', '-q', '-m', `deploy: ${sha}`], tmp)
  run('git', ['push', '-f', remote, 'gh-pages'], tmp)
  console.log('\n✓ Deployed. GitHub Pages usually updates within a minute.\n')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

#!/usr/bin/env node
/**
 * validate-all.js - run validate-page.js against every page under src/pages/
 * usage: node scripts/validate-all.js [dir]
 *   dir    (optional) scan target, defaults to src/pages
 *
 * For each directory containing a meta.json (i.e. a registered page),
 * delegates to scripts/validate-page.js and aggregates the results.
 * Exits with code 1 when any page has errors, so it can gate CI.
 */
import { spawnSync } from 'node:child_process'
import { readdirSync, existsSync, statSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

const ROOT = resolve(import.meta.dirname, '..')
const SCAN_DIR = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'src/pages')
const VALIDATOR = join(ROOT, 'scripts/validate-page.js')

if (!existsSync(SCAN_DIR)) {
  console.error(`${RED}[FAIL]${RESET} Scan directory does not exist: ${SCAN_DIR}`)
  process.exit(1)
}

/** recursively collect directories that contain a meta.json */
function findPageDirs(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === '_versions') continue
    const full = join(dir, name)
    if (!statSync(full).isDirectory()) continue
    if (existsSync(join(full, 'meta.json'))) {
      acc.push(full)
    } else {
      findPageDirs(full, acc)
    }
  }
  return acc
}

const pageDirs = findPageDirs(SCAN_DIR)

if (pageDirs.length === 0) {
  console.log(`${YELLOW}[WARN]${RESET} No pages found under ${relative(ROOT, SCAN_DIR)} (no meta.json)`)
  process.exit(0)
}

console.log(`${BOLD}${CYAN}Scanning ${pageDirs.length} page(s) under ${relative(ROOT, SCAN_DIR)}/${RESET}\n`)

let totalErrors = 0
let totalWarnings = 0
const failed = []

for (const dir of pageDirs) {
  const rel = relative(ROOT, dir)
  console.log(`${BOLD}── ${rel}${RESET}`)
  const result = spawnSync(process.execPath, [VALIDATOR, dir], { encoding: 'utf8' })
  const out = (result.stdout || '').trim()
  if (out) console.log(out.split('\n').map((l) => `  ${l}`).join('\n'))
  if (result.stderr) console.error(result.stderr)

  // parse summary line: "N errors, M warnings" (strip ANSI codes first)
  const plain = out.replace(/\x1b\[[0-9;]*m/g, '')
  const m = plain.match(/(\d+)\s+errors?,?\s*(\d+)\s+warnings?/)
  const errs = m ? parseInt(m[1], 10) : result.status !== 0 ? 1 : 0
  const warns = m ? parseInt(m[2], 10) : 0
  totalErrors += errs
  totalWarnings += warns
  if (errs > 0) failed.push(rel)
  console.log('')
}

console.log(`${'='.repeat(56)}`)
console.log(
  `${BOLD}Summary: ${totalErrors > 0 ? RED : GREEN}${totalErrors} errors${RESET}${BOLD}, ${totalWarnings > 0 ? YELLOW : GREEN}${totalWarnings} warnings${RESET}${BOLD} across ${pageDirs.length} page(s)${RESET}`
)
if (failed.length > 0) {
  console.log(`${RED}Failed pages:${RESET}`)
  for (const f of failed) console.log(`  - ${f}`)
  process.exit(1)
}
process.exit(0)

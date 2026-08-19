#!/usr/bin/env node
/**
 * validate-page.js - contract validator for prototype pages
 * usage: node scripts/validate-page.js <page-dir>
 * example: node scripts/validate-page.js src/pages/CRM/Dashboard
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

let errors = 0
let warnings = 0

function error(msg) {
  errors++
  console.log(`${RED}[FAIL]${RESET} ${msg}`)
}

function warn(msg) {
  warnings++
  console.log(`${YELLOW}[WARN]${RESET} ${msg}`)
}

function pass(msg) {
  console.log(`${GREEN}[PASS]${RESET} ${msg}`)
}

const pageDir = process.argv[2]
if (!pageDir) {
  console.log('Usage: node scripts/validate-page.js <page-dir>')
  console.log('Example: node scripts/validate-page.js src/pages/CRM/Dashboard')
  process.exit(1)
}

const absDir = resolve(pageDir)

// check 1: directory exists
if (!existsSync(absDir)) {
  error(`Directory does not exist: ${pageDir}`)
  process.exit(1)
}
pass(`Directory exists: ${pageDir}`)

// check 2: meta.json exists and has required fields
const metaPath = join(absDir, 'meta.json')
// meta 提升到外层作用域,供 check 5 判断 Figma 来源豁免
let meta = null
if (!existsSync(metaPath)) {
  error('meta.json is missing')
} else {
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
    if (!meta.title) error('meta.json: missing "title" field')
    else pass(`meta.json: title = "${meta.title}"`)
    if (!meta.module) error('meta.json: missing "module" field')
    else pass(`meta.json: module = "${meta.module}"`)
    if (meta.versions && meta.versions.length > 1) {
      if (!meta.defaultVersion) warn('meta.json: multi-version but no "defaultVersion"')
      pass(`meta.json: versions = ${meta.versions.join(', ')}`)
    }
  } catch (e) {
    error(`meta.json: invalid JSON - ${e.message}`)
  }
}

// check 3: entry file exists and has default export
const entryPath = join(absDir, 'index.tsx')
if (!existsSync(entryPath)) {
  error('index.tsx is missing')
} else {
  const entryContent = readFileSync(entryPath, 'utf-8')
  if (!/export\s+default/.test(entryContent)) {
    error('index.tsx: missing "export default" (must have default export)')
  } else {
    pass('index.tsx: has default export')
  }

  // check 4: no forbidden dependencies
  const forbidden = [
    { pattern: /from\s+['"]@mui\//, name: 'MUI / Material UI' },
    { pattern: /from\s+['"]antd['"]/, name: 'Ant Design' },
    { pattern: /from\s+['"]@emotion\//, name: 'Emotion' },
    { pattern: /from\s+['"]styled-components['"]/, name: 'styled-components' },
  ]
  for (const { pattern, name } of forbidden) {
    if (pattern.test(entryContent)) {
      error(`index.tsx: forbidden dependency "${name}" found`)
    }
  }

  // check 5: no inline styles
  // Figma 转码页面按 page-generator.md §4.0 保留 inline style(精确还原设计稿),声明 meta.source="figma" 时降级为 warn
  if (/style=\s*\{/.test(entryContent)) {
    if (meta && meta.source === 'figma') {
      warn('index.tsx: inline style attributes found (Figma-converted page, allowed by design - see page-generator.md 4.0)')
    } else {
      error('index.tsx: inline style attribute found (use Tailwind classes instead)')
    }
  } else {
    pass('index.tsx: no inline style attributes')
  }

  // check 6: no hardcoded colors (simple heuristic)
  const colorMatches = entryContent.match(/#[0-9a-fA-F]{3,8}/g) || []
  const suspiciousColors = colorMatches.filter(
    (c) => !c.startsWith('#0') && !c.startsWith('#fff') && !c.startsWith('#FFF')
  )
  if (suspiciousColors.length > 3) {
    warn(
      `index.tsx: ${suspiciousColors.length} hardcoded colors found, consider using design tokens`
    )
  } else {
    pass('index.tsx: color usage looks clean')
  }

  // check 7: comments no glob patterns
  if (/\/\*\*[^*]*\*\*\//s.test(entryContent)) {
    // check block comments for glob patterns
    const blockComments = entryContent.match(/\/\*[\s\S]*?\*\//g) || []
    for (const comment of blockComments) {
      if (comment.includes('**/') || comment.includes('*/**')) {
        error('index.tsx: glob pattern (**/) found in block comment (Vite oxc parser sensitive)')
      }
    }
    if (!blockComments.length) pass('index.tsx: no problematic block comments')
  }

  // check 8: comments no CJK punctuation
  const cjkPunct = /[、（）]/g
  if (cjkPunct.test(entryContent)) {
    warn('index.tsx: CJK punctuation found in comments (may cause oxc parse errors)')
  } else {
    pass('index.tsx: no CJK punctuation in comments')
  }
}

// check 9: PRD markdown exists
const prdPath = join(absDir, 'prd.md')
const prdV1Path = join(absDir, 'prd_v1.md')
const prdV2Path = join(absDir, 'prd_v2.md')
if (existsSync(prdPath)) {
  pass('prd.md exists')
} else if (existsSync(prdV1Path) && existsSync(prdV2Path)) {
  pass('multi-version PRD files exist (prd_v1.md + prd_v2.md)')
} else {
  warn('no PRD markdown file found (prd.md or prd_v1.md/prd_v2.md)')
}

// check 10: multi-version index.tsx re-exports default version
if (existsSync(prdV1Path) || existsSync(prdV2Path)) {
  const entryContent = readFileSync(entryPath, 'utf-8')
  if (!/_versions\//.test(entryContent)) {
    warn('multi-version page but index.tsx does not re-export from _versions/')
  } else {
    pass('multi-version: index.tsx re-exports from _versions/')
  }
}

// summary
console.log(`\n${'='.repeat(40)}`)
console.log(
  `${errors > 0 ? RED : GREEN}${errors} errors${RESET}, ${
    warnings > 0 ? YELLOW : GREEN
  }${warnings} warnings${RESET}`
)
if (errors > 0) {
  process.exit(1)
}
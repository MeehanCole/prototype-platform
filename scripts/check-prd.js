#!/usr/bin/env node
/**
 * check-prd.js — PRD ↔ 原型一致性检查
 *
 * 从页面 prd.md 里抽出「」包裹的界面文案 / 字段名，到该页面的 tsx 里查找；
 * 找不到的列出来（默认 warning，--strict 下视为失败）。
 *
 * usage:
 *   node scripts/check-prd.js src/pages/GTCB/InferenceService
 *   node scripts/check-prd.js src/pages/X --strict
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const pageDir = args.find((a) => !a.startsWith('--'))
if (!pageDir) {
  console.error('usage: node scripts/check-prd.js <page-dir> [--strict]')
  process.exit(1)
}
if (!existsSync(pageDir)) {
  console.error(`目录不存在: ${pageDir}`)
  process.exit(1)
}

// ── 读取 PRD ────────────────────────────────────────────────────────────────
const prdFile = ['prd.md', 'prd_v1.md', 'prd_v2.md']
  .map((f) => join(pageDir, f))
  .find((f) => existsSync(f))
if (!prdFile) {
  console.error('未找到 prd.md')
  process.exit(1)
}
const prd = readFileSync(prdFile, 'utf8')

// ── 读取页面源码（递归 tsx/ts）──────────────────────────────────────────────
function collectSources(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) collectSources(p, out)
    else if (/\.(tsx|ts)$/.test(name)) out.push(p)
  }
  return out
}
const sources = collectSources(pageDir)
const code = sources.map((f) => readFileSync(f, 'utf8')).join('\n')

// ── 抽取「」文案 ────────────────────────────────────────────────────────────
const phrases = new Map() // 归一化后 -> 原始
for (const m of prd.matchAll(/「([^」\n]{2,60})」/g)) {
  const raw = m[1].trim()
  if (!raw) continue
  // 跳过明显不是界面文案的（纯符号 / 纯占位）
  if (/^[-—–\s]+$/.test(raw)) continue
  const norm = raw.replace(/\s+/g, '')
  if (!phrases.has(norm)) phrases.set(norm, raw)
}

const normalize = (s) => s.replace(/\s+/g, '')
const codeNorm = normalize(code)

const missing = []
const found = []
for (const [norm, raw] of phrases) {
  if (codeNorm.includes(norm)) {
    found.push(raw)
    continue
  }
  // 模糊匹配：取前 8 个字，容忍后续文案微调
  const head = norm.slice(0, 8)
  if (head.length >= 4 && codeNorm.includes(head)) {
    found.push(raw)
    continue
  }
  missing.push(raw)
}

// ── 输出 ────────────────────────────────────────────────────────────────────
console.log(`${DIM}页面:${RESET} ${pageDir}`)
console.log(`${DIM}PRD:${RESET} ${prdFile}`)
console.log(`${DIM}源码:${RESET} ${sources.length} 个文件`)
console.log('')
console.log(`${GREEN}已落地 ${found.length} 条${RESET}　${missing.length ? `${YELLOW}疑似缺失 ${missing.length} 条${RESET}` : '无缺失'}`)

if (missing.length) {
  console.log('')
  console.log(`${YELLOW}以下文案/字段在 PRD 中出现、但页面代码里没找到（可能是描述性语句，人工确认）：${RESET}`)
  for (const m of missing) console.log(`  · ${m}`)
  console.log('')
  console.log(`${DIM}提示：确认是真的缺失就补到代码里；是描述性语句可忽略。${RESET}`)
}

process.exit(missing.length && strict ? 1 : 0)

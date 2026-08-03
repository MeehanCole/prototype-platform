/**
 * Local backend server - Express + fs
 * Provides /api/md (read/write markdown) and /api/anno (read/write annotations)
 */
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const pagesRoot = path.resolve(projectRoot, 'src', 'pages')

const app = express()
const PORT = 3019

app.use(express.json({ limit: '5mb' }))

/**
 * Security: resolve and validate path within src/pages
 * Prevents path traversal attacks
 */
function resolveSafePath(relPath) {
  if (!relPath || typeof relPath !== 'string') return null
  const resolved = path.resolve(pagesRoot, relPath)
  // ensure the resolved path is under pagesRoot
  if (!resolved.startsWith(pagesRoot + path.sep) && resolved !== pagesRoot) {
    return null
  }
  return resolved
}

/**
 * GET /api/md?path=CRM/Login/prd_v2.md
 * Returns: { content: string }
 */
app.get('/api/md', async (req, res) => {
  const safePath = resolveSafePath(req.query.path)
  if (!safePath) return res.status(400).json({ error: 'invalid path' })

  try {
    const content = await readFile(safePath, 'utf-8')
    res.json({ content })
  } catch (err) {
    if (err.code === 'ENOENT') return res.json({ content: '' })
    res.status(500).json({ error: 'read failed' })
  }
})

/**
 * PUT /api/md
 * Body: { path: string, content: string }
 */
app.put('/api/md', async (req, res) => {
  const { path: relPath, content } = req.body
  const safePath = resolveSafePath(relPath)
  if (!safePath) return res.status(400).json({ error: 'invalid path' })

  try {
    // ensure parent dir exists
    const dir = path.dirname(safePath)
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    await writeFile(safePath, content, 'utf-8')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'write failed' })
  }
})

/**
 * GET /api/anno?path=CRM/Login/.annotations_v2.json
 * Returns: { data: AnnotationData | null }
 */
app.get('/api/anno', async (req, res) => {
  const safePath = resolveSafePath(req.query.path)
  if (!safePath) return res.status(400).json({ error: 'invalid path' })

  try {
    const raw = await readFile(safePath, 'utf-8')
    res.json({ data: JSON.parse(raw) })
  } catch (err) {
    if (err.code === 'ENOENT') return res.json({ data: null })
    res.status(500).json({ error: 'read failed' })
  }
})

/**
 * PUT /api/anno
 * Body: { path: string, data: AnnotationData }
 */
app.put('/api/anno', async (req, res) => {
  const { path: relPath, data } = req.body
  const safePath = resolveSafePath(relPath)
  if (!safePath) return res.status(400).json({ error: 'invalid path' })

  try {
    const dir = path.dirname(safePath)
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    await writeFile(safePath, JSON.stringify(data, null, 2), 'utf-8')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'write failed' })
  }
})

/**
 * GET /api/gitlog?path=CRM/Login
 * Returns: { data: Array<{ hash, author, date, message }> }
 * Reads git log for the given subdirectory
 */
app.get('/api/gitlog', async (req, res) => {
  const relPath = req.query.path
  if (!relPath || typeof relPath !== 'string') {
    return res.status(400).json({ error: 'invalid path' })
  }

  // security: only allow alphanumeric, slash, dash, underscore
  if (!/^[a-zA-Z0-9\/\-_]+$/.test(relPath)) {
    return res.status(400).json({ error: 'invalid path' })
  }

  const absPath = path.resolve(pagesRoot, relPath)
  if (!absPath.startsWith(pagesRoot + path.sep) && absPath !== pagesRoot) {
    return res.status(400).json({ error: 'invalid path' })
  }

  // git log with custom format: hash|author|date|message
  const gitCmd = `git log --pretty=format:"%H|%an|%ad|%s" --date=short -- "${relPath}"`

  exec(gitCmd, { cwd: projectRoot, maxBuffer: 1024 * 1024 }, (err, stdout) => {
    if (err) {
      // not a git repo or no commits - return empty
      return res.json({ data: [] })
    }

    const commits = stdout
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [hash, author, date, ...msgParts] = line.split('|')
        return {
          hash: hash || '',
          author: author || '',
          date: date || '',
          message: msgParts.join('|') || '',
        }
      })

    res.json({ data: commits })
  })
})

app.listen(PORT, () => {
  console.log(`[server] running at http://localhost:${PORT}`)
  console.log(`[server] pages root: ${pagesRoot}`)
})

/**
 * API client - communicate with local Express backend
 */

/** Read markdown content from file */
export async function readMarkdown(relPath: string): Promise<string> {
  const res = await fetch(`/api/md?path=${encodeURIComponent(relPath)}`)
  const data = await res.json()
  return data.content || ''
}

/** Write markdown content to file */
export async function writeMarkdown(relPath: string, content: string): Promise<boolean> {
  const res = await fetch('/api/md', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: relPath, content }),
  })
  const data = await res.json()
  return data.ok === true
}

/** Read annotations from file */
export async function readAnnotations(relPath: string): Promise<AnnotationData | null> {
  const res = await fetch(`/api/anno?path=${encodeURIComponent(relPath)}`)
  const data = await res.json()
  return data.data
}

/** Write annotations to file */
export async function writeAnnotations(relPath: string, data: AnnotationData): Promise<boolean> {
  const res = await fetch('/api/anno', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: relPath, data }),
  })
  const result = await res.json()
  return result.ok === true
}

/** Annotation data structure */
export interface AnnotationData {
  annotations: Annotation[]
}

export interface Annotation {
  id: string
  /** anchored text snippet */
  anchorText: string
  /** author name */
  author: string
  /** comment content */
  comment: string
  /** creation timestamp (ISO string) */
  createdAt: string
}

/** Git commit info */
export interface GitCommit {
  hash: string
  author: string
  date: string
  message: string
}

/** Read git log for a page directory */
export async function readGitLog(relPath: string): Promise<GitCommit[]> {
  const res = await fetch(`/api/gitlog?path=${encodeURIComponent(relPath)}`)
  const data = await res.json()
  return data.data || []
}

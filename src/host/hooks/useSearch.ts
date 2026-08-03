/**
 * useSearch - global search hook powered by fuse.js
 * searches across page title, module, tags, and PRD content
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import Fuse from 'fuse.js'
import { pageRegistry, type PageEntry } from '@/host/router/pageRegistry'

interface SearchDoc {
  path: string
  title: string
  module: string
  tags: string[]
  /** flattened PRD content for search */
  prdContent: string
}

interface SearchResult {
  item: PageEntry
  matches: Array<{
    field: string
    snippet: string
  }>
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // build search index from page registry
  const fuse = useMemo(() => {
    const docs: SearchDoc[] = pageRegistry.map((p) => ({
      path: p.path,
      title: p.meta.title,
      module: p.meta.module,
      tags: p.meta.tags || [],
      prdContent: Object.values(p.prdContents).join('\n'),
    }))

    return new Fuse(docs, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'module', weight: 0.2 },
        { name: 'tags', weight: 0.2 },
        { name: 'prdContent', weight: 0.2 },
      ],
      threshold: 0.3,
      includeMatches: true,
      minMatchCharLength: 2,
    })
  }, [])

  // debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      const fuseResults = fuse.search(query.trim())
      const mapped: SearchResult[] = fuseResults.map((r) => {
        const page = pageRegistry.find((p) => p.path === r.item.path)!
        const matches = (r.matches || []).map((m) => ({
          field: m.key || '',
          snippet: extractSnippet(m.value as string, m.indices || []),
        }))
        return { item: page, matches }
      })
      setResults(mapped)
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fuse])

  return { query, setQuery, results, isOpen, setIsOpen }
}

/** extract a snippet around matched indices */
function extractSnippet(value: string, indices: Array<[number, number]>): string {
  if (!indices.length || !value) return ''
  const [start, end] = indices[0]
  const contextStart = Math.max(0, start - 20)
  const contextEnd = Math.min(value.length, end + 20)
  const prefix = contextStart > 0 ? '...' : ''
  const suffix = contextEnd < value.length ? '...' : ''
  const snippet = value.slice(contextStart, contextEnd).replace(/\n/g, ' ')
  return prefix + snippet + suffix
}

/**
 * SearchPanel - global search dropdown
 * triggered from top bar input, shows matching pages + snippets
 */
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '@/host/hooks/useSearch'

interface SearchPanelProps {
  open: boolean
  onClose: () => void
}

export function SearchPanel({ open, onClose }: SearchPanelProps) {
  const navigate = useNavigate()
  const { query, setQuery, results } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  // focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [open, setQuery])

  // close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSelect = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-30 bg-black/30"
      onClick={onClose}
    >
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] max-w-[90vw] rounded-lg bg-background border border-border shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* search input */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="text-muted-foreground text-sm">搜索</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索页面标题、模块、PRD 内容..."
            className="flex-1 text-sm bg-transparent focus:outline-none"
          />
          <kbd className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              未找到匹配的页面
            </div>
          )}

          {!query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              输入关键词搜索页面、PRD 文档
            </div>
          )}

          {results.map(({ item, matches }) => (
            <button
              key={item.path}
              onClick={() => handleSelect(item.path)}
              className="w-full text-left px-4 py-3 hover:bg-accent border-b border-border last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {item.meta.module}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {item.meta.title}
                  </span>
                </div>
                {item.meta.versions && item.meta.versions.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    {item.meta.versions.join(' / ')}
                  </span>
                )}
              </div>
              {matches.length > 0 && (
                <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {matches[0].snippet}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Timeline - git log timeline drawer
 * shows commit history for current page directory
 */
import { useEffect, useState } from 'react'
import { readGitLog, type GitCommit } from '@/host/api'

interface TimelineProps {
  open: boolean
  onClose: () => void
  /** relative path to page dir, e.g. CRM/Login */
  relPath: string
}

export function Timeline({ open, onClose, relPath }: TimelineProps) {
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    readGitLog(relPath)
      .then((data) => setCommits(data))
      .finally(() => setLoading(false))
  }, [open, relPath])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 bg-black/30" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-96 max-w-[90vw] bg-background border-l border-border shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">更新日志</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-sm text-muted-foreground text-center py-8">加载中...</div>
          ) : commits.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              暂无提交记录
              <div className="mt-2 text-xs">
                (需在 git 仓库中提交过该目录的文件)
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

              <div className="space-y-4">
                {commits.map((commit) => (
                  <div key={commit.hash} className="relative pl-8">
                    {/* dot */}
                    <div className="absolute left-1 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-sm text-foreground">{commit.message}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{commit.author}</span>
                        <span>·</span>
                        <span>{commit.date}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground font-mono">
                        {commit.hash.slice(0, 7)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

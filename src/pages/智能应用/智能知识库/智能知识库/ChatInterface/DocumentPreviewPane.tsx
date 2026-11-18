import { useEffect, useRef } from 'react'
import { ChevronLeft, Crosshair, FileText, X } from 'lucide-react'
import { getDocumentPreview, type RetrievalCitation } from './knowledgeRag'

export function DocumentPreviewPane({
  items,
  activeId,
  leftOffset,
  rightOffset,
  onSelect,
  onClose,
}: {
  items: RetrievalCitation[]
  activeId?: string
  leftOffset: number
  rightOffset: number
  onSelect: (id: string | undefined) => void
  onClose: () => void
}) {
  const activeCitation = activeId ? items.find((c) => c.id === activeId) : undefined
  const highlightRef = useRef<HTMLSpanElement>(null)

  const scrollToHighlight = () => {
    highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  useEffect(() => {
    if (!activeCitation) return
    const timer = window.setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [activeCitation])

  const preview = activeCitation ? getDocumentPreview(activeCitation) : null
  let firstHighlightBound = false

  return (
    <aside
      aria-label="引用文档预览"
      style={{ left: leftOffset, right: rightOffset }}
      className="fixed inset-y-0 z-10 flex flex-col overflow-hidden border-l border-[#E5E8EE] bg-white text-[#1F2329] shadow-[-8px_0_24px_rgba(16,24,40,0.08)]"
    >
      {/* 顶部栏 */}
      <div className="flex h-[44px] shrink-0 items-center justify-between border-b border-[#EDEFF3] px-4">
        {activeCitation ? (
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[13px] font-medium text-[#4E5969] transition-colors hover:bg-[#F5F7FA] hover:text-[#1F2329]"
          >
            <ChevronLeft className="h-[15px] w-[15px]" />
            <span>全部引用 · {items.length}</span>
          </button>
        ) : (
          <span className="px-1.5 text-[13px] font-medium text-[#1F2329]">
            全部引用 · {items.length}
          </span>
        )}

        <button
          type="button"
          onClick={onClose}
          title="关闭文档预览"
          aria-label="关闭文档预览"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#8A9099] transition-colors hover:bg-[#F5F6F8] hover:text-[#1F2329]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {activeCitation && preview ? (
        <>
          {/* 文档信息条 */}
          <div className="flex items-center justify-between gap-3 border-b border-[#EDEFF3] bg-[#FAFBFD] px-5 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#ECF5FF] text-[#409EFF]">
                <FileText className="h-[17px] w-[17px]" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-[#1F2329]">
                  {activeCitation.docName}
                </div>
                <div className="truncate text-[11px] text-[#8A9099]">
                  已高亮检出的原文片段 · {activeCitation.kbName} · 匹配度{' '}
                  {(activeCitation.score * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToHighlight}
              title="定位到高亮片段"
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#E5E8EE] bg-white px-2.5 py-1 text-[12px] text-[#4E5969] transition-colors hover:border-[#C9D2E0] hover:text-[#1F2329]"
            >
              <Crosshair className="h-[13px] w-[13px]" />
              <span>定位高亮</span>
            </button>
          </div>

          {/* 文档阅读画布（灰底 + 居中白纸） */}
          <div className="flex-1 overflow-y-auto bg-[#5E6268] px-6 py-6">
            <article className="mx-auto min-h-full max-w-[680px] rounded-[2px] bg-white px-10 py-10 shadow-[0_6px_24px_rgba(0,0,0,0.22)]">
              <div className="border-b border-[#E5E8EE] pb-4 text-center">
                <h2 className="text-[19px] font-semibold text-[#1F2329]">
                  {preview.title}
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                {preview.blocks.map((block, idx) => {
                  if (block.type === 'h2') {
                    return (
                      <h3
                        key={idx}
                        className="pt-2 text-[14.5px] font-semibold text-[#1F2329]"
                      >
                        {block.text}
                      </h3>
                    )
                  }
                  if (block.type === 'code') {
                    return (
                      <pre
                        key={idx}
                        className="overflow-x-auto rounded-[6px] border border-[#E5E8EE] bg-[#F7F8FA] px-3.5 py-2.5 font-mono text-[11.5px] leading-[1.6] text-[#303540]"
                      >
                        {block.text}
                      </pre>
                    )
                  }
                  const attachRef = Boolean(block.highlight && !firstHighlightBound)
                  if (attachRef) firstHighlightBound = true
                  return (
                    <p
                      key={idx}
                      className="text-[13px] leading-[1.8] text-[#303540]"
                    >
                      {block.highlight ? (
                        <span
                          ref={attachRef ? highlightRef : undefined}
                          className="rounded-[2px] bg-[#FEF08A] px-1 py-[1px] text-[#1F2329]"
                        >
                          {block.text}
                        </span>
                      ) : (
                        block.text
                      )}
                    </p>
                  )
                })}
              </div>
            </article>
          </div>
        </>
      ) : (
        /* 全部引用列表视图 */
        <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7F8FA] p-5">
          {items.map((cit, index) => (
            <button
              key={cit.id}
              type="button"
              onClick={() => onSelect(cit.id)}
              className="block w-full rounded-[10px] border border-[#E5E8EE] bg-white p-4 text-left transition-all hover:border-[#409EFF] hover:shadow-[0_2px_10px_rgba(64,158,255,0.08)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-[13.5px] font-medium text-[#1F2329]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#F3F5F8] text-[11px] font-semibold text-[#606266]">
                    {index + 1}
                  </span>
                  <FileText className="h-[14px] w-[14px] shrink-0 text-[#409EFF]" />
                  <span className="truncate">{cit.docName}</span>
                </span>
                <span className="shrink-0 rounded bg-[#ECF5FF] px-2 py-0.5 text-[11px] font-medium text-[#409EFF]">
                  匹配度 {(cit.score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-1.5 pl-7 text-[11.5px] text-[#8A9099]">
                {cit.kbName} · {cit.heading}
              </div>
              <p className="mt-2 line-clamp-2 pl-7 text-[12.5px] leading-[1.65] text-[#4E5969]">
                {cit.snippet}
              </p>
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}

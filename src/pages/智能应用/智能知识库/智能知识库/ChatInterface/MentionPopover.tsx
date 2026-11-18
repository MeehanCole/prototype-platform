import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, FileText, Folder, Search } from 'lucide-react'
import { MENTION_FILES, MENTION_KBS, type MentionTarget } from './knowledgeRag'

type Category = 'root' | 'kb' | 'file'

export function MentionPopover({
  selected,
  onToggle,
  onClose,
}: {
  selected: MentionTarget[]
  onToggle: (item: MentionTarget) => void
  onClose: () => void
}) {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<Category>('root')

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected])
  const trimmed = keyword.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (!trimmed) return []
    return [...MENTION_KBS, ...MENTION_FILES].filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        item.kbName?.toLowerCase().includes(trimmed),
    )
  }, [trimmed])

  const listItems = category === 'kb' ? MENTION_KBS : MENTION_FILES

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="引用知识库或文件"
        className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-[300px] overflow-hidden rounded-[12px] border border-[#E5E8EE] bg-white shadow-[0_8px_28px_rgba(16,24,40,0.12)]"
      >
        {/* 搜索框 */}
        <div className="flex items-center gap-2 border-b border-[#F0F2F5] px-3 py-2.5">
          <Search className="h-[14px] w-[14px] shrink-0 text-[#9AA0AA]" />
          <input
            autoFocus
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索知识库、文件等"
            className="w-full bg-transparent text-[13px] text-[#1F2329] outline-none placeholder:text-[#B3B8C2]"
          />
        </div>

        <div className="max-h-[260px] overflow-y-auto p-1.5">
          {trimmed ? (
            searchResults.length > 0 ? (
              searchResults.map((item) => (
                <MentionRow
                  key={item.id}
                  item={item}
                  checked={selectedIds.has(item.id)}
                  onClick={() => onToggle(item)}
                />
              ))
            ) : (
              <div className="py-6 text-center text-[12px] text-[#9AA0AA]">
                未找到匹配的「{keyword}」
              </div>
            )
          ) : category === 'root' ? (
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setCategory('kb')}
                className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-[#F5F7FA]"
              >
                <span className="flex items-center gap-2 text-[13px] text-[#1F2329]">
                  <Folder className="h-[15px] w-[15px] text-[#34A853]" strokeWidth={1.8} />
                  知识库
                </span>
                <span className="flex items-center gap-1 text-[12px] text-[#9AA0AA]">
                  {MENTION_KBS.length}
                  <ChevronRight className="h-[14px] w-[14px]" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('file')}
                className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-[#F5F7FA]"
              >
                <span className="flex items-center gap-2 text-[13px] text-[#1F2329]">
                  <FileText className="h-[15px] w-[15px] text-[#8A9099]" strokeWidth={1.8} />
                  文件
                </span>
                <span className="flex items-center gap-1 text-[12px] text-[#9AA0AA]">
                  {MENTION_FILES.length}
                  <ChevronRight className="h-[14px] w-[14px]" />
                </span>
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setCategory('root')}
                className="mb-1 flex w-full items-center gap-1 rounded-[6px] px-2 py-1 text-[12px] text-[#606266] hover:bg-[#F5F7FA]"
              >
                <ChevronLeft className="h-[13px] w-[13px]" />
                {category === 'kb' ? '知识库' : '文件'}
              </button>
              <div className="space-y-0.5">
                {listItems.map((item) => (
                  <MentionRow
                    key={item.id}
                    item={item}
                    checked={selectedIds.has(item.id)}
                    onClick={() => onToggle(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function MentionRow({
  item,
  checked,
  onClick,
}: {
  item: MentionTarget
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-2 text-left transition-colors ${
        checked ? 'bg-[#ECF5FF]/70 text-[#1F2329]' : 'hover:bg-[#F5F7FA]'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {item.kind === 'kb' ? (
          <Folder className="h-[14px] w-[14px] shrink-0 text-[#34A853]" strokeWidth={1.8} />
        ) : (
          <FileText className="h-[14px] w-[14px] shrink-0 text-[#8A9099]" strokeWidth={1.8} />
        )}
        <span className="truncate text-[13px] text-[#1F2329]">{item.name}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-[#9AA0AA]">
        {item.kind === 'kb' ? `${item.docsCount ?? 0} 篇` : item.kbName}
        {checked && <Check className="h-[13px] w-[13px] text-[#409EFF]" strokeWidth={2.2} />}
      </span>
    </button>
  )
}

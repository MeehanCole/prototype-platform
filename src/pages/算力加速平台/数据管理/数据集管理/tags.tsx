/**
 * 数据集「标签」的展示与选择组件
 *
 * 平台不对数据集内容做类型约束，标签只是使用方留下的检索提示：
 *   - 选填，最多 3 个，单个不超过 8 个字符；
 *   - 预置常用标签，也允许自由输入；
 *   - 不参与任何导入校验，也不影响容器挂载。
 */
import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { MAX_TAGS, PRESET_TAGS, TAG_MAX_LENGTH } from './mock'

/** 列表/详情页的只读标签；无标签时展示占位「-」 */
export function TagChips({ tags, max = 3 }: { tags?: string[]; max?: number }) {
  const list = tags ?? []
  if (list.length === 0) return <span className="text-[13px] text-[#a7acb3]">-</span>
  const shown = list.slice(0, max)
  const rest = list.length - shown.length
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1">
      {shown.map((tag) => (
        <span
          key={tag}
          className="inline-flex max-w-full items-center truncate rounded-[2px] border border-[#d6e4ff] bg-[#f2f7ff] px-1.5 text-[12px] leading-5 text-[#166eff]"
        >
          {tag}
        </span>
      ))}
      {rest > 0 && <span className="text-[12px] text-[#86909c]">+{rest}</span>}
    </span>
  )
}

/**
 * 数据集标签选择器
 *
 * 输入框回车或点击「添加」即新增自定义标签；点预置标签可快速增删。
 */
export function TagPicker({
  value,
  onChange,
  widthClass,
}: {
  value: string[]
  onChange: (next: string[]) => void
  widthClass: string
}) {
  const [draft, setDraft] = useState('')
  const full = value.length >= MAX_TAGS

  function toggle(tag: string) {
    if (value.includes(tag)) {
      onChange(value.filter((item) => item !== tag))
      return
    }
    if (full) return
    onChange([...value, tag])
  }

  function addDraft() {
    const tag = draft.trim().slice(0, TAG_MAX_LENGTH)
    if (!tag || full || value.includes(tag)) {
      setDraft('')
      return
    }
    onChange([...value, tag])
    setDraft('')
  }

  return (
    <div className={`${widthClass} shrink-0`}>
      {/* 已选标签 + 输入框 */}
      <div className="flex min-h-[34px] flex-wrap items-center gap-1.5 rounded-[4px] border border-[#e5e6eb] bg-white px-2 py-1 focus-within:border-[#1890ff]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-[2px] border border-[#d6e4ff] bg-[#f2f7ff] px-1.5 text-[12px] leading-5 text-[#166eff]"
          >
            {tag}
            <button
              type="button"
              aria-label={`移除标签 ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="text-[#7aa7ff] transition-colors hover:text-[#166eff]"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        {!full && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, TAG_MAX_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addDraft()
              }
            }}
            placeholder={value.length === 0 ? '选择或输入标签，回车添加' : '继续添加'}
            className="h-6 min-w-[120px] flex-1 bg-transparent text-[13px] text-[#1d2129] outline-none placeholder:text-[#c9cdd4]"
          />
        )}
        {draft.trim() && !full && (
          <button
            type="button"
            onClick={addDraft}
            className="flex shrink-0 items-center gap-0.5 rounded-[2px] px-1 text-[12px] text-[#166eff] hover:bg-[#f2f7ff]"
          >
            <Plus size={11} />
            添加
          </button>
        )}
      </div>

      {/* 预置标签快选 */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {PRESET_TAGS.map((tag) => {
          const selected = value.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              disabled={!selected && full}
              aria-pressed={selected}
              className={`inline-flex items-center gap-1 rounded-[2px] border px-2 text-[12px] leading-6 transition-colors ${
                selected
                  ? 'border-[#166eff] bg-[#f2f7ff] text-[#166eff]'
                  : 'border-[#e5e6eb] bg-white text-[#4e5969] hover:border-[#166eff] hover:text-[#166eff] disabled:cursor-not-allowed disabled:border-[#f0f0f0] disabled:text-[#c9cdd4] disabled:hover:border-[#f0f0f0] disabled:hover:text-[#c9cdd4]'
              }`}
            >
              {selected && <Check size={11} />}
              {tag}
            </button>
          )
        })}
        <span className="ml-1 text-[12px] leading-[18px] text-[#a7acb3]">
          选填，最多 {MAX_TAGS} 个；仅用于检索与归类，不限制文件类型，也不影响容器挂载
        </span>
      </div>
    </div>
  )
}

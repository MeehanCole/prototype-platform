/**
 * 功能点批注（通用件）
 *
 * 每个页面只需提供 FEATURES 配置，其余（Context / NewTag / DocPanel / PRD 抽取）由此复用。
 * 规范见 .skills/agent-rules.md D3，模板见 .skills/templates.md §10。
 *
 * ⚠️ 视觉规范固定（templates.md §10.7）：16/18px 高、3px 圆角、主题色实心、白字「说明」、无图标。
 *    页面不得复制本组件或改写样式；需要调整请改本文件并同步文档。
 *
 * 主题色：通过 CSS 变量 --feat-accent 注入，默认 #1668ff（GTCB 蓝）；
 * AIOps 等应用可在 DocProvider 上传 accent 覆盖，无需改组件。
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface FeatureDoc {
  type: '新增' | '变更'
  title: string
  /** 改了什么（2~4 条） */
  changes: string[]
  /** 本次新引入的校验：规则 + 用户可见提示 */
  rules?: { rule: string; message?: string }[]
  /** 生效条件 / 范围 */
  scope?: string
  /** PRD 定位，如「PRD 4.2.1」 */
  prdRef?: string
  /** PRD 原文摘录 */
  doc?: string
}

export type FeatureMap = Record<string, FeatureDoc>

/** 从 PRD 原文抽取片段（起点行 → 终点行；未命中终点时按下一个加粗行或标题行截断） */
export function pick(raw: string, startMarker: string, endMarker?: string): string {
  const lines = raw.split('\n')
  let start = -1
  let end = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (start === -1) {
      if (lines[i].includes(startMarker)) start = i
      continue
    }
    if (endMarker && lines[i].includes(endMarker)) {
      end = i
      break
    }
  }
  if (start !== -1 && end === lines.length) {
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i].startsWith('**') || lines[i].startsWith('##')) {
        end = i
        break
      }
    }
  }
  if (start === -1) return ''
  return lines.slice(start, end).join('\n').trim()
}

// ─── Context ────────────────────────────────────────────────────────────────

interface DocContextValue {
  showFeat: boolean
  features: FeatureMap
  openDoc: (code: string) => void
}

const DocContext = createContext<DocContextValue>({
  showFeat: false,
  features: {},
  openDoc: () => {},
})

export function DocProvider({
  showFeat,
  features,
  onOpenDoc,
  accent,
  children,
}: {
  showFeat: boolean
  features: FeatureMap
  onOpenDoc: (code: string) => void
  /** 主题色，默认 #1668ff */
  accent?: string
  children: ReactNode
}) {
  const inner = (
    <DocContext.Provider value={{ showFeat, features, openDoc: onOpenDoc }}>
      {children}
    </DocContext.Provider>
  )
  if (!accent) return inner
  return (
    <div style={{ display: 'contents', ['--feat-accent' as string]: accent } as CSSProperties}>
      {inner}
    </div>
  )
}

const ACCENT = 'var(--feat-accent, #1668ff)'

// ─── FeatureBadge：唯一视觉实现（所有批注标记都必须复用它）─────────────────

export function FeatureBadge({
  type,
  label,
  lines,
  onClick,
  compact = false,
}: {
  type: '新增' | '变更'
  label: string
  lines?: string[]
  onClick?: () => void
  compact?: boolean
}) {
  const hostRef = useRef<HTMLButtonElement | null>(null)
  const [tip, setTip] = useState<{ top: number; left: number; above: boolean; show: boolean }>({
    top: 0,
    left: 0,
    above: true,
    show: false,
  })

  const showTip = () => {
    const el = hostRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const TIP_W = 260
    const above = r.top > 140
    let left = r.left + r.width / 2 - TIP_W / 2
    if (left < 8) left = 8
    const vw = window.innerWidth
    if (left + TIP_W > vw - 8) left = vw - 8 - TIP_W
    setTip({ top: above ? r.top - 6 : r.bottom + 6, left, above, show: true })
  }

  return (
    <>
      <button
        ref={hostRef}
        type="button"
        onMouseEnter={showTip}
        onMouseLeave={() => setTip((p) => ({ ...p, show: false }))}
        onFocus={showTip}
        onBlur={() => setTip((p) => ({ ...p, show: false }))}
        onClick={
          onClick
            ? (e) => {
                e.stopPropagation()
                onClick()
              }
            : undefined
        }
        title={`本次${type}：${label}`}
        style={{ background: ACCENT, borderColor: ACCENT }}
        className={
          compact
            ? 'inline-flex h-[16px] shrink-0 items-center justify-center rounded-[3px] border px-1 text-[9px] font-medium leading-none text-white shadow-sm transition-transform hover:scale-105 cursor-pointer'
            : 'inline-flex h-[18px] items-center gap-1 rounded-[3px] border px-1.5 text-[10px] font-semibold leading-none text-white shadow-sm transition-transform hover:scale-[1.03] cursor-pointer'
        }
      >
        {compact ? (
          '说明'
        ) : (
          <>
            <span className="text-[9px] font-medium opacity-80">{type}</span>
            <span className="h-2 w-px bg-white/40" />
            <span>说明</span>
          </>
        )}
      </button>

      {tip.show &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: tip.top,
              left: tip.left,
              zIndex: 99999,
              transform: tip.above ? 'translateY(-100%)' : 'translateY(0)',
            }}
            className="pointer-events-none w-[260px] rounded-md bg-[#1f2329] px-3 py-2 text-[11px] leading-snug text-white shadow-xl"
          >
            <span className="mb-1 flex items-center gap-1.5">
              <span className="rounded-[2px] bg-white/15 px-1 py-px text-[9px] font-medium text-white/90">
                {type}
              </span>
              <span className="font-semibold">{label}</span>
            </span>
            {lines && lines.length > 0 && (
              <ul className="list-disc space-y-0.5 pl-3.5 text-white/85">
                {lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
            <span className="mt-1 block text-[10px] text-white/50">点击查看详细说明</span>
          </div>,
          document.body,
        )}
    </>
  )
}

// ─── NewTag：从 Context 取配置，渲染 FeatureBadge ─────────────────────────────


export function NewTag({ code, compact = false }: { code: string; compact?: boolean }) {
  const { openDoc, showFeat, features } = useContext(DocContext)
  const f = features[code]
  if (!showFeat || !f) return null
  return (
    <FeatureBadge
      type={f.type}
      label={f.title}
      lines={[
        ...f.changes,
        ...(f.rules?.length ? [`含 ${f.rules.length} 条校验规则`] : []),
      ]}
      compact={compact}
      onClick={() => openDoc(code)}
    />
  )
}

// ─── DocPanel ──────────────────────────────────────────────────────────────

export function DocPanel({ code, onClose }: { code: string | null; onClose: () => void }) {
  const { features } = useContext(DocContext)

  useEffect(() => {
    if (!code) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [code, onClose])

  if (!code) return null
  const f = features[code]
  if (!f) return null

  return createPortal(
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="absolute right-0 top-0 flex h-full w-[520px] max-w-[92vw] flex-col border-l border-[#e5e6eb] bg-white shadow-2xl"
        style={{ color: '#1f2329' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-[#e5e6eb] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  color: ACCENT,
                  background: `color-mix(in srgb, ${ACCENT} 10%, white)`,
                }}
                className="rounded-[2px] px-1.5 py-0.5 text-[11px] font-semibold"
              >
                {code}
              </span>
              <span className="text-[11px] text-[#8f959e]">{f.type}</span>
            </div>
            <h3 className="mt-1 text-[14px] font-semibold text-[#1f2329]">{f.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] text-[#8f959e] hover:bg-[#f7f8fa] hover:text-[#1f2329]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4">
            <div className="mb-1.5 text-[11px] font-medium text-[#8f959e]">本次改动</div>
            <ul className="list-disc space-y-1 pl-4 text-[12px] leading-5 text-[#1f2329]">
              {f.changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          {f.rules && f.rules.length > 0 && (
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] font-medium text-[#8f959e]">校验规则</div>
              <div className="overflow-hidden rounded-[2px] border border-[#e5e6eb]">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#f7f8fa] text-[#8f959e]">
                      <th className="w-[46%] border-b border-[#e5e6eb] px-2 py-1.5 text-left font-normal">
                        规则
                      </th>
                      <th className="border-b border-[#e5e6eb] px-2 py-1.5 text-left font-normal">
                        触发时提示
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.rules.map((r) => (
                      <tr key={r.rule} className="align-top">
                        <td className="border-b border-[#f0f1f3] px-2 py-1.5 text-[#1f2329]">{r.rule}</td>
                        <td className="border-b border-[#f0f1f3] px-2 py-1.5 text-[#646a73]">
                          {r.message ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {f.scope && (
            <div className="mb-4 rounded-[2px] bg-[#f7f8fa] px-3 py-2">
              <span className="text-[11px] font-medium text-[#8f959e]">生效条件　</span>
              <span className="text-[12px] text-[#1f2329]">{f.scope}</span>
            </div>
          )}

          {f.doc && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-[#8f959e]">
                <span className="font-medium">PRD 原文</span>
                {f.prdRef && (
                  <span
                    style={{
                      color: ACCENT,
                      background: `color-mix(in srgb, ${ACCENT} 8%, white)`,
                    }}
                    className="rounded-[2px] px-1 py-px text-[10px]"
                  >
                    {f.prdRef}
                  </span>
                )}
              </div>
              <div className="rounded-[2px] border border-[#e5e6eb] px-3 py-2 text-[12px] leading-6 text-[#1f2329]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children }) => <h2 className="mt-2 mb-1 text-[13px] font-semibold">{children}</h2>,
                    h3: ({ children }) => <h3 className="mt-2 mb-1 text-[13px] font-semibold">{children}</h3>,
                    h4: ({ children }) => <h4 className="mt-2 mb-1 text-[12px] font-semibold">{children}</h4>,
                    p: ({ children }) => <p className="my-1">{children}</p>,
                    ul: ({ children }) => <ul className="my-1 list-disc pl-4">{children}</ul>,
                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                    table: ({ children }) => (
                      <table className="my-1.5 w-full border-collapse text-[11px]">{children}</table>
                    ),
                    th: ({ children }) => (
                      <th className="border border-[#e5e6eb] bg-[#f7f8fa] px-2 py-1 text-left font-medium">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-[#e5e6eb] px-2 py-1 align-top">{children}</td>
                    ),
                    code: ({ children }) => (
                      <code className="rounded-[2px] bg-[#f7f8fa] px-1 py-0.5 font-mono text-[11px]">
                        {children}
                      </code>
                    ),
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  }}
                >
                  {f.doc}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

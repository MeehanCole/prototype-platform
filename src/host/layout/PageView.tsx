/**
 * PageView - right content area with Tab dual view (prototype + PRD)
 * supports multi-version switching (Select) and read-only PRD view
 *
 * 纯前端架构：PRD 内容通过 Vite `?raw` 在 pageRegistry 中加载（见 router/pageRegistry.ts），
 * 不再依赖 Express 后端读写。原型功能点标注系统（蓝色圆点 + DocPanel）由各版本组件内部实现。
 */
import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense, type ComponentType, type ReactElement, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  Monitor,
  FileText,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  ListChecks,
  ChevronDown,
  ChevronRight,
  PanelRightClose,
  Sun,
  Moon,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import { findPageByPath } from '@/host/router/pageRegistry'
import { getModuleCatalog, type CatalogModule } from '@/lib/feature-tags/catalog'
import { openFeatureDoc } from '@/lib/feature-tags/core'
import { useWorkbenchTheme } from '@/host/theme/workbenchTheme'
import { cn } from '@/lib/utils'

mermaid.initialize({ startOnLoad: false, theme: 'default' })
let mmdId = 0

function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const id = `mmd-${++mmdId}`
    mermaid.render(id, chart.trim())
      .then(({ svg }) => { if (!cancelled) setSvg(svg) })
      .catch((e) => { if (!cancelled) setError(String(e)) })
    return () => { cancelled = true }
  }, [chart])

  if (error) return <pre className="text-xs text-red-500 p-2 whitespace-pre-wrap">{error}</pre>
  if (!svg) return <div className="text-xs text-muted-foreground p-2">渲染中…</div>
  return <div className="my-2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />
}

// ─── PRD 阅读增强: 目录(TOC)提取与锚点 ───────────────────────────────────────

interface TocItem {
  id: string
  text: string
  level: number
}

/** 从 ReactNode 递归提取纯文本(用于生成标题锚点 id) */
function extractHeadingText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractHeadingText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    const el = node as ReactElement<{ children?: ReactNode }>
    return extractHeadingText(el.props?.children)
  }
  return ''
}

/** 生成 DOM 安全锚点 id: 保留中英文/数字, 其余转 '-', 小写 */
function slugify(text: string): string {
  return text
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

/** 提取 Markdown 全部标题(1-6 级), 跳过代码围栏(fenced code block) */
function extractToc(md: string): TocItem[] {
  const lines = md.split('\n')
  const items: TocItem[] = []
  const seen = new Map<string, number>()
  let inFence = false
  for (const line of lines) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    const m = line.match(/^(#{1,6})\s+(.+)$/)
    if (!m) continue
    const level = m[1].length
    const text = m[2].trim().replace(/[`*_]/g, '').trim()
    if (!text) continue
    const base = `hd-${slugify(text)}`
    const count = seen.get(text) || 0
    seen.set(text, count + 1)
    const id = count === 0 ? base : `${base}-${count}`
    items.push({ id, text, level })
  }
  return items
}

// ─── 版本变更总览: PRD **FR-X 功能需求提取 ───────────────────────────────────

interface FrItem {
  code: string
  title: string
}

/** 从 PRD 提取 **FR-X 功能需求标记行(变更总览兜底数据源) */
function extractFrs(md: string): FrItem[] {
  const items: FrItem[] = []
  for (const line of md.split('\n')) {
    const m = line.match(/^\*\*(FR-\d+)\s+(.+?)\s*\*\*$/)
    if (m) items.push({ code: m[1], title: m[2] })
  }
  return items
}

const CHANGE_TYPE_META: Record<string, { label: string; className: string }> = {
  A: { label: '重构', className: 'bg-sky-100 text-sky-700' },
  B: { label: '新增', className: 'bg-emerald-100 text-emerald-700' },
  M: { label: '修改', className: 'bg-amber-100 text-amber-700' },
  R: { label: '删除', className: 'bg-red-100 text-red-600' },
}

function ChangeTypeBadge({ type }: { type: string }) {
  const meta = CHANGE_TYPE_META[type]
  if (!meta) return null
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${meta.className}`}>
      {meta.label}
    </span>
  )
}

const FEATURE_TYPE_CLASS: Record<string, string> = {
  新增: 'bg-emerald-100 text-emerald-700',
  变更: 'bg-amber-100 text-amber-700',
}

/**
 * 本次变更速览 —— 从右侧滑入的浮层，展示当前业务模块的「全量」变动点。
 * 切换页面时不关闭，并自动滚动定位到该页面对应的分组；
 * 各页分组顺序固定，避免导航时清单重排。
 */
function ChangeDigest({
  catalog,
  currentPath,
  onClose,
}: {
  catalog: CatalogModule
  currentPath: string
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const currentGroup = catalog.pages.find((p) => p.path === currentPath)

  // ── 左侧边缘调宽 + 底部调高（纯 DOM 事件，不引入额外依赖）──
  const panelRef = useRef<HTMLElement>(null)
  const [width, setWidth] = useState<number>(300) // 面板宽度(px)
  const [height, setHeight] = useState<number>(0) // 0 = 自适应（top→bottom 占满）
  const [resizingW, setResizingW] = useState(false)
  const [resizingH, setResizingH] = useState(false)
  const resizeState = useRef<{ sx: number; startW: number; sy: number; startH: number } | null>(null)

  const onResizeWDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const rect = panelRef.current?.getBoundingClientRect()
      if (!rect) return
      resizeState.current = { sx: e.clientX, startW: rect.width, sy: e.clientY, startH: rect.height }
      setWidth(rect.width)
      setResizingW(true)
    },
    [],
  )

  const onResizeHDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const rect = panelRef.current?.getBoundingClientRect()
      if (!rect) return
      resizeState.current = { sx: e.clientX, startW: rect.width, sy: e.clientY, startH: rect.height }
      setHeight(rect.height)
      setResizingH(true)
    },
    [],
  )

  useEffect(() => {
    if (!resizingW && !resizingH) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const onMove = (e: MouseEvent) => {
      if (resizingW && resizeState.current) {
        // 向左拖 → 鼠标左移(dx<0) → 宽度增大
        const dx = e.clientX - resizeState.current.sx
        const next = resizeState.current.startW - dx
        setWidth(Math.max(260, Math.min(next, vw - 40)))
      }
      if (resizingH && resizeState.current) {
        const dy = e.clientY - resizeState.current.sy
        const next = resizeState.current.startH - dy
        setHeight(Math.max(180, Math.min(next, vh - 60)))
      }
    }
    const onUp = () => {
      resizeState.current = null
      setResizingW(false)
      setResizingH(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [resizingW, resizingH])

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // 打开面板 / 切换页面时，自动滚到当前页面的变更分组
  useEffect(() => {
    const scroller = scrollRef.current
    const section = sectionRefs.current[currentPath]
    if (!scroller || !section) return
    const top =
      section.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      6
    // 即时定位：smooth 依赖动画帧，标签页后台时会被节流而停在半路
    scroller.scrollTop = top
  }, [currentPath, catalog])

  const panelStyle: React.CSSProperties = {
    right: 12,
    top: 12,
    bottom: height > 0 ? 'auto' : 12,
    width,
    height: height > 0 ? height : undefined,
    animation: 'slideInRight 0.2s var(--ease-soft)',
  }

  return (
    <aside
      ref={panelRef}
      className="absolute z-30 flex w-auto max-w-[85vw] flex-col overflow-hidden rounded-lg border border-border bg-background/95 shadow-xl backdrop-blur"
      style={panelStyle}
    >
      {/* 左侧边缘调宽把手：向左拖变宽，向右拖变窄 */}
      <div
        onMouseDown={onResizeWDown}
        title="向左拖动调宽"
        className={cn(
          'group absolute left-0 top-0 z-20 h-full w-1.5 cursor-ew-resize',
          resizingW ? 'bg-primary/30' : 'hover:bg-primary/20',
        )}
      />

      <div className="flex items-start gap-2 border-b border-border px-3 py-2.5">
        <ListChecks size={15} className="mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold text-foreground">
            本次变更 · {catalog.name}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {catalog.total} 个变动点 · 切换页面自动定位
          </div>
        </div>
        <button
          onClick={onClose}
          title="收起变更清单"
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <PanelRightClose size={15} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 pb-2">
        {catalog.pages.map((group) => {
          const isCurrent = group.path === currentPath
          return (
            <section
              key={group.path}
              ref={(el) => { sectionRefs.current[group.path] = el }}
              className={cn(
                'rounded-md border-l-2 px-1 transition-colors',
                isCurrent ? 'border-primary/50 bg-primary/[0.04]' : 'border-transparent',
              )}
            >
              <div
                className={cn(
                  'sticky top-0 z-10 -mx-1 flex items-center gap-1.5 rounded-t-md px-2 py-1.5 backdrop-blur',
                  isCurrent ? 'bg-primary/[0.08]' : 'bg-background/95',
                )}
              >
                <span
                  className={cn(
                    'truncate text-[10px] font-semibold uppercase tracking-wide',
                    isCurrent ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {group.title}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground/60">
                  {group.entries.length}
                </span>
                {isCurrent && (
                  <span className="shrink-0 rounded bg-primary/10 px-1 py-px text-[9px] font-medium text-primary">
                    当前页
                  </span>
                )}
              </div>

              <div className="space-y-0.5 pb-2">
                {group.entries.map(({ code, doc }) => {
                  const key = `${group.path}#${code}`
                  const open = expanded.has(key)
                  return (
                    <div
                      key={key}
                      className={cn(
                        'rounded-md px-1.5 py-1 transition-colors',
                        isCurrent ? 'hover:bg-primary/[0.06]' : 'hover:bg-muted/60',
                      )}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="flex w-full items-start gap-1.5 text-left"
                      >
                        <span className="mt-[1px] shrink-0 text-muted-foreground">
                          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1">
                            <span
                              className={cn(
                                'shrink-0 rounded px-1 py-px text-[9px] font-medium',
                                FEATURE_TYPE_CLASS[doc.type] ?? 'bg-muted text-muted-foreground',
                              )}
                            >
                              {doc.type}
                            </span>
                            <span className="truncate text-[11px] font-medium leading-4 text-foreground">
                              {doc.title}
                            </span>
                          </span>
                          {!open && (
                            <span className="mt-0.5 line-clamp-2 block text-[10px] leading-4 text-muted-foreground">
                              {doc.changes[0]}
                            </span>
                          )}
                        </span>
                        <span className="mt-[1px] shrink-0 font-mono text-[9px] text-muted-foreground/70">
                          {code}
                        </span>
                      </button>

                      {open && (
                        <div className="mt-1 border-t border-border/60 pt-1.5 pl-[18px] pr-1">
                          <ul className="list-disc space-y-1 pl-3 text-[10px] leading-4 text-foreground/80">
                            {doc.changes.map((c) => (
                              <li key={c}>{c}</li>
                            ))}
                          </ul>
                          {doc.rules && doc.rules.length > 0 && (
                            <div className="mt-1.5 text-[10px] text-muted-foreground">
                              另含 {doc.rules.length} 条校验规则
                            </div>
                          )}
                          {isCurrent ? (
                            <button
                              onClick={() => openFeatureDoc(code)}
                              className="mt-1.5 text-[10px] font-medium text-primary hover:underline"
                            >
                              查看完整说明（PRD 原文）→
                            </button>
                          ) : (
                            <div className="mt-1.5 text-[10px] text-muted-foreground/70">
                              属于「{group.title}」，切换到该页可查看完整说明
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* 底部高度调节把手 */}
      <div
        onMouseDown={onResizeHDown}
        title="拖动调节高度"
        className={cn(
          'group flex h-2 shrink-0 cursor-ns-resize items-center justify-center border-t border-border/60',
          resizingH ? 'bg-primary/10' : 'hover:bg-primary/[0.06]',
        )}
      >
        <span className="h-[3px] w-8 rounded-full bg-muted-foreground/30 group-hover:bg-muted-foreground/50" />
      </div>

      <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
        {currentGroup
          ? `全量清单 · 已自动定位到「${currentGroup.title}」，可继续滚动查看其它页面`
          : '本页为 1:1 还原，无本轮变更；可查看其它页面的改动'}
      </div>
    </aside>
  )
}

export function PageView() {
  const params = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const module = (params.module || '').toLowerCase()
  const page = (params.page || '').toLowerCase()
  const routePath = `/${module}/${page}`

  const pageEntry = findPageByPath(routePath)

  const { meta, component, versionComponents, prdContents } = pageEntry || {
    meta: null,
    component: null,
    versionComponents: {} as Record<string, () => Promise<{ default: ComponentType }>>,
    prdContents: {} as Record<string, string>,
  }

  // 视图状态: 原型 / 变更总览 / PRD
  const [view, setView] = useState<'prototype' | 'changes' | 'prd'>('prototype')
  const [maximized, setMaximized] = useState(false)
  const [zoom, setZoom] = useState(100)
  // PRD 内容来自 pageRegistry（Vite ?raw 加载，只读）
  const [prdContent, setPrdContent] = useState('')

  // PRD 目录(TOC): 从当前 PRD 内容提取标题结构, 用于侧栏目录 + 锚点跳转
  const toc = useMemo(() => extractToc(prdContent), [prdContent])

  /** 由标题文本生成锚点 id(与 TOC 的 slugify 规则一致) */
  const headingId = (children: ReactNode) => `hd-${slugify(extractHeadingText(children))}`

  // Esc to exit maximized mode
  useEffect(() => {
    if (!maximized) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMaximized(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [maximized])

  const hasVersions = meta?.versions && meta.versions.length > 1
  const currentVersion =
    searchParams.get('v') || meta?.defaultVersion || (meta?.versions?.[0] ?? 'default')
  const prdKey = hasVersions ? currentVersion : 'default'
  // V1/基线版本通常没有功能点标注（也不会展示本轮改动的标注），速览面板同样不展示
  const isBaselineVersion = hasVersions
    ? /(^|[^a-zA-Z])v1([^a-zA-Z]|$)/i.test(prdKey) || prdKey === 'default'
    : false

  // 版本变更总览: 优先用 meta.versionSummary(features 清单), 兜底从 PRD 自动提取 **FR-X
  const frItems = useMemo(() => extractFrs(prdContent), [prdContent])
  const versionSummary = meta?.versionSummary?.[prdKey]
  const hasChanges = (versionSummary?.features?.length ?? 0) > 0 || frItems.length > 0
  // 合并清单: PRD 提取的 FR + versionSummary 中 PRD 未覆盖的条目(如 F-Copilot 非 FR 编号)
  const changeList = useMemo(() => {
    const extra = (versionSummary?.features || []).filter((f) => !frItems.some((fr) => fr.code === f.code))
    return [
      ...frItems.map((fr) => ({
        code: fr.code,
        title: fr.title,
        feat: versionSummary?.features?.find((f) => f.code === fr.code),
      })),
      ...extra.map((f) => ({ code: f.code, title: f.title, feat: f })),
    ]
  }, [frItems, versionSummary])

  // showFeat — "显示新增功能点"开关
  // - 放在 header 上（缩放左边），不占页面空间
  // - 按「路由 + 版本」单独存 localStorage，页面/版本之间互不污染
  // - 默认关闭，先看到 1:1 还原的原貌，需要时再打开标注
  // 注意：必须在 prdKey 声明之后使用，否则触发 TDZ ReferenceError
  const FEAT_KEY = `feat${routePath.replace(/\//g, '_')}__${prdKey}_show`
  const [showFeat, setShowFeat] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(FEAT_KEY)
      if (stored === 'on') return true
      if (stored === 'off') return false
    } catch { /* ignore */ }
    return false
  })
  // 版本/路由切换时：刷新 showFeat 的状态（因为默认值策略变了；如果用户有存就用存的）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FEAT_KEY)
      if (stored === 'on') setShowFeat(true)
      else if (stored === 'off') setShowFeat(false)
      else setShowFeat(false)
    } catch { setShowFeat(false) }
  }, [FEAT_KEY, prdKey, isBaselineVersion])
  const persistShowFeat = (v: boolean) => {
    setShowFeat(v)
    try { localStorage.setItem(FEAT_KEY, v ? 'on' : 'off') } catch { /* ignore */ }
    // 打开「显示新增功能点」时顺带展开右侧变更速览，测试可边看页面边对清单
    if (v) setDigestOpen(true)
  }

  // 本次变更速览：按业务模块汇总所有页面的功能点，跨页面保留开关状态
  const catalog = useMemo(
    () => (isBaselineVersion ? null : getModuleCatalog(routePath)),
    [routePath, isBaselineVersion],
  )

  const { theme, toggleTheme } = useWorkbenchTheme()

  const [digestOpen, setDigestOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('feat-digest-open')
      if (stored === 'off') return false
      if (stored === 'on') return true
    } catch { /* ignore */ }
    return false
  })
  const setDigest = (v: boolean) => {
    setDigestOpen(v)
    try { localStorage.setItem('feat-digest-open', v ? 'on' : 'off') } catch { /* ignore */ }
  }

  // load PRD content when page/version changes (from Vite ?raw import in registry)
  useEffect(() => {
    if (!pageEntry) return
    const initial = prdContents[prdKey] || prdContents['default'] || ''
    setPrdContent(initial)
    setView('prototype')
  }, [routePath, prdKey, pageEntry, prdContents])

  if (!pageEntry || !meta || !component) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        页面未找到: {routePath}
      </div>
    )
  }

  // determine component to render
  // 使用 any 是因为不同版本组件 props 签名不同（v1 不接收 __showFeat，v2+ 接收），
  // 动态加载场景下无法用单一精确类型覆盖，React 中处理 lazy 动态组件的常见做法
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // 注意：lazy() 必须 memo，否则每次渲染都会生成新的组件类型，
  // 导致点击「变更清单」等任何父级状态更新都触发原型整页卸载重挂（白屏/闪烁）。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ActiveComponent = useMemo<ComponentType<any>>(() => {
    const loader = hasVersions && versionComponents[currentVersion] ? versionComponents[currentVersion] : component
    return loader ? lazy(loader) : (() => null)
  }, [component, versionComponents, hasVersions, currentVersion])

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden',
        maximized
          ? 'fixed inset-0 z-50 bg-background'
          : 'flex-1',
      )}
    >
      {/* top bar: view switch (segmented control) + version + maximize */}
      {!maximized && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/60">
            <button
              onClick={() => setView('prototype')}
              title="交互原型"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                view === 'prototype'
                  ? 'bg-background text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Monitor size={14} />
              原型
            </button>
            {hasChanges && (
              <button
                onClick={() => setView('changes')}
                title="版本变更总览"
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  view === 'changes'
                    ? 'bg-background text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <ListChecks size={14} />
                变更
              </button>
            )}
            <button
              onClick={() => setView('prd')}
              title="PRD 需求文档"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                view === 'prd'
                  ? 'bg-background text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FileText size={14} />
              PRD
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 本次变更速览开关：切换页面/版本不关闭，内容自动跟随当前模块 */}
            {view === 'prototype' && catalog && (
              <button
                onClick={() => setDigest(!digestOpen)}
                title={digestOpen ? '收起本次变更速览' : '展开本次变更速览（切换页面不关闭）'}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                  digestOpen
                    ? 'border-primary/40 bg-primary/[0.06] text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40',
                )}
              >
                <ListChecks size={13} />
                变更清单
                <span
                  className={cn(
                    'rounded px-1 py-px text-[10px] tabular-nums',
                    digestOpen ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {catalog.total}
                </span>
              </button>
            )}
            {/* 显示新增功能点 —— 放在缩放控件左边（测试/演示一键切换，B.08 为通用编号：任何 V2+ 都可使用） */}
            {view === 'prototype' && (
              <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background text-xs text-foreground cursor-pointer select-none hover:border-primary/60 transition-colors">
                <input
                  type="checkbox"
                  checked={showFeat}
                  onChange={(e) => persistShowFeat(e.target.checked)}
                  className="rounded border-border"
                />
                显示新增功能点
              </label>
            )}
            {view === 'prototype' && (
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/60">
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 10))}
                  title="缩小"
                  disabled={zoom <= 50}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ZoomOut size={13} />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  title="重置缩放"
                  className="px-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors min-w-[34px] text-center tabular-nums"
                >
                  {zoom}%
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(150, z + 10))}
                  title="放大"
                  disabled={zoom >= 150}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            )}
            {hasVersions && (
              <select
                value={currentVersion}
                onChange={(e) => setSearchParams({ v: e.target.value })}
                className="px-2 py-1 text-xs border border-border rounded-md bg-background text-foreground"
              >
                {meta.versions!.map((v) => (
                  <option key={v} value={v} className="bg-background text-foreground">
                    方案 {v}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? '切换为浅色工作台' : '切换为深色工作台'}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setMaximized(true)}
              title="内容区最大化"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* floating restore button when maximized */}
      {maximized && (
        <button
          onClick={() => setMaximized(false)}
          title="退出最大化 (Esc)"
          className="absolute top-2 right-2 z-50 p-1.5 rounded-md bg-background/80 backdrop-blur border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-sm"
        >
          <Minimize2 size={16} />
        </button>
      )}

      {/* content area */}
      {view === 'prototype' ? (
        <div className="relative flex-1 overflow-hidden">
          <div
            className={cn(
              'h-full overflow-auto p-3 transition-[padding] duration-200 prototype-canvas-isolation',
              // 面板展开时把原型内容让到右侧，避免遮住原型自身的左侧导航
              catalog && digestOpen && 'pr-[312px]',
            )}
          >
            <div
              // key 里必须带 currentVersion(通过 prdKey 携带)：
              // 下拉切 V1/V2/V3 时强制 React remount，
              // 避免 v2.showFeat / v2.团队视角 tab 等内部状态跨版本污染。
              key={`proto-${routePath}-${prdKey}`}
              className="animate-fade-in origin-top h-full"
              style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s var(--ease-soft)' }}
            >
              <Suspense fallback={<div className="text-muted-foreground">加载中...</div>}>
                {/* showFeat 从 Host 传入，版本/粒度按路由+版本隔离；双下划线前缀避免和页面业务 props 重名 */}
                <ActiveComponent __showFeat={showFeat} />
              </Suspense>
            </div>
          </div>

          {/* 左侧持久变更速览：绝对定位，不挤压/缩放原型内容 */}
          {catalog && digestOpen && (
            <ChangeDigest
              catalog={catalog}
              currentPath={routePath}
              onClose={() => setDigest(false)}
            />
          )}
        </div>
      ) : view === 'changes' ? (
        <div key={`chg-${prdKey}`} className="flex-1 overflow-y-auto p-3 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListChecks size={16} className="text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  版本变更总览{hasVersions ? ` · 方案 ${currentVersion}` : ''}
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">{changeList.length} 个功能需求</span>
            </div>

            {versionSummary?.summary && (
              <p className="text-sm text-muted-foreground mb-4">{versionSummary.summary}</p>
            )}

            {changeList.length === 0 ? (
              <div className="text-muted-foreground text-sm text-center py-12 border border-dashed border-border rounded-lg">
                当前版本 PRD 未包含 **FR-X 功能需求标记
                <div className="mt-1 text-xs">
                  可在 meta.json 的 versionSummary 中维护版本变更清单
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {changeList.map(({ code, title, feat }) => (
                  <div key={code} className="bg-card border border-border rounded-lg p-3 shadow-soft">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-semibold tabular-nums shrink-0">
                        {code}
                      </span>
                      {feat && <ChangeTypeBadge type={feat.type} />}
                      <span className="text-sm font-medium text-foreground truncate">{title}</span>
                    </div>
                    {feat?.desc && <p className="mt-1 text-xs text-muted-foreground">{feat.desc}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div key={`prd-${prdKey}`} className="flex-1 overflow-hidden animate-fade-in flex">
          {/* 左侧目录(TOC): 只展示 2-4 级标题, 点击平滑滚动到对应锚点 */}
          {prdContent && toc.length > 0 && (
            <aside className="w-48 shrink-0 border-r border-border overflow-y-auto py-3 px-2 hidden md:block bg-muted/10">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                目录
              </div>
              <nav className="space-y-px">
                {toc
                  .filter((h) => h.level >= 2 && h.level <= 4)
                  .map((h) => (
                    <button
                      key={h.id}
                      onClick={() =>
                        document
                          .getElementById(h.id)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                      style={{ paddingLeft: `${(h.level - 2) * 12 + 8}px` }}
                      title={h.text}
                      className="block w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded py-1 pr-1.5 truncate transition-colors"
                    >
                      {h.text}
                    </button>
                  ))}
              </nav>
            </aside>
          )}

          {/* 右侧 PRD 内容 */}
          <div className="flex-1 overflow-y-auto p-3">
            {prdContent ? (
              <div className="prose prose-sm max-w-3xl mx-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre({ children, ...props }) {
                      const child = Array.isArray(children) ? children[0] : children
                      if (child && typeof child === 'object' && 'props' in child) {
                        const cp = (child as ReactElement).props as Record<string, unknown>
                        const lang = typeof cp.className === 'string' ? cp.className : Array.isArray(cp.className) ? cp.className.join(' ') : ''
                        if (lang.includes('mermaid')) {
                          return <MermaidDiagram chart={String(cp.children ?? '')} />
                        }
                      }
                      return <pre {...props}>{children}</pre>
                    },
                    h1({ children, ...props }) {
                      return <h1 id={headingId(children)} className="scroll-mt-4" {...props}>{children}</h1>
                    },
                    h2({ children, ...props }) {
                      return <h2 id={headingId(children)} className="scroll-mt-4" {...props}>{children}</h2>
                    },
                    h3({ children, ...props }) {
                      return <h3 id={headingId(children)} className="scroll-mt-4" {...props}>{children}</h3>
                    },
                    h4({ children, ...props }) {
                      return <h4 id={headingId(children)} className="scroll-mt-4" {...props}>{children}</h4>
                    },
                    h5({ children, ...props }) {
                      return <h5 id={headingId(children)} className="scroll-mt-4" {...props}>{children}</h5>
                    },
                    h6({ children, ...props }) {
                      return <h6 id={headingId(children)} className="scroll-mt-4" {...props}>{children}</h6>
                    },
                  }}
                >{prdContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm text-center py-12">
                暂无 PRD 文档
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

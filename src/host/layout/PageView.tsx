/**
 * PageView - right content area with Tab dual view (prototype + PRD)
 * supports multi-version switching (Select) and read-only PRD view
 *
 * 纯前端架构：PRD 内容通过 Vite `?raw` 在 pageRegistry 中加载（见 router/pageRegistry.ts），
 * 不再依赖 Express 后端读写。原型功能点标注系统（蓝色圆点 + DocPanel）由各版本组件内部实现。
 */
import { useState, useEffect, lazy, Suspense, type ComponentType, type ReactElement } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Monitor, FileText, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import { findPageByPath } from '@/host/router/pageRegistry'
import { DesignSystemSwitcher } from '@/host/components/DesignSystemSwitcher'
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

  // 视图状态
  const [view, setView] = useState<'prototype' | 'prd'>('prototype')
  const [maximized, setMaximized] = useState(false)
  const [zoom, setZoom] = useState(100)
  // PRD 内容来自 pageRegistry（Vite ?raw 加载，只读）
  const [prdContent, setPrdContent] = useState('')

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

  // showFeat — "显示新增功能点"开关
  // - 放在 header 上（缩放左边），不占页面空间
  // - 按「路由 + 版本」单独存 localStorage，页面/版本之间互不污染
  // - 版本切换（prdKey 变化）时触发重新初始化，保证 V1 默认关（V1 没有 FEATURE_LABELS）
  // 注意：必须在 prdKey 声明之后使用，否则触发 TDZ ReferenceError
  const FEAT_KEY = `feat${routePath.replace(/\//g, '_')}__${prdKey}_show`
  const [showFeat, setShowFeat] = useState<boolean>(() => {
    // V1/基线版本默认关（一般没功能点标注，避免出现开关但没标签的尴尬空状态）
    // V2+ 默认开，方便测试立刻看到标注
    // 单版本页面（无 versions）本身即最终版本，默认开
    const isV1 = hasVersions
      ? /(^|[^a-zA-Z])v1([^a-zA-Z]|$)/i.test(prdKey) || prdKey === 'default'
      : false
    try {
      const stored = localStorage.getItem(FEAT_KEY)
      if (stored === 'on') return true
      if (stored === 'off') return false
    } catch { /* ignore */ }
    return !isV1
  })
  // 版本/路由切换时：刷新 showFeat 的状态（因为默认值策略变了；如果用户有存就用存的）
  useEffect(() => {
    const isV1 = hasVersions
      ? /(^|[^a-zA-Z])v1([^a-zA-Z]|$)/i.test(prdKey) || prdKey === 'default'
      : false
    try {
      const stored = localStorage.getItem(FEAT_KEY)
      if (stored === 'on') setShowFeat(true)
      else if (stored === 'off') setShowFeat(false)
      else setShowFeat(!isV1)
    } catch { setShowFeat(!isV1) }
  }, [FEAT_KEY, prdKey, hasVersions])
  const persistShowFeat = (v: boolean) => {
    setShowFeat(v)
    try { localStorage.setItem(FEAT_KEY, v ? 'on' : 'off') } catch { /* ignore */ }
  }

  // load PRD content when page/version changes (from Vite ?raw import in registry)
  useEffect(() => {
    if (!pageEntry) return
    const initial = prdContents[prdKey] || prdContents['default'] || ''
    setPrdContent(initial)
    setView('prototype')
  }, [routePath, prdKey])

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
  let ActiveComponent: ComponentType<any>
  if (hasVersions && versionComponents[currentVersion]) {
    const LazyComp = lazy(versionComponents[currentVersion])
    ActiveComponent = LazyComp
  } else {
    const LazyComp = lazy(component)
    ActiveComponent = LazyComp
  }

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
            <button
              onClick={() => setMaximized(true)}
              title="内容区最大化"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Maximize2 size={16} />
            </button>
            {hasVersions && (
              <select
                value={currentVersion}
                onChange={(e) => setSearchParams({ v: e.target.value })}
                className="px-2 py-1 text-xs border border-border rounded-md bg-background"
              >
                {meta.versions!.map((v) => (
                  <option key={v} value={v}>
                    方案 {v}
                  </option>
                ))}
              </select>
            )}
            <DesignSystemSwitcher />
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
        <div className="flex-1 overflow-auto bg-muted/20 p-3">
          <div
            // key 里必须带 currentVersion(通过 prdKey 携带)：
            // 下拉切 V1/V2/V3 时强制 React remount，
            // 避免 v2.showFeat / v2.团队视角 tab 等内部状态跨版本污染。
            key={`proto-${routePath}-${prdKey}`}
            className="animate-fade-in origin-top"
            style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s var(--ease-soft)' }}
          >
            <Suspense fallback={<div className="text-muted-foreground">加载中...</div>}>
              {/* showFeat 从 Host 传入，版本/粒度按路由+版本隔离；双下划线前缀避免和页面业务 props 重名 */}
              <ActiveComponent __showFeat={showFeat} />
            </Suspense>
          </div>
        </div>
      ) : (
        <div key={`prd-${prdKey}`} className="flex-1 overflow-auto p-3 animate-fade-in">
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
                }}
              >{prdContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm text-center py-12">
              暂无 PRD 文档
            </div>
          )}
        </div>
      )}
    </div>
  )
}

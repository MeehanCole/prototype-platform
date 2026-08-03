/**
 * PageView - right content area with Tab dual view (prototype + PRD)
 * supports multi-version switching (Select) and PRD inline editing
 */
import { useState, useEffect, lazy, Suspense, type ComponentType } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Monitor, FileText, History, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { findPageByPath } from '@/host/router/pageRegistry'
import { MilkdownEditor } from '@/host/components/MilkdownEditor'
import { AnnotationPanel } from '@/host/components/AnnotationPanel'
import { Timeline } from '@/host/components/Timeline'
import { DesignSystemSwitcher } from '@/host/components/DesignSystemSwitcher'
import { readMarkdown, writeMarkdown, readAnnotations } from '@/host/api'
import { exportPdf } from '@/host/utils/exportPdf'
import { cn } from '@/lib/utils'

/** derive PRD file path from page dir and version */
function getPrdPath(dir: string, versionKey: string): string {
  const relDir = dir.replace('/src/pages/', '')
  if (versionKey === 'default') return `${relDir}/prd.md`
  return `${relDir}/prd_${versionKey}.md`
}

/** derive annotation file path from page dir and version */
function getAnnoPath(dir: string, versionKey: string): string {
  const relDir = dir.replace('/src/pages/', '')
  return `${relDir}/.annotations_${versionKey}.json`
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
    versionComponents: {},
    prdContents: {},
  }

  // PRD state
  const [view, setView] = useState<'prototype' | 'prd'>('prototype')
  const [maximized, setMaximized] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [prdMode, setPrdMode] = useState<'read' | 'edit'>('read')
  const [prdContent, setPrdContent] = useState('')
  const [prdDirty, setPrdDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)

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
    const isV1 = /(^|[^a-zA-Z])v1([^a-zA-Z]|$)/i.test(prdKey) || prdKey === 'default'
    try {
      const stored = localStorage.getItem(FEAT_KEY)
      if (stored === 'on') return true
      if (stored === 'off') return false
    } catch { /* ignore */ }
    return !isV1
  })
  // 版本/路由切换时：刷新 showFeat 的状态（因为默认值策略变了；如果用户有存就用存的）
  useEffect(() => {
    const isV1 = /(^|[^a-zA-Z])v1([^a-zA-Z]|$)/i.test(prdKey) || prdKey === 'default'
    try {
      const stored = localStorage.getItem(FEAT_KEY)
      if (stored === 'on') setShowFeat(true)
      else if (stored === 'off') setShowFeat(false)
      else setShowFeat(!isV1)
    } catch { setShowFeat(!isV1) }
  }, [FEAT_KEY, prdKey])
  const persistShowFeat = (v: boolean) => {
    setShowFeat(v)
    try { localStorage.setItem(FEAT_KEY, v ? 'on' : 'off') } catch { /* ignore */ }
  }

  // load PRD content when page/version changes
  useEffect(() => {
    if (!pageEntry) return
    const initial = prdContents[prdKey] || prdContents['default'] || ''
    setPrdContent(initial)
    setPrdDirty(false)
    setPrdMode('read')
    setView('prototype')
  }, [routePath, prdKey])

  // when entering edit mode, fetch latest from server
  const enterEditMode = async () => {
    if (!pageEntry) return
    const prdPath = getPrdPath(pageEntry.dir, prdKey)
    const latest = await readMarkdown(prdPath)
    setPrdContent(latest)
    setPrdMode('edit')
  }

  const handlePrdChange = (md: string) => {
    setPrdContent(md)
    setPrdDirty(true)
  }

  const handleSave = async () => {
    if (!pageEntry || saving) return
    setSaving(true)
    const prdPath = getPrdPath(pageEntry.dir, prdKey)
    const ok = await writeMarkdown(prdPath, prdContent)
    setSaving(false)
    if (ok) {
      setPrdDirty(false)
    }
  }

  const handleExportPdf = async () => {
    if (!pageEntry) return
    const annoPath = getAnnoPath(pageEntry.dir, prdKey)
    const annotations = await readAnnotations(annoPath)
    exportPdf({
      page: pageEntry,
      prdContent,
      annotations,
      versionKey: prdKey,
    })
  }

  if (!pageEntry || !meta || !component) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        页面未找到: {routePath}
      </div>
    )
  }

  // determine component to render
  let ActiveComponent: ComponentType
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
      {/* top bar: view switch (segmented control) + version + timeline + maximize */}
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
                {showFeat && (
                  <span className="inline-flex items-center rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                    新增·B.08
                  </span>
                )}
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
              onClick={() => setTimelineOpen(true)}
              title="更新日志"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <History size={16} />
            </button>
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
        <div key={`prd-${prdMode}`} className="flex-1 overflow-auto p-3 animate-fade-in">
          {/* PRD toolbar */}
          <div className="max-w-3xl mx-auto mb-4 flex items-center justify-end gap-2">
            {prdMode === 'read' ? (
              <>
                <button
                  onClick={handleExportPdf}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent"
                >
                  导出 PDF
                </button>
                <button
                  onClick={enterEditMode}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent"
                >
                  编辑
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setPrdMode('read')}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !prdDirty}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </>
            )}
          </div>

          {prdMode === 'read' ? (
            prdContent ? (
              <AnnotationPanel annoPath={getAnnoPath(pageEntry.dir, prdKey)}>
                <div className="prose prose-sm max-w-3xl mx-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {prdContent}
                  </ReactMarkdown>
                </div>
              </AnnotationPanel>
            ) : (
              <div className="text-muted-foreground text-sm text-center">
                暂无 PRD 文档,请点击"编辑"创建
              </div>
            )
          ) : (
            <div className="max-w-3xl mx-auto border border-border rounded-lg p-4 bg-background min-h-[400px]">
              <MilkdownEditor
                key={`${routePath}-${prdKey}`}
                value={prdContent}
                onChange={handlePrdChange}
              />
            </div>
          )}
        </div>
      )}

      {/* git log timeline drawer */}
      <Timeline
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        relPath={pageEntry.dir.replace('/src/pages/', '')}
      />
    </div>
  )
}

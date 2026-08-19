/**
 * Overview - 平台首页总览 (根路径 "/")
 * 模块卡片 + 统计条 + 页面清单, 替代直接重定向到第一个页面
 * 数据来自 pageRegistry 自动扫描的 meta.json(含扩展字段: status/designSystem/updatedAt)
 */
import { Link } from 'react-router-dom'
import { LayoutGrid, FileText, GitBranch, CheckCircle2 } from 'lucide-react'
import { getPagesByModule, pageRegistry, type PageStatus } from '@/host/router/pageRegistry'
import { cn } from '@/lib/utils'

const STATUS_META: Record<PageStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-zinc-100 text-zinc-600' },
  review: { label: '评审中', className: 'bg-amber-100 text-amber-700' },
  accepted: { label: '已验收', className: 'bg-emerald-100 text-emerald-700' },
  archived: { label: '已归档', className: 'bg-zinc-100 text-zinc-500' },
}

function StatusBadge({ status }: { status: PageStatus }) {
  const meta = STATUS_META[status]
  if (!meta) return null
  return (
    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap', meta.className)}>
      {meta.label}
    </span>
  )
}

export default function Overview() {
  const grouped = getPagesByModule()
  const modules = Object.keys(grouped).sort()
  const pages = pageRegistry

  const stats = {
    modules: modules.length,
    pages: pages.length,
    multiVersion: pages.filter((p) => (p.meta.versions?.length ?? 0) > 1).length,
    accepted: pages.filter((p) => p.meta.status === 'accepted').length,
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted/20">
      {/* 自适应: 占满可用宽度(不设 max-w 居中), 列数随断点增长 */}
      <div className="p-4 sm:p-6">
        {/* header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <LayoutGrid size={20} className="text-primary" />
            原型协作台
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            代码驱动的统一原型与需求协作平台 · 丢入页面即接入, 原型与 PRD 同源同版本
          </p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground">
              <LayoutGrid size={14} />
              <span className="text-xs">业务模块</span>
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{stats.modules}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText size={14} />
              <span className="text-xs">原型页面</span>
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{stats.pages}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GitBranch size={14} />
              <span className="text-xs">多版本页面</span>
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{stats.multiVersion}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 size={14} />
              <span className="text-xs">已验收页面</span>
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{stats.accepted}</div>
          </div>
        </div>

        {/* module cards */}
        {modules.length === 0 ? (
          <div className="text-muted-foreground text-sm text-center py-16 border border-dashed border-border rounded-lg">
            暂无页面, 请在 src/pages/ 下添加
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {modules.map((mod) => {
              const modPages = grouped[mod]
              return (
                <div
                  key={mod}
                  className="bg-card border border-border rounded-lg shadow-soft overflow-hidden flex flex-col"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                        {mod.charAt(0)}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground truncate">{mod}</h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{modPages.length} 个页面</span>
                  </div>
                  <div className="p-2 space-y-1 flex-1">
                    {modPages.map((p) => (
                      <Link
                        key={p.path}
                        to={p.path}
                        className="block px-2.5 py-2 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-foreground truncate">{p.meta.title}</span>
                          {p.meta.status && <StatusBadge status={p.meta.status} />}
                        </div>
                        {p.meta.description && (
                          <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{p.meta.description}</div>
                        )}
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          {(p.meta.versions?.length ?? 0) > 1 && (
                            <span className="px-1.5 py-0.5 rounded bg-muted">
                              {p.meta.versions!.join(' / ')}
                            </span>
                          )}
                          {p.meta.source && (
                            <span className="px-1.5 py-0.5 rounded bg-muted">{p.meta.source}</span>
                          )}
                          {p.meta.updatedAt && <span className="ml-auto">{p.meta.updatedAt}</span>}
                        </div>
                        {p.meta.tags && p.meta.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {p.meta.tags.slice(0, 4).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

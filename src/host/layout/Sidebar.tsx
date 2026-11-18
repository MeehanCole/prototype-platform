/**
 * Sidebar - collapsible tree nav grouped by module, supports collapse to icon-only
 * dark surface for depth contrast against light content area
 */
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronRight, ChevronDown, PanelLeftClose, PanelLeftOpen, Search, LayoutGrid, Boxes, Sun, Moon } from 'lucide-react'
import { getPagesByModule } from '@/host/router/pageRegistry'
import { useWorkbenchTheme } from '@/host/theme/workbenchTheme'
import { cn } from '@/lib/utils'

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onOpenSearch,
}: {
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenSearch: () => void
}) {
  const grouped = getPagesByModule()
  const location = useLocation()
  // 中文路由在 location.pathname 里是百分号编码的，直接 startsWith 比对永远不成立（活动态/自动展开会失效）
  const pathname = (() => {
    try {
      return decodeURIComponent(location.pathname)
    } catch {
      return location.pathname
    }
  })()

  // default expand the product + requirement containing the active page
  const initialExpanded = new Set<string>()
  for (const pg of grouped) {
    if (pg.pages.some((p) => pathname.startsWith(p.path))) {
      initialExpanded.add(pg.product)
      for (const rg of pg.requirements) {
        if (rg.pages.some((p) => pathname.startsWith(p.path))) {
          initialExpanded.add(`${pg.product}/${rg.requirement}`)
          break
        }
      }
    }
  }
  // 上次展开过的产品/需求（localStorage）：刷新或换页后恢复用户的手动展开习惯
  const STORAGE_KEY = 'prototype.sidebar.expanded'
  const knownKeys = new Set<string>()
  for (const pg of grouped) {
    knownKeys.add(pg.product)
    for (const rg of pg.requirements) knownKeys.add(`${pg.product}/${rg.requirement}`)
  }
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const next = new Set(initialExpanded)
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      if (Array.isArray(saved)) {
        // 只恢复仍然存在的 key，产品/需求改名后被丢弃
        for (const k of saved) if (typeof k === 'string' && knownKeys.has(k)) next.add(k)
      }
    } catch {
      /* 忽略损坏的本地数据 */
    }
    return next
  })
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]))
    } catch {
      /* 隐私模式等写入失败时不影响使用 */
    }
  }, [expanded])
  // 每个产品按钮节点：收起态点击展开后把它滚到可视区（长列表时不至于跑到屏幕外）
  const productRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const { theme, toggleTheme } = useWorkbenchTheme()

  const toggle = (key: string) => {
    if (collapsed) return
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <aside
      className={cn(
        'shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col transition-[width] duration-200 ease-soft',
        collapsed ? 'w-12' : 'w-48',
      )}
    >
      {/* header: brand mark + collapse toggle */}
      <div className="flex items-center gap-2 px-2.5 h-11 border-b border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-primary shrink-0 flex items-center justify-center shadow-soft">
            <span className="text-[10px] font-bold text-primary-foreground">P</span>
          </div>
          {!collapsed && (
            <span className="text-[13px] font-semibold tracking-wide text-sidebar-foreground truncate">
              原型协作台
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="ml-auto flex items-center gap-0.5">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? '切换为浅色工作台' : '切换为深色工作台'}
              className="p-1 rounded-md text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted transition-colors"
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button
              onClick={onToggleCollapse}
              title="收起导航栏"
              className="p-1 rounded-md text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted transition-colors"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>
        )}
      </div>
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          title="展开导航栏"
          className="mx-auto my-1 p-1.5 rounded-md text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted transition-colors"
        >
          <PanelLeftOpen size={14} />
        </button>
      )}

      {/* search entry: opens global SearchPanel (Cmd+K) */}
      <div className="px-2 pt-2 pb-1">
        <button
          onClick={onOpenSearch}
          title="搜索页面 / PRD (Cmd+K)"
          className={cn(
            'w-full flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-muted/40 transition-colors',
            collapsed ? 'justify-center py-1.5' : 'px-2.5 py-1.5',
            'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:border-sidebar-border/80',
          )}
        >
          <Search size={13} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-[13px] truncate">搜索页面 / PRD...</span>
              <kbd className="text-[10px] text-sidebar-muted-foreground/70 border border-sidebar-border rounded px-1 py-px shrink-0">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 text-sm">
        {/* 平台总览: 返回首页(根路径 /) */}
        <div className="mb-1.5">
          <NavLink
            to="/"
            end
            title="平台总览"
            className={({ isActive }) =>
              cn(
                'w-full flex items-center gap-1.5 rounded-md transition-colors',
                collapsed ? 'justify-center px-0 py-1.5' : 'px-2.5 py-1.5',
                isActive
                  ? 'text-sidebar-foreground font-medium'
                  : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted',
              )
            }
          >
            <LayoutGrid size={14} className="shrink-0" />
            {!collapsed && <span className="truncate text-[13px]">平台总览</span>}
          </NavLink>
        </div>

        {/* 素材库: 仅开发环境展示（npm run dev 才有入口，正式构建后整块消失） */}
        {import.meta.env.DEV && (
          <div className="mb-1.5">
            <NavLink
              to="/__assets"
              title="素材库（仅开发环境）"
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center gap-1.5 rounded-md transition-colors',
                  collapsed ? 'justify-center px-0 py-1.5' : 'px-2.5 py-1.5',
                  isActive
                    ? 'text-sidebar-foreground font-medium'
                    : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted',
                )
              }
            >
              <Boxes size={14} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate text-[13px]">素材库</span>
                  <span className="ml-auto rounded bg-primary/15 px-1 py-px text-[9px] font-medium text-primary">
                    DEV
                  </span>
                </>
              )}
            </NavLink>
          </div>
        )}

        {grouped.map((pg) => {
          const productKey = pg.product
          const isProductOpen = !collapsed && expanded.has(productKey)
          const productHasActive = pg.pages.some((p) => pathname.startsWith(p.path))
          const totalCount = pg.pages.length

          return (
            <div key={productKey} className="mb-1.5">
              <button
                ref={(el) => {
                  productRefs.current[productKey] = el
                }}
                onClick={() => {
                  // 收起态下点一级菜单：先展开侧栏，并把该产品一并展开，避免"点一次没反应"
                  if (collapsed) {
                    onToggleCollapse()
                    setExpanded((prev) => new Set(prev).add(productKey))
                    requestAnimationFrame(() => {
                      productRefs.current[productKey]?.scrollIntoView({ block: 'nearest' })
                    })
                    return
                  }
                  toggle(productKey)
                }}
                title={productKey}
                aria-expanded={collapsed ? undefined : isProductOpen}
                aria-current={productHasActive ? 'true' : undefined}
                className={cn(
                  'relative w-full flex items-center gap-1.5 rounded-md transition-colors',
                  collapsed ? 'justify-center px-0 py-1.5' : 'px-2.5 py-1.5',
                  productHasActive
                    ? 'text-sidebar-foreground font-medium'
                    : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted',
                )}
              >
                {/* 收起态：当前页所属产品加一条高亮竖条，便于在图标条里定位 */}
                {collapsed && productHasActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-primary" />
                )}
                {!collapsed && (
                  <>
                    <span className="w-3 shrink-0 flex justify-center">
                      {isProductOpen ? (
                        <ChevronDown size={13} className="opacity-60" />
                      ) : (
                        <ChevronRight size={13} className="opacity-60" />
                      )}
                    </span>
                    <span className="truncate text-[13px] font-semibold tracking-wide">{productKey}</span>
                    <span className="ml-auto text-[10px] text-sidebar-muted-foreground/60">
                      {totalCount}
                    </span>
                  </>
                )}
                {collapsed && (
                  <span className="text-[13px] font-semibold">{productKey.charAt(0)}</span>
                )}
              </button>

              {isProductOpen &&
                pg.requirements.map((rg) => {
                  const reqKey = `${pg.product}/${rg.requirement}`
                  const isReqOpen = expanded.has(reqKey)
                  const reqHasActive = rg.pages.some((p) => pathname.startsWith(p.path))

                  return (
                    <div key={reqKey} className="mt-0.5 ml-3 border-l border-sidebar-border pl-2">
                      <button
                        onClick={() => toggle(reqKey)}
                        title={rg.requirement}
                        className={cn(
                          'w-full flex items-center gap-1.5 rounded-md transition-colors px-1.5 py-1.5',
                          reqHasActive
                            ? 'text-sidebar-foreground font-medium'
                            : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted',
                        )}
                      >
                        <span className="w-3 shrink-0 flex justify-center">
                          {isReqOpen ? (
                            <ChevronDown size={12} className="opacity-50" />
                          ) : (
                            <ChevronRight size={12} className="opacity-50" />
                          )}
                        </span>
                        <span className="truncate text-[13px]">{rg.requirement}</span>
                        <span className="ml-auto text-[10px] text-sidebar-muted-foreground/50">
                          {rg.pages.length}
                        </span>
                      </button>

                      {isReqOpen &&
                        rg.pages.map((page) => (
                          <NavLink
                            key={page.path}
                            to={page.path}
                            title={page.meta.title}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-1.5 ml-3 border-l pl-2 pr-1.5 py-1.5 text-[12px] transition-colors truncate',
                                isActive
                                  ? 'border-primary text-sidebar-foreground font-medium'
                                  : 'border-sidebar-border/60 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:border-sidebar-border',
                              )
                            }
                          >
                            <span className="w-3 shrink-0" />
                            {page.meta.title}
                          </NavLink>
                        ))}
                    </div>
                  )
                })}
            </div>
          )
        })}

        {grouped.length === 0 && (
          <div className="px-3 py-2 text-sm text-sidebar-muted-foreground">
            暂无页面,请在 src/pages/ 下添加
          </div>
        )}
      </nav>
    </aside>
  )
}

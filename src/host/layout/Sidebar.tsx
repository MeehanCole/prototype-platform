/**
 * Sidebar - collapsible tree nav grouped by module, supports collapse to icon-only
 * dark surface for depth contrast against light content area
 */
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronRight, ChevronDown, PanelLeftClose, PanelLeftOpen, Search, LayoutGrid } from 'lucide-react'
import { getPagesByModule } from '@/host/router/pageRegistry'
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
  const modules = Object.keys(grouped).sort()
  const location = useLocation()

  // default expand the module containing the active page
  const initialExpanded = modules.filter((mod) =>
    grouped[mod].some((p) => location.pathname.startsWith(p.path)),
  )
  const [expanded, setExpanded] = useState<Set<string>>(new Set(initialExpanded))

  const toggle = (mod: string) => {
    if (collapsed) return
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(mod)) next.delete(mod)
      else next.add(mod)
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
            <span className="text-xs font-semibold tracking-wide text-sidebar-foreground truncate">
              原型协作台
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            title="收起导航栏"
            className="ml-auto p-1 rounded-md text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted transition-colors"
          >
            <PanelLeftClose size={14} />
          </button>
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
      <div className="px-2 pb-1">
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
              <span className="flex-1 text-left text-xs truncate">搜索页面 / PRD...</span>
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
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-soft'
                  : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted',
              )
            }
          >
            <LayoutGrid size={14} className="shrink-0" />
            {!collapsed && <span className="truncate text-xs">平台总览</span>}
          </NavLink>
        </div>

        {modules.map((mod) => {
          const isOpen = !collapsed && expanded.has(mod)
          const pages = grouped[mod]
          const hasActive = pages.some((p) => location.pathname.startsWith(p.path))

          return (
            <div key={mod} className="mb-1.5">
              <button
                onClick={() => toggle(mod)}
                title={mod}
                className={cn(
                  'w-full flex items-center gap-1.5 rounded-md transition-colors',
                  collapsed ? 'justify-center px-0 py-1.5' : 'px-2.5 py-1.5',
                  hasActive
                    ? 'text-sidebar-foreground font-medium'
                    : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted',
                )}
              >
                {!collapsed && (
                  <>
                    {isOpen ? (
                      <ChevronDown size={13} className="shrink-0 opacity-60" />
                    ) : (
                      <ChevronRight size={13} className="shrink-0 opacity-60" />
                    )}
                    <span className="truncate text-xs uppercase tracking-wider">{mod}</span>
                    <span className="ml-auto text-[10px] text-sidebar-muted-foreground/60">
                      {pages.length}
                    </span>
                  </>
                )}
                {collapsed && (
                  <span className="text-xs font-semibold">{mod.charAt(0)}</span>
                )}
              </button>

              {isOpen && (
                <div className="mt-0.5 ml-2.5 border-l border-sidebar-border pl-1">
                  {pages.map((page) => (
                    <NavLink
                      key={page.path}
                      to={page.path}
                      title={page.meta.title}
                      className={({ isActive }) =>
                        cn(
                          'block px-2.5 py-1.5 rounded-md text-[13px] transition-colors truncate',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-soft'
                            : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted',
                        )
                      }
                    >
                      {page.meta.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {modules.length === 0 && (
          <div className="px-3 py-2 text-sm text-sidebar-muted-foreground">
            暂无页面,请在 src/pages/ 下添加
          </div>
        )}
      </nav>
    </aside>
  )
}

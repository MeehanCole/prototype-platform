/**
 * 产品左侧导航（通用件）
 *
 * 来源：「算力加速平台」1:1 还原外壳（256px、行高 40px、三级缩进）。
 * 菜单内容一律由外部 rows 传入，本文件不含任何产品/需求数据。
 * 换主题色：改 src/index.css 的 --shell-accent。
 */
import type { ReactNode } from 'react'
import { ShellIcon } from './icons'
import type { ShellNavRow, ShellTenant } from './types'

const ACCENT = 'var(--shell-accent)'

export interface SideNavProps {
  rows: ShellNavRow[]
  /** 侧边栏顶部租户胶囊，不传则不渲染 */
  tenant?: ShellTenant
  /** 菜单标题（如「算网服务」），不传则不渲染 */
  menuTitle?: string
  /** 点击菜单行的默认跳转；行内 onClick 优先级更高 */
  onNavigate?: (path: string) => void
  /** 底部「收起侧边栏」点击行为；不传时按钮仍保留（外壳还原需要） */
  onCollapse?: () => void
  /** 侧边栏底部自定义内容，渲染在收起按钮上方 */
  footer?: ReactNode
  className?: string
}

export function SideNav({
  rows,
  tenant,
  menuTitle,
  onNavigate,
  onCollapse,
  footer,
  className = '',
}: SideNavProps) {
  return (
    <aside className={`w-[256px] shrink-0 bg-white border-r border-[#eaeaea] flex flex-col overflow-y-auto select-none ${className}`}>
      {/* 节点 / 租户胶囊 */}
      {tenant && (
        <div className="pl-[14px] pt-[14px]">
          <div className="flex items-center gap-2 rounded-md bg-[#edf1f8] pl-[11px] pr-2.5 h-[47px] w-[201px]">
            <span className="text-[18px] text-[var(--shell-accent)] whitespace-nowrap">{tenant.node}</span>
            <span className="text-[18px] text-[var(--shell-accent)]">–</span>
            <span className="text-[18px] text-[var(--shell-accent)] whitespace-nowrap">{tenant.workspace}</span>
            <span className="ml-auto">
              <ShellIcon name="switchbox" size={24} color={ACCENT} />
            </span>
          </div>
        </div>
      )}

      {/* 标题 */}
      {menuTitle && (
        <div className="pl-[26px] pt-[14px] pb-[10px] text-[18px] font-bold text-[#111]">{menuTitle}</div>
      )}

      {/* 菜单行（行高 40px） */}
      <nav className="flex-1">
        {rows.map((row) => {
          if (row.kind === 'section') {
            return (
              <div key={row.label} className="h-[40px] flex items-start pt-[12px] pl-[28px] text-[15px] text-[#8c8c8c]">
                {row.label}
              </div>
            )
          }
          const iconColor = row.active ? ACCENT : '#1f2329'
          if (row.active) {
            /** 选中态内缩按层级计算，保证与同级未选中行的文字左沿对齐 */
            const activeIndent =
              row.lvl === 3 ? 'pl-[56px]' : row.lvl === 1 ? 'pl-[18px]' : 'pl-[38px]'
            return (
              <div key={row.label} className="h-[40px] flex items-center">
                <div className={`ml-[8px] h-[35px] rounded-md bg-[#ECF1FD] flex items-center pr-3 w-[214px] ${activeIndent}`}>
                  {row.icon && <ShellIcon name={row.icon} size={20} color={iconColor} />}
                  <span className="ml-[8px] text-[18px] text-[var(--shell-accent)] font-medium">{row.label}</span>
                </div>
              </div>
            )
          }
          const indent = row.lvl === 1 ? 'pl-[26px]' : row.lvl === 3 ? 'pl-[64px]' : 'pl-[46px]'
          const clickable = Boolean(row.path || row.onClick)
          return (
            <div
              key={row.label}
              onClick={() => {
                if (row.onClick) row.onClick()
                else if (row.path && onNavigate) onNavigate(row.path)
              }}
              className={`h-[40px] flex items-center ${clickable ? 'cursor-pointer hover:bg-[#f7f8fa]' : ''} ${indent}`}
            >
              {row.icon && <ShellIcon name={row.icon} size={20} color={iconColor} />}
              <span className="ml-[9px] text-[18px] text-[#262626]">{row.label}</span>
              {row.chevron && (
                <ShellIcon
                  name={row.chevron === 'up' ? 'chevronUp' : 'chevronDown'}
                  size={14}
                  color="#999"
                  className="ml-[21px]"
                />
              )}
            </div>
          )
        })}
      </nav>

      {footer}

      {/* 底部收起按钮 */}
      <div className="shrink-0 border-t border-[#f0f0f0] pt-[10px] pb-2 pl-4">
        <button
          className="cursor-pointer block ml-[159px]"
          aria-label="收起侧边栏"
          onClick={onCollapse}
        >
          <ShellIcon name="collapse" size={18} color="#666" />
        </button>
      </div>
    </aside>
  )
}
/**
 * 产品导航面板（通用件）
 *
 * 「点击顶栏左上角 9 宫格」弹出的产品类导航：像下拉弹窗一样浮在页面之上，
 * 5 列等宽 + 顶部搜索 + 每列一个产品（可堆叠多个产品），每条服务前带浅蓝圆角图标。
 * 弹窗四周留出页面，点空白处 / Esc / 再点 9 宫格 均可关闭（不遮挡底层页面）。
 *
 * 所有间距/字号均为截图实测（截图 2x，下列值已折算为 CSS px）：
 *   搜索框 12px 上边距、28px 高；栏目 32px 上内距、25px 左右内距；
 *   产品标题 28px 图标 + 16px 半粗；服务行 24px 高、18px 图标、14px 文字；
 *   分组标题 9px 蓝点 + 14px 灰字；列间 1px 分隔线 #E7E6E9。
 *
 * 数据全部来自 preset，组件内不出现任何产品文案。
 */
import { useEffect, useRef, useState } from 'react'
import type { ShellPanelItem, ShellPanelPreset, ShellPanelVisibility } from './types'
import { NavIcon } from './icons'

/** 当前登录角色：平台管理员 / 普通用户（由 OIDC 登录态决定） */
export type ProductNavRole = 'admin' | 'user'

export interface ProductNavProps {
  columns: ShellPanelPreset
  /** 点击某条服务（用于跳转或切换产品） */
  onItemClick?: (item: ShellPanelItem) => void
  /** 关闭面板（Esc） */
  onClose?: () => void
  /** 当前角色，默认 admin（保持既有调用方零改动） */
  role?: ProductNavRole
  className?: string
}

/** 按角色判断某条数据是否可见；不填 visibleTo 即所有人可见 */
function canSee(visibleTo: ShellPanelVisibility | undefined, role: ProductNavRole) {
  return visibleTo !== 'admin' || role === 'admin'
}

const BADGE_BG = 'bg-[#EEF2FD]'

export function ProductNav({ columns, onItemClick, onClose, role = 'admin', className = '' }: ProductNavProps) {
  const [keyword, setKeyword] = useState('')
  const kw = keyword.trim()
  const cardRef = useRef<HTMLDivElement>(null)

  // 点弹窗外部关闭；触发器（9 宫格）由 PlatformHeader 打上 data-shell-nav-trigger，交给它自己 toggle
  useEffect(() => {
    if (!onClose) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      if (cardRef.current?.contains(t)) return
      if (t.closest('[data-shell-nav-trigger]')) return
      onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [onClose])

  useEffect(() => {
    if (!onClose) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 角色过滤：先摘掉无权项与因此变空的分组/产品，再交给搜索
  const scoped = columns.map((column) => ({
    sections: column.sections
      .map((section) => ({
        ...section,
        groups: section.groups
          .filter((group) => canSee(group.visibleTo, role))
          .map((group) => ({ ...group, items: group.items.filter((it) => canSee(it.visibleTo, role)) }))
          .filter((group) => group.items.length > 0),
      }))
      .filter((section) => section.groups.length > 0),
  }))
    // 整列都被权限摘空时不留一条空列（列宽按剩余列均分）
    .filter((column) => column.sections.length > 0)

  // 搜索：命中服务名或分组名，整块过滤（不改动原数据）
  const filtered = scoped.map((column) => ({
    sections: column.sections
      .map((section) => ({
        ...section,
        groups: section.groups
          .map((group) => {
            if (!kw) return group
            if (group.label?.includes(kw)) return group
            return { ...group, items: group.items.filter((it) => it.label.toLowerCase().includes(kw.toLowerCase())) }
          })
          .filter((group) => group.items.length > 0),
      }))
      .filter((section) => section.groups.length > 0),
  }))
  const empty = filtered.every((c) => c.sections.length === 0)

  return (
    <div
      ref={cardRef}
      className={`absolute left-[12px] top-[8px] z-50 w-[1040px] max-w-[calc(100%-24px)] max-h-[calc(100%-16px)] bg-white flex flex-col overflow-hidden rounded-[8px] border border-[#E5E6EB] shadow-[0_8px_28px_rgba(0,0,0,0.14)] select-none ${className}`}
    >
      {/* 顶部搜索 */}
      <div className="shrink-0 w-full px-[13px] pt-[12px]">
        <label className="h-[28px] flex items-center gap-[7px] pl-[9px] pr-[10px] rounded-[4px] border border-[#DCDCDC] bg-white focus-within:border-[#166EFF]">
          <NavIcon name="Search" size={13} color="#A8ABB2" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="通过名称搜索服务"
            className="flex-1 min-w-0 bg-transparent outline-none text-[13px] leading-none text-[#1D2129] placeholder:text-[#A8ABB2]"
          />
        </label>
      </div>

      {/* 5 列产品导航：滚动条贴面板右缘，内容限宽靠左 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex min-h-full w-full">
          {filtered.map((column, ci) => (
            <div
              key={ci}
              className="flex-1 min-w-0 px-[25px] pt-[24px] pb-[24px] border-l border-[#E7E6E9] first:border-l-0"
            >
              {column.sections.map((section, si) => (
                <div key={section.title} className={si > 0 ? 'mt-[32px]' : ''}>
                  {/* 产品标题 */}
                  <div className="flex items-center gap-[11px] mb-[10px]">
                    <span className={`w-[28px] h-[28px] rounded-[8px] ${BADGE_BG} flex items-center justify-center shrink-0`}>
                      <NavIcon name={section.icon} size={16} />
                    </span>
                    <span className="text-[16px] font-semibold text-[#1D2129] leading-none">{section.title}</span>
                  </div>

                  {section.groups.map((group, gi) => (
                    <div key={group.label ?? `top-${gi}`} className={group.label ? (gi === 0 ? 'mt-[6px]' : 'mt-[10px]') : ''}>
                      {group.label ? (
                        <div className="h-[28px] flex items-center gap-[7px] pl-[1px]">
                          <span className="w-[9px] h-[9px] rounded-full bg-[#1C5BD6] shrink-0" />
                          <span className="text-[14px] text-[#4E5969] leading-none">{group.label}</span>
                        </div>
                      ) : null}
                      {group.items.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => onItemClick?.(item)}
                          className={`group w-full flex items-center gap-[11px] rounded-[4px] pr-[6px] text-left hover:bg-[#F5F7FB] ${
                            group.label ? 'h-[30px] pl-[15px]' : 'h-[34px]'
                          }`}
                        >
                          <span
                            className={`w-[18px] h-[18px] rounded-[5px] ${BADGE_BG} flex items-center justify-center shrink-0 group-hover:bg-[#E4EBFC]`}
                          >
                            <NavIcon name={item.icon} size={12} />
                          </span>
                          <span className={`truncate text-[#1D2129] ${group.label ? 'text-[14px]' : 'text-[15px]'}`}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {empty && (
          <div className="h-full flex items-center justify-center text-[14px] text-[#909399]">未找到相关服务</div>
        )}
      </div>
    </div>
  )
}
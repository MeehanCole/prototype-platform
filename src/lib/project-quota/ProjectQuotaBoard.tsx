/**
 * 项目配额素材
 *
 * 从「数据管理 · 项目配额」页抽取的可复用工作台：
 *   - 项目基本信息卡 + 管理菜单
 *   - Tab 切换（配额内容由调用方传入）
 *   - 容器配额 / 项目配额长条卡片
 *   - 通用弹窗骨架与按钮组
 *
 * 素材只负责结构与视觉，不依赖路由、页面 meta、PRD 批注或具体业务数据；
 * 图标、数据、文案与交互全部由 props 注入。
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type ProjectQuotaIconKind =
  | 'cpu'
  | 'mem'
  | 'pod'
  | 'service'
  | 'stateful'
  | 'daemon'
  | 'storage'

export interface ProjectQuotaInfo {
  name: string
  tenant: string
  creator: string
  createdAt: string
  members: string
  serviceAccounts: string
  description: string
}

/** 可编辑配额行：quota 为 null 表示不限制，used 为 null 表示无数据 */
export interface ProjectQuotaRow {
  key: string
  label: string
  icon: ProjectQuotaIconKind
  unit: string
  used: number | null
  quota: number | null
}

/** 容器配额按资源类型分组，每组从配额行中取「请求」「限制」两列 */
export interface ProjectQuotaContainerGroup {
  key: string
  label: string
  icon: ProjectQuotaIconKind
  requestKey: string
  limitKey: string
}

export interface ProjectQuotaIcons {
  home: ReactNode
  building: ReactNode
  user: ReactNode
  clock: ReactNode
  idcard: ReactNode
  notebook: ReactNode
  trash: ReactNode
  resource: (kind: ProjectQuotaIconKind) => ReactNode
}

export interface ProjectQuotaSectionTitles {
  containerQuota: string
  projectQuota: string
}

export interface ProjectQuotaBoardProps {
  info: ProjectQuotaInfo
  containerRows: ProjectQuotaRow[]
  containerGroups: ProjectQuotaContainerGroup[]
  projectRows: ProjectQuotaRow[]
  tabs: readonly string[]
  quotaTab: string
  activeTab: string
  sectionTitles: ProjectQuotaSectionTitles
  icons: ProjectQuotaIcons
  title: string
  description?: string
  manageLabel?: string
  manageItems: Array<{ key: string; label: string; icon: ReactNode }>
  deleteLabel?: string
  emptyText?: string
  deleted?: boolean
  deletedView?: ReactNode
  extra?: ReactNode
  onTabChange: (tab: string) => void
  onManageItem: (key: string) => void
  onDelete: () => void
}

/* ------------------------------- 展示工具 ------------------------------- */

/** 配额展示：不限制 / 12 核 */
export function quotaText(row: ProjectQuotaRow, value: number | null) {
  if (value === null) return '不限制'
  return row.unit ? `${value} ${row.unit}` : String(value)
}

/** 已使用展示：无数据为 - */
export function usedText(row: ProjectQuotaRow) {
  if (row.used === null) return '-'
  return row.unit ? `${row.used} ${row.unit}` : String(row.used)
}

/** 余量：不限制时同样不限制；已使用无数据时按 0 计算 */
export function remainText(row: ProjectQuotaRow) {
  if (row.quota === null) return '不限制'
  const used = row.used ?? 0
  const remain = Math.max(0, row.quota - used)
  return row.unit ? `${remain} ${row.unit}` : String(remain)
}

/* ------------------------------- 基础组件 ------------------------------- */

function InfoField({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-[2px] shrink-0 text-[#a7acb3]">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-[#1d2129]" title={value}>
          {value}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-[12px] text-[#86909c]">{label}</p>
      </div>
    </div>
  )
}

/** 长条卡片里的一列：上行数值，下行灰色列名 */
function CardCell({
  value,
  label,
  className = '',
}: {
  value: string
  label: string
  className?: string
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="truncate text-[13px] font-medium text-[#1d2129]" title={value}>
        {value}
      </p>
      <p className="mt-1 whitespace-nowrap text-[12px] text-[#86909c]">{label}</p>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-[16px] font-bold text-[#1d2129]">{title}</h2>
}

/** 通用弹窗骨架：图标由调用方注入 */
export function ProjectQuotaDialog({
  title,
  subtitle,
  closeIcon,
  onClose,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  closeIcon: ReactNode
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-[600px] max-w-[92vw] rounded-[4px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between border-b border-[#f0f0f0] px-6 py-4">
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#1d2129]">{title}</p>
            {subtitle && <p className="mt-1 truncate text-[12px] text-[#86909c]">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="ml-3 shrink-0 text-[#86909c] transition-colors hover:text-[#1d2129]"
          >
            {closeIcon}
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex items-center justify-end gap-3 border-t border-[#f0f0f0] px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  )
}

export function ProjectQuotaDialogButtons({
  onCancel,
  onConfirm,
  confirmText = '保存',
  danger = false,
}: {
  onCancel: () => void
  onConfirm: () => void
  confirmText?: string
  danger?: boolean
}) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 min-w-[64px] rounded-[2px] border border-[#e5e6eb] bg-white px-4 text-[13px] text-[#1d2129] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
      >
        取消
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`h-8 min-w-[64px] rounded-[2px] px-4 text-[13px] text-white transition-colors ${
          danger ? 'bg-[#f53f3f] hover:bg-[#d92d2d]' : 'bg-[#166eff] hover:bg-[#0d5fe0]'
        }`}
      >
        {confirmText}
      </button>
    </>
  )
}

/* ------------------------------- 主工作台 ------------------------------- */

export function ProjectQuotaBoard({
  info,
  containerRows,
  containerGroups,
  projectRows,
  tabs,
  quotaTab,
  activeTab,
  sectionTitles,
  icons,
  title,
  description,
  manageLabel = '管理',
  manageItems,
  deleteLabel = '删除',
  emptyText = '暂无数据',
  deleted = false,
  deletedView,
  extra,
  onTabChange,
  onManageItem,
  onDelete,
}: ProjectQuotaBoardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  /** 点击空白处关闭「管理」下拉 */
  useEffect(() => {
    if (!menuOpen) return
    const handle = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  if (deleted) {
    return (
      <main className="flex min-w-0 flex-1 items-center justify-center bg-white">
        {deletedView}
      </main>
    )
  }

  return (
    <main className="min-w-0 flex-1 overflow-auto bg-white px-6 pb-8 pt-6">
      <h1 className="text-[28px] font-bold leading-10 text-[#323232]">{title}</h1>
      {description && <p className="mt-2 text-[14px] leading-6 text-[#aaaaaa]">{description}</p>}

      <section className="mt-6 rounded-[2px] border border-[#e5e6eb] bg-white px-5 py-4">
        <div className="flex items-start gap-6">
          <div className="grid min-w-0 flex-1 grid-cols-4 gap-x-6 gap-y-4">
            <InfoField icon={icons.home} label="名称" value={info.name} />
            <InfoField icon={icons.building} label="租户" value={info.tenant} />
            <InfoField icon={icons.user} label="创建者" value={info.creator} />
            <InfoField icon={icons.clock} label="创建时间" value={info.createdAt} />
            <InfoField icon={icons.idcard} label="项目成员" value={info.members} />
            <InfoField icon={icons.user} label="服务账户" value={info.serviceAccounts} />
            <InfoField icon={icons.notebook} label="描述" value={info.description} />
          </div>

          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="h-8 rounded-[2px] bg-[#166eff] px-4 text-[13px] text-white transition-colors hover:bg-[#0d5fe0]"
            >
              {manageLabel}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[36px] z-30 w-[152px] rounded-[4px] border border-[#e5e6eb] bg-white py-1 shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
              >
                <span className="absolute -top-[5px] right-6 h-2.5 w-2.5 rotate-45 border-l border-t border-[#e5e6eb] bg-white" />
                {manageItems.map((item) => (
                  <button
                    key={item.key}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onManageItem(item.key)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#1d2129] transition-colors hover:bg-[#f2f5ff] hover:text-[#166eff]"
                  >
                    <span className="text-[#4e5969]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="my-1 h-px bg-[#f0f0f0]" />
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#1d2129] transition-colors hover:bg-[#f2f5ff] hover:text-[#166eff]"
                >
                  <span className="text-[#4e5969]">{icons.trash}</span>
                  {deleteLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mt-4 flex w-full items-center gap-1 rounded-[2px] bg-[#f5f6fa] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`h-8 rounded-[2px] px-4 text-[13px] transition-colors ${
              activeTab === tab
                ? 'bg-[#166eff] font-medium text-white'
                : 'text-[#4e5969] hover:text-[#166eff]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === quotaTab ? (
        <>
          <section className="mt-5">
            <SectionTitle title={sectionTitles.containerQuota} />
            <div className="mt-3 space-y-2.5">
              {containerGroups.map((group) => {
                const request = containerRows.find((row) => row.key === group.requestKey)
                const limit = containerRows.find((row) => row.key === group.limitKey)
                return (
                  <div
                    key={group.key}
                    className="flex items-start rounded-[2px] border border-[#e9edf2] bg-[#f9fbfd] px-5 py-2.5"
                  >
                    <div className="flex w-[34%] min-w-0 items-start gap-2">
                      <span className="mt-[1px] shrink-0">{icons.resource(group.icon)}</span>
                      <CardCell value={group.label} label="资源类型" />
                    </div>
                    <CardCell
                      className="w-[22%]"
                      value={request ? quotaText(request, request.quota) : '-'}
                      label={`${group.label}请求`}
                    />
                    <CardCell
                      className="w-[22%]"
                      value={limit ? quotaText(limit, limit.quota) : '-'}
                      label={`${group.label}限制`}
                    />
                    <CardCell className="w-[22%]" value="" label="" />
                  </div>
                )
              })}
            </div>
          </section>

          <section className="mt-5">
            <SectionTitle title={sectionTitles.projectQuota} />
            <div className="mt-3 space-y-2.5">
              {projectRows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-start rounded-[2px] border border-[#e9edf2] bg-[#f9fbfd] px-5 py-2.5"
                >
                  <div className="flex w-[34%] min-w-0 items-start gap-2">
                    <span className="mt-[1px] shrink-0">{icons.resource(row.icon)}</span>
                    <CardCell value={row.label} label="资源类型" />
                  </div>
                  <CardCell className="w-[22%]" value={usedText(row)} label="已使用" />
                  <CardCell className="w-[22%]" value={quotaText(row, row.quota)} label="配额" />
                  <CardCell className="w-[22%]" value={remainText(row)} label="余量" />
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="mt-6 flex h-[300px] items-center justify-center rounded-[2px] border border-[#e5e6eb] bg-[#fafafa] text-[13px] text-[#86909c]">
          {emptyText}
        </div>
      )}

      {extra}
    </main>
  )
}

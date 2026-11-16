import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

/** 系统设置页统一页头 */
export function SettingsPageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="shrink-0 border-b border-[#E5E6EB] bg-white px-[24px] pb-[14px] pt-[18px]">
      <h1 className="text-[17px] font-semibold text-[#1D2129]">{title}</h1>
      {description && <p className="mt-[5px] text-[12px] text-[#86909C]">{description}</p>}
    </div>
  )
}

/** 列表工具栏：左侧搜索，右侧主操作 */
export function SettingsToolbar({
  children,
  actions,
}: {
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-[12px] border-b border-[#E5E6EB] bg-[#F5F7FA] px-[24px] py-[12px]">
      <div className="flex flex-wrap items-center gap-[8px]">{children}</div>
      {actions && <div className="flex items-center gap-[8px]">{actions}</div>}
    </div>
  )
}

/** 搜索输入 + 重置/搜索按钮 */
export function SettingsSearch({
  value,
  onChange,
  onSearch,
  onReset,
  placeholder,
  width = 'w-[280px]',
}: {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onReset: () => void
  placeholder: string
  width?: string
}) {
  return (
    <form
      className="flex items-center"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className={`relative ${width}`}>
        <Search className="absolute left-[10px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#A9AEB8]" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-[32px] w-full rounded-[3px] border border-[#D9DEE7] bg-white pl-[32px] pr-[10px] text-[13px] text-[#1D2129] outline-none transition-colors placeholder:text-[#A9AEB8] focus:border-[#166EFF]"
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        className="ml-[8px] h-[32px] rounded-[3px] border border-[#D9DEE7] bg-white px-[14px] text-[13px] text-[#4E5969] transition-colors hover:border-[#166EFF] hover:text-[#166EFF]"
      >
        重置
      </button>
      <button
        type="submit"
        className="ml-[8px] h-[32px] rounded-[3px] bg-[#166EFF] px-[18px] text-[13px] text-white transition-colors hover:bg-[#0E5CE6]"
      >
        搜索
      </button>
    </form>
  )
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex h-[32px] items-center gap-[5px] rounded-[3px] bg-[#166EFF] px-[14px] text-[13px] text-white transition-colors hover:bg-[#0E5CE6]"
    >
      {children}
    </button>
  )
}

export function OutlineButton({
  children,
  onClick,
  danger = false,
}: {
  children: ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[32px] items-center gap-[5px] rounded-[3px] border bg-white px-[12px] text-[13px] transition-colors ${
        danger
          ? 'border-[#F2C7C7] text-[#F53F3F] hover:border-[#F53F3F] hover:bg-[#FFF5F5]'
          : 'border-[#D9DEE7] text-[#4E5969] hover:border-[#166EFF] hover:text-[#166EFF]'
      }`}
    >
      {children}
    </button>
  )
}

export function EnabledBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex h-[20px] items-center rounded-[2px] px-[6px] text-[12px] ${
        enabled ? 'bg-[#E8FFEA] text-[#00B42A]' : 'bg-[#F2F3F5] text-[#86909C]'
      }`}
    >
      {enabled ? '已启用' : '已停用'}
    </span>
  )
}

/** 设置页统一分页：条数、每页条数、翻页与跳页 */
export function SettingsPagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [jump, setJump] = useState('')
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => totalPages <= 7 || item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  )

  const goTo = (value: number) => {
    const next = Math.min(totalPages, Math.max(1, value))
    onPageChange(next)
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-[10px] border-t border-[#E5E6EB] bg-white px-[24px] py-[12px] text-[12px] text-[#4E5969]">
      <span>共 {total} 条</span>
      <select
        value={pageSize}
        onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
        disabled={!onPageSizeChange}
        className="h-[28px] rounded-[3px] border border-[#D9DEE7] bg-white px-[6px] text-[12px] text-[#4E5969] outline-none disabled:opacity-60"
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size} 条/页
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        title="上一页"
        className="flex h-[28px] w-[28px] items-center justify-center rounded-[3px] border border-[#D9DEE7] text-[#4E5969] transition-colors hover:border-[#166EFF] hover:text-[#166EFF] disabled:cursor-not-allowed disabled:text-[#C9CDD4] disabled:hover:border-[#D9DEE7]"
      >
        <ChevronLeft className="h-[14px] w-[14px]" />
      </button>
      {pages.map((item, index) => {
        const previous = pages[index - 1]
        const hasGap = previous && item - previous > 1
        return (
          <span key={item} className="contents">
            {hasGap && <span className="px-[2px] text-[#86909C]">...</span>}
            <button
              type="button"
              onClick={() => goTo(item)}
              className={`h-[28px] min-w-[28px] rounded-[3px] border px-[6px] text-[12px] transition-colors ${
                item === page
                  ? 'border-[#166EFF] bg-[#166EFF] text-white'
                  : 'border-[#D9DEE7] bg-white text-[#4E5969] hover:border-[#166EFF] hover:text-[#166EFF]'
              }`}
            >
              {item}
            </button>
          </span>
        )
      })}
      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        title="下一页"
        className="flex h-[28px] w-[28px] items-center justify-center rounded-[3px] border border-[#D9DEE7] text-[#4E5969] transition-colors hover:border-[#166EFF] hover:text-[#166EFF] disabled:cursor-not-allowed disabled:text-[#C9CDD4] disabled:hover:border-[#D9DEE7]"
      >
        <ChevronRight className="h-[14px] w-[14px]" />
      </button>
      <span className="ml-[2px] flex items-center gap-[5px]">
        前往
        <input
          value={jump}
          onChange={(event) => setJump(event.target.value.replace(/\D/g, ''))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && jump) {
              goTo(Number(jump))
              setJump('')
            }
          }}
          className="h-[28px] w-[42px] rounded-[3px] border border-[#D9DEE7] text-center text-[12px] text-[#1D2129] outline-none focus:border-[#166EFF]"
        />
        页
      </span>
    </div>
  )
}

/** 弹窗壳，供各设置页复用 */
export function SettingsModal({
  title,
  children,
  onClose,
  footer,
  width = 'w-[520px]',
}: {
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  width?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.45)]" onClick={onClose}>
      <div
        className={`${width} max-h-[calc(100vh-120px)] overflow-hidden rounded-[6px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5E6EB] px-[20px] py-[14px]">
          <h3 className="text-[15px] font-medium text-[#1D2129]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[20px] leading-none text-[#86909C] transition-colors hover:text-[#1D2129]"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(100vh-240px)] overflow-y-auto px-[20px] py-[18px]">{children}</div>
        {footer && <div className="flex justify-end gap-[8px] border-t border-[#E5E6EB] px-[20px] py-[12px]">{footer}</div>}
      </div>
    </div>
  )
}

export function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-[6px] block text-[13px] text-[#4E5969]">
      {required && <span className="mr-[2px] text-[#F53F3F]">*</span>}
      {children}
    </label>
  )
}

export const inputClass =
  'h-[34px] w-full rounded-[3px] border border-[#D9DEE7] bg-white px-[10px] text-[13px] text-[#1D2129] outline-none transition-colors placeholder:text-[#A9AEB8] focus:border-[#166EFF]'
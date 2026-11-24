/**
 * 表格分页（通用件）
 *
 * 一行式布局，从左到右依次是：
 *   共 N 条 · [每页条数 ▾] · [‹] [1] [2] … [›]
 *
 * 视觉来源：设计稿「共 5 条 / 12 条/页 / 蓝色方块当前页」，
 * 控件统一 35px 高、2px 圆角、10px 间距；当前页为品牌色实心方块 + 白字，
 * 其余页码与左右翻页同为 35×35 的 #F5F5F5 方块（无描边）。
 *
 * 约定：
 *   - 组件内不出现任何业务文案与路由，标题模板通过 props 注入；
 *   - 品牌色取 CSS 变量 --shell-accent，未定义时回退 #166eff；
 *   - 页码过多时自动折叠为 … 省略号。
 *
 * 规范见 docs/TablePagination/表格分页.md。
 */
import type { ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

/** 品牌色：与平台外壳共用同一个 CSS 变量 */
const ACCENT_BG = 'bg-[var(--shell-accent,#166eff)]'
const ACCENT_BORDER = 'focus:border-[var(--shell-accent,#166eff)]'

/** 控件尺寸与中性色（与设计稿一致，不随主题变化） */
const H = 'h-[35px]'
const NAV_BTN = `flex ${H} w-[35px] shrink-0 items-center justify-center rounded-[2px] bg-[#f5f5f5] text-[#595959] transition-colors hover:bg-[#ebebeb] disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#c9cdd4] disabled:hover:bg-[#f5f5f5]`
const TEXT = 'text-[13px] leading-none text-[#656565]'

export interface PaginationChange {
  page: number
  pageSize: number
}

export interface TablePaginationProps {
  /** 总条数（未过滤前的结果数） */
  total: number
  /** 当前页，从 1 开始 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 每页条数可选项，默认 [10, 20, 50] */
  pageSizeOptions?: number[]
  /** 页码或每页条数变化时回调，参数同时带出两者，避免调用方拼装 */
  onChange: (next: PaginationChange) => void
  /** 左侧总数文案，默认「共 N 条」 */
  renderTotal?: (total: number) => ReactNode
  /** 每页条数选项文案，默认「N 条/页」 */
  renderPageSize?: (size: number) => ReactNode
  /** 是否展示每页条数选择器，默认展示 */
  showPageSize?: boolean
  /** 右侧插槽：放批量操作提示、刷新时间等 */
  extra?: ReactNode
  /** 外层附加类名（控制外边距、对齐等） */
  className?: string
}

/**
 * 计算要展示的页码序列
 *
 * 规则：首尾页常驻，当前页左右各留 1 页，其余折叠为 '...'
 * 例：当前 6 / 共 20 页 → 1 … 5 6 7 … 20
 */
export function pageWindow(page: number, totalPages: number): Array<number | '...'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const left = Math.max(2, page - 1)
  const right = Math.min(totalPages - 1, page + 1)
  const out: Array<number | '...'> = [1]
  if (left > 2) out.push('...')
  for (let i = left; i <= right; i += 1) out.push(i)
  if (right < totalPages - 1) out.push('...')
  out.push(totalPages)
  return out
}

export function TablePagination({
  total,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onChange,
  renderTotal,
  renderPageSize,
  showPageSize = true,
  extra,
  className = '',
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(page, 1), totalPages)

  return (
    <div className={`flex flex-wrap items-center gap-[25px] ${className}`}>
      {/* 总条数 */}
      <span className={TEXT}>{renderTotal ? renderTotal(total) : `共 ${total} 条`}</span>

      <div className="flex items-center gap-[10px]">
        {/* 每页条数 */}
        {showPageSize && (
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onChange({ page: 1, pageSize: Number(e.target.value) })}
              aria-label="每页条数"
              className={`${H} w-[94px] appearance-none rounded-[2px] border border-[#dcdfe6] bg-white pl-3 pr-7 text-[13px] leading-none text-[#616266] outline-none transition-colors ${ACCENT_BORDER}`}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {renderPageSize ? renderPageSize(option) : `${option} 条/页`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8a8f99]"
            />
          </div>
        )}

        {/* 上一页 */}
        <button
          type="button"
          aria-label="上一页"
          disabled={current <= 1}
          onClick={() => onChange({ page: current - 1, pageSize })}
          className={NAV_BTN}
        >
          <ChevronLeft size={15} strokeWidth={2} />
        </button>

        {/* 页码 */}
        {pageWindow(current, totalPages).map((item, index) =>
          item === '...' ? (
            <span
              key={`omit-${index}`}
              className="flex h-[35px] w-[15px] shrink-0 items-center justify-center text-[13px] leading-none text-[#8a8f99]"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === current ? 'page' : undefined}
              onClick={() => onChange({ page: item, pageSize })}
              className={`flex ${H} min-w-[35px] shrink-0 items-center justify-center rounded-[2px] px-1 text-[13px] leading-none tabular-nums transition-colors ${
                item === current
                  ? `${ACCENT_BG} text-white`
                  : 'bg-[#f5f5f5] text-[#595959] hover:bg-[#ebebeb]'
              }`}
            >
              {item}
            </button>
          ),
        )}

        {/* 下一页 */}
        <button
          type="button"
          aria-label="下一页"
          disabled={current >= totalPages}
          onClick={() => onChange({ page: current + 1, pageSize })}
          className={NAV_BTN}
        >
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>

      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  )
}

/**
 * 检索条（通用件）
 *
 * 组合式检索条：一个「输入框 + 后置放大镜按钮」的组合框，右侧可跟一个刷新按钮。
 *
 * 两种形态（同一个组件，靠是否传 fields 切换）：
 *   - 单输入形态：[ 输入名称搜索        ][🔍] [↻]
 *   - 带过滤项形态：[ 名称 ▾ ][ 请输入  ][🔍] [↻]
 *     前置下拉由 fields / fieldValue / onFieldChange 控制。
 *
 * 视觉来源：设计稿「白底列表工具条」，控件统一 32px 高、4px 圆角；
 * 组合框描边 #D9DDE3，前置下拉与后置搜索按钮为 #F5F6F8 灰底 addon，
 * 文字 #4E5969，placeholder / 图标 #86909C。
 *
 * 约定：
 *   - 组件内不出现任何业务文案与路由，文案全部通过 props 注入；
 *   - 品牌色只用于聚焦描边，取 CSS 变量 --shell-accent，未定义时回退 #166eff；
 *   - 卡片外壳（白底 + 阴影 + 内边距）由使用方包裹，组件只管控件行。
 *
 * 规范见 docs/SearchBar/检索条.md。
 */
import { useId } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, RefreshCw, Search, X } from 'lucide-react'

/** 品牌色：与平台外壳共用同一个 CSS 变量 */
const FOCUS = 'focus-within:border-[var(--shell-accent,#166eff)]'

/** 控件尺寸与中性色（与设计稿一致，不随主题变化） */
const H = 'h-8'
const GROUP = `inline-flex ${H} items-stretch rounded-[4px] border border-[#d9dde3] bg-white transition-colors ${FOCUS}`
const ADDON = 'flex items-center justify-center bg-[#f5f6f8] text-[#86909c] transition-colors hover:bg-[#ebedf0]'

export interface SearchFieldOption {
  /** 下拉里显示的文字 */
  label: string
  /** 下拉的值 */
  value: string
}

export interface SearchBarProps {
  /** 输入框的值 */
  value: string
  /** 输入变化 */
  onChange: (value: string) => void
  /** 点击放大镜或按 Enter 时触发 */
  onSearch: () => void
  /** 传了才渲染前置字段下拉，即「带过滤项」形态 */
  fields?: SearchFieldOption[]
  /** 当前选中的字段 */
  fieldValue?: string
  /** 字段变化 */
  onFieldChange?: (value: string) => void
  /** 输入框占位文案，默认「输入名称搜索」 */
  placeholder?: string
  /** 输入框宽度（px），默认 222 */
  inputWidth?: number
  /** 前置字段下拉宽度（px），默认 94 */
  fieldWidth?: number
  /** 有内容时是否展示输入框内的清空按钮，默认不展示 */
  showClear?: boolean
  /** 点击清空：清空草稿并立即恢复全量列表由使用方实现 */
  onClear?: () => void
  /** 用自定义控件替代输入框（如「调用模型名」下拉），宽度仍取 inputWidth */
  control?: ReactNode
  /** 是否展示右侧刷新按钮，默认展示 */
  showRefresh?: boolean
  /** 点击刷新 */
  onRefresh?: () => void
  /** 刷新按钮的 title / aria-label，默认「刷新」 */
  refreshTitle?: string
  /** 无障碍标签，默认取 placeholder */
  'aria-label'?: string
  /** 右侧插槽：放「更多筛选」等 */
  extra?: ReactNode
  /** 外层附加类名 */
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  fields,
  fieldValue,
  onFieldChange,
  placeholder = '输入名称搜索',
  inputWidth = 222,
  fieldWidth = 94,
  showClear = false,
  onClear,
  control,
  showRefresh = true,
  onRefresh,
  refreshTitle = '刷新',
  extra,
  className = '',
  ...rest
}: SearchBarProps) {
  const inputId = useId()
  const hasFields = Boolean(fields && fields.length > 0)
  const currentField = fieldValue ?? fields?.[0]?.value
  const selectedLabel = fields?.find((f) => f.value === currentField)?.label ?? ''

  return (
    <div className={`flex flex-wrap items-center gap-[10px] ${className}`}>
      <div className={GROUP}>
        {/* 前置字段下拉（带过滤项形态） */}
        {hasFields && (
          <div className="relative flex h-full shrink-0 items-stretch border-r border-[#d9dde3]">
            {/* 自绘展示层：原生 select 透明叠在上面，避免各浏览器自带箭头 */}
            <div
              className="flex items-center rounded-l-[4px] bg-[#f5f6f8] pl-3 pr-6 text-[14px] text-[#4e5969]"
              style={{ width: fieldWidth }}
            >
              <span className="truncate">{selectedLabel}</span>
            </div>
            <select
              value={fieldValue ?? fields![0].value}
              onChange={(e) => onFieldChange?.(e.target.value)}
              aria-label="检索字段"
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
            >
              {fields!.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              aria-hidden
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#86909c]"
            />
          </div>
        )}

        {/* 后置控件：默认输入框；传 control 时由其替代（如字段联动下拉） */}
        {control ? (
          <div className="relative flex h-full min-w-0 items-stretch" style={{ width: inputWidth }}>
            {control}
          </div>
        ) : (
          <div className="relative flex h-full items-stretch">
            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch()
                if (e.key === 'Escape') onChange('')
              }}
              placeholder={placeholder}
              aria-label={rest['aria-label'] ?? placeholder}
              style={{ width: inputWidth }}
              className={`h-full min-w-0 bg-transparent pl-3 text-[14px] leading-none text-[#1f2329] outline-none placeholder:text-[#86909c] ${
                showClear && value ? 'pr-8' : 'pr-3'
              }`}
            />
            {showClear && value && (
              <button
                type="button"
                onClick={() => (onClear ? onClear() : onChange(''))}
                aria-label="清空搜索内容"
                title="清空"
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#86909c] transition-colors hover:bg-[#f2f3f5] hover:text-[#4e5969]"
              >
                <X size={13} aria-hidden />
              </button>
            )}
          </div>
        )}

        {/* 后置搜索按钮 */}
        <button
          type="button"
          onClick={onSearch}
          aria-label="搜索"
          className={`${ADDON} h-full w-[54px] shrink-0 rounded-r-[4px] border-l border-[#d9dde3]`}
        >
          <Search size={14} aria-hidden />
        </button>
      </div>

      {/* 刷新 */}
      {showRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          title={refreshTitle}
          aria-label={refreshTitle}
          className={`${H} flex w-[54px] shrink-0 items-center justify-center rounded-[4px] border border-[#d9dde3] bg-white text-[#4e5969] transition-colors hover:bg-[#f5f6f8]`}
        >
          <RefreshCw size={14} aria-hidden />
        </button>
      )}

      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  )
}
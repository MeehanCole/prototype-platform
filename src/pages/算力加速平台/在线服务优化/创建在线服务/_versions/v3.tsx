import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlatformHeader, SideNav } from '../../在线服务/_shared'
import { DETAILS, type ServiceDetail } from '../../在线服务详情/data'
import { DocPanel, DocProvider, FEATURES, NewTag } from '../feature-tags-v3'

/* 点击组件外部时收起下拉 */
function useOutsideClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!ref.current) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <div className="flex items-center justify-end w-[148px] shrink-0">
      <span className="text-[16px] text-[#333]">{text}</span>
      {required && <span className="ml-1 text-[16px] text-[#F5222D]">*</span>}
    </div>
  )
}

function SectionTitle({ text }: { text: string }) {
  return (
    <div className="flex items-center h-[19px] ml-[56px]">
      <span className="w-[3px] h-[17px] bg-[#333] mr-[14px]" />
      <span className="text-[17px] font-semibold text-[#1f2329]">{text}</span>
    </div>
  )
}

function Radio({
  checked,
  label,
  hint,
  onChange,
  disabled,
}: {
  checked?: boolean
  label: string
  hint?: string
  onChange?: () => void
  disabled?: boolean
}) {
  const showHint = hint === 'true'
  return (
    <span
      className={`flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onChange}
    >
      <span
        className={`inline-flex items-center justify-center w-[15px] h-[15px] rounded-full border ${
          checked
            ? 'border-[#166EFF] bg-[#166EFF]'
            : disabled
              ? 'border-[#e0e0e0] bg-[#fafafa]'
              : 'border-[#d9d9d9] bg-white'
        }`}
      >
        {checked && <span className="w-[5px] h-[5px] rounded-full bg-white block" />}
      </span>
      <span
        className={`ml-2 text-[15px] ${
          checked ? 'text-[#166EFF]' : disabled ? 'text-[#bfbfbf]' : 'text-[#333]'
        }`}
      >
        {label}
      </span>
      {showHint && (
        <span className="relative ml-1.5 group inline-flex">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6.5" fill="#999" />
            <text x="8" y="11.5" textAnchor="middle" fontSize="9" fill="#fff" fontStyle="italic" fontWeight="bold">
              ?
            </text>
          </svg>
          <span className="pointer-events-none select-none absolute bottom-[22px] left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
            <span className="block whitespace-nowrap rounded-[6px] bg-[#262626] px-[14px] py-[10px] text-[14px] text-white">
              仅平台管理员在官方推理服务项目可公开发布
            </span>
            <span className="mx-auto -mt-[5px] block h-[10px] w-[10px] rotate-45 bg-[#262626]" />
          </span>
        </span>
      )}
    </span>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center w-[47px] h-[24px] rounded-full relative cursor-pointer transition-colors ${
        on ? 'bg-[#409EFE]' : 'bg-[#e3e4ea]'
      }`}
    >
      <span
        className={`absolute w-[20px] h-[20px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all ${
          on ? 'left-[25px]' : 'left-[2px]'
        }`}
      />
    </button>
  )
}

/* 后端推理实例下拉数据（含关联模型名，用于关联模型过滤 + 首个实例自动填充调用模型名） */
const INSTANCE_OPTIONS: Record<'internal' | 'external', { label: string; running: boolean; model: string; plazaModel?: string }[]> = {
  internal: [
    { label: 'test', running: false, model: 'Qwen3-32B' },
    { label: 'moe模型hang验证', running: true, model: 'Qwen3.5-35B-A3B', plazaModel: 'Qwen3.5-35B-A3B' },
    { label: 'moe模型hang验证-副本', running: true, model: 'Qwen3.5-35B-A3B', plazaModel: 'Qwen3.5-35B-A3B' },
    { label: 'vllm验证', running: true, model: 'DeepSeek-R1-Distill-Qwen-32B' },
    { label: 'kt服务', running: true, model: 'QwQ-32B' },
    { label: 'kt服务-蓝组', running: true, model: 'QwQ-32B' },
    { label: 'kt服务-绿组', running: true, model: 'QwQ-32B' },
  ],
  external: [
    { label: '阿里不完整路径', running: true, model: 'qwen-max' },
    { label: '测试服务异常', running: true, model: 'qwen-plus' },
    { label: '阿里百炼服务', running: true, model: 'qwen-plus' },
    { label: '外部服务', running: true, model: 'deepseek-v3' },
    { label: 'demo-18080', running: true, model: 'Qwen2.5-72B-Instruct' },
    { label: 'demo-18080-model接口', running: true, model: 'Qwen2.5-72B-Instruct' },
    { label: 'demo-18081', running: true, model: 'Qwen2.5-72B-Instruct' },
    { label: 'demo-18082', running: true, model: 'Qwen2.5-72B-Instruct' },
    { label: '百炼基线服务', running: true, model: 'qwen-plus' },
    { label: '百炼灰度服务', running: true, model: 'qwen-plus' },
  ],
}

function InstanceSelect({
  backend,
  values,
  onChange,
  modelFilter,
}: {
  backend: 'internal' | 'external'
  values: string[]
  onChange: (v: string[]) => void
  /** 关联模型过滤：仅展示关联模型（modelFilter）相同的推理实例；为空表示不过滤 */
  modelFilter?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(rootRef, () => setOpen(false))
  const all = INSTANCE_OPTIONS[backend]
  // 关联模型过滤：只展示与关联模型相同的推理实例（model 字段一致）
  const options = modelFilter ? all.filter((o) => o.model === modelFilter) : all
  const toggle = (label: string) => {
    onChange(values.includes(label) ? values.filter((v) => v !== label) : [...values, label])
  }
  return (
    <span ref={rootRef} className="relative ml-[53px] w-[600px] inline-block align-top">
      <span
        onClick={() => setOpen((o) => !o)}
        className={`min-h-[45px] flex items-center flex-wrap gap-[6px] rounded border bg-white px-3 py-[5px] text-[14px] cursor-pointer ${
          open ? 'border-[#166EFF]' : 'border-[#d9d9d9]'
        }`}
      >
        {values.length === 0 && <span className="text-[#bfbfbf]">请选择后端推理实例</span>}
        {values.map((v) => (
          <span
            key={v}
            onClick={(e) => {
              e.stopPropagation()
              toggle(v)
            }}
            className="inline-flex items-center gap-[6px] rounded-[3px] bg-[#f5f5f5] px-[8px] h-[26px] text-[13px] text-[#999]"
          >
            {v}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="#999"
              strokeWidth="1.3"
              strokeLinecap="round"
              aria-hidden
              className="cursor-pointer hover:stroke-[#666]"
            >
              <path d="m2 2 6 6M8 2 2 8" />
            </svg>
          </span>
        ))}
        <svg
          width="14"
          height="14"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={`ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {open && (
        <span className="absolute left-0 top-full mt-[7px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <span className="absolute -top-[5px] left-1/2 -ml-[5px] h-[10px] w-[10px] rotate-45 border-l border-t border-[#e4e6eb] bg-white" />
          <span className="block py-[6px]">
            {options.length === 0 ? (
              <span className="flex h-[80px] items-center justify-center px-[26px] text-center text-[14px] text-[#999]">
                当前关联模型（{modelFilter}）暂无可匹配的推理实例，请先在推理实例管理中部署相同模型的实例
              </span>
            ) : (
              options.map((opt) => {
                const selected = values.includes(opt.label)
                const disabledOpt = !opt.running
                return (
                  <span
                    key={opt.label}
                    onClick={() => !disabledOpt && toggle(opt.label)}
                    className={`flex h-[41px] items-center justify-between px-[26px] ${disabledOpt ? 'cursor-not-allowed' : 'cursor-pointer'} ${selected ? 'bg-[#f5f7fa]' : disabledOpt ? 'bg-[#fafafa]' : 'hover:bg-[#f5f7fa]'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`text-[15px] ${disabledOpt ? 'text-[#bbb]' : selected ? 'text-[#166EFF]' : 'text-[#333]'}`}>{opt.label}</span>
                      <span className="rounded bg-[#f0f2f5] px-1.5 py-0.5 text-[12px] text-[#666]">模型: {opt.model}</span>
                    </span>
                    <span className={`text-[14px] ${disabledOpt ? 'text-[#bbb]' : opt.running ? 'text-[#67C23A]' : 'text-[#999]'}`}>
                      {disabledOpt ? '已关机（不可选）' : '运行中'}
                    </span>
                  </span>
                )
              })
            )}
          </span>
        </span>
      )}
    </span>
  )
}

/* 模型广场可选模型列表 */
const PLAZA_MODELS = [
  'Qwen3.5-35B-A3B-int8',
  'Qwen3.5-35B-A3B',
  'Qwen3.5-122B-A10B-FP8',
  'QwQ-32B',
  'Qwen3-32B',
  'DeepSeek-R1-Distill-Llama-70B',
  'DeepSeek-R1-Distill-Qwen-32B',
  'Qwen2-VL-7B-Instruct',
]

function PlazaModelSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(rootRef, () => setOpen(false))

  return (
    <span ref={rootRef} className="relative ml-[53px] w-[600px] inline-block align-top">
      <span
        onClick={() => setOpen((o) => !o)}
        className={`h-[45px] flex items-center justify-between rounded border bg-white px-3 text-[14px] cursor-pointer ${
          open ? 'border-[#166EFF]' : 'border-[#d9d9d9]'
        }`}
      >
        <span className={value ? 'text-[#333]' : 'text-[#bfbfbf]'}>
          {value || '请选择关联模型'}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="w-[14px] h-[14px] rounded-full bg-[#bfbfbf] hover:bg-[#999] flex items-center justify-center text-white"
            >
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M2 2l6 6M8 2L2 8" />
              </svg>
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </span>
      {open && (
        <span className="absolute left-0 top-full mt-[4px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-[6px] max-h-[360px] overflow-y-auto">
          {PLAZA_MODELS.map((opt) => {
            const selected = value === opt
            return (
              <span
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={`flex h-[42px] items-center px-[20px] cursor-pointer ${
                  selected ? 'bg-[#f5f7fa] text-[#166EFF]' : 'text-[#333] hover:bg-[#f5f7fa]'
                }`}
              >
                <span className="text-[14px]">{opt}</span>
              </span>
            )
          })}
        </span>
      )}
    </span>
  )
}

/* 模型Fallback：类型选择（内部推理实例 / 外部推理实例） */
function FallbackTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(rootRef, () => setOpen(false))
  const opts = ['内部推理实例', '外部推理实例']
  const displayValue = value === '内部推理服务' ? '内部推理实例' : value === '外部推理服务' ? '外部推理实例' : value
  return (
    <span ref={rootRef} className="relative inline-block w-[240px]">
      <span
        onClick={() => setOpen((o) => !o)}
        className={`h-[45px] flex items-center justify-between rounded border bg-white px-4 text-[14px] text-[#333] cursor-pointer ${
          open ? 'border-[#166EFF]' : 'border-[#d9d9d9]'
        }`}
      >
        <span>{displayValue}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {open && (
        <span className="absolute left-0 top-full mt-[4px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-[6px]">
          {opts.map((opt) => (
            <span
              key={opt}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`flex h-[41px] items-center px-[26px] cursor-pointer ${
                displayValue === opt ? 'bg-[#f5f7fa] text-[#166EFF]' : 'text-[#333] hover:bg-[#f5f7fa]'
              }`}
            >
              <span className="text-[15px]">{opt}</span>
            </span>
          ))}
        </span>
      )}
    </span>
  )
}

/* 模型Fallback：推理实例选择（仅展示运行中实例） */
function FallbackServiceSelect({
  type,
  values,
  onChange,
}: {
  type: string
  values: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(rootRef, () => setOpen(false))

  const opts =
    type === '内部推理实例' || type === '内部推理服务'
      ? INSTANCE_OPTIONS.internal.filter((o) => o.running)
      : INSTANCE_OPTIONS.external.filter((o) => o.running)

  const toggle = (label: string) => {
    onChange(values.includes(label) ? values.filter((x) => x !== label) : [...values, label])
  }

  return (
    <span ref={rootRef} className="relative inline-block w-[320px]">
      <span
        onClick={() => setOpen((o) => !o)}
        className={`min-h-[45px] flex items-center justify-between rounded border bg-white px-3 py-1.5 text-[14px] cursor-pointer ${
          open ? 'border-[#166EFF]' : 'border-[#d9d9d9]'
        }`}
      >
        {values.length === 0 ? (
          <span className="text-[#bfbfbf]">选择推理实例</span>
        ) : (
          <span className="flex flex-wrap items-center gap-1.5">
            {values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[3px] bg-[#f2f3f5] text-[13px] text-[#4e5969]"
              >
                <span>{v}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle(v)
                  }}
                  className="w-[14px] h-[14px] rounded-full bg-[#c9cdd4] hover:bg-[#86909c] flex items-center justify-center text-white"
                >
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M2 2l6 6M8 2L2 8" />
                  </svg>
                </span>
              </span>
            ))}
          </span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {open && (
        <span className="absolute left-0 top-full mt-[4px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-[6px]">
          {opts.map((opt) => {
            const selected = values.includes(opt.label)
            return (
              <span
                key={opt.label}
                onClick={() => toggle(opt.label)}
                className={`flex h-[46px] items-center justify-between px-[20px] cursor-pointer ${
                  selected ? 'bg-[#f5f7fa]' : 'hover:bg-[#f5f7fa]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`text-[15px] ${selected ? 'text-[#166EFF] font-medium' : 'text-[#333]'}`}>
                    {opt.label}
                  </span>
                  <span className="inline-flex h-[20px] items-center rounded bg-[#f0f2f5] px-1.5 text-[12px] text-[#666]">
                    {opt.model}
                  </span>
                </span>
                {selected && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#166EFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3.5 8.5 3 3 6-6.5" />
                  </svg>
                )}
              </span>
            )
          })}
        </span>
      )}
    </span>
  )
}

type RouteStrategyType = '按权重分发' | '金丝雀发布' | '蓝绿发布'

/* 权重输入框：单位内嵌在框内，去掉上下步进按钮（步进交给 ↑/↓ 键，±5） */
function WeightInput({
  value,
  onChange,
  onStep,
  readOnly,
  width = 96,
  ariaLabel,
}: {
  value: string
  onChange?: (next: string) => void
  onStep?: (delta: number) => void
  readOnly?: boolean
  width?: number
  ariaLabel: string
}) {
  return (
    <span className="relative inline-flex shrink-0 items-center" style={{ width }}>
      <input
        value={value}
        readOnly={readOnly}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (!onStep) return
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            onStep(5)
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            onStep(-5)
          }
        }}
        className={`h-[32px] w-full rounded-[6px] border pr-[22px] pl-[10px] text-right text-[14px] tabular-nums outline-none transition-colors ${
          readOnly
            ? 'cursor-default border-transparent bg-[#f5f6fb] text-[#8c8c8c]'
            : 'border-[#d9d9d9] bg-white text-[#1f2329] hover:border-[#b8bec9] focus:border-[#166EFF] focus:shadow-[0_0_0_2px_rgba(22,110,255,0.12)]'
        }`}
      />
      <span className="pointer-events-none absolute right-[9px] text-[13px] text-[#8c8c8c]">%</span>
    </span>
  )
}

/* 分段控件的策略图标：金丝雀 = 大小两个流量块；蓝绿 = 两个互补色块 */
function CanaryIcon({ active }: { active: boolean }) {
  const color = active ? '#166EFF' : '#8a8f99'
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="2.5" width="8" height="9" rx="1.6" stroke={color} strokeWidth="1.2" />
      <rect x="10" y="5" width="3" height="6.5" rx="1.2" fill={color} opacity={active ? 0.9 : 0.55} />
    </svg>
  )
}

function BlueGreenIcon({ active }: { active: boolean }) {
  const color = active ? '#166EFF' : '#8a8f99'
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="2.5" width="5.5" height="9" rx="1.6" fill={color} opacity={active ? 0.9 : 0.55} />
      <rect x="7.5" y="2.5" width="5.5" height="9" rx="1.6" stroke={color} strokeWidth="1.2" />
    </svg>
  )
}

/* 常规路由策略图标：两条按比例分配的流量条 */
function WeightSplitIcon({ active }: { active: boolean }) {
  const color = active ? '#166EFF' : '#8a8f99'
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="3" width="7" height="3" rx="1.5" fill={color} opacity={active ? 0.9 : 0.55} />
      <rect x="9.5" y="3" width="3.5" height="3" rx="1.5" fill={color} opacity={0.35} />
      <rect x="1" y="8" width="3.5" height="3" rx="1.5" fill={color} opacity={0.35} />
      <rect x="6" y="8" width="7" height="3" rx="1.5" fill={color} opacity={active ? 0.9 : 0.55} />
    </svg>
  )
}

/* 实例角色色板：与堆叠条的段落颜色一一对应（行首色点是它的图例） */
const SEG_COLORS = ['#166EFF', '#5B8DEF', '#9DBDF7', '#C4D8F7', '#DCE7FB']
const segColor = (idx: number) => SEG_COLORS[idx % SEG_COLORS.length]

/* 堆叠占比条：把「各实例占多少流量」集中表达成一条 6px 的色带。
   放在面板顶部而不是每行末尾 —— 每行一根条会变成行内噪音，而集中一条既能表达比例又不重复 */
function StackedBar({
  segments,
}: {
  segments: { key: string; label: string; value: number; color: string }[]
}) {
  const visible = segments.filter((s) => s.value > 0)
  return (
    <div
      className="flex h-[6px] w-full gap-[2px] overflow-hidden rounded-full bg-[#eef1f6]"
      role="img"
      aria-label={segments.map((s) => `${s.label} ${s.value}%`).join('，')}
    >
      {visible.map((s) => (
        <span
          key={s.key}
          className="h-full min-w-[2px] rounded-[3px] transition-[flex-grow] duration-200"
          style={{ flexGrow: s.value, flexBasis: 0, background: s.color }}
        />
      ))}
    </div>
  )
}

/* 实例角色标签：金丝雀场景下区分基线与灰度的角色，纯展示 */
function RoleTag({ tone, children }: { tone: 'base' | 'canary'; children: React.ReactNode }) {
  const cls = tone === 'canary' ? 'bg-[#eef4ff] text-[#166EFF]' : 'bg-[#f2f3f5] text-[#5b6478]'
  return (
    <span className={`shrink-0 rounded-[4px] px-[6px] py-[1px] text-[12px] leading-[18px] ${cls}`}>
      {children}
    </span>
  )
}

/* 策略说明：默认收起，鼠标移入 / 键盘聚焦 / 点击才展开，避免常驻灰字占位 */
function StrategyHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useOutsideClose(ref, () => setOpen(false))
  return (
    <span
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="查看策略说明"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full text-[#b5bac4] transition-colors hover:text-[#166EFF]"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.1" />
          <path d="M8 7.3v3.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="8" cy="5" r="0.8" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-[calc(100%+8px)] top-1/2 z-20 w-[232px] -translate-y-1/2 rounded-[6px] border border-[#e4e6eb] bg-white px-[10px] py-[8px] text-[12px] leading-[18px] text-[#5b6478] shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
        >
          {text}
        </span>
      )}
    </span>
  )
}

function RedWarnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="6.6" stroke="#c9302c" strokeWidth="1.1" />
      <path d="M8 4.7v4" stroke="#c9302c" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.8" fill="#c9302c" />
    </svg>
  )
}

/* 策略分段控件：常规路由与灰度发布共用同一套外观，保证两种策略的切换器一致
   - 单项（常规路由）不可交互，仅作为「当前策略」标签，视觉上与灰度选中态完全一致
   - 多项（灰度）互斥切换，role=tablist/tab */
function StrategySegmented({
  items,
  ariaLabel,
}: {
  items: {
    label: string
    selected: boolean
    interactive?: boolean
    onSelect: () => void
    icon: (active: boolean) => React.ReactNode
  }[]
  ariaLabel: string
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex items-center gap-[3px] rounded-[8px] bg-[#f2f3f7] p-[3px]">
      {items.map((item) => {
        const clickable = item.interactive !== false
        return (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={item.selected}
            tabIndex={clickable ? undefined : -1}
            onClick={() => {
              if (clickable) item.onSelect()
            }}
            className={`flex h-[30px] items-center gap-[6px] rounded-[6px] px-[14px] text-[14px] transition-all ${
              clickable ? 'cursor-pointer' : 'cursor-default'
            } ${
              item.selected
                ? 'bg-white font-medium text-[#166EFF] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-[#5b6478] hover:text-[#1f2329]'
            }`}
          >
            {item.icon(item.selected)}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

/* 流量分发策略面板（常规路由：按权重分发 / 灰度发布：金丝雀发布、蓝绿发布）
   设计取向：三种策略的自由度不同，因此编辑控件也不同 ——
   · 常规路由：N 个权重输入框 + 顶部堆叠占比条
   · 金丝雀：只有 1 个自由度（新版本拿多少），所以只给 1 个滑杆，基线/金丝雀百分比变成只读结果
   · 蓝绿：0 个自由度（二选一），所以给显式「切换」按钮 + 二次确认，避免误点整行切走全量流量 */
function RouteCard({
  category,
  instances,
  initialWeights,
  initialMode = '按权重分发',
}: {
  category: 'routine' | 'grayscale'
  instances: string[]
  initialWeights?: Record<string, string>
  initialMode?: RouteStrategyType
}) {
  const [grayStrategy, setGrayStrategy] = useState<'金丝雀发布' | '蓝绿发布'>(
    initialMode === '蓝绿发布' ? '蓝绿发布' : '金丝雀发布',
  )
  const activeStrategy: RouteStrategyType = category === 'routine' ? '按权重分发' : grayStrategy

  // 1. 按权重分发 state（编辑态保留原权重；后续手动增删实例时自动按新数量均分 100%）
  const [weights, setWeights] = useState<Record<string, string>>(() => {
    if (initialWeights && Object.keys(initialWeights).length > 0) return initialWeights
    const count = instances.length || 1
    const base = Math.floor(100 / count)
    const init: Record<string, string> = {}
    instances.forEach((name, idx) => {
      init[name] = String(idx === 0 ? 100 - base * (count - 1) : base)
    })
    return init
  })

  const firstWeightsRender = useRef(true)
  useEffect(() => {
    if (firstWeightsRender.current) {
      firstWeightsRender.current = false
      return
    }
    const count = instances.length || 1
    const base = Math.floor(100 / count)
    const next: Record<string, string> = {}
    instances.forEach((name, idx) => {
      next[name] = String(idx === 0 ? 100 - base * (count - 1) : base)
    })
    setWeights(next)
  }, [instances])

  const weightSum = instances.reduce((acc, n) => acc + (Number(weights[n]) || 0), 0)

  // 2. 金丝雀发布 state (基线与灰度联动互补：baseline = 100 - canary)
  const [canaryWeight, setCanaryWeight] = useState<number>(() => {
    if (initialWeights && instances[1] && initialWeights[instances[1]]) {
      const parsed = Number(initialWeights[instances[1]])
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed
    }
    return 10
  })
  const baselineWeight = Math.max(0, 100 - canaryWeight)

  // 3. 蓝绿发布 state (二元极值：active 100%, standby 0%) + 切换确认态
  const [blueGreenActiveIdx, setBlueGreenActiveIdx] = useState<number>(() => {
    if (initialWeights && instances.length >= 2) {
      if (Number(initialWeights[instances[1]]) === 100) return 1
    }
    return 0
  })
  const [confirmSwitchIdx, setConfirmSwitchIdx] = useState<number | null>(null)

  /* 灰度两种策略的差异说明：移入 / 点击 ? 图标时展开，不再常驻占位 */
  const GRAY_DESC: Record<'金丝雀发布' | '蓝绿发布', string> = {
    金丝雀发布: '只调「金丝雀流量」一个值，基线自动吃掉剩余流量，先小流量验证再逐步放量',
    蓝绿发布: '全部流量走主用实例，备用实例待命，点「切换到此实例」确认后即时切走全量流量',
  }
  const hintText =
    category === 'routine'
      ? '按实例权重比例分流，各实例权重之和需为 100%；输入框内按 ↑ / ↓ 可 ±5 微调'
      : GRAY_DESC[grayStrategy]

  const grayInstances =
    instances.length >= 2
      ? instances.slice(0, 2)
      : [instances[0] || '待选择实例 1', instances[1] || '待选择实例 2']

  /* 堆叠条数据：三种策略共用同一条色带，颜色与行首色点保持一致 */
  const barSegments =
    activeStrategy === '按权重分发'
      ? instances.map((name, idx) => ({
          key: name,
          label: name,
          value: Math.min(100, Number(weights[name]) || 0),
          color: segColor(idx),
        }))
      : activeStrategy === '金丝雀发布'
        ? [
            { key: 'base', label: '基线', value: baselineWeight, color: '#9DBDF7' },
            { key: 'canary', label: '金丝雀', value: canaryWeight, color: '#166EFF' },
          ]
        : grayInstances.map((name, idx) => ({
            key: `${name}-${idx}`,
            label: name,
            value: idx === blueGreenActiveIdx ? 100 : 0,
            color: '#166EFF',
          }))

  /* 常规路由「均分」：一键把 100% 按实例数重新平均，余数给第一个实例（与自动均分规则一致） */
  const splitEvenly = () => {
    const count = instances.length || 1
    const base = Math.floor(100 / count)
    const next: Record<string, string> = {}
    instances.forEach((name, idx) => {
      next[name] = String(idx === 0 ? 100 - base * (count - 1) : base)
    })
    setWeights(next)
  }

  return (
    <div className="w-[617px] overflow-hidden rounded-[8px] border border-[#e4e6eb]">
      {/* 面板顶栏：左侧策略切换 + 说明气泡，右侧当前策略的关键数值 */}
      <div className="flex h-[48px] items-center gap-[10px] bg-[#fafbfc] px-[16px]">
        {category === 'routine' ? (
          <StrategySegmented
            ariaLabel="常规路由策略"
            items={[
              {
                label: '按权重分发',
                selected: true,
                interactive: false,
                onSelect: () => {},
                icon: (active) => <WeightSplitIcon active={active} />,
              },
            ]}
          />
        ) : (
          <StrategySegmented
            ariaLabel="灰度发布策略"
            items={[
              {
                label: '金丝雀发布',
                selected: grayStrategy === '金丝雀发布',
                onSelect: () => setGrayStrategy('金丝雀发布'),
                icon: (active) => <CanaryIcon active={active} />,
              },
              {
                label: '蓝绿发布',
                selected: grayStrategy === '蓝绿发布',
                onSelect: () => setGrayStrategy('蓝绿发布'),
                icon: (active) => <BlueGreenIcon active={active} />,
              },
            ]}
          />
        )}
        <StrategyHint text={hintText} />

        {activeStrategy === '按权重分发' && instances.length > 1 && (
          <button
            type="button"
            onClick={splitEvenly}
            className="ml-auto shrink-0 cursor-pointer rounded-[4px] px-[6px] text-[13px] text-[#166EFF] transition-colors hover:bg-[#eef4ff]"
          >
            均分
          </button>
        )}
        {activeStrategy === '按权重分发' && (
          <span className={`${instances.length > 1 ? '' : 'ml-auto'} flex shrink-0 items-center gap-[4px] text-[13px] leading-[18px]`}>
            <span className="text-[#8c8c8c]">已分配</span>
            <span
              className={`font-semibold tabular-nums ${
                weightSum === 100 ? 'text-[#0f9d58]' : 'text-[#c9302c]'
              }`}
            >
              {weightSum}%
            </span>
            {weightSum !== 100 && (
              <>
                <span className="text-[#c9ced8]">/</span>
                <span className="text-[#8c8c8c]">100%</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* 比例可视化：一条堆叠色带集中表达所有实例的占比（对应上方各策略的图例） */}
      {(instances.length > 0 || category === 'grayscale') && (
        <div className="px-[16px] pt-[2px]">
          <StackedBar segments={barSegments} />
        </div>
      )}

      <div className="mt-[12px] divide-y divide-[#f2f3f7]">
        {/* 空态：未选择后端推理实例时给出引导 */}
        {instances.length === 0 && (
          <div className="flex h-[56px] items-center justify-center text-[14px] text-[#b0b4bd]">
            请先在上方选择后端推理实例
          </div>
        )}

        {/* 1. 常规路由（按权重分发）：每行 = 色点 + 实例名 + 权重输入框 */}
        {activeStrategy === '按权重分发' &&
          instances.map((name, idx) => (
            <div
              key={name}
              className="flex h-[56px] items-center gap-[10px] px-[16px] transition-colors hover:bg-[#fafbfe]"
            >
              <span
                className="h-[8px] w-[8px] shrink-0 rounded-full"
                style={{ background: segColor(idx) }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-[15px] text-[#1f2329]" title={name}>
                {name}
              </span>
              <WeightInput
                value={weights[name] ?? '0'}
                ariaLabel={`${name} 的权重`}
                onChange={(v) => {
                  // 单实例权重上限 100%：输入超过 100 时截断，避免出现「已超出 9899%」这类无意义提示
                  const next = v.replace(/[^\d]/g, '')
                  setWeights((w2) => ({ ...w2, [name]: next === '' ? '' : String(Math.min(100, Number(next))) }))
                }}
                onStep={(delta) =>
                  setWeights((w2) => ({
                    ...w2,
                    [name]: String(Math.min(100, Math.max(0, (Number(w2[name]) || 0) + delta))),
                  }))
                }
              />
            </div>
          ))}

        {/* 2. 金丝雀发布：只暴露「金丝雀流量」一个自由度，基线百分比自动补足且只读 */}
        {activeStrategy === '金丝雀发布' && (
          <div className="px-[16px] py-[14px]">
            {/* 原生 range 在 appearance-none 后需要自绘滑块，这里用页面内 style 限定作用域，避免污染全局样式 */}
            <style>{`
              .canary-range { -webkit-appearance: none; appearance: none; background: transparent; }
              .canary-range::-webkit-slider-runnable-track {
                height: 4px; border-radius: 999px;
                background: linear-gradient(to right, #166EFF 0%, #166EFF var(--pct, 10%), #e9edf5 var(--pct, 10%), #e9edf5 100%);
              }
              .canary-range::-moz-range-track { height: 4px; border-radius: 999px; background: #e9edf5; }
              .canary-range::-moz-range-progress { height: 4px; border-radius: 999px; background: #166EFF; }
              .canary-range::-webkit-slider-thumb {
                -webkit-appearance: none; appearance: none;
                width: 14px; height: 14px; margin-top: -5px; border-radius: 999px;
                background: #fff; border: 2px solid #166EFF;
                box-shadow: 0 1px 3px rgba(0,0,0,0.18); cursor: pointer;
              }
              .canary-range::-moz-range-thumb {
                width: 14px; height: 14px; border-radius: 999px;
                background: #fff; border: 2px solid #166EFF;
                box-shadow: 0 1px 3px rgba(0,0,0,0.18); cursor: pointer;
              }
              .canary-range:focus-visible { outline: none; }
              .canary-range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 3px rgba(22,110,255,0.18); }
            `}</style>
            <div className="flex items-center gap-[12px]">
              <span className="shrink-0 text-[14px] text-[#1f2329]">金丝雀流量</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={canaryWeight}
                aria-label="金丝雀流量百分比"
                aria-valuetext={`金丝雀流量 ${canaryWeight}%`}
                onChange={(e) => setCanaryWeight(Number(e.target.value))}
                style={{ ['--pct' as string]: `${canaryWeight}%` }}
                className="canary-range h-[14px] min-w-0 flex-1 cursor-pointer"
              />
              <WeightInput
                value={String(canaryWeight)}
                width={76}
                ariaLabel="金丝雀流量百分比"
                onChange={(v) => {
                  const next = v.replace(/[^\d]/g, '')
                  setCanaryWeight(next === '' ? 0 : Math.min(100, Number(next)))
                }}
                onStep={(delta) => setCanaryWeight((v) => Math.min(100, Math.max(0, v + delta)))}
              />
            </div>
            <div className="mt-[10px] flex items-center gap-[6px]">
              {[1, 5, 10, 25, 50].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCanaryWeight(p)}
                  className={`h-[24px] cursor-pointer rounded-[4px] px-[8px] text-[12px] transition-colors ${
                    canaryWeight === p
                      ? 'bg-[#eef4ff] font-medium text-[#166EFF]'
                      : 'bg-[#f5f6fb] text-[#5b6478] hover:text-[#166EFF]'
                  }`}
                >
                  {p}%
                </button>
              ))}
              <span className="ml-[4px] text-[12px] text-[#b0b4bd]">基线自动补足剩余流量</span>
            </div>
          </div>
        )}

        {/* 金丝雀结果展示：两行只读，用户不需要理解「互补」这件事 */}
        {activeStrategy === '金丝雀发布' && (
          <div className="divide-y divide-[#f2f3f7]">
            {grayInstances.map((name, idx) => {
              const isCanary = idx === 1
              const val = isCanary ? canaryWeight : baselineWeight
              return (
                <div key={`${name}-${idx}`} className="flex h-[52px] items-center gap-[10px] px-[16px]">
                  <span
                    className="h-[8px] w-[8px] shrink-0 rounded-full"
                    style={{ background: isCanary ? '#166EFF' : '#9DBDF7' }}
                    aria-hidden
                  />
                  <span className="flex min-w-0 items-center gap-[8px]">
                    <span className="truncate text-[15px] text-[#1f2329]" title={name}>
                      {name}
                    </span>
                    <RoleTag tone={isCanary ? 'canary' : 'base'}>{isCanary ? '金丝雀' : '基线'}</RoleTag>
                  </span>
                  <span className="ml-auto shrink-0 text-[14px] tabular-nums text-[#5b6478]">{val}%</span>
                </div>
              )
            })}
          </div>
        )}

        {/* 3. 蓝绿发布：显式「切换到此实例」+ 二次确认，避免点错整行就把全量流量切走 */}
        {activeStrategy === '蓝绿发布' &&
          grayInstances.map((name, idx) => {
            const isActive = idx === blueGreenActiveIdx
            return (
              <div
                key={`${name}-${idx}`}
                className={`flex h-[56px] items-center gap-[10px] px-[16px] ${
                  isActive ? 'bg-[#f5f9ff]' : ''
                }`}
              >
                <span
                  className={`inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border ${
                    isActive ? 'border-[#166EFF] bg-[#166EFF]' : 'border-[#d9d9d9] bg-white'
                  }`}
                  aria-hidden
                >
                  {isActive && <span className="block h-[5px] w-[5px] rounded-full bg-white" />}
                </span>
                <span className="flex min-w-0 items-center gap-[8px]">
                  <span
                    className={`truncate text-[15px] ${isActive ? 'font-medium text-[#166EFF]' : 'text-[#1f2329]'}`}
                    title={name}
                  >
                    {name}
                  </span>
                  <span
                    className={`shrink-0 rounded-[4px] px-[6px] py-[1px] text-[12px] leading-[18px] ${
                      isActive ? 'bg-[#e6f4ea] text-[#16a34a]' : 'bg-[#f2f3f5] text-[#8c8c8c]'
                    }`}
                  >
                    {isActive ? '主用' : '备用'}
                  </span>
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-[10px]">
                  <span
                    className={`text-[14px] tabular-nums ${isActive ? 'text-[#1f2329]' : 'text-[#8c8c8c]'}`}
                  >
                    {isActive ? 100 : 0}%
                  </span>
                  {isActive ? (
                    <span className="w-[104px] text-right text-[12px] text-[#b0b4bd]">—</span>
                  ) : confirmSwitchIdx === idx ? (
                    <span className="flex w-[104px] items-center justify-end gap-[6px]">
                      <button
                        type="button"
                        onClick={() => {
                          setBlueGreenActiveIdx(idx)
                          setConfirmSwitchIdx(null)
                        }}
                        className="h-[28px] cursor-pointer rounded-[4px] bg-[#166EFF] px-[10px] text-[12px] text-white transition-colors hover:bg-[#0d5ad6]"
                      >
                        确认
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmSwitchIdx(null)}
                        className="h-[28px] cursor-pointer rounded-[4px] border border-[#d9d9d9] px-[10px] text-[12px] text-[#5b6478] transition-colors hover:border-[#b8bec9]"
                      >
                        取消
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmSwitchIdx(idx)}
                      className="h-[28px] w-[104px] shrink-0 cursor-pointer rounded-[4px] border border-[#d9d9d9] bg-white text-[12px] text-[#1f2329] transition-colors hover:border-[#166EFF] hover:text-[#166EFF]"
                    >
                      切换到此实例
                    </button>
                  )}
                </span>
              </div>
            )
          })}
      </div>

      {/* 底部校验条：合计值已在顶栏展示，这里只补充「差多少」的结论。
          合计 100% 时不渲染，面板即终态 */}
      {activeStrategy === '按权重分发' && weightSum !== 100 && (
        <div className="flex items-center gap-[6px] border-t border-[#ffd8d4] bg-[#fff4f2] px-[16px] py-[9px] text-[13px] leading-[20px]">
          <RedWarnIcon />
          <span className="text-[#8c5a52]">
            {weightSum < 100 ? (
              <>
                还差 <span className="font-semibold text-[#c9302c]">{100 - weightSum}%</span>
              </>
            ) : (
              <>
                已超出 <span className="font-semibold text-[#c9302c]">{weightSum - 100}%</span>
              </>
            )}
            ，各实例权重之和必须等于 100%
          </span>
        </div>
      )}
    </div>
  )
}

const CURL_LINES = [
  'curl -X POST "{{.AccessURL}}/v1/chat/completions" -k \\',
  '-H "Content-Type: application/json" \\',
  '-H "Authorization: Bearer $API_KEY" \\',
  '-d \'{',
  '        "model": "{{.ModelName}}",',
  '        "messages": [',
  '            {',
  '                "role": "system",',
  '                "content": "你是一个AI智能聊天机器人"',
  '            },',
  '            {',
  '            "role": "user",',
  '            "content": "你好"',
  '            }',
]

export default function Page({ __showFeat = true }: { __showFeat?: boolean }) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const [params] = useSearchParams()
  const editName = params.get('name')
  const isEdit = !!editName
  const src: ServiceDetail | undefined = isEdit ? DETAILS[editName] : undefined
  const [env, setEnv] = useState('Linux/MacOS')
  const [lang, setLang] = useState('curl')
  const navigate = useNavigate()
  const [publishType, setPublishType] = useState<'private' | 'public'>(
    src ? (src.publishType === '公开发布' ? 'public' : 'private') : 'private',
  )
  const [plazaModel, setPlazaModel] = useState<string>(
    src && src.publishType === '公开发布' && src.backendType === '内部推理服务' ? src.model : '',
  )
  const [backend, setBackend] = useState<'internal' | 'external'>(
    src ? (src.backendType === '内部推理服务' ? 'internal' : 'external') : 'internal',
  )
  const [instances, setInstances] = useState<string[]>(src ? src.instances.map((i) => i.label) : [])
  const [modelName, setModelName] = useState<string>(src ? src.model : '')
  const [modelTouched, setModelTouched] = useState<boolean>(isEdit)
  const [cacheOn, setCacheOn] = useState(src ? src.cacheOn : false)
  const [cacheTime] = useState(src?.cacheTime || '60')
  const [routeOn, setRouteOn] = useState<boolean>(isEdit && (src?.routeOn ?? !!src?.routeMode))
  const [routeCategory, setRouteCategory] = useState<'routine' | 'grayscale'>(
    src && (src.routeMode === '金丝雀发布' || src.routeMode === '蓝绿发布') ? 'grayscale' : 'routine',
  )
  const [fallbackOn, setFallbackOn] = useState(src ? src.fallbackOn : false)
  const [fallbackType, setFallbackType] = useState<string>(src?.fallbackType || '内部推理实例')
  const [fallbackModels, setFallbackModels] = useState<string[]>(src ? src.fallbackModels : [])
  const [rpmOn, setRpmOn] = useState(src ? src.rpmOn : false)

  // 选 ≥ 2 个后端推理实例时，「流量分发策略」升级为必选项：自动开启并锁定（不可关闭）
  useEffect(() => {
    if (instances.length >= 2 && !routeOn) setRouteOn(true)
  }, [instances.length, routeOn])

  // 灰度发布策略限制：必须恰好选中 2 个后端推理实例。
  // 实例数 ≠ 2 时：① 灰度发布单选框置灰禁用（Radio 的 disabled） ② 若已处于灰度发布则自动回退为常规路由策略
  // —— 保留平台原有「灰度发布需 2 实例」的限制策略，不放开；仅处理「切到灰度时取消 Fallback」而非去掉限制
  useEffect(() => {
    if (instances.length !== 2 && routeCategory === 'grayscale') {
      setRouteCategory('routine')
    }
  }, [instances.length, routeCategory])

  // 「调用模型名」不再与「后端推理实例」联动：选中实例不会回填模型名，用户自行填写
  const handleInstancesChange = (next: string[]) => {
    setInstances(next)
  }

  const handleBackendChange = (nextBackend: 'internal' | 'external') => {
    setBackend(nextBackend)
    setInstances([])
    // 外部推理实例无关联模型概念，切换时清空关联模型与调用模型名
    if (nextBackend === 'external') {
      setPlazaModel('')
      if (!modelTouched) setModelName('')
    }
  }

  const handlePlazaModelChange = (next: string) => {
    setPlazaModel(next)
    // 关联模型驱动「调用模型名」自动展示
    setModelName(next)
    setModelTouched(true)
    // 按关联模型过滤后端推理实例：清掉已选中的不匹配实例
    setInstances((prev) => prev.filter((label) => {
      const opt = INSTANCE_OPTIONS[backend].find((o) => o.label === label)
      return opt && opt.model === next
    }))
  }

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="min-h-screen bg-white text-[#1f2329] [font-family:'PingFang_SC','Helvetica_Neue',Arial,sans-serif]">
        <PlatformHeader />
        <div className="flex">
          <SideNav />
          <main className="flex-1 min-w-0">
            {/* Header bar */}
            <div className="h-[66px] border-b border-[#f0f0f0] flex items-center pl-[42px]">
              <button
                aria-label="返回"
                onClick={() => navigate('/算力加速平台/在线服务优化/在线服务?v=v2')}
                className="cursor-pointer flex items-center"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M19 12H5M11 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="ml-[16px] text-[16px] text-[#1f2329]">{isEdit ? '编辑在线服务' : '创建在线服务'}</span>
            </div>

            <div className="pl-[56px] pt-[15px] pb-[40px]">
              {/* 配置信息 */}
              <SectionTitle text="配置信息" />

              <div className="mt-[22px] flex flex-col gap-[26px]">
                {/* 服务名称 */}
                <div className="flex items-center">
                  <FieldLabel text="服务名称" required />
                  <input
                    placeholder="请输入服务名称"
                    defaultValue={isEdit ? editName ?? '' : undefined}
                    readOnly={isEdit}
                    className={`ml-[53px] w-[600px] h-[45px] rounded border border-[#d9d9d9] px-3 text-[14px] placeholder:text-[#bfbfbf] outline-none focus:border-[#166EFF] ${
                      isEdit ? 'bg-[#f7f8fa] text-[#666] cursor-not-allowed' : 'text-[#333]'
                    }`}
                  />
                  <NewTag compact code="F-01" className="ml-2" />
                </div>

                {/* 发布类型 */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <FieldLabel text="发布类型" required />
                    <div className="ml-[53px] flex items-center gap-[46px]">
                      <Radio
                        checked={publishType === 'private'}
                        label="私有发布"
                        disabled={isEdit}
                        onChange={() => setPublishType('private')}
                      />
                      <Radio
                        checked={publishType === 'public'}
                        label="公开发布"
                        disabled={isEdit}
                        onChange={() => setPublishType('public')}
                      />
                    </div>
                  </div>
                  <p className="ml-[201px] mt-[10px] text-[13px] text-[#8c8c8c]">
                    {publishType === 'public'
                      ? '公开发布到模型广场，所有用户可见'
                      : '仅发布到当前项目，项目内用户可见'}
                  </p>
                </div>

                {/* 后端推理类型 */}
                <div className="flex items-center">
                  <FieldLabel text="后端推理类型" required />
                  <div className="ml-[53px] flex items-center gap-[46px]">
                    <Radio checked={backend === 'internal'} label="内部推理实例" onChange={() => handleBackendChange('internal')} />
                    <Radio checked={backend === 'external'} label="外部推理实例" onChange={() => handleBackendChange('external')} />
                  </div>
                  <NewTag compact code="F-02" className="ml-2" />
                </div>

                {/* 关联模型（仅公开发布 + 内部推理实例时出现） */}
                {publishType === 'public' && backend === 'internal' && (
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <FieldLabel text="关联模型" />
                      <PlazaModelSelect value={plazaModel} onChange={handlePlazaModelChange} />
                      <NewTag compact code="F-03" className="ml-2" />
                    </div>
                    <p className="ml-[201px] mt-[8px] text-[13px] text-[#8c8c8c]">
                      关联一个模型广场的模型，其他用户可在模型广场查看此在线服务的API调用信息；
                      关联后「调用模型名」将自动填充该模型，且「后端推理实例」仅展示相同模型的实例
                    </p>
                  </div>
                )}

                {/* 后端推理实例 */}
                <div className="flex items-center">
                  <FieldLabel text="后端推理实例" required />
                  <InstanceSelect
                    backend={backend}
                    values={instances}
                    modelFilter={publishType === 'public' && backend === 'internal' ? plazaModel : ''}
                    onChange={handleInstancesChange}
                  />
                  <NewTag compact code="F-04" className="ml-2" />
                </div>

                {/* 调用模型名 */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <FieldLabel text="调用模型名" required />
                    <input
                      placeholder="请输入调用模型名"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="ml-[53px] w-[600px] h-[45px] rounded border border-[#d9d9d9] px-3 text-[14px] text-[#333] placeholder:text-[#bfbfbf] outline-none focus:border-[#166EFF]"
                    />
                    <NewTag compact code="F-05" className="ml-2" />
                  </div>
                  <p className="ml-[201px] mt-[2px] text-[13px] text-[#8c8c8c]">
                    手动填写对外暴露的请求参数别名，对应在线服务详情【API 文档】示例代码中"model"字段
                  </p>
                </div>

                {/* 缓存加速 */}
                <div className="flex items-center">
                  <FieldLabel text="缓存加速" />
                  <span className="ml-[53px] flex items-center">
                    <Toggle on={cacheOn} onClick={() => setCacheOn((v) => !v)} />
                    <span className="ml-3 text-[14px] text-[#8c8c8c]">
                      通过输入文本全量匹配，缓存命中时直接返回历史结果，从而减少计算，提高吞吐
                    </span>
                  </span>
                </div>

                {/* 缓存时间（开启缓存加速后出现） */}
                {cacheOn && (
                  <div className="flex items-center">
                    <span className="w-[201px] shrink-0" />
                    <span className="flex items-center">
                      <span className="shrink-0 text-[16px] font-semibold text-[#1f2329]">缓存时间</span>
                      <span className="ml-[32px] flex items-center">
                        <span className="inline-flex items-stretch h-[38px]">
                          <input
                            defaultValue={cacheTime.replace('秒', '')}
                            className="w-[290px] h-full rounded-l border border-[#d9d9d9] text-center text-[14px] text-[#333] outline-none"
                          />
                          <span className="w-[26px] border border-l-0 border-[#d9d9d9] rounded-r flex flex-col bg-[#fafafa]">
                            <button className="flex-1 flex items-center justify-center cursor-pointer" aria-label="增加">
                              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                                <path d="M2 6.5 5 3.5 8 6.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <span className="h-px bg-[#d9d9d9] mx-[2px]" />
                            <button className="flex-1 flex items-center justify-center cursor-pointer" aria-label="减少">
                              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                                <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </span>
                        </span>
                        <span className="ml-3 text-[14px] text-[#333]">秒</span>
                      </span>
                    </span>
                  </div>
                )}

                {/* 流量分发策略 */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <FieldLabel text="流量分发策略" required={instances.length >= 2} />
                    <span className="ml-[53px] flex items-center">
                      <Toggle
                        on={routeOn}
                        onClick={() => {
                          // 选 ≥ 2 个实例时为必选项，锁定开启、不可关闭
                          if (instances.length >= 2) return
                          setRouteOn((v) => !v)
                        }}
                      />
                      <span className="ml-3 text-[14px] text-[#8c8c8c]">
                        {instances.length >= 2
                          ? '选择多个后端推理实例时，必须配置流量分发策略'
                          : '开启后可对已选后端推理实例配置常规路由（按权重分发）或灰度发布（金丝雀 / 蓝绿）策略'}
                      </span>
                    </span>
                    <NewTag compact code="F-06" className="ml-2" />
                  </div>

                  {routeOn && (
                    <div className="ml-[201px] mt-[18px] flex flex-col gap-[16px]">
                      <div className="flex items-center gap-[46px]">
                        <Radio
                          checked={routeCategory === 'routine'}
                          label="常规路由策略"
                          onChange={() => setRouteCategory('routine')}
                        />
                        <div className="flex items-center gap-[8px]">
                          <Radio
                            checked={routeCategory === 'grayscale'}
                            label="灰度发布策略"
                            // 限制策略：灰度发布必须恰好 2 个实例，否则置灰禁用
                            disabled={instances.length !== 2}
                            onChange={() => setRouteCategory('grayscale')}
                          />
                          {instances.length !== 2 && (
                            <span className="text-[13px] text-[#8c8c8c]">（灰度发布需选择 2 个后端推理实例）</span>
                          )}
                        </div>
                      </div>

                      <RouteCard
                        category={routeCategory}
                        instances={instances}
                        initialMode={src ? (src.routeMode as any) : undefined}
                        initialWeights={
                          src ? Object.fromEntries(src.instances.map((i) => [i.label, String(i.weight ?? 0)])) : undefined
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 模型调用示例代码 */}
              <div className="mt-[30px] flex items-start">
                <div className="h-[37px] flex items-center shrink-0">
                  <FieldLabel text="模型调用示例代码" />
                </div>
                <div className="ml-[53px] flex-1">
                  <div className="flex items-center">
                    {['Linux/MacOS', 'CMD', 'PowerShell'].map((t, i) => (
                      <button
                        key={t}
                        onClick={() => setEnv(t)}
                        className={`h-[37px] px-[18px] text-[15px] cursor-pointer border border-[#e5e5e5] ${
                          i > 0 ? '-ml-px' : ''
                        } ${
                          env === t
                            ? 'relative z-[1] bg-[#166EFF] border-[#166EFF] text-white rounded-[4px]'
                            : 'bg-white text-[#333]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="mt-[19px] flex items-center">
                    {['curl', 'python'].map((t, i) => (
                      <button
                        key={t}
                        onClick={() => setLang(t)}
                        className={`h-[37px] px-[20px] text-[15px] cursor-pointer border border-[#e5e5e5] ${
                          i > 0 ? '-ml-px' : ''
                        } ${
                          lang === t
                            ? 'relative z-[1] bg-[#166EFF] border-[#166EFF] text-white rounded-[4px]'
                            : 'bg-white text-[#333]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* code block */}
                  <div className="mt-[16px] w-[2523px] max-w-full h-[384px] border border-[#d9d9d9] overflow-hidden flex">
                    <div className="w-[64px] shrink-0 bg-[#f7f7f7] pt-[6px] text-right">
                      {CURL_LINES.map((_, i) => (
                        <div key={i} className={`h-[25px] text-[13px] leading-[25px] ${i === 0 ? 'bg-[#e9f2ff]' : ''} text-[#999] pr-[24px]`}>
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 pt-[6px] overflow-x-auto">
                      {CURL_LINES.map((line, i) => (
                        <div
                          key={i}
                          className={`h-[25px] text-[14px] leading-[25px] pl-3 whitespace-pre ${i === 0 ? 'bg-[#e9f2ff]' : ''} text-[#333]`}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-[10px] flex items-center text-[13px] text-[#8c8c8c]">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mr-1.5" aria-hidden>
                      <circle cx="8" cy="8" r="6.5" fill="#999" />
                      <text x="8" y="11.5" textAnchor="middle" fontSize="9" fill="#fff" fontStyle="italic" fontWeight="bold">
                        i
                      </text>
                    </svg>
                    {'{{ xx }}表示平台内置变量，请勿修改或删除'}
                  </p>
                </div>
              </div>

              {/* 高可用与安全 */}
              <div className="mt-[15px]">
                <SectionTitle text="高可用与安全" />
              </div>

              <div className="mt-[23px] flex flex-col gap-[37px]">
                {/* 模型Fallback（常规路由与灰度发布策略下均保留，支持模型兜底） */}
                {
                  <>
                    <div className="flex items-center">
                      <FieldLabel text="模型Fallback" />
                      <span className="ml-[53px] flex items-center">
                        <Toggle on={fallbackOn} onClick={() => setFallbackOn((v) => !v)} />
                        <span className="ml-3 text-[14px] text-[#8c8c8c]">
                          开启后，当推理实例不可用时将自动切换至备选模型
                        </span>
                      </span>
                      <NewTag compact code="F-06" className="ml-2" />
                    </div>

                    {/* 模型Fallback 展开区 */}
                    {fallbackOn && (
                      <div className="pl-[201px] -mt-[18px] flex flex-col gap-[16px]">
                        <p className="text-[14px] text-[#8c8c8c]">
                          当配置的推理实例全部宕机，请求将自动转发至下方兜底推理实例。降级过程会有延迟。
                        </p>
                        <div className="flex items-center gap-[8px]">
                          <FallbackTypeSelect
                            value={fallbackType}
                            onChange={(t) => {
                              setFallbackType(t)
                              setFallbackModels([])
                            }}
                          />
                          <FallbackServiceSelect
                            type={fallbackType}
                            values={fallbackModels}
                            onChange={setFallbackModels}
                          />
                        </div>
                        <p className="text-[13px] text-[#8c8c8c]">仅展示运行中的推理实例</p>
                      </div>
                    )}
                  </>
                }

                <div className="flex items-center">
                  <FieldLabel text="实例限流" />
                  <span className="ml-[53px] flex items-center">
                    <Toggle on={rpmOn} onClick={() => setRpmOn((v) => !v)} />
                    <span className="ml-3 text-[14px] text-[#333]">启动请求频次限流（RPM）</span>
                  </span>
                </div>

                {/* RPM 展开区 */}
                {rpmOn && (
                  <div className="flex items-center">
                    <span className="w-[201px] shrink-0" />
                    <span className="flex items-center">
                      <span className="shrink-0 text-[16px] font-semibold text-[#1f2329]">请求频次上限</span>
                      <span className="ml-[32px] flex items-center">
                        <span className="inline-flex items-stretch h-[45px]">
                          <input
                            defaultValue={src?.rpm || '100'}
                            className="w-[290px] h-full rounded-l border border-[#d9d9d9] text-center text-[14px] text-[#333] outline-none"
                          />
                          <span className="w-[26px] border border-l-0 border-[#d9d9d9] rounded-r flex flex-col bg-[#fafafa]">
                            <button className="flex-1 flex items-center justify-center cursor-pointer" aria-label="增加">
                              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                                <path d="M2 6.5 5 3.5 8 6.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <span className="h-px bg-[#d9d9d9] mx-[2px]" />
                            <button className="flex-1 flex items-center justify-center cursor-pointer" aria-label="减少">
                              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                                <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </span>
                        </span>
                        <span className="ml-3 text-[14px] text-[#333]">次 / 分钟</span>
                      </span>
                    </span>
                  </div>
                )}

                <div className="flex items-center">
                  <FieldLabel text="请求超时时间" required />
                  <span className="ml-[53px] flex items-center">
                    <span className="inline-flex items-stretch h-[40px]">
                      <input
                        defaultValue={src ? src.timeout.replace('秒', '') : '180'}
                        className="w-[195px] h-full rounded-l border border-[#d9d9d9] text-center text-[14px] text-[#333] outline-none"
                      />
                      <span className="w-[24px] border border-l-0 border-[#d9d9d9] rounded-r flex flex-col">
                        <button className="flex-1 flex items-center justify-center cursor-pointer" aria-label="增加">
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                            <path d="M2 6.5 5 3.5 8 6.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <span className="h-px bg-[#d9d9d9] mx-[2px]" />
                        <button className="flex-1 flex items-center justify-center cursor-pointer" aria-label="减少">
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                            <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </span>
                    </span>
                    <span className="ml-3 text-[14px] text-[#333]">秒</span>
                  </span>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="mt-[20px] ml-[201px] flex items-center gap-[29px]">
                <button
                  onClick={() => navigate('/算力加速平台/在线服务优化/在线服务?v=v2')}
                  className="h-[39px] w-[96px] rounded border border-[#d9d9d9] bg-white text-[15px] text-[#333] cursor-pointer"
                >
                  取 消
                </button>
                <button className="h-[39px] w-[96px] rounded bg-[#166EFF] text-[15px] text-white cursor-pointer">{isEdit ? '保 存' : '创 建'}</button>
              </div>
            </div>
          </main>
        </div>
        <DocPanel code={docCode} onClose={() => setDocCode(null)} />
      </div>
    </DocProvider>
  )
}

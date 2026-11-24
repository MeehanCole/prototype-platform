import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlatformHeader, SideNav } from '../../在线服务/_shared'
import { DETAILS, type ServiceDetail } from '../../在线服务详情/data'
import { DocPanel, DocProvider, FEATURES, NewTag } from '../feature-tags'

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

/* 权重输入步进器（表格单元格内复用；样式对齐设计稿：输入框 84px + 26px 上下按钮） */
function WeightStepper({
  value,
  onInput,
  onInc,
  onDec,
  readOnly,
}: {
  value: string
  onInput: (next: string) => void
  onInc: () => void
  onDec: () => void
  readOnly?: boolean
}) {
  return (
    <span className="inline-flex h-[32px] items-stretch">
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onInput(e.target.value)}
        className={`h-full w-[84px] rounded-l-[4px] border border-[#d9d9d9] text-center text-[14px] outline-none ${
          readOnly ? 'bg-[#fafafa] text-[#8c8c8c]' : 'bg-white text-[#333]'
        }`}
      />
      <span className="flex w-[24px] flex-col rounded-r-[4px] border border-l-0 border-[#d9d9d9] bg-[#fafafa]">
        <button
          type="button"
          aria-label="增加"
          onClick={onInc}
          className="flex flex-1 cursor-pointer items-center justify-center"
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 6.5 5 3.5 8 6.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="mx-[2px] h-px bg-[#d9d9d9]" />
        <button
          type="button"
          aria-label="减少"
          onClick={onDec}
          className="flex flex-1 cursor-pointer items-center justify-center"
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </span>
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

/* 表格底部提示条图标 */
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

/* 流量分发策略卡片（常规路由：按权重分发 / 灰度发布：金丝雀发布、蓝绿发布） */
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

  // 3. 蓝绿发布 state (二元极值：active 100%, standby 0%)
  const [blueGreenActiveIdx, setBlueGreenActiveIdx] = useState<number>(() => {
    if (initialWeights && instances.length >= 2) {
      if (Number(initialWeights[instances[1]]) === 100) return 1
    }
    return 0
  })

  const grayInstances =
    instances.length >= 2
      ? instances.slice(0, 2)
      : [instances[0] || '待选择实例 1', instances[1] || '待选择实例 2']

  return (
    <div className="w-[617px] overflow-hidden rounded-[8px] border border-[#e4e6eb]">
      {/* 面板顶栏：策略分段控件。策略切换与权重行合并进同一容器，
          不再是「选择框 + 表格」两块独立组件拼接 */}
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
      </div>

      <div className="h-px bg-[#eef0f4]" />

      {/* 两策略共用表头：后端推理实例 / 权重比例 */}
      <div className="flex h-[38px] items-center bg-[#fafbfc] px-[16px] text-[13px] text-[#8c8c8c]">
        <span className="min-w-0 flex-1 pl-[27px]">后端推理实例</span>
        <span className="w-[132px] shrink-0 text-right">权重比例</span>
      </div>
      <div className="h-px bg-[#eef0f4]" />

      <div className="divide-y divide-[#f2f3f7]">
        {/* 空态：未选择后端推理实例时给出引导 */}
        {instances.length === 0 && (
          <div className="flex h-[56px] items-center justify-center text-[14px] text-[#b0b4bd]">
            请先在上方选择后端推理实例
          </div>
        )}

        {/* 1. 常规路由（按权重分发） */}
        {activeStrategy === '按权重分发' &&
          instances.map((name) => (
            <div
              key={name}
              className="flex h-[56px] items-center gap-[12px] px-[16px] transition-colors hover:bg-[#fafbfe]"
            >
              <span className="min-w-0 flex-1 truncate pl-[27px] text-[15px] text-[#1f2329]" title={name}>
                {name}
              </span>
              <span className="flex w-[132px] shrink-0 items-center justify-end gap-[8px]">
                <WeightStepper
                  value={weights[name] ?? '0'}
                  onInput={(v) => {
                    // 单实例权重上限 100%：输入超过 100 时截断，避免出现「已超出 9899%」这类无意义提示
                    const next = v.replace(/[^\d]/g, '')
                    setWeights((w2) => ({ ...w2, [name]: next === '' ? '' : String(Math.min(100, Number(next))) }))
                  }}
                  onInc={() => setWeights((w2) => ({ ...w2, [name]: String((Number(w2[name]) || 0) + 1) }))}
                  onDec={() => setWeights((w2) => ({ ...w2, [name]: String(Math.max(0, (Number(w2[name]) || 0) - 1)) }))}
                />
                <span className="w-[12px] text-[14px] text-[#8c8c8c]">%</span>
              </span>
            </div>
          ))}

        {/* 2. 灰度发布 · 金丝雀发布（基线 / 金丝雀自动互补） */}
        {activeStrategy === '金丝雀发布' &&
          grayInstances.map((name, idx) => {
            const isFirst = idx === 0
            const isSecond = idx === 1
            const val = isFirst ? baselineWeight : isSecond ? canaryWeight : 0
            const updateVal = (nextVal: number) => {
              const clamped = Math.min(100, Math.max(0, nextVal))
              if (isFirst) setCanaryWeight(100 - clamped)
              else if (isSecond) setCanaryWeight(clamped)
            }
            return (
              <div
                key={`${name}-${idx}`}
                className="flex h-[56px] items-center gap-[12px] px-[16px] transition-colors hover:bg-[#fafbfe]"
              >
                <span className="flex min-w-0 flex-1 items-center gap-[8px] pl-[27px]">
                  <span className="truncate text-[15px] text-[#1f2329]" title={name}>
                    {name}
                  </span>
                </span>
                <span className="flex w-[132px] shrink-0 items-center justify-end gap-[8px]">
                  <WeightStepper
                    value={String(val)}
                    readOnly={!isFirst && !isSecond}
                    onInput={(v) => updateVal(Number(v.replace(/[^\d]/g, '')) || 0)}
                    onInc={() => updateVal(val + 5)}
                    onDec={() => updateVal(val - 5)}
                  />
                  <span className="w-[12px] text-[14px] text-[#8c8c8c]">%</span>
                </span>
              </div>
            )
          })}

        {/* 3. 灰度发布 · 蓝绿发布（整行单选 + 状态徽章）
            - 行加 role=radio + 键盘可操作，避免只有鼠标能选 */}
        {activeStrategy === '蓝绿发布' &&
          grayInstances.map((name, idx) => {
            const isActive = idx === blueGreenActiveIdx
            return (
              <div
                key={`${name}-${idx}`}
                role="radio"
                aria-checked={isActive}
                tabIndex={0}
                onClick={() => setBlueGreenActiveIdx(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setBlueGreenActiveIdx(idx)
                  }
                }}
                className={`relative flex h-[56px] cursor-pointer items-center gap-[12px] px-[16px] outline-none transition-colors focus-visible:bg-[#f5f9ff] ${
                  isActive ? 'bg-[#f5f9ff]' : 'hover:bg-[#fafbfe]'
                }`}
              >
                <span
                  className={`absolute left-[16px] inline-flex h-[15px] w-[15px] items-center justify-center rounded-full border ${
                    isActive ? 'border-[#166EFF] bg-[#166EFF]' : 'border-[#d9d9d9] bg-white'
                  }`}
                  aria-hidden
                >
                  {isActive && <span className="block h-[5px] w-[5px] rounded-full bg-white" />}
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-[8px] pl-[27px]">
                  <span
                    className={`truncate text-[15px] ${isActive ? 'font-medium text-[#166EFF]' : 'text-[#1f2329]'}`}
                    title={name}
                  >
                    {name}
                  </span>
                </span>
                <span
                  className={`w-[132px] shrink-0 text-right text-[14px] tabular-nums ${
                    isActive ? 'text-[#1f2329]' : 'text-[#8c8c8c]'
                  }`}
                >
                  {isActive ? 100 : 0}%
                </span>
              </div>
            )
          })}
      </div>

      {/* 底部校验条：已选择实例且权重不满足 100% 时提示差多少；空实例态不渲染 */}
      {activeStrategy === '按权重分发' && instances.length > 0 && weightSum !== 100 && (
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

  const handleInstancesChange = (next: string[], currentBackend: 'internal' | 'external' = backend) => {
    setInstances(next)
    if (!modelTouched) {
      if (next.length === 0) {
        setModelName('')
      } else {
        const firstLabel = next[0]
        const found = INSTANCE_OPTIONS[currentBackend].find((o) => o.label === firstLabel)
        setModelName(found ? found.model : firstLabel)
      }
    }
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
                    onChange={(next) => handleInstancesChange(next, backend)}
                  />
                  <NewTag compact code="F-04" className="ml-2" />
                </div>

                {/* 调用模型名 */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <FieldLabel text="调用模型名" required />
                    <input
                      placeholder="选择后端推理实例（或关联模型）后自动填充，也可手动输入调用模型名"
                      value={modelName}
                      onChange={(e) => {
                        const v = e.target.value
                        setModelName(v)
                        setModelTouched(v.trim().length > 0)
                      }}
                      className="ml-[53px] w-[600px] h-[45px] rounded border border-[#d9d9d9] px-3 text-[14px] text-[#333] placeholder:text-[#bfbfbf] outline-none focus:border-[#166EFF]"
                    />
                    <NewTag compact code="F-05" className="ml-2" />
                  </div>
                  <p className="ml-[201px] mt-[2px] text-[13px] text-[#8c8c8c]">
                    公开发布且关联模型后自动填充该模型名（也可手动修改别名）；私有发布或未关联时按首个后端推理实例模型名称自动填充；对应在线服务详情【API 文档】示例代码中"model"字段
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

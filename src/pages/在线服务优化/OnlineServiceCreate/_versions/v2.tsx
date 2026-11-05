import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlatformHeader, SideNav } from '../../OnlineService/_shared'
import { DETAILS, type ServiceDetail } from '../../OnlineServiceDetail/data'
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
          checked ? 'border-[#166EFF] bg-[#166EFF]' : 'border-[#d9d9d9] bg-white'
        }`}
      >
        {checked && <span className="w-[5px] h-[5px] rounded-full bg-white block" />}
      </span>
      <span className={`ml-2 text-[15px] ${checked ? 'text-[#166EFF]' : 'text-[#333]'}`}>{label}</span>
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
    { label: 'moe模型hang验证', running: false, model: 'Qwen3.5-35B-A3B', plazaModel: 'Qwen3.5-35B-A3B' },
    { label: 'moe模型hang验证-副本', running: false, model: 'Qwen3.5-35B-A3B', plazaModel: 'Qwen3.5-35B-A3B' },
    { label: 'vllm验证', running: false, model: 'DeepSeek-R1-Distill-Qwen-32B' },
    { label: 'kt服务', running: false, model: 'QwQ-32B' },
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
                return (
                  <span
                    key={opt.label}
                    onClick={() => toggle(opt.label)}
                    className={`flex h-[41px] items-center justify-between px-[26px] cursor-pointer ${
                      selected ? 'bg-[#f5f7fa]' : 'hover:bg-[#f5f7fa]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`text-[15px] ${selected ? 'text-[#166EFF]' : 'text-[#333]'}`}>{opt.label}</span>
                      <span className="rounded bg-[#f0f2f5] px-1.5 py-0.5 text-[12px] text-[#666]">模型: {opt.model}</span>
                    </span>
                    <span className={`text-[14px] ${opt.running ? 'text-[#67C23A]' : 'text-[#999]'}`}>
                      {opt.running ? '运行中' : '已关机'}
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

type RouteStrategyType = '按权重分发' | '金丝雀发布' | '蓝绿发布'

/* 路由策略卡片（按权重分发 / 金丝雀发布 / 蓝绿发布） */
function RouteCard({
  onDelete,
  instances,
  initialWeights,
  initialMode = '按权重分发',
}: {
  onDelete: () => void
  instances: string[]
  initialWeights?: Record<string, string>
  initialMode?: RouteStrategyType
}) {
  const [strategy, setStrategy] = useState<RouteStrategyType>(initialMode)
  const [open, setOpen] = useState(false)
  const routeRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(routeRef, () => setOpen(false))

  // 1. 按权重分发 state
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

  const handleEvenWeights = () => {
    if (instances.length === 0) return
    const base = Math.floor(100 / instances.length)
    const init: Record<string, string> = {}
    instances.forEach((name, idx) => {
      init[name] = String(idx === 0 ? 100 - base * (instances.length - 1) : base)
    })
    setWeights(init)
  }

  const weightSum = instances.reduce((acc, n) => acc + (Number(weights[n]) || 0), 0)

  // 2. 金丝雀发布 state
  const [baselineInstance, setBaselineInstance] = useState<string>(instances[0] || '')
  const [canaryInstance, setCanaryInstance] = useState<string>(instances[1] || instances[0] || '')
  const [canaryWeight, setCanaryWeight] = useState<number>(10)
  const baselineWeight = Math.max(0, 100 - canaryWeight)

  // 3. 蓝绿发布 state
  const [activeInstance, setActiveInstance] = useState<string>(instances[0] || '')
  const [standbyInstance, setStandbyInstance] = useState<string>(instances[1] || instances[0] || '')

  const handleSwapBlueGreen = () => {
    const prevActive = activeInstance
    const prevStandby = standbyInstance
    setActiveInstance(prevStandby)
    setStandbyInstance(prevActive)
  }

  // 当实例选择变化时自动校准
  useEffect(() => {
    if (instances.length > 0) {
      if (!instances.includes(baselineInstance)) setBaselineInstance(instances[0])
      if (!instances.includes(canaryInstance)) setCanaryInstance(instances[1] || instances[0])
      if (!instances.includes(activeInstance)) setActiveInstance(instances[0])
      if (!instances.includes(standbyInstance)) setStandbyInstance(instances[1] || instances[0])
    }
  }, [instances])

  return (
    <div className="w-[660px] rounded-[6px] border border-[#e4e6eb] bg-white p-[20px] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      {/* 顶部：策略类型下拉 + 删除 */}
      <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-[#1f2329]">策略模式</span>
          <span ref={routeRef} className="relative inline-block w-[240px]">
            <span
              onClick={() => setOpen((o) => !o)}
              className={`h-[38px] flex items-center justify-between rounded border px-3 text-[14px] cursor-pointer bg-white transition-colors ${
                open ? 'border-[#166EFF] text-[#166EFF]' : 'border-[#d9d9d9] text-[#333]'
              }`}
            >
              <span className="font-medium">{strategy}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className={`transition-transform ${open ? 'rotate-180' : ''}`}
              >
                <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {open && (
              <span className="absolute left-0 top-[44px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.1)] py-1">
                {(['按权重分发', '金丝雀发布', '蓝绿发布'] as RouteStrategyType[]).map((type) => (
                  <span
                    key={type}
                    onClick={() => {
                      setStrategy(type)
                      setOpen(false)
                    }}
                    className={`flex h-[38px] items-center justify-between px-3 text-[14px] cursor-pointer hover:bg-[#f5f7fa] ${
                      strategy === type ? 'bg-[#f0f7ff] text-[#166EFF] font-medium' : 'text-[#333]'
                    }`}
                  >
                    <span>{type}</span>
                    {strategy === type && (
                      <span className="text-[12px] text-[#166EFF]">✓</span>
                    )}
                  </span>
                ))}
              </span>
            )}
          </span>
          <span className="rounded bg-[#f5f6f8] px-2 py-1 text-[12px] text-[#8c8c8c]">
            {strategy === '按权重分发' && '多实例按百分比分摊流量'}
            {strategy === '金丝雀发布' && '小流量灰度验证，安全上线'}
            {strategy === '蓝绿发布' && '主备双组热备，一键瞬时切流'}
          </span>
        </div>
        <button
          onClick={onDelete}
          aria-label="删除路由策略"
          className="cursor-pointer text-[#999] hover:text-[#F5222D] p-1 transition-colors"
          title="删除路由策略"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
            <path d="M2.5 4h11M6.5 2h3M4 4l.7 9a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L12 4M6.5 7v4M9.5 7v4" />
          </svg>
        </button>
      </div>

      {/* 实例不足提示 */}
      {instances.length === 0 && (
        <div className="py-6 text-center text-[14px] text-[#999]">
          请先在上方「后端推理实例」中选择至少 1 个实例
        </div>
      )}

      {/* 模式 1：按权重分发 */}
      {instances.length > 0 && strategy === '按权重分发' && (
        <div className="mt-[20px] flex items-start">
          <div className="w-[120px] shrink-0 text-right text-[15px] font-medium text-[#1f2329] pt-2">
            权重配置
          </div>
          <div className="ml-[24px] flex-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] text-[#8c8c8c]">各实例按设定百分比分担请求流量</span>
              <button
                type="button"
                onClick={handleEvenWeights}
                className="text-[13px] text-[#166EFF] hover:underline cursor-pointer"
              >
                均分权重
              </button>
            </div>
            <div className="flex flex-col gap-[10px]">
              {instances.map((name) => (
                <div key={name} className="flex items-center justify-between rounded border border-[#f0f0f0] bg-[#fafbfc] px-3 py-2">
                  <span className="w-[240px] truncate text-[14px] text-[#333] font-medium">{name}</span>
                  <div className="inline-flex items-center gap-1.5">
                    <input
                      value={weights[name] ?? '0'}
                      onChange={(e) =>
                        setWeights((w) => ({ ...w, [name]: e.target.value.replace(/[^\d]/g, '') }))
                      }
                      className="w-[72px] h-[34px] rounded border border-[#d9d9d9] bg-white text-center text-[14px] text-[#333] outline-none focus:border-[#166EFF]"
                    />
                    <span className="text-[14px] text-[#666]">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-[13px]">
              <span className={`inline-flex items-center gap-1.5 font-medium ${weightSum === 100 ? 'text-[#52C41A]' : 'text-[#F5222D]'}`}>
                <span>权重之和：{weightSum}%</span>
                {weightSum === 100 ? '（配置有效）' : '（必须等于 100%）'}
              </span>
            </div>
            <span className="mt-2 block text-[13px] text-[#8c8c8c]">此为终态策略，不可再添加后续路由策略。</span>
          </div>
        </div>
      )}

      {/* 模式 2：金丝雀发布 */}
      {instances.length > 0 && strategy === '金丝雀发布' && (
        <div className="mt-[20px] flex flex-col gap-4">
          {instances.length < 2 && (
            <div className="rounded bg-[#FFFBE6] border border-[#FFE58F] px-3 py-2 text-[13px] text-[#D46B08]">
              提示：金丝雀发布建议选择至少 2 个实例分别作为基线与金丝雀。当前已选 1 个实例。
            </div>
          )}

          {/* 角色指定 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 基线实例 */}
            <div className="rounded border border-[#e8e8e8] p-3 bg-[#fafbfc]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-[#1f2329] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#166EFF]" />
                  基线实例 (当前主版本)
                </span>
                <span className="rounded bg-[#E6F4FF] px-1.5 py-0.5 text-[11px] text-[#1677FF] font-medium">
                  {baselineWeight}% 流量
                </span>
              </div>
              <select
                value={baselineInstance}
                onChange={(e) => setBaselineInstance(e.target.value)}
                className="w-full h-[36px] rounded border border-[#d9d9d9] bg-white px-2.5 text-[13px] text-[#333] outline-none"
              >
                {instances.map((ins) => (
                  <option key={ins} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>

            {/* 金丝雀实例 */}
            <div className="rounded border border-[#e8e8e8] p-3 bg-[#fafbfc]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-[#1f2329] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FA8C16]" />
                  金丝雀实例 (灰度新版本)
                </span>
                <span className="rounded bg-[#FFF7E6] px-1.5 py-0.5 text-[11px] text-[#FA8C16] font-medium">
                  {canaryWeight}% 流量
                </span>
              </div>
              <select
                value={canaryInstance}
                onChange={(e) => setCanaryInstance(e.target.value)}
                className="w-full h-[36px] rounded border border-[#d9d9d9] bg-white px-2.5 text-[13px] text-[#333] outline-none"
              >
                {instances.map((ins) => (
                  <option key={ins} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 流量比例配置 */}
          <div className="rounded border border-[#f0f0f0] p-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#333]">灰度流量占比</span>
              <div className="flex items-center gap-2">
                {[5, 10, 20, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCanaryWeight(preset)}
                    className={`h-[26px] px-2.5 rounded text-[12px] border cursor-pointer transition-colors ${
                      canaryWeight === preset
                        ? 'bg-[#166EFF] text-white border-[#166EFF]'
                        : 'bg-white text-[#666] border-[#d9d9d9] hover:border-[#166EFF]'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
                <div className="ml-2 inline-flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={canaryWeight}
                    onChange={(e) => setCanaryWeight(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-[56px] h-[28px] rounded border border-[#d9d9d9] text-center text-[13px] text-[#333] outline-none focus:border-[#166EFF]"
                  />
                  <span className="text-[13px] text-[#666]">%</span>
                </div>
              </div>
            </div>

            {/* 双色流量分流条 */}
            <div className="mt-3">
              <div className="h-[10px] w-full rounded-full bg-[#f0f0f0] overflow-hidden flex">
                <div className="bg-[#166EFF] h-full transition-all" style={{ width: `${baselineWeight}%` }} />
                <div className="bg-[#FA8C16] h-full transition-all" style={{ width: `${canaryWeight}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[12px] text-[#8c8c8c]">
                <span>基线: {baselineWeight}%</span>
                <span>金丝雀: {canaryWeight}%</span>
              </div>
            </div>
          </div>

          <div className="text-[13px] text-[#8c8c8c]">
            💡 验证金丝雀版本表现良好后，可通过提高金丝雀占比逐步扩大灰度，直至 100% 全量切流。
          </div>
        </div>
      )}

      {/* 模式 3：蓝绿发布 */}
      {instances.length > 0 && strategy === '蓝绿发布' && (
        <div className="mt-[20px] flex flex-col gap-4">
          {instances.length < 2 && (
            <div className="rounded bg-[#FFFBE6] border border-[#FFE58F] px-3 py-2 text-[13px] text-[#D46B08]">
              提示：蓝绿发布需要配置主、备两组实例。当前已选 1 个实例。
            </div>
          )}

          {/* 主备两组卡片 + 一键切换按钮 */}
          <div className="flex items-center gap-3">
            {/* 主组卡片 */}
            <div className="flex-1 rounded border-2 border-[#52C41A] p-3.5 bg-[#F6FFED]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-[#237804] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#52C41A]" />
                  主实例 (活跃)
                </span>
                <span className="rounded bg-[#52C41A] px-2 py-0.5 text-[11px] text-white font-medium">
                  100% 流量
                </span>
              </div>
              <select
                value={activeInstance}
                onChange={(e) => setActiveInstance(e.target.value)}
                className="w-full h-[36px] rounded border border-[#b7eb8f] bg-white px-2.5 text-[13px] text-[#333] outline-none"
              >
                {instances.map((ins) => (
                  <option key={ins} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>

            {/* 一键主备切换按钮 */}
            <div className="shrink-0 flex flex-col items-center">
              <button
                type="button"
                onClick={handleSwapBlueGreen}
                className="h-[38px] px-3 rounded-md bg-[#166EFF] text-white text-[13px] flex items-center gap-1.5 shadow-sm hover:bg-[#1258cc] cursor-pointer transition-all"
                title="一键调换主备实例角色（秒级无损切流）"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 11h9m0 0l-3-3m3 3l-3 3M12 5H3m0 0l3-3M3 5l3 3" />
                </svg>
                一键切换
              </button>
              <span className="mt-1 text-[11px] text-[#8c8c8c]">秒级切流</span>
            </div>

            {/* 备组卡片 */}
            <div className="flex-1 rounded border border-[#d9d9d9] p-3.5 bg-[#fafafa]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-[#595959] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#bfbfbf]" />
                  备实例 (待命)
                </span>
                <span className="rounded bg-[#f0f0f0] px-2 py-0.5 text-[11px] text-[#8c8c8c] font-medium">
                  0% 流量
                </span>
              </div>
              <select
                value={standbyInstance}
                onChange={(e) => setStandbyInstance(e.target.value)}
                className="w-full h-[36px] rounded border border-[#d9d9d9] bg-white px-2.5 text-[13px] text-[#333] outline-none"
              >
                {instances.map((ins) => (
                  <option key={ins} value={ins}>
                    {ins}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[13px] text-[#8c8c8c]">
            💡 蓝绿模式下备用实例保持热备状态；点击「一键切换」可实现瞬时切流，如遇突发异常可再次点击秒级回滚。
          </div>
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
  const [routeCards, setRouteCards] = useState<number[]>(isEdit && src ? [Date.now()] : [])
  const [rpmOn, setRpmOn] = useState(src ? src.rpmOn : false)

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
                onClick={() => navigate('/在线服务优化/onlineservice?v=v2')}
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
                  <NewTag compact code="F-01" />
                </div>

                {/* 发布类型 */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <FieldLabel text="发布类型" />
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
                  <FieldLabel text="后端推理类型" />
                  <div className="ml-[53px] flex items-center gap-[46px]">
                    <Radio checked={backend === 'internal'} label="内部推理实例" onChange={() => handleBackendChange('internal')} />
                    <Radio checked={backend === 'external'} label="外部推理实例" onChange={() => handleBackendChange('external')} />
                  </div>
                  <NewTag compact code="F-02" />
                </div>

                {/* 关联模型（仅公开发布 + 内部推理实例时出现） */}
                {publishType === 'public' && backend === 'internal' && (
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <FieldLabel text="关联模型" />
                      <PlazaModelSelect value={plazaModel} onChange={handlePlazaModelChange} />
                      <NewTag compact code="F-03" />
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
                  <NewTag compact code="F-04" />
                </div>

                {/* 调用模型名 */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <FieldLabel text="调用模型名" required />
                    <input
                      placeholder="请选择关联模型以自动填充，或手动输入调用模型名"
                      value={modelName}
                      onChange={(e) => {
                        const v = e.target.value
                        setModelName(v)
                        setModelTouched(v.trim().length > 0)
                      }}
                      className="ml-[53px] w-[600px] h-[45px] rounded border border-[#d9d9d9] px-3 text-[14px] text-[#333] placeholder:text-[#bfbfbf] outline-none focus:border-[#166EFF]"
                    />
                    <NewTag compact code="F-05" />
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

                {/* 路由策略 */}
                <div className="flex items-start">
                  <FieldLabel text="路由策略" />
                  <NewTag compact code="F-06" />
                  <span className="ml-[53px] flex-1">
                    {routeCards.length === 0 ? (
                      <a
                        onClick={() => setRouteCards([Date.now()])}
                        className="text-[14px] text-[#166EFF] cursor-pointer"
                      >
                        +添加路由策略
                      </a>
                    ) : (
                      <span className="flex flex-col gap-[16px]">
                        {routeCards.map((id) => (
                          <RouteCard
                            key={id}
                            instances={instances}
                            initialMode={src ? (src.routeMode as any) : undefined}
                            initialWeights={src ? Object.fromEntries(src.instances.map((i) => [i.label, String(i.weight ?? 0)])) : undefined}
                            onDelete={() => setRouteCards((c) => c.filter((k) => k !== id))}
                          />
                        ))}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* 模型调用示例代码 */}
              <div className="mt-[30px] flex">
                <FieldLabel text="模型调用示例代码" />
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
                <div className="flex items-center">
                  <FieldLabel text="全局限流" />
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
                  onClick={() => navigate('/在线服务优化/onlineservice?v=v2')}
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

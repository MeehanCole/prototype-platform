import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlatformHeader, SideNav } from '../../OnlineService/_shared'
import { DETAILS, type ServiceDetail } from '../../OnlineServiceDetail/data'
import { DocPanel, DocProvider, FEATURES } from '../feature-tags'

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

/* 后端推理实例下拉数据（来自产品截图） */
const INSTANCE_OPTIONS: Record<'internal' | 'external', { label: string; running: boolean }[]> = {
  internal: [
    { label: 'test', running: false },
    { label: 'moe模型hang验证', running: false },
    { label: 'vllm验证', running: false },
    { label: 'kt服务', running: false },
  ],
  external: [
    { label: '阿里不完整路径', running: true },
    { label: '测试服务异常', running: true },
    { label: '阿里百炼服务', running: true },
    { label: '外部服务', running: true },
    { label: 'demo-18080', running: true },
    { label: 'demo-18080-model接口', running: true },
    { label: 'demo-18081', running: true },
    { label: 'demo-18082', running: true },
  ],
}

function InstanceSelect({
  backend,
  values,
  onChange,
}: {
  backend: 'internal' | 'external'
  values: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(rootRef, () => setOpen(false))
  const options = INSTANCE_OPTIONS[backend]
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
        {values.length === 0 && <span className="text-[#bfbfbf]">选择后端推理服务实例</span>}
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
            {options.map((opt) => {
              const selected = values.includes(opt.label)
              return (
                <span
                  key={opt.label}
                  onClick={() => toggle(opt.label)}
                  className={`flex h-[41px] items-center justify-between px-[26px] cursor-pointer ${
                    selected ? 'bg-[#f5f7fa]' : 'hover:bg-[#f5f7fa]'
                  }`}
                >
                  <span className={`text-[15px] ${selected ? 'text-[#166EFF]' : 'text-[#333]'}`}>{opt.label}</span>
                  <span className={`text-[14px] ${opt.running ? 'text-[#67C23A]' : 'text-[#999]'}`}>
                    {opt.running ? '运行中' : '已关机'}
                  </span>
                </span>
              )
            })}
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

/* Fallback：类型下拉（内部/外部） */
function FallbackTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const val = value
  const rootRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(rootRef, () => setOpen(false))
  return (
    <span ref={rootRef} className="relative inline-block w-[240px]">
      <span
        onClick={() => setOpen((o) => !o)}
        className={`h-[45px] flex items-center justify-between rounded border px-3 text-[15px] cursor-pointer bg-white ${
          open ? 'border-[#166EFF]' : 'border-[#d9d9d9]'
        } text-[#333]`}
      >
        {val}
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
        <span className="absolute left-0 top-full mt-[7px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          {['内部推理服务', '外部推理服务'].map((t) => (
            <span
              key={t}
              onClick={() => {
                onChange(t)
                setOpen(false)
              }}
              className={`flex h-[50px] items-center px-[26px] cursor-pointer hover:bg-[#f5f7fa] ${
                val === t ? 'bg-[#f5f7fa]' : ''
              }`}
            >
              <span className={`text-[16px] ${val === t ? 'text-[#166EFF]' : 'text-[#333]'}`}>{t}</span>
            </span>
          ))}
        </span>
      )}
    </span>
  )
}

/* Fallback：服务实例多选下拉（仅运行中的外部服务） */
function FallbackServiceSelect({
  type,
  picked,
  onChange,
}: {
  type: string
  picked: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(rootRef, () => setOpen(false))
  const options =
    type === '内部推理服务'
      ? INSTANCE_OPTIONS.internal
      : INSTANCE_OPTIONS.external.filter((o) => o.running)
  return (
    <span ref={rootRef} className="relative inline-block w-[320px]">
      <span
        onClick={() => setOpen((o) => !o)}
        className={`min-h-[45px] flex items-center flex-wrap gap-[6px] rounded border bg-white px-3 py-[5px] text-[15px] cursor-pointer ${
          open ? 'border-[#166EFF]' : 'border-[#d9d9d9]'
        }`}
      >
        {picked.length === 0 && <span className="text-[#bfbfbf]">选择推理服务</span>}
        {picked.map((v) => (
          <span
            key={v}
            onClick={(e) => {
              e.stopPropagation()
              onChange(picked.filter((x) => x !== v))
            }}
            className="inline-flex items-center gap-[6px] rounded-[3px] bg-[#f5f5f5] px-[8px] h-[26px] text-[13px] text-[#999]"
          >
            {v}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#999" strokeWidth="1.3" strokeLinecap="round" aria-hidden className="cursor-pointer hover:stroke-[#666]">
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
        <span className="absolute left-0 bottom-full mb-[7px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <span className="absolute -bottom-[5px] left-1/2 -ml-[5px] h-[10px] w-[10px] rotate-45 border-r border-b border-[#e4e6eb] bg-white" />
          <span className="block py-[6px] max-h-[420px] overflow-y-auto">
            {options.map((opt) => {
              const selected = picked.includes(opt.label)
              return (
                <span
                  key={opt.label}
                  onClick={() => onChange(selected ? picked.filter((x) => x !== opt.label) : [...picked, opt.label])}
                  className={`flex h-[50px] items-center px-[26px] cursor-pointer hover:bg-[#f5f7fa] ${selected ? 'bg-[#f5f7fa]' : ''}`}
                >
                  <span className={`text-[16px] ${selected ? 'text-[#166EFF]' : 'text-[#333]'}`}>{opt.label}</span>
                </span>
              )
            })}
          </span>
        </span>
      )}
    </span>
  )
}

/* 路由策略卡片（按权重分发） */
function RouteCard({
  onDelete,
  instances,
  initialWeights,
}: {
  onDelete: () => void
  instances: string[]
  initialWeights?: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const routeRef = useRef<HTMLSpanElement>(null)
  useOutsideClose(routeRef, () => setOpen(false))
  const [weights, setWeights] = useState<Record<string, string>>(initialWeights || {})
  const sum = instances.reduce((acc, n) => acc + (Number(weights[n]) || 0), 0)
  return (
    <div className="w-[617px] rounded-[4px] border border-[#e4e6eb] p-[20px]">
      <div className="flex items-start">
        <span ref={routeRef} className="relative inline-block w-[327px]">
          <span
            onClick={() => setOpen((o) => !o)}
            className={`h-[40px] flex items-center justify-between rounded border px-3 text-[15px] cursor-pointer ${
              open ? 'border-[#166EFF] text-[#333]' : 'border-[#d9d9d9] text-[#333]'
            }`}
          >
            按权重分发
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
            <span className="absolute left-0 top-[47px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <span className="absolute -top-[5px] left-[70px] h-[10px] w-[10px] rotate-45 border-l border-t border-[#e4e6eb] bg-white" />
              <span className="block py-[4px]">
                <span className="flex h-[41px] items-center px-[26px] cursor-pointer bg-[#f5f7fa]">
                  <span className="text-[16px] text-[#166EFF]">按权重分发</span>
                </span>
              </span>
            </span>
          )}
        </span>
        <button onClick={onDelete} aria-label="删除路由策略" className="ml-auto cursor-pointer">
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#F5222D" strokeWidth="1.2" strokeLinecap="round" aria-hidden>
            <path d="M2.5 4h11M6.5 2h3M4 4l.7 9a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L12 4M6.5 7v4M9.5 7v4" />
          </svg>
        </button>
      </div>
      <div className="mt-[24px] flex items-start">
        <span className="w-[148px] shrink-0 text-right text-[16px] font-semibold text-[#1f2329]">权重配置</span>
        <span className="ml-[32px] flex-1">
          <span className="flex flex-col gap-[10px]">
          {instances.map((name) => (
            <div key={name} className="flex items-center">
              <span className="w-[240px] shrink-0 text-[15px] text-[#333]">{name}</span>
              <span className="inline-flex items-stretch h-[40px]">
                <input
                  value={weights[name] ?? '0'}
                  onChange={(e) => setWeights((w) => ({ ...w, [name]: e.target.value.replace(/[^\d]/g, '') }))}
                  className="w-[120px] h-full rounded-l border border-[#d9d9d9] text-center text-[14px] text-[#333] outline-none"
                />
                <span className="w-[26px] border border-l-0 border-[#d9d9d9] rounded-r flex flex-col bg-[#fafafa]">
                  <button
                    className="flex-1 flex items-center justify-center cursor-pointer"
                    aria-label="增加"
                    onClick={() => setWeights((w) => ({ ...w, [name]: String((Number(w[name]) || 0) + 1) }))}
                  >
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M2 6.5 5 3.5 8 6.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="h-px bg-[#d9d9d9] mx-[2px]" />
                  <button
                    className="flex-1 flex items-center justify-center cursor-pointer"
                    aria-label="减少"
                    onClick={() => setWeights((w) => ({ ...w, [name]: String(Math.max(0, (Number(w[name]) || 0) - 1)) }))}
                  >
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </span>
              </span>
              <span className="ml-3 text-[14px] text-[#333]">%</span>
            </div>
          ))}
          </span>
          <span className="mt-[10px] flex items-center text-[15px] text-[#F5222D]">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mr-1.5" aria-hidden>
              <circle cx="8" cy="8" r="7" fill="#F5222D" />
              <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#fff" fontStyle="italic" fontWeight="bold">
                i
              </text>
            </svg>
            权重之和：{sum}%（必须等于100%）
          </span>
          <span className="mt-[10px] block text-[15px] text-[#E6A23C]">此为终态策略，不可再添加后续路由策略。</span>
        </span>
      </div>
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

export default function Page({ __showFeat = false }: { __showFeat?: boolean }) {
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
  const [plazaModel, setPlazaModel] = useState<string>('')
  const [backend, setBackend] = useState<'internal' | 'external'>(
    src ? (src.backendType === '内部推理服务' ? 'internal' : 'external') : 'internal',
  )
  const [instances, setInstances] = useState<string[]>(src ? src.instances.map((i) => i.label) : [])
  const [cacheOn, setCacheOn] = useState(src ? src.cacheOn : false)
  const [cacheTime] = useState(src?.cacheTime || '60')
  const [routeCards, setRouteCards] = useState<number[]>(isEdit && src ? [Date.now()] : [])
  const [fallbackOn, setFallbackOn] = useState(src ? src.fallbackOn : false)
  const [fallbackType, setFallbackType] = useState(src?.fallbackType || '外部推理服务')
  const [fallbackModels, setFallbackModels] = useState<string[]>(src ? src.fallbackModels : [])
  const [rpmOn, setRpmOn] = useState(src ? src.rpmOn : false)

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
                onClick={() => navigate('/在线服务优化/onlineservice?v=v1')}
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
                {/* 策略名称 */}
                <div className="flex items-center">
                  <FieldLabel text="策略名称" required />
                  <input
                    placeholder="请输入策略名称"
                    defaultValue={isEdit ? editName ?? '' : undefined}
                    readOnly={isEdit}
                    className={`ml-[53px] w-[600px] h-[45px] rounded border border-[#d9d9d9] px-3 text-[14px] placeholder:text-[#bfbfbf] outline-none focus:border-[#166EFF] ${
                      isEdit ? 'bg-[#f7f8fa] text-[#666] cursor-not-allowed' : 'text-[#333]'
                    }`}
                  />
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

                {/* 后端服务类型 */}
                <div className="flex items-center">
                  <FieldLabel text="后端服务类型" />
                  <div className="ml-[53px] flex items-center gap-[46px]">
                    <Radio checked={backend === 'internal'} label="内部推理服务" onChange={() => { setBackend('internal'); setInstances([]) }} />
                    <Radio checked={backend === 'external'} label="外部推理服务" onChange={() => { setBackend('external'); setInstances([]) }} />
                  </div>
                </div>

                {/* 关联模型（仅公开发布 + 内部推理服务时出现） */}
                {publishType === 'public' && backend === 'internal' && (
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <FieldLabel text="关联模型" />
                      <PlazaModelSelect value={plazaModel} onChange={setPlazaModel} />
                    </div>
                    <p className="ml-[201px] mt-[8px] text-[13px] text-[#8c8c8c]">
                      关联一个模型广场的模型，其他用户可在模型广场查看此在线服务的API调用信息
                    </p>
                  </div>
                )}

                {/* 后端推理实例 */}
                <div className="flex items-center">
                  <FieldLabel text="后端推理实例" required />
                  <InstanceSelect backend={backend} values={instances} onChange={setInstances} />
                </div>

                {/* 模型名称 */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <FieldLabel text="模型名称" required />
                    <input
                      placeholder="请输入模型名称"
                      defaultValue={src ? src.model : undefined}
                      className="ml-[53px] w-[600px] h-[45px] rounded border border-[#d9d9d9] px-3 text-[14px] text-[#333] placeholder:text-[#bfbfbf] outline-none focus:border-[#166EFF]"
                    />
                  </div>
                  <p className="ml-[201px] mt-[2px] text-[13px] text-[#8c8c8c]">
                    调用模型接口时使用的模型名称，对应在线服务详情【API 文档】示例代码中"model"字段
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
                  <FieldLabel text="模型Fallback" />
                  <span className="ml-[53px] flex items-center">
                    <Toggle on={fallbackOn} onClick={() => setFallbackOn((v) => !v)} />
                    <span className="ml-3 text-[14px] text-[#333]">启动外部大模型兜底（Fallback策略）</span>
                  </span>
                </div>

                {/* Fallback 展开区 */}
                {fallbackOn && (
                  <div className="flex items-start">
                    <span className="w-[148px] shrink-0" />
                    <span className="ml-[53px] flex-1">
                      <span className="flex items-start text-[14px] text-[#8c8c8c]">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mr-2 mt-[2px] shrink-0" aria-hidden>
                          <circle cx="8" cy="8" r="7" fill="#8c8c8c" />
                          <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#fff" fontStyle="italic" fontWeight="bold">
                            i
                          </text>
                        </svg>
                        当配置的推理服务全部宕机，请求将自动转发至下方外部模型。降级过程会有延迟。
                      </span>
                      <span className="mt-[20px] flex items-start gap-[36px]">
                        <FallbackTypeSelect value={fallbackType} onChange={setFallbackType} />
                        <FallbackServiceSelect type={fallbackType} picked={fallbackModels} onChange={setFallbackModels} />
                      </span>
                      <span className="mt-[14px] flex items-center text-[14px] text-[#8c8c8c]">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mr-2" aria-hidden>
                          <circle cx="8" cy="8" r="7" fill="#8c8c8c" />
                          <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#fff" fontStyle="italic" fontWeight="bold">
                            i
                          </text>
                        </svg>
                        仅展示运行中的推理服务
                      </span>
                    </span>
                  </div>
                )}

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
                  onClick={() => navigate('/在线服务优化/onlineservice?v=v1')}
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

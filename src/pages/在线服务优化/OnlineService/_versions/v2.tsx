import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocPanel, DocProvider, FEATURES } from '../feature-tags'
import { PlatformHeader, SideNav } from '../_shared'

type Instance = {
  label: string
  running: boolean
  weight?: number
  model?: string
}
type ServiceRow = {
  name: string
  model: string
  published: boolean
  publishType: '私有发布' | '公开发布'
  route: string
  cacheOn: boolean
  cacheTime?: string
  backend: string
  instances: Instance[]
  apiUrl: string
  totalTokens: string
  inputTokens: string
  outputTokens: string
  totalCalls: string
  successCalls: string
  failedCalls: number
  fallbackOn: boolean
  fallbackModels: string[]
  rpmOn: boolean
  rpm?: string
}

const API_BASE = 'http://kgateway.10.4.13.17.nip.io/uat/compatible-mode/v1/chat/completions'

const SERVICE_ROWS: ServiceRow[] = [
  {
    name: '测试外部2',
    model: 'qwen-max',
    published: true,
    publishType: '私有发布',
    route: '–',
    cacheOn: false,
    backend: '外部推理实例',
    instances: [{ label: '阿里不完整路径', running: true, weight: 100, model: 'qwen-max' }],
    apiUrl: API_BASE,
    totalTokens: '1,842.5k',
    inputTokens: '1,120.0k',
    outputTokens: '722.5k',
    totalCalls: '8,240',
    successCalls: '8,228',
    failedCalls: 12,
    fallbackOn: false,
    fallbackModels: [],
    rpmOn: true,
    rpm: '5000 RPM',
  },
  {
    name: '测试外部服务',
    model: 'qwen-plus',
    published: true,
    publishType: '私有发布',
    route: '金丝雀发布',
    cacheOn: true,
    cacheTime: '120秒',
    backend: '外部推理实例',
    instances: [
      { label: '百炼基线服务', running: true, weight: 90, model: 'qwen-plus' },
      { label: '百炼灰度服务', running: true, weight: 10, model: 'qwen-plus' },
    ],
    apiUrl: API_BASE,
    totalTokens: '426.8k',
    inputTokens: '268.4k',
    outputTokens: '158.4k',
    totalCalls: '1,520',
    successCalls: '1,520',
    failedCalls: 0,
    fallbackOn: false,
    fallbackModels: [],
    rpmOn: false,
  },
  {
    name: 'gge',
    model: 'QwQ-32B',
    published: false,
    publishType: '私有发布',
    route: '蓝绿发布',
    cacheOn: false,
    backend: '内部推理实例',
    instances: [
      { label: 'kt服务-蓝组', running: true, weight: 100, model: 'QwQ-32B' },
      { label: 'kt服务-绿组', running: true, weight: 0, model: 'QwQ-32B' },
    ],
    apiUrl: API_BASE,
    totalTokens: '89.2k',
    inputTokens: '54.0k',
    outputTokens: '35.2k',
    totalCalls: '320',
    successCalls: '318',
    failedCalls: 2,
    fallbackOn: false,
    fallbackModels: [],
    rpmOn: false,
  },
  {
    name: '测试外部',
    model: 'Qwen2.5-72B-Instruct',
    published: false,
    publishType: '私有发布',
    route: '按权重分发',
    cacheOn: true,
    cacheTime: '100秒',
    backend: '外部推理实例',
    instances: [
      { label: 'demo-18080', running: true, weight: 20, model: 'Qwen2.5-72B-Instruct' },
      { label: 'demo-18081', running: true, weight: 30, model: 'Qwen2.5-72B-Instruct' },
      { label: 'demo-18082', running: true, weight: 50, model: 'Qwen2.5-72B-Instruct' },
    ],
    apiUrl: API_BASE,
    totalTokens: '3,640.0k',
    inputTokens: '2,180.0k',
    outputTokens: '1,460.0k',
    totalCalls: '12,850',
    successCalls: '12,815',
    failedCalls: 35,
    fallbackOn: true,
    fallbackModels: ['vllm验证'],
    rpmOn: true,
    rpm: '2000 RPM',
  },
  {
    name: '验证缓存设置',
    model: 'Qwen3-32B',
    published: false,
    publishType: '私有发布',
    route: '–',
    cacheOn: true,
    cacheTime: '60秒',
    backend: '内部推理实例',
    instances: [{ label: 'test', running: false, weight: 100, model: 'Qwen3-32B' }],
    apiUrl: API_BASE,
    totalTokens: '156.4k',
    inputTokens: '98.2k',
    outputTokens: '58.2k',
    totalCalls: '640',
    successCalls: '592',
    failedCalls: 48,
    fallbackOn: false,
    fallbackModels: [],
    rpmOn: false,
  },
  {
    name: '1个服务',
    model: 'DeepSeek-R1-Distill-Qwen-32B',
    published: false,
    publishType: '私有发布',
    route: '–',
    cacheOn: true,
    cacheTime: '300秒',
    backend: '内部推理实例',
    instances: [{ label: 'test', running: true, weight: 100, model: 'DeepSeek-R1-Distill-Qwen-32B' }],
    apiUrl: API_BASE,
    totalTokens: '24.6k',
    inputTokens: '15.1k',
    outputTokens: '9.5k',
    totalCalls: '95',
    successCalls: '95',
    failedCalls: 0,
    fallbackOn: false,
    fallbackModels: [],
    rpmOn: true,
    rpm: '1000 RPM',
  },
]

type FilterField = '服务名称' | '调用模型名' | '发布类型'
const FILTER_FIELDS: FilterField[] = ['服务名称', '调用模型名', '发布类型']
const MODEL_OPTIONS = [
  'qwen-max',
  'qwen-plus',
  'QwQ-32B',
  'Qwen2.5-72B-Instruct',
  'Qwen3-32B',
  'DeepSeek-R1-Distill-Qwen-32B',
]
const PUBLISH_TYPE_OPTIONS: ServiceRow['publishType'][] = ['私有发布', '公开发布']

function DropdownSelect({
  value,
  options,
  placeholder,
  widthClass,
  textClass = 'text-[14.5px]',
  onChange,
}: {
  value: string
  options: string[]
  placeholder: string
  widthClass: string
  textClass?: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  const selected = options.includes(value)
  return (
    <div ref={ref} className={`relative inline-block ${widthClass}`}>
      <span
        onClick={() => setOpen((o) => !o)}
        className={`h-[36px] inline-flex items-center justify-between rounded border border-[#d9d9d9] bg-white px-3 ${textClass} ${
          selected ? 'text-[#333]' : 'text-[#bfbfbf]'
        } cursor-pointer`}
      >
        {selected ? value : placeholder}
        <svg width={12} height={12} viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {open && (
        <div className="absolute left-0 top-[41px] z-30 w-full rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="block py-[4px]">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={`flex h-[36px] items-center cursor-pointer px-[14px] text-[14px] ${
                  opt === value ? 'bg-[#f5f7fa] text-[#166EFF]' : 'text-[#333] hover:bg-[#f5f7fa]'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSelect({ value, onChange }: { value: FilterField; onChange: (f: FilterField) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div ref={ref} className="relative inline-block shrink-0">
      <span
        onClick={() => setOpen((o) => !o)}
        className="h-[36px] inline-flex items-center justify-between gap-[10px] rounded-l border border-r-0 border-[#d9d9d9] bg-white pl-3 pr-2 text-[14.5px] text-[#333] cursor-pointer"
      >
        {value}
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {open && (
        <div className="absolute left-0 top-[41px] z-30 w-[132px] rounded-[4px] border border-[#e4e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="block py-[4px]">
            {FILTER_FIELDS.map((f) => (
              <div
                key={f}
                onClick={() => {
                  onChange(f)
                  setOpen(false)
                }}
                className={`flex h-[36px] items-center cursor-pointer px-[14px] text-[14px] ${
                  f === value ? 'bg-[#f5f7fa] text-[#166EFF]' : 'text-[#333] hover:bg-[#f5f7fa]'
                }`}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ListToolbar({
  filterField,
  setFilterField,
  keyword,
  setKeyword,
  modelValue,
  setModelValue,
  publishTypeValue,
  setPublishTypeValue,
  onQuery,
  onReset,
}: {
  filterField: FilterField
  setFilterField: (f: FilterField) => void
  keyword: string
  setKeyword: (v: string) => void
  modelValue: string
  setModelValue: (v: string) => void
  publishTypeValue: string
  setPublishTypeValue: (v: string) => void
  onQuery: () => void
  onReset: () => void
}) {
  return (
    <div className="ml-auto flex items-center">
      <FilterSelect value={filterField} onChange={setFilterField} />
      {filterField === '服务名称' && (
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onQuery()}
          placeholder="请输入服务名称"
          className="h-[36px] w-[280px] rounded-r border border-l-0 border-[#d9d9d9] px-3 text-[14.5px] text-[#333] placeholder:text-[#bfbfbf] outline-none focus:border-[#166EFF]"
        />
      )}
      {filterField === '调用模型名' && (
        <DropdownSelect
          value={modelValue}
          options={MODEL_OPTIONS}
          placeholder="请选择调用模型名"
          widthClass="w-[280px]"
          onChange={setModelValue}
        />
      )}
      {filterField === '发布类型' && (
        <DropdownSelect
          value={publishTypeValue}
          options={PUBLISH_TYPE_OPTIONS}
          placeholder="请选择发布类型"
          widthClass="w-[280px]"
          onChange={setPublishTypeValue}
        />
      )}
      <button
        onClick={onQuery}
        className="ml-[14px] h-[36px] w-[68px] rounded bg-[#166EFF] text-[14.5px] text-white cursor-pointer"
      >
        查询
      </button>
      <button
        onClick={onReset}
        className="ml-[14px] h-[36px] w-[68px] rounded border border-[#d9d9d9] bg-white text-[14.5px] text-[#333] cursor-pointer"
      >
        重置
      </button>
    </div>
  )
}

function InstanceHealthTip() {
  return (
    <span className="relative ml-2 inline-flex group">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="text-[#bbb] cursor-help">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
        <text x="8" y="11" textAnchor="middle" fontSize="9" fill="currentColor" fontStyle="italic" fontWeight="bold">?</text>
      </svg>
      <span className="pointer-events-none absolute bottom-[22px] left-1/2 -translate-x-1/2 hidden w-[150px] group-hover:block z-20">
        <span className="block rounded-[6px] bg-[#262626] px-[12px] py-[9px] text-[12px] text-white leading-[18px]">
          <span className="inline-flex items-center gap-1.5">🟢 运行中</span>
          <span className="mt-1 inline-flex items-center gap-1.5">🔴 异常</span>
        </span>
        <span className="mx-auto -mt-[5px] block h-[10px] w-[10px] rotate-45 bg-[#262626]" />
      </span>
    </span>
  )
}

function CopyIcon({ done }: { done?: boolean }) {
  return done ? (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#67C23A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.4" />
      <path d="M3.5 10.5V3.5a1 1 0 0 1 1-1h7" />
    </svg>
  )
}

function ServiceCard({ row }: { row: ServiceRow }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, key: string) => {
    try {
      navigator.clipboard?.writeText(text)
    } catch {
      /* ignore */
    }
    setCopied(key)
    window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
  }
  const toDetail = () => navigate(`/在线服务优化/onlineservicedetail?name=${encodeURIComponent(row.name)}&v=v2`)
  const toUsage = () => navigate(`/在线服务优化/onlineservicedetail?name=${encodeURIComponent(row.name)}&tab=usage&v=v2`)
  const toEdit = () => navigate(`/在线服务优化/onlineservicecreate?name=${encodeURIComponent(row.name)}&v=v2`)

  return (
    <div className="flex flex-col rounded-[8px] border border-[#e6e8eb] bg-white transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      {/* 头部：左侧服务名称 + 右侧状态与发布范围 */}
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <a onClick={toDetail} className="truncate text-[17px] font-semibold text-[#1f2329] cursor-pointer hover:text-[#166EFF]">
          {row.name}
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex h-[24px] items-center rounded px-[9px] text-[13px] text-white ${
              row.published ? 'bg-[#67C23A]' : 'bg-[#909399]'
            }`}
          >
            {row.published ? '已发布' : '未发布'}
          </span>
          <span
            className={`inline-flex h-[24px] items-center rounded px-[9px] text-[13px] ${
              row.publishType === '公开发布' ? 'bg-[#E6F4FF] text-[#1677ff]' : 'bg-[#F0F9EB] text-[#67C23A]'
            }`}
          >
            {row.publishType === '公开发布' ? '模型广场' : '私有发布'}
          </span>
        </div>
      </div>

      {/* 调用模型名 + 复制 */}
      <div className="px-5 mt-3 flex items-center gap-2">
        <span className="shrink-0 text-[13px] text-[#8c8c8c]">调用模型名</span>
        <code className="inline-flex max-w-[230px] truncate rounded bg-[#f5f6f8] px-2 py-1 text-[13px] font-mono text-[#333]">
          {row.model}
        </code>
        <button
          onClick={() => copy(row.model, 'model')}
          className="inline-flex items-center gap-1 rounded border border-[#e6e8eb] px-1.5 py-1 text-[12px] text-[#666] hover:text-[#166EFF] cursor-pointer"
          title="复制调用模型名"
        >
          <CopyIcon done={copied === 'model'} />
        </button>
      </div>

      {/* 接入地址 + 复制 */}
      <div className="px-5 mt-2 flex items-center gap-2">
        <span className="shrink-0 text-[13px] text-[#8c8c8c]">接入地址</span>
        <code className="flex-1 truncate rounded bg-[#f5f6f8] px-2 py-1 text-[12px] font-mono text-[#666]">
          {row.published ? row.apiUrl : '–'}
        </code>
        <button
          onClick={() => row.published && copy(row.apiUrl, 'url')}
          className={`inline-flex shrink-0 items-center gap-1 rounded border border-[#e6e8eb] px-1.5 py-1 text-[12px] ${row.published ? 'text-[#666] hover:text-[#166EFF] cursor-pointer' : 'text-[#ccc] cursor-not-allowed'}`}
          title={row.published ? '复制接入地址' : '未发布，暂无接入地址'}
        >
          <CopyIcon done={copied === 'url'} />
        </button>
      </div>

      {/* 后端推理实例 + 权重 + 健康 */}
      <div className="px-5 mt-4 flex-1">
        <div className="mb-2 flex items-center gap-2 text-[13px] text-[#8c8c8c]">
          <span className="text-[#333] font-medium">{row.backend}</span>
          <span>·</span>
          <span>{row.route !== '–' ? row.route : '默认路由'}</span>
          <span>·</span>
          <span>{row.instances.length} 个实例</span>
          <InstanceHealthTip />
        </div>
        <div className="flex flex-col gap-2">
          {row.instances.map((ins) => {
            const isBlueGreen = row.route === '蓝绿发布'
            const isActiveBg = isBlueGreen && (ins.weight ?? 0) > 0
            return (
              <div key={ins.label} className="flex items-center gap-2">
                <span
                  className={`w-[8px] h-[8px] rounded-full shrink-0 ${
                    ins.running ? 'bg-[#52C18E]' : 'bg-[#F82709]'
                  }`}
                />
                <span className="w-[140px] shrink-0 truncate text-[13px] text-[#333]">
                  {ins.label}
                </span>
                {ins.model && <span className="shrink-0 text-[12px] text-[#999]">({ins.model})</span>}
                {isBlueGreen ? (
                  <span
                    className={`ml-auto shrink-0 text-[12px] ${
                      isActiveBg ? 'text-[#166EFF] font-medium' : 'text-[#999]'
                    }`}
                  >
                    {isActiveBg ? '当前生效' : '待命'}
                  </span>
                ) : (
                  ins.weight != null && (
                    <>
                      <div className="flex-1 h-[6px] rounded bg-[#f0f0f0] overflow-hidden">
                        <div className="h-full bg-[#166EFF]" style={{ width: `${ins.weight}%` }} />
                      </div>
                      <span className="w-[34px] shrink-0 text-right text-[12px] text-[#666]">{ins.weight}%</span>
                    </>
                  )
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 高可用策略特性标签 */}
      <div className="px-5 mt-4 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded px-2 py-1 text-[12px] ${
            row.cacheOn ? 'bg-[#E6F4FF] text-[#1677ff]' : 'bg-[#f5f5f5] text-[#999]'
          }`}
        >
          ⚡ 缓存{row.cacheOn ? ` ${row.cacheTime}` : '未开启'}
        </span>
        {row.route !== '金丝雀发布' && row.route !== '蓝绿发布' && (
          <span
            className={`inline-flex items-center rounded px-2 py-1 text-[12px] ${
              row.fallbackOn ? 'bg-[#E6F4FF] text-[#1677ff]' : 'bg-[#f5f5f5] text-[#999]'
            }`}
          >
            🛡 Fallback{row.fallbackOn ? `: ${row.fallbackModels.join(',')}` : '未开启'}
          </span>
        )}
        <span
          className={`inline-flex items-center rounded px-2 py-1 text-[12px] ${
            row.rpmOn ? 'bg-[#F6FFED] text-[#52C41A]' : 'bg-[#f5f5f5] text-[#999]'
          }`}
        >
          ⏱ {row.rpmOn ? `限流 ${row.rpm}` : '不限流'}
        </span>
      </div>

      {/* 底部：详情页「用量统计」核心指标 + 快捷操作 */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] px-5 py-3">
        <div
          onClick={toUsage}
          title={`Token输入量：${row.inputTokens} ｜ Token输出量：${row.outputTokens}（点击查看用量统计）`}
          className="flex items-center gap-3.5 text-[12px] text-[#666] cursor-pointer hover:text-[#166EFF]"
        >
          <span>
            Token总量 <b className="text-[#333]">{row.totalTokens}</b>
            <span className="ml-1 text-[11px] text-[#999]">(入{row.inputTokens}/出{row.outputTokens})</span>
          </span>
          <span>
            调用总次数 <b className="text-[#333]">{row.totalCalls}</b>
          </span>
          <span>
            成功 <b className="text-[#52C41A]">{row.successCalls}</b>
            {' / '}
            失败 <b className={row.failedCalls > 0 ? 'text-[#F5222D]' : 'text-[#999]'}>{row.failedCalls}</b>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[13px]">
          <a onClick={toEdit} className="text-[#166EFF] cursor-pointer">
            编辑
          </a>
          <a
            onClick={() => {}}
            className="text-[#166EFF] cursor-pointer"
          >
            {row.published ? '取消发布' : '发布'}
          </a>
          <a onClick={() => {}} className="text-[#F5222D] cursor-pointer">
            删除
          </a>
          <a onClick={toDetail} className="text-[#166EFF] cursor-pointer">
            详情
          </a>
        </div>
      </div>
    </div>
  )
}

function TableCard() {
  const navigate = useNavigate()

  // 真实过滤状态（布局1：组合筛选器直接置于顶栏）
  const [filterField, setFilterField] = useState<FilterField>('服务名称')
  const [keyword, setKeyword] = useState('')
  const [modelValue, setModelValue] = useState('')
  const [publishTypeValue, setPublishTypeValue] = useState('')

  // 分页状态
  const [pageSize, setPageSize] = useState(12)
  const [page, setPage] = useState(1)
  const [goto, setGoto] = useState('')

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    const mv = modelValue.trim()
    const pt = publishTypeValue.trim()
    if (!kw && !mv && !pt) return SERVICE_ROWS
    return SERVICE_ROWS.filter((row) => {
      if (filterField === '服务名称' && kw) return row.name.toLowerCase().includes(kw)
      if (filterField === '调用模型名' && mv) return row.model === mv
      if (filterField === '发布类型' && pt) return row.publishType === pt
      return true
    })
  }, [filterField, keyword, modelValue, publishTypeValue])

  // 过滤条件变化时回到第一页
  useEffect(() => {
    setPage(1)
    setGoto('')
  }, [filterField, keyword, modelValue, publishTypeValue])

  const total = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  const handleQuery = () => {
    // 查询动作：过滤已通过 filteredRows 实时生效，这里保持受控
  }
  const handleReset = () => {
    setKeyword('')
    setModelValue('')
    setPublishTypeValue('')
  }

  return (
    <div className="flex-1 min-h-0 rounded-lg border border-[#e8e8e8] bg-white flex flex-col">
      {/* Toolbar: 创建 + 组合筛选器(布局1：左创建/中筛选) */}
      <div className="h-[70px] shrink-0 flex items-center gap-[18px] pl-[18px] pr-[24px] border-b border-[#f0f0f0]">
        <button
          onClick={() => navigate('/在线服务优化/onlineservicecreate?v=v2')}
          className="h-[35px] shrink-0 pl-[18px] pr-[20px] flex items-center gap-[6px] rounded bg-[#166EFF] text-[15px] text-white cursor-pointer"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="M11 7.6v6.8M7.6 11h6.8" />
          </svg>
          创建在线服务
        </button>

        <ListToolbar
          filterField={filterField}
          setFilterField={setFilterField}
          keyword={keyword}
          setKeyword={setKeyword}
          modelValue={modelValue}
          setModelValue={setModelValue}
          publishTypeValue={publishTypeValue}
          setPublishTypeValue={setPublishTypeValue}
          onQuery={handleQuery}
          onReset={handleReset}
        />
      </div>

      {/* 卡片区域（可滚动） */}
      <div className="flex-1 min-h-0 overflow-auto px-4 pb-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {pageRows.map((row) => (
            <ServiceCard key={row.name} row={row} />
          ))}
        </div>
      </div>

      {/* 分页（参考列表分页样式） */}
      <div className="shrink-0 border-t border-[#f6f6f6] h-[78px] flex items-start pt-[12px] justify-end pl-[18px] pr-[28px]">
        <span className="h-[36px] flex items-center text-[14.5px] text-[#656565] mr-5">共 {total} 条</span>
        <DropdownSelect
          value={String(pageSize)}
          options={['12', '24', '48']}
          placeholder="条/页"
          widthClass="w-[100px]"
          onChange={(v) => {
            setPageSize(Number(v))
            setPage(1)
            setGoto('')
          }}
        />
        <div className="ml-[19px] flex items-center gap-[10px]">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`w-[35px] h-[35px] flex items-center justify-center rounded cursor-pointer ${
              page <= 1 ? 'bg-[#f5f5f5] cursor-not-allowed' : 'bg-[#EEEEEE]'
            }`}
            aria-label="上一页"
          >
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M6.5 1.5 3 5l3.5 3.5" stroke="#595959" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="w-[36px] h-[35px] rounded-[6px] bg-[#166EFF] text-[14.5px] text-white cursor-pointer">{page}</button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`w-[35px] h-[35px] flex items-center justify-center rounded cursor-pointer ${
              page >= totalPages ? 'bg-[#f5f5f5] cursor-not-allowed' : 'bg-[#EEEEEE]'
            }`}
            aria-label="下一页"
          >
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M3.5 1.5 7 5 3.5 8.5" stroke="#595959" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <span className="ml-[14px] h-[36px] flex items-center text-[14.5px] text-[#656565]">前往</span>
        <input
          value={goto}
          onChange={(e) => setGoto(e.target.value.replace(/[^\d]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const n = Number(goto)
              if (n >= 1 && n <= totalPages) setPage(n)
              setGoto('')
            }
          }}
          className="ml-[10px] h-[32px] w-[62px] rounded border border-[#d9d9d9] text-center text-[14.5px] text-[#333] outline-none"
        />
        <span className="ml-[9px] h-[36px] flex items-center text-[14.5px] text-[#656565]">页</span>
      </div>
    </div>
  )
}

export default function Page({ __showFeat = true }: { __showFeat?: boolean }) {
  const [docCode, setDocCode] = useState<string | null>(null)
  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="relative h-[calc((100vh-57px)/0.9)] w-[calc(100%/0.9)] origin-top-left scale-[0.9] flex flex-col overflow-hidden bg-white text-[#1f2329] [font-family:'PingFang_SC','Helvetica_Neue',Arial,sans-serif]">
        <PlatformHeader />
        <div className="flex-1 min-h-0 flex">
          <SideNav />
          {/* Main content */}
          <main className="flex-1 min-w-0 flex flex-col pl-[6px] pr-[29px] pt-4 pb-[9px] overflow-hidden">
            <div className="shrink-0">
              <h1 className="text-[20px] font-bold text-[#000] leading-[30px]">在线服务</h1>
              <p className="text-[13px] text-[#6c6c6c]">
                管理对外提供访问的 API 接口，配置流量分发策略、安全限流及端点状态。
              </p>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <TableCard />
            </div>
          </main>
        </div>

        {/* Floating AI assistant button, right edge */}
        <button
          className="absolute top-[920px] right-0 h-[44px] w-[26px] rounded-l-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] border border-[#e6e9f0] border-r-0 flex items-center justify-end pr-[3px] cursor-pointer"
          aria-label="AI 助手"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <circle cx="9" cy="9" r="7" fill="#eaf1ff" />
            <circle cx="9" cy="9" r="7" fill="none" stroke="#166EFF" strokeWidth="1" />
            <circle cx="7.2" cy="7.2" r="1.4" fill="#166EFF" />
            <circle cx="11.4" cy="10.6" r="2.2" fill="#166EFF" />
          </svg>
        </button>
      </div>
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

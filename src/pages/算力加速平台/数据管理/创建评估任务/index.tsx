/**
 * 算力加速平台-数据管理 · 创建评估任务（独立表单页）
 *
 * 按现有「创建评估任务」页面 1:1 还原，外壳复用 platform-shell 素材：
 * 1. 顶部返回栏（← + 竖线 + 创建评估任务）
 * 2. 基本信息：评估类型 / 名称 / 描述
 * 3. 评估对象：对象类型 / 选择服务
 * 4. 评估配置：数据集来源（合成数据参数）、评估模式、参数配置（模式选项卡 + 参数表）
 * 5. 高级配置：4 张可开关配置卡片
 * 6. 底部「取消 / 创建」按钮
 */
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PlatformHeader, SideNav } from '../数据集管理/_shared'
import { readDatasets } from '../数据集管理/store'
import { TagChips } from '../数据集管理/tags'
import type { Dataset } from '../数据集管理/mock'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

const LIST_PATH = '/算力加速平台/数据管理/性能评估'

/** 表单输入控件统一宽度 */
const FIELD_WIDTH = 'w-[560px]'
/** 参数配置区（选项卡 + 参数表）宽度 */
const PANEL_WIDTH = 'w-[760px]'

const NAME_MAX_LENGTH = 50
const DESC_MAX_LENGTH = 200

/** 区块标题：左侧 3px 蓝色竖条 + 粗体标题 */
function SectionTitle({ text, extra }: { text: string; extra?: ReactNode }) {
  return (
    <div className="flex items-center">
      <span className="mr-2.5 h-[14px] w-[3px] rounded-[1px] bg-[#1890ff]" />
      <span className="text-[15px] font-bold text-[#1d2129]">{text}</span>
      {extra}
    </div>
  )
}

/** 表单字段标签：右对齐固定列宽 */
function FieldLabel({
  text,
  required,
  topOffset = 'pt-[7px]',
}: {
  text: string
  required?: boolean
  topOffset?: string
}) {
  return (
    <div className={`flex w-[112px] shrink-0 items-start justify-end pr-5 ${topOffset}`}>
      <span className="whitespace-nowrap text-[13px] leading-5 text-[#333]">{text}</span>
      {required && <span className="ml-0.5 text-[13px] leading-5 text-[#f53f3f]">*</span>}
    </div>
  )
}

/** 单选按钮组（横向） */
function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  required,
  extra,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
  required?: boolean
  extra?: ReactNode
}) {
  return (
    <div className="flex items-start">
      <FieldLabel text={label} required={required} />
      <div className="flex min-h-[34px] flex-wrap items-center gap-x-6 gap-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-1.5 text-[13px] leading-5 text-[#1d2129]"
          >
            <input
              type="radio"
              name={label}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-[14px] w-[14px] cursor-pointer accent-[#1890ff]"
            />
            {option.label}
          </label>
        ))}
        {extra}
      </div>
    </div>
  )
}

/** 数字参数输入单元：标签（key）与输入框（value）同一行 */
function ParamField({
  label,
  required,
  value,
  onChange,
  unit,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  unit?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex shrink-0 items-center whitespace-nowrap text-[13px] leading-5 text-[#333]">
        {label}
        {required && <span className="ml-0.5 text-[#f53f3f]">*</span>}
      </span>
      <div className="flex h-[34px] min-w-0 flex-1 items-center rounded-[4px] border border-[#e5e6eb] bg-white px-3 transition-colors focus-within:border-[#1890ff]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="请输入"
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#1d2129] outline-none placeholder:text-[#c9cdd4]"
        />
        {unit && <span className="ml-2 shrink-0 text-[12px] text-[#86909c]">{unit}</span>}
      </div>
    </div>
  )
}

/** 开关：纯 tailwind 实现，无 inline style */
function Switch({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${
        checked ? 'bg-[#1890ff]' : 'bg-[#d9d9d9]'
      }`}
    >
      <span
        className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all ${
          checked ? 'left-[16px]' : 'left-[2px]'
        }`}
      />
    </button>
  )
}

function ActionButton({
  children,
  onClick,
  variant = 'default',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'default'
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-[88px] tracking-[2px] ${
        variant === 'primary'
          ? 'h-[34px] rounded-[4px] bg-[#1890ff] text-[13px] text-white transition-colors hover:bg-[#0d7be8] disabled:cursor-not-allowed disabled:bg-[#a0cfff]'
          : 'h-[34px] rounded-[4px] border border-[#d9d9d9] bg-white text-[13px] text-[#333] transition-colors hover:border-[#1890ff] hover:text-[#1890ff]'
      }`}
    >
      {children}
    </button>
  )
}

/* ---------------------------- 选择推理服务下拉 ---------------------------- */

const SERVICE_GROUPS = [
  { key: 'inner', label: '内部推理服务', items: ['test-nvshare'] },
  {
    key: 'outer',
    label: '外部推理服务',
    items: ['阿里不完整路径', '外部服务', 'demo-18080', 'demo-18082', '阿里百炼服务'],
  },
] as const

const SERVICE_TABS = [
  { key: 'all', label: '全部' },
  { key: 'inner', label: '内部推理服务' },
  { key: 'outer', label: '外部推理服务' },
] as const

function ServiceSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'all' | 'inner' | 'outer'>('all')
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const groups = SERVICE_GROUPS.filter((group) => tab === 'all' || tab === group.key)

  return (
    <div ref={boxRef} className={`relative ${FIELD_WIDTH} shrink-0`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-[34px] w-full items-center justify-between rounded-[4px] border bg-white px-3 text-[13px] transition-colors ${
          open ? 'border-[#1890ff]' : 'border-[#e5e6eb] hover:border-[#91caff]'
        }`}
      >
        <span className={value ? 'text-[#1d2129]' : 'text-[#c9cdd4]'}>{value || '请选择推理服务'}</span>
        <span className={`text-[10px] text-[#86909c] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-[38px] z-30 w-full overflow-hidden rounded-[4px] border border-[#e5e6eb] bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
          <span className="absolute -top-[5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-[#e5e6eb] bg-white" />
          <div className="flex items-stretch border-b border-[#e5e6eb]">
            {SERVICE_TABS.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`flex h-[32px] flex-1 items-center justify-center text-[12px] transition-colors ${
                  index > 0 ? 'border-l border-[#e5e6eb]' : ''
                } ${tab === item.key ? 'bg-[#1890ff] text-white' : 'bg-white text-[#4e5969] hover:text-[#1890ff]'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="px-3 pb-1 pt-2 text-[12px] leading-5 text-[#86909c]">{group.label}</p>
                {group.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onChange(item)
                      setOpen(false)
                    }}
                    className={`block w-full px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[#f2f7ff] ${
                      value === item ? 'text-[#1890ff]' : 'text-[#1d2129]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------- 平台数据集下拉 ---------------------------- */

/** 按名称模糊检索；选择后只保留选项框，不再展开详情卡 */
function DatasetSelect({
  datasets,
  value,
  onChange,
}: {
  datasets: Dataset[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const selected = datasets.find((item) => item.id === value)
  const trimmed = keyword.trim().toLowerCase()
  const list = trimmed
    ? datasets.filter((item) => item.name.toLowerCase().includes(trimmed))
    : datasets

  return (
    <div ref={boxRef} className={`relative ${FIELD_WIDTH} shrink-0`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={selected?.name}
        className={`flex h-[34px] w-full items-center justify-between gap-2 rounded-[4px] border bg-white px-3 text-[13px] transition-colors ${
          open ? 'border-[#1890ff]' : 'border-[#e5e6eb] hover:border-[#91caff]'
        }`}
      >
        <span className={`min-w-0 flex-1 truncate text-left ${selected ? 'text-[#1d2129]' : 'text-[#c9cdd4]'}`}>
          {selected ? selected.name : '请选择数据集'}
        </span>
        {selected && (
          <span
            role="button"
            tabIndex={-1}
            title="清空已选数据集"
            onClick={(event) => {
              event.stopPropagation()
              onChange('')
              setOpen(false)
              setKeyword('')
            }}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[12px] leading-none text-[#c9cdd4] transition-colors hover:bg-[#f2f3f5] hover:text-[#86909c]"
          >
            ✕
          </span>
        )}
        <span className={`shrink-0 text-[10px] text-[#86909c] transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[38px] z-30 w-full overflow-hidden rounded-[4px] border border-[#e5e6eb] bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
          <div className="p-2">
            <div className="relative">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索数据集名称"
                className="h-[30px] w-full rounded-[4px] border border-[#e5e6eb] bg-white pl-2 pr-7 text-[12px] text-[#1d2129] outline-none transition-colors placeholder:text-[#c9cdd4] hover:border-[#91caff] focus:border-[#1890ff]"
              />
              {keyword.length > 0 && (
                <button
                  type="button"
                  title="清空检索内容"
                  onClick={() => setKeyword('')}
                  className="absolute right-1.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-[12px] leading-none text-[#c9cdd4] transition-colors hover:bg-[#f2f3f5] hover:text-[#86909c]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[248px] overflow-y-auto border-t border-[#f2f3f5] py-1">
            {list.length === 0 && (
              <p className="px-3 py-4 text-center text-[12px] leading-5 text-[#86909c]">
                未找到匹配的数据集
              </p>
            )}
            {list.map((item) => {
              const active = item.id === value
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id)
                    setOpen(false)
                    setKeyword('')
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[#f2f7ff]"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className={`truncate text-[13px] leading-5 ${
                        active ? 'text-[#1890ff]' : 'text-[#1d2129]'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.tags.length > 0 && <TagChips tags={item.tags} />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/** 数据集版本下拉：只展示版本号；宽度与下方内容区对齐 */
function VersionSelect({
  dataset,
  value,
  onChange,
}: {
  dataset: Dataset
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-[34px] w-[188px] shrink-0 rounded-[4px] border border-[#e5e6eb] bg-white px-3 pr-7 text-[13px] text-[#1d2129] outline-none transition-colors hover:border-[#91caff] focus:border-[#1890ff]"
    >
      {dataset.versions
        .filter((item) => item.status === '导入成功')
        .map((item) => (
          <option key={item.version} value={item.version}>
            {item.version}
          </option>
        ))}
    </select>
  )
}

/* ------------------------------ 静态配置项 ------------------------------ */

const CONCURRENCY_MODES = [
  {
    key: 'fixed',
    title: '固定并发场景',
    desc: '在固定并发请求数下评测服务的响应延迟、吞吐和稳定性。',
  },
  { key: 'qps', title: '固定 QPS 场景', desc: '按指定请求速率持续发起请求，评测服务在目标流量下的表现。' },
  {
    key: 'qps-with-limit',
    title: '固定 QPS + 最大并发上限场景',
    desc: '按指定请求速率发起请求，并限制同时在途请求数，评测服务在受控流量下的表现。',
  },
] as const

const ADVANCED_ITEMS = [
  {
    key: 'press',
    title: '可靠性配置',
    desc: '通过多轮重复采样与自适应防抖机制，消除系统偶发误差，确保输出的压测数据具备高置信度的统计学参考价值。',
  },
  {
    key: 'warmup',
    title: '冷启动预热配置',
    desc: '自动在正式计分前发送请求，激发 GPU 显存池，防止冷启动干扰指标结果。',
  },
  {
    key: 'prefix',
    title: '前缀缓存配置',
    desc: '模拟所有请求共享一段极长的系统提示词，专门评估 KV Cache 命中率。',
  },
  {
    key: 'sla',
    title: 'SLA 判定配置',
    desc: '开启后，统计同时满足以下延迟阈值的请求。任何一项超出阈值的请求不计入 SLA 达标吞吐率。',
  },
] as const

const PARAM_ROWS = [
  {
    key: 'concurrency',
    name: '并发请求数',
    required: true,
    desc: '个，正整数，范围：1~512，同时保持的在途请求数量。数值越大，对服务的并发压力越高。',
  },
  {
    key: 'firstToken',
    name: '首 Token 并发上限',
    required: false,
    desc: '个，正整数，范围：1~512，同时等待首 Token 的请求上限，用于限制 prompt 处理阶段的并发压力。必须小于等于并发请求数。',
  },
  {
    key: 'rampUp',
    name: '并发爬坡时间',
    required: false,
    desc: '秒，正整数，范围：1~600，在指定时间内从低并发逐步提升到目标并发，避免一开始就达到目标并发。',
  },
  {
    key: 'endMode',
    name: '评测结束方式',
    required: true,
    desc: '选择评测结束条件：按请求总数结束，或按评测时长结束。',
  },
  {
    key: 'totalRequest',
    name: '请求总数',
    required: true,
    desc: '个，正整数，范围：1~100000，本次评测最多发起的请求数量。',
  },
] as const

export default function CreateEvaluationTaskPage({
  __showFeat = false,
}: {
  __showFeat?: boolean
} = {}) {
  const navigate = useNavigate()
  const [docCode, setDocCode] = useState<string | null>(null)

  const [evalType, setEvalType] = useState<'text'>('text')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [objectType, setObjectType] = useState<'service'>('service')
  const [service, setService] = useState('')

  const [datasetSource, setDatasetSource] = useState<'synthetic' | 'dataset'>('synthetic')
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [datasetId, setDatasetId] = useState('')
  const [datasetVersion, setDatasetVersion] = useState('')

  // 只保留至少有一个版本导入成功的数据集
  useEffect(() => {
    setDatasets(readDatasets().filter((item) => item.versions.some((v) => v.status === '导入成功')))
  }, [])

  const [avgInput, setAvgInput] = useState('1024')
  const [avgOutput, setAvgOutput] = useState('256')
  const [datasetCount, setDatasetCount] = useState('1000')
  const [inputStd, setInputStd] = useState('0')
  const [outputStd, setOutputStd] = useState('0')

  const [evalMode, setEvalMode] = useState<'single' | 'explore'>('single')
  const [concurrencyMode, setConcurrencyMode] = useState<'fixed' | 'qps' | 'qps-with-limit'>('fixed')
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    concurrency: '10',
    firstToken: '',
    rampUp: '',
    endMode: '按请求总数',
    totalRequest: '100',
  })
  const [advanced, setAdvanced] = useState<Record<string, boolean>>({
    press: false,
    warmup: false,
    prefix: false,
    sla: false,
  })

  const canSubmit =
    name.trim().length > 0 &&
    service.length > 0 &&
    (datasetSource === 'synthetic' || (datasetId.length > 0 && datasetVersion.length > 0))

  const selectedDataset = datasets.find((item) => item.id === datasetId)

  /** 选中数据集后默认落到最新的「导入成功」版本 */
  /** 选择数据集：清空时同时清掉版本；选中时默认落到最新的导入成功版本 */
  function pickDataset(id: string) {
    setDatasetId(id)
    const target = datasets.find((item) => item.id === id)
    const ready = target?.versions.filter((item) => item.status === '导入成功') ?? []
    setDatasetVersion(id ? (ready[0]?.version ?? '') : '')
  }

  function setParam(key: string, value: string) {
    setParamValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
        <PlatformHeader />

        <div className="flex min-h-0 flex-1">
          <SideNav activeKey="性能评估" />

          <main className="flex min-w-0 flex-1 flex-col bg-white">
            {/* 顶部返回栏 */}
            <div className="flex h-[46px] shrink-0 items-center border-b border-[#e5e6eb] px-6">
              <button
                type="button"
                aria-label="返回"
                onClick={() => navigate(LIST_PATH)}
                className="flex items-center text-[#9ca3af] transition-colors hover:text-[#1890ff]"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="mx-3 h-[14px] w-[1px] bg-[#e5e6eb]" />
              <span className="text-[14px] font-medium text-[#1d2129]">创建评估任务</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-12 pt-6">
              {/* 基本信息 */}
              <SectionTitle text="基本信息" />

              <div className="mt-5 space-y-4">
                <RadioGroup
                  label="评估类型"
                  required
                  value={evalType}
                  onChange={setEvalType}
                  options={[{ value: 'text', label: '文本生成' }]}
                />

                <div className="flex items-start">
                  <FieldLabel text="名称" required />
                  <div className={`flex h-[34px] ${FIELD_WIDTH} shrink-0 items-center rounded-[4px] border border-[#e5e6eb] bg-white px-3 transition-colors focus-within:border-[#1890ff]`}>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value.slice(0, NAME_MAX_LENGTH))}
                      placeholder="请输入评估任务名称"
                      className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#1d2129] outline-none placeholder:text-[#c9cdd4]"
                    />
                    <span className="ml-2 shrink-0 text-[12px] text-[#c9cdd4]">
                      {name.length}/{NAME_MAX_LENGTH}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <FieldLabel text="描述" />
                  <div className={`relative ${FIELD_WIDTH} shrink-0 rounded-[4px] border border-[#e5e6eb] bg-white px-3 pb-6 pt-2 transition-colors focus-within:border-[#1890ff]`}>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value.slice(0, DESC_MAX_LENGTH))}
                      placeholder="请输入"
                      rows={2}
                      className="w-full resize-none bg-transparent text-[13px] leading-5 text-[#1d2129] outline-none placeholder:text-[#c9cdd4]"
                    />
                    <span className="pointer-events-none absolute bottom-1.5 right-3 text-[12px] text-[#c9cdd4]">
                      {description.length}/{DESC_MAX_LENGTH}
                    </span>
                  </div>
                </div>
              </div>

              {/* 评估对象 */}
              <div className="mt-8">
                <SectionTitle text="评估对象" />
              </div>

              <div className="mt-5 space-y-4">
                <RadioGroup
                  label="对象类型"
                  required
                  value={objectType}
                  onChange={setObjectType}
                  options={[{ value: 'service', label: '推理服务' }]}
                />

                <div className="flex items-start">
                  <FieldLabel text="选择服务" required />
                  <ServiceSelect value={service} onChange={setService} />
                </div>
              </div>

              {/* 评估配置 */}
              <div className="mt-8">
                <SectionTitle text="评估配置" />
              </div>

              <div className="mt-5 space-y-4">
                <RadioGroup
                  label="数据集来源"
                  required
                  value={datasetSource}
                  onChange={setDatasetSource}
                  options={[
                    { value: 'synthetic', label: '内部合成数据' },
                    { value: 'dataset', label: '平台数据集' },
                  ]}
                  extra={__showFeat ? <NewTag code="F-DATASET-SOURCE" compact /> : undefined}
                />

                {/* 内部合成数据参数 */}
                {datasetSource === 'synthetic' && (
                  <div className="flex items-start">
                    <FieldLabel text="" />
                    <div className={`${PANEL_WIDTH} shrink-0 rounded-[4px] border border-[#e5e6eb] bg-white p-4`}>
                      <div className="rounded-[2px] bg-[#f7f8fa] px-3 py-2 text-[12px] leading-5 text-[#86909c]">
                        提示：算法将根据以下参数随机生成请求内容，已为您填入最佳实践默认值。
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-4">
                        <ParamField label="平均输入长度" required value={avgInput} onChange={setAvgInput} unit="tokens" />
                        <ParamField label="平均输出长度" required value={avgOutput} onChange={setAvgOutput} unit="tokens" />
                        <ParamField label="数据集条数" required value={datasetCount} onChange={setDatasetCount} unit="条" />
                        <ParamField label="输入长度标准差" value={inputStd} onChange={setInputStd} />
                        <ParamField label="输出长度标准差" value={outputStd} onChange={setOutputStd} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 选择平台数据集 */}
                {datasetSource === 'dataset' && (
                  <div className="flex items-start">
                    <FieldLabel text="数据集" required />
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <DatasetSelect datasets={datasets} value={datasetId} onChange={pickDataset} />
                        {selectedDataset && (
                          <VersionSelect
                            dataset={selectedDataset}
                            value={datasetVersion}
                            onChange={setDatasetVersion}
                          />
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-[12px] leading-5 text-[#86909c]">
                          输入名称即可模糊检索平台数据集。需要新增或维护数据集，可前往
                          <button
                            type="button"
                            onClick={() => navigate('/算力加速平台/数据管理/数据集管理')}
                            className="mx-0.5 text-[#1890ff] hover:underline"
                          >
                            数据集管理
                          </button>
                          。
                        </p>
                        {__showFeat && <NewTag code="F-DATASET-SEARCH" compact />}
                        {__showFeat && <NewTag code="F-DATASET-VERSION" compact />}
                        {__showFeat && <NewTag code="F-DATASET-CLEAR" compact />}
                      </div>
                    </div>
                  </div>
                )}

                <RadioGroup
                  label="评估模式"
                  required
                  value={evalMode}
                  onChange={setEvalMode}
                  options={[
                    { value: 'single', label: '固定场景模式' },
                    { value: 'explore', label: '高级探索模式' },
                  ]}
                />

                {/* 参数配置 */}
                <div className="flex items-start">
                  <FieldLabel text="参数配置" />
                  <div className={`${PANEL_WIDTH} shrink-0`}>
                    <div className="grid grid-cols-3 gap-3">
                      {CONCURRENCY_MODES.map((mode) => {
                        const active = concurrencyMode === mode.key
                        return (
                          <button
                            key={mode.key}
                            type="button"
                            onClick={() => setConcurrencyMode(mode.key)}
                            className={`rounded-[4px] border px-3 py-2.5 text-left transition-colors ${
                              active
                                ? 'border-[#1890ff] bg-[#ecf6ff]'
                                : 'border-[#e5e6eb] bg-white hover:border-[#91caff]'
                            }`}
                          >
                            <span className="block text-center text-[13px] font-medium leading-5 text-[#1d2129]">{mode.title}</span>
                            <span className="mt-1 block text-[12px] leading-[18px] text-[#86909c]">{mode.desc}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-3 overflow-hidden rounded-[4px] border border-[#e5e6eb]">
                      <table className="w-full table-fixed border-collapse text-[13px]">
                        <colgroup>
                          <col className="w-[180px]" />
                          <col className="w-[180px]" />
                          <col />
                        </colgroup>
                        <thead>
                          <tr className="bg-[#f7f8fa] text-left text-[13px] text-[#4e5969]">
                            <th className="px-3 py-2 font-normal">参数</th>
                            <th className="px-3 py-2 font-normal">数值</th>
                            <th className="px-3 py-2 font-normal">描述</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PARAM_ROWS.map((row, index) => (
                            <tr key={row.key} className={index === 0 ? '' : 'border-t border-[#f2f3f5]'}>
                              <td className="px-3 py-2.5 align-top text-[#333]">
                                <span>{row.name}</span>
                                {row.required && <span className="ml-0.5 text-[#f53f3f]">*</span>}
                              </td>
                              <td className="px-3 py-2.5 align-top">
                                {row.key === 'endMode' ? (
                                  <select
                                    value={paramValues.endMode}
                                    onChange={(event) => setParam(row.key, event.target.value)}
                                    className="h-[30px] w-full rounded-[4px] border border-[#e5e6eb] bg-white px-2 text-[13px] text-[#1d2129] outline-none focus:border-[#1890ff]"
                                  >
                                    <option value="按请求总数">按请求总数</option>
                                    <option value="按评测时长">按评测时长</option>
                                  </select>
                                ) : (
                                  <div className="flex h-[30px] items-center rounded-[4px] border border-[#e5e6eb] bg-white px-2 transition-colors focus-within:border-[#1890ff]">
                                    <input
                                      value={paramValues[row.key]}
                                      onChange={(event) => setParam(row.key, event.target.value)}
                                      placeholder="请输入"
                                      className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#1d2129] outline-none placeholder:text-[#c9cdd4]"
                                    />
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2.5 align-top text-[12px] leading-[18px] text-[#86909c]">{row.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* 高级配置 */}
              <div className="mt-8">
                <SectionTitle
                  text="高级配置"
                  extra={<span className="ml-2 text-[12px] leading-5 text-[#86909c]">默认关闭，仅供高阶性能调优使用</span>}
                />
              </div>

              <div className="mt-4 ml-[112px] w-[760px] shrink-0 space-y-2.5">
                {ADVANCED_ITEMS.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-[4px] border border-[#e3e5e7] bg-[#f9fbfc] px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={advanced[item.key]}
                        onChange={(next) => setAdvanced((prev) => ({ ...prev, [item.key]: next }))}
                      />
                      <span className="text-[13px] font-medium leading-5 text-[#1d2129]">{item.title}</span>
                    </div>
                    <p className="mt-1 pl-10 text-[12px] leading-[18px] text-[#86909c]">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* 底部按钮 */}
              <div className="mt-12 ml-[112px] flex w-[560px] shrink-0 items-center justify-center gap-4">
                <ActionButton onClick={() => navigate(LIST_PATH)}>取消</ActionButton>
                <ActionButton
                  variant="primary"
                  disabled={!canSubmit}
                  onClick={() => {
                    if (!canSubmit) return
                    navigate(LIST_PATH)
                  }}
                >
                  创建
                </ActionButton>
              </div>
            </div>
          </main>
        </div>
      </div>
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}
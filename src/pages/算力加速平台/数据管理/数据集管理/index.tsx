/**
 * 算力加速平台-数据管理 - 数据集管理
 * 单入口: 顶栏 + 左导航 + 数据集列表（统计卡 / 筛选搜索 / 表格 / 分页 / 新建弹窗 / 详情抽屉）
 *
 * 当前为 Mock 版本：数据来自 ./mock.ts，结构待设计稿确认后按图还原。
 */
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  HardDrive,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { PlatformHeader, SideNav } from './_shared'
import {
  buildStats,
  FORMAT_OPTIONS,
  MOCK_DATASETS,
  SOURCE_OPTIONS,
  TYPE_OPTIONS,
} from './mock'
import type {
  Dataset,
  DatasetFormat,
  DatasetSource,
  DatasetStatus,
  DatasetType,
} from './mock'

const PAGE_SIZE = 6

const STATUS_STYLE: Record<DatasetStatus, string> = {
  就绪: 'bg-[#e8f7ee] text-[#1a9c53] border-[#bfe8cf]',
  解析中: 'bg-[#eef4ff] text-[#166eff] border-[#c7d9ff]',
  上传中: 'bg-[#fff6e6] text-[#c47f00] border-[#ffe0a6]',
  已归档: 'bg-[#f2f3f5] text-[#8c8c8c] border-[#e4e6eb]',
}

const TYPE_STYLE: Record<DatasetType, string> = {
  微调训练: 'bg-[#eef4ff] text-[#166eff]',
  模型评测: 'bg-[#f4edff] text-[#7a3ff2]',
  知识库: 'bg-[#e8f7ee] text-[#1a9c53]',
  多模态: 'bg-[#fff6e6] text-[#c47f00]',
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US')
}

function formatSize(sizeGB: number) {
  return sizeGB >= 1 ? `${sizeGB.toFixed(1)} GB` : `${Math.round(sizeGB * 1024)} MB`
}

/** 右侧详情 / 新建共用的小标题 */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 text-[13px]">
      <span className="w-[76px] shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words text-foreground">{children}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: DatasetStatus }) {
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-[4px] border px-2 text-[12px] leading-none ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  )
}

/** 通用下拉（原生 select，保持与页面其它控件一致的高度/边框） */
function Select({
  value,
  onChange,
  options,
  placeholder,
  widthClass = 'w-full',
}: {
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  placeholder: string
  /** 外层宽度类，不传时撑满父容器 */
  widthClass?: string
}) {
  return (
    <div className={`relative shrink-0 ${widthClass}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[34px] w-full appearance-none rounded-[4px] border border-border bg-card pl-3 pr-7 text-[13px] text-foreground outline-none focus:border-[#166eff]"
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronRight
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground"
      />
    </div>
  )
}

function StatCards({ stats }: { stats: ReturnType<typeof buildStats> }) {
  const icons: Record<string, ReactNode> = {
    total: <Database size={18} />,
    size: <HardDrive size={18} />,
    finetune: <Upload size={18} />,
    ready: <Eye size={18} />,
  }
  return (
    <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="flex items-center justify-between rounded-[8px] border border-border bg-card px-4 py-3"
        >
          <div>
            <div className="text-[12px] text-muted-foreground">{stat.label}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[22px] font-semibold leading-none text-foreground">{stat.value}</span>
              <span className="text-[12px] text-muted-foreground">{stat.suffix}</span>
            </div>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#166eff]/10 text-[#166eff]">
            {icons[stat.key]}
          </span>
        </div>
      ))}
    </div>
  )
}

/** 新建数据集弹窗 */
function CreateDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (dataset: Dataset) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<DatasetType>('微调训练')
  const [format, setFormat] = useState<DatasetFormat>('JSONL')
  const [source, setSource] = useState<DatasetSource>('本地文件')
  const [description, setDescription] = useState('')

  const canSubmit = name.trim().length > 0

  function handleSubmit() {
    if (!canSubmit) return
    const now = new Date()
    const stamp = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')} ${`${now.getHours()}`.padStart(2, '0')}:${`${now.getMinutes()}`.padStart(2, '0')}`
    onCreate({
      id: `ds-${Date.now()}`,
      name: name.trim(),
      type,
      format,
      samples: 0,
      sizeGB: 0,
      status: '解析中',
      updatedAt: stamp,
      creator: 'admin',
      description: description.trim() || '—',
      source,
      location: '待上传',
      fields: [],
      versions: [{ version: 'v1', note: '初始导入，等待解析', samples: 0, createdAt: stamp }],
      usedBy: [],
    })
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/35" onClick={onClose}>
      <div
        className="w-[520px] max-w-[92vw] overflow-hidden rounded-[8px] border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.16)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[52px] items-center justify-between border-b border-border px-5">
          <h2 className="text-[15px] font-semibold text-foreground">新建数据集</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-[13px] text-foreground">
              数据集名称 <span className="text-[#e5484d]">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入数据集名称，如 qwen3-35b-指令微调集"
              className="h-[34px] w-full rounded-[4px] border border-border bg-card px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-[#166eff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] text-foreground">数据集类型</label>
              <Select
                value={type}
                onChange={(v) => setType(v as DatasetType)}
                options={TYPE_OPTIONS}
                placeholder="请选择类型"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] text-foreground">数据格式</label>
              <Select
                value={format}
                onChange={(v) => setFormat(v as DatasetFormat)}
                options={FORMAT_OPTIONS}
                placeholder="请选择格式"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] text-foreground">数据来源</label>
            <div className="flex gap-2">
              {SOURCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSource(opt)}
                  className={`h-[32px] rounded-[4px] border px-3 text-[13px] ${
                    source === opt
                      ? 'border-[#166eff] bg-[#eef4ff] text-[#166eff]'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] text-foreground">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="说明数据用途、来源与标注方式"
              className="w-full resize-none rounded-[4px] border border-border bg-card px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-[#166eff]"
            />
          </div>

          <div className="rounded-[4px] border border-dashed border-border bg-muted/50 px-3 py-4 text-center">
            <Upload size={18} className="mx-auto text-muted-foreground" />
            <p className="mt-1 text-[12px] text-muted-foreground">
              拖拽文件到此处，或 <span className="text-[#166eff]">点击上传</span>（Mock 仅演示，不实际传输）
            </p>
          </div>
        </div>

        <div className="flex h-[56px] items-center justify-end gap-2 border-t border-border px-5">
          <button
            onClick={onClose}
            className="h-[32px] rounded-[4px] border border-border px-4 text-[13px] text-foreground hover:bg-muted"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-[32px] rounded-[4px] bg-[#166eff] px-4 text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            创建数据集
          </button>
        </div>
      </div>
    </div>
  )
}

/** 数据集详情抽屉 */
function DetailDrawer({ dataset, onClose }: { dataset: Dataset; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/30" onClick={onClose}>
      <aside
        className="absolute right-0 top-0 flex h-full w-[440px] max-w-[94vw] flex-col border-l border-border bg-card shadow-[-8px_0_24px_rgba(0,0,0,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-5">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold text-foreground">{dataset.name}</div>
            <div className="truncate font-mono text-[11px] text-muted-foreground">{dataset.id}</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-2">
            <span className={`rounded-[4px] px-2 py-[3px] text-[12px] ${TYPE_STYLE[dataset.type]}`}>
              {dataset.type}
            </span>
            <StatusBadge status={dataset.status} />
            <span className="text-[12px] text-muted-foreground">{dataset.format}</span>
          </div>
          <p className="mt-3 text-[13px] leading-6 text-foreground">{dataset.description}</p>

          <h3 className="mt-5 border-b border-border pb-2 text-[13px] font-semibold text-foreground">
            基础信息
          </h3>
          <div className="divide-y divide-border/60">
            <Field label="样本量">{formatNumber(dataset.samples)} 条</Field>
            <Field label="占用存储">{formatSize(dataset.sizeGB)}</Field>
            <Field label="数据来源">{dataset.source}</Field>
            <Field label="存储路径">
              <span className="font-mono text-[12px]">{dataset.location}</span>
            </Field>
            <Field label="创建人">{dataset.creator}</Field>
            <Field label="更新时间">{dataset.updatedAt}</Field>
            <Field label="字段">
              {dataset.fields.length > 0 ? (
                <span className="flex flex-wrap gap-1">
                  {dataset.fields.map((field) => (
                    <span
                      key={field}
                      className="rounded-[3px] bg-muted px-1.5 py-[2px] font-mono text-[11px] text-foreground"
                    >
                      {field}
                    </span>
                  ))}
                </span>
              ) : (
                '解析后生成'
              )}
            </Field>
          </div>

          <h3 className="mt-5 border-b border-border pb-2 text-[13px] font-semibold text-foreground">
            版本记录
          </h3>
          <ul className="mt-1">
            {dataset.versions.map((version, index) => (
              <li key={version.version} className="flex gap-3 py-2">
                <span
                  className={`mt-[5px] h-2 w-2 shrink-0 rounded-full ${
                    index === 0 ? 'bg-[#166eff]' : 'bg-[#d9d9d9]'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="font-medium text-foreground">{version.version}</span>
                    {index === 0 && (
                      <span className="rounded-[3px] bg-[#eef4ff] px-1.5 text-[11px] text-[#166eff]">
                        当前
                      </span>
                    )}
                    <span className="ml-auto text-[12px] text-muted-foreground">
                      {formatNumber(version.samples)} 条
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{version.note}</p>
                  <p className="text-[11px] text-muted-foreground/80">{version.createdAt}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="mt-5 border-b border-border pb-2 text-[13px] font-semibold text-foreground">
            引用关系
          </h3>
          {dataset.usedBy.length > 0 ? (
            <ul className="mt-1 space-y-1.5">
              {dataset.usedBy.map((item) => (
                <li
                  key={item}
                  className="rounded-[4px] border border-border bg-muted/40 px-2.5 py-1.5 text-[12px] text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12px] text-muted-foreground">暂未被服务或评测任务引用</p>
          )}
        </div>
      </aside>
    </div>
  )
}

export default function DatasetPage() {
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS)
  const [tab, setTab] = useState<'全部' | DatasetType>('全部')
  const [keyword, setKeyword] = useState('')
  const [format, setFormat] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const stats = useMemo(() => buildStats(datasets), [datasets])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return datasets.filter((dataset) => {
      if (tab !== '全部' && dataset.type !== tab) return false
      if (format && dataset.format !== format) return false
      if (status && dataset.status !== status) return false
      if (!kw) return true
      return [dataset.name, dataset.id, dataset.description, dataset.creator]
        .join(' ')
        .toLowerCase()
        .includes(kw)
    })
  }, [datasets, tab, keyword, format, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const active = datasets.find((dataset) => dataset.id === activeId) ?? null

  const tabs: Array<'全部' | DatasetType> = ['全部', ...TYPE_OPTIONS]

  function countOf(key: '全部' | DatasetType) {
    return key === '全部' ? datasets.length : datasets.filter((d) => d.type === key).length
  }

  function resetPage() {
    setPage(1)
  }

  function handleCreate(dataset: Dataset) {
    setDatasets((prev) => [dataset, ...prev])
    setCreateOpen(false)
    setTab('全部')
    setKeyword('')
    setPage(1)
    setActiveId(dataset.id)
  }

  function handleDelete(dataset: Dataset) {
    setDatasets((prev) => prev.filter((d) => d.id !== dataset.id))
    if (activeId === dataset.id) setActiveId(null)
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f0f2f5] text-[#1f2329] [font-family:'PingFang_SC','Helvetica_Neue',Arial,sans-serif]">
      <PlatformHeader />
      <div className="flex min-h-0 flex-1">
        <SideNav activeKey="数据集管理" />

        <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden px-6 pb-4 pt-4">
          {/* 页面标题 */}
          <div className="flex shrink-0 items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-bold leading-[30px] text-[#000]">数据集管理</h1>
              <p className="text-[13px] text-[#6c6c6c]">
                管理用于微调训练、模型评测与知识库的数据集，查看样本量、存储占用与版本记录。
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                className="flex h-[34px] items-center gap-1.5 rounded-[4px] border border-border bg-card px-3 text-[13px] text-foreground hover:bg-muted"
                onClick={() => setCreateOpen(true)}
              >
                <Upload size={15} />
                导入数据
              </button>
              <button
                className="flex h-[34px] items-center gap-1.5 rounded-[4px] bg-[#166eff] px-3.5 text-[13px] text-white"
                onClick={() => setCreateOpen(true)}
              >
                <Plus size={15} />
                新建数据集
              </button>
            </div>
          </div>

          <StatCards stats={stats} />

          {/* 列表卡 */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-border bg-card">
            {/* Tab + 筛选 */}
            <div className="shrink-0 border-b border-border">
              <div className="flex items-center gap-1 px-4 pt-1">
                {tabs.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setTab(item)
                      resetPage()
                    }}
                    className={`relative h-[42px] px-3 text-[13px] ${
                      tab === item ? 'font-medium text-[#166eff]' : 'text-[#4e5969] hover:text-foreground'
                    }`}
                  >
                    {item}
                    <span className="ml-1 text-[12px] text-muted-foreground">{countOf(item)}</span>
                    {tab === item && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#166eff]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-1">
                <div className="relative w-[260px]">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value)
                      resetPage()
                    }}
                    placeholder="搜索数据集名称、ID 或创建人"
                    className="h-[34px] w-full rounded-[4px] border border-border bg-card pl-8 pr-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-[#166eff]"
                  />
                </div>
                <Select
                  value={format}
                  onChange={(v) => {
                    setFormat(v)
                    resetPage()
                  }}
                  options={FORMAT_OPTIONS}
                  placeholder="全部格式"
                  widthClass="w-[124px]"
                />
                <Select
                  value={status}
                  onChange={(v) => {
                    setStatus(v)
                    resetPage()
                  }}
                  options={['就绪', '解析中', '上传中', '已归档']}
                  placeholder="全部状态"
                  widthClass="w-[124px]"
                />
                {(keyword || format || status || tab !== '全部') && (
                  <button
                    className="h-[34px] px-2 text-[13px] text-[#166eff] hover:underline"
                    onClick={() => {
                      setKeyword('')
                      setFormat('')
                      setStatus('')
                      setTab('全部')
                      resetPage()
                    }}
                  >
                    重置
                  </button>
                )}
                <span className="ml-auto text-[12px] text-muted-foreground">
                  共 {filtered.length} 个数据集
                </span>
              </div>
            </div>

            {/* 表格 */}
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[980px] border-collapse text-[13px]">
                <thead className="sticky top-0 z-10 bg-[#fafafa] text-left text-[12px] text-[#6c6c6c]">
                  <tr>
                    <th className="w-[300px] px-4 py-2.5 font-normal">数据集</th>
                    <th className="px-3 py-2.5 font-normal">类型</th>
                    <th className="px-3 py-2.5 font-normal">格式</th>
                    <th className="px-3 py-2.5 text-right font-normal">样本量</th>
                    <th className="px-3 py-2.5 text-right font-normal">存储</th>
                    <th className="px-3 py-2.5 font-normal">状态</th>
                    <th className="px-3 py-2.5 font-normal">更新时间</th>
                    <th className="px-3 py-2.5 font-normal">创建人</th>
                    <th className="w-[132px] px-4 py-2.5 text-right font-normal">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((dataset) => (
                    <tr key={dataset.id} className="border-t border-border/70 hover:bg-[#fafcff]">
                      <td className="px-4 py-3">
                        <button
                          className="block max-w-full truncate text-left font-medium text-foreground hover:text-[#166eff]"
                          onClick={() => setActiveId(dataset.id)}
                          title={dataset.name}
                        >
                          {dataset.name}
                        </button>
                        <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                          {dataset.id}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-[4px] px-2 py-[3px] text-[12px] ${TYPE_STYLE[dataset.type]}`}>
                          {dataset.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-foreground">{dataset.format}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-foreground">
                        {formatNumber(dataset.samples)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-foreground">
                        {formatSize(dataset.sizeGB)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={dataset.status} />
                      </td>
                      <td className="px-3 py-3 text-[12px] text-muted-foreground">{dataset.updatedAt}</td>
                      <td className="px-3 py-3 text-foreground">{dataset.creator}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="flex h-7 items-center gap-1 whitespace-nowrap rounded px-2 text-[12px] text-[#166eff] hover:bg-[#eef4ff]"
                            onClick={() => setActiveId(dataset.id)}
                          >
                            <Eye size={13} />
                            查看
                          </button>
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-[#e5484d]"
                            onClick={() => handleDelete(dataset)}
                            aria-label={`删除 ${dataset.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center text-[13px] text-muted-foreground">
                        没有匹配的数据集，调整筛选条件或新建一个
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="flex h-[52px] shrink-0 items-center justify-between border-t border-border px-4">
              <span className="text-[12px] text-muted-foreground">
                第 {currentPage} / {totalPages} 页，共 {filtered.length} 条
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded border border-border text-foreground disabled:opacity-40"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="上一页"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`h-7 min-w-7 rounded border px-2 text-[12px] ${
                        pageNumber === currentPage
                          ? 'border-[#166eff] text-[#166eff]'
                          : 'border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                <button
                  className="flex h-7 w-7 items-center justify-center rounded border border-border text-foreground disabled:opacity-40"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="下一页"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {createOpen && <CreateDialog onClose={() => setCreateOpen(false)} onCreate={handleCreate} />}
      {active && <DetailDrawer dataset={active} onClose={() => setActiveId(null)} />}
    </div>
  )
}

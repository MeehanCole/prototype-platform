/**
 * 算力加速平台-弹性扩缩容 - 推理服务 / 推理实例 (按图 1:1 还原)
 * 单入口: 顶栏 + 左导航 + 推理实例列表 (内部/外部推理服务 Tab + 卡片网格 + 分页)
 */
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Info, Pencil, Play, Plus, Search, Settings, Square, Trash2, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AppShell, StatusBadge } from './_shared'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'
import { CreateInferenceService } from './CreateInferenceService'
import { ServiceDetail } from './ServiceDetail'
import type { DetailService } from './ServiceDetail'
import { cn } from '@/lib/utils'

type Status = 'off' | 'running'
type TabKey = 'internal' | 'external'

/** 弹性配置（详情页展示用） */
export interface ElasticDetail {
  mode: '常规模式' | 'Serverless 模式' | '指标模式'
  /** 指标模式: 指标来源 */
  source?: '内置指标' | '自定义 PromQL'
  /** 指标模式(内置): 条件列表 + 连接关系 */
  conditions?: { text: string }[]
  join?: 'and' | 'or'
  agg?: string
  /** 指标模式(自定义): 表达式 */
  expr?: string
  /** 常规模式: 固定副本数 */
  replicas?: string
  /** 自动扩缩模式: 副本下限/上限 */
  minReplicas?: string
  maxReplicas?: string
  /** Serverless 参数 */
  targetRequests?: string
  maxRequests?: string
  /** 窗口 */
  shrinkWindow?: string
}

interface InferenceService {
  id: string
  name: string
  status: Status
  servingId: string
  replicas: string
  model: string
  modelBranch: string
  framework: string
  pool: string
  deployMode: string
  tensorParallel: string
  elasticMode: string
  modelReplicas: string
  spec: string
  network: string
  priority: string
  creator: string
}

const SERVICES: InferenceService[] = [
  {
    id: 'svc-1',
    name: 'test',
    status: 'off',
    servingId: 'serving-vlwth97k',
    replicas: '0/0',
    model: '官方 Qwen3.5-35B-A3B',
    modelBranch: '-',
    framework: 'vLLM',
    pool: 'nv-h100-gpu（nv-zhanghu-ces...',
    deployMode: '简易模式',
    tensorParallel: 'TP 1',
    elasticMode: '常规模式',
    modelReplicas: '1',
    spec: 'Nvidia H100.vGPU（1631M）*1,CPU 4核...',
    network: '无',
    priority: '低',
    creator: 'admin',
  },
  {
    id: 'svc-2',
    name: 'moe模型hang验证',
    status: 'off',
    servingId: 'serving-v67lcvg',
    replicas: '0/0',
    model: '官方 Qwen3.5-35B-A3B',
    modelBranch: '-',
    framework: 'vLLM',
    pool: 'nv-h100-gpu（nv-zhanghu-ces...',
    deployMode: '分布式并行',
    tensorParallel: 'TP 2',
    elasticMode: '常规模式',
    modelReplicas: '1',
    spec: 'Nvidia H100（81559Mi）*2,CPU...',
    network: '无',
    priority: '低',
    creator: 'admin',
  },
  {
    id: 'svc-3',
    name: 'vllm验证',
    status: 'off',
    servingId: 'serving-dchfknwt',
    replicas: '0/0',
    model: '官方 Qwen2.5-0.5B',
    modelBranch: '-',
    framework: 'vLLM',
    pool: 'nv-h100-gpu（nv-zhanghu-ces...',
    deployMode: '简易模式',
    tensorParallel: 'TP 1',
    elasticMode: 'Serverless 模式',
    modelReplicas: '1–5',
    spec: 'Nvidia H100.vGPU（65247M）*1,...',
    network: '无',
    priority: '低',
    creator: 'admin',
  },
  {
    id: 'svc-4',
    name: 'kt服务',
    status: 'running',
    servingId: 'serving-ccfr9r2s',
    replicas: '1/1',
    model: '官方 Qwen3.5-35B-A3B',
    modelBranch: '-',
    framework: 'KTransformer',
    pool: 'nv-h100-gpu（nv-zhanghu-ces...',
    deployMode: '简易模式',
    tensorParallel: 'TP 1',
    elasticMode: '常规模式',
    modelReplicas: '1',
    spec: 'Nvidia H100.vGPU（1631M）*1,...',
    network: '无',
    priority: '低',
    creator: 'admin',
  },
  {
    id: 'svc-5',
    name: 'qwen3-指标弹性',
    status: 'running',
    servingId: 'serving-kx7m2dq',
    replicas: '3/3',
    model: '官方 Qwen3.5-35B-A3B',
    modelBranch: '-',
    framework: 'vLLM',
    pool: 'nv-h100-gpu（nv-zhanghu-ceshi）',
    deployMode: '简易模式',
    tensorParallel: 'TP 1',
    elasticMode: '指标模式',
    modelReplicas: '1–4',
    spec: 'Nvidia H100（81559Mi）*1,CPU 32核...',
    network: '无',
    priority: '低',
    creator: 'admin',
  },
  {
    id: 'svc-6',
    name: 'deepseek-自定义弹性',
    status: 'running',
    servingId: 'serving-mn4pt8zv',
    replicas: '2/2',
    model: '官方 DeepSeek-V2-Lite',
    modelBranch: '-',
    framework: 'vLLM',
    pool: 'nv-h100-gpu（nv-zhanghu-ceshi）',
    deployMode: '分布式并行',
    tensorParallel: 'TP 2',
    elasticMode: '指标模式',
    modelReplicas: '1–6',
    spec: 'Nvidia H100（81559Mi）*2,CPU 64核...',
    network: '无',
    priority: '低',
    creator: 'admin',
  },
]

/** 模型值: 官方模型带浅蓝标签 */
function ModelValue({ value }: { value: string }) {
  const isOfficial = value.startsWith('官方')
  const name = isOfficial ? value.replace(/^官方\s*/, '') : value
  return (
    <span className="flex min-w-0 items-center gap-1">
      {isOfficial && (
        <span className="shrink-0 rounded-[2px] border border-[#b9d4ff] bg-[#eef4ff] px-1 text-[11px] leading-4 text-[#1668ff]">
          官方
        </span>
      )}
      <span className="truncate">{name}</span>
    </span>
  )
}

/** 优先级标签 */
function PriorityTag({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-[2px] bg-[#f2f3f5] px-1.5 text-[11px] leading-5 text-[#4e5969]">
      {value}
    </span>
  )
}

interface Field {
  label: string
  value: ReactNode
  info?: boolean
}

function fieldsOf(s: InferenceService): Field[] {
  return [
    { label: '服务ID', value: s.servingId },
    {
      label: '容器副本',
      value: (
        <>
          {s.replicas}
          <span className="text-[#8f959e]"> 运行中</span>
        </>
      ),
    },
    { label: '模型', value: <ModelValue value={s.model} /> },
    { label: '模型分支', value: s.modelBranch },
    { label: '推理框架', value: s.framework },
    { label: '资源池', value: s.pool },
    { label: '部署模式', value: s.deployMode, info: true },
    { label: '模型并行', value: s.tensorParallel },
    { label: '弹性模式', value: s.elasticMode, info: true },
    { label: '模型副本', value: s.modelReplicas },
    { label: '规格', value: s.spec },
    { label: '高速网络', value: s.network },
    { label: '优先级', value: <PriorityTag value={s.priority} /> },
    { label: '创建人', value: s.creator },
  ]
}

/** 各服务的弹性配置（详情页展示） */
const ELASTIC_OF: Record<string, ElasticDetail> = {
  'svc-1': { mode: '常规模式', replicas: '1' },
  'svc-2': { mode: '常规模式', replicas: '1' },
  'svc-3': {
    mode: 'Serverless 模式',
    minReplicas: '1',
    maxReplicas: '5',
    shrinkWindow: '600 秒',
    targetRequests: '10.0',
    maxRequests: '20.0',
  },
  'svc-4': { mode: '常规模式', replicas: '1' },
  'svc-5': {
    mode: '指标模式',
    source: '内置指标',
    conditions: [{ text: 'GPU 利用率 ≥ 80 %' }, { text: '显存使用率 ≥ 85 %' }],
    join: 'and',
    agg: '平均值',
    minReplicas: '1',
    maxReplicas: '4',
    shrinkWindow: '600 秒',
  },
  'svc-6': {
    mode: '指标模式',
    source: '自定义 PromQL',
    expr:
      'avg(gpu.memory.used{namespace="$namespace"}) / avg(gpu.memory.total{namespace="$namespace"}) > 0.85',
    minReplicas: '1',
    maxReplicas: '6',
    shrinkWindow: '300 秒',
  },
}

/** 列表数据 -> 详情页数据 */
function toDetail(svc: InferenceService, elasticOverride?: ElasticDetail): DetailService {
  const isVgpu = svc.spec.includes('vGPU')
  const isDual = svc.spec.includes('*2')
  return {
    id: svc.id,
    name: svc.name,
    status: svc.status,
    servingId: svc.servingId,
    framework: svc.framework,
    deployMode: svc.deployMode,
    tensorParallel: svc.deployMode === '分布式并行' ? '2' : '1',
    elasticMode: '常规模式',
    modelReplicas: svc.modelReplicas,
    priority: svc.priority,
    creator: svc.creator,
    createdAt: svc.id === 'svc-1' ? '2026-10-22 17:50:58' : '2026-10-20 10:12:31',
    pool: 'nv-h100-gpu (nv-zhanghu-ceshi)',
    network: svc.network,
    modelName: svc.model.replace(/^官方\s*/, ''),
    modelBranch: svc.modelBranch,
    modelVersion: 'v2',
    elastic: elasticOverride ?? ELASTIC_OF[svc.id] ?? { mode: '常规模式', replicas: svc.modelReplicas },
    spec: {
      model: '英伟达 H100',
      virt: isVgpu ? 'vGPU' : '整卡',
      cards: isDual ? '2 卡' : '1 卡',
      ratio: isVgpu ? '20%' : '100%',
      memory: isVgpu ? '16311Mi' : '81559Mi',
      arch: 'amd64',
      cpu: isDual ? '32 核' : '5 核',
      ram: isDual ? '200 Gi' : '200 Gi',
      disk: '30 Gi',
      oversub: isVgpu ? '开启虚拟显存' : '未开启',
      net: svc.network,
    },
  }
}

/** 单张服务卡片 */
function ServiceCard({
  svc,
  onOpen,
  onEdit,
  onToggle,
  onDelete,
}: {
  svc: InferenceService
  onOpen: () => void
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const running = svc.status === 'running'
  return (
    <div
      onClick={onOpen}
      className="flex flex-col rounded-[2px] border border-[#e5e6eb] bg-white cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-[#1668ff] transition-shadow"
    >
      {/* 卡片头 */}
      <div className="h-9 px-3 flex items-center gap-2 border-b border-[#f0f1f3]">
        <span className="text-[13px] font-medium text-[#1f2329] truncate">{svc.name}</span>
        <span className="ml-auto">
          <StatusBadge status={svc.status} />
        </span>
      </div>

      {/* 字段区: 2 列 × 7 行 */}
      <div className="px-3 py-2 grid grid-cols-2 gap-x-2 gap-y-[5px]">
        {fieldsOf(svc).map((f) => (
          <div
            key={f.label}
            className={cn(
              'relative min-w-0 flex items-start gap-1',
              f.label === '弹性模式' && 'pr-4',
            )}
          >
            <span className="text-[12px] text-[#8f959e] whitespace-nowrap shrink-0">
              {f.label}:
            </span>
            {f.label === '弹性模式' && (
              <span className="absolute right-0 top-[3px]">
                <NewTag code="F-CARD" compact />
              </span>
            )}
            {f.info && <Info size={11} className="mt-[3px] shrink-0 text-[#8f959e]" />}
            <span className="text-[12px] text-[#1f2329] truncate">{f.value}</span>
          </div>
        ))}
      </div>

      {/* 卡片底栏 */}
      <div
        className="mt-auto h-8 px-3 flex items-center border-t border-[#f0f1f3]"
        onClick={(e) => e.stopPropagation()}
      >
        {svc.framework !== 'KTransformer' && (
          <button className="text-[12px] text-[#1668ff] hover:underline">Ray 控制台</button>
        )}
        <div className="ml-auto flex items-center gap-3 text-[12px] text-[#646a73]">
          {running ? (
            <button onClick={onToggle} className="flex items-center gap-1 hover:text-[#1668ff]">
              <Square size={11} />
              停止
            </button>
          ) : (
            <button onClick={onToggle} className="flex items-center gap-1 hover:text-[#1668ff]">
              <Play size={11} />
              启动
            </button>
          )}
          <button onClick={onEdit} className="flex items-center gap-1 hover:text-[#1668ff]">
            <Pencil size={11} />
            编辑
          </button>
          <button onClick={onDelete} className="flex items-center gap-1 hover:text-[#f53f3f]">
            <Trash2 size={11} />
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

/** 删除确认弹窗 */
function DeleteDialog({
  svc,
  onCancel,
  onConfirm,
}: {
  svc: InferenceService
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.45)]">
      <div className="w-[600px] rounded-[4px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
        <div className="flex h-12 items-center justify-between px-6">
          <h3 className="text-[16px] font-medium text-[#1f2329]">删除</h3>
          <button onClick={onCancel} className="text-[#8f959e] hover:text-[#1f2329]">
            <X size={16} />
          </button>
        </div>
        <div className="border-t border-[#e5e6eb]" />

        <div className="flex items-start gap-3 px-6 py-7">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fa8c16] text-[12px] font-bold leading-none text-white">
            !
          </span>
          <p className="text-[14px] leading-6 text-[#1f2329]">
            是否确定删除内部推理服务 <span className="text-[#1668ff]">{svc.name}({svc.servingId})</span>？
          </p>
        </div>

        <div className="border-t border-[#e5e6eb]" />
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            onClick={onCancel}
            className="h-8 rounded-[2px] border border-[#d9dce3] bg-white px-5 text-[12px] text-[#1f2329] hover:border-[#1668ff] hover:text-[#1668ff]"
          >
            取 消
          </button>
          <button
            onClick={onConfirm}
            className="h-8 rounded-[2px] bg-[#1668ff] px-5 text-[12px] text-white hover:bg-[#3c7eff]"
          >
            确 定
          </button>
        </div>
      </div>
    </div>
  )
}

/** 分页条 */
function Pagination({ total }: { total: number }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-[#646a73]">
      <span>共 {total} 条</span>
      <select className="h-7 rounded-[2px] border border-[#d9dce3] bg-white px-1.5 text-[12px] text-[#1f2329] outline-none">
        <option>10条/页</option>
        <option>20条/页</option>
        <option>50条/页</option>
      </select>
      <div className="flex items-center">
        <button className="h-7 w-7 border border-[#d9dce3] rounded-l-[2px] text-[#8f959e] hover:text-[#1668ff]">
          ‹
        </button>
        <button className="h-7 w-7 border-y border-r border-[#1668ff] bg-[#1668ff] text-white">1</button>
        <button className="h-7 w-7 border-y border-r border-[#d9dce3] text-[#8f959e] hover:text-[#1668ff]">
          ›
        </button>
      </div>
      <span>前往</span>
      <input
        defaultValue="1"
        className="h-7 w-9 rounded-[2px] border border-[#d9dce3] text-center text-[12px] text-[#1f2329] outline-none"
      />
      <span>页</span>
    </div>
  )
}

export default function InferenceServicePage({ __showFeat = false }: { __showFeat?: boolean }) {
  const [docCode, setDocCode] = useState<string | null>(null)
  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <PageBody />
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

function PageBody() {
  const [searchParams] = useSearchParams()
  const initialView = searchParams.get('view')
  const [view, setView] = useState<'list' | 'create' | 'detail' | 'edit'>(
    initialView === 'create' ? 'create' : initialView === 'detail' ? 'detail' : initialView === 'edit' ? 'edit' : 'list',
  )
  const [services, setServices] = useState<InferenceService[]>(SERVICES)
  const [elastics, setElastics] = useState<Record<string, ElasticDetail>>(ELASTIC_OF)
  const [selectedId, setSelectedId] = useState(searchParams.get('id') ?? SERVICES[0].id)
  const [tab, setTab] = useState<TabKey>('internal')
  const [keyword, setKeyword] = useState('')
  const [editFrom, setEditFrom] = useState<'list' | 'detail'>('list')
  const [deleteTarget, setDeleteTarget] = useState<InferenceService | null>(null)

  const list = useMemo(() => {
    if (tab === 'external') return []
    const kw = keyword.trim().toLowerCase()
    return kw ? services.filter((s) => s.name.toLowerCase().includes(kw)) : services
  }, [tab, keyword, services])

  if (view === 'detail') {
    const selected = services.find((s) => s.id === selectedId) ?? services[0]
    if (!selected) return <AppShell>{null}</AppShell>
    return (
      <AppShell>
        <ServiceDetail
          svc={toDetail(selected, elastics[selected.id])}
          onBack={() => setView('list')}
          onEdit={() => {
            setEditFrom('detail')
            setView('edit')
          }}
          initialTab={
            { monitor: '资源监控', containers: '容器组', logs: '日志' }[
              searchParams.get('tab') ?? ''
            ]
          }
        />
      </AppShell>
    )
  }

  if (view === 'create') {
    return (
      <AppShell>
        <CreateInferenceService
          onBack={() => setView('list')}
          onSubmit={(p) => {
            const id = `svc-${Date.now()}`
            const min = p.elastic.minReplicas ?? p.elastic.replicas ?? '1'
            setServices((prev) => [
              ...prev,
              {
                id,
                name: p.name,
                status: 'running',
                servingId: `serving-${Math.random().toString(36).slice(2, 9)}`,
                replicas: `${min}/${min}`,
                model: p.model,
                modelBranch: '-',
                framework: p.framework,
                pool: p.pool,
                deployMode: p.deployMode,
                tensorParallel: p.deployMode === '分布式并行' ? 'TP 2' : 'TP 1',
                elasticMode: p.elasticMode,
                modelReplicas: p.modelReplicas,
                spec: p.spec,
                network: '无',
                priority: p.priority,
                creator: 'admin',
              },
            ])
            setElastics((prev) => ({ ...prev, [id]: p.elastic }))
            setView('list')
          }}
        />
      </AppShell>
    )
  }

  if (view === 'edit') {
    const target = services.find((s) => s.id === selectedId) ?? services[0]
    if (!target) return <AppShell>{null}</AppShell>
    return (
      <AppShell>
        <CreateInferenceService
          mode="edit"
          initial={{ service: target, elastic: elastics[target.id] }}
          onBack={() => setView(editFrom)}
          onSubmit={(p) => {
            setServices((prev) =>
              prev.map((s) =>
                s.id === target.id
                  ? {
                      ...s,
                      name: p.name,
                      model: p.model,
                      framework: p.framework,
                      pool: p.pool,
                      deployMode: p.deployMode,
                      tensorParallel: p.deployMode === '分布式并行' ? 'TP 2' : 'TP 1',
                      priority: p.priority,
                      elasticMode: p.elasticMode,
                      modelReplicas: p.modelReplicas,
                      spec: p.spec,
                    }
                  : s,
              ),
            )
            setElastics((prev) => ({ ...prev, [target.id]: p.elastic }))
            setView(editFrom)
          }}
        />
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* 标题区 */}
      <div className="shrink-0 px-4 pt-3">
        <h1 className="text-[16px] font-medium text-[#1f2329] leading-6">推理实例</h1>
        <p className="mt-1 text-[12px] text-[#8f959e]">
          支持从模型广场部署官方内置模型和用户上传模型，并支持远程拉取开源社区模型部署。
        </p>
      </div>

      {/* 内容面板 */}
      <div className="flex-1 min-h-0 mx-4 mt-3 mb-4 flex flex-col rounded-[2px] border border-[#e5e6eb] bg-white overflow-hidden">
        {/* Tab 条 */}
        <div className="shrink-0 h-9 flex items-stretch bg-[#f4f4f5] border-b border-[#e5e6eb]">
          {([
            { key: 'internal', label: '内部推理服务' },
            { key: 'external', label: '外部推理服务' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 text-[13px] transition-colors',
                tab === t.key
                  ? 'bg-[#1668ff] text-white'
                  : 'text-[#1f2329] hover:text-[#1668ff]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 工具栏 */}
        <div className="shrink-0 px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => setView('create')}
          className="h-7 px-2.5 rounded-[2px] bg-[#1668ff] text-white text-[12px] flex items-center gap-1 hover:bg-[#3c7eff]"
        >
          <Plus size={14} />
          创建
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center h-8 rounded-[2px] border border-[#d9dce3] bg-white overflow-hidden">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入名称搜索"
              className="w-[168px] px-2.5 text-[12px] text-[#1f2329] outline-none placeholder:text-[#8f959e]"
            />
            <button className="h-full px-2.5 border-l border-[#d9dce3] text-[#646a73] hover:text-[#1668ff]">
              <Search size={14} />
            </button>
          </div>
          <button className="h-8 w-8 rounded-[2px] border border-[#d9dce3] flex items-center justify-center text-[#646a73] hover:text-[#1668ff] hover:border-[#1668ff]">
            <Settings size={14} />
          </button>
        </div>
      </div>

        {/* 卡片网格 */}
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2">
        {list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {list.map((svc) => (
              <ServiceCard
                key={svc.id}
                svc={svc}
                onOpen={() => {
                  setSelectedId(svc.id)
                  setView('detail')
                }}
                onEdit={() => {
                  setSelectedId(svc.id)
                  setEditFrom('list')
                  setView('edit')
                }}
                onToggle={() =>
                  setServices((prev) =>
                    prev.map((it) => {
                      if (it.id !== svc.id) return it
                      if (it.status === 'running') return { ...it, status: 'off', replicas: '0/0' }
                      const min = elastics[it.id]?.minReplicas ?? elastics[it.id]?.replicas ?? '1'
                      return { ...it, status: 'running', replicas: `${min}/${min}` }
                    }),
                  )
                }
                onDelete={() => setDeleteTarget(svc)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[12px] text-[#8f959e]">暂无数据</div>
        )}
        </div>

        {/* 分页 */}
        <div className="shrink-0 h-12 px-4 border-t border-[#f0f1f3] flex items-center justify-end">
          <Pagination total={list.length} />
        </div>

        {deleteTarget && (
          <DeleteDialog
            svc={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => {
              const id = deleteTarget.id
              setServices((prev) => prev.filter((it) => it.id !== id))
              setElastics((prev) => {
                const next = { ...prev }
                delete next[id]
                return next
              })
              setDeleteTarget(null)
            }}
          />
        )}
      </div>
    </AppShell>
  )
}

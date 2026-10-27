/**
 * 创建内部推理服务 (按图 1:1 还原)
 * 子视图: 由推理服务列表页的「创建」按钮进入，返回箭头/取消回到列表
 */
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowUp, Check, ChevronDown, ChevronUp, CircleX, Info, Minus, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InfoDot } from './_shared'
import { NewTag } from './feature-tags'

const LABEL_W = 'w-[88px]'
const FIELD_W = 'w-[304px]'
const INPUT =
  'h-8 rounded-[2px] border border-[#d9dce3] bg-white px-2.5 text-[12px] text-[#1f2329] outline-none placeholder:text-[#c9cdd4] focus:border-[#1668ff]'

/** 分区标题: 蓝色竖条 + 标题 */
function Section({
  title,
  subtitle,
  children,
  divider = true,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  divider?: boolean
}) {
  return (
    <section className={cn(divider && 'mt-5 pt-4 border-t border-[#f0f1f3]')}>
      <div className="flex items-baseline gap-2">
        <h2 className="flex items-center gap-1.5 text-[13px] font-medium text-[#1f2329]">
          <span className="w-[3px] h-3 rounded-sm bg-[#1668ff]" />
          {title}
        </h2>
        {subtitle && (
          <>
            <span className="w-px h-3 bg-[#e5e6eb]" />
            <span className="text-[12px] text-[#8f959e]">{subtitle}</span>
          </>
        )}
      </div>
      <div className="mt-3 space-y-2.5">{children}</div>
    </section>
  )
}

/** 表单行 */
function Field({
  label,
  required,
  hint,
  hintInline,
  tag,
  children,
  alignTop,
}: {
  label: string
  required?: boolean
  hint?: ReactNode
  hintInline?: boolean
  /** 功能点批注（显示新增功能点开关打开时可见） */
  tag?: ReactNode
  children: ReactNode
  alignTop?: boolean
}) {
  return (
    <div className="relative flex items-start gap-3">
      <span
        className={cn(
          'shrink-0 whitespace-nowrap text-right text-[12px] text-[#1f2329]',
          LABEL_W,
          alignTop ? 'pt-1.5 leading-5' : 'leading-8',
        )}
      >
        {label}
        {required && <span className="text-[#f53f3f]"> *</span>}
      </span>
      {tag && <div className="absolute -top-0 right-0 z-10">{tag}</div>}

      <div className={cn('min-w-0 flex-1', hintInline && 'flex items-center gap-3')}>
        {children}
        {hint &&
          (hintInline ? (
            <div className="min-w-0 text-[11px] leading-4 text-[#8f959e]">{hint}</div>
          ) : (
            <div className="mt-1 text-[11px] leading-4 text-[#8f959e]">{hint}</div>
          ))}
      </div>
    </div>
  )
}

/** 下拉框（自定义面板，替代原生 select） */
function Dropdown({
  value,
  options,
  onChange,
  width,
  disabled,
  placeholder = '请选择',
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  width: string
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)
  return (
    <div className={cn('relative', width)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-8 w-full items-center justify-between gap-2 rounded-[2px] border border-[#d9dce3] bg-white px-2.5 text-left text-[12px]',
          disabled ? 'cursor-not-allowed bg-[#f7f8fa] text-[#c9cdd4]' : 'text-[#1f2329] hover:border-[#1668ff]',
          open && 'border-[#1668ff]',
        )}
      >
        <span className={cn('truncate', !current && 'text-[#c9cdd4]')}>{current?.label ?? placeholder}</span>
        <ChevronDown
          size={13}
          className={cn('shrink-0 text-[#8f959e] transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-[34px] z-20 max-h-[220px] overflow-y-auto rounded-[2px] border border-[#e5e6eb] bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            {options.length === 0 && (
              <div className="px-3 py-2 text-[12px] text-[#8f959e]">暂无可选项</div>
            )}
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] hover:bg-[#f7f8fa]',
                  o.value === value ? 'text-[#1668ff]' : 'text-[#1f2329]',
                )}
              >
                <span className="truncate">{o.label}</span>
                {o.value === value && <Check size={12} className="shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** 单选圈 */
function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0',
        checked ? 'border-[#1668ff] bg-[#1668ff]' : 'border-[#c9cdd4] bg-white',
      )}
    >
      {checked && <span className="w-1 h-1 rounded-full bg-white" />}
    </span>
  )
}

/** 复选圈 */
function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'w-3.5 h-3.5 rounded-[2px] border shrink-0 flex items-center justify-center',
        checked ? 'border-[#1668ff] bg-[#1668ff]' : 'border-[#c9cdd4] bg-white',
      )}
    >
      {checked && <Check size={10} strokeWidth={3} className="text-white" />}
    </span>
  )
}

/** GPU 指标目录: 按「算力型号」组织，新增厂家只需加数据 */
interface GpuMetric {
  key: string
  name: string
  unit: string
  min: number
  max: number
  def: number
  desc: string
  /** PromQL 模板, __scope__ 会被替换为 label 过滤条件 */
  query: string
}

const GPU_METRICS: Record<string, GpuMetric[]> = {
  '英伟达 H100': [
    { key: 'gpu_util', name: 'GPU 利用率', unit: '%', min: 0, max: 100, def: 80,
      desc: 'kernel 活跃时间占比。batch 打满 100% 属常态，建议配合队列指标一起判断',
      query: 'avg(DCGM_FI_DEV_GPU_UTIL{__scope__})' },
    { key: 'mem_util', name: '显存使用率', unit: '%', min: 0, max: 100, def: 85,
      desc: '已用显存 / 总显存，超过 90% 易 OOM',
      query: 'avg(DCGM_FI_DEV_FB_USED{__scope__} / DCGM_FI_DEV_FB_TOTAL{__scope__}) * 100' },
    { key: 'sm_active', name: 'SM 活跃度', unit: '', min: 0, max: 1, def: 0.8,
      desc: '至少一个 warp 活跃的 SM 占比，< 0.5 为低效，> 0.8 才算高效',
      query: 'avg(DCGM_FI_PROF_SM_ACTIVE{__scope__})' },
    { key: 'tensor_active', name: 'Tensor Core 活跃度', unit: '', min: 0, max: 1, def: 0.7,
      desc: 'Tensor(HMMA/IMMA) 管线活跃周期占比，反映矩阵算力利用',
      query: 'avg(DCGM_FI_PROF_PIPE_TENSOR_ACTIVE{__scope__})' },
    { key: 'mem_copy', name: '显存带宽利用率', unit: '%', min: 0, max: 100, def: 80,
      desc: '显存带宽占用比例，判断是否受带宽限制',
      query: 'avg(DCGM_FI_DEV_MEM_COPY_UTIL{__scope__})' },
    { key: 'power', name: '功耗', unit: 'W', min: 0, max: 700, def: 600,
      desc: '整卡功耗，H100 SXM 上限约 700W',
      query: 'avg(DCGM_FI_DEV_POWER_USAGE{__scope__})' },
    { key: 'temp', name: 'GPU 温度', unit: '℃', min: 0, max: 100, def: 85,
      desc: '超过安全阈值会降频，通常不作为扩缩容信号',
      query: 'avg(DCGM_FI_DEV_GPU_TEMP{__scope__})' },
  ],
  // 其它厂商：只提供跨厂商口径统一的「算力利用率 + 显存使用率」两项
  // ⚠️ 指标名与 PromQL 为占位，需按各家 exporter 实际暴露替换
  '华为昇腾 910B': [
    { key: 'npu_util', name: 'AI Core 利用率', unit: '%', min: 0, max: 100, def: 80,
      desc: '昇腾 NPU 的 AI Core 算力利用率', query: 'avg(npu_chip_info_utilization{__scope__})' },
    { key: 'hbm_util', name: '显存使用率', unit: '%', min: 0, max: 100, def: 85,
      desc: 'HBM 已用 / 总显存，超过 90% 易 OOM',
      query: 'avg(npu_chip_info_hbm_used{__scope__} / npu_chip_info_hbm_total{__scope__}) * 100' },
  ],
  'Metax C500': [
    { key: 'gpu_util', name: 'GPU 利用率', unit: '%', min: 0, max: 100, def: 80,
      desc: 'Metax GPU 算力利用率', query: 'avg(metax_gpu_utilization{__scope__})' },
    { key: 'mem_util', name: '显存使用率', unit: '%', min: 0, max: 100, def: 85,
      desc: '显存已用 / 总显存', query: 'avg(metax_gpu_memory_used{__scope__} / metax_gpu_memory_total{__scope__}) * 100' },
  ],
  '寒武纪 MLU370-X8': [
    { key: 'mlu_util', name: 'MLU 利用率', unit: '%', min: 0, max: 100, def: 80,
      desc: '寒武纪 MLU 算力利用率', query: 'avg(cambricon_mlu_utilization{__scope__})' },
    { key: 'mem_util', name: '显存使用率', unit: '%', min: 0, max: 100, def: 85,
      desc: 'MLU 内存已用 / 总量', query: 'avg(cambricon_mlu_memory_used{__scope__} / cambricon_mlu_memory_total{__scope__}) * 100' },
  ],
  '海光 DCU Z100': [
    { key: 'dcu_util', name: 'DCU 利用率', unit: '%', min: 0, max: 100, def: 80,
      desc: '海光 DCU 算力利用率', query: 'avg(hygon_dcu_utilization{__scope__})' },
    { key: 'mem_util', name: '显存使用率', unit: '%', min: 0, max: 100, def: 85,
      desc: 'DCU 显存已用 / 总量', query: 'avg(hygon_dcu_memory_used{__scope__} / hygon_dcu_memory_total{__scope__}) * 100' },
  ],
  '天数智芯 BI-V150': [
    { key: 'gpu_util', name: 'GPU 利用率', unit: '%', min: 0, max: 100, def: 80,
      desc: '天数智芯 GPU 算力利用率', query: 'avg(iluvatar_gpu_utilization{__scope__})' },
    { key: 'mem_util', name: '显存使用率', unit: '%', min: 0, max: 100, def: 85,
      desc: '显存已用 / 总显存', query: 'avg(iluvatar_gpu_memory_used{__scope__} / iluvatar_gpu_memory_total{__scope__}) * 100' },
  ],
}

/** Prometheus 指标名（联想用，mock；实际应取自 /api/v1/label/__name__/values） */
const PROM_METRICS: { name: string; desc: string }[] = [
  { name: 'gpu.clock.frequency', desc: 'GPU 时钟频率' },
  { name: 'gpu.ecc.errors', desc: 'ECC 错误数' },
  { name: 'gpu.encode.utilization', desc: '编码器利用率' },
  { name: 'gpu.energy.consumption', desc: '能耗' },
  { name: 'gpu.interconnect.throughput', desc: '互联带宽' },
  { name: 'gpu.memory.free', desc: '空闲显存' },
  { name: 'gpu.memory.total', desc: '显存总量' },
  { name: 'gpu.memory.used', desc: '已用显存' },
  { name: 'gpu.utilization', desc: '算力利用率' },
]

type MetricCond = { id: number; key: string; th: string }

const SPECS = [
  { model: '英伟达 H100', virt: '整卡', count: '1卡', ratio: '100%', mem: '81559Mi', cpu: '32核', ram: '10Gi', disk: '30Gi', over: '未开启', net: '无' },
  { model: '英伟达 H100', virt: '整卡', count: '1卡', ratio: '100%', mem: '81559Mi', cpu: '24核', ram: '100Gi', disk: '30Gi', over: '未开启', net: '无' },
  { model: '英伟达 H100', virt: '整卡', count: '2卡', ratio: '100%', mem: '81559Mi', cpu: '2核', ram: '4Gi', disk: '30Gi', over: '未开启', net: '无' },
  { model: '英伟达 H100', virt: '整卡', count: '2卡', ratio: '100%', mem: '81559Mi', cpu: '2核', ram: '3Gi', disk: '30Gi', over: '开启虚拟显存', net: '无' },
  { model: '英伟达 H100', virt: '整卡', count: '2卡', ratio: '100%', mem: '81559Mi', cpu: '10核', ram: '24Gi', disk: '30Gi', over: '未开启', net: '无' },
  // 以下为多厂商机型（原型示例数据，实际配额/规格以平台为准）
  { model: '华为昇腾 910B', virt: '整卡', count: '1卡', ratio: '100%', mem: '65536Mi', cpu: '32核', ram: '200Gi', disk: '30Gi', over: '未开启', net: '无' },
  { model: 'Metax C500', virt: '整卡', count: '1卡', ratio: '100%', mem: '65536Mi', cpu: '24核', ram: '100Gi', disk: '30Gi', over: '未开启', net: '无' },
  { model: '寒武纪 MLU370-X8', virt: '整卡', count: '1卡', ratio: '100%', mem: '49152Mi', cpu: '16核', ram: '64Gi', disk: '30Gi', over: '未开启', net: '无' },
  { model: '海光 DCU Z100', virt: '整卡', count: '1卡', ratio: '100%', mem: '32768Mi', cpu: '32核', ram: '200Gi', disk: '30Gi', over: '未开启', net: '无' },
  { model: '天数智芯 BI-V150', virt: '整卡', count: '1卡', ratio: '100%', mem: '32768Mi', cpu: '16核', ram: '64Gi', disk: '30Gi', over: '未开启', net: '无' },
]

const SPEC_COLS = ['算力型号', '虚拟化类型', '算力数量', '算力比例', '显存', 'CPU', '内存', '系统盘', '显存超分', '高速网络']

const COL_W: Record<string, string> = {
  算力型号: 'w-[110px]',
  虚拟化类型: 'w-[80px]',
  算力数量: 'w-[66px]',
  算力比例: 'w-[66px]',
  显存: 'w-[86px]',
  CPU: 'w-[62px]',
  内存: 'w-[70px]',
  系统盘: 'w-[70px]',
  显存超分: 'w-[96px]',
  高速网络: 'w-auto',
}

/** 编辑态的初始数据（结构上与列表服务对象兼容） */
export interface EditSeed {
  service: {
    name: string
    framework: string
    model: string
    pool: string
    priority: string
    deployMode: string
    modelReplicas: string
  }
  elastic?: {
    mode: '常规模式' | 'Serverless 模式' | '指标模式'
    minReplicas?: string
    maxReplicas?: string
    shrinkWindow?: string
    targetRequests?: string
    maxRequests?: string
  }
}

/** 去掉「600 秒」这类单位 */
const onlyNumber = (v?: string) => (v ?? '').replace(/[^\d.]/g, '')

/** 提交给列表的数据 */
export interface ServicePayload {
  name: string
  framework: string
  model: string
  pool: string
  priority: string
  deployMode: string
  modelReplicas: string
  elasticMode: '常规模式' | 'Serverless 模式' | '指标模式'
  spec: string
  elastic: {
    mode: '常规模式' | 'Serverless 模式' | '指标模式'
    replicas?: string
    minReplicas?: string
    maxReplicas?: string
    shrinkWindow?: string
    targetRequests?: string
    maxRequests?: string
    source?: '内置指标' | '自定义 PromQL'
    conditions?: { text: string }[]
    join?: 'and' | 'or'
    agg?: string
    expr?: string
  }
}

export function CreateInferenceService({
  onBack,
  onSubmit,
  mode = 'create',
  initial,
}: {
  onBack: () => void
  onSubmit?: (payload: ServicePayload) => void
  mode?: 'create' | 'edit'
  initial?: EditSeed
}) {
  // 预览参数：?elastic=metric&source=custom&spec=0&expr=... 便于截图/联调，无需改代码
  const [searchParams] = useSearchParams()
  const previewElastic = searchParams.get('elastic') as 'resident' | 'serverless' | 'metric' | null
  const previewSource = searchParams.get('source') as 'builtin' | 'custom' | null
  const previewSpec = searchParams.get('spec')
  const previewExpr = searchParams.get('expr')

  const seed = initial?.service
  const seedElastic = initial?.elastic
  // 框架与弹性模式必须匹配: KTransformer 没有 Serve 层, 只能常规模式
  const seedMode: 'resident' | 'serverless' | 'metric' =
    seed?.framework === 'KTransformer'
      ? 'resident'
      : seedElastic?.mode === '指标模式'
        ? 'metric'
        : seedElastic?.mode === 'Serverless 模式'
          ? 'serverless'
          : 'resident'

  const [scene, setScene] = useState<'center' | 'edge'>('center')
  const [name, setName] = useState(seed?.name ?? '')
  const [framework, setFramework] = useState(seed?.framework ?? 'vLLM')
  const [modelSource, setModelSource] = useState<'official' | 'private'>('official')
  const [model, setModel] = useState(
    seed?.model.includes('Qwen2.5') ? 'qwen2.5-0.5b' : seed?.model.includes('Qwen3.5') ? 'qwen3.5-35b-a3b' : '',
  )
  const [desc, setDesc] = useState('')
  const [nameError, setNameError] = useState(false)
  const [specError, setSpecError] = useState(false)
  const [exprError, setExprError] = useState<'empty' | 'noCompare' | null>(null)
  const [pool, setPool] = useState(seed?.pool ?? 'nv-h100-gpu（nv-zhanghu-ceshi）')
  const [priority, setPriority] = useState(seed?.priority ?? '低')
  const [allModel, setAllModel] = useState(false)
  const [h100, setH100] = useState(false)
  const [count, setCount] = useState('全部')
  const [specIdx, setSpecIdx] = useState<number | null>(
    previewSpec !== null ? Number(previewSpec) : seed ? 0 : null,
  )
  const [shm, setShm] = useState('25')
  const [gang, setGang] = useState(false)
  const [topo, setTopo] = useState(false)
  const [svcName, setSvcName] = useState(seed ? seed.model.replace(/^官方\s*/, '') : '')
  const [svcVer, setSvcVer] = useState(seed ? 'v2' : '')
  const [deployMode, setDeployMode] = useState<'simple' | 'dist'>(
    seed?.deployMode === '分布式并行' ? 'dist' : 'simple',
  )
  const [tp, setTp] = useState('')
  const [pp, setPp] = useState('')
  const [dp, setDp] = useState('')
  const [ep, setEp] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [elastic, setElastic] = useState<'resident' | 'serverless' | 'metric'>(
    previewElastic ?? seedMode,
  )
  // 指标模式（按算力指标调整模型副本范围）
  const [metricSource, setMetricSource] = useState<'builtin' | 'custom'>(previewSource ?? 'builtin')
  const [conds, setConds] = useState<MetricCond[]>([{ id: 1, key: '', th: '' }])
  const [condJoin, setCondJoin] = useState<'and' | 'or'>('and')
  const [metricAgg, setMetricAgg] = useState('avg')
  const [customQuery, setCustomQuery] = useState(previewExpr ?? '')
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [scaleDownHold, setScaleDownHold] = useState('600')
  const [metricMinReplicas, setMetricMinReplicas] = useState('1')
  const [metricMaxReplicas, setMetricMaxReplicas] = useState('4')
  const [replicas, setReplicas] = useState('1')
  const [minReplicas, setMinReplicas] = useState(seedElastic?.minReplicas ?? '1')
  const [maxReplicas, setMaxReplicas] = useState(seedElastic?.maxReplicas ?? '1')
  const [shrinkWindow, setShrinkWindow] = useState(onlyNumber(seedElastic?.shrinkWindow) || '600')
  const [targetReq, setTargetReq] = useState(seedElastic?.targetRequests ?? '10.0')
  const [maxReq, setMaxReq] = useState(seedElastic?.maxRequests ?? '20.0')

  // 算力型号来自「资源规格 → 算力规格」的选中行（不是独立选择）
  const selectedModel = specIdx !== null ? SPECS[specIdx].model : null
  const metricList = selectedModel ? GPU_METRICS[selectedModel] ?? [] : []
  // 提交：把表单状态组装成列表可用的载荷
  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError(true)
      return
    }
    setNameError(false)
    // 指标模式的指标目录来自「算力规格」选中行, 未选则无法判定指标
    if (elastic === 'metric' && specIdx === null) {
      setSpecError(true)
      return
    }
    setSpecError(false)
    // 自定义表达式: 必须写完整判断条件, 且能收敛为单值
    if (elastic === 'metric' && metricSource === 'custom') {
      if (!customQuery.trim()) {
        setExprError('empty')
        return
      }
      if (!/[<>]|[=!]=/.test(customQuery)) {
        setExprError('noCompare')
        return
      }
      setExprError(null)
    }
    const specRow = specIdx !== null ? SPECS[specIdx] : null
    const specText = specRow
      ? `${specRow.model === '英伟达 H100' ? 'Nvidia H100' : specRow.model}（${specRow.mem}）*${specRow.count.replace('卡', '')},CPU ${specRow.cpu}...`
      : 'Nvidia H100（81559Mi）*1,CPU 32核...'
    const modelLabel =
      mode === 'edit' && !model && seed
        ? seed.model // 编辑态: 下拉未覆盖该模型时保持原值，避免改坏数据
        : model === 'qwen2.5-0.5b'
          ? '官方 Qwen2.5-0.5B'
          : model === 'qwen3.5-35b-a3b'
            ? '官方 Qwen3.5-35B-A3B'
            : '官方 Qwen3.5-35B-A3B'
    const elasticMode: '常规模式' | 'Serverless 模式' | '指标模式' =
      elastic === 'resident' ? '常规模式' : elastic === 'serverless' ? 'Serverless 模式' : '指标模式'
    const aggLabel = { avg: '平均值', max: '最大值', sum: '求和' }[metricAgg] ?? '平均值'

    const elasticDetail: ServicePayload['elastic'] =
      elastic === 'resident'
        ? { mode: '常规模式', replicas }
        : elastic === 'serverless'
          ? {
              mode: 'Serverless 模式',
              minReplicas,
              maxReplicas,
              shrinkWindow: `${shrinkWindow} 秒`,
              targetRequests: targetReq,
              maxRequests: maxReq,
            }
          : metricSource === 'custom'
            ? {
                mode: '指标模式',
                source: '自定义 PromQL',
                expr: customQuery,
                minReplicas: metricMinReplicas,
                maxReplicas: metricMaxReplicas,
                shrinkWindow: `${scaleDownHold} 秒`,
              }
            : {
                mode: '指标模式',
                source: '内置指标',
                conditions: condRows.map((r) => ({
                  text: `${r.metric?.name ?? ''} ≥ ${r.th}${r.metric?.unit ? ` ${r.metric.unit}` : ''}`,
                })),
                join: condJoin,
                agg: aggLabel,
                minReplicas: metricMinReplicas,
                maxReplicas: metricMaxReplicas,
                shrinkWindow: `${scaleDownHold} 秒`,
              }

    onSubmit?.({
      name: name.trim(),
      framework,
      model: modelLabel,
      pool,
      priority,
      deployMode: deployMode === 'dist' ? '分布式并行' : '简易模式',
      modelReplicas:
        elastic === 'resident'
          ? replicas
          : elastic === 'serverless'
            ? `${minReplicas}–${maxReplicas}`
            : `${metricMinReplicas}–${metricMaxReplicas}`,
      elasticMode,
      spec: specText,
      elastic: elasticDetail,
    })
  }

  // KTransformer 暂不支持 Serve 自带的请求驱动弹性与指标驱动弹性
  const ktLimited = framework === 'KTransformer'
  const metricOf = (key: string) => metricList.find((m) => m.key === key)
  // 条件行: 未选指标时默认第一项, 未填阈值时用该指标推荐值
  const condRows = conds.map((c) => {
    const m = metricOf(c.key) ?? metricList[0]
    return { ...c, metric: m, th: c.th !== '' ? c.th : m ? String(m.def) : '' }
  })
  // 自定义 PromQL 联想: 取表达式末尾的标识符作为过滤词
  const typingToken = (customQuery.match(/[a-zA-Z0-9_.]*$/) ?? [''])[0]
  const suggestions = typingToken
    ? PROM_METRICS.filter((m) => m.name.includes(typingToken))
    : PROM_METRICS

  // 副本区间: min > max 非法; min == max 合法（等价固定副本）
  const replicaInvalid = Number(metricMinReplicas) > Number(metricMaxReplicas)
  const replicaFixed =
    metricMinReplicas !== '' &&
    metricMaxReplicas !== '' &&
    Number(metricMinReplicas) === Number(metricMaxReplicas)

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* 页头 */}
      <div className="shrink-0 h-9 px-6 flex items-center gap-2.5 border-b border-[#e5e6eb]">
        <button
          onClick={onBack}
          className="text-[#646a73] hover:text-[#1668ff]"
          title="返回推理实例"
        >
          <ArrowLeft size={15} />
        </button>
        <span className="w-px h-3.5 bg-[#d9dce3]" />
        <h1 className="text-[14px] font-medium text-[#1f2329]">
          {mode === 'edit' ? '编辑内部推理服务' : '创建内部推理服务'}
        </h1>
      </div>

      {/* 表单区 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* 基本信息 */}
        <Section title="基本信息" divider={false}>
          <Field label="部署场景" required>
            <div className="flex items-center gap-5 h-8">
              <button
                onClick={() => setScene('center')}
                className="flex items-center gap-1.5 text-[12px] text-[#1f2329]"
              >
                <Radio checked={scene === 'center'} />
                中心部署
              </button>
              <button
                disabled
                title="边缘部署暂未开放"
                className="flex cursor-not-allowed items-center gap-1.5 text-[12px] text-[#c9cdd4]"
              >
                <Radio checked={false} />
                边缘部署
              </button>
            </div>
          </Field>

          <Field
            label="服务名称"
            required
            hint={nameError ? <span className="text-[#f53f3f]">请输入服务名称</span> : undefined}
          >
            <div className={cn('relative', FIELD_W)}>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value.slice(0, 56))
                  setNameError(false)
                }}
                placeholder="请输入服务名称"
                className={cn(INPUT, 'w-full pr-14', nameError && 'border-[#f53f3f]')}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#c9cdd4]">
                {name.length} / 56
              </span>
            </div>
          </Field>

          <Field
            label="推理框架"
            required
            tag={<NewTag code="F-LIMIT" compact />}
            hint="一般情况推荐选择vLLM，如果需要CPU offload能力请选择KTransformer"
          >
            <div className={cn('relative', FIELD_W)}>
              <select
                value={framework}
                disabled={mode === 'edit'}
                title={mode === 'edit' ? '推理框架创建后不可修改' : undefined}
                onChange={(e) => {
                  setFramework(e.target.value)
                  if (e.target.value === 'KTransformer') setElastic('resident')
                }}
                className={cn(INPUT, 'w-full appearance-none pr-8', mode === 'edit' && 'disabled:bg-[#f7f8fa] disabled:text-[#8f959e] disabled:cursor-not-allowed')}
              >
                <option>vLLM</option>
                <option>KTransformer</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f959e] pointer-events-none"
              />
            </div>
          </Field>

          <Field label="选择模型" required>
            <div className="space-y-2">
              <div className="flex items-center gap-5 h-5">
                <button
                  onClick={() => mode !== 'edit' && setModelSource('official')}
                  disabled={mode === 'edit'}
                  className={cn(
                    'flex items-center gap-1.5 text-[12px] text-[#1f2329]',
                    mode === 'edit' && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <Radio checked={modelSource === 'official'} />
                  官方模型
                </button>
                <button
                  onClick={() => mode !== 'edit' && setModelSource('private')}
                  disabled={mode === 'edit'}
                  className={cn(
                    'flex items-center gap-1.5 text-[12px] text-[#1f2329]',
                    mode === 'edit' && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <Radio checked={modelSource === 'private'} />
                  私有模型
                </button>
              </div>
              <div className={cn('relative', FIELD_W)}>
                <select
                  value={model}
                  disabled={mode === 'edit'}
                  title={mode === 'edit' ? '模型创建后不可修改' : undefined}
                  onChange={(e) => setModel(e.target.value)}
                  className={cn(INPUT, 'w-full appearance-none pr-8', mode === 'edit' && 'disabled:bg-[#f7f8fa] disabled:text-[#8f959e] disabled:cursor-not-allowed')}
                >
                  <option value="">请选择模型</option>
                  <option value="qwen3.5-35b-a3b">Qwen3.5-35B-A3B</option>
                  <option value="qwen2.5-0.5b">Qwen2.5-0.5B</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f959e] pointer-events-none"
                />
              </div>
            </div>
          </Field>

          <Field label="描述" alignTop>
            <div className={cn('relative', FIELD_W)}>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 500))}
                className="w-full h-[108px] rounded-[2px] border border-[#d9dce3] bg-white px-2.5 py-1.5 text-[12px] text-[#1f2329] outline-none resize-none focus:border-[#1668ff]"
              />
              <span className="absolute right-2 bottom-1.5 text-[11px] text-[#c9cdd4]">
                {desc.length} / 500
              </span>
            </div>
          </Field>
        </Section>

        {/* 资源规格 */}
        <Section title="资源规格">
          <Field label="资源池" required>
            <div className={cn('relative', FIELD_W)}>
              <select
                value={pool}
                onChange={(e) => setPool(e.target.value)}
                className={cn(INPUT, 'w-full appearance-none pr-8')}
              >
                <option>nv-h100-gpu（nv-zhanghu-ceshi）</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f959e] pointer-events-none"
              />
            </div>
          </Field>

          <Field label="负载优先级" required>
            <div className="space-y-1.5">
              <div className="inline-flex">
                {['低', '中', '高', '最高'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'h-7 w-[52px] text-[12px] border border-[#d9dce3] -ml-px first:ml-0 first:rounded-l-[2px] last:rounded-r-[2px]',
                      priority === p
                        ? 'bg-[#1668ff] border-[#1668ff] text-white'
                        : 'bg-white text-[#1f2329] hover:text-[#1668ff]',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="space-y-1 text-[11px] text-[#8f959e]">
                <p className="flex items-start gap-1">
                  <InfoDot />
                  优先级越高，算力分配越优先
                </p>
                <p className="flex items-start gap-1">
                  <InfoDot />
                  于抢占后，高优先级负载可以抢占低优先级负载资源
                </p>
                <p>
                  当前资源池是否允许抢占：<span className="text-[#f53f3f]">否</span>
                </p>
              </div>
            </div>
          </Field>

          <Field label="算力型号">
            <div className="flex items-center gap-5 h-8 text-[12px] text-[#1f2329]">
              <button onClick={() => setAllModel(!allModel)} className="flex items-center gap-1.5">
                <CheckBox checked={allModel} />
                全部
              </button>
              <button onClick={() => setH100(!h100)} className="flex items-center gap-1.5">
                <CheckBox checked={h100} />
                英伟达 H100
              </button>
            </div>
          </Field>

          <Field label="算力数量">
            <div className="inline-flex">
              {['全部', '1', '2'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={cn(
                    'h-7 w-[52px] text-[12px] border border-[#d9dce3] -ml-px first:ml-0 first:rounded-l-[2px] last:rounded-r-[2px]',
                    count === c
                      ? 'bg-[#1668ff] border-[#1668ff] text-white'
                      : 'bg-white text-[#1f2329] hover:text-[#1668ff]',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="算力规格"
            required
            alignTop
            hint={specError ? <span className="text-[#f53f3f]">指标模式需先选择算力规格</span> : undefined}
          >
            <div className="rounded-[2px] border border-[#e5e6eb] overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[#f7f8fa] text-[#8f959e]">
                    <th className="w-8" />
                    {SPEC_COLS.map((c) => (
                      <th
                        key={c}
                        className={cn(
                          'text-left font-normal py-1.5 pr-4 whitespace-nowrap',
                          COL_W[c],
                        )}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPECS.map((s, i) => (
                    <tr
                      key={i}
                      onClick={() => setSpecIdx(i)}
                      className={cn(
                        'border-t border-[#f0f1f3] cursor-pointer',
                        specIdx === i ? 'bg-[#f2f7ff]' : 'hover:bg-[#fafbfc]',
                      )}
                    >
                      <td className="pl-3 py-1.5">
                        <Radio checked={specIdx === i} />
                      </td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.model}</td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.virt}</td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.count}</td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.ratio}</td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.mem}</td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.cpu}</td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.ram}</td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.disk}</td>
                      <td className="py-1.5 pr-4 whitespace-nowrap text-[#1f2329]">{s.over}</td>
                      <td className="py-1.5 whitespace-nowrap text-[#1f2329]">{s.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Field>

          <Field label="共享内存" required>
            <div className="flex items-center gap-2">
              <div className="flex items-stretch h-8 w-[304px] rounded-[2px] border border-[#d9dce3] bg-white overflow-hidden focus-within:border-[#1668ff]">
                <span className="flex items-center px-2.5 bg-[#f5f6f8] border-r border-[#d9dce3] text-[12px] text-[#646a73] whitespace-nowrap shrink-0">
                  内存百分比
                </span>
                <input
                  value={shm}
                  onChange={(e) => setShm(e.target.value.replace(/[^\d]/g, ''))}
                  className="flex-1 min-w-0 px-2.5 text-[12px] text-[#1f2329] outline-none"
                />
                <span className="flex items-center px-2.5 bg-[#f5f6f8] border-l border-[#d9dce3] text-[12px] text-[#646a73] shrink-0">
                  %
                </span>
              </div>
              <span className="text-[12px] text-[#1f2329]">0.00Gi</span>
            </div>
          </Field>

          <Field
            label="组调度"
            hintInline
            hint="所有副本同时调度或不调度，避免只调度了 header 节点或只调度了 worker 节点，即占用资源，又无法工作"
          >
            <button
              onClick={() => setGang(!gang)}
              className="flex items-center gap-1.5 h-8 text-[12px] text-[#1f2329]"
            >
              <CheckBox checked={gang} />
              启用
            </button>
          </Field>

          <Field label="拓扑感知调度">
            <button
              onClick={() => setTopo(!topo)}
              className="flex items-center gap-1.5 h-8 text-[12px] text-[#1f2329]"
            >
              <CheckBox checked={topo} />
              节点内拓扑亲和
            </button>
          </Field>

          <Field label="指定加速卡调度">
            <div className={cn('relative', 'w-[304px]')}>
              <select className={cn(INPUT, 'w-full appearance-none pr-8 text-[#c9cdd4]')}>
                <option>请选择加速卡（可多选）</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f959e] pointer-events-none"
              />
            </div>
          </Field>
        </Section>

        {/* 推理配置 */}
        <Section title="推理配置">
          <Field label="服务模型名称" required>
            <div className="flex items-center gap-2">
              <input
                value={svcName}
                disabled={mode === 'edit'}
                title={mode === 'edit' ? '服务模型名称不可修改' : undefined}
                onChange={(e) => setSvcName(e.target.value)}
                placeholder="请输入服务模型名称"
                className={cn(INPUT, 'w-[220px]', mode === 'edit' && 'disabled:bg-[#f7f8fa] disabled:text-[#8f959e] disabled:cursor-not-allowed')}
              />
              <input
                value={svcVer}
                onChange={(e) => setSvcVer(e.target.value)}
                placeholder="请输入服务模型版本"
                className={cn(INPUT, 'w-[76px]')}
              />
            </div>
          </Field>

          <Field label="部署模式" required alignTop>
            <div className="flex items-stretch gap-2.5">
              {[
                {
                  key: 'simple' as const,
                  title: '简易模式',
                  desc: '一般30B以下小参数或量化后模型，默认仅张量并行',
                },
                {
                  key: 'dist' as const,
                  title: '分布式并行',
                  desc: '超大参数或MoE模型大规模部署，需要多种并行策略',
                },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setDeployMode(m.key)}
                  className={cn(
                    'w-[230px] text-left rounded-[2px] border px-4 py-2.5',
                    deployMode === m.key
                      ? 'border-[#1668ff] bg-white'
                      : 'border-[#e5e6eb] bg-white hover:border-[#1668ff]',
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center gap-2 text-[13px]',
                      deployMode === m.key ? 'text-[#1668ff]' : 'text-[#1f2329]',
                    )}
                  >
                    <Radio checked={deployMode === m.key} />
                    {m.title}
                  </span>
                  <span className="mt-1.5 block text-[12px] leading-5 text-[#646a73]">{m.desc}</span>
                </button>
              ))}
            </div>
          </Field>

          {deployMode === 'dist' && (
            <Field label="模型并行" required alignTop>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'TP并行', ph: '张量并行数', value: tp, onChange: setTp },
                  { label: 'PP并行', ph: '流水线并行数', value: pp, onChange: setPp },
                  { label: 'DP并行', ph: '数据并行数', value: dp, onChange: setDp },
                ].map((f) => (
                  <div key={f.label} className="min-w-0">
                    <div className="flex items-center gap-1 text-[13px] text-[#1f2329]">
                      {f.label}
                      <Info size={12} className="text-[#8f959e]" />
                    </div>
                    <input
                      value={f.value}
                      onChange={(e) => f.onChange(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder={f.ph}
                      className={cn(INPUT, 'mt-2 w-full')}
                    />
                  </div>
                ))}
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[13px] text-[#1f2329]">
                    EP并行
                    <Info size={12} className="text-[#8f959e]" />
                  </div>
                  <button
                    onClick={() => setEp(!ep)}
                    className="mt-2 flex h-8 items-center gap-1.5 text-[12px] text-[#1f2329]"
                  >
                    <CheckBox checked={ep} />
                    启用
                  </button>
                </div>
              </div>

              <div className="mt-3 rounded-[2px] bg-[#f2f7ff] px-4 py-3 text-[13px] leading-7 text-[#1668ff]">
                <p>
                  1.稠密模型：30B以下小参数模型中低并发（每秒请求低于128）推荐使用TP，高并发推荐TP +
                  DP，大参数模型推荐使用TP + PP；MoE模型：可使用TP、DP等，TP X DP &gt; 1
                  时可开启EP（详见上方“EP并行”介绍）
                </p>
                <p>2.下方弹性伸缩可设置模型副本，服务总卡数=模型副本数 X TP X PP X DP（EP开启不影响卡数）</p>
                <p>
                  3.下方算力规格指容器组（Pod）规格，Pod数量 =（模型副本 X TP X PP X DP）/规格卡数；规格卡数必须能被（TP X PP X
                  DP）整除，避免显卡闲置
                </p>
              </div>
            </Field>
          )}

          {/* 高级配置 */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[12px] font-semibold text-[#1668ff]">高级配置</span>
            <button
              onClick={() => setAdvanced(!advanced)}
              className="w-6 h-5 rounded-[2px] border border-[#d9dce3] flex items-center justify-center text-[#646a73] hover:border-[#1668ff] hover:text-[#1668ff]"
              title={advanced ? '收起高级配置' : '展开高级配置'}
            >
              {advanced ? <Minus size={12} /> : <Plus size={12} />}
            </button>
          </div>
          {advanced && (
            <div className="rounded-[2px] border border-dashed border-[#d9dce3] px-3 py-2 text-[11px] text-[#8f959e]">
              高级配置项（原型占位）：环境变量、启动命令、健康检查、优雅退出时间等
            </div>
          )}
        </Section>

        {/* 弹性伸缩 */}
        <Section
          title="弹性伸缩"
          subtitle="弹性伸缩最小单元是一个模型副本，通过调整模型副本数实现扩缩容"
        >
          <Field
            label="弹性模式"
            required
            tag={<NewTag code="F-METRIC" compact />}
            hint={
              ktLimited
                ? 'KTransformer 暂不支持 Serverless 与指标模式，仅支持常规模式（固定副本）'
                : elastic === 'resident'
                ? '一般用于稳定负载，无需频繁扩缩容场景'
                : elastic === 'serverless'
                  ? '一般用于负载变化较大场景，根据请求情况自动扩缩容，无需人工干预'
                  : '根据算力使用情况自动伸缩：负载升高时增加实例，负载回落后释放资源，避免算力长期闲置'
            }
          >
            <div className="flex items-center gap-5 h-8">
              <button
                onClick={() => setElastic('resident')}
                className={cn(
                  'flex items-center gap-1.5 text-[13px]',
                  elastic === 'resident' ? 'text-[#1668ff]' : 'text-[#1f2329]',
                )}
              >
                <Radio checked={elastic === 'resident'} />
                常规模式
              </button>
              <button
                onClick={() => !ktLimited && setElastic('serverless')}
                disabled={ktLimited}
                title={ktLimited ? 'KTransformer 暂不支持 Serverless 模式' : undefined}
                className={cn(
                  'flex items-center gap-1.5 text-[13px]',
                  elastic === 'serverless' ? 'text-[#1668ff]' : 'text-[#1f2329]',
                  ktLimited && 'cursor-not-allowed opacity-40',
                )}
              >
                <Radio checked={elastic === 'serverless'} />
                Serverless 模式
              </button>
              <button
                onClick={() => !ktLimited && setElastic('metric')}
                disabled={ktLimited}
                title={ktLimited ? 'KTransformer 暂不支持指标模式' : undefined}
                className={cn(
                  'flex items-center gap-1.5 text-[13px]',
                  elastic === 'metric' ? 'text-[#1668ff]' : 'text-[#1f2329]',
                  ktLimited && 'cursor-not-allowed opacity-40',
                )}
              >
                <Radio checked={elastic === 'metric'} />
                指标模式
              </button>
            </div>
          </Field>

          {elastic === 'resident' && (
            <Field label="模型副本数" required>
              <div className={cn('relative', 'w-[304px]')}>
                <input
                  value={replicas}
                  onChange={(e) => setReplicas(e.target.value.replace(/[^\d]/g, ''))}
                  className={cn(INPUT, 'w-full pr-7')}
                />
                <div className="absolute right-0 top-0 h-8 w-6 flex flex-col border-l border-[#d9dce3]">
                  <button
                    onClick={() => setReplicas(String(Number(replicas || 0) + 1))}
                    className="flex-1 flex items-center justify-center text-[#8f959e] hover:text-[#1668ff]"
                  >
                    <ChevronUp size={10} />
                  </button>
                  <button
                    onClick={() => setReplicas(String(Math.max(0, Number(replicas || 0) - 1)))}
                    className="flex-1 flex items-center justify-center border-t border-[#d9dce3] text-[#8f959e] hover:text-[#1668ff]"
                  >
                    <ChevronDown size={10} />
                  </button>
                </div>
              </div>
            </Field>
          )}

          {elastic === 'serverless' && (
            <>
              <Field
                label="最小模型副本"
                required
                hint={
                  <span className="flex items-center gap-1">
                    <InfoDot />
                    自动扩缩容时，最小缩容到此副本数
                  </span>
                }
              >
                <div className="flex items-center gap-3">
                  <input
                    value={minReplicas}
                    onChange={(e) => setMinReplicas(e.target.value.replace(/[^\d]/g, ''))}
                    className={cn(INPUT, 'w-[596px]')}
                  />
                  <button
                    onClick={() => setMinReplicas(String(Number(minReplicas || 0) + 1))}
                    className="text-[#646a73] hover:text-[#1668ff]"
                  >
                    <ArrowUp size={14} />
                  </button>
                </div>
              </Field>

              <Field
                label="最大模型副本"
                required
                hint={
                  <span className="flex items-center gap-1">
                    <InfoDot />
                    自动扩缩容时，最大扩容到此副本数
                  </span>
                }
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-[596px]">
                    <input
                      value={maxReplicas}
                      onChange={(e) => setMaxReplicas(e.target.value.replace(/[^\d]/g, ''))}
                      className={cn(INPUT, 'w-full pr-8')}
                    />
                    <button
                      onClick={() => setMaxReplicas('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#c9cdd4] hover:text-[#8f959e]"
                    >
                      <CircleX size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => setMaxReplicas(String(Number(maxReplicas || 0) + 1))}
                    className="text-[#646a73] hover:text-[#1668ff]"
                  >
                    <ArrowUp size={14} />
                  </button>
                </div>
              </Field>

              <Field
                label="缩容检测窗口"
                required
                hint={
                  <span className="flex items-center gap-1">
                    <InfoDot />
                    在检测窗口时间内处理的请求持续低于目标才会触发缩容
                  </span>
                }
              >
                <div className="flex items-center gap-3">
                  <input
                    value={shrinkWindow}
                    onChange={(e) => setShrinkWindow(e.target.value.replace(/[^\d]/g, ''))}
                    className={cn(INPUT, 'w-[596px]')}
                  />
                  <span className="text-[12px] text-[#1f2329]">秒</span>
                </div>
              </Field>

              <Field label="目标请求数" required>
                <div className="flex items-center gap-3 h-8 text-[12px] text-[#1f2329]">
                  每个副本同时处理
                  <input
                    value={targetReq}
                    onChange={(e) => setTargetReq(e.target.value)}
                    className={cn(INPUT, 'w-[160px]')}
                  />
                  个请求最佳
                </div>
              </Field>

              <Field label="最大请求数" required>
                <div className="flex items-center gap-3 h-8 text-[12px] text-[#1f2329]">
                  每个副本最多处理
                  <input
                    value={maxReq}
                    onChange={(e) => setMaxReq(e.target.value)}
                    className={cn(INPUT, 'w-[160px]')}
                  />
                  个请求
                </div>
              </Field>
            </>
          )}

          {/* ---- 指标模式：与 Serverless 同构，按算力指标调整副本范围 ---- */}
          {elastic === 'metric' && (
            <>
              <Field label="算力型号" required tag={<NewTag code="F-VENDOR" compact />}>
                {selectedModel ? (
                  <div className="flex items-center gap-2 h-8 text-[12px]">
                    <span className="inline-flex items-center rounded-[2px] border border-[#b9d4ff] bg-[#eef4ff] px-1.5 text-[11px] leading-5 text-[#1668ff]">
                      {selectedModel}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 h-8 text-[12px] text-[#f53f3f]">
                    <TriangleAlert size={12} />
                    请先选择一种算力规格
                  </div>
                )}
              </Field>

              <Field label="指标来源" required>
                <div className="flex items-center gap-5 h-8">
                  <button
                    onClick={() => setMetricSource('builtin')}
                    className={cn(
                      'flex items-center gap-1.5 text-[13px]',
                      metricSource === 'builtin' ? 'text-[#1668ff]' : 'text-[#1f2329]',
                    )}
                  >
                    <Radio checked={metricSource === 'builtin'} />
                    内置指标
                  </button>
                  <button
                    onClick={() => setMetricSource('custom')}
                    className={cn(
                      'flex items-center gap-1.5 text-[13px]',
                      metricSource === 'custom' ? 'text-[#1668ff]' : 'text-[#1f2329]',
                    )}
                  >
                    <Radio checked={metricSource === 'custom'} />
                    自定义 PromQL
                  </button>
                </div>
              </Field>

              {metricSource === 'builtin' ? (
                <>
                  <Field
                    label="伸缩条件"
                    required
                    hint={
                      condRows.length > 1
                        ? `${condJoin === 'and' ? '同时满足' : '满足任一条'}上述条件时，允许服务扩展到最大副本数以应对高峰；条件长时间不满足时，回落至最小副本数并释放算力资源`
                        : '满足条件时，允许服务扩展到最大副本数以应对高峰；条件长时间不满足时，回落至最小副本数并释放算力资源'
                    }
                  >
                    <div className="space-y-2">
                      {condRows.map((r, i) => (
                        <div key={r.id} className="flex flex-wrap items-center gap-2">
                          <div className="relative">
                            <select
                              value={r.metric?.key ?? ''}
                              onChange={(e) => {
                                const next = [...conds]
                                next[i] = { ...next[i], key: e.target.value, th: '' }
                                setConds(next)
                              }}
                              disabled={metricList.length === 0}
                              className={cn(
                                INPUT,
                                'w-[200px] appearance-none pr-8 disabled:bg-[#f7f8fa] disabled:text-[#c9cdd4]',
                              )}
                            >
                              {metricList.length === 0 && <option value="">暂无内置指标</option>}
                              {metricList.map((m) => (
                                <option key={m.key} value={m.key}>
                                  {m.name}
                                  {m.unit ? `（${m.unit}）` : ''}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={13}
                              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f959e]"
                            />
                          </div>
                          <span className="text-[12px] text-[#1668ff]">≥</span>
                          <input
                            type="number"
                            value={r.th}
                            onChange={(e) => {
                              const next = [...conds]
                              next[i] = { ...next[i], th: e.target.value }
                              setConds(next)
                            }}
                            className={cn(INPUT, 'w-[100px]')}
                          />
                          <span className="text-[12px] text-[#646a73]">{r.metric?.unit}</span>
                          {conds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setConds(conds.filter((c) => c.id !== r.id))}
                              title="删除该条件"
                              className="ml-1 flex h-7 w-7 items-center justify-center rounded-[2px] border border-transparent text-[#8f959e] transition-colors hover:border-[#ffccc7] hover:bg-[#fff1f0] hover:text-[#f53f3f]"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="flex items-center gap-3 pt-0.5">
                        {conds.length < 3 && (
                          <button
                            onClick={() =>
                              setConds([
                                ...conds,
                                { id: Date.now(), key: metricList[0]?.key ?? '', th: '' },
                              ])
                            }
                            className="flex items-center gap-1 text-[12px] text-[#1668ff] hover:underline"
                          >
                            <Plus size={12} />
                            添加条件
                          </button>
                        )}
                        <NewTag code="F-MULTI" />
                      </div>

                      {conds.length > 1 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[12px] text-[#1f2329]">条件关系</span>
                          <span className="text-[#f53f3f]">*</span>
                          <Dropdown
                            value={condJoin}
                            width="w-[100px]"
                            onChange={(v) => setCondJoin(v as 'and' | 'or')}
                            options={[
                              { value: 'and', label: '且' },
                              { value: 'or', label: '或' },
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  </Field>

                  <Field label="聚合方式" required>
                    <Dropdown
                      value={metricAgg}
                      width="w-[160px]"
                      onChange={setMetricAgg}
                      options={[
                        { value: 'avg', label: '平均值' },
                        { value: 'max', label: '最大值' },
                        { value: 'sum', label: '求和' },
                      ]}
                    />
                  </Field>
                </>
              ) : (
                <Field
                  label="指标表达式"
                  required
                  tag={<NewTag code="F-CUSTOM" compact />}
                  hint={
                    exprError === 'empty' ? (
                      <span className="text-[#f53f3f]">请输入指标表达式</span>
                    ) : exprError === 'noCompare' ? (
                      <span className="text-[#f53f3f]">
                        表达式未包含比较条件，请写成「指标 &gt; 阈值」的形式
                      </span>
                    ) : (
                      '例如：显存占用超过 85% 时扩容 —— avg(gpu.memory.used{namespace="$namespace"}) / avg(gpu.memory.total{namespace="$namespace"}) > 0.85'
                    )
                  }
                >
                  <div className="w-[596px]">
                    <div className="relative">
                      <input
                        value={customQuery}
                        onChange={(e) => {
                          setCustomQuery(e.target.value)
                          setSuggestOpen(true)
                          setExprError(null)
                        }}
                        onFocus={() => setSuggestOpen(true)}
                        onBlur={() => window.setTimeout(() => setSuggestOpen(false), 150)}
                        placeholder='avg(gpu.memory.used{namespace="$namespace"})'
                        className={cn(INPUT, 'w-full pr-8 font-mono', exprError && 'border-[#f53f3f]')}
                      />
                      {customQuery && (
                        <button
                          onClick={() => setCustomQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#c9cdd4] hover:text-[#8f959e]"
                        >
                          <CircleX size={14} />
                        </button>
                      )}
                      {suggestOpen && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-[34px] z-20 max-h-[220px] overflow-y-auto rounded-[2px] border border-[#e5e6eb] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                          {suggestions.map((m) => (
                            <button
                              key={m.name}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                const idx = customQuery.search(/[a-zA-Z0-9_.]*$/)
                                setCustomQuery(customQuery.slice(0, idx) + m.name)
                                setSuggestOpen(false)
                              }}
                              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#f7f8fa]"
                            >
                              <span className="font-mono text-[12px] text-[#1f2329]">{m.name}</span>
                              <span className="shrink-0 text-[11px] text-[#8f959e]">{m.desc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Field>
              )}

              <Field
                label="最小模型副本数"
                required
                hint={
                  <span className="flex items-center gap-1">
                    <InfoDot />
                    服务空闲时仍保留的最小副本数，确保始终有实例可用，避免请求到达时等待冷启动
                  </span>
                }
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <input
                      value={metricMinReplicas}
                      onChange={(e) => setMetricMinReplicas(e.target.value.replace(/[^\d]/g, ''))}
                      className={cn(INPUT, 'w-[596px]')}
                    />
                    <button
                      onClick={() => setMetricMinReplicas(String(Number(metricMinReplicas || 0) + 1))}
                      className="text-[#646a73] hover:text-[#1668ff]"
                    >
                      <ArrowUp size={14} />
                    </button>
                  </div>
                  {(metricMinReplicas === '' || Number(metricMinReplicas) < 1) && (
                    <div className="flex items-center gap-1 text-[11px] text-[#f53f3f]">
                      <TriangleAlert size={11} />
                      最小模型副本数不能为 0（算力资源冷启动需数分钟，至少保留 1 个副本）
                    </div>
                  )}
                </div>
              </Field>

              <Field
                label="最大模型副本数"
                required
                hint={
                  replicaInvalid ? (
                    <span className="flex items-center gap-1 text-[#f53f3f]">
                      <TriangleAlert size={11} />
                      最大模型副本数不能小于最小模型副本数
                    </span>
                  ) : replicaFixed ? (
                    <span className="flex items-center gap-1">
                      <InfoDot />
                      最大与最小相等：副本数固定，等同于常规模式（无弹性）
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <InfoDot />
                      负载高峰时允许扩展到的最多副本数，用于应对流量尖峰，同时限制算力占用上限
                    </span>
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <input
                    value={metricMaxReplicas}
                    onChange={(e) => setMetricMaxReplicas(e.target.value.replace(/[^\d]/g, ''))}
                    className={cn(INPUT, 'w-[596px]')}
                  />
                  <button
                    onClick={() => setMetricMaxReplicas(String(Number(metricMaxReplicas || 0) + 1))}
                    className="text-[#646a73] hover:text-[#1668ff]"
                  >
                    <ArrowUp size={14} />
                  </button>
                </div>
              </Field>

              <Field
                label="缩容检测窗口"
                required
                hint={
                  <span className="flex items-center gap-1">
                    <InfoDot />
                    指标回落后继续观察的时长，确认负载确实下降而非短暂波动后再缩容，避免频繁伸缩
                  </span>
                }
              >
                <div className="flex items-center gap-3">
                  <input
                    value={scaleDownHold}
                    onChange={(e) => setScaleDownHold(e.target.value.replace(/[^\d]/g, ''))}
                    className={cn(INPUT, 'w-[596px]')}
                  />
                  <span className="text-[12px] text-[#1f2329]">秒</span>
                </div>
              </Field>

            </>
          )}
        </Section>
      </div>

      {/* 底部操作栏 */}
      <div className="shrink-0 h-14 border-t border-[#e5e6eb] bg-white px-6 flex items-center justify-end gap-2">
        <button
          onClick={onBack}
          className="h-8 px-4 rounded-[2px] border border-[#d9dce3] bg-white text-[12px] text-[#1f2329] hover:border-[#1668ff] hover:text-[#1668ff]"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="h-8 px-4 rounded-[2px] bg-[#1668ff] text-[12px] text-white hover:bg-[#3c7eff]"
        >
          {mode === 'edit' ? '确定' : '创建'}
        </button>
      </div>
    </div>
  )
}

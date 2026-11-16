/**
 * 内部推理服务详情 (按图 1:1 还原)
 * 由列表页点击服务卡片进入；页头返回箭头回到列表
 */
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Boxes,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Pencil,
  Play,
  RefreshCw,
  Square,
  Trash2,
} from 'lucide-react'
import { InfoDot, StatusBadge } from './_shared'
import { NewTag } from './feature-tags'
import { cn } from '@/lib/utils'

import type { ElasticDetail } from './index'

export interface DetailService {
  /** 弹性配置 */
  elastic: ElasticDetail
  id: string
  name: string
  status: 'off' | 'running'
  servingId: string
  framework: string
  /** 部署模式: 简易模式 / 分布式并行 */
  deployMode: string
  /** 模型并行度, 简易模式固定 1 */
  tensorParallel: string
  /** 弹性模式: 常规模式 / Serverless 模式 */
  elasticMode: string
  /** 模型副本数 */
  modelReplicas: string
  priority: string
  creator: string
  createdAt: string
  pool: string
  network: string
  /** 模型名称 (去掉「官方」前缀) */
  modelName: string
  modelBranch: string
  modelVersion: string
  /** 规格行 */
  spec: {
    model: string
    virt: string
    cards: string
    ratio: string
    memory: string
    arch: string
    cpu: string
    ram: string
    disk: string
    oversub: string
    net: string
  }
}

const BASE_TABS = ['基本信息', '资源监控', '容器组', '日志', '事件']

// ---------- 容器组 ----------

function ContainerGroupTab({ svc }: { svc: DetailService }) {
  const rows = [
    {
      name: `${svc.servingId}-86vm6`,
      status: svc.status === 'running' ? '运行中' : '已停止',
      node: 'k8s-17',
      ip: '10.10.236.83',
      createdAt: '2 小时前',
    },
  ]

  return (
    <div className="py-3">
      <div className="rounded-[2px] border border-[#e5e6eb] overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#f7f8fa] text-[#1f2329]">
              <th className="px-3 py-2.5 text-left font-normal">名称</th>
              <th className="px-3 py-2.5 text-left font-normal">状态</th>
              <th className="px-3 py-2.5 text-left font-normal">节点</th>
              <th className="px-3 py-2.5 text-left font-normal">IP 地址</th>
              <th className="px-3 py-2.5 text-left font-normal">创建时间</th>
              <th className="px-3 py-2.5 text-left font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-[#f0f1f3]">
                <td className="px-3 py-3 text-[#1f2329]">{r.name}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[#52c41a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#52c41a]" />
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-[#1f2329]">{r.node}</td>
                <td className="px-3 py-3 text-[#1f2329]">{r.ip}</td>
                <td className="px-3 py-3 text-[#1f2329]">{r.createdAt}</td>
                <td className="px-3 py-3">
                  <button className="text-[#1668ff] hover:underline">日志</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------- 日志 ----------

const LOG_LINES = [
  '2026-10-26T06:18:27.769163160Z [2026-10-25 23:18:27] Prefill batch, #new-seq: 1, #new-token: 1, #cached-token: 0, full token usage: 0.00, mamba usage: 0.00, #running-req: 0, #queue-req: 0, input throughput (token/s): 0.07, cuda graph: False',
  '2026-10-26T06:18:28.711312022Z [2026-10-25 23:18:28] INFO:     10.4.13.17:39214 - "GET /health_generate HTTP/1.1" 200 OK',
  '2026-10-26T06:18:42.429348897Z [2026-10-25 23:18:42] Prefill batch, #new-seq: 1, #new-token: 1, #cached-token: 0, full token usage: 0.00, mamba usage: 0.00, #running-req: 0, #queue-req: 0, input throughput (token/s): 0.07, cuda graph: False',
  '2026-10-26T06:18:42.710948666Z [2026-10-25 23:18:42] INFO:     10.4.13.17:41462 - "GET /health_generate HTTP/1.1" 200 OK',
  '2026-10-26T06:18:49.819693209Z [2026-10-25 23:18:49] INFO:     10.10.236.175:51816 - "GET /metrics HTTP/1.1" 200 OK',
  '2026-10-26T06:18:57.601536317Z [2026-10-25 23:18:57] Prefill batch, #new-seq: 1, #new-token: 1, #cached-token: 0, full token usage: 0.00, mamba usage: 0.00, #running-req: 0, #queue-req: 0, input throughput (token/s): 0.07, cuda graph: False',
  '2026-10-26T06:18:57.712759979Z [2026-10-25 23:18:57] INFO:     10.4.13.17:42014 - "GET /health_generate HTTP/1.1" 200 OK',
  '2026-10-26T06:19:12.905913540Z [2026-10-25 23:19:12] Prefill batch, #new-seq: 1, #new-token: 1, #cached-token: 0, full token usage: 0.00, mamba usage: 0.00, #running-req: 0, #queue-req: 0, input throughput (token/s): 0.07, cuda graph: False',
  '2026-10-26T06:19:13.711674943Z [2026-10-25 23:19:13] INFO:     10.4.13.17:52084 - "GET /health_generate HTTP/1.1" 200 OK',
  '2026-10-26T06:19:19.818876250Z [2026-10-25 23:19:19] INFO:     10.10.236.175:60400 - "GET /metrics HTTP/1.1" 200 OK',
  '2026-10-26T06:19:27.813398773Z [2026-10-25 23:19:27] Prefill batch, #new-seq: 1, #new-token: 1, #cached-token: 0, full token usage: 0.00, mamba usage: 0.00, #running-req: 0, #queue-req: 0, input throughput (token/s): 0.07, cuda graph: False',
  '2026-10-26T06:19:28.711092414Z [2026-10-25 23:19:28] INFO:     10.4.13.17:43120 - "GET /health_generate HTTP/1.1" 200 OK',
  '2026-10-26T06:19:42.165395272Z [2026-10-25 23:19:42] Prefill batch, #new-seq: 1, #new-token: 1, #cached-token: 0, full token usage: 0.00, mamba usage: 0.00, #running-req: 0, #queue-req: 0, input throughput (token/s): 0.07, cuda graph: False',
  '2026-10-26T06:19:42.714921342Z [2026-10-25 23:19:42] INFO:     10.4.13.17:36422 - "GET /health_generate HTTP/1.1" 200 OK',
  '2026-10-26T06:19:49.819497824Z [2026-10-25 23:19:49] INFO:     10.10.236.175:34232 - "GET /metrics HTTP/1.1" 200 OK',
  '2026-10-26T06:19:57.830368154Z [2026-10-25 23:19:57] Prefill batch, #new-seq: 1, #new-token: 1, #cached-token: 0, full token usage: 0.00, mamba usage: 0.00, #running-req: 0, #queue-req: 0, input throughput (token/s): 0.06, cuda graph: False',
  '2026-10-26T06:19:58.709679099Z [2026-10-25 23:19:58] INFO:     10.4.13.17:52928 - "GET /health_generate HTTP/1.1" 200 OK',
]

function LogsTab({ svc }: { svc: DetailService }) {
  const [group, setGroup] = useState('')
  const [container, setContainer] = useState('')
  const hasLogs = Boolean(group && container)

  return (
    <div className="py-3">
      {/* 选择器 */}
      <div className="flex items-center gap-6 text-[12px] text-[#1f2329]">
        <div className="flex items-center gap-2">
          <span className="text-[#646a73]">选择容器组:</span>
          <div className="relative">
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="h-8 w-[240px] appearance-none rounded-[2px] border border-[#d9dce3] bg-white pl-2.5 pr-8 text-[12px] text-[#1f2329] outline-none focus:border-[#1668ff]"
            >
              <option value="">选择容器组</option>
              <option value="ct">{`${svc.servingId}-86vm6`}</option>
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f959e]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#646a73]">选择容器:</span>
          <div className="relative">
            <select
              value={container}
              onChange={(e) => setContainer(e.target.value)}
              className="h-8 w-[240px] appearance-none rounded-[2px] border border-[#d9dce3] bg-white pl-2.5 pr-8 text-[12px] text-[#1f2329] outline-none focus:border-[#1668ff]"
            >
              <option value="">选择容器</option>
              <option value="sglang">sglang</option>
              <option value="vllm">vllm</option>
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f959e]"
            />
          </div>
        </div>
      </div>

      {/* 日志面板 */}
      <div className="relative mt-3 h-[560px] overflow-hidden rounded-[2px] bg-[#1e1e1e]">
        <div className="flex items-center gap-2 px-3 pt-2.5">
          <input
            placeholder="搜索日志（支持正则表达式，如：/error"
            className="h-7 flex-1 rounded-[2px] border border-[#4a4a4a] bg-transparent px-2.5 text-[12px] text-[#d9d9d9] outline-none placeholder:text-[#8c8c8c] focus:border-[#1668ff]"
          />
          <button className="h-7 rounded-[2px] bg-[#1668ff] px-3 text-[12px] text-white hover:bg-[#3c7eff]">
            全屏
          </button>
          <button className="h-7 rounded-[2px] bg-[#1668ff] px-3 text-[12px] text-white hover:bg-[#3c7eff]">
            下载日志
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 top-12 overflow-auto px-3 py-2">
          {hasLogs ? (
            <div className="space-y-0.5 whitespace-pre font-mono text-[11px] leading-5 text-[#d9d9d9]">
              {LOG_LINES.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ) : (
            <div className="font-mono text-[11px] text-[#d9d9d9]">暂无日志...</div>
          )}
        </div>

        {/* 滚动按钮 */}
        <div className="absolute bottom-3 right-6 flex flex-col items-center gap-4">
          <button className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3a3a3a] text-[#d9d9d9] hover:bg-[#4a4a4a]">
            <ChevronUp size={12} />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3a3a3a] text-[#d9d9d9] hover:bg-[#4a4a4a]">
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- 资源监控 ----------

const Y_TICKS = ['100', '80', '60', '40', '20', '0']
const X_TICKS = ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00', '15:10', '15:20', '15:30', '15:40', '15:50']

/** 深色图表框 */
function ChartFrame({
  title,
  legend,
  empty,
}: {
  title: string
  legend?: string
  empty?: boolean
}) {
  return (
    <div className="relative h-[212px] rounded-[2px] bg-[#161616] overflow-hidden">
      <div className="pt-2 text-center text-[11px] text-[#d9d9d9]">{title}</div>
      {empty ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[12px] text-[#8c8c8c]">No data</span>
        </div>
      ) : (
        <div className="absolute left-0 right-0 bottom-8 top-8 flex">
          {/* Y 轴 */}
          <div className="w-9 shrink-0 flex flex-col justify-between pb-4 pr-1 text-right text-[9px] text-[#8c8c8c]">
            {Y_TICKS.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          {/* 绘图区 */}
          <div className="relative flex-1 min-w-0 mr-2">
            {Y_TICKS.map((t, i) => (
              <div
                key={t}
                className="absolute left-0 right-0 border-t border-[#2b2b2b]"
                style={{ top: `${(i / (Y_TICKS.length - 1)) * 100}%` }}
              />
            ))}
            {X_TICKS.map((t, i) => (
              <div
                key={t}
                className="absolute top-0 bottom-0 border-l border-[#232323]"
                style={{ left: `${(i / (X_TICKS.length - 1)) * 100}%` }}
              />
            ))}
            {/* X 轴刻度 */}
            <div className="absolute left-0 right-0 -bottom-4 flex justify-between text-[9px] text-[#8c8c8c]">
              {X_TICKS.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      {legend && (
        <div className="absolute left-3 bottom-1 flex items-center gap-1.5 text-[10px] text-[#bfbfbf]">
          <span className="inline-block h-[2px] w-3 rounded-sm bg-[#52c41a]" />
          {legend}
        </div>
      )}
    </div>
  )
}

/** 指标小标题 */
function MetricTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-1 text-[13px] font-medium text-[#1f2329]">
      {children}
      <InfoDot />
    </div>
  )
}

/** 资源监控 Tab 内容 */
function ResourceMonitor({ framework }: { framework: string }) {
  const isKt = framework === 'KTransformer'
  const segments = isKt ? ['服务性能'] : ['Ray 集群', 'vLLM']
  const [seg, setSeg] = useState(0)

  return (
    <div className="py-3">
      {/* 工具条 */}
      <div className="flex items-center gap-2">
        <div className="inline-flex h-7 overflow-hidden rounded-[2px] border border-[#d9dce3]">
          {segments.map((sg, i) => (
            <button
              key={sg}
              onClick={() => setSeg(i)}
              className={cn(
                'px-3 text-[12px]',
                i === seg ? 'bg-[#1668ff] text-white' : 'bg-white text-[#1f2329]',
                i > 0 && 'border-l border-[#d9dce3]',
              )}
            >
              {sg}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex h-7 items-center gap-2 rounded-[2px] border border-[#d9dce3] px-2.5 text-[12px] text-[#1f2329]">
            <Clock size={12} className="text-[#8f959e]" />
            2026/10/26 13:52:57
            <span className="text-[#8f959e]">至</span>
            2026/10/26 15:52:57
          </div>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-[#d9dce3] text-[#646a73] hover:border-[#1668ff] hover:text-[#1668ff]"
            title="刷新"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {isKt ? (
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <MetricTitle>端到端请求延迟</MetricTitle>
              <ChartFrame title="End-to-End Request Latency" empty />
            </div>
            <div>
              <MetricTitle>首个 Token 出现的延迟（TTFT）</MetricTitle>
              <ChartFrame title="Time-To-First-Token Latency" empty />
            </div>
            <div>
              <MetricTitle>Token间延迟（TPOT）</MetricTitle>
              <ChartFrame title="Time-Per-Output-Token (TPOT) Latency (ms/token)" empty />
            </div>
            <div>
              <MetricTitle>平均 token 吞吐量</MetricTitle>
              <ChartFrame title="Token Generation Throughput (Tokens / S)" legend="Token Generation Throughput" />
            </div>
          </div>
          <div className="max-w-[calc(50%-0.5rem)]">
            <MetricTitle>请求排队数</MetricTitle>
            <ChartFrame title="Number Queued Requests" legend="Queued Requests" />
          </div>
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-[13px] text-[#1f2329]">
            该错误可能由于域名未解析或平台私有证书未信任导致，请点击如下链接
          </p>
          <p className="mt-2">
            <button className="text-[13px] text-[#1668ff] hover:underline">点击跳转链接</button>
          </p>
          <p className="mt-1 text-[13px] text-[#1f2329]">如已处理请刷新页面</p>
          <button className="mt-3 inline-flex h-7 items-center gap-1 rounded-[2px] bg-[#1668ff] px-3 text-[12px] text-white hover:bg-[#3c7eff]">
            <RefreshCw size={12} />
            刷新
          </button>
        </div>
      )}
    </div>
  )
}

/** 概要信息单元格 */
function Cell({ label, value, link }: { label: string; value?: string; link?: boolean }) {
  return (
    <div className="flex min-w-0 gap-2">
      <span className="shrink-0 text-[#8f959e]">{label}:</span>
      {link ? (
        <button className="flex items-center gap-1 text-[#1668ff] hover:underline">
          打开控制台
          <ExternalLink size={11} />
        </button>
      ) : (
        <span className="min-w-0 truncate text-[#1f2329]">{value}</span>
      )}
    </div>
  )
}

/** 信息行: 左标签 + 右值 */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex text-[12px] leading-7">
      <span className="w-[168px] shrink-0 text-[#646a73]">{label}</span>
      <span className="min-w-0 text-[#1f2329]">{children}</span>
    </div>
  )
}

/** 详情分区: 标题 + 内容, 底部浅分割线 */
function Section({
  title,
  tag,
  children,
}: {
  title: string
  tag?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mt-1 pb-3 border-b border-[#f0f1f3]">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[#1f2329] leading-8">
        {title}
        {tag}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </section>
  )
}

const SPEC_COLS = [
  '算力型号',
  '虚拟化类型',
  '算力数量',
  '算力比例',
  '显存',
  '系统架构',
  'CPU',
  '内存',
  '系统盘',
  '显存超分',
  '高速网络',
]

export function ServiceDetail({
  svc,
  onBack,
  onEdit,
  initialTab,
}: {
  svc: DetailService
  onBack: () => void
  onEdit?: () => void
  initialTab?: string
}) {
  const [tab, setTab] = useState(initialTab ?? '基本信息')
  const running = svc.status === 'running'
  const tabs = BASE_TABS

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
        <h1 className="text-[14px] font-medium text-[#1f2329]">内部推理服务详情</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-3">
        {/* 概要卡片 */}
        <div className="rounded-[2px] border border-[#e5e6eb] bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-[#eef2ff] border border-[#dbe4ff] flex items-center justify-center shrink-0">
              <Boxes size={18} className="text-[#5b5bd6]" />
            </div>
            <span className="text-[15px] font-medium text-[#1f2329]">{svc.name}</span>
            <StatusBadge status={svc.status} />
          </div>

          <div className="mt-3 flex gap-8 text-[12px]">
            <div className="flex-1 min-w-0 space-y-2.5">
              <Cell label="服务ID" value={svc.servingId} />
              <Cell label="部署场景" value="中心部署" />
              <Cell label="推理框架" value={svc.framework} />
            </div>
            <div className="flex-1 min-w-0 space-y-2.5">
              <Cell label="Ray 控制台" link />
              <Cell label="高速网络" value={svc.network} />
              <Cell label="创建人" value={svc.creator} />
            </div>
            <div className="flex-1 min-w-0 space-y-2.5">
              <Cell label="创建时间" value={svc.createdAt} />
              <Cell label="资源池" value={svc.pool} />
              <Cell label="描述" value="-" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              className={cn(
                'h-7 px-3 rounded-[2px] border border-[#d9dce3] bg-white text-[12px] text-[#1f2329]',
                'flex items-center gap-1 hover:border-[#1668ff] hover:text-[#1668ff]',
              )}
            >
              {running ? <Square size={11} /> : <Play size={11} />}
              {running ? '停止' : '启动'}
            </button>
            <button
              onClick={onEdit}
              className="h-7 px-3 rounded-[2px] border border-[#d9dce3] bg-white text-[12px] text-[#1f2329] flex items-center gap-1 hover:border-[#1668ff] hover:text-[#1668ff]"
            >
              <Pencil size={11} />
              编辑
            </button>
            <button className="h-7 px-3 rounded-[2px] border border-[#d9dce3] bg-white text-[12px] text-[#1f2329] flex items-center gap-1 hover:border-[#f53f3f] hover:text-[#f53f3f]">
              <Trash2 size={11} />
              删除
            </button>
            <button
              className="h-7 w-7 rounded-[2px] border border-[#d9dce3] bg-white flex items-center justify-center text-[#646a73] hover:border-[#1668ff] hover:text-[#1668ff]"
              title="刷新"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Tab + 内容面板 */}
        <div className="mt-3 rounded-[2px] border border-[#e5e6eb] bg-white">
        <div className="h-9 flex items-stretch bg-[#f4f4f5] border-b border-[#e5e6eb]">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 text-[13px] transition-colors',
                tab === t
                  ? 'bg-[#1668ff] text-white'
                  : 'text-[#1f2329] hover:text-[#1668ff]',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-5 py-1">
        {tab === '资源监控' ? (
          <ResourceMonitor framework={svc.framework} />
        ) : tab === '容器组' ? (
          <ContainerGroupTab svc={svc} />
        ) : tab === '日志' ? (
          <LogsTab svc={svc} />
        ) : tab !== '基本信息' ? (
          <div className="py-16 text-center text-[12px] text-[#8f959e]">暂无数据</div>
        ) : (
          <div className="pt-2">
            <Section title="模型信息">
              <Row label="模型名称">{svc.modelName}</Row>
              <Row label="模型分支">{svc.modelBranch}</Row>
              <Row label="服务模型名称">{svc.modelName}</Row>
              <Row label="服务模型版本">{svc.modelVersion}</Row>
              <Row label="模型服务上下文长度">-</Row>
            </Section>

            <Section title="调度配置">
              <Row label="负载优先级">
                <span className="inline-flex items-center rounded-[2px] bg-[#f2f3f5] px-1.5 text-[11px] leading-5 text-[#4e5969]">
                  {svc.priority}
                </span>
              </Row>
              <Row label="组调度">禁用</Row>
              <Row label="拓扑感知调度">
                <div className="leading-7">
                  <div>节点拓扑亲和: 无</div>
                  <div>节点内拓扑亲和: 无</div>
                </div>
              </Row>
              <Row label="指定加速卡调度">未指定</Row>
            </Section>

            <Section title="分布式部署">
              <Row label="部署模式">{svc.deployMode}</Row>
              <Row label="TP并行">{svc.tensorParallel}</Row>
            </Section>

            <Section
              title="弹性伸缩"
              tag={svc.elastic.mode === '指标模式' ? <NewTag code="F-DETAIL" /> : undefined}
            >
              <Row label="弹性模式">{svc.elastic.mode}</Row>


              {svc.elastic.mode === '指标模式' && (
                <>
                  <Row label="指标来源">{svc.elastic.source}</Row>
                  {svc.elastic.source === '内置指标' ? (
                    <>
                      <Row label="伸缩条件">
                        <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                          {svc.elastic.conditions?.map((c, i) => (
                            <span key={c.text} className="inline-flex items-center gap-1.5">
                              {i > 0 && (
                                <span className="inline-flex h-4 items-center rounded-[2px] border border-[#b9d4ff] bg-[#eef4ff] px-1 text-[10px] font-medium text-[#1668ff]">
                                  {svc.elastic.join === 'and' ? '且' : '或'}
                                </span>
                              )}
                              <span className="inline-flex h-5 items-center rounded-[2px] border border-[#e5e6eb] bg-[#f7f8fa] px-1.5 text-[12px] text-[#1f2329]">
                                {c.text}
                              </span>
                            </span>
                          ))}
                        </div>
                      </Row>
                      <Row label="聚合方式">{svc.elastic.agg}</Row>
                    </>
                  ) : (
                    <>
                      <Row label="指标表达式">
                        <code className="break-all rounded-[2px] bg-[#f7f8fa] px-1.5 py-0.5 font-mono text-[11px]">
                          {svc.elastic.expr}
                        </code>
                      </Row>
                    </>
                  )}
                  <Row label="最小模型副本数">{svc.elastic.minReplicas}</Row>
                  <Row label="最大模型副本数">{svc.elastic.maxReplicas}</Row>
                  <Row label="缩容检测窗口">{svc.elastic.shrinkWindow}</Row>
                </>
              )}

              {svc.elastic.mode === 'Serverless 模式' && (
                <>
                  <Row label="最小模型副本数">{svc.elastic.minReplicas}</Row>
                  <Row label="最大模型副本数">{svc.elastic.maxReplicas}</Row>
                  <Row label="缩容检测窗口">{svc.elastic.shrinkWindow}</Row>
                  <Row label="目标请求数">{svc.elastic.targetRequests}</Row>
                  <Row label="最大请求数">{svc.elastic.maxRequests}</Row>
                </>
              )}

              {svc.elastic.mode === '常规模式' && <Row label="模型副本数">{svc.elastic.replicas}</Row>}
            </Section>

            <section className="mt-1 pb-4">
              <h3 className="text-[13px] font-semibold text-[#1f2329] leading-8">规格信息</h3>
              <div className="overflow-x-auto rounded-[2px] border border-[#e5e6eb]">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[#f7f8fa] text-[#8f959e]">
                      {SPEC_COLS.map((c) => (
                        <th key={c} className="whitespace-nowrap px-3 py-2 text-left font-normal">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#f0f1f3]">
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.model}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.virt}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.cards}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.ratio}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.memory}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.arch}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.cpu}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.ram}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.disk}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.oversub}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[#1f2329]">{svc.spec.net}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  )
}

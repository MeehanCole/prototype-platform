import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Check,
  Database,
  Gauge,
  HardDrive,
  Pencil,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { QuotaConfigSection } from './QuotaConfigSection'
import { updatePlatformSettings, usePlatformSettings } from './store'

type MetricKey =
  | 'environmentLimit'
  | 'subagentConcurrency'
  | 'idleReclaim'
  | 'responseTimeout'
  | 'sessionCleanup'
  | 'auditRetention'

interface Metric {
  key: MetricKey
  label: string
  value: number
  unit: string
  description: string
}

const INITIAL_METRICS: Metric[] = [
  {
    key: 'environmentLimit',
    label: '执行环境数量上限',
    value: 50,
    unit: '个',
    description: '所有用户共享，包含预热和清理中的环境。',
  },
  {
    key: 'subagentConcurrency',
    label: '单轮子智能体并发上限',
    value: 4,
    unit: '个',
    description: '同一轮次可同时运行的子智能体数量。',
  },
  {
    key: 'idleReclaim',
    label: '闲置回收时间',
    value: 15,
    unit: '分钟',
    description: '仅回收符合条件的环境，不打断运行中的操作。',
  },
  {
    key: 'responseTimeout',
    label: '用户响应时限',
    value: 30,
    unit: '分钟',
    description: '审批和问题卡片等待用户处理的最长时间。',
  },
  {
    key: 'sessionCleanup',
    label: '会话自动清理',
    value: 30,
    unit: '天',
    description: '超过期限的会话与执行记录将自动清理。',
  },
  {
    key: 'auditRetention',
    label: '审计保留期限',
    value: 180,
    unit: '天',
    description: '审计日志在到期前始终可查询。',
  },
]

/** 参数配置：平台运行资源、存储保留与知识库容量配额 */
export function ConfigManagementPage() {
  const settings = usePlatformSettings()
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS)
  const [editingKey, setEditingKey] = useState<MetricKey | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const beginEdit = (metric: Metric) => {
    setEditingKey(metric.key)
    setEditingValue(String(metric.value))
  }

  const saveEdit = () => {
    if (!editingKey || !editingValue.trim()) return
    const value = Number(editingValue)
    if (!Number.isFinite(value) || value < 1) return
    setMetrics((current) =>
      current.map((metric) => (metric.key === editingKey ? { ...metric, value } : metric)),
    )
    setEditingKey(null)
    setEditingValue('')
  }

  const runMetrics = metrics.filter((item) =>
    ['environmentLimit', 'subagentConcurrency', 'idleReclaim', 'responseTimeout'].includes(item.key),
  )
  const retentionMetrics = metrics.filter((item) =>
    ['sessionCleanup', 'auditRetention'].includes(item.key),
  )

  const renderMetric = (item: Metric) => (
    <div key={item.key} className="flex min-h-[112px] items-start justify-between gap-[16px] px-[20px] py-[18px]">
      <div className="min-w-0">
        <div className="text-[13px] text-[#4E5969]">{item.label}</div>
        {editingKey === item.key ? (
          <div className="mt-[8px] flex items-center gap-[6px]">
            <input
              autoFocus
              type="number"
              min={1}
              value={editingValue}
              onChange={(event) => setEditingValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveEdit()
                if (event.key === 'Escape') setEditingKey(null)
              }}
              className="h-[30px] w-[90px] rounded-[3px] border border-[#166EFF] px-[8px] text-[14px] text-[#1D2129] outline-none"
            />
            <span className="text-[12px] text-[#86909C]">{item.unit}</span>
            <button
              type="button"
              onClick={saveEdit}
              className="ml-[2px] flex h-[24px] w-[24px] items-center justify-center rounded-[3px] text-[#00B42A] hover:bg-[#E8FFEA]"
              title="保存"
            >
              <Check className="h-[14px] w-[14px]" />
            </button>
            <button
              type="button"
              onClick={() => setEditingKey(null)}
              className="flex h-[24px] w-[24px] items-center justify-center rounded-[3px] text-[#86909C] hover:bg-[#F2F3F5]"
              title="取消"
            >
              <X className="h-[14px] w-[14px]" />
            </button>
          </div>
        ) : (
          <div className="mt-[6px] text-[20px] font-medium leading-[26px] text-[#1D2129]">
            {item.value}
            <span className="ml-[4px] text-[13px] font-normal text-[#4E5969]">{item.unit}</span>
          </div>
        )}
        <p className="mt-[6px] text-[12px] leading-[18px] text-[#86909C]">{item.description}</p>
      </div>
      <button
        type="button"
        onClick={() => beginEdit(item)}
        className="mt-[2px] flex shrink-0 items-center gap-[4px] text-[12px] text-[#166EFF] hover:underline"
      >
        <Pencil className="h-[11px] w-[11px]" />
        编辑
      </button>
    </div>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-[#E5E6EB] px-[24px] pt-[18px]">
        <h1 className="text-[17px] font-semibold text-[#1D2129]">参数配置</h1>
        <p className="mt-[4px] text-[12px] text-[#86909C]">
          管理运行资源、审批策略与审计留存等平台配置
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F5F7FA] px-[24px] py-[18px]">
        <div className="space-y-[16px]">
          {/* 运行资源 */}
          <section className="overflow-hidden rounded-[5px] border border-[#E5E6EB] bg-white">
            <div className="flex items-center gap-[8px] border-b border-[#E5E6EB] px-[20px] py-[14px]">
              <SlidersHorizontal className="h-[16px] w-[16px] text-[#166EFF]" />
              <h2 className="text-[14px] font-medium text-[#1D2129]">运行资源</h2>
            </div>
            <div className="px-[20px] pt-[14px]">
              <div className="flex flex-wrap items-center gap-x-[28px] gap-y-[8px] rounded-[3px] bg-[#F7F8FA] px-[14px] py-[11px] text-[12px]">
                <span className="text-[#4E5969]">每个执行环境的申请量</span>
                <span className="text-[#86909C]">
                  CPU <span className="text-[#1D2129]">0.2</span> 核
                </span>
                <span className="text-[#86909C]">
                  内存 <span className="text-[#1D2129]">256</span> MiB
                </span>
              </div>
            </div>
            <div className="mt-[14px] grid grid-cols-1 border-t border-[#E5E6EB] md:grid-cols-2">
              {runMetrics.map((item, index) => (
                <div
                  key={item.key}
                  className={`border-b border-[#E5E6EB] ${
                    index % 2 === 0 ? 'md:border-r' : ''
                  }`}
                >
                  {renderMetric(item)}
                </div>
              ))}
            </div>
          </section>

          {/* 存储管理 */}
          <section className="overflow-hidden rounded-[5px] border border-[#E5E6EB] bg-white">
            <div className="flex items-center gap-[8px] border-b border-[#E5E6EB] px-[20px] py-[14px]">
              <Database className="h-[16px] w-[16px] text-[#166EFF]" />
              <h2 className="text-[14px] font-medium text-[#1D2129]">存储管理</h2>
            </div>

            <div className="grid grid-cols-1 gap-[16px] px-[20px] py-[18px] xl:grid-cols-2">
              <StorageCard
                icon={<Database className="h-[16px] w-[16px] text-[#166EFF]" />}
                title="数据库"
                used="89.4 MiB"
                other="233.94 GiB"
                free="56.96 GiB"
                ownUsed="201.44 MiB"
                ownLabel="数据库占用"
                barWidth="w-[37%]"
                barColor="bg-[#1D4ED8]"
              />
              <StorageCard
                icon={<HardDrive className="h-[16px] w-[16px] text-[#166EFF]" />}
                title="对象存储"
                used="18.47 MiB"
                other="234.11 GiB"
                free="56.96 GiB"
                ownUsed="31.54 MiB"
                ownLabel="对象存储占用"
                barWidth="w-[79%]"
                barColor="bg-[#7DA6FF]"
              />
            </div>

            <div className="grid grid-cols-1 border-t border-[#E5E6EB] md:grid-cols-2">
              {retentionMetrics.map((item, index) => (
                <div key={item.key} className={`border-b border-[#E5E6EB] ${index === 0 ? 'md:border-r' : ''}`}>
                  {renderMetric(item)}
                </div>
              ))}
            </div>
          </section>

          {/* 容量与配额 */}
          <section className="overflow-hidden rounded-[5px] border border-[#E5E6EB] bg-white">
            <div className="flex items-center gap-[8px] border-b border-[#E5E6EB] px-[20px] py-[14px]">
              <Gauge className="h-[16px] w-[16px] text-[#166EFF]" />
              <h2 className="text-[14px] font-medium text-[#1D2129]">容量与配额</h2>
              <span className="ml-auto rounded-[3px] bg-[#F2F3F5] px-[7px] py-[2px] text-[11px] text-[#4E5969]">
                保存后立即生效
              </span>
            </div>
            <div className="px-[20px] py-[18px]">
              <QuotaConfigSection
                config={settings.quota}
                onChange={(quota) => updatePlatformSettings({ quota })}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function StorageCard({
  icon,
  title,
  used,
  ownLabel,
  ownUsed,
  other,
  free,
  barWidth,
  barColor,
}: {
  icon: ReactNode
  title: string
  used: string
  ownLabel: string
  ownUsed: string
  other: string
  free: string
  barWidth: string
  barColor: string
}) {
  return (
    <div className="rounded-[5px] border border-[#E5E6EB] p-[16px]">
      <div className="flex items-center gap-[7px]">
        {icon}
        <span className="text-[13px] font-medium text-[#1D2129]">{title}</span>
      </div>
      <div className="mt-[10px] text-[21px] font-semibold leading-[28px] text-[#1D2129]">{used}</div>
      <div className="mt-[14px] h-[10px] overflow-hidden rounded-full bg-[#E8F0FF]">
        <div className={`h-full rounded-full ${barWidth} ${barColor}`} />
      </div>
      <div className="mt-[7px] flex items-center justify-between text-[11px] text-[#86909C]">
        <span>{ownLabel}</span>
        <span>总容量 291.1 GiB</span>
      </div>
      <div className="mt-[14px] flex flex-wrap items-center gap-x-[18px] gap-y-[6px] text-[12px] text-[#4E5969]">
        <LegendDot className="bg-[#1D4ED8]" label={ownLabel} value={ownUsed} />
        <LegendDot className="bg-[#E8F0FF]" label="其他占用" value={other} />
        <LegendDot className="bg-[#F2F3F5] border border-[#D9DEE7]" label="可用空间" value={free} />
      </div>
    </div>
  )
}

function LegendDot({
  className,
  label,
  value,
}: {
  className: string
  label: string
  value: string
}) {
  return (
    <span className="inline-flex items-center gap-[5px]">
      <span className={`h-[7px] w-[7px] rounded-full ${className}`} />
      <span className="text-[#86909C]">{label}</span>
      <span className="text-[#1D2129]">{value}</span>
    </span>
  )
}
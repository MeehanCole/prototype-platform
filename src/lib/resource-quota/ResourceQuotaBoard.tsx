/**
 * 可复用资源配额展示组件.
 *
 * 只负责渲染集群配额卡片、表格、刷新与编辑入口，不依赖路由、全局 store
 * 或业务页面路径。业务数据由调用方通过 props 传入。
 */
import type { ReactNode } from 'react'
import { Pencil, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ResourceKind = 'cpu' | 'mem' | 'storage' | 'gpu' | 'other'

export type ResourceIconKind = 'cpu' | 'mem' | null

export interface ResourceQuotaRow {
  /** 行标识，用于 key 和调用方回写映射 */
  key: string
  /** 资源类型展示名，例如 CPU 限制 / 内存请求 */
  label: string
  /** 单位选择依据，默认 CPU 为核、内存为 GiB */
  kind: ResourceKind
  /** 已使用量；null 表示不限制形态下的占位 */
  used: number | null
  /** 配额；null 表示不限制 */
  quota: number | null
  /** 行首图标；不传时按 key 推断 cpuLimit / memLimit */
  icon?: ResourceIconKind
}

export interface ResourceQuotaCluster {
  id: string
  name: string
  code: string
  rows: ResourceQuotaRow[]
}

export interface ResourceQuotaColumns {
  resource: string
  used: string
  quota: string
  remaining: string
}

export interface ResourceQuotaBoardProps {
  clusters: ResourceQuotaCluster[]
  /** 页面主标题，传入后渲染 h1 */
  title?: ReactNode
  /** 页面说明，传入后渲染在 h1 下方 */
  description?: ReactNode
  /** 分组标题 */
  sectionTitle?: ReactNode
  /** 分组标题右侧插槽，可放 NewTag 等批注 */
  sectionExtra?: ReactNode
  /** 集群标题前缀，默认「集群」 */
  clusterLabel?: string
  /** 编辑按钮文案 */
  editLabel?: string
  /** 上次刷新时间，用于按钮 title */
  refreshedAt?: string
  /** 是否展示刷新按钮 */
  showRefresh?: boolean
  /** 是否展示编辑按钮 */
  showEdit?: boolean
  /** 自定义列标题 */
  columns?: Partial<ResourceQuotaColumns>
  /** 自定义单位映射 */
  units?: Partial<Record<ResourceKind, string>>
  /** 自定义行首图标渲染 */
  renderIcon?: (row: ResourceQuotaRow) => ReactNode
  onRefresh?: () => void
  onEdit?: (cluster: ResourceQuotaCluster) => void
  className?: string
}

const DEFAULT_COLUMNS: ResourceQuotaColumns = {
  resource: '资源类型',
  used: '已使用',
  quota: '配额',
  remaining: '余量',
}

const DEFAULT_UNITS: Record<ResourceKind, string> = {
  cpu: '核',
  mem: 'GiB',
  storage: 'GB',
  gpu: '卡',
  other: '',
}

function defaultIcon(row: ResourceQuotaRow): ResourceIconKind {
  if (row.icon !== undefined) return row.icon
  const key = row.key.toLowerCase()
  if (key.includes('cpu') && key.includes('limit')) return 'cpu'
  if (key.includes('mem') && key.includes('limit')) return 'mem'
  return null
}

function ResourceIcon({ kind }: { kind: Exclude<ResourceIconKind, null> }) {
  if (kind === 'cpu') {
    return (
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-[#f2f3f5]">
        <svg width="13" height="13" viewBox="0 0 20 20" aria-hidden fill="none" stroke="#86909c" strokeWidth="1.5">
          <rect x="5" y="5" width="10" height="10" rx="1.5" />
          <rect x="8" y="8" width="4" height="4" rx="0.6" />
          <path d="M8 2.6v2.4M12 2.6v2.4M8 15v2.4M12 15v2.4M2.6 8H5M2.6 12H5M15 8h2.4M15 12h2.4" />
        </svg>
      </span>
    )
  }
  return (
    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-[#eaf7ef]">
      <svg width="13" height="13" viewBox="0 0 20 20" aria-hidden fill="none" stroke="#3fae74" strokeWidth="1.5">
        <rect x="2.8" y="6" width="14.4" height="8" rx="1.4" />
        <path d="M6.2 6V4m4 2V4m4 2V4M6.2 14v2m4-2v2m4-2v2M8 9.2h4" />
      </svg>
    </span>
  )
}

function cellText(row: ResourceQuotaRow, value: number | null, units: Partial<Record<ResourceKind, string>>) {
  if (value === null) return '不限制'
  const unit = units[row.kind] ?? DEFAULT_UNITS[row.kind]
  return unit ? `${value} ${unit}` : String(value)
}

function usagePercent(row: ResourceQuotaRow) {
  if (row.used === null || row.quota === null || row.quota === 0) return null
  return Math.min(100, Math.round((row.used / row.quota) * 100))
}

export interface ResourceQuotaClusterCardProps {
  cluster: ResourceQuotaCluster
  clusterLabel?: string
  editLabel?: string
  showEdit?: boolean
  columns?: ResourceQuotaColumns
  units?: Partial<Record<ResourceKind, string>>
  renderIcon?: (row: ResourceQuotaRow) => ReactNode
  onEdit?: () => void
}

export function ResourceQuotaClusterCard({
  cluster,
  clusterLabel = '集群',
  editLabel = '编辑配额',
  showEdit = true,
  columns = DEFAULT_COLUMNS,
  units = DEFAULT_UNITS,
  renderIcon,
  onEdit,
}: ResourceQuotaClusterCardProps) {
  return (
    <div className="rounded-[2px] border border-[#e5e6eb] bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-[15px] font-bold text-[#1d2129]">
          {clusterLabel}：{cluster.name}
          {cluster.code && <span className="ml-1 font-normal text-[#86909c]">（{cluster.code}）</span>}
        </h3>
        {showEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 items-center gap-1.5 rounded-[2px] bg-[#166eff] px-3 text-[13px] text-white transition-colors hover:bg-[#0d5fe0]"
          >
            <Pencil size={13} strokeWidth={2.2} />
            {editLabel}
          </button>
        )}
      </div>

      <div className="px-5 pb-5">
        <table className="w-full table-fixed border-collapse text-center">
          <thead>
            <tr className="bg-[#f7f8fa] text-[13px] text-[#4e5969]">
              <th className="w-[34%] px-4 py-2.5 font-normal">{columns.resource}</th>
              <th className="w-[22%] px-4 py-2.5 font-normal">{columns.used}</th>
              <th className="w-[22%] px-4 py-2.5 font-normal">{columns.quota}</th>
              <th className="w-[22%] px-4 py-2.5 font-normal">{columns.remaining}</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#1d2129]">
            {cluster.rows.map((row) => {
              const icon = renderIcon ? renderIcon(row) : defaultIcon(row)
              const remain = row.quota === null || row.used === null ? null : Math.max(0, row.quota - row.used)
              const percent = usagePercent(row)
              return (
                <tr key={row.key} className="border-b border-dashed border-[#e5e6eb] last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-center gap-2">
                      {icon && icon !== null ? (
                        typeof icon === 'string' ? (
                          <ResourceIcon kind={icon as Exclude<ResourceIconKind, null>} />
                        ) : (
                          icon
                        )
                      ) : (
                        <span className="h-[22px] w-[22px] shrink-0" />
                      )}
                      <span>{row.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.quota === null || row.used === null ? (
                      <span className="text-[#86909c]">-</span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="tabular-nums">{cellText(row, row.used, units)}</span>
                        {percent !== null && percent >= 80 && (
                          <span className="rounded-[2px] bg-[#fff1f0] px-1 text-[11px] text-[#f53f3f]">
                            {percent}%
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{cellText(row, row.quota, units)}</td>
                  <td className="px-4 py-3 tabular-nums">{cellText(row, remain, units)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ResourceQuotaBoard({
  clusters,
  title,
  description,
  sectionTitle = '资源配额',
  sectionExtra,
  clusterLabel = '集群',
  editLabel = '编辑配额',
  refreshedAt = '刚刚',
  showRefresh = true,
  showEdit = true,
  columns: columnsProp,
  units: unitsProp,
  renderIcon,
  onRefresh,
  onEdit,
  className,
}: ResourceQuotaBoardProps) {
  const columns = { ...DEFAULT_COLUMNS, ...columnsProp }
  const units = { ...DEFAULT_UNITS, ...unitsProp }

  return (
    <div className={cn('w-full', className)}>
      {title && <h1 className="text-[28px] font-bold leading-10 text-[#323232]">{title}</h1>}
      {description && <p className="mt-2 text-[14px] leading-6 text-[#aaaaaa]">{description}</p>}

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold text-[#1d2129]">{sectionTitle}</h2>
          {sectionExtra}
        </div>
        {showRefresh && (
          <button
            type="button"
            aria-label="刷新"
            title={`刷新（上次更新：${refreshedAt}）`}
            onClick={onRefresh}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#e5e6eb] bg-white text-[#4e5969] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
          >
            <RefreshCw size={15} />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {clusters.map((cluster) => (
          <ResourceQuotaClusterCard
            key={cluster.id}
            cluster={cluster}
            clusterLabel={clusterLabel}
            editLabel={editLabel}
            showEdit={showEdit}
            columns={columns}
            units={units}
            renderIcon={renderIcon}
            onEdit={() => onEdit?.(cluster)}
          />
        ))}
      </div>
    </div>
  )
}

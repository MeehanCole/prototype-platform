/**
 * 租户配额
 *
 * 布局与外壳（顶栏 66px / 侧栏 256px）复用 src/lib/platform-shell 通用件；
 * 主内容区按设计稿还原：标题 + 说明 + 「资源配额」分组 + 每个集群一张配额卡片。
 *
 * 「编辑配额」弹窗复用 src/lib/quota-dialog（与项目配额同一套弹窗）：
 *   设置配额（CPU / 内存 的 预留、限制）+ 高级设置（数据存储 + GPU 配额）。
 *   弹窗里只有 CPU / 内存 四项会回写到卡片表格，其余为演示用状态。
 *
 * 数据为 Mock：第一个集群给具体数值，第二个集群为「不限制」，用于覆盖两种展示形态。
 */
import { useState } from 'react'
import { Pencil, RefreshCw } from 'lucide-react'
import { PlatformHeader, SideNav } from './_shared'
import { QuotaDialog, createQuotaDraft } from '@/lib/quota-dialog'
import type { QuotaDraft } from '@/lib/quota-dialog'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

/* ---------------------------------- 类型 ---------------------------------- */

/** 资源行：CPU 与内存各分「限制 / 请求」两条，请求即预留 */
type ResourceKey = 'cpuLimit' | 'cpuRequest' | 'memLimit' | 'memRequest'

interface ResourceRow {
  key: ResourceKey
  label: string
  kind: 'cpu' | 'mem'
  /** 已使用量 */
  used: number
  /** 配额，null 表示不限制 */
  quota: number | null
}

interface ClusterQuota {
  id: string
  name: string
  /** 括号内的集群英文标识 */
  code: string
  rows: ResourceRow[]
}

const UNIT: Record<ResourceRow['kind'], string> = {
  cpu: '核',
  mem: 'GiB',
}

const ROW_LABEL: Record<ResourceKey, string> = {
  cpuLimit: 'CPU 限制',
  cpuRequest: 'CPU 请求',
  memLimit: '内存限制',
  memRequest: '内存请求',
}

/** 行前缀图标：CPU 限制与内存限制各有一个，请求行不重复展示 */
const ROW_ICON: Record<ResourceKey, 'cpu' | 'mem' | null> = {
  cpuLimit: 'cpu',
  cpuRequest: null,
  memLimit: 'mem',
  memRequest: null,
}

/* --------------------------------- Mock --------------------------------- */

/** 当前租户名（配额按集群分别设置，弹窗标题与上下文行都用它） */
const TENANT_NAME = 'magic-cs128'

const INITIAL_CLUSTERS: ClusterQuota[] = [
  {
    id: 'changsha-dc-cluster',
    name: '长沙智算中心',
    code: 'changsha-dc-cluster',
    rows: [
      { key: 'cpuLimit', label: ROW_LABEL.cpuLimit, kind: 'cpu', used: 96, quota: 128 },
      { key: 'cpuRequest', label: ROW_LABEL.cpuRequest, kind: 'cpu', used: 48, quota: 64 },
      { key: 'memLimit', label: ROW_LABEL.memLimit, kind: 'mem', used: 320, quota: 512 },
      { key: 'memRequest', label: ROW_LABEL.memRequest, kind: 'mem', used: 160, quota: 256 },
    ],
  },
  {
    id: 'host-cluster',
    name: '长沙实验室',
    code: 'host-cluster',
    rows: [
      { key: 'cpuLimit', label: ROW_LABEL.cpuLimit, kind: 'cpu', used: 8, quota: null },
      { key: 'cpuRequest', label: ROW_LABEL.cpuRequest, kind: 'cpu', used: 4, quota: null },
      { key: 'memLimit', label: ROW_LABEL.memLimit, kind: 'mem', used: 32, quota: null },
      { key: 'memRequest', label: ROW_LABEL.memRequest, kind: 'mem', used: 16, quota: null },
    ],
  },
]

/* -------------------------------- 工具函数 -------------------------------- */

/** 集群 + 当前行 → 弹窗草稿 */
function toDraft(cluster: ClusterQuota): QuotaDraft {
  const pick = (key: ResourceKey) => {
    const row = cluster.rows.find((item) => item.key === key)
    return row && row.quota !== null ? String(row.quota) : ''
  }
  const draft = createQuotaDraft(['容器组'])
  return {
    ...draft,
    cpuReserve: pick('cpuRequest'),
    cpuLimit: pick('cpuLimit'),
    memReserve: pick('memRequest'),
    memLimit: pick('memLimit'),
  }
}

/** 弹窗草稿 → 行数据（只有 CPU / 内存 四项回写） */
function applyDraft(cluster: ClusterQuota, draft: QuotaDraft): ResourceRow[] {
  const num = (value: string) => (value.trim() ? Number(value) : null)
  const map: Record<ResourceKey, number | null> = {
    cpuRequest: num(draft.cpuReserve),
    cpuLimit: num(draft.cpuLimit),
    memRequest: num(draft.memReserve),
    memLimit: num(draft.memLimit),
  }
  return cluster.rows.map((row) => ({ ...row, quota: map[row.key] }))
}

/* -------------------------------- 子组件 -------------------------------- */

/** CPU 芯片图标（灰） / 内存条图标（绿），对应设计稿左列小图标 */
function ResourceIcon({ kind }: { kind: 'cpu' | 'mem' }) {
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

/** 数值文本：不限制 / 12 核 */
function cellText(row: ResourceRow, value: number | null) {
  if (value === null) return '不限制'
  return `${value} ${UNIT[row.kind]}`
}

/** 使用率：不限制时返回 null */
function usagePercent(row: ResourceRow) {
  if (row.quota === null || row.quota === 0) return null
  return Math.min(100, Math.round((row.used / row.quota) * 100))
}

function ClusterCard({
  cluster,
  onEdit,
}: {
  cluster: ClusterQuota
  onEdit: () => void
}) {
  return (
    <div className="rounded-[2px] border border-[#e5e6eb] bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-[15px] font-bold text-[#1d2129]">
          集群：{cluster.name}
          <span className="ml-1 font-normal text-[#86909c]">（{cluster.code}）</span>
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 items-center gap-1.5 rounded-[2px] bg-[#166eff] px-3 text-[13px] text-white transition-colors hover:bg-[#0d5fe0]"
        >
          <Pencil size={13} strokeWidth={2.2} />
          编辑配额
        </button>
      </div>

      <div className="px-5 pb-5">
        <table className="w-full table-fixed border-collapse text-center">
          <thead>
            <tr className="bg-[#f7f8fa] text-[13px] text-[#4e5969]">
              <th className="w-[34%] px-4 py-2.5 font-normal">资源类型</th>
              <th className="w-[22%] px-4 py-2.5 font-normal">已使用</th>
              <th className="w-[22%] px-4 py-2.5 font-normal">配额</th>
              <th className="w-[22%] px-4 py-2.5 font-normal">余量</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#1d2129]">
            {cluster.rows.map((row) => {
              const icon = ROW_ICON[row.key]
              const remain = row.quota === null ? null : Math.max(0, row.quota - row.used)
              const percent = usagePercent(row)
              return (
                <tr key={row.key} className="border-b border-dashed border-[#e5e6eb] last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-center gap-2">
                      {icon ? <ResourceIcon kind={icon} /> : <span className="h-[22px] w-[22px] shrink-0" />}
                      <span>{row.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.quota === null ? (
                      <span className="text-[#86909c]">-</span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="tabular-nums">{cellText(row, row.used)}</span>
                        {percent !== null && percent >= 80 && (
                          <span className="rounded-[2px] bg-[#fff1f0] px-1 text-[11px] text-[#f53f3f]">
                            {percent}%
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{cellText(row, row.quota)}</td>
                  <td className="px-4 py-3 tabular-nums">{cellText(row, remain)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------------------------- 页面 ---------------------------------- */

export default function TenantQuotaPage({ __showFeat = false }: { __showFeat?: boolean } = {}) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const [clusters, setClusters] = useState<ClusterQuota[]>(INITIAL_CLUSTERS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [refreshedAt, setRefreshedAt] = useState('刚刚')

  const editing = clusters.find((item) => item.id === editingId) ?? null

  const handleRefresh = () => {
    setRefreshedAt('刚刚')
  }

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
      <PlatformHeader />
      <div className="flex min-h-0 flex-1">
        <SideNav activeKey="租户配额" />

        <main className="min-w-0 flex-1 overflow-auto bg-white px-6 pb-8 pt-6">
          <h1 className="text-[28px] font-bold leading-10 text-[#323232]">租户配额</h1>
          <p className="mt-2 text-[14px] leading-6 text-[#aaaaaa]">
            用于管理和分配租户中所有项目的资源使用总量。
          </p>

          {/* 资源配额：与设计稿一致，不加外层大卡片，分组标题与卡片直接铺在白底上 */}
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1d2129]">资源配额</h2>
            <button
              type="button"
              aria-label="刷新"
              title={`刷新（上次更新：${refreshedAt}）`}
              onClick={handleRefresh}
              className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#e5e6eb] bg-white text-[#4e5969] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                onEdit={() => setEditingId(cluster.id)}
              />
            ))}
          </div>
        </main>
      </div>

      {editing && (
        <QuotaDialog
          mode="tenant"
          title={`编辑租户（${TENANT_NAME}）配额`}
          contextLines={[
            `当前租户：${TENANT_NAME}`,
            `当前集群：${editing.name}（${editing.code}）`,
          ]}
          value={toDraft(editing)}
          showSummary={false}
          showApps={false}
          storageHint="当前系统存储容量：1000 GB ｜ 当前剩余可分配配额：200 GB"
          storageTag={__showFeat ? <NewTag code="F-STORAGE" compact /> : undefined}
          onClose={() => setEditingId(null)}
          onConfirm={(draft) => {
            setClusters((prev) =>
              prev.map((item) =>
                item.id === editing.id ? { ...item, rows: applyDraft(item, draft) } : item,
              ),
            )
            setEditingId(null)
          }}
        />
      )}
    </div>
    <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

import { useState } from 'react'
import { PlatformHeader, SideNav } from './_shared'
import { QuotaDialog, createQuotaDraft } from '@/lib/quota-dialog'
import type { QuotaDraft } from '@/lib/quota-dialog'
import {
  ResourceQuotaBoard,
  type ResourceQuotaCluster,
  type ResourceQuotaRow,
} from '@/lib/resource-quota'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

/* ---------------------------------- 类型 ---------------------------------- */

/** 资源行：CPU 与内存各分「限制 / 请求」两条，请求即预留 */
type ResourceKey = 'cpuLimit' | 'cpuRequest' | 'memLimit' | 'memRequest'

interface ClusterQuota extends ResourceQuotaCluster {
  rows: ResourceQuotaRow[]
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
      { key: 'cpuLimit', label: 'CPU 限制', kind: 'cpu', used: 96, quota: 128, icon: 'cpu' },
      { key: 'cpuRequest', label: 'CPU 请求', kind: 'cpu', used: 48, quota: 64, icon: null },
      { key: 'memLimit', label: '内存限制', kind: 'mem', used: 320, quota: 512, icon: 'mem' },
      { key: 'memRequest', label: '内存请求', kind: 'mem', used: 160, quota: 256, icon: null },
    ],
  },
  {
    id: 'host-cluster',
    name: '长沙实验室',
    code: 'host-cluster',
    rows: [
      { key: 'cpuLimit', label: 'CPU 限制', kind: 'cpu', used: 8, quota: null, icon: 'cpu' },
      { key: 'cpuRequest', label: 'CPU 请求', kind: 'cpu', used: 4, quota: null, icon: null },
      { key: 'memLimit', label: '内存限制', kind: 'mem', used: 32, quota: null, icon: 'mem' },
      { key: 'memRequest', label: '内存请求', kind: 'mem', used: 16, quota: null, icon: null },
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

/** 弹窗草稿 → 行数据（只有 CPU / 内存四项回写） */
function applyDraft(cluster: ClusterQuota, draft: QuotaDraft): ResourceQuotaRow[] {
  const num = (value: string) => (value.trim() ? Number(value) : null)
  const map: Record<ResourceKey, number | null> = {
    cpuRequest: num(draft.cpuReserve),
    cpuLimit: num(draft.cpuLimit),
    memRequest: num(draft.memReserve),
    memLimit: num(draft.memLimit),
  }
  return cluster.rows.map((row) => ({ ...row, quota: map[row.key as ResourceKey] ?? null }))
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
          <ResourceQuotaBoard
            title="租户配额"
            description="用于管理和分配租户中所有项目的资源使用总量。"
            sectionExtra={__showFeat ? <NewTag code="F-ASSET" compact /> : undefined}
            clusters={clusters}
            refreshedAt={refreshedAt}
            onRefresh={handleRefresh}
            onEdit={(cluster) => setEditingId(cluster.id)}
          />
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

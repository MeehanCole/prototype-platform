/**
 * 项目配额（数据管理 · 项目配额）
 *
 * 页面只保留业务状态、Mock 数据、QuotaDialog 与 PRD 批注接入；
 * 工作台视觉与基础交互复用 src/lib/project-quota 素材。
 */
import { useEffect, useState } from 'react'
import {
  Building2,
  Clock3,
  Container,
  Cpu,
  HardDrive,
  House,
  IdCard,
  MemoryStick,
  NotebookText,
  Pencil,
  Rocket,
  SquareArrowUp,
  SquarePlay,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { PlatformHeader, SideNav } from './_shared'
import { QuotaDialog, createQuotaDraft } from '@/lib/quota-dialog'
import type { QuotaDraft } from '@/lib/quota-dialog'
import {
  ProjectQuotaBoard,
  ProjectQuotaDialog,
  ProjectQuotaDialogButtons,
  type ProjectQuotaContainerGroup,
  type ProjectQuotaInfo,
  type ProjectQuotaRow,
} from '@/lib/project-quota'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

/* --------------------------------- Mock --------------------------------- */

const INITIAL_CONTAINER_ROWS: ProjectQuotaRow[] = [
  { key: 'cpuRequest', label: 'CPU 请求', icon: 'cpu', unit: '核', used: null, quota: null },
  { key: 'cpuLimit', label: 'CPU 限制', icon: 'cpu', unit: '核', used: null, quota: null },
  { key: 'memRequest', label: '内存请求', icon: 'mem', unit: 'GiB', used: null, quota: null },
  { key: 'memLimit', label: '内存限制', icon: 'mem', unit: 'GiB', used: null, quota: null },
]

/** 行序与设计稿一致：限制在前，请求在后 */
const INITIAL_PROJECT_ROWS: ProjectQuotaRow[] = [
  { key: 'cpuLimit', label: 'CPU 限制', icon: 'cpu', unit: '核', used: null, quota: null },
  { key: 'cpuRequest', label: 'CPU 请求', icon: 'cpu', unit: '核', used: null, quota: null },
  { key: 'memLimit', label: '内存限制', icon: 'mem', unit: 'GiB', used: null, quota: null },
  { key: 'memRequest', label: '内存请求', icon: 'mem', unit: 'GiB', used: null, quota: null },
  { key: 'pods', label: '容器组', icon: 'pod', unit: '', used: 62, quota: null },
  { key: 'services', label: '服务', icon: 'service', unit: '', used: 44, quota: null },
  { key: 'statefulSets', label: '有状态副本集', icon: 'stateful', unit: '', used: 7, quota: null },
  { key: 'daemonSets', label: '守护进程集', icon: 'daemon', unit: '', used: 2, quota: null },
  { key: 'storage', label: '数据存储', icon: 'storage', unit: 'GB', used: null, quota: null },
]

const INITIAL_PROJECT: ProjectQuotaInfo = {
  name: 'magic-cs158',
  tenant: 'magic-cs128',
  creator: '-',
  createdAt: '2025-09-23 13:41:38',
  members: '5',
  serviceAccounts: '0',
  description: '-',
}

/** Tab 栏与设计稿一致：通栏浅灰条，选中项实心蓝底白字 */
const TABS = ['资源状态', '配额', '用量统计', '元数据'] as const

const CONTAINER_GROUPS: ProjectQuotaContainerGroup[] = [
  { key: 'cpu', label: 'CPU', icon: 'cpu', requestKey: 'cpuRequest', limitKey: 'cpuLimit' },
  { key: 'mem', label: '内存', icon: 'mem', requestKey: 'memRequest', limitKey: 'memLimit' },
]

const BOARD_ICONS = {
  home: <House size={14} />,
  building: <Building2 size={14} />,
  user: <UserRound size={14} />,
  clock: <Clock3 size={14} />,
  idcard: <IdCard size={14} />,
  notebook: <NotebookText size={14} />,
  trash: <Trash2 size={13} />,
  resource: (kind: ProjectQuotaRow['icon']) => <ResourceGlyph kind={kind} />,
}

/** 资源图标：设计稿为深灰线框（约 18px），CPU 芯片 / 内存条 / 容器类 */
function ResourceGlyph({ kind }: { kind: ProjectQuotaRow['icon'] }) {
  const common = { size: 18, strokeWidth: 1.4, className: 'shrink-0 text-[#4e5969]' } as const
  switch (kind) {
    case 'cpu':
      return <Cpu {...common} />
    case 'mem':
      return <MemoryStick {...common} />
    case 'pod':
      return <Container {...common} />
    case 'service':
      return <Rocket {...common} />
    case 'stateful':
      return <SquarePlay {...common} />
    case 'storage':
      return <HardDrive {...common} />
    default:
      return <SquareArrowUp {...common} />
  }
}

/* -------------------------------- 工具函数 -------------------------------- */

/** 应用资源表格行：设计稿只列「容器组」一条，仅弹窗内演示，不回写页面 */
const APP_ROWS = [{ id: 'pods', name: '容器组', quota: '' }]

/** 页面行 → 弹窗草稿：CPU / 内存 四项取当前配额，应用资源为演示空行 */
function rowsToDraft(rows: ProjectQuotaRow[]): QuotaDraft {
  const pick = (key: string) => {
    const row = rows.find((item) => item.key === key)
    return row && row.quota !== null ? String(row.quota) : ''
  }
  return {
    ...createQuotaDraft([]),
    cpuReserve: pick('cpuRequest'),
    cpuLimit: pick('cpuLimit'),
    memReserve: pick('memRequest'),
    memLimit: pick('memLimit'),
    storage: pick('storage'),
    apps: APP_ROWS.map((row) => ({ ...row })),
  }
}

/** 容器配额只有 CPU / 内存 四条（请求、限制），与项目配额草稿字段一一对应 */
function containerToDraft(rows: ProjectQuotaRow[]): QuotaDraft {
  const pick = (key: string) => {
    const row = rows.find((item) => item.key === key)
    return row && row.quota !== null ? String(row.quota) : ''
  }
  return {
    ...createQuotaDraft([]),
    cpuReserve: pick('cpuRequest'),
    cpuLimit: pick('cpuLimit'),
    memReserve: pick('memRequest'),
    memLimit: pick('memLimit'),
  }
}

function containerToRows(rows: ProjectQuotaRow[], draft: QuotaDraft): ProjectQuotaRow[] {
  const num = (value: string) => (value.trim() ? Number(value) : null)
  const map: Record<string, number | null> = {
    cpuRequest: num(draft.cpuReserve),
    cpuLimit: num(draft.cpuLimit),
    memRequest: num(draft.memReserve),
    memLimit: num(draft.memLimit),
  }
  return rows.map((row) => (row.key in map ? { ...row, quota: map[row.key] } : row))
}

/** 弹窗草稿 → 页面行：CPU / 内存 / 数据存储回写卡片，应用资源仅弹窗内演示 */
function draftToRows(rows: ProjectQuotaRow[], draft: QuotaDraft): ProjectQuotaRow[] {
  const num = (value: string) => (value.trim() ? Number(value) : null)
  const quotaMap: Record<string, number | null> = {
    cpuRequest: num(draft.cpuReserve),
    cpuLimit: num(draft.cpuLimit),
    memRequest: num(draft.memReserve),
    memLimit: num(draft.memLimit),
    storage: num(draft.storage),
  }
  return rows.map((row) => (row.key in quotaMap ? { ...row, quota: quotaMap[row.key] } : row))
}

/* -------------------------------- 业务弹窗 -------------------------------- */

/** 编辑项目信息弹窗 */
function ProjectInfoDialog({
  info,
  onClose,
  onSave,
}: {
  info: ProjectQuotaInfo
  onClose: () => void
  onSave: (next: ProjectQuotaInfo) => void
}) {
  const [description, setDescription] = useState(info.description === '-' ? '' : info.description)
  const [members, setMembers] = useState(info.members)

  return (
    <ProjectQuotaDialog
      title="编辑项目信息"
      subtitle={`项目：${info.name}`}
      closeIcon={<X size={16} />}
      onClose={onClose}
      footer={
        <ProjectQuotaDialogButtons
          onCancel={onClose}
          onConfirm={() =>
            onSave({
              ...info,
              description: description.trim() || '-',
              members: members.trim() || '0',
            })
          }
        />
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-[88px] shrink-0 text-[13px] text-[#4e5969]">项目名称</span>
          <span className="text-[13px] text-[#1d2129]">{info.name}</span>
          <span className="text-[12px] text-[#a7acb3]">名称创建后不可修改</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-[88px] shrink-0 text-[13px] text-[#4e5969]">所属租户</span>
          <span className="text-[13px] text-[#1d2129]">{info.tenant}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-[88px] shrink-0 text-[13px] text-[#4e5969]">项目成员</span>
          <span className="flex h-8 w-[200px] items-center rounded-[2px] border border-[#e5e6eb] focus-within:border-[#166eff]">
            <input
              value={members}
              onChange={(e) => setMembers(e.target.value.replace(/[^\d]/g, ''))}
              className="h-full w-full min-w-0 bg-transparent px-3 text-[13px] text-[#1d2129] outline-none"
            />
            <span className="shrink-0 pr-3 text-[13px] text-[#86909c]">人</span>
          </span>
        </div>
        <div className="flex items-start gap-4">
          <span className="w-[88px] shrink-0 pt-2 text-[13px] text-[#4e5969]">描述</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="请输入项目描述"
            className="w-full resize-none rounded-[2px] border border-[#e5e6eb] px-3 py-2 text-[13px] text-[#1d2129] outline-none placeholder:text-[#c9cdd4] focus:border-[#166eff]"
          />
        </div>
      </div>
    </ProjectQuotaDialog>
  )
}

/** 删除项目二次确认 */
function DeleteProjectDialog({
  info,
  onClose,
  onConfirm,
}: {
  info: ProjectQuotaInfo
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ProjectQuotaDialog
      title="删除项目"
      closeIcon={<X size={16} />}
      onClose={onClose}
      footer={
        <ProjectQuotaDialogButtons
          onCancel={onClose}
          onConfirm={onConfirm}
          confirmText="确认删除"
          danger
        />
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#f53f3f] text-[12px] font-bold leading-none text-white">
          !
        </span>
        <div className="text-[13px] leading-6 text-[#1d2129]">
          <p>
            确认删除项目 <span className="font-bold">{info.name}</span> 吗？
          </p>
          <p className="mt-1 text-[12px] text-[#86909c]">
            删除后项目下的工作负载与配额配置将一并释放，且无法恢复。
          </p>
        </div>
      </div>
    </ProjectQuotaDialog>
  )
}

/* ---------------------------------- 页面 ---------------------------------- */

export default function ProjectQuotaPage({ __showFeat = false }: { __showFeat?: boolean } = {}) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('配额')
  const [info, setInfo] = useState<ProjectQuotaInfo>(INITIAL_PROJECT)
  const [containerRows, setContainerRows] = useState<ProjectQuotaRow[]>(INITIAL_CONTAINER_ROWS)
  const [projectRows, setProjectRows] = useState<ProjectQuotaRow[]>(INITIAL_PROJECT_ROWS)

  const [dialog, setDialog] = useState<'info' | 'projectQuota' | 'containerQuota' | 'delete' | null>(
    null,
  )
  const [toast, setToast] = useState<string | null>(null)
  const [deleted, setDeleted] = useState(false)

  /** 提示 2.4s 自动消失 */
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const restoreProject = () => {
    setDeleted(false)
    setInfo(INITIAL_PROJECT)
    setContainerRows(INITIAL_CONTAINER_ROWS)
    setProjectRows(INITIAL_PROJECT_ROWS)
    setToast('已恢复项目')
  }

  const deletedView = (
    <div className="flex flex-col items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f3f5] text-[#86909c]">
        <Trash2 size={22} />
      </span>
      <p className="text-[15px] text-[#1d2129]">项目已删除</p>
      <p className="text-[12px] text-[#86909c]">项目下的配额配置已释放，可在项目列表中重新创建。</p>
      <button
        type="button"
        onClick={restoreProject}
        className="mt-1 h-8 rounded-[2px] border border-[#e5e6eb] bg-white px-4 text-[13px] text-[#1d2129] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
      >
        撤销删除
      </button>
    </div>
  )

  const extra = (
    <>
      {dialog === 'info' && (
        <ProjectInfoDialog
          info={info}
          onClose={() => setDialog(null)}
          onSave={(next) => {
            setInfo(next)
            setDialog(null)
            setToast('项目信息已更新')
          }}
        />
      )}

      {dialog === 'projectQuota' && (
        <QuotaDialog
          mode="project"
          title="编辑项目配额"
          contextLines={[`当前项目：${info.name}`]}
          value={rowsToDraft(projectRows)}
          storageHint="当前系统存储容量：1000 GB ｜ 当前剩余可分配配额：200 GB"
          storageTag={__showFeat ? <NewTag code="F-STORAGE" compact /> : undefined}
          onClose={() => setDialog(null)}
          onConfirm={(draft) => {
            setProjectRows(draftToRows(projectRows, draft))
            setDialog(null)
            setToast('项目配额已保存')
          }}
        />
      )}

      {dialog === 'containerQuota' && (
        <QuotaDialog
          mode="project"
          title="编辑容器配额"
          contextLines={[`当前项目：${info.name}`]}
          value={containerToDraft(containerRows)}
          storageHint="当前系统存储容量：1000 GB ｜ 当前剩余可分配配额：200 GB"
          showSummary={false}
          showApps={false}
          showStorage={false}
          reserveLabel="请求"
          reserveEmptyText="不限制"
          onClose={() => setDialog(null)}
          onConfirm={(draft) => {
            setContainerRows(containerToRows(containerRows, draft))
            setDialog(null)
            setToast('容器配额已保存')
          }}
        />
      )}

      {dialog === 'delete' && (
        <DeleteProjectDialog
          info={info}
          onClose={() => setDialog(null)}
          onConfirm={() => {
            setDialog(null)
            setDeleted(true)
          }}
        />
      )}

      {/* 轻提示 */}
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-[86px] z-50 -translate-x-1/2 rounded-[2px] bg-[#1d2129] px-4 py-2 text-[13px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
          {toast}
        </div>
      )}
    </>
  )

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
        <PlatformHeader />
        <div className="flex min-h-0 flex-1">
          <SideNav activeKey="项目配额" />
          <ProjectQuotaBoard
            info={info}
            containerRows={containerRows}
            containerGroups={CONTAINER_GROUPS}
            projectRows={projectRows}
            tabs={TABS}
            quotaTab="配额"
            activeTab={activeTab}
            sectionTitles={{ containerQuota: '容器配额', projectQuota: '项目配额' }}
            icons={BOARD_ICONS}
            title="项目概览"
            description="项目的信息概览，您可以查看项目基本信息、资源状态以及配额信息。"
            manageItems={[
              { key: 'info', label: '编辑项目信息', icon: <Pencil size={13} /> },
              { key: 'projectQuota', label: '编辑项目配额', icon: <NotebookText size={13} /> },
              { key: 'containerQuota', label: '编辑容器配额', icon: <Container size={13} /> },
            ]}
            deleted={deleted}
            deletedView={deletedView}
            extra={extra}
            onTabChange={(tab) => setActiveTab(tab as (typeof TABS)[number])}
            onManageItem={(key) =>
              setDialog(key as 'info' | 'projectQuota' | 'containerQuota')
            }
            onDelete={() => setDialog('delete')}
          />
        </div>
      </div>
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

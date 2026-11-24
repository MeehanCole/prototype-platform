/**
 * 项目配额（项目概览 → 配额 Tab）
 *
 * 外壳（顶栏 / 侧栏）复用 src/lib/platform-shell 通用件，视觉不改造；
 * 主内容区按设计稿还原：
 *   标题 + 说明 → 项目基本信息卡（名称/租户/创建者/创建时间/项目成员/服务账户/描述）+ 管理按钮
 *   → Tab（资源状态 / 配额 / 用量统计 / 元数据，本页停留在「配额」）
 *   → 区块一「容器配额」：CPU / 内存 两行长条卡片
 *   → 区块二「项目配额」：按资源逐行长条卡片（资源类型 / 已使用 / 配额 / 余量）
 *
 * 管理交互（按设计稿 管理 下拉）：
 *   编辑项目信息 / 编辑项目配额 / 编辑容器配额 / 删除项目
 * 数值为 Mock，编辑结果保存在页面内状态，不落库。
 */
import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Clock3,
  Container,
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
  Cpu,
  UserRound,
  X,
} from 'lucide-react'
import { PlatformHeader, SideNav } from './_shared'
import { QuotaDialog, createQuotaDraft } from '@/lib/quota-dialog'
import type { QuotaDraft } from '@/lib/quota-dialog'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

/* ---------------------------------- 类型 ---------------------------------- */

/** 可编辑配额行：不限制时 quota 为 null */
interface QuotaRow {
  key: string
  label: string
  icon: 'cpu' | 'mem' | 'pod' | 'service' | 'stateful' | 'daemon' | 'storage'
  /** 计量单位，不限制行不展示 */
  unit: string
  /** 已使用量，null 表示无数据（展示 -） */
  used: number | null
  /** 配额，null 表示不限制 */
  quota: number | null
}

interface ProjectInfo {
  name: string
  tenant: string
  creator: string
  createdAt: string
  members: string
  serviceAccounts: string
  description: string
}

/* --------------------------------- Mock --------------------------------- */

const INITIAL_CONTAINER_ROWS: QuotaRow[] = [
  { key: 'cpuRequest', label: 'CPU 请求', icon: 'cpu', unit: '核', used: null, quota: null },
  { key: 'cpuLimit', label: 'CPU 限制', icon: 'cpu', unit: '核', used: null, quota: null },
  { key: 'memRequest', label: '内存请求', icon: 'mem', unit: 'GiB', used: null, quota: null },
  { key: 'memLimit', label: '内存限制', icon: 'mem', unit: 'GiB', used: null, quota: null },
]

/** 行序与设计稿一致：限制在前，请求在后 */
const INITIAL_PROJECT_ROWS: QuotaRow[] = [
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

const INITIAL_PROJECT: ProjectInfo = {
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

/* -------------------------------- 工具函数 -------------------------------- */

/** 配额展示：不限制 / 12 核 */
function quotaText(row: QuotaRow, value: number | null) {
  if (value === null) return '不限制'
  return row.unit ? `${value} ${row.unit}` : String(value)
}

/** 已使用展示：无数据为 - */
function usedText(row: QuotaRow) {
  if (row.used === null) return '-'
  return row.unit ? `${row.used} ${row.unit}` : String(row.used)
}

/** 余量：不限制时同样不限制；已使用无数据时按 0 计算，避免设了配额却看不到余量 */
function remainText(row: QuotaRow) {
  if (row.quota === null) return '不限制'
  const used = row.used ?? 0
  const remain = Math.max(0, row.quota - used)
  return row.unit ? `${remain} ${row.unit}` : String(remain)
}

/* -------------------------------- 子组件 -------------------------------- */

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-[2px] shrink-0 text-[#a7acb3]">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-[#1d2129]" title={value}>
          {value}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-[12px] text-[#86909c]">{label}</p>
      </div>
    </div>
  )
}

/** 资源图标：设计稿为深灰线框（约 18px），CPU 芯片 / 内存条 / 容器类 */
function ResourceGlyph({ kind }: { kind: QuotaRow['icon'] }) {
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

/** 长条卡片里的一列：上行数值，下行灰色列名（设计稿的列名内嵌形态） */
function CardCell({
  value,
  label,
  className = '',
}: {
  value: string
  label: string
  className?: string
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="truncate text-[13px] font-medium text-[#1d2129]" title={value}>
        {value}
      </p>
      <p className="mt-1 whitespace-nowrap text-[12px] text-[#86909c]">{label}</p>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-[16px] font-bold text-[#1d2129]">{title}</h2>
}

/** 弹窗骨架 */
function Dialog({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-[600px] max-w-[92vw] rounded-[4px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between border-b border-[#f0f0f0] px-6 py-4">
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#1d2129]">{title}</p>
            {subtitle && <p className="mt-1 truncate text-[12px] text-[#86909c]">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="ml-3 shrink-0 text-[#86909c] transition-colors hover:text-[#1d2129]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex items-center justify-end gap-3 border-t border-[#f0f0f0] px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  )
}

function DialogButtons({
  onCancel,
  onConfirm,
  confirmText = '保存',
  danger = false,
}: {
  onCancel: () => void
  onConfirm: () => void
  confirmText?: string
  danger?: boolean
}) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 min-w-[64px] rounded-[2px] border border-[#e5e6eb] bg-white px-4 text-[13px] text-[#1d2129] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
      >
        取消
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`h-8 min-w-[64px] rounded-[2px] px-4 text-[13px] text-white transition-colors ${
          danger ? 'bg-[#f53f3f] hover:bg-[#d92d2d]' : 'bg-[#166eff] hover:bg-[#0d5fe0]'
        }`}
      >
        {confirmText}
      </button>
    </>
  )
}

/** 应用资源表格行：设计稿只列「容器组」一条，仅弹窗内演示，不回写页面 */
const APP_ROWS = [{ id: 'pods', name: '容器组', quota: '' }]

/** 页面行 → 弹窗草稿：CPU / 内存 四项取当前配额，应用资源为演示空行 */
function rowsToDraft(rows: QuotaRow[]): QuotaDraft {
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
function containerToDraft(rows: QuotaRow[]): QuotaDraft {
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

function containerToRows(rows: QuotaRow[], draft: QuotaDraft): QuotaRow[] {
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
function draftToRows(rows: QuotaRow[], draft: QuotaDraft): QuotaRow[] {
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

/** 编辑项目信息弹窗 */
function ProjectInfoDialog({
  info,
  onClose,
  onSave,
}: {
  info: ProjectInfo
  onClose: () => void
  onSave: (next: ProjectInfo) => void
}) {
  const [description, setDescription] = useState(info.description === '-' ? '' : info.description)
  const [members, setMembers] = useState(info.members)

  return (
    <Dialog
      title="编辑项目信息"
      subtitle={`项目：${info.name}`}
      onClose={onClose}
      footer={
        <DialogButtons
          onCancel={onClose}
          onConfirm={() => onSave({ ...info, description: description.trim() || '-', members: members.trim() || '0' })}
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
    </Dialog>
  )
}

/** 删除项目二次确认 */
function DeleteProjectDialog({
  info,
  onClose,
  onConfirm,
}: {
  info: ProjectInfo
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      title="删除项目"
      onClose={onClose}
      footer={<DialogButtons onCancel={onClose} onConfirm={onConfirm} confirmText="确认删除" danger />}
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
    </Dialog>
  )
}

/* ---------------------------------- 页面 ---------------------------------- */

export default function ProjectQuotaPage({ __showFeat = false }: { __showFeat?: boolean } = {}) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('配额')
  const [info, setInfo] = useState<ProjectInfo>(INITIAL_PROJECT)
  const [containerRows, setContainerRows] = useState<QuotaRow[]>(INITIAL_CONTAINER_ROWS)
  const [projectRows, setProjectRows] = useState<QuotaRow[]>(INITIAL_PROJECT_ROWS)

  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<'info' | 'projectQuota' | 'containerQuota' | 'delete' | null>(
    null,
  )
  const [toast, setToast] = useState<string | null>(null)
  const [deleted, setDeleted] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  /** 点击空白处关闭「管理」下拉 */
  useEffect(() => {
    if (!menuOpen) return
    const handle = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  /** 提示 2.4s 自动消失 */
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const MENU_ITEMS = [
    { key: 'info' as const, label: '编辑项目信息', icon: <Pencil size={13} /> },
    { key: 'projectQuota' as const, label: '编辑项目配额', icon: <NotebookText size={13} /> },
    { key: 'containerQuota' as const, label: '编辑容器配额', icon: <Container size={13} /> },
  ]

  if (deleted) {
    return (
      <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
        <PlatformHeader />
        <div className="flex min-h-0 flex-1">
          <SideNav activeKey="总览" />
          <main className="flex min-w-0 flex-1 items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f3f5] text-[#86909c]">
                <Trash2 size={22} />
              </span>
              <p className="text-[15px] text-[#1d2129]">项目已删除</p>
              <p className="text-[12px] text-[#86909c]">项目下的配额配置已释放，可在项目列表中重新创建。</p>
              <button
                type="button"
                onClick={() => {
                  setDeleted(false)
                  setInfo(INITIAL_PROJECT)
                  setContainerRows(INITIAL_CONTAINER_ROWS)
                  setProjectRows(INITIAL_PROJECT_ROWS)
                  setToast('已恢复项目')
                }}
                className="mt-1 h-8 rounded-[2px] border border-[#e5e6eb] bg-white px-4 text-[13px] text-[#1d2129] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
              >
                撤销删除
              </button>
            </div>
          </main>
        </div>
      </div>
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
      </DocProvider>
    )
  }

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
      <PlatformHeader />
      <div className="flex min-h-0 flex-1">
        <SideNav activeKey="总览" />

        <main className="min-w-0 flex-1 overflow-auto bg-white px-6 pb-8 pt-6">
          <h1 className="text-[28px] font-bold leading-10 text-[#323232]">项目概览</h1>
          <p className="mt-2 text-[14px] leading-6 text-[#aaaaaa]">
            项目的信息概览，您可以查看项目基本信息、资源状态以及配额信息。
          </p>

          {/* 项目基本信息 */}
          <section className="mt-6 rounded-[2px] border border-[#e5e6eb] bg-white px-5 py-4">
            <div className="flex items-start gap-6">
              <div className="grid min-w-0 flex-1 grid-cols-4 gap-x-6 gap-y-4">
                <InfoField icon={<House size={14} />} label="名称" value={info.name} />
                <InfoField icon={<Building2 size={14} />} label="租户" value={info.tenant} />
                <InfoField icon={<UserRound size={14} />} label="创建者" value={info.creator} />
                <InfoField icon={<Clock3 size={14} />} label="创建时间" value={info.createdAt} />

                <InfoField icon={<IdCard size={14} />} label="项目成员" value={info.members} />
                <InfoField icon={<UserRound size={14} />} label="服务账户" value={info.serviceAccounts} />
                <InfoField icon={<NotebookText size={14} />} label="描述" value={info.description} />
              </div>

              {/* 管理：下拉菜单（编辑项目信息 / 编辑项目配额 / 编辑容器配额 / 删除） */}
              <div ref={menuRef} className="relative shrink-0">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="h-8 rounded-[2px] bg-[#166eff] px-4 text-[13px] text-white transition-colors hover:bg-[#0d5fe0]"
                >
                  管理
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[36px] z-30 w-[152px] rounded-[4px] border border-[#e5e6eb] bg-white py-1 shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
                  >
                    {/* 指向「管理」按钮的小三角 */}
                    <span className="absolute -top-[5px] right-6 h-2.5 w-2.5 rotate-45 border-l border-t border-[#e5e6eb] bg-white" />
                    {MENU_ITEMS.map((item) => (
                      <button
                        key={item.key}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          setDialog(item.key)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#1d2129] transition-colors hover:bg-[#f2f5ff] hover:text-[#166eff]"
                      >
                        <span className="text-[#4e5969]">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <div className="my-1 h-px bg-[#f0f0f0]" />
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setDialog('delete')
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#1d2129] transition-colors hover:bg-[#f2f5ff] hover:text-[#166eff]"
                    >
                      <Trash2 size={13} className="text-[#4e5969]" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Tab 栏：通栏浅灰条，选中项实心蓝底白字 */}
          <div className="mt-4 flex w-full items-center gap-1 rounded-[2px] bg-[#f5f6fa] p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`h-8 rounded-[2px] px-4 text-[13px] transition-colors ${
                  activeTab === tab
                    ? 'bg-[#166eff] font-medium text-white'
                    : 'text-[#4e5969] hover:text-[#166eff]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === '配额' ? (
            <>
              {/* 容器配额：每行一种资源，两列分别为「请求」「限制」 */}
              <section className="mt-5">
                <SectionTitle title="容器配额" />
                <div className="mt-3 space-y-2.5">
                  {([
                    { kind: 'cpu' as const, label: 'CPU', requestKey: 'cpuRequest', limitKey: 'cpuLimit' },
                    { kind: 'mem' as const, label: '内存', requestKey: 'memRequest', limitKey: 'memLimit' },
                  ]).map((group) => {
                    const request = containerRows.find((row) => row.key === group.requestKey)
                    const limit = containerRows.find((row) => row.key === group.limitKey)
                    return (
                      <div
                        key={group.kind}
                        className="flex items-start rounded-[2px] border border-[#e9edf2] bg-[#f9fbfd] px-5 py-2.5"
                      >
                        <div className="flex w-[34%] min-w-0 items-start gap-2">
                          <span className="mt-[1px] shrink-0">
                            <ResourceGlyph kind={group.kind} />
                          </span>
                          <CardCell value={group.label} label="资源类型" />
                        </div>
                        <CardCell
                          className="w-[22%]"
                          value={request ? quotaText(request, request.quota) : '-'}
                          label={`${group.label}请求`}
                        />
                        <CardCell
                          className="w-[22%]"
                          value={limit ? quotaText(limit, limit.quota) : '-'}
                          label={`${group.label}限制`}
                        />
                        <CardCell className="w-[22%]" value="" label="" />
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* 项目配额 */}
              <section className="mt-5">
                <SectionTitle title="项目配额" />
                <div className="mt-3 space-y-2.5">
                  {projectRows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-start rounded-[2px] border border-[#e9edf2] bg-[#f9fbfd] px-5 py-2.5"
                    >
                      <div className="flex w-[34%] min-w-0 items-start gap-2">
                        <span className="mt-[1px] shrink-0">
                          <ResourceGlyph kind={row.icon} />
                        </span>
                        <CardCell value={row.label} label="资源类型" />
                      </div>
                      <CardCell className="w-[22%]" value={usedText(row)} label="已使用" />
                      <CardCell className="w-[22%]" value={quotaText(row, row.quota)} label="配额" />
                      <CardCell className="w-[22%]" value={remainText(row)} label="余量" />
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="mt-6 flex h-[300px] items-center justify-center rounded-[2px] border border-[#e5e6eb] bg-[#fafafa] text-[13px] text-[#86909c]">
              暂无数据
            </div>
          )}
        </main>
      </div>

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
    </div>
    <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

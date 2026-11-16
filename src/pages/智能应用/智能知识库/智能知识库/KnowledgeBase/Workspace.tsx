/**
 * 知识库 - 文档工作台
 *
 * 进入某个库后不再切换库，也不做概览 / 分块 / 检索测试；
 * 顶部为「返回 + 知识库详情」标准导航，标题右侧提供「库设置」入口（解析与富化），
 * 下面直接是当前库的文档列表。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  TriangleAlert,
  UploadCloud,
  X,
} from 'lucide-react'
import type { KbRecord } from './model'
import { LibrarySettingsDialog } from './LibrarySettingsDialog'
import { RetrievalTestDialog } from './RetrievalTestDialog'
import { startRebuild, useKbIndexStates } from './indexState'
import { SettingsModal } from '../SettingsUI'
import { useModelRegistry } from '../ModelManagement/store'

type DocStatus = 'queued' | 'parsing' | 'optimizing' | 'ready' | 'failed' | 'stale'

type DocSection = { heading: string; body: string }

type KbChunk = {
  id: string
  heading: string
  body: string
  originalBody: string
  enabled: boolean
  showHeading: boolean
}

type KbDoc = {
  id: string
  name: string
  ext: 'pdf' | 'docx' | 'md' | 'xlsx' | 'txt'
  size: string
  updated: string
  status: DocStatus
  failure?: { stage: string; reason: string }
  chunks: KbChunk[]
  summary: string
  sections: DocSection[]
}

const DOC_PAGE_SIZES = ['6', '12', '24']

type DocTemplate = {
  base: string
  ext: KbDoc['ext']
  size: string
  summary: string
  sections: DocSection[]
}

const DOC_TEMPLATES: DocTemplate[] = [
  {
    base: '平台产品白皮书',
    ext: 'pdf',
    size: '2.4 MB',
    summary:
      '介绍平台的一体化算力与运维能力，覆盖资源纳管、应用编排、可观测性和多集群治理，并给出典型建设路径。',
    sections: [
      {
        heading: '产品定位',
        body: '面向企业研发与运维团队，提供从基础设施纳管到应用全生命周期管理的一体化平台。通过统一控制面屏蔽异构资源差异，让团队专注于业务交付。',
      },
      {
        heading: '核心能力',
        body: '· 多集群统一纳管：一套控制台管理生产、测试与边缘集群。\n· 应用编排与发布：支持灰度、蓝绿与回滚。\n· 可观测性：统一采集日志、指标与链路。\n· 权限治理：租户、角色与资源配额分层管控。',
      },
      {
        heading: '典型场景',
        body: '适用于多云资源统一管理、传统应用容器化迁移、研发测试环境自助交付，以及跨集群故障快速定位。',
      },
    ],
  },
  {
    base: '快速入门指南',
    ext: 'pdf',
    size: '1.1 MB',
    summary:
      '从准备工作开始，引导新用户完成第一个应用的创建、部署与访问，并说明常用的排障入口。',
    sections: [
      {
        heading: '准备工作',
        body: '确认账号已加入目标项目，并具备应用创建权限。首次使用建议先完成集群接入与环境配置。',
      },
      {
        heading: '创建第一个应用',
        body: '进入「应用管理」点击「新建应用」，填写应用名称、选择镜像与目标集群，按需配置端口和环境变量后提交。',
      },
      {
        heading: '查看运行状态',
        body: '应用创建后可在详情页查看 Pod 状态、事件与日志。状态变为「运行中」后，通过访问地址验证服务是否正常。',
      },
    ],
  },
  {
    base: '接口调用说明',
    ext: 'md',
    size: '386 KB',
    summary:
      '说明开放接口的认证方式、请求格式与错误码约定，并提供查询应用列表的调用示例。',
    sections: [
      {
        heading: '认证方式',
        body: '所有接口使用 Bearer Token 认证。请在请求头中携带：\nAuthorization: Bearer <access_token>',
      },
      {
        heading: '请求示例',
        body: 'GET /api/v1/apps?cluster=prod&page=1&pageSize=20\nContent-Type: application/json\n\n响应包含 total、items 两个字段，items 为应用摘要列表。',
      },
      {
        heading: '错误处理',
        body: '4xx 表示请求参数或权限问题，5xx 表示服务异常。建议客户端按 code 字段做分支处理，并对 429 响应进行退避重试。',
      },
    ],
  },
  {
    base: '常见问题解答',
    ext: 'docx',
    size: '742 KB',
    summary:
      '汇总账号权限、资源配额、应用发布和计费相关的常见问题，并给出处理建议与相关入口。',
    sections: [
      {
        heading: '账号与权限',
        body: '为什么看不到某个项目？通常是未被加入项目成员。请联系项目管理员在「项目设置 · 成员」中授权。',
      },
      {
        heading: '资源与配额',
        body: '创建应用提示配额不足时，可在「项目设置 · 配额」查看 CPU、内存与存储用量，或提交配额调整申请。',
      },
      {
        heading: '计费与账单',
        body: '按量资源按小时出账，包年包月资源在到期前 7 天提醒。账单明细可在「费用中心」按项目和资源类型筛选。',
      },
    ],
  },
  {
    base: '部署与升级手册',
    ext: 'pdf',
    size: '3.8 MB',
    summary:
      '覆盖部署前环境检查、控制面与数据面安装步骤、升级前备份和回滚流程，适用于私有化交付场景。',
    sections: [
      {
        heading: '环境要求',
        body: '控制面建议 3 节点起步，单节点 8 核 16 GB 以上；数据盘不低于 500 GB。节点之间需放通 6443、2379 与业务网段。',
      },
      {
        heading: '部署步骤',
        body: '1. 校验操作系统与内核版本。\n2. 配置主机名、时间同步与镜像仓库。\n3. 执行安装脚本并检查组件状态。\n4. 登录控制台完成许可激活。',
      },
      {
        heading: '版本升级',
        body: '升级前先备份 etcd 与平台数据库，确认当前版本与目标版本的升级路径。升级过程中控制台可能短暂不可用，业务负载不受影响。',
      },
    ],
  },
  {
    base: '数据导入模板',
    ext: 'xlsx',
    size: '96 KB',
    summary:
      '定义应用、环境和资源配额批量导入时的字段格式、必填项与校验规则，附填写示例。',
    sections: [
      {
        heading: '字段说明',
        body: 'appName：应用名称，必填，4–32 个字符。\nenv：所属环境，必填，可选 dev / test / prod。\ncpu / memory：资源配额，必填，需为合法数值。',
      },
      {
        heading: '填写规范',
        body: '请勿修改表头名称与列顺序；同一文件内 appName 不可重复；日期统一使用 YYYY-MM-DD 格式。',
      },
      {
        heading: '导入校验',
        body: '上传后平台会先做格式与配额校验，全部通过才会创建资源。失败记录可下载错误明细，修正后重新导入。',
      },
    ],
  },
  {
    base: '权限与角色说明',
    ext: 'pdf',
    size: '1.6 MB',
    summary:
      '说明平台内置角色、权限边界与授权方式，帮助管理员按最小权限原则完成团队授权。',
    sections: [
      {
        heading: '角色定义',
        body: '平台预置超级管理员、平台运维、项目管理员、开发者与只读成员五类角色，分别对应不同管理范围。',
      },
      {
        heading: '权限矩阵',
        body: '项目管理员可管理成员与配额；开发者可创建和发布应用；只读成员仅可查看资源与日志。跨项目操作需单独授权。',
      },
      {
        heading: '授权示例',
        body: '为新加入的研发同学授予「开发者」角色，并限制到指定项目；涉及生产发布时，再临时授予发布权限并设置有效期。',
      },
    ],
  },
  {
    base: '版本更新记录',
    ext: 'md',
    size: '214 KB',
    summary:
      '记录近期版本的功能新增、体验优化与缺陷修复，帮助用户了解升级内容和已知问题。',
    sections: [
      {
        heading: 'v2.4.0',
        body: '新增多集群应用批量发布与发布单审批；优化日志检索性能；修复大文件上传偶发中断的问题。',
      },
      {
        heading: 'v2.3.2',
        body: '修复部分场景下配额统计延迟；完善告警规则模板；升级依赖组件以修复安全漏洞。',
      },
      {
        heading: '已知问题',
        body: '当集群节点数超过 500 时，节点列表首次加载较慢，计划在下个版本优化分页与缓存策略。',
      },
    ],
  },
]

const STATUS_META: Record<
  DocStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  ready: {
    label: '已解析',
    className: 'border-[#e1f3d8] bg-[#f0f9eb] text-[#529b2e]',
    icon: CheckCircle2,
  },
  queued: {
    label: '排队中',
    className: 'border-[#e5e6eb] bg-[#f7f8fa] text-[#86909c]',
    icon: Clock,
  },
  parsing: {
    label: '解析中',
    className: 'border-[#d9ecff] bg-[#ecf5ff] text-[#166EFF]',
    icon: Loader2,
  },
  optimizing: {
    label: '优化中',
    className: 'border-[#d9ecff] bg-[#ecf5ff] text-[#166EFF]',
    icon: Sparkles,
  },
  failed: {
    label: '解析失败',
    className: 'border-[#fde2e2] bg-[#fef0f0] text-[#f56c6c]',
    icon: AlertCircle,
  },
  stale: {
    label: '需重新解析',
    className: 'border-[#faecd8] bg-[#fdf6ec] text-[#b88230]',
    icon: RefreshCw,
  },
}

/** 将章节按列表项拆成可独立编辑、启停的片段；普通段落保持为一个片段 */
function buildChunks(sections: DocSection[]): KbChunk[] {
  const chunks: KbChunk[] = []
  sections.forEach((section, sectionIndex) => {
    const lines = section.body.split('\n').filter(Boolean)
    const listLike =
      lines.length > 1 && lines.every((line) => /^[·\-*]|^\d+[.、]/.test(line.trim()))
    const parts = listLike ? lines : [section.body]
    parts.forEach((body, partIndex) => {
      chunks.push({
        id: `chunk-${sectionIndex}-${partIndex}`,
        heading: section.heading,
        body,
        originalBody: body,
        enabled: true,
        showHeading: partIndex === 0,
      })
    })
  })
  return chunks
}

/** 按库文档数生成稳定的演示文档：不引入随机数，刷新后顺序不变 */
function buildDocs(kb: KbRecord): KbDoc[] {
  if (kb.docs === 0) return []
  const count = Math.min(8, kb.docs)
  return Array.from({ length: count }, (_, i) => {
    const template = DOC_TEMPLATES[i % DOC_TEMPLATES.length]
    let status: DocStatus = 'ready'
    if (i === 1 && kb.docs > 4) status = 'queued'
    if (i === 2 && kb.docs > 3) status = 'parsing'
    if (i === 3 && kb.docs > 5) status = 'optimizing'
    if (i === 5 && kb.docs > 6) status = 'failed'
    if (i === 6 && kb.docs > 10) status = 'stale'
    return {
      id: `${kb.name}-${i}`,
      name: `${template.base}.${template.ext}`,
      ext: template.ext,
      size: template.size,
      updated: `2026-11-${String(13 - i).padStart(2, '0')} ${String(10 + i).padStart(2, '0')}:2${i}`,
      status,
      failure:
        status === 'failed'
          ? { stage: '分块阶段', reason: '未能识别文档结构，切分结果为空' }
          : undefined,
      chunks: buildChunks(template.sections),
      summary: template.summary,
      sections: template.sections,
    }
  })
}

function DocIcon({ ext }: { ext: KbDoc['ext'] }) {
  if (ext === 'xlsx') return <FileSpreadsheet className="h-[18px] w-[18px] text-[#3f9c5a]" />
  if (ext === 'pdf') return <FileText className="h-[18px] w-[18px] text-[#e05252]" />
  if (ext === 'docx') return <FileText className="h-[18px] w-[18px] text-[#3d7eff]" />
  return <FileText className="h-[18px] w-[18px] text-[#8c8c8c]" />
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean
  direction: SortDirection
}) {
  if (!active) return <ChevronDown className="h-[12px] w-[12px] text-[#c0c4cc]" />
  return direction === 'asc' ? (
    <ArrowUp className="h-[12px] w-[12px] text-[#166EFF]" />
  ) : (
    <ArrowDown className="h-[12px] w-[12px] text-[#166EFF]" />
  )
}

function StatusTag({ status }: { status: DocStatus }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex h-[22px] items-center gap-1 rounded border px-2 text-[12px] ${meta.className}`}
    >
      <Icon
        className={`h-[12px] w-[12px] ${status === 'parsing' ? 'animate-spin' : ''}`}
        strokeWidth={2}
      />
      {meta.label}
    </span>
  )
}

function DocActions({
  doc,
  open,
  onToggle,
  onAction,
}: {
  doc: KbDoc
  open: boolean
  onToggle: () => void
  onAction: (action: 'download' | 'reparse' | 'delete', doc: KbDoc) => void
}) {
  return (
    <div
      className="relative"
      data-doc-menu
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        aria-label={`更多操作：${doc.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded text-[#8c8c8c] hover:bg-[#f5f7fa] hover:text-[#166EFF]"
      >
        <MoreHorizontal className="h-[16px] w-[16px]" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`${doc.name} 的操作`}
          className="absolute right-0 top-[30px] z-40 w-[180px] rounded-[6px] border border-[#e6e8eb] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
        >
          <button
            role="menuitem"
            onClick={() => onAction('download', doc)}
            className="flex h-[36px] w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-3 text-[13px] text-[#1f2329] hover:bg-[#f5f7fa]"
          >
            <Download className="h-[16px] w-[16px] text-[#606266]" />
            下载
          </button>
          <button
            role="menuitem"
            onClick={() => onAction('reparse', doc)}
            className="flex h-[36px] w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-3 text-[13px] text-[#1f2329] hover:bg-[#f5f7fa]"
          >
            <RefreshCw className="h-[16px] w-[16px] text-[#606266]" />
            重新解析
          </button>
          <div className="my-1 h-px bg-[#f0f0f0]" />
          <button
            role="menuitem"
            onClick={() => onAction('delete', doc)}
            className="flex h-[36px] w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-3 text-[13px] text-[#f56c6c] hover:bg-[#fef0f0]"
          >
            <Trash2 className="h-[16px] w-[16px]" />
            删除文档
          </button>
        </div>
      )}
    </div>
  )
}


const TYPE_LABEL: Record<KbDoc['ext'], string> = {
  pdf: 'PDF 文档',
  docx: 'Word 文档',
  md: 'Markdown',
  xlsx: 'Excel 表格',
  txt: '纯文本',
}

type UploadTaskStatus = 'queued' | 'parsing' | 'optimizing' | 'ready' | 'failed'

type UploadTask = {
  id: string
  docId: string
  name: string
  size: string
  status: UploadTaskStatus
  detail: string
}

const UPLOAD_STATUS_TEXT: Record<UploadTaskStatus, string> = {
  queued: '等待处理',
  parsing: '解析中',
  optimizing: '可检索，后台优化中',
  ready: '已完成',
  failed: '解析失败，可重新解析',
}

const UPLOAD_STATUS_CLASS: Record<UploadTaskStatus, string> = {
  queued: 'text-[#86909c]',
  parsing: 'text-[#166EFF]',
  optimizing: 'text-[#00B42A]',
  ready: 'text-[#86909c]',
  failed: 'text-[#F53F3F]',
}

const MAX_FILE_BYTES = 100 * 1024 * 1024
const MAX_BATCH_HINT = 50
const UPLOAD_ACCEPT = '.pdf,.doc,.docx,.md,.markdown,.txt,.xls,.xlsx'
const UPLOAD_HINT = '支持 PDF / Word / Excel / Markdown / TXT，单文件不超过 100MB，单次建议不超过 50 个'

type UploadIssue = { name: string; reason: string }

type DocSortKey = 'updated' | 'name'
type SortDirection = 'asc' | 'desc'

const SUPPORTED_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'md', 'markdown', 'txt', 'xls', 'xlsx'])

function fileExtension(name: string) {
  const index = name.lastIndexOf('.')
  return index >= 0 ? name.slice(index + 1).toLowerCase() : ''
}

function isSupportedFile(name: string) {
  return SUPPORTED_EXTENSIONS.has(fileExtension(name))
}

function docChunkCount(doc: KbDoc) {
  if (doc.status === 'queued' || doc.status === 'parsing' || doc.status === 'failed') return null
  return doc.chunks.length
}

function formatBytes(bytes: number) {
  if (!bytes) return '—'
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function formatUploadTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function extFromName(name: string): KbDoc['ext'] {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'doc' || ext === 'docx') return 'docx'
  if (ext === 'xls' || ext === 'xlsx') return 'xlsx'
  if (ext === 'txt') return 'txt'
  return 'md'
}

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3 text-[13px]">
      <span className="w-[68px] shrink-0 text-[#8c8c8c]">{label}</span>
      <span className="min-w-0 text-[#1f2329]">{children}</span>
    </div>
  )
}

function DocumentDetail({
  doc,
  kbName,
  onClose,
  onNotify,
  onAction,
  chunks,
  onChunksChange,
}: {
  doc: KbDoc
  kbName: string
  onClose: () => void
  onNotify: (message: string) => void
  onAction: (action: 'download' | 'reparse', doc: KbDoc) => void
  chunks: KbChunk[]
  onChunksChange: (chunks: KbChunk[]) => void
}) {
  const [summary, setSummary] = useState(doc.summary)
  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryDraft, setSummaryDraft] = useState(doc.summary)
  const [contentMode, setContentMode] = useState<'preview' | 'chunks'>('preview')
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null)
  const [chunkDraft, setChunkDraft] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const title = doc.name.replace(/\.[^.]+$/, '')

  const updateChunk = (id: string, patch: Partial<KbChunk>) => {
    onChunksChange(chunks.map((chunk) => (chunk.id === id ? { ...chunk, ...patch } : chunk)))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/40 p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`文档详情：${doc.name}`}
        className="mx-auto flex h-full w-full max-w-[1120px] flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_16px_56px_rgba(0,0,0,0.24)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex h-[56px] shrink-0 items-center gap-3 border-b border-[#e6e8eb] px-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#f5f7fa]">
            <DocIcon ext={doc.ext} />
          </span>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#1f2329]">
            {doc.name}
          </h1>
          <button
            onClick={() => onAction('download', doc)}
            className="flex h-[30px] cursor-pointer items-center gap-1.5 rounded px-2.5 text-[13px] text-[#606266] hover:bg-[#f5f7fa] hover:text-[#166EFF]"
          >
            <Download className="h-[15px] w-[15px]" />
            下载
          </button>
          <button
            onClick={() => onAction('reparse', doc)}
            className="flex h-[30px] cursor-pointer items-center gap-1.5 rounded px-2.5 text-[13px] text-[#606266] hover:bg-[#f5f7fa] hover:text-[#166EFF]"
          >
            <RefreshCw className="h-[15px] w-[15px]" />
            重新解析
          </button>
          <span className="h-4 w-px bg-[#e6e8eb]" />
          <button
            onClick={onClose}
            aria-label="关闭文档详情"
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded text-[#8c8c8c] hover:bg-[#f5f7fa] hover:text-[#1f2329]"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[960px] px-6 py-6 md:px-8">
            {doc.status === 'queued' && (
              <div className="mb-5 flex items-start gap-2 rounded-[6px] border border-[#e5e6eb] bg-[#f7f8fa] px-3.5 py-2.5 text-[13px] text-[#4E5969]">
                <Clock className="mt-[2px] h-[14px] w-[14px] shrink-0" />
                文档已进入解析队列，当前排队等待处理，完成后可检索。
              </div>
            )}
            {doc.status === 'parsing' && (
              <div className="mb-5 flex items-start gap-2 rounded-[6px] border border-[#d9ecff] bg-[#ecf5ff] px-3.5 py-2.5 text-[13px] text-[#166EFF]">
                <Loader2 className="mt-[2px] h-[14px] w-[14px] shrink-0 animate-spin" />
                文档正在解析，以下为最近一次解析结果，完成后会自动更新。
              </div>
            )}
            {doc.status === 'optimizing' && (
              <div className="mb-5 flex items-start gap-2 rounded-[6px] border border-[#d9ecff] bg-[#ecf5ff] px-3.5 py-2.5 text-[13px] text-[#166EFF]">
                <Sparkles className="mt-[2px] h-[14px] w-[14px] shrink-0" />
                文档已完成解析并可检索，正在生成摘要与推荐问题，完成后会自动更新。
              </div>
            )}
            {doc.status === 'failed' && (
              <div className="mb-5 flex items-start gap-2 rounded-[6px] border border-[#fde2e2] bg-[#fef0f0] px-3.5 py-2.5 text-[13px] text-[#f56c6c]">
                <AlertCircle className="mt-[2px] h-[14px] w-[14px] shrink-0" />
                <span>
                  解析失败（{doc.failure?.stage ?? '处理阶段'}）：
                  {doc.failure?.reason ?? '处理过程出现异常'}。以下为上一次成功解析结果，建议重新解析后再查看。
                </span>
              </div>
            )}
            {doc.status === 'stale' && (
              <div className="mb-5 flex items-start gap-2 rounded-[6px] border border-[#faecd8] bg-[#fdf6ec] px-3.5 py-2.5 text-[13px] text-[#b88230]">
                <RefreshCw className="mt-[2px] h-[14px] w-[14px] shrink-0" />
                文档已更新，当前内容可能不是最新版本，建议重新解析。
              </div>
            )}

            <section>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-[14px] w-[3px] rounded-full bg-[#166EFF]" />
                <h2 className="text-[15px] font-semibold text-[#1f2329]">基本信息</h2>
              </div>
              <div className="grid grid-cols-1 gap-x-10 gap-y-3.5 sm:grid-cols-2">
                <InfoCell label="上传时间">{doc.updated}:00</InfoCell>
                <InfoCell label="类型">{TYPE_LABEL[doc.ext]}</InfoCell>
                <InfoCell label="大小">{doc.size}</InfoCell>
                <InfoCell label="解析状态">
                  <StatusTag status={doc.status} />
                </InfoCell>
                <InfoCell label="分块数">
                  {chunks.length > 0 ? `${chunks.length} 个` : '—'}
                </InfoCell>
                <InfoCell label="所属知识库">{kbName}</InfoCell>
              </div>
            </section>

            <div className="my-6 h-px bg-[#f0f0f0]" />

            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-[14px] w-[3px] rounded-full bg-[#166EFF]" />
                <h2 className="text-[15px] font-semibold text-[#1f2329]">摘要</h2>
                {!editingSummary && (
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSummaryDraft(summary)
                        setEditingSummary(true)
                      }}
                      aria-label="编辑摘要"
                      title="编辑摘要"
                      className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded text-[#8c8c8c] hover:bg-[#f5f7fa] hover:text-[#166EFF]"
                    >
                      <Pencil className="h-[14px] w-[14px]" />
                    </button>
                    <button
                      onClick={() => {
                        setSummary(doc.summary)
                        setSummaryDraft(doc.summary)
                        onNotify('已重新生成摘要')
                      }}
                      aria-label="重新生成摘要"
                      title="重新生成摘要"
                      className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded text-[#8c8c8c] hover:bg-[#f5f7fa] hover:text-[#166EFF]"
                    >
                      <Sparkles className="h-[14px] w-[14px]" />
                    </button>
                  </div>
                )}
              </div>
              {editingSummary ? (
                <div>
                  <textarea
                    value={summaryDraft}
                    onChange={(event) => setSummaryDraft(event.target.value)}
                    rows={4}
                    aria-label="摘要内容"
                    className="w-full resize-none rounded-[6px] border border-[#dcdfe6] px-3 py-2.5 text-[13px] leading-6 text-[#1f2329] outline-none focus:border-[#166EFF]"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingSummary(false)}
                      className="h-[30px] cursor-pointer rounded border border-[#dcdfe6] px-3.5 text-[13px] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        setSummary(summaryDraft.trim() || doc.summary)
                        setEditingSummary(false)
                        onNotify('摘要已保存')
                      }}
                      className="h-[30px] cursor-pointer rounded bg-[#166EFF] px-3.5 text-[13px] text-white hover:bg-[#0e5fe0]"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <p className="rounded-[6px] bg-[#f7f8fa] px-4 py-3.5 text-[13px] leading-6 text-[#4e5969]">
                  {summary}
                </p>
              )}
            </section>

            <div className="my-6 h-px bg-[#f0f0f0]" />

            <section>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="h-[14px] w-[3px] rounded-full bg-[#166EFF]" />
                <h2 className="text-[15px] font-semibold text-[#1f2329]">文件内容</h2>
                <span className="text-[12px] text-[#a8abb2]">共 {chunks.length} 个片段</span>
                <div className="ml-auto flex h-[28px] items-center rounded border border-[#dcdfe6] p-0.5">
                  <button
                    onClick={() => setContentMode('preview')}
                    className={`h-[22px] cursor-pointer rounded-[3px] px-2.5 text-[12px] ${
                      contentMode === 'preview'
                        ? 'bg-[#166EFF] text-white'
                        : 'text-[#606266] hover:bg-[#f5f7fa]'
                    }`}
                  >
                    预览
                  </button>
                  <button
                    onClick={() => setContentMode('chunks')}
                    className={`h-[22px] cursor-pointer rounded-[3px] px-2.5 text-[12px] ${
                      contentMode === 'chunks'
                        ? 'bg-[#166EFF] text-white'
                        : 'text-[#606266] hover:bg-[#f5f7fa]'
                    }`}
                  >
                    查看分块
                  </button>
                </div>
              </div>

              {contentMode === 'chunks' ? (
                <div className="space-y-3">
                  {chunks.map((chunk, index) => {
                    const editing = editingChunkId === chunk.id
                    const modified = chunk.body !== chunk.originalBody
                    return (
                      <div
                        key={chunk.id}
                        className={`overflow-hidden rounded-[6px] border ${
                          chunk.enabled ? 'border-[#e6e8eb] bg-white' : 'border-[#ebeef5] bg-[#fafafa]'
                        }`}
                      >
                        <div className="flex h-[44px] items-center justify-between border-b border-[#f0f0f0] px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-[#4e5969]">片段 {index + 1}</span>
                            {!chunk.enabled && (
                              <span className="rounded bg-[#f0f2f5] px-1.5 py-0.5 text-[11px] text-[#8c8c8c]">
                                未启用
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {!editing && (
                              <button
                                onClick={() => {
                                  setChunkDraft(chunk.body)
                                  setEditingChunkId(chunk.id)
                                }}
                                aria-label={`编辑片段 ${index + 1}`}
                                title="编辑片段"
                                className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded text-[#8c8c8c] hover:bg-[#f5f7fa] hover:text-[#166EFF]"
                              >
                                <Pencil className="h-[14px] w-[14px]" />
                              </button>
                            )}
                            {!editing && modified && (
                              <button
                                onClick={() => {
                                  updateChunk(chunk.id, { body: chunk.originalBody })
                                  onNotify(`片段 ${index + 1} 已恢复为原始内容`)
                                }}
                                aria-label={`恢复片段 ${index + 1}`}
                                title="恢复原文"
                                className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded text-[#8c8c8c] hover:bg-[#f5f7fa] hover:text-[#166EFF]"
                              >
                                <RotateCcw className="h-[14px] w-[14px]" />
                              </button>
                            )}
                            <button
                              role="switch"
                              aria-checked={chunk.enabled}
                              aria-label={`${chunk.enabled ? '关闭' : '启用'}片段 ${index + 1}`}
                              title={chunk.enabled ? '关闭片段' : '启用片段'}
                              onClick={() => {
                                updateChunk(chunk.id, { enabled: !chunk.enabled })
                                onNotify(
                                  chunk.enabled
                                    ? `片段 ${index + 1} 已关闭，将不参与检索`
                                    : `片段 ${index + 1} 已启用`,
                                )
                              }}
                              className={`relative h-[18px] w-[32px] cursor-pointer rounded-full transition-colors ${
                                chunk.enabled ? 'bg-[#00b96b]' : 'bg-[#dcdfe6]'
                              }`}
                            >
                              <span
                                className={`absolute left-0 top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${
                                  chunk.enabled ? 'translate-x-[16px]' : 'translate-x-[2px]'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {editing ? (
                          <div className="px-4 py-3">
                            <textarea
                              value={chunkDraft}
                              onChange={(event) => setChunkDraft(event.target.value)}
                              rows={4}
                              aria-label={`片段 ${index + 1} 内容`}
                              className="w-full resize-y rounded-[4px] border border-[#dcdfe6] px-3 py-2 text-[13px] leading-6 text-[#1f2329] outline-none focus:border-[#166EFF]"
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                onClick={() => setEditingChunkId(null)}
                                className="h-[28px] cursor-pointer rounded border border-[#dcdfe6] px-3 text-[12px] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => {
                                  if (!chunkDraft.trim()) {
                                    onNotify('片段内容不能为空')
                                    return
                                  }
                                  updateChunk(chunk.id, { body: chunkDraft.trim() })
                                  setEditingChunkId(null)
                                  onNotify(`片段 ${index + 1} 内容已保存`)
                                }}
                                className="h-[28px] cursor-pointer rounded bg-[#166EFF] px-3 text-[12px] text-white hover:bg-[#0e5fe0]"
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`px-4 py-3.5 ${chunk.enabled ? '' : 'opacity-55'}`}>
                            {chunk.showHeading && (
                              <h4 className="mb-1.5 text-[14px] font-semibold text-[#1f2329]">
                                {chunk.heading}
                              </h4>
                            )}
                            <p className="whitespace-pre-line text-[13px] leading-[24px] text-[#4e5969]">
                              {chunk.body}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-[6px] border border-[#e6e8eb] bg-[#eef0f3] px-3 py-4 md:px-5">
                  <div className="mx-auto min-h-[420px] w-full max-w-[700px] bg-white px-6 py-8 shadow-[0_1px_4px_rgba(0,0,0,0.08)] md:px-12 md:py-10">
                    <h3 className="text-center text-[19px] font-semibold leading-8 text-[#1f2329]">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-center text-[11px] text-[#a8abb2]">
                      {kbName} · 更新于 {doc.updated}
                    </p>
                    <div className="mt-7 space-y-5">
                      {doc.sections.map((section, index) => (
                        <div key={section.heading}>
                          <h4 className="mb-1.5 text-[14px] font-semibold text-[#1f2329]">
                            {index + 1}. {section.heading}
                          </h4>
                          <p className="whitespace-pre-line text-[13px] leading-[26px] text-[#4e5969]">
                            {section.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KnowledgeBaseWorkspace({
  kb,
  onBack,
  onNotify,
}: {
  kb: KbRecord
  onBack: () => void
  onNotify: (message: string) => void
}) {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'all' | DocStatus>('all')
  const [view, setView] = useState<'list' | 'card'>('card')
  const [sortKey, setSortKey] = useState<DocSortKey>('updated')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [selected, setSelected] = useState<string[]>([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadIssues, setUploadIssues] = useState<UploadIssue[]>([])
  const [uploadIssueAccepted, setUploadIssueAccepted] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<KbDoc[]>([])
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([])
  const [taskPanelOpen, setTaskPanelOpen] = useState(false)
  const [taskPanelCollapsed, setTaskPanelCollapsed] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<KbDoc | null>(null)
  const [activeDoc, setActiveDoc] = useState<KbDoc | null>(null)
  const [chunkOverrides, setChunkOverrides] = useState<Record<string, KbChunk[]>>({})
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [docTotal, setDocTotal] = useState(kb.docs)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [retrievalOpen, setRetrievalOpen] = useState(false)
  const [rebuildOpen, setRebuildOpen] = useState(false)
  const indexStates = useKbIndexStates()
  const indexState = indexStates[kb.name]
  const { models, defaults } = useModelRegistry()
  const defaultEmbedding = models.find(
    (model) => model.id === defaults.embedding && model.capability === 'embedding',
  )
  const fileRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const uploadMenuRef = useRef<HTMLDivElement>(null)
  const uploadTimersRef = useRef<number[]>([])
  const uploadSeqRef = useRef(0)
  const dragDepthRef = useRef(0)

  useEffect(() => {
    folderRef.current?.setAttribute('webkitdirectory', '')
    folderRef.current?.setAttribute('directory', '')
  }, [])

  useEffect(() => {
    return () => {
      uploadTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    if (!uploadOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (!uploadMenuRef.current?.contains(event.target as Node)) setUploadOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUploadOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [uploadOpen])

  useEffect(() => {
    setRemovedIds([])
    setDocTotal(kb.docs)
    setOpenMenuId(null)
    setSelected([])
    setPage(1)
    setActiveDoc(null)
    setChunkOverrides({})
  }, [kb.name, kb.docs])

  const docs = useMemo(
    () =>
      [...uploadedDocs, ...buildDocs(kb)].filter((doc) => !removedIds.includes(doc.id)),
    [kb, removedIds, uploadedDocs],
  )
  const filteredDocs = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    const result = docs.filter((doc) => {
      const matchStatus = status === 'all' || doc.status === status
      const matchKeyword = !kw || doc.name.toLowerCase().includes(kw)
      return matchStatus && matchKeyword
    })
    return result.sort((a, b) => {
      const compared =
        sortKey === 'updated'
          ? a.updated.localeCompare(b.updated)
          : a.name.localeCompare(b.name, 'zh-CN')
      const primary = sortDirection === 'asc' ? compared : -compared
      return primary !== 0 ? primary : a.name.localeCompare(b.name, 'zh-CN')
    })
  }, [docs, keyword, sortDirection, sortKey, status])

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedDocs = filteredDocs.slice((safePage - 1) * pageSize, safePage * pageSize)

  const allSelected =
    pagedDocs.length > 0 && pagedDocs.every((doc) => selected.includes(doc.id))

  const changeStatus = (next: 'all' | DocStatus) => {
    setStatus(next)
    setSelected([])
    setPage(1)
  }

  const changeSort = (next: DocSortKey) => {
    if (next === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(next)
      setSortDirection(next === 'updated' ? 'desc' : 'asc')
    }
    setPage(1)
  }

  const toggleDoc = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelected((prev) => {
      const visible = pagedDocs.map((doc) => doc.id)
      if (visible.every((id) => prev.includes(id))) {
        return prev.filter((id) => !visible.includes(id))
      }
      return Array.from(new Set([...prev, ...visible]))
    })
  }

  const pickFiles = () => {
    setUploadOpen(false)
    fileRef.current?.click()
  }

  const pickFolder = () => {
    setUploadOpen(false)
    folderRef.current?.click()
  }

  const syncUploadStatus = (
    taskId: string,
    docId: string,
    next: UploadTaskStatus,
  ) => {
    setUploadTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: next, detail: UPLOAD_STATUS_TEXT[next] }
          : task,
      ),
    )
    setUploadedDocs((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status: next } : doc)),
    )
    setActiveDoc((prev) => (prev?.id === docId ? { ...prev, status: next } : prev))
  }

  const handleFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return

    const existingNames = new Set(docs.map((doc) => doc.name))
    const seenNames = new Set(existingNames)
    const issues: UploadIssue[] = []
    const accepted: File[] = []

    files.forEach((file) => {
      const name = file.name
      if (!isSupportedFile(name)) {
        issues.push({ name, reason: '格式不支持，仅支持 PDF / Word / Excel / Markdown / TXT' })
        return
      }
      if (file.size > MAX_FILE_BYTES) {
        issues.push({ name, reason: '超过 100MB 单文件上限' })
        return
      }
      if (existingNames.has(name)) {
        issues.push({ name, reason: '当前知识库已有同名文件' })
        return
      }
      if (seenNames.has(name)) {
        issues.push({ name, reason: '本批次内有同名文件' })
        return
      }
      seenNames.add(name)
      accepted.push(file)
    })

    setUploadIssues(issues)
    setUploadIssueAccepted(accepted.length)
    if (accepted.length === 0) return

    const now = new Date()
    const nextDocs: KbDoc[] = []
    const nextTasks: UploadTask[] = []

    accepted.forEach((file, index) => {
      const seq = uploadSeqRef.current++
      const template = DOC_TEMPLATES[seq % DOC_TEMPLATES.length]
      const docId = `upload-${now.getTime()}-${seq}`
      const taskId = `task-${now.getTime()}-${seq}`
      nextDocs.push({
        id: docId,
        name: file.name,
        ext: extFromName(file.name),
        size: formatBytes(file.size),
        updated: formatUploadTime(now),
        status: 'queued',
        chunks: buildChunks(template.sections),
        summary: template.summary,
        sections: template.sections,
      })
      nextTasks.push({
        id: taskId,
        docId,
        name: file.name,
        size: formatBytes(file.size),
        status: 'queued',
        detail: UPLOAD_STATUS_TEXT.queued,
      })

      uploadTimersRef.current.push(
        window.setTimeout(() => syncUploadStatus(taskId, docId, 'parsing'), 1000 + index * 600),
        window.setTimeout(
          () => syncUploadStatus(taskId, docId, 'optimizing'),
          3200 + index * 800,
        ),
        window.setTimeout(() => syncUploadStatus(taskId, docId, 'ready'), 6200 + index * 1000),
      )
    })

    setUploadedDocs((prev) => [...nextDocs, ...prev])
    setUploadTasks((prev) => [...nextTasks, ...prev.filter((task) => task.status !== 'ready')])
    setDocTotal((prev) => prev + nextDocs.length)
    setStatus('all')
    setKeyword('')
    setSelected([])
    setPage(1)
    setTaskPanelOpen(true)
    setTaskPanelCollapsed(false)
    if (issues.length === 0) {
      onNotify(
        accepted.length > MAX_BATCH_HINT
          ? `已添加 ${accepted.length} 个文件，数量较多，建议分批查看处理进度`
          : `已添加 ${accepted.length} 个文件，正在后台处理`,
      )
    }
  }

  const handleDocAction = (action: 'download' | 'reparse' | 'delete', doc: KbDoc) => {
    setOpenMenuId(null)
    if (action === 'download') {
      onNotify(`「${doc.name}」下载功能待接入`)
      return
    }
    if (action === 'reparse') {
      onNotify(`已提交「${doc.name}」重新解析，完成后自动更新状态`)
      return
    }
    setDeleteTarget(doc)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const name = deleteTarget.name
    setRemovedIds((prev) => [...prev, deleteTarget.id])
    setSelected((prev) => prev.filter((id) => id !== deleteTarget.id))
    setDocTotal((prev) => Math.max(0, prev - 1))
    setDeleteTarget(null)
    onNotify(`已删除「${name}」及其分块`)
  }

  const batchAction = (label: string) => {
    onNotify(`已选择 ${selected.length} 个文档，${label}功能待接入`)
  }

  const taskTotal = uploadTasks.length
  const taskSearchable = uploadTasks.filter(
    (task) => task.status === 'optimizing' || task.status === 'ready',
  ).length
  const taskActive = uploadTasks.filter(
    (task) =>
      task.status === 'queued' || task.status === 'parsing' || task.status === 'optimizing',
  ).length
  const taskProcessing = uploadTasks.filter(
    (task) => task.status === 'queued' || task.status === 'parsing',
  ).length
  const taskFailed = uploadTasks.filter((task) => task.status === 'failed').length
  const taskDone = uploadTasks.filter(
    (task) => task.status === 'ready' || task.status === 'failed',
  ).length
  const taskProgress = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    dragDepthRef.current += 1
    setDragActive(true)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setDragActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    dragDepthRef.current = 0
    setDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col bg-white"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={UPLOAD_ACCEPT}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <input
        ref={folderRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />

      {dragActive && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#166EFF]/[0.06] p-6 backdrop-blur-[1px]">
          <div className="w-full max-w-[460px] rounded-[10px] border-2 border-dashed border-[#166EFF] bg-white/95 px-8 py-7 text-center shadow-[0_12px_40px_rgba(22,110,255,0.18)]">
            <UploadCloud className="mx-auto h-[34px] w-[34px] text-[#166EFF]" strokeWidth={1.7} />
            <p className="mt-3 text-[15px] font-semibold text-[#1f2329]">释放文件，开始上传</p>
            <p className="mt-1.5 text-[12px] leading-5 text-[#8c8c8c]">{UPLOAD_HINT}</p>
          </div>
        </div>
      )}

      {/* 页面顶部导航：返回 + 页面类型，不使用面包屑 */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[#e6e8eb] bg-white px-6">
        <button
          onClick={onBack}
          aria-label="返回知识库列表"
          title="返回知识库列表"
          className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[4px] text-[#606266] hover:bg-[#f5f7fa] hover:text-[#166EFF]"
        >
          <ArrowLeft className="h-[15px] w-[15px]" />
        </button>
        <span className="text-[13px] text-[#1f2329]">知识库详情</span>
      </div>

      <header className="shrink-0 border-b border-[#e6e8eb] bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <h1 className="truncate text-[20px] font-semibold leading-[28px] text-[#1f2329]">
                {kb.name}
              </h1>
              <span className="shrink-0 text-[13px] text-[#8c8c8c]">{docTotal} 篇文档</span>
              {indexState?.status === 'stale' && (
                <span className="shrink-0 rounded-[3px] bg-[#FFF7E8] px-[6px] py-[1px] text-[11px] text-[#8A4B00]">
                  索引待重建
                </span>
              )}
              {indexState?.status === 'rebuilding' && (
                <span className="flex shrink-0 items-center gap-[4px] rounded-[3px] bg-[#E8F3FF] px-[6px] py-[1px] text-[11px] text-[#166EFF]">
                  <Loader2 className="h-[10px] w-[10px] animate-spin" />
                  重建中 {indexState.progress ?? 0}%
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setRetrievalOpen(true)}
              className="flex h-[30px] cursor-pointer items-center gap-1.5 rounded border border-[#dcdfe6] px-3 text-[13px] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]"
            >
              <Search className="h-[14px] w-[14px]" />
              召回测试
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex h-[30px] cursor-pointer items-center gap-1.5 rounded border border-[#dcdfe6] px-3 text-[13px] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]"
            >
              <Settings2 className="h-[14px] w-[14px]" />
              库设置
            </button>
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-[20px] text-[#8c8c8c]">
          {kb.desc}
        </p>
      </header>

      {indexState && indexState.status !== 'ready' && (
        <div className="flex shrink-0 items-start gap-[8px] border-b border-[#FFE4BA] bg-[#FFF7E8] px-6 py-[9px]">
          <RefreshCw className={`mt-[2px] h-[14px] w-[14px] shrink-0 text-[#FF7D00] ${indexState.status === 'rebuilding' ? 'animate-spin' : ''}`} />
          <div className="min-w-0 flex-1 text-[12.5px] leading-[18px] text-[#8A4B00]">
            {indexState.status === 'stale' ? (
              <p>
                当前索引由 {indexState.modelName} 生成，平台默认向量模型已更换为{' '}
                {indexState.targetModelName ?? defaultEmbedding?.name ?? '新模型'}。
                重建完成前仍按旧索引检索。
              </p>
            ) : (
              <p>
                正在使用 {indexState.targetModelName ?? defaultEmbedding?.name ?? '新模型'} 重建索引（
                {indexState.progress ?? 0}%），期间仍可检索，结果可能不是最新索引。
              </p>
            )}
          </div>
          {indexState.status === 'stale' && (
            <button
              type="button"
              onClick={() => setRebuildOpen(true)}
              className="shrink-0 cursor-pointer rounded-[3px] border border-[#FFD08A] bg-white px-[10px] py-[2px] text-[12px] text-[#8A4B00] hover:border-[#FF7D00]"
            >
              重建索引
            </button>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="flex min-h-full flex-col">
          {docTotal === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
              <FileText className="mb-3 h-[30px] w-[30px] text-[#c0c4cc]" />
              <p className="text-[14px] font-medium text-[#1f2329]">这个库还没有文档</p>
              <p className="mt-1 text-[13px] text-[#8c8c8c]">
                上传第一篇文档，平台会自动解析、切分并建立索引。
              </p>
              <p className="mt-1.5 text-[12px] text-[#a8abb2]">
                {UPLOAD_HINT}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={pickFiles}
                  className="flex h-[34px] cursor-pointer items-center gap-1.5 rounded bg-[#166EFF] px-4 text-[13px] text-white hover:bg-[#0e5fe0]"
                >
                  <Plus className="h-[15px] w-[15px]" />
                  上传文档
                </button>
                <button
                  onClick={pickFolder}
                  className="flex h-[34px] cursor-pointer items-center gap-1.5 rounded border border-[#dcdfe6] px-3.5 text-[13px] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]"
                >
                  <FolderPlus className="h-[15px] w-[15px]" />
                  上传文件夹
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-[#f0f0f0] px-6 py-3">
                <div className="relative inline-flex h-[32px]" ref={uploadMenuRef}>
                  <button
                    onClick={pickFiles}
                    className="flex cursor-pointer items-center gap-1.5 rounded-l bg-[#166EFF] px-3.5 text-[13px] text-white hover:bg-[#0e5fe0]"
                  >
                    <Plus className="h-[15px] w-[15px]" />
                    上传文档
                  </button>
                  <button
                    onClick={() => setUploadOpen((open) => !open)}
                    aria-label="更多上传方式"
                    aria-haspopup="menu"
                    aria-expanded={uploadOpen}
                    className="flex w-[30px] cursor-pointer items-center justify-center rounded-r border-l border-white/30 bg-[#166EFF] text-white hover:bg-[#0e5fe0]"
                  >
                    <ChevronDown className="h-[14px] w-[14px]" />
                  </button>
                  {uploadOpen && (
                    <div
                      role="menu"
                      aria-label="更多上传方式"
                      className="absolute left-0 top-full z-30 mt-1.5 w-[300px] rounded-[6px] border border-[#e6e8eb] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                    >
                      <button
                        role="menuitem"
                        onClick={pickFolder}
                        className="flex h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-[4px] px-3 text-[13px] text-[#1f2329] hover:bg-[#f5f7fa]"
                      >
                        <FolderPlus className="h-[17px] w-[17px] text-[#606266]" />
                        <span className="text-left">
                          上传文件夹
                          <span className="mt-0.5 block text-[11px] text-[#a8abb2]">
                            选择整个文件夹，批量加入当前知识库
                          </span>
                        </span>
                      </button>
                      <div className="mx-1 mt-1 border-t border-[#f0f0f0] px-2 pb-2 pt-2 text-[11px] leading-[17px] text-[#8c8c8c]">
                        {UPLOAD_HINT}
                        <span className="mt-0.5 block text-[#a8abb2]">
                          也可以把文件直接拖拽到文档列表。
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <div className="relative flex h-[32px] items-stretch rounded border border-[#dcdfe6] bg-white focus-within:border-[#166EFF]">
                    <div className="relative flex items-center">
                      <select
                        aria-label="状态筛选"
                        value={status}
                        onChange={(event) => changeStatus(event.target.value as 'all' | DocStatus)}
                        className="h-full cursor-pointer appearance-none bg-transparent pl-3 pr-7 text-[13px] text-[#606266] outline-none"
                      >
                        <option value="all">全部状态</option>
                        <option value="queued">排队中</option>
                        <option value="parsing">解析中</option>
                        <option value="optimizing">优化中</option>
                        <option value="ready">已解析</option>
                        <option value="failed">失败</option>
                        <option value="stale">需重新解析</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 h-[13px] w-[13px] text-[#a8abb2]" />
                    </div>
                    <span className="my-1.5 w-px shrink-0 bg-[#e6e8eb]" />
                    <div className="flex flex-1 items-center pl-2.5">
                      <Search className="h-[14px] w-[14px] shrink-0 text-[#a8abb2]" />
                      <input
                        value={keyword}
                        onChange={(event) => {
                          setKeyword(event.target.value)
                          setSelected([])
                          setPage(1)
                        }}
                        placeholder="搜索文档名称..."
                        className="h-full w-[170px] bg-transparent px-2 text-[13px] text-[#1f2329] outline-none placeholder:text-[#a8abb2]"
                      />
                    </div>
                  </div>

                  <div className="flex h-[32px] items-center rounded border border-[#dcdfe6] p-0.5">
                    <button
                      onClick={() => setView('card')}
                      aria-label="卡片视图"
                      title="卡片视图"
                      className={`flex h-[26px] w-[28px] cursor-pointer items-center justify-center rounded-[3px] ${
                        view === 'card' ? 'bg-[#ecf5ff] text-[#166EFF]' : 'text-[#8c8c8c]'
                      }`}
                    >
                      <LayoutGrid className="h-[15px] w-[15px]" />
                    </button>
                    <button
                      onClick={() => setView('list')}
                      aria-label="列表视图"
                      title="列表视图"
                      className={`flex h-[26px] w-[28px] cursor-pointer items-center justify-center rounded-[3px] ${
                        view === 'list' ? 'bg-[#ecf5ff] text-[#166EFF]' : 'text-[#8c8c8c]'
                      }`}
                    >
                      <List className="h-[15px] w-[15px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-6 py-4">
                {filteredDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[#dcdfe6] py-20">
                    <Search className="mb-3 h-[26px] w-[26px] text-[#c0c4cc]" />
                    <p className="text-[14px] font-medium text-[#1f2329]">没有匹配的文档</p>
                    <button
                      onClick={() => {
                        setKeyword('')
                        setStatus('all')
                        setPage(1)
                      }}
                      className="mt-3 cursor-pointer text-[13px] text-[#166EFF]"
                    >
                      清除筛选
                    </button>
                  </div>
                ) : view === 'card' ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {pagedDocs.map((doc) => {
                      const checked = selected.includes(doc.id)
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setActiveDoc(doc)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') setActiveDoc(doc)
                          }}
                          tabIndex={0}
                          className={`relative cursor-pointer rounded-[6px] border bg-white p-4 transition-shadow hover:border-[#c9d8f5] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus-visible:border-[#166EFF] ${
                            checked ? 'border-[#166EFF]' : 'border-[#e6e8eb]'
                          }`}
                        >
                          <div className="absolute right-2.5 top-2.5 z-10">
                            <DocActions
                              doc={doc}
                              open={openMenuId === doc.id}
                              onToggle={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                              onAction={handleDocAction}
                            />
                          </div>
                          <div className="flex items-start gap-2.5 pr-10">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDoc(doc.id)}
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                              aria-label={`选择 ${doc.name}`}
                              className="mt-[3px] h-[14px] w-[14px] shrink-0 cursor-pointer accent-[#166EFF]"
                            />
                            <span className="mt-[1px] shrink-0">
                              <DocIcon ext={doc.ext} />
                            </span>
                            <h3
                              className="line-clamp-2 min-h-[40px] text-[14px] font-medium leading-[20px] text-[#1f2329]"
                              title={doc.name}
                            >
                              {doc.name}
                            </h3>
                          </div>
                          <p className="mt-2 text-[12px] text-[#8c8c8c]">
                            {doc.ext.toUpperCase()} · {doc.size}
                            {docChunkCount(doc) !== null ? ` · ${docChunkCount(doc)} 个分块` : ''}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <StatusTag status={doc.status} />
                            <span className="flex items-center gap-1 text-[12px] text-[#a8abb2]">
                              <Clock className="h-[12px] w-[12px]" />
                              {doc.updated.slice(5)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-[6px] border border-[#e6e8eb]">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="h-[42px] bg-[#fafafa] text-[12px] text-[#8c8c8c]">
                          <th className="w-[44px] pl-4">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={toggleAll}
                              aria-label="全选当前文档"
                              className="h-[14px] w-[14px] cursor-pointer accent-[#166EFF]"
                            />
                          </th>
                          <th className="font-normal">
                            <button
                              onClick={() => changeSort('name')}
                              className="flex cursor-pointer items-center gap-1 text-[12px] text-[#8c8c8c] hover:text-[#166EFF]"
                            >
                              文件名
                              <SortIndicator active={sortKey === 'name'} direction={sortDirection} />
                            </button>
                          </th>
                          <th className="w-[100px] font-normal">大小</th>
                          <th className="w-[120px] font-normal">状态</th>
                          <th className="w-[80px] font-normal">分块数</th>
                          <th className="w-[160px] font-normal">
                            <button
                              onClick={() => changeSort('updated')}
                              className="flex cursor-pointer items-center gap-1 text-[12px] text-[#8c8c8c] hover:text-[#166EFF]"
                            >
                              更新时间
                              <SortIndicator
                                active={sortKey === 'updated'}
                                direction={sortDirection}
                              />
                            </button>
                          </th>
                          <th className="w-[120px]" />
                        </tr>
                      </thead>
                      <tbody>
                        {pagedDocs.map((doc) => {
                          const checked = selected.includes(doc.id)
                          return (
                            <tr
                              key={doc.id}
                              onClick={() => setActiveDoc(doc)}
                              className={`h-[56px] cursor-pointer border-t border-[#f0f0f0] text-[13px] ${
                                checked ? 'bg-[#f5f9ff]' : 'hover:bg-[#fafcff]'
                              }`}
                            >
                              <td className="pl-4">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleDoc(doc.id)}
                                  onClick={(event) => event.stopPropagation()}
                                  onKeyDown={(event) => event.stopPropagation()}
                                  aria-label={`选择 ${doc.name}`}
                                  className="h-[14px] w-[14px] cursor-pointer accent-[#166EFF]"
                                />
                              </td>
                              <td className="pr-4">
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <DocIcon ext={doc.ext} />
                                  <span className="truncate text-[#1f2329]" title={doc.name}>
                                    {doc.name}
                                  </span>
                                </div>
                              </td>
                              <td className="text-[12px] text-[#606266]">{doc.size}</td>
                              <td>
                                <StatusTag status={doc.status} />
                              </td>
                              <td className="text-[12px] tabular-nums text-[#606266]">
                                {docChunkCount(doc) ?? '—'}
                              </td>
                              <td className="text-[12px] text-[#8c8c8c]">{doc.updated}</td>
                              <td>
                                <div className="flex items-center justify-end gap-1 pr-2">
                                  {(doc.status === 'failed' || doc.status === 'stale') && (
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        handleDocAction('reparse', doc)
                                      }}
                                      className="h-[26px] shrink-0 cursor-pointer rounded px-2 text-[12px] text-[#166EFF] hover:bg-[#f0f6ff]"
                                    >
                                      重新解析
                                    </button>
                                  )}
                                  <DocActions
                                    doc={doc}
                                    open={openMenuId === doc.id}
                                    onToggle={() =>
                                      setOpenMenuId(openMenuId === doc.id ? null : doc.id)
                                    }
                                    onAction={handleDocAction}
                                  />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f0f0] pt-3">
                  <p className="text-[12px] text-[#a8abb2]">
                    {filteredDocs.length === docs.length
                      ? `演示数据：最近 ${docs.length} 篇，共 ${docTotal} 篇`
                      : `筛选结果 ${filteredDocs.length} 篇`}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12.5px] text-[#606266]">
                      共 {filteredDocs.length} 条
                    </span>
                    <select
                      aria-label="每页条数"
                      value={String(pageSize)}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value))
                        setPage(1)
                      }}
                      className="h-[30px] cursor-pointer rounded border border-[#dcdfe6] bg-white px-2 text-[12.5px] text-[#606266] outline-none"
                    >
                      {DOC_PAGE_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size} 条/页
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={safePage <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      aria-label="上一页"
                      className={`flex h-[30px] w-[30px] items-center justify-center rounded border ${
                        safePage <= 1
                          ? 'cursor-not-allowed border-[#ebeef5] text-[#c0c4cc]'
                          : 'cursor-pointer border-[#dcdfe6] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]'
                      }`}
                    >
                      <ChevronLeft className="h-[14px] w-[14px]" />
                    </button>
                    <span className="min-w-[44px] text-center text-[12.5px] text-[#606266]">
                      {safePage} / {totalPages}
                    </span>
                    <button
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      aria-label="下一页"
                      className={`flex h-[30px] w-[30px] items-center justify-center rounded border ${
                        safePage >= totalPages
                          ? 'cursor-not-allowed border-[#ebeef5] text-[#c0c4cc]'
                          : 'cursor-pointer border-[#dcdfe6] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]'
                      }`}
                    >
                      <ChevronRight className="h-[14px] w-[14px]" />
                    </button>
                  </div>
                </div>
              </div>

              {selected.length > 0 && (
                <div className="sticky bottom-0 z-20 border-t border-[#e6e8eb] bg-white/95 px-6 py-3 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[13px] text-[#1f2329]">
                      已选 <span className="font-medium text-[#166EFF]">{selected.length}</span> 项
                    </span>
                    <button
                      onClick={toggleAll}
                      className="cursor-pointer text-[13px] text-[#606266] hover:text-[#166EFF]"
                    >
                      全选本页
                    </button>
                    <button
                      onClick={() => setSelected([])}
                      className="cursor-pointer text-[13px] text-[#606266] hover:text-[#166EFF]"
                    >
                      取消选择
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => batchAction('批量下载')}
                        className="flex h-[30px] cursor-pointer items-center gap-1 rounded border border-[#dcdfe6] px-3 text-[12px] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]"
                      >
                        <Download className="h-[13px] w-[13px]" />
                        批量下载
                      </button>
                      <button
                        onClick={() => batchAction('重新解析')}
                        className="flex h-[30px] cursor-pointer items-center gap-1 rounded border border-[#dcdfe6] px-3 text-[12px] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]"
                      >
                        <RefreshCw className="h-[13px] w-[13px]" />
                        重新解析
                      </button>
                      <button
                        onClick={() => batchAction('批量删除')}
                        className="flex h-[30px] cursor-pointer items-center gap-1 rounded border border-[#fde2e2] px-3 text-[12px] text-[#f56c6c] hover:bg-[#fef0f0]"
                      >
                        <Trash2 className="h-[13px] w-[13px]" />
                        批量删除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {taskPanelOpen && uploadTasks.length > 0 && (
        <section
          aria-label="上传与处理任务"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[10px] border border-[#e6e8eb] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.16)]"
        >
          <div className={`flex items-center gap-2.5 px-3.5 pt-3 ${taskPanelCollapsed ? 'pb-3' : ''}`}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                taskActive > 0 ? 'bg-[#ecf5ff] text-[#166EFF]' : 'bg-[#f0f9eb] text-[#00B42A]'
              }`}
            >
              {taskActive > 0 ? (
                <Loader2 className="h-[15px] w-[15px] animate-spin" />
              ) : (
                <CheckCircle2 className="h-[15px] w-[15px]" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-[18px] text-[#1f2329]">
                {taskActive > 0
                  ? `正在入库 ${taskDone}/${taskTotal}`
                  : taskFailed > 0
                    ? `入库结束，${taskFailed} 个失败`
                    : `入库完成 ${taskTotal}/${taskTotal}`}
              </p>
              <p className="mt-0.5 truncate text-[11px] leading-[15px] text-[#86909c]">
                上传至「{kb.name}」
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTaskPanelCollapsed((collapsed) => !collapsed)}
              aria-label={taskPanelCollapsed ? '展开任务面板' : '收起任务面板'}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[#86909c] hover:bg-[#f5f7fa] hover:text-[#1f2329]"
            >
              <ChevronDown
                className={`h-[14px] w-[14px] transition-transform ${
                  taskPanelCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                setTaskPanelOpen(false)
                if (taskActive > 0) {
                  onNotify('任务已转入后台，可在文档列表查看处理进度')
                }
              }}
              aria-label="关闭任务面板"
              title="关闭后任务继续在后台处理"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[#86909c] hover:bg-[#f5f7fa] hover:text-[#1f2329]"
            >
              <X className="h-[14px] w-[14px]" />
            </button>
          </div>

          {!taskPanelCollapsed && (
            <>
              <div className="mt-2.5 h-1 w-full overflow-hidden bg-[#f0f1f3]">
                <div
                  className="h-full rounded-r-full bg-[#00B42A] transition-[width] duration-500"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-[#00B42A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00B42A]" />
                  可检索 {taskSearchable}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#86909c]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c9cdd4]" />
                  处理中 {taskProcessing}
                </span>
                {taskFailed > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[#F53F3F]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F53F3F]" />
                    失败 {taskFailed}
                  </span>
                )}
              </div>

              <div className="max-h-[236px] overflow-y-auto border-t border-[#f0f0f0] py-1">
                {uploadTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2.5 px-3.5 py-2 hover:bg-[#f7f8fa]"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#e6e8eb] bg-[#fafbfc]">
                      <FileText className="h-[14px] w-[14px] text-[#86909c]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] leading-[17px] text-[#1f2329]" title={task.name}>
                        {task.name}
                      </p>
                      <p
                        className={`mt-0.5 truncate text-[11px] leading-[16px] ${UPLOAD_STATUS_CLASS[task.status]}`}
                      >
                        {UPLOAD_STATUS_TEXT[task.status]}
                        <span className="text-[#a8abb2]"> · {task.size}</span>
                      </p>
                    </div>
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                      {task.status === 'queued' && (
                        <Clock className="h-[14px] w-[14px] text-[#a8abb2]" />
                      )}
                      {task.status === 'parsing' && (
                        <Loader2 className="h-[14px] w-[14px] animate-spin text-[#166EFF]" />
                      )}
                      {(task.status === 'optimizing' || task.status === 'ready') && (
                        <CheckCircle2 className="h-[14px] w-[14px] text-[#00B42A]" />
                      )}
                      {task.status === 'failed' && (
                        <AlertCircle className="h-[14px] w-[14px] text-[#F53F3F]" />
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {taskActive > 0 ? (
                <div className="mx-3 mb-3 mt-1 flex items-start gap-1.5 rounded-[4px] bg-[#f0f9eb] px-2.5 py-2 text-[11px] leading-[16px] text-[#529b2e]">
                  <CheckCircle2 className="mt-[1px] h-[12px] w-[12px] shrink-0" />
                  文件已全部上传，处理在后台继续，可以放心离开此页面。
                </div>
              ) : taskFailed > 0 ? (
                <div className="mx-3 mb-3 mt-1 flex items-start gap-1.5 rounded-[4px] bg-[#fef0f0] px-2.5 py-2 text-[11px] leading-[16px] text-[#F53F3F]">
                  <AlertCircle className="mt-[1px] h-[12px] w-[12px] shrink-0" />
                  有 {taskFailed} 个文件处理失败，可在文档列表中重新解析。
                </div>
              ) : (
                <div className="mx-3 mb-3 mt-1 flex items-start gap-1.5 rounded-[4px] bg-[#f5f7fa] px-2.5 py-2 text-[11px] leading-[16px] text-[#4e5969]">
                  <CheckCircle2 className="mt-[1px] h-[12px] w-[12px] shrink-0 text-[#00B42A]" />
                  全部文件已处理完成，可在文档列表中查看并检索。
                </div>
              )}
            </>
          )}
        </section>
      )}

      {uploadIssues.length > 0 && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setUploadIssues([])
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={uploadIssueAccepted > 0 ? '部分文件未添加' : '文件未添加'}
            className="w-full max-w-[500px] rounded-[10px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start gap-3 px-5 pb-3 pt-5">
              <span className="mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#FFF7E8]">
                <TriangleAlert className="h-[17px] w-[17px] text-[#FF7D00]" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold text-[#1f2329]">
                  {uploadIssueAccepted > 0 ? '部分文件未添加' : '文件未添加'}
                </h3>
                <p className="mt-1 text-[13px] leading-5 text-[#4e5969]">
                  {uploadIssueAccepted > 0
                    ? `已开始处理 ${uploadIssueAccepted} 个文件；以下 ${uploadIssues.length} 个文件未添加。`
                    : `以下 ${uploadIssues.length} 个文件未添加，请调整后重试。`}
                </p>
              </div>
              <button
                onClick={() => setUploadIssues([])}
                aria-label="关闭"
                className="flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center rounded text-[#8c8c8c] hover:bg-[#f5f7fa] hover:text-[#1f2329]"
              >
                <X className="h-[15px] w-[15px]" />
              </button>
            </div>
            <div className="mx-5 max-h-[240px] overflow-auto rounded-[6px] border border-[#f0f0f0] bg-[#fafafa]">
              {uploadIssues.map((issue, index) => (
                <div
                  key={`${issue.name}-${index}`}
                  className={`flex items-start justify-between gap-4 px-3 py-2.5 ${
                    index > 0 ? 'border-t border-[#f0f0f0]' : ''
                  }`}
                >
                  <span className="min-w-0 truncate text-[12.5px] text-[#1f2329]" title={issue.name}>
                    {issue.name}
                  </span>
                  <span className="shrink-0 text-[12px] text-[#8c8c8c]">{issue.reason}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end px-5 py-4">
              <button
                onClick={() => setUploadIssues([])}
                className="h-[32px] cursor-pointer rounded bg-[#166EFF] px-4 text-[13px] text-white hover:bg-[#0e5fe0]"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {activeDoc && (
        <DocumentDetail
          key={activeDoc.id}
          doc={activeDoc}
          kbName={kb.name}
          onClose={() => setActiveDoc(null)}
          onNotify={onNotify}
          onAction={handleDocAction}
          chunks={chunkOverrides[activeDoc.id] ?? activeDoc.chunks}
          onChunksChange={(next) => {
            setChunkOverrides((prev) => ({ ...prev, [activeDoc.id]: next }))
          }}
        />
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleteTarget(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="删除文档"
            className="w-full max-w-[400px] rounded-[10px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fef0f0]">
                <TriangleAlert className="h-[18px] w-[18px] text-[#f56c6c]" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[16px] font-semibold text-[#1f2329]">删除文档？</h2>
                <p className="mt-1 text-[13px] leading-[20px] text-[#606266]">
                  删除后，文档及其分块将一并移除，且不可恢复。
                </p>
              </div>
            </div>
            <div className="mt-4 truncate rounded-[4px] bg-[#f5f7fa] px-3 py-2 text-[13px] text-[#1f2329]">
              {deleteTarget.name}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-[32px] cursor-pointer rounded border border-[#dcdfe6] px-4 text-[13px] text-[#606266] hover:border-[#166EFF] hover:text-[#166EFF]"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="h-[32px] cursor-pointer rounded bg-[#f56c6c] px-4 text-[13px] text-white hover:bg-[#e45656]"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
      {rebuildOpen && indexState && (
        <SettingsModal
          title="重建索引"
          width="480px"
          onClose={() => setRebuildOpen(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setRebuildOpen(false)}
                className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const started = startRebuild(
                    [kb.name],
                    defaultEmbedding
                      ? { id: defaultEmbedding.id, name: defaultEmbedding.name }
                      : undefined,
                  )
                  setRebuildOpen(false)
                  onNotify(
                    started > 0
                      ? `已开始重建「${kb.name}」的索引`
                      : '索引正在重建中，请稍候',
                  )
                }}
                className="flex h-[32px] items-center gap-[5px] rounded-[3px] bg-[#166EFF] px-[14px] text-[13px] text-white hover:bg-[#0E5FE0]"
              >
                <RefreshCw className="h-[13px] w-[13px]" />
                开始重建
              </button>
            </>
          }
        >
          <p className="text-[13px] leading-[21px] text-[#4E5969]">
            将重新切分并向量化「{kb.name}」的 {indexState.docs} 篇文档，完成后使用{' '}
            {indexState.targetModelName ?? defaultEmbedding?.name ?? indexState.modelName}{' '}
            生成索引。
          </p>
          <p className="mt-[8px] text-[12px] leading-[18px] text-[#86909C]">
            重建期间仍可继续检索，但结果可能不是最新索引。
          </p>
        </SettingsModal>
      )}
      {retrievalOpen && (
        <RetrievalTestDialog
          kbName={kb.name}
          indexState={indexState}
          onClose={() => setRetrievalOpen(false)}
          onOpenDoc={(docName) => {
            const doc = docs.find((item) => item.name === docName)
            if (doc) setActiveDoc(doc)
            else onNotify('未找到对应的原文，请先在文档列表中确认该文档')
          }}
        />
      )}
      {settingsOpen && (
        <LibrarySettingsDialog
          kbId={kb.name}
          kbName={kb.name}
          initialChunk={kb.chunk}
          onClose={() => setSettingsOpen(false)}
          onSaved={onNotify}
        />
      )}
    </div>
  )
}
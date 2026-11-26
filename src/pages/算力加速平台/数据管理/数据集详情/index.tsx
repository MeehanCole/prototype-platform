/**
 * 算力加速平台-数据管理 - 数据集详情（1:1 还原设计稿及内部弹窗交互）
 *
 * 包含弹窗交互：
 * 1. 删除数据集确认弹窗
 * 2. 编辑数据集名称弹窗（56 字以内）
 * 3. 编辑数据集描述弹窗（500 字以内，无额外校验约束）
 * 4. 删除数据集文件确认弹窗（支持单文件删除与批量删除）
 * 5. 新建版本确认弹窗（确定后只创建版本，不进入上传流程）
 * 6. 上传文件弹窗（只读当前版本号 + 仅客户端上传命令）
 * 7. 刷新按钮：重新读取存储，展示 MC 客户端上传后的最新文件
 */
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, Download, RefreshCw, SquarePen, X } from 'lucide-react'
import { PlatformHeader, SideNav } from '../数据集管理/_shared'
import { TagChips } from '../数据集管理/tags'
import { NAME_MAX_LENGTH, nextVersion, nowStamp } from '../数据集管理/mock'
import type { Dataset, UploadProbe } from '../数据集管理/mock'
import { markRemoved, readDatasets, writeDatasets } from '../数据集管理/store'
import { isSpaceReady } from '../数据集管理/storage'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

const LIST_PATH = '/算力加速平台/数据管理/数据集管理'
const DETAIL_DESC_MAX = 500

interface VersionFile {
  name: string
  sizeText: string
}

interface VersionGroup {
  version: string
  sizeGB: number
  files: VersionFile[]
  /** 客户端上传进度（MC 写入存储过程中的进度回填） */
  upload?: UploadProbe
}

const PREVIEW_LINES = [
  '{',
  '  "messages": [',
  '    {',
  '      "role": "system",',
  '      "content": "You are a helpful assistant."',
  '    },',
  '    {',
  '      "role": "user",',
  '      "content": "帮我写一段 python 快速排序。"',
  '    },',
  '    {',
  '      "role": "assistant",',
  '      "content": "好的，这是快速排序的 Python 实现：\\n\\n```python\\ndef quick_sort(arr):\\n    if len(arr) <= 1:\\n        return arr\\n    pivot = arr[len(arr) // 2]\\n    left = [x for x in arr if x < pivot]\\n    middle = [x for x in arr if x == pivot]\\n    right = [x for x in arr if x > pivot]\\n    return quick_sort(left) + middle + quick_sort(right)\\n```"',
  '    }',
  '  ]',
  '}',
]

/**
 * 客户端上传命令（详情页使用）
 *
 * 数据集创建后平台已分配真实存储路径，因此这里的命令直接带出该数据集的
 * 实际桶路径与版本号，用户复制即可执行。
 */
function buildClientUploadSteps(dataset: Dataset, version: string) {
  /** obs://llm-data/eval/fin-qa-v2 -> llm-data/eval/fin-qa（去掉末尾版本段后统一拼版本目录） */
  const basePath = dataset.location
    .replace(/^obs:\/\//, '')
    .replace(/[-/]v\d+$/i, '')
  const bucketPath = `myjfs/datasets-pool/${basePath}/${version.toLowerCase()}/`
  return [
    {
      title: '1. 配置凭证与 Endpoint',
      command:
        'mc alias set myjfs http://s3-gateway.ai-platform.internal:9000 ak_tenant_081293819238 sk_98f7a6b5c4d3e21',
    },
    {
      title: '2. 上传单个文件：',
      command: `mc cp ./my_file ${bucketPath}`,
    },
    {
      title: '3. 上传整个本地文件夹（数据集文件需要平铺，不支持子目录）',
      command: `mc mirror ./my_dataset_dir/ ${bucketPath}`,
    },
  ]
}

/** 可在线预览的文本类扩展名（平台不做内容解析，仅文本类文件能预览） */
const TEXT_EXTS = ['jsonl', 'json', 'txt', 'csv', 'md', 'tsv', 'yaml', 'yml', 'log']

/** 取文件扩展名用于「文件类型」列 */
function fileExtension(name: string) {
  if (!name.includes('.')) return '未知'
  return name.split('.').pop()!.toUpperCase()
}

function isPreviewable(name: string) {
  if (!name.includes('.')) return false
  return TEXT_EXTS.includes(name.split('.').pop()!.toLowerCase())
}

function buildInitialGroups(dataset: Dataset | undefined): VersionGroup[] {
  if (!dataset) return []
  return dataset.versions.map((ver, index) => ({
    version: ver.version,
    sizeGB: index === 0 ? 120 : 80,
    upload: ver.upload,
    /** 写入过的文件清单优先展示（列表页上传 / MC 刷新后），否则回落到演示数据 */
    files:
      ver.files && ver.files.length > 0
        ? ver.files
        : index === 0
        ? [
            { name: 'part_01.jsonl', sizeText: '40GB' },
            { name: 'images_2026q1.tar', sizeText: '40GB' },
            { name: 'readme.md', sizeText: '12KB' },
          ]
        : [{ name: 'part_01.jsonl', sizeText: '80GB' }],
  }))
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span className="w-[78px] shrink-0 text-[#86909c]">{label}</span>
      <span className="min-w-0 text-[#1d2129]">{children}</span>
    </div>
  )
}

/** 橙色实心圆警告图标（设计稿弹窗样式） */
function WarnCircleIcon() {
  return (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#f2b86d] text-[12px] font-bold leading-none text-white">
      !
    </span>
  )
}

/** 可复制命令行 */
function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      const area = document.createElement('textarea')
      area.value = command
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="relative mt-1.5 pr-7">
      <p className="break-all font-mono text-[12px] leading-[19px] text-[#333]">{command}</p>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? '已复制' : '复制命令'}
        title={copied ? '已复制' : '复制命令'}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[#a7acb3] transition-colors hover:text-[#1890ff]"
      >
        {copied ? <Check size={13} className="text-[#1890ff]" /> : <Copy size={13} />}
      </button>
    </div>
  )
}

/** 弹窗通用骨架 */
function Modal({
  title,
  widthClass = 'w-[480px]',
  alignFooter = 'center',
  onClose,
  children,
  footer,
}: {
  title: string
  widthClass?: string
  alignFooter?: 'center' | 'end'
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4"
      onClick={onClose}
    >
      <div
        className={`${widthClass} max-w-[92vw] max-h-[86vh] overflow-y-auto rounded-[4px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.16)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[48px] items-center justify-between border-b border-[#e5e6eb] px-5">
          <h2 className="text-[14px] font-bold text-[#1d2129]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="text-[#a7acb3] transition-colors hover:text-[#1d2129]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">{children}</div>

        <div
          className={`flex items-center gap-3 px-5 pb-5 ${
            alignFooter === 'end' ? 'justify-end' : 'justify-center'
          }`}
        >
          {footer}
        </div>
      </div>
    </div>
  )
}

function ModalButton({
  children,
  onClick,
  variant = 'default',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'default'
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        variant === 'primary'
          ? 'h-[30px] min-w-[72px] rounded-[4px] bg-[#1890ff] px-4 text-[12px] text-white transition-colors hover:bg-[#0d7be8] disabled:cursor-not-allowed disabled:bg-[#a0cfff]'
          : 'h-[30px] min-w-[72px] rounded-[4px] border border-[#d9d9d9] bg-white px-4 text-[12px] text-[#333] transition-colors hover:border-[#1890ff] hover:text-[#1890ff]'
      }
    >
      {children}
    </button>
  )
}

/** 1. 删除数据集弹窗 */
function DeleteDatasetModal({
  datasetName,
  onClose,
  onConfirm,
}: {
  datasetName: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      title="删除数据集"
      widthClass="w-[500px]"
      alignFooter="end"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>取消</ModalButton>
          <ModalButton variant="primary" onClick={onConfirm}>
            确定
          </ModalButton>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <WarnCircleIcon />
        <p className="text-[13px] leading-6 text-[#1d2129]">
          数据集 {datasetName} 将会被彻底删除，请谨慎操作
        </p>
      </div>
    </Modal>
  )
}

/** 2. 编辑数据集名称弹窗 */
function RenameDatasetModal({
  initialName,
  onClose,
  onConfirm,
}: {
  initialName: string
  onClose: () => void
  onConfirm: (name: string) => void
}) {
  const [value, setValue] = useState(initialName)

  return (
    <Modal
      title="编辑数据集名称"
      widthClass="w-[420px]"
      alignFooter="center"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>取消</ModalButton>
          <ModalButton
            variant="primary"
            disabled={!value.trim()}
            onClick={() => onConfirm(value.trim())}
          >
            确定
          </ModalButton>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <label className="shrink-0 text-[13px] text-[#1d2129]">
          数据集名称 <span className="text-[#f53f3f]">*</span>
        </label>
        <div className="flex h-[32px] min-w-0 flex-1 items-center rounded-[4px] border border-[#e5e6eb] bg-white px-2.5 focus-within:border-[#1890ff]">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, NAME_MAX_LENGTH))}
            placeholder="请输入数据集名称"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#1d2129] outline-none"
          />
          <span className="ml-2 shrink-0 text-[12px] text-[#c9cdd4]">
            {value.length}/{NAME_MAX_LENGTH}
          </span>
        </div>
      </div>
    </Modal>
  )
}

/** 3. 编辑数据集描述弹窗（不加校验约束） */
function EditDescModal({
  initialDesc,
  onClose,
  onConfirm,
}: {
  initialDesc: string
  onClose: () => void
  onConfirm: (desc: string) => void
}) {
  const [value, setValue] = useState(initialDesc)

  return (
    <Modal
      title="编辑数据集描述"
      widthClass="w-[440px]"
      alignFooter="center"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>取消</ModalButton>
          <ModalButton variant="primary" onClick={() => onConfirm(value.trim())}>
            确定
          </ModalButton>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <label className="shrink-0 pt-1.5 text-[13px] text-[#1d2129]">数据集描述</label>
        <div className="relative min-w-0 flex-1 rounded-[4px] border border-[#e5e6eb] bg-white px-3 pb-6 pt-2 focus-within:border-[#1890ff]">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, DETAIL_DESC_MAX))}
            rows={4}
            className="w-full resize-none bg-transparent text-[13px] leading-5 text-[#1d2129] outline-none"
          />
          <span className="pointer-events-none absolute bottom-1.5 right-3 text-[12px] text-[#c9cdd4]">
            {value.length}/{DETAIL_DESC_MAX}
          </span>
        </div>
      </div>
    </Modal>
  )
}

/** 4. 删除数据集文件弹窗 */
function DeleteFilesModal({
  label,
  onClose,
  onConfirm,
}: {
  label: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      title="删除数据集文件"
      widthClass="w-[500px]"
      alignFooter="end"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>取消</ModalButton>
          <ModalButton variant="primary" onClick={onConfirm}>
            确定
          </ModalButton>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <WarnCircleIcon />
        <p className="text-[13px] leading-6 text-[#1d2129]">
          数据集文件 {label}将会被彻底删除，请谨慎操作
        </p>
      </div>
    </Modal>
  )
}

/** 5. 新建版本确认弹窗 */
function NewVersionModal({
  datasetName,
  nextVer,
  onClose,
  onConfirm,
}: {
  datasetName: string
  nextVer: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      title="新建版本"
      widthClass="w-[460px]"
      alignFooter="center"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>取消</ModalButton>
          <ModalButton variant="primary" onClick={onConfirm}>
            确定
          </ModalButton>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <WarnCircleIcon />
        <p className="text-[13px] leading-6 text-[#1d2129]">
          即将为数据集「{datasetName}」创建新版本 {nextVer}，是否确定创建?
        </p>
      </div>
    </Modal>
  )
}

/** 6. 上传文件弹窗（仅客户端上传，版本号只读） */
function UploadFilesModal({
  dataset,
  version,
  onClose,
  onConfirm,
}: {
  dataset: Dataset
  version: string
  onClose: () => void
  onConfirm: () => void
}) {
  const clientSteps = buildClientUploadSteps(dataset, version)

  return (
    <Modal
      title="上传文件"
      widthClass="w-[540px]"
      alignFooter="center"
      onClose={onClose}
      footer={
        <>
          <ModalButton onClick={onClose}>取 消</ModalButton>
          <ModalButton variant="primary" onClick={onConfirm}>
            确 定
          </ModalButton>
        </>
      }
    >
      <div className="space-y-5">
        {/* 版本号（只读灰底，写入当前选中版本） */}
        <div className="flex items-center gap-4">
          <span className="w-[78px] shrink-0 text-[13px] text-[#1d2129]">版本号</span>
          <div className="flex h-[32px] flex-1 items-center rounded-[4px] bg-[#f5f6f8] px-3 text-[13px] text-[#1d2129]">
            {version}
          </div>
        </div>

        {/* 客户端上传命令 */}
        <div>
          <p className="mb-3 text-[13px] text-[#1d2129]">客户端上传</p>
          <div className="rounded-[4px] border border-dashed border-[#e5e6eb] bg-[#f8f9fc] px-5 py-4">
            {clientSteps.map((step) => (
              <div key={step.title} className="mb-4 last:mb-0">
                <p className="text-[13px] leading-5 text-[#333]">{step.title}</p>
                <CommandBlock command={step.command} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function DatasetDetailPage({ __showFeat = false }: { __showFeat?: boolean } = {}) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  /** 数据存储空间未配置时，创建版本 / 上传文件等写入操作被阻断 */
  const spaceReady = useMemo(() => isSpaceReady(params.get('noSpace') === '1'), [params])
  const [datasets, setDatasets] = useState<Dataset[]>(() => readDatasets())

  const targetId = params.get('id')
  const dataset = useMemo(
    () => datasets.find((item) => item.id === targetId) ?? datasets[0],
    [datasets, targetId],
  )

  const [groupsOverride, setGroupsOverride] = useState<Record<string, VersionGroup[]>>({})
  const groups = useMemo(
    () => (dataset && groupsOverride[dataset.id]) || buildInitialGroups(dataset),
    [dataset, groupsOverride],
  )

  const [activeVersion, setActiveVersion] = useState(0)
  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  // 弹窗状态
  const [deleteDatasetOpen, setDeleteDatasetOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [editDescOpen, setEditDescOpen] = useState(false)
  const [deleteFileTarget, setDeleteFileTarget] = useState<string[] | null>(null)
  const [newVersionOpen, setNewVersionOpen] = useState(false)
  const [uploadModalVersion, setUploadModalVersion] = useState<{
    version: string
  } | null>(null)

  const currentGroup = groups[Math.min(activeVersion, Math.max(groups.length - 1, 0))]

  function updateDataset(patch: Partial<Dataset>) {
    if (!dataset) return
    const next = datasets.map((item) => (item.id === dataset.id ? { ...item, ...patch } : item))
    writeDatasets(next)
    setDatasets(next)
  }

  function handleDeleteDataset() {
    if (!dataset) return
    /** 登记删除，避免 Mock 基线在下次读取时把它补回来 */
    markRemoved(dataset.id)
    const next = datasets.filter((item) => item.id !== dataset.id)
    writeDatasets(next)
    setDatasets(next)
    setDeleteDatasetOpen(false)
    navigate(LIST_PATH)
  }

  function handleRenameDataset(name: string) {
    updateDataset({ name })
    setRenameOpen(false)
  }

  function handleSaveDesc(description: string) {
    updateDataset({ description: description || undefined })
    setEditDescOpen(false)
  }

  function handleConfirmDeleteFiles() {
    if (!dataset || !currentGroup || !deleteFileTarget) return
    const toRemove = new Set(deleteFileTarget)
    const nextGroups = groups.map((group) =>
      group.version === currentGroup.version
        ? { ...group, files: group.files.filter((f) => !toRemove.has(f.name)) }
        : group,
    )
    setGroupsOverride((prev) => ({ ...prev, [dataset.id]: nextGroups }))
    setSelectedFiles((prev) => prev.filter((name) => !toRemove.has(name)))
    setDeleteFileTarget(null)
  }

  /** 刷新：重新读取存储 + 清空本地覆盖，展示 MC 客户端上传后的最新文件 */
  function handleRefresh() {
    if (!dataset) return
    setDatasets(readDatasets())
    setGroupsOverride({})
    setPreviewFile(null)
    setSelectedFiles([])
  }

  /** 新建版本只创建版本，不进入上传流程；上传文件为版本内的独立操作 */
  function handleNewVersionConfirm() {
    if (!dataset) return
    const nextVer = nextVersion(dataset.latestVersion)
    const stamp = nowStamp()
    setNewVersionOpen(false)
    updateDataset({
      latestVersion: nextVer,
      status: '初始化',
      errorMessage: undefined,
      createdAt: stamp,
      versions: [
        {
          version: nextVer,
          note: '新建版本，等待上传文件',
          createdAt: stamp,
          samples: 0,
          status: '初始化',
        },
        ...dataset.versions,
      ],
    })
    const nextGroups: VersionGroup[] = [{ version: nextVer, sizeGB: 0, files: [] }, ...groups]
    setGroupsOverride((prev) => ({ ...prev, [dataset.id]: nextGroups }))
    setActiveVersion(0)
    setPreviewFile(null)
    setSelectedFiles([])
  }

  function handleUploadConfirm() {
    if (!dataset || !uploadModalVersion) return
    const stamp = nowStamp()
    const targetVersion = uploadModalVersion.version

    const nextVersions = dataset.versions.map((ver) =>
      ver.version === targetVersion
        ? { ...ver, note: '客户端上传，等待写入存储', createdAt: stamp }
        : ver,
    )
    updateDataset({ versions: nextVersions })

    setGroupsOverride({})
    setUploadModalVersion(null)
  }

  function handleDownloadFile(filename: string) {
    const blob = new Blob([`${PREVIEW_LINES.join('\n')}\n`], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function toggleFileSelection(filename: string) {
    setSelectedFiles((prev) =>
      prev.includes(filename) ? prev.filter((n) => n !== filename) : [...prev, filename],
    )
  }

  if (!dataset) {
    return (
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
        <PlatformHeader />
        <div className="flex min-h-0 flex-1">
          <SideNav activeKey="数据集管理" />
          <main className="flex flex-1 items-center justify-center text-[14px] text-[#86909c]">
            暂无数据集，请先创建数据集
          </main>
        </div>
      </div>
    )
  }

  const totalFiles = currentGroup?.files.length ?? 0
  const activePreviewName = previewFile ?? currentGroup?.files[0]?.name ?? '暂无文件'

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
      <PlatformHeader />

      <div className="flex min-h-0 flex-1">
        <SideNav activeKey="数据集管理" />

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          {/* 顶部返回栏 */}
          <div className="flex h-[46px] shrink-0 items-center border-b border-[#e5e6eb] px-6">
            <button
              type="button"
              aria-label="返回"
              onClick={() => navigate(LIST_PATH)}
              className="flex items-center text-[#9ca3af] transition-colors hover:text-[#1890ff]"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="mx-3 h-[14px] w-[1px] bg-[#e5e6eb]" />
            <span className="text-[14px] font-medium text-[#1d2129]">数据集详情</span>
            {__showFeat && <NewTag code="F-DETAIL-PAGE" compact className="ml-2" />}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {/* 基础信息区 */}
            {__showFeat && <NewTag code="F-BASIC-INFO" compact className="ml-8" />}
            <div className="border-b border-[#f0f0f0] px-8 pb-5 pt-6">
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <InfoItem label="数据集名称：">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="break-all">{dataset.name}</span>
                    <button
                      type="button"
                      aria-label="编辑数据集名称"
                      onClick={() => setRenameOpen(true)}
                      className="shrink-0 text-[#a7acb3] transition-colors hover:text-[#1890ff]"
                    >
                      <SquarePen size={12} />
                    </button>
                    {__showFeat && <NewTag code="F-EDIT-INFO" compact className="ml-1" />}
                  </span>
                </InfoItem>
                <InfoItem label="数据集标签：">
                  <TagChips tags={dataset.tags} />
                </InfoItem>

                <InfoItem label="创建者：">
                  <span className="whitespace-nowrap">{dataset.creator}</span>
                </InfoItem>
                <InfoItem label="数据集描述：">
                  <span className="inline-flex items-center gap-2">
                    <span className="line-clamp-1">{dataset.description ?? '-'}</span>
                    <button
                      type="button"
                      aria-label="编辑数据集描述"
                      onClick={() => setEditDescOpen(true)}
                      className="shrink-0 text-[#a7acb3] transition-colors hover:text-[#1890ff]"
                    >
                      <SquarePen size={12} />
                    </button>
                  </span>
                </InfoItem>
                <InfoItem label="创建时间：">
                  <span className="whitespace-nowrap tabular-nums">{dataset.createdAt}</span>
                </InfoItem>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewVersionOpen(true)}
                  disabled={!spaceReady}
                  title={
                    !spaceReady ? '未开通数据存储空间，暂不可新建版本' : undefined
                  }
                  className="h-[28px] rounded-[4px] border border-[#d9d9d9] bg-white px-3 text-[12px] text-[#1d2129] transition-colors hover:border-[#1890ff] hover:text-[#1890ff] disabled:cursor-not-allowed disabled:border-[#e5e6eb] disabled:text-[#c9cdd4] disabled:hover:border-[#e5e6eb] disabled:hover:text-[#c9cdd4]"
                >
                  新建版本
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteDatasetOpen(true)}
                  className="h-[28px] rounded-[4px] border border-[#f53f3f] bg-white px-3 text-[12px] text-[#f53f3f] transition-colors hover:bg-[#fff1f0]"
                >
                  删除
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  title="重新读取存储，展示最新写入的文件"
                  className="flex h-[28px] items-center gap-1 rounded-[4px] border border-[#d9d9d9] bg-white px-3 text-[12px] text-[#1d2129] transition-colors hover:border-[#1890ff] hover:text-[#1890ff]"
                >
                  <RefreshCw size={12} />
                  刷新
                </button>
                {__showFeat && <NewTag code="F-DATASET-ACTIONS" compact className="ml-1" />}
              </div>
            </div>

            {/* 下方左右分栏 */}
            <div className="flex items-stretch gap-5 px-8 py-6">
              {/* 左侧版本列表 */}
              <div className="w-[220px] shrink-0 rounded-[4px] border border-[#e5e6eb] bg-white">
                <div className="px-4 py-3.5 text-[13px] font-medium text-[#1d2129]">
                  共 {groups.length} 版本
                  {__showFeat && <NewTag code="F-VERSIONS" compact className="ml-2" />}
                </div>
                <ul className="pb-3">
                  {groups.map((group, index) => {
                    const selected = index === activeVersion
                    return (
                      <li key={group.version}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVersion(index)
                            setPreviewFile(null)
                            setSelectedFiles([])
                          }}
                          className={`w-full border-l-2 px-4 py-3 text-left transition-colors ${
                            selected
                              ? 'border-[#1890ff] bg-[#f0f5ff]'
                              : 'border-transparent hover:bg-[#f7f8fa]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-[#1d2129]">
                              {group.version}
                            </span>
                            {index === 0 && (
                              <span className="rounded-[2px] border border-[#b7eb8f] bg-[#f6ffed] px-1.5 text-[10px] leading-4 text-[#52c41a]">
                                最新
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-[12px] leading-4 text-[#4e5969]">
                            数据量 {group.sizeGB}GB
                            {selected && ` （总文件数：${group.files.length}）`}
                          </p>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* 右侧文件列表 + 预览 */}
              <div className="min-w-0 flex-1 space-y-4">
                <div className="rounded-[4px] border border-[#e5e6eb] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="whitespace-nowrap text-[13px] font-medium text-[#1d2129]">
                      版本文件列表（总文件数：{totalFiles}）
                      {__showFeat && <NewTag code="F-FILE-TABLE" compact className="ml-2" />}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          currentGroup &&
                          setUploadModalVersion({ version: currentGroup.version })
                        }
                        disabled={!spaceReady}
                        title={!spaceReady ? '未开通数据存储空间，暂不可上传文件' : undefined}
                        className="h-[26px] rounded-[4px] bg-[#1890ff] px-3 text-[12px] text-white transition-colors hover:bg-[#0d7be8] disabled:cursor-not-allowed disabled:bg-[#a3c4ff] disabled:hover:bg-[#a3c4ff]"
                      >
                        上传文件
                      </button>
                      {__showFeat && <NewTag code="F-FILE-UPLOAD" compact className="ml-1" />}
                      <button
                        type="button"
                        disabled={selectedFiles.length === 0}
                        onClick={() => {
                          if (selectedFiles.length > 0) handleDownloadFile(selectedFiles[0])
                        }}
                        className="h-[26px] rounded-[4px] bg-[#1890ff] px-3 text-[12px] text-white transition-colors hover:bg-[#0d7be8] disabled:cursor-not-allowed disabled:bg-[#a0cfff]"
                      >
                        批量下载
                      </button>
                      <button
                        type="button"
                        disabled={selectedFiles.length === 0}
                        onClick={() =>
                          selectedFiles.length > 0 && setDeleteFileTarget(selectedFiles)
                        }
                        className="h-[26px] rounded-[4px] bg-[#f5222d] px-3 text-[12px] text-white transition-colors hover:bg-[#cf1322] disabled:cursor-not-allowed disabled:bg-[#ffa39e]"
                      >
                        批量删除
                      </button>
                      {__showFeat && <NewTag code="F-FILE-OPS" compact className="ml-1" />}
                    </div>
                  </div>

                  <table className="w-full table-fixed border-collapse text-left">
                    <thead>
                      <tr className="bg-[#f8f9fc] text-[12px] text-[#4e5969]">
                        <th className="w-[30%] whitespace-nowrap px-4 py-2 font-normal">文件名</th>
                        <th className="w-[18%] whitespace-nowrap px-4 py-2 font-normal">文件大小</th>
                        <th className="w-[26%] whitespace-nowrap px-4 py-2 font-normal">文件类型</th>
                        <th className="w-[26%] whitespace-nowrap px-4 py-2 font-normal">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                            {totalFiles === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-[12px] text-[#86909c]">
                                  暂无数据
                                </td>
                              </tr>
                            ) : (
                              currentGroup?.files.map((file) => {
                                const checked = selectedFiles.includes(file.name)
                                return (
                                  <tr key={file.name} className="border-b border-[#f2f3f5] last:border-b-0">
                                    <td className="truncate px-4 py-2.5 text-[12px] text-[#1d2129]">
                                      <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleFileSelection(file.name)}
                                          className="h-[13px] w-[13px] accent-[#1890ff]"
                                        />
                                        <span className="truncate">{file.name}</span>
                                      </label>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[#1d2129]">
                                      {file.sizeText}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2.5 text-[12px] text-[#4e5969]">
                                      {fileExtension(file.name)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2.5">
                                      <div className="flex items-center gap-3 text-[12px]">
                                        <button
                                          type="button"
                                          onClick={() => setPreviewFile(file.name)}
                                          className="text-[#1890ff] hover:underline"
                                        >
                                          预览
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDownloadFile(file.name)}
                                          className="text-[#1890ff] hover:underline"
                                        >
                                          下载
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteFileTarget([file.name])}
                                          className="text-[#f53f3f] hover:underline"
                                        >
                                          删除
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                    </tbody>
                  </table>
                </div>

                {/* 文件内容预览标题栏 */}
                <div className="flex items-center justify-between rounded-[4px] border border-[#e5e6eb] bg-white px-4 py-2.5">
                  <p className="text-[12px] text-[#1d2129]">
                    文件内容预览： {activePreviewName}（仅展示前 100KB 内容）
                    {__showFeat && <NewTag code="F-PREVIEW" compact className="ml-2" />}
                  </p>
                  {totalFiles > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(activePreviewName)}
                      className="flex shrink-0 items-center gap-1 text-[12px] text-[#1890ff] hover:underline"
                    >
                      <Download size={12} />
                      下载该文件
                    </button>
                  )}
                </div>

                {/*
                  深色代码块或空态。
                  平台不解析文件内容：仅文本类文件给出预览，其余提示下载查看
                */}
                {totalFiles > 0 ? (
                  isPreviewable(activePreviewName) ? (
                    <pre className="max-h-[340px] overflow-auto rounded-[4px] bg-[#323232] px-4 py-3 font-mono text-[12px] leading-[19px] text-[#e5e6eb]">
                      {PREVIEW_LINES.join('\n')}
                    </pre>
                  ) : (
                    <div className="flex h-[180px] flex-col items-center justify-center gap-2 rounded-[4px] border border-[#e5e6eb] bg-[#fafafa] text-[12px] text-[#86909c]">
                      <span>该文件类型不支持在线预览</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(activePreviewName)}
                        className="text-[#1890ff] hover:underline"
                      >
                        下载后查看
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex h-[180px] items-center justify-center rounded-[4px] border border-[#e5e6eb] bg-[#fafafa] text-[12px] text-[#86909c]">
                    暂无数据
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 弹窗集合 */}
      {deleteDatasetOpen && (
        <DeleteDatasetModal
          datasetName={dataset.name}
          onClose={() => setDeleteDatasetOpen(false)}
          onConfirm={handleDeleteDataset}
        />
      )}
      {renameOpen && (
        <RenameDatasetModal
          initialName={dataset.name}
          onClose={() => setRenameOpen(false)}
          onConfirm={handleRenameDataset}
        />
      )}
      {editDescOpen && (
        <EditDescModal
          initialDesc={dataset.description ?? ''}
          onClose={() => setEditDescOpen(false)}
          onConfirm={handleSaveDesc}
        />
      )}
      {deleteFileTarget && (
        <DeleteFilesModal
          label={
            deleteFileTarget.length === 1
              ? deleteFileTarget[0]
              : `选中的 ${deleteFileTarget.length} 个文件`
          }
          onClose={() => setDeleteFileTarget(null)}
          onConfirm={handleConfirmDeleteFiles}
        />
      )}
      {newVersionOpen && (
        <NewVersionModal
          datasetName={dataset.name}
          nextVer={nextVersion(dataset.latestVersion)}
          onClose={() => setNewVersionOpen(false)}
          onConfirm={handleNewVersionConfirm}
        />
      )}
      {uploadModalVersion && (
        <UploadFilesModal
          dataset={dataset}
          version={uploadModalVersion.version}
          onClose={() => setUploadModalVersion(null)}
          onConfirm={handleUploadConfirm}
        />
      )}
    </div>
    <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

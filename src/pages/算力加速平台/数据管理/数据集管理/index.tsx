/**
 * 算力加速平台-数据管理 - 数据集管理
 * 按 Axure 设计稿还原：标题 + 说明 + 列表面板（创建数据集 / 搜索 / 表格 / 分页）+ 删除、重命名、详情等弹层
 */
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Plus, X } from 'lucide-react'
import { PlatformHeader, SideNav } from './_shared'
import { TagChips } from './tags'
import { TablePagination } from '@/lib/table-pagination'
import { SearchBar } from '@/lib/search-bar'
import {
  NAME_MAX_LENGTH,
  PAGE_SIZES,
  nextVersion,
  nowStamp,
} from './mock'
import type { Dataset } from './mock'
import { markRemoved, readDatasets, writeDatasets } from './store'
import { isSpaceReady } from './storage'
import { SpaceBlockedState } from './space-notice'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

const BLUE = 'text-[#166eff]'

const DIALOG_WIDTH_CLASS: Record<number, string> = {
  420: 'w-[420px]',
  520: 'w-[520px]',
  640: 'w-[640px]',
}

/** 创建数据集为目标表单页而非弹窗 */
const CREATE_PATH = '/算力加速平台/数据管理/创建数据集'
/** 详情为独立详情页，携带数据集 id */
const DETAIL_PATH = '/算力加速平台/数据管理/数据集详情'

/** 列表页工具条常量 */

/* ---------------------------------- 小组件 --------------------------------- */



/** 表格通用操作链接 */
function RowLink({
  children,
  onClick,
  tone = 'blue',
  disabled = false,
  title,
}: {
  children: ReactNode
  onClick: () => void
  tone?: 'blue' | 'red'
  /** 存储空间未开通等阻断态：置灰不可点，避免反复弹窗 */
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        disabled
          ? 'cursor-not-allowed text-[13px] leading-5 text-[#c9cdd4]'
          : `text-[13px] leading-5 hover:underline ${tone === 'red' ? 'text-[#f53f3f]' : 'text-[#166eff]'}`
      }
    >
      {children}
    </button>
  )
}

/** 弹窗骨架：标题 + 关闭 + 内容 + 底部按钮 */
function Dialog({
  title,
  width = 520,
  onClose,
  children,
  footer,
  footerLeft,
}: {
  title: string
  width?: number
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  footerLeft?: ReactNode
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center bg-black/25 pt-[10vh]" onClick={onClose}>
      <div
        className={`max-h-[80vh] max-w-[92vw] overflow-y-auto rounded-[4px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] ${DIALOG_WIDTH_CLASS[width] ?? 'w-[520px]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-[52px] items-center justify-between border-b border-[#e5e6eb] px-6">
          <h2 className="text-[16px] font-bold text-[#323232]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="text-[#a7acb3] transition-colors hover:text-[#323232]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="flex items-center justify-between gap-3 px-6 pb-6">
          <div className="text-[12px] leading-5 text-[#a7acb3]">{footerLeft}</div>
          <div className="flex items-center gap-3">{footer}</div>
        </div>
      </div>
    </div>
  )
}

function Button({
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
      onClick={onClick}
      disabled={disabled}
      className={
        variant === 'primary'
          ? 'h-8 min-w-[64px] rounded-[2px] bg-[#166eff] px-4 text-[13px] text-white transition-colors hover:bg-[#0d5fe0] disabled:cursor-not-allowed disabled:bg-[#a3c4ff]'
          : 'h-8 min-w-[64px] rounded-[2px] border border-[#e5e6eb] bg-white px-4 text-[13px] text-[#1d2129] transition-colors hover:border-[#166eff] hover:text-[#166eff]'
      }
    >
      {children}
    </button>
  )
}

/** 带字数统计的文本输入 */
function NameInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex h-9 items-center rounded-[2px] border border-[#e5e6eb] bg-white px-3 focus-within:border-[#166eff]">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, NAME_MAX_LENGTH))}
        placeholder="请输入数据集名称"
        className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#1d2129] outline-none placeholder:text-[#c9cdd4]"
      />
      <span className="ml-2 shrink-0 text-[12px] text-[#c9cdd4]">
        {value.length}/{NAME_MAX_LENGTH}
      </span>
    </div>
  )
}

/* --------------------------------- 各类弹层 -------------------------------- */

function RenameDialog({
  dataset,
  onClose,
  onRename,
}: {
  dataset: Dataset
  onClose: () => void
  onRename: (name: string) => void
}) {
  const [name, setName] = useState(dataset.name)

  return (
    <Dialog
      title="编辑数据集名称"
      width={420}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button variant="primary" disabled={!name.trim()} onClick={() => onRename(name.trim())}>
            确定
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <label className="shrink-0 text-[13px] text-[#1d2129]">
          数据集名称 <span className="text-[#f53f3f]">*</span>
        </label>
        <div className="min-w-0 flex-1">
          <NameInput value={name} onChange={setName} />
        </div>
      </div>
    </Dialog>
  )
}

function DeleteDialog({
  dataset,
  onClose,
  onConfirm,
}: {
  dataset: Dataset
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      title="删除数据集"
      width={520}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={onConfirm}>
            确定
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[#ff9a2e] text-[12px] font-bold leading-none text-[#ff9a2e]">
          !
        </span>
        <p className="text-[14px] leading-6 text-[#1d2129]">
          数据集 <span className="font-medium">{dataset.name}</span> 将会被彻底删除，请谨慎操作
        </p>
      </div>
    </Dialog>
  )
}

/** 「新增版本」确认弹窗：版本号自动递进 */
function NewVersionDialog({
  dataset,
  onClose,
  onConfirm,
}: {
  dataset: Dataset
  onClose: () => void
  onConfirm: () => void
}) {
  const version = nextVersion(dataset.latestVersion)

  return (
    <Dialog
      title="新建版本"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={onConfirm}>
            确定
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-[14px] leading-6 text-[#323232]">
          即将为数据集「<span className="font-medium">{dataset.name}</span>」创建新版本{' '}
          <span className="font-medium">{version}</span>，是否确定创建？
        </p>
        <p className="text-[12px] leading-5 text-[#a7acb3]">版本号根据已有版本递进自动进行生成</p>
      </div>
    </Dialog>
  )
}

/**
 * 客户端上传：三步骤命令脚本
 *
 * 该弹窗用于已存在的数据集，存储路径与凭证均已分配，因此命令带出真实路径：
 * 桶路径由数据集 location 推导，版本目录取弹窗中选择的版本号。
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
      lines: [
        'mc alias set myjfs http://s3-gateway.ai-platform.internal:9000 ak_tenant_081293819238 sk_98f7a6b5c4d3e21',
      ],
    },
    {
      title: '2. 上传单个文件：',
      lines: [`mc cp ./my_file ${bucketPath}`],
    },
    {
      title: '3. 上传整个本地文件夹（数据集文件需要平铺，不支持子目录）',
      lines: [`mc mirror ./my_dataset_dir/ ${bucketPath}`],
    },
  ]
}

function UploadDialog({
  dataset,
  onClose,
  onConfirm,
}: {
  dataset: Dataset
  onClose: () => void
  onConfirm: (version: string) => void
}) {
  /** 上传写入已有版本之一，版本号可下拉选择 */
  const versionOptions = dataset.versions.map((item) => item.version)
  const [version, setVersion] = useState(
    versionOptions.includes(dataset.latestVersion) ? dataset.latestVersion : versionOptions[0],
  )

  return (
    <Dialog
      title="上传文件"
      width={640}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => onConfirm(version)}>
            确定
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-[13px] text-[#323232]">
            版本号 <span className="text-[#d91e00]">*</span>
          </label>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="h-9 w-[320px] max-w-full rounded-[2px] border border-[#e5e6eb] bg-white px-3 text-[13px] text-[#323232] outline-none focus:border-[#1890ff]"
          >
            {versionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[13px] text-[#323232]">客户端上传</label>
          <div className="space-y-4">
            <div className="space-y-3 rounded-[2px] bg-[#f8f9fc] px-4 py-4">
              {buildClientUploadSteps(dataset, version).map((step) => (
                <div key={step.title} className="space-y-1">
                  <p className="text-[13px] text-[#323232]">{step.title}</p>
                  {step.lines.map((line) => (
                    <p
                      key={line}
                      className="break-all font-mono text-[12px] leading-5 text-[#323232]"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ))}
              <p className="text-[12px] text-[#a7acb3]">命令根据实际调用 juicefs s3Gateway 命令进行修改</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

/* ---------------------------------- 页面主体 -------------------------------- */

export default function DatasetPage({ __forceNoSpace = false, __showFeat = false }: { __forceNoSpace?: boolean; __showFeat?: boolean } = {}) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  /**
   * 数据存储空间未配置时（含 ?noSpace=1 演示开关、或 __forceNoSpace 由独立页面注入），
   * 所有写入类操作被阻断。
   */
  const spaceReady = useMemo(
    () => isSpaceReady(__forceNoSpace || params.get('noSpace') === '1'),
    [__forceNoSpace, params],
  )
  /** 首次加载读取本地存储，兼容从「创建数据集」表单页返回；未开通数据空间时没有可读数据 */
  const [datasets, setDatasets] = useState<Dataset[]>(() => (spaceReady ? readDatasets() : []))
  /** 搜索框内的草稿值，点击放大镜或回车后才生效；仅支持按数据集名称检索 */
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const [renameTarget, setRenameTarget] = useState<Dataset | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Dataset | null>(null)
  const [newVersionTarget, setNewVersionTarget] = useState<Dataset | null>(null)
  const [uploadTarget, setUploadTarget] = useState<Dataset | null>(null)

  const filtered = useMemo(() => {
    const kw = appliedKeyword.trim().toLowerCase()
    if (!kw) return datasets
    return datasets.filter((dataset) => dataset.name.toLowerCase().includes(kw))
  }, [datasets, appliedKeyword])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function updateDataset(id: string, patch: Partial<Dataset>) {
    setDatasets((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  /** 列表数据变更后写回本地存储；未开通数据空间时列表为空，不能覆盖已有存储 */
  useEffect(() => {
    if (!spaceReady) return
    writeDatasets(datasets)
  }, [datasets, spaceReady])

  function handleRename(name: string) {
    if (!renameTarget) return
    updateDataset(renameTarget.id, { name })
    setRenameTarget(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    /** 登记删除，避免 Mock 基线在下次读取时把它补回来 */
    markRemoved(deleteTarget.id)
    setDatasets((prev) => prev.filter((item) => item.id !== deleteTarget.id))
    setDeleteTarget(null)
    setPage(1)
  }

  /** 新增版本确认后仅创建新版本，上传文件为版本内的独立操作 */
  function handleNewVersionConfirm() {
    if (!newVersionTarget) return
    const stamp = nowStamp()
    const version = nextVersion(newVersionTarget.latestVersion)
    updateDataset(newVersionTarget.id, {
      latestVersion: version,
      createdAt: stamp,
      versions: [
        {
          version,
          note: '新建版本，等待上传文件',
          createdAt: stamp,
          samples: 0,
        },
        ...newVersionTarget.versions,
      ],
    })
    setNewVersionTarget(null)
  }

  /** 上传文件：客户端上传，写入下拉选中的版本 */
  function handleUpload(version: string) {
    if (!uploadTarget) return
    const stamp = nowStamp()
    updateDataset(uploadTarget.id, {
      createdAt: stamp,
      versions: uploadTarget.versions.map((item) =>
        item.version === version
          ? {
              ...item,
              note: '客户端上传，等待写入存储',
            }
          : item,
      ),
    })
    setUploadTarget(null)
  }

  /** 数据存储空间未配置时拦截写入类操作，改为弹出提示 */
  /** 执行搜索：把草稿关键字提交为生效关键字 */
  function handleSearch() {
    setAppliedKeyword(keyword)
    setPage(1)
  }

  /**
   * 清空搜索内容
   *
   * 清空输入框的草稿值，同时把生效关键字一并置空并回到第 1 页，
   * 避免出现「输入框已空、列表仍被旧关键字过滤」的不一致状态。
   */
  function handleClearSearch() {
    setKeyword('')
    setAppliedKeyword('')
    setPage(1)
  }

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
      <PlatformHeader />
      <div className="flex min-h-0 flex-1">
        <SideNav activeKey="数据集管理" />

        <main className="min-w-0 flex-1 overflow-auto bg-white px-6 pb-8 pt-6">
          <h1 className="text-[28px] font-bold leading-10 text-[#323232]">数据集管理</h1>
          <p className="mt-2 text-[14px] leading-6 text-[#aaaaaa]">
            集中管理大模型微调训练与评测所需的数据资产，为训练与评测流程提供统一的数据入口。
          </p>

          {spaceReady ? (
          <section className="mt-6 flex min-h-[620px] flex-col rounded-[2px] border border-[#e5e6eb] bg-white p-5">
            {/* 工具栏 */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => navigate(CREATE_PATH)}
                disabled={!spaceReady}
                title={spaceReady ? undefined : '未开通数据存储空间，暂不可创建数据集'}
                className="flex h-10 items-center gap-2 rounded-[2px] bg-[#166eff] px-4 text-[14px] text-white transition-colors hover:bg-[#0d5fe0] disabled:cursor-not-allowed disabled:bg-[#a3c4ff] disabled:hover:bg-[#a3c4ff]"
              >
                <Plus size={16} strokeWidth={2.6} />
                创建数据集
              </button>

              <div className="flex shrink-0 items-center gap-2">
                <SearchBar
                  value={keyword}
                  onChange={setKeyword}
                  onSearch={handleSearch}
                  showClear
                  onClear={handleClearSearch}
                  inputWidth={292}
                  placeholder="请输入数据集名称"
                  aria-label="搜索数据集名称"
                  showRefresh={false}
                />
                {__showFeat && <NewTag code="F-SEARCH" compact className="ml-2" />}
                {__showFeat && <NewTag code="F-CLEAR" compact className="ml-2" />}
              </div>
            </div>

            {/* 表格 */}
            <div className="mt-6 flex-1">
              <div className="mb-2 flex items-center gap-2">
                {__showFeat && <NewTag code="F-LIST" compact />}
              </div>
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-[#f5f5f7] text-[14px] text-[#5c70b5]">
                    <th className="w-[24%] whitespace-nowrap px-3 py-4 font-bold">数据集名称</th>
                    <th className="w-[10%] whitespace-nowrap px-2 py-4 font-bold">最新版本</th>
                    <th className="w-[16%] whitespace-nowrap px-2 py-4 font-bold">数据集标签</th>
                    <th className="w-[12%] whitespace-nowrap px-2 py-4 font-bold">创建者</th>
                    <th className="w-[18%] whitespace-nowrap px-2 py-4 font-bold">创建时间</th>
                    <th className="w-[20%] whitespace-nowrap px-2 py-4 font-bold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((dataset) => (
                    <tr key={dataset.id}>
                      <td className="px-3 py-4">
                        <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                          <button
                            onClick={() => navigate(`${DETAIL_PATH}?id=${dataset.id}`)}
                            className={`min-w-0 truncate text-[13px] hover:underline ${BLUE}`}
                            title={dataset.name}
                          >
                            {dataset.name}
                          </button>
                          <button
                            onClick={() => setRenameTarget(dataset)}
                            aria-label="编辑数据集名称"
                            title="编辑数据集名称"
                            className="shrink-0 text-[#c0c4cc] hover:text-[#166eff]"
                          >
                            <Pencil size={13} strokeWidth={2} />
                          </button>
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex h-6 min-w-[52px] items-center justify-center rounded-[2px] bg-[#f6f6f6] px-2 text-[12px] text-[#3d3d3d]">
                          {dataset.latestVersion}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <TagChips tags={dataset.tags} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-[13px] text-[#3d3d3d]">{dataset.creator}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-[12px] tabular-nums text-[#3d3d3d]">{dataset.createdAt}</td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-x-2 whitespace-nowrap text-[13px]">
                          <RowLink onClick={() => navigate(`${DETAIL_PATH}?id=${dataset.id}`)}>详情</RowLink>
                          <RowLink
                            disabled={!spaceReady}
                            title={spaceReady ? undefined : '未开通数据存储空间，暂不可新增版本'}
                            onClick={() => setNewVersionTarget(dataset)}
                          >
                            新增版本
                          </RowLink>
                          <RowLink
                            disabled={!spaceReady}
                            title={spaceReady ? undefined : '未开通数据存储空间，暂不可上传文件'}
                            onClick={() => setUploadTarget(dataset)}
                          >
                            上传文件
                          </RowLink>
                          <RowLink tone="red" onClick={() => setDeleteTarget(dataset)}>
                            删除
                          </RowLink>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-[14px] text-[#86909c]">
                        暂无数据集，点击左上角「创建数据集」开始
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页：无数据时隐藏 */}
            {filtered.length > 0 && (
              <TablePagination
                className="mt-6 justify-end"
                total={filtered.length}
                page={currentPage}
                pageSize={pageSize}
                pageSizeOptions={[...PAGE_SIZES]}
                onChange={({ page: nextPage, pageSize: nextSize }) => {
                  setPageSize(nextSize)
                  setPage(nextPage)
                }}
                extra={__showFeat ? <NewTag code="F-PAGINATION" compact /> : undefined}
              />
            )}
          </section>
          ) : (
            <div className="mt-6">
              <SpaceBlockedState />
            </div>
          )}
        </main>
      </div>

      {renameTarget && (
        <RenameDialog dataset={renameTarget} onClose={() => setRenameTarget(null)} onRename={handleRename} />
      )}
      {deleteTarget && (
        <DeleteDialog dataset={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
      {newVersionTarget && (
        <NewVersionDialog
          dataset={newVersionTarget}
          onClose={() => setNewVersionTarget(null)}
          onConfirm={handleNewVersionConfirm}
        />
      )}
      {uploadTarget && (
        <UploadDialog dataset={uploadTarget} onClose={() => setUploadTarget(null)} onConfirm={handleUpload} />
      )}
    </div>
    <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}
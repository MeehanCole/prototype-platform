/**
 * 算力加速平台-数据管理 - 创建数据集（独立表单页）
 *
 * 设计取向：数据集是「可被容器挂载的文件集合」，平台不对内容做类型约束。
 * 1. 顶部返回栏（返回箭头 + 竖线 + 创建数据集）
 * 2. 基本信息：数据集名称（必填）+ 数据集标签（选填，仅用于展示与归类，不参与列表搜索）+ 数据集描述
 * 3. 数据上传：普通上传 / 客户端上传双页签，不限制文件格式
 * 4. 表单底部「取消 / 创建」按钮，在上传区内居中并下移
 */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, Info, Terminal, Trash2 } from 'lucide-react'
import { PlatformHeader, SideNav } from '../数据集管理/_shared'
import { TagPicker } from '../数据集管理/tags'
import {
  DESC_MAX_LENGTH,
  NAME_MAX_LENGTH,
  nowStamp,
} from '../数据集管理/mock'
import type { Dataset } from '../数据集管理/mock'
import { prependDataset } from '../数据集管理/store'
import { isSpaceReady } from '../数据集管理/storage'
import { SpaceBlockedState } from '../数据集管理/space-notice'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

const LIST_PATH = '/算力加速平台/数据管理/数据集管理'

const MAX_FILE_SIZE = 2048 * 1024 * 1024
const MAX_FILES = 20
const NAME_PATTERN = /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/

/** 表单输入控件与上传区统一宽度 */
const FIELD_WIDTH = 'w-[560px]'

/** 上传说明：不再限定文件格式 */
const UPLOAD_HINT = `不限文件格式，文件按原样存入存储目录；单个文件不超过 2048M，单次最多 ${MAX_FILES} 个文件`

/**
 * 客户端上传命令（创建前展示）
 *
 * 存储路径与访问凭证在点击【创建】后才由平台分配，创建前不存在真实地址，
 * 因此命令中的 Endpoint 凭证与目标路径统一使用占位符，
 * 由创建成功后的页面/详情页回填真实值。
 */
const CLIENT_UPLOAD_STEPS = [
  {
    title: '1. 配置凭证与 Endpoint',
    command: 'mc alias set <别名> <Endpoint> <AccessKey> <SecretKey>',
  },
  {
    title: '2. 上传单个文件：',
    command: 'mc cp ./my_file <别名>/<数据集存储路径>/v1/',
  },
  {
    title: '3. 上传整个本地文件夹（文件需要平铺，不支持子目录）',
    command: 'mc mirror ./my_dir/ <别名>/<数据集存储路径>/v1/',
  },
]

/**
 * 客户端上传的前置说明
 *
 * 关键信息是「现在拿不到真实路径与凭证」，因此不写成整段正文，
 * 改为一条浅蓝提示条 + 三步要点，让用户一眼看清先后顺序。
 */
const CLIENT_UPLOAD_NOTICE = {
  title: '创建后才会分配存储路径与访问凭证',
  steps: [
    '点击【创建】，系统分配专属存储路径与访问凭证，并生成 V1 版本',
    '在数据集列表或详情页点击「上传文件」，切到客户端上传即可复制可直接执行的命令',
    '在本地终端执行命令传输文件，完成后状态自动转为「导入成功」',
  ],
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  return `${(bytes / 1024).toFixed(2)}KB`
}

/** 区块标题：左侧 3px 蓝色竖条 + 粗体标题 */
function SectionTitle({ text }: { text: string }) {
  return (
    <div className="flex items-center">
      <span className="mr-2.5 h-[14px] w-[3px] rounded-[1px] bg-[#1890ff]" />
      <span className="text-[15px] font-bold text-[#1d2129]">{text}</span>
    </div>
  )
}

/** 表单字段标签：右对齐固定列宽 */
function FieldLabel({
  text,
  required,
  topOffset = 'pt-[7px]',
}: {
  text: string
  required?: boolean
  topOffset?: string
}) {
  return (
    <div className={`flex w-[112px] shrink-0 items-start justify-end pr-5 ${topOffset}`}>
      <span className="whitespace-nowrap text-[13px] leading-5 text-[#333]">{text}</span>
      {required && <span className="ml-0.5 text-[13px] leading-5 text-[#f53f3f]">*</span>}
    </div>
  )
}


/** 设计稿蓝色上传托盘图标 */
function UploadTrayIcon() {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden>
      <path d="M14 2L7.5 8.8H11.6V14.8H16.4V8.8H20.5L14 2Z" fill="#1890ff" />
      <path
        d="M4 15.5V19.5C4 20.6 4.9 21.5 6 21.5H22C23.1 21.5 24 20.6 24 19.5V15.5H21V18.5H7V15.5H4Z"
        fill="#1890ff"
      />
    </svg>
  )
}

/** 文件行左侧类型图标：取扩展名，不再固定 Json */
function FileExtIcon({ fileName }: { fileName: string }) {
  const ext = fileName.includes('.') ? fileName.split('.').pop()!.slice(0, 4) : 'FILE'
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#f2f3f5] text-[10px] font-bold uppercase tracking-tight text-[#86909c]">
      {ext}
    </div>
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
    <div className="group relative mt-1.5 pr-7">
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

function ActionButton({
  children,
  onClick,
  variant = 'default',
  disabled,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'default'
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        variant === 'primary'
          ? 'h-[34px] w-[88px] rounded-[4px] bg-[#1890ff] text-[13px] text-white transition-colors hover:bg-[#0d7be8] disabled:cursor-not-allowed disabled:bg-[#a0cfff]'
          : 'h-[34px] w-[88px] rounded-[4px] border border-[#d9d9d9] bg-white text-[13px] text-[#333] transition-colors hover:border-[#1890ff] hover:text-[#1890ff]'
      }
    >
      {children}
    </button>
  )
}

export default function CreateDatasetPage({ __showFeat = false }: { __showFeat?: boolean } = {}) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  /** 未配置数据存储空间时禁止创建数据集 */
  const spaceReady = isSpaceReady(params.get('noSpace') === '1')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tab, setTab] = useState<'server' | 'client'>('server')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const nameInvalid = name.length > 0 && !NAME_PATTERN.test(name)
  const canSubmit = name.trim().length > 0 && !nameInvalid && (tab === 'client' || files.length > 0)

  function pickFiles(list: FileList | null) {
    if (!list) return
    const picked = Array.from(list)
    const accepted: File[] = []
    let tooLarge = 0
    for (const file of picked) {
      if (file.size > MAX_FILE_SIZE) {
        tooLarge += 1
        continue
      }
      accepted.push(file)
    }

    setFileError(tooLarge > 0 ? `${tooLarge} 个文件超过 2048M 已忽略` : '')

    setFiles((prev) => {
      const merged = [...prev, ...accepted]
      if (merged.length > MAX_FILES) {
        setFileError((old) => (old ? `${old}，` : '') + `最多上传 ${MAX_FILES} 个文件，超出部分已忽略`)
      }
      return merged.slice(0, MAX_FILES)
    })
  }

  function handleSubmit() {
    if (!canSubmit) return
    if (!spaceReady) return
    const stamp = nowStamp()
    const initialStatus = tab === 'client' ? '初始化' : '导入中'
    const dataset: Dataset = {
      id: `ds-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      latestVersion: 'V1',
      tags,
      status: initialStatus,
      creator: 'admin',
      createdAt: stamp,
      location: '待上传',
      samples: 0,
      sizeGB: 0,
      versions: [
        {
          version: 'V1',
          note:
            tab === 'client'
              ? '客户端上传，等待写入存储'
              : `上传 ${files.length} 个文件，正在写入存储`,
          createdAt: stamp,
          samples: 0,
          status: initialStatus,
        },
      ],
    }
    prependDataset(dataset)
    navigate(LIST_PATH)
  }

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white [font-family:'PingFang_SC','Microsoft_YaHei',Arial,sans-serif]">
      <PlatformHeader />

      <div className="flex min-h-0 flex-1">
        <SideNav activeKey="数据集管理" />

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          {/* 顶部返回栏：← | 创建数据集 */}
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
            <span className="text-[14px] font-medium text-[#1d2129]">创建数据集</span>
          </div>

          {/* 表单主体：未开通数据空间时整块替换为阻断态 */}
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-12 pt-5">
          {spaceReady ? (
            <>
              <div className="flex items-center">
                <SectionTitle text="基本信息" />
                {__showFeat && <NewTag code="F-RETURN" compact className="ml-2" />}
                {__showFeat && <NewTag code="F-BASIC" compact className="ml-2" />}
              </div>

            <div className="mt-5 space-y-4">
              {/* 数据集名称 */}
              <div className="flex items-start">
                <FieldLabel text="数据集名称" required />
                <div
                  className={`flex h-[34px] ${FIELD_WIDTH} shrink-0 items-center rounded-[4px] border bg-white px-3 transition-colors focus-within:border-[#1890ff] ${
                    nameInvalid ? 'border-[#f53f3f]' : 'border-[#e5e6eb]'
                  }`}
                >
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value.slice(0, NAME_MAX_LENGTH))
                      setSubmitError('')
                    }}
                    placeholder="请输入数据集名称"
                    className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#1d2129] outline-none placeholder:text-[#c9cdd4]"
                  />
                  <span className="ml-2 shrink-0 text-[12px] text-[#c9cdd4]">
                    {name.length}/{NAME_MAX_LENGTH}
                  </span>
                </div>
              </div>
              {/* 校验规则仅在输入非法字符时提示，不做常驻展示 */}
              {nameInvalid && (
                <p className="pl-[112px] text-[12px] leading-5 text-[#f53f3f]">
                  数据集名称仅支持大小写英文字母、汉字、数字、短划线（-）、下划线（_）
                </p>
              )}

              {/* 数据集标签 */}
              <div className="flex items-start">
                <FieldLabel text="数据集标签" />
                <TagPicker value={tags} onChange={setTags} widthClass={FIELD_WIDTH} />
                {__showFeat && <NewTag code="F-TAGS" compact className="ml-2 mt-[7px]" />}
              </div>

              {/* 数据集描述 */}
              <div className="flex items-start">
                <FieldLabel text="数据集描述" />
                <div className="relative rounded-[4px] border border-[#e5e6eb] bg-white px-3 pb-6 pt-2 transition-colors focus-within:border-[#1890ff] w-[560px] shrink-0">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX_LENGTH))}
                    placeholder="例如：客服对话语料，用于 Qwen 微调训练；或 产品手册 PDF，供知识库检索使用"
                    rows={2}
                    className="w-full resize-none bg-transparent text-[13px] leading-5 text-[#1d2129] outline-none placeholder:text-[#c9cdd4]"
                  />
                  <span className="pointer-events-none absolute bottom-1.5 right-3 text-[12px] text-[#c9cdd4]">
                    {description.length}/{DESC_MAX_LENGTH}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-center">
              <SectionTitle text="数据上传" />
            </div>

            <div className="mt-5 space-y-5">
              <div className="flex items-start">
                <FieldLabel text="数据集上传" required />
                <div className="min-w-0 flex-1">
                  {/* 分段控件：左蓝右白 / 左白右蓝 */}
                  <div className="inline-flex h-[34px] overflow-hidden rounded-[4px] border border-[#d9d9d9] bg-white">
                    {(
                      [
                        ['server', '普通上传'],
                        ['client', '客户端上传'],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        className={`h-full w-[100px] text-[13px] transition-colors ${
                          tab === key
                            ? 'bg-[#1890ff] font-medium text-white'
                            : 'bg-white text-[#333] hover:text-[#1890ff]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {tab === 'server' ? (
                    <div className="mt-4">
                      {__showFeat && <NewTag code="F-NORMAL-UPLOAD" compact className="ml-2" />}
                      <label
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          pickFiles(e.dataTransfer.files)
                        }}
                        className={`flex ${FIELD_WIDTH} shrink-0 cursor-pointer flex-col items-center justify-center rounded-[4px] border border-dashed border-[#dcdfe6] bg-[#fafbfd] py-8 transition-colors hover:border-[#1890ff]`}
                      >
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            pickFiles(e.target.files)
                            e.target.value = ''
                          }}
                        />
                        <UploadTrayIcon />
                        <span className="mt-3 text-[13px] text-[#333]">
                          拖拽文件到此处，或<span className="text-[#1890ff]">点击上传</span>
                        </span>
                        <span className="mt-1.5 max-w-[520px] text-center text-[12px] leading-5 text-[#a7acb3]">
                          {UPLOAD_HINT}
                        </span>
                      </label>

                      {fileError && <p className="mt-2 text-[12px] text-[#f53f3f]">{fileError}</p>}

                      {files.length > 0 && (
                        <ul className={`mt-3 space-y-2 ${FIELD_WIDTH} shrink-0`}>
                          {files.map((file, index) => (
                            <li
                              key={`${file.name}-${index}`}
                              className="flex items-center gap-3 rounded-[4px] border border-[#e5e6eb] bg-white px-4 py-2.5"
                            >
                              <FileExtIcon fileName={file.name} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] leading-5 text-[#1d2129]">
                                  {file.name}
                                </p>
                                <p className="text-[11px] leading-4 text-[#a7acb3]">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                              <span className="shrink-0 text-[11px] text-[#a7acb3]">待上传</span>
                              <button
                                type="button"
                                aria-label={`移除 ${file.name}`}
                                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                                className="shrink-0 text-[#c9cdd4] transition-colors hover:text-[#f53f3f]"
                              >
                                <Trash2 size={15} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4">
                      {/* 前置说明：浅蓝信息条 + 三步要点 */}
                      <div className={`mb-4 ${FIELD_WIDTH} shrink-0 rounded-[4px] border border-[#bcd7ff] bg-[#f2f7ff] px-4 py-3`}>
                        <div className="flex items-start gap-2">
                          <Info
                            size={14}
                            className="mt-[3px] shrink-0 text-[#1890ff]"
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium leading-5 text-[#1d2129]">
                              {CLIENT_UPLOAD_NOTICE.title}
                              {__showFeat && <NewTag code="F-CLIENT-UPLOAD" compact className="ml-2" />}
                            </p>
                            <ol className="mt-1.5 space-y-1">
                              {CLIENT_UPLOAD_NOTICE.steps.map((step, index) => (
                                <li key={step} className="flex items-start gap-1.5">
                                  <span className="mt-[1px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-[#1890ff] text-[10px] font-semibold leading-none text-white">
                                    {index + 1}
                                  </span>
                                  <span className="text-[12px] leading-[19px] text-[#4e5969]">
                                    {step}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`${FIELD_WIDTH} shrink-0 rounded-[4px] border border-dashed border-[#e5e6eb] bg-[#f8f9fc] px-5 py-4`}
                      >
                        <div className="mb-3 flex items-center gap-1.5 border-b border-dashed border-[#e3e6eb] pb-2.5">
                          <Terminal size={13} className="shrink-0 text-[#86909c]" aria-hidden />
                          <span className="text-[12px] font-medium text-[#4e5969]">
                            创建后执行的命令（模板）
                          </span>
                          <span className="ml-auto shrink-0 text-[11px] text-[#a7acb3]">
                            路径与凭证创建后回填
                          </span>
                        </div>
                        {CLIENT_UPLOAD_STEPS.map((step) => (
                          <div key={step.title} className="mb-4 last:mb-0">
                            <p className="text-[13px] leading-5 text-[#333]">{step.title}</p>
                            <CommandBlock command={step.command} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {submitError && (
              <p className="mt-4 text-[12px] text-[#f53f3f]">{submitError}</p>
            )}

            {/* 底部按钮：在上传区（560px 列）内水平居中，并向下留出间距 */}
            <div className="mt-12 ml-[112px] flex w-[560px] shrink-0 items-center justify-center gap-4">
              <ActionButton onClick={() => navigate(LIST_PATH)}>取消</ActionButton>
              <div className="flex items-center">
                <ActionButton
                  variant="primary"
                  disabled={!canSubmit || !spaceReady}
                  title={spaceReady ? undefined : '未开通数据存储空间，暂不可创建数据集'}
                  onClick={() => {
                    if (nameInvalid) {
                      setSubmitError('数据集名称仅支持大小写英文字母、汉字、数字、短划线（-）、下划线（_）')
                      return
                    }
                    handleSubmit()
                  }}
                >
                  创建
                </ActionButton>
                {__showFeat && <NewTag code="F-SUBMIT" compact className="ml-2" />}
              </div>
            </div>
            </>
          ) : (
            <SpaceBlockedState />
          )}
          </div>
        </main>
      </div>
    </div>
    <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

/**
 * 算力加速平台-数据管理 - 创建数据集（独立表单页）
 *
 * 设计取向：数据集是「可被容器挂载的文件集合」，平台不对内容做类型约束。
 * 1. 顶部返回栏（返回箭头 + 竖线 + 创建数据集）
 * 2. 基本信息：数据集名称（必填）+ 数据集标签（选填，仅用于展示与归类，不参与列表搜索）+ 数据集描述
 * 3. 表单底部「取消 / 创建」按钮，在表单列内居中
 */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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

const NAME_PATTERN = /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/

/** 表单输入控件统一宽度 */
const FIELD_WIDTH = 'w-[560px]'

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
  const [submitError, setSubmitError] = useState('')

  const nameInvalid = name.length > 0 && !NAME_PATTERN.test(name)
  const canSubmit = name.trim().length > 0 && !nameInvalid

  function handleSubmit() {
    if (!canSubmit) return
    if (!spaceReady) return
    const stamp = nowStamp()
    const dataset: Dataset = {
      id: `ds-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      latestVersion: 'V1',
      tags,
      status: '初始化',
      creator: 'admin',
      createdAt: stamp,
      location: '待上传',
      samples: 0,
      sizeGB: 0,
      versions: [
        {
          version: 'V1',
          note: '创建完成，等待上传文件',
          createdAt: stamp,
          samples: 0,
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


            {submitError && (
              <p className="mt-4 text-[12px] text-[#f53f3f]">{submitError}</p>
            )}

            {/* 底部按钮：在表单列（560px）内水平居中，并向下留出间距 */}
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

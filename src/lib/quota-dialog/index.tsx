/**
 * 配额设置弹窗（通用件）
 *
 * 两种形态，均按设计稿 1:1 还原：
 *
 * 租户配额（mode = tenant）
 *   头部：标题 + 当前租户 / 当前集群 + 灰色注：提示
 *   设置配额：CPU 预留 / 内存预留 一行，CPU 限制 / 内存限制 一行，四项均为必填标记
 *   高级设置：右侧箭头可折叠，内含 GPU 配额（标题 + 蓝色圆形 + 按钮）
 *   底部：取消 / 确定
 *   注意：租户维度有「数据存储配额」与「GPU 配额」，没有「应用资源」
 *
 * 项目配额（mode = project）
 *   头部：标题 + 当前项目 + 灰色注：提示
 *   项目可用配额：浅蓝汇总条（资源预留 / 资源限制）
 *   设置配额：CPU 预留 / CPU 限制 一行，内存预留 / 内存限制 一行
 *   高级设置：数据存储 + 容量提示 + GPU 配额
 *   GPU 配额：标题 + 蓝色 + 按钮
 *   应用资源：资源 / 配额 两列表格
 *   底部：取消 / 确定
 */
import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, CircleHelp, Plus, Trash2, X } from 'lucide-react'

/* ---------------------------------- 类型 ---------------------------------- */

/** 弹窗草稿，统一用字符串保存，空串表示「不预留 / 不限制 / 不开启」 */
export interface QuotaDraft {
  cpuReserve: string
  cpuLimit: string
  memReserve: string
  memLimit: string
  storage: string
  gpu: QuotaGpuRow[]
  apps: QuotaAppRow[]
}

export interface QuotaGpuRow {
  id: string
  model: string
  quota: string
}

export interface QuotaAppRow {
  id: string
  name: string
  quota: string
}

export type QuotaDialogMode = 'tenant' | 'project'

export interface QuotaDialogProps {
  mode: QuotaDialogMode
  title: string
  /** 头部上下文行，如 当前租户：xxx / 当前集群：xxx（xxx） */
  contextLines: string[]
  value: QuotaDraft
  /** 数据存储容量提示，仅项目维度使用 */
  storageHint?: string
  /** 附加在容量提示后的节点，如页面级「说明」标记 */
  storageTag?: ReactNode
  /** 「预留」行的叫法：默认 预留，容器配额场景用 请求 */
  reserveLabel?: string
  /** 「预留」为空时的占位文案，默认「不预留」 */
  reserveEmptyText?: string
  /** 是否展示「项目可用配额」浅蓝汇总条 */
  showSummary?: boolean
  /** 是否展示「应用资源」表格 */
  showApps?: boolean
  /** 是否展示「数据存储配额」 */
  showStorage?: boolean
  onClose: () => void
  onConfirm: (next: QuotaDraft) => void
}

/* --------------------------------- 固定文案 -------------------------------- */

const NOTE = '注：设置（租户、项目）配额后，请同时设置默认容器配额，防止容器组无法启动。'

const STORAGE_HELP = '数据存储配额主要用于存放数据集、模型文件等；留空或填 0 代表不开启数据存储空间。'

/** 初始草稿：应用资源默认按传入名称生成 */
export function createQuotaDraft(appNames: string[] = ['容器组']): QuotaDraft {
  return {
    cpuReserve: '',
    cpuLimit: '',
    memReserve: '',
    memLimit: '',
    storage: '',
    gpu: [],
    apps: appNames.map((name, index) => ({ id: `app-${index}`, name, quota: '' })),
  }
}

/* -------------------------------- 工具函数 -------------------------------- */

/** 汇总条展示：空串按「不预留 / 不限制」语义输出 */
function summaryText(value: string, emptyText: string, unit: string) {
  const num = Number(value)
  if (!value.trim() || Number.isNaN(num)) return emptyText
  return `${num} ${unit}`
}

/* -------------------------------- 子组件 -------------------------------- */

/** 带单位后缀的数字输入：单位贴在输入框右内侧 */
function NumberField({
  label,
  unit,
  value,
  placeholder,
  required,
  onChange,
}: {
  label: string
  unit: string
  value: string
  placeholder: string
  required?: boolean
  onChange: (next: string) => void
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex w-[60px] shrink-0 items-center whitespace-nowrap text-[13px] leading-5 text-[#1d2129]">
        {label}
        {required && <span className="ml-0.5 text-[#f53f3f]">*</span>}
      </span>
      <span className="flex h-8 min-w-0 flex-1 items-center rounded-[2px] border border-[#e3e5eb] bg-white focus-within:border-[#166eff]">
        <input
          value={value}
          placeholder={placeholder}
          aria-label={label}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))}
          className="h-full w-full min-w-0 bg-transparent px-2.5 text-[13px] text-[#1d2129] outline-none placeholder:text-[#a7acb3]"
        />
        <span className="shrink-0 pr-2.5 text-[13px] text-[#a7acb3]">{unit}</span>
      </span>
    </div>
  )
}

/** 灰色 ? 图标：鼠标移入在图标上方浮出说明气泡 */
function HintIcon({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`group relative inline-flex items-center ${className}`}>
      <CircleHelp size={12} className="text-[#a7acb3]" aria-label={text} />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-[18px] z-20 hidden w-[320px] rounded-[2px] bg-[#1d2129] px-2.5 py-1.5 text-left text-[12px] font-normal leading-5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)] group-hover:block"
      >
        {text}
      </span>
    </span>
  )
}

/** 小节标题：可选 ⓘ 说明与右侧操作 */
function SectionHeading({
  title,
  hint,
  right,
  level = 'main',
}: {
  title: string
  hint?: string
  right?: React.ReactNode
  /** main=一级小节 14px 粗体，sub=高级设置内的小标题 13px */
  level?: 'main' | 'sub'
}) {
  return (
    <div className="flex items-center justify-between">
      <h3
        className={`flex items-center gap-1 ${
          level === 'main'
            ? 'text-[14px] font-bold text-[#1d2129]'
            : 'text-[13px] font-bold text-[#1d2129]'
        }`}
      >
        {title}
        {hint && <HintIcon text={hint} />}
      </h3>
      {right}
    </div>
  )
}

/** 蓝色圆形「+」按钮：设计稿为实心圆点，直径 24px */
function PlusButton({ onClick, ariaLabel }: { onClick: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#166eff] text-white transition-colors hover:bg-[#0d5fe0]"
    >
      <Plus size={14} strokeWidth={2.4} />
    </button>
  )
}

/** GPU 配额列表：型号 + 数量（卡），可删除 */
function GpuRows({
  rows,
  onPatch,
  onRemove,
}: {
  rows: QuotaGpuRow[]
  onPatch: (id: string, key: 'model' | 'quota', next: string) => void
  onRemove: (id: string) => void
}) {
  if (rows.length === 0) return null
  return (
    <div className="mt-2 space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-3">
          <span className="flex h-8 w-[168px] items-center rounded-[2px] border border-[#e3e5eb] bg-white focus-within:border-[#166eff]">
            <input
              value={row.model}
              aria-label="GPU 型号"
              placeholder="请输入 GPU 型号"
              onChange={(event) => onPatch(row.id, 'model', event.target.value)}
              className="h-full w-full min-w-0 bg-transparent px-2.5 text-[13px] text-[#1d2129] outline-none placeholder:text-[#a7acb3]"
            />
          </span>
          <span className="flex h-8 w-[168px] items-center rounded-[2px] border border-[#e3e5eb] bg-white focus-within:border-[#166eff]">
            <input
              value={row.quota}
              aria-label="GPU 数量"
              placeholder="请输入数量"
              onChange={(event) => onPatch(row.id, 'quota', event.target.value.replace(/[^\d]/g, ''))}
              className="h-full w-full min-w-0 bg-transparent px-2.5 text-[13px] text-[#1d2129] outline-none placeholder:text-[#a7acb3]"
            />
            <span className="shrink-0 pr-2.5 text-[13px] text-[#a7acb3]">卡</span>
          </span>
          <button
            type="button"
            aria-label="删除该 GPU 配额"
            onClick={() => onRemove(row.id)}
            className="text-[#86909c] transition-colors hover:text-[#f53f3f]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------- 弹窗 ---------------------------------- */

export function QuotaDialog({
  mode,
  title,
  contextLines,
  value,
  storageHint,
  storageTag,
  reserveLabel = '预留',
  reserveEmptyText = '不预留',
  showSummary = mode === 'project',
  showApps = mode === 'project',
  showStorage = true,
  onClose,
  onConfirm,
}: QuotaDialogProps) {
  const [draft, setDraft] = useState<QuotaDraft>(value)
  const [advancedOpen, setAdvancedOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const patch = (
    key: 'cpuReserve' | 'cpuLimit' | 'memReserve' | 'memLimit' | 'storage',
    next: string,
  ) => setDraft((prev) => ({ ...prev, [key]: next }))

  const patchGpu = (id: string, key: 'model' | 'quota', next: string) =>
    setDraft((prev) => ({
      ...prev,
      gpu: prev.gpu.map((row) => (row.id === id ? { ...row, [key]: next } : row)),
    }))

  const addGpu = () =>
    setDraft((prev) => ({
      ...prev,
      gpu: [...prev.gpu, { id: `gpu-${Date.now()}`, model: '', quota: '' }],
    }))

  const removeGpu = (id: string) =>
    setDraft((prev) => ({ ...prev, gpu: prev.gpu.filter((row) => row.id !== id) }))

  const patchApp = (id: string, next: string) =>
    setDraft((prev) => ({
      ...prev,
      apps: prev.apps.map((row) => (row.id === id ? { ...row, quota: next } : row)),
    }))

  const addApp = () =>
    setDraft((prev) => ({
      ...prev,
      apps: [...prev.apps, { id: `app-${Date.now()}`, name: '自定义资源', quota: '' }],
    }))

  const handleConfirm = () => {
    for (const row of draft.gpu) {
      if (!row.model.trim()) {
        setError('请填写新增 GPU 的型号')
        return
      }
      if (!row.quota.trim()) {
        setError(`请填写「${row.model}」的 GPU 配额`)
        return
      }
    }
    onConfirm(draft)
  }

  /** 四个 CPU / 内存 字段：租户按 CPU / 内存 成对，项目按预留 / 限制 成对 */
  const reserveField = {
    label: `CPU ${reserveLabel}`,
    unit: '核',
    key: 'cpuReserve' as const,
    placeholder: reserveEmptyText,
  }
  const memReserveField = {
    label: `内存${reserveLabel}`,
    unit: 'GiB',
    key: 'memReserve' as const,
    placeholder: reserveEmptyText,
  }
  const cpuLimitField = { label: 'CPU 限制', unit: '核', key: 'cpuLimit' as const, placeholder: '不限制' }
  const memLimitField = {
    label: '内存限制',
    unit: 'GiB',
    key: 'memLimit' as const,
    placeholder: '不限制',
  }
  const fields =
    mode === 'project'
      ? [reserveField, cpuLimitField, memReserveField, memLimitField]
      : [reserveField, memReserveField, cpuLimitField, memLimitField]

  /** 租户弹窗更宽：与设计稿一致，两列输入框横跨整行 */
  const panelWidth = mode === 'tenant' ? 'w-[900px]' : 'w-[660px]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] ${panelWidth} max-w-[94vw] flex-col rounded-[2px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)]`}
      >
        {/* 头部 */}
        <div className="flex items-start justify-between px-6 pb-3 pt-4">
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-6 text-[#1d2129]">{title}</p>
            {contextLines.map((line) => (
              <p key={line} className="mt-1 text-[12px] leading-5 text-[#1d2129]">
                {line}
              </p>
            ))}
            <p className="mt-1 text-[12px] leading-5 text-[#86909c]">{NOTE}</p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="ml-3 mt-1 shrink-0 text-[#86909c] transition-colors hover:text-[#1d2129]"
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#f0f0f0]">
          {/* 项目可用配额汇总（仅项目维度） */}
          {showSummary && (
            <section className="border-b border-[#f0f0f0] px-6 py-2.5">
              <SectionHeading title="项目可用配额" />
              <div className="mt-2 grid grid-cols-2 gap-x-6 rounded-[2px] bg-[#c7deef] px-4 py-2.5 text-[12px] leading-5 text-[#1d2129]">
                <p>
                  资源{reserveLabel}：CPU {summaryText(draft.cpuReserve, reserveEmptyText, '核')}，内存{' '}
                  {summaryText(draft.memReserve, reserveEmptyText, 'GiB')}
                </p>
                <p>
                  资源限制：CPU {summaryText(draft.cpuLimit, '不限制', '核')}，内存{' '}
                  {summaryText(draft.memLimit, '不限制', 'GiB')}
                </p>
              </div>
            </section>
          )}

          {/* 设置配额：四项均为必填 */}
          <section className="border-b border-[#f0f0f0] px-6 py-3">
            <SectionHeading title="设置配额" />
            <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3">
              {fields.map((field) => (
                <NumberField
                  key={field.label}
                  label={field.label}
                  unit={field.unit}
                  placeholder={field.placeholder}
                  required
                  value={draft[field.key]}
                  onChange={(next) => patch(field.key, next)}
                />
              ))}
            </div>
          </section>

          {/* 高级设置：数据存储（项目）+ GPU 配额 + 应用资源，全部收在这一节里 */}
          <section className="border-b border-[#f0f0f0] px-6 py-2.5">
            <SectionHeading
              title="高级设置"
              right={
                <button
                  type="button"
                  aria-label={advancedOpen ? '收起高级设置' : '展开高级设置'}
                  aria-expanded={advancedOpen}
                  onClick={() => setAdvancedOpen((prev) => !prev)}
                  className="flex h-6 w-6 items-center justify-center text-[#86909c] transition-colors hover:text-[#166eff]"
                >
                  {advancedOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
              }
            />

            {advancedOpen && (
              <>
                {showStorage && (
                  <>
                    {/*
                      数据存储：沿用「设置配额」的 2 列栅格，
                      左列结构与 NumberField 完全一致（标签 60px + 间距 12px + 弹性输入框），
                      因此输入框左右边缘与上方 CPU / 内存输入框逐像素对齐；
                      容量提示放到右列，与输入框同一行展示，不再单独换行。
                    */}
                    <div className="mt-2 grid grid-cols-2 gap-x-8">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex w-[60px] shrink-0 items-center gap-1 whitespace-nowrap text-[13px] leading-5 text-[#1d2129]">
                          数据存储
                          <HintIcon text={STORAGE_HELP} />
                        </span>
                        <span className="flex h-8 min-w-0 flex-1 items-center rounded-[2px] border border-[#e3e5eb] bg-white focus-within:border-[#166eff]">
                          <input
                            value={draft.storage}
                            aria-label="数据存储配额"
                            placeholder="请输入存储空间容量"
                            onChange={(event) =>
                              patch('storage', event.target.value.replace(/[^\d]/g, ''))
                            }
                            className="h-full w-full min-w-0 bg-transparent px-2.5 text-[13px] text-[#1d2129] outline-none placeholder:text-[#a7acb3]"
                          />
                          <span className="shrink-0 pr-2.5 text-[13px] text-[#a7acb3]">GB</span>
                        </span>
                      </div>
                      {storageHint && (
                        <span className="flex min-w-0 items-center text-[12px] leading-[18px] text-[#86909c]">
                          {storageHint}
                          {storageTag && <span className="ml-2 shrink-0">{storageTag}</span>}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* GPU 配额：内嵌在高级设置里，标题下方左对齐一个蓝色圆形 + 按钮 */}
                <div className={showStorage ? 'mt-3' : 'mt-2'}>
                  <SectionHeading level="sub" title="GPU 配额" />
                  <div className="mt-1.5">
                    <PlusButton onClick={addGpu} ariaLabel="添加 GPU 配额" />
                  </div>
                  <GpuRows rows={draft.gpu} onPatch={patchGpu} onRemove={removeGpu} />
                </div>

                {/* 应用资源：同样收在高级设置内，两列 资源 / 配额 */}
                {showApps && (
                  <div className="mt-3">
                    <SectionHeading level="sub" title="应用资源" />
                    <div className="mt-1.5">
                      <PlusButton onClick={addApp} ariaLabel="添加应用资源" />
                    </div>
                    <table className="mt-1.5 w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#e5e6eb] text-[12px] text-[#86909c]">
                          <th className="w-[46%] pb-1.5 font-normal">资源</th>
                          <th className="pb-1.5 font-normal">配额</th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px] text-[#1d2129]">
                        {draft.apps.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b border-dashed border-[#f0f0f0] last:border-b-0"
                          >
                            <td className="py-2">{row.name}</td>
                            <td className="py-2">
                              <span className="flex h-7 w-[132px] items-center rounded-[2px] border border-[#e3e5eb] bg-white focus-within:border-[#166eff]">
                                <input
                                  value={row.quota}
                                  aria-label={`${row.name}配额`}
                                  placeholder="请输入数量"
                                  onChange={(event) =>
                                    patchApp(row.id, event.target.value.replace(/[^\d]/g, ''))
                                  }
                                  className="h-full w-full min-w-0 bg-transparent px-2.5 text-[13px] text-[#1d2129] outline-none placeholder:text-[#a7acb3]"
                                />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* 底部 */}
        <div className="border-t border-[#f0f0f0] px-6 py-3">
          {error && <p className="mb-2 text-[12px] text-[#f53f3f]">{error}</p>}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-8 min-w-[64px] rounded-[2px] border border-[#e5e6eb] bg-white px-4 text-[13px] text-[#1d2129] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="h-8 min-w-[64px] rounded-[2px] bg-[#166eff] px-4 text-[13px] text-white transition-colors hover:bg-[#0d5fe0]"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

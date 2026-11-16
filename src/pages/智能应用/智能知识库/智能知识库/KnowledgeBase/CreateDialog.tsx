/**
 * 创建知识库 · 单步弹窗
 *
 * 基础信息必填；分块方式使用内置推荐预设，可在「高级设置」中调整。
 * 分块参数属于库创建人，平台不再维护默认值或调整权限。
 * 弹窗内不出现模型、向量引擎、Embedding 等字段。
 */
import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  FileText,
  Library,
  Loader2,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import type { ChunkStrategyKey } from './model'
import {
  CHUNK_STRATEGIES,
  DEFAULT_KB_CHUNK,
  getStrategy,
  SIZE_MAX,
  SIZE_MIN,
} from './policy'

const NAME_MAX = 40
const DESC_MAX = 200

export type CreateKbPayload = {
  name: string
  desc: string
  chunk: {
    strategy: ChunkStrategyKey
    size: number
    overlap: number
  }
}

type ParamErrors = { size?: string; overlap?: string }

export function CreateKbDialog({
  existingNames,
  onClose,
  onCreate,
}: {
  existingNames: string[]
  onClose: () => void
  onCreate: (payload: CreateKbPayload, enterAfterCreate: boolean) => void
}) {
  const initial = DEFAULT_KB_CHUNK
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [nameError, setNameError] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [strategy, setStrategy] = useState<ChunkStrategyKey>(initial.strategy)
  const [size, setSize] = useState(String(initial.size))
  const [overlap, setOverlap] = useState(String(initial.overlap))
  const [paramErrors, setParamErrors] = useState<ParamErrors>({})
  const [enterAfterCreate, setEnterAfterCreate] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const dirty = name.trim() !== '' || desc.trim() !== ''
  const strategyMeta = getStrategy(strategy)

  useEffect(() => {
    requestAnimationFrame(() => nameRef.current?.focus())
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (confirmClose) {
        setConfirmClose(false)
        return
      }
      if (busy) return
      if (dirty) setConfirmClose(true)
      else onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [busy, confirmClose, dirty, onClose])

  const validateName = () => {
    const value = name.trim()
    if (!value) return '请输入知识库名称'
    if (value.length < 2 || value.length > NAME_MAX) return `名称需为 2–${NAME_MAX} 个字符`
    if (existingNames.some((n) => n.trim().toLowerCase() === value.toLowerCase())) {
      return '该名称已被使用，请换一个名称'
    }
    return ''
  }

  const validateParams = (): ParamErrors => {
    const next: ParamErrors = {}
    const sizeNum = Number(size)
    const overlapNum = Number(overlap)
    if (!size.trim() || !Number.isInteger(sizeNum) || sizeNum < SIZE_MIN || sizeNum > SIZE_MAX) {
      next.size = `请输入 ${SIZE_MIN}–${SIZE_MAX} 之间的整数`
    }
    if (!overlap.trim() || !Number.isInteger(overlapNum) || overlapNum < 0) {
      next.overlap = '请输入不小于 0 的整数'
    } else if (!next.size && overlapNum > Math.floor(sizeNum / 2)) {
      next.overlap = '重叠不能超过块大小的一半'
    }
    return next
  }

  const pickStrategy = (key: ChunkStrategyKey) => {
    const meta = getStrategy(key)
    setStrategy(key)
    setSize(String(meta.size))
    setOverlap(String(meta.overlap))
    setParamErrors({})
  }

  const submit = () => {
    if (busy) return
    const nameErr = validateName()
    if (nameErr) {
      setNameError(nameErr)
      requestAnimationFrame(() => nameRef.current?.focus())
      return
    }

    const errors = validateParams()
    if (errors.size || errors.overlap) {
      setAdvanced(true)
      setParamErrors(errors)
      return
    }
    const chunk = { strategy, size: Number(size), overlap: Number(overlap) }

    setBusy(true)
    const payload: CreateKbPayload = {
      name: name.trim(),
      desc: desc.trim(),
      chunk,
    }
    window.setTimeout(() => onCreate(payload, enterAfterCreate), 450)
  }

  const requestClose = () => {
    if (busy) return
    if (dirty) setConfirmClose(true)
    else onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-kb-title"
        className="relative flex max-h-[90vh] w-[560px] max-w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
      >
        {/* 标题 */}
        <div className="flex shrink-0 items-start justify-between px-6 pt-5 pb-4">
          <div>
            <h2 id="create-kb-title" className="text-[17px] font-semibold leading-[26px] text-[#1f2329]">
              创建知识库
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[#8c8c8c]">
              填写基础信息即可创建，分块方式使用推荐预设。
            </p>
          </div>
          <button
            onClick={requestClose}
            disabled={busy}
            aria-label="关闭"
            className="-mr-1 -mt-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] text-[#8c8c8c] hover:bg-[#f5f6f7] hover:text-[#1f2329] disabled:cursor-not-allowed"
          >
            <X className="h-[17px] w-[17px]" />
          </button>
        </div>

        {/* 表单主体 */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="min-h-0 flex-1 overflow-y-auto px-6 pb-5"
        >
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="kb-name" className="text-[13px] font-medium text-[#1f2329]">
                知识库名称 <span className="text-[#f5222d]">*</span>
              </label>
              <span className="text-[11.5px] text-[#b0b3b8]">{name.length}/40</span>
            </div>
            <input
              ref={nameRef}
              id="kb-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              placeholder="例如：产品文档库"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'kb-name-error' : undefined}
              className={`h-10 w-full rounded-[6px] border bg-white px-3 text-[13.5px] text-[#1f2329] outline-none transition placeholder:text-[#b0b3b8] focus:ring-2 ${
                nameError
                  ? 'border-[#f5222d] focus:border-[#f5222d] focus:ring-[#f5222d]/10'
                  : 'border-[#dcdfe6] focus:border-[#166EFF] focus:ring-[#166EFF]/10'
              }`}
            />
            {nameError && (
              <p id="kb-name-error" className="mt-1.5 flex items-center gap-1 text-[12px] text-[#f5222d]">
                <AlertCircle className="h-[13px] w-[13px]" />
                {nameError}
              </p>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="kb-desc" className="text-[13px] font-medium text-[#1f2329]">
                描述
              </label>
              <span className="text-[11.5px] text-[#b0b3b8]">{desc.length}/200</span>
            </div>
            <textarea
              id="kb-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value.slice(0, DESC_MAX))}
              rows={3}
              placeholder="说明这个库主要放什么内容、给谁用，方便同事搜索。"
              className="w-full resize-none rounded-[6px] border border-[#dcdfe6] bg-white px-3 py-2 text-[13.5px] leading-[22px] text-[#1f2329] outline-none transition placeholder:text-[#b0b3b8] focus:border-[#166EFF] focus:ring-2 focus:ring-[#166EFF]/10"
            />
          </div>

          <div className="mt-4">
            <span className="mb-1.5 block text-[13px] font-medium text-[#1f2329]">类型</span>
            <div className="flex items-start gap-3 rounded-[8px] border border-[#e6e8eb] bg-[#fafbfc] px-3.5 py-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#eef4ff]">
                <Library className="h-[16px] w-[16px] text-[#166EFF]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#1f2329]">文档库</span>
                  <span className="rounded bg-[#f2f3f5] px-1.5 py-[1px] text-[11px] text-[#8c8c8c]">
                    当前仅支持
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-[12px] leading-[18px] text-[#8c8c8c]">
                  <FileText className="h-[12px] w-[12px]" />
                  支持 PDF / Word / Markdown / TXT，上传后自动解析。
                </p>
              </div>
            </div>
          </div>

          {/* 分块方式：内置推荐预设，可展开高级设置 */}
          <div className="mt-5 overflow-hidden rounded-[8px] border border-[#e6e8eb]">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#f2f3f5]">
                <SlidersHorizontal className="h-[15px] w-[15px] text-[#606266]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-[#1f2329]">分块方式</p>
                <p className="mt-0.5 text-[12px] text-[#8c8c8c]">
                  {strategyMeta.label} · {size} / {overlap} tokens
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdvanced((v) => !v)}
                aria-expanded={advanced}
                className="flex shrink-0 cursor-pointer items-center gap-1 text-[12.5px] text-[#166EFF] hover:text-[#0f5bd6]"
              >
                高级设置
                <ChevronDown
                  className={`h-[14px] w-[14px] transition-transform ${advanced ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {advanced && (
              <div className="border-t border-[#e6e8eb] bg-[#fafbfc] px-3.5 py-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {CHUNK_STRATEGIES.map((s) => {
                    const selected = strategy === s.key
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => pickStrategy(s.key)}
                        aria-pressed={selected}
                        className={`relative cursor-pointer rounded-[7px] border px-3 py-2.5 text-left transition ${
                          selected
                            ? 'border-[#166EFF] bg-[#f7faff] ring-1 ring-[#166EFF]'
                            : 'border-[#dcdfe6] bg-white hover:border-[#9dbcf7]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[12.5px] font-medium ${
                              selected ? 'text-[#166EFF]' : 'text-[#1f2329]'
                            }`}
                          >
                            {s.label}
                          </span>
                          {s.recommended && (
                            <span className="rounded bg-[#eef4ff] px-1 py-[1px] text-[10.5px] text-[#166EFF]">
                              推荐
                            </span>
                          )}
                          {selected && <Check className="ml-auto h-[13px] w-[13px] text-[#166EFF]" />}
                        </div>
                        <p className="mt-1 line-clamp-2 min-h-[32px] text-[11.5px] leading-[16px] text-[#8c8c8c]">
                          {s.desc}
                        </p>
                        <p className="mt-1 text-[11px] text-[#b0b3b8]">
                          {s.size} / {s.overlap}
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="kb-size" className="mb-1 block text-[12px] text-[#606266]">
                      块大小（tokens）
                    </label>
                    <input
                      id="kb-size"
                      inputMode="numeric"
                      value={size}
                      onChange={(e) => {
                        setSize(e.target.value)
                        setParamErrors({})
                      }}
                      className={`h-9 w-full rounded-[6px] border bg-white px-2.5 text-[13px] text-[#1f2329] outline-none focus:ring-2 ${
                        paramErrors.size
                          ? 'border-[#f5222d] focus:border-[#f5222d] focus:ring-[#f5222d]/10'
                          : 'border-[#dcdfe6] focus:border-[#166EFF] focus:ring-[#166EFF]/10'
                      }`}
                    />
                    {paramErrors.size && (
                      <p className="mt-1 text-[11.5px] text-[#f5222d]">{paramErrors.size}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="kb-overlap" className="mb-1 block text-[12px] text-[#606266]">
                      重叠（tokens）
                    </label>
                    <input
                      id="kb-overlap"
                      inputMode="numeric"
                      value={overlap}
                      onChange={(e) => {
                        setOverlap(e.target.value)
                        setParamErrors({})
                      }}
                      className={`h-9 w-full rounded-[6px] border bg-white px-2.5 text-[13px] text-[#1f2329] outline-none focus:ring-2 ${
                        paramErrors.overlap
                          ? 'border-[#f5222d] focus:border-[#f5222d] focus:ring-[#f5222d]/10'
                          : 'border-[#dcdfe6] focus:border-[#166EFF] focus:ring-[#166EFF]/10'
                      }`}
                    />
                    {paramErrors.overlap && (
                      <p className="mt-1 text-[11.5px] text-[#f5222d]">{paramErrors.overlap}</p>
                    )}
                  </div>
                </div>
                <p className="mt-2.5 text-[11.5px] leading-[17px] text-[#8c8c8c]">
                  更改仅作用于本库，上传文档时仍可临时覆盖；入库后调整需重新解析。
                </p>
              </div>
            )}
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={enterAfterCreate}
              onChange={(e) => setEnterAfterCreate(e.target.checked)}
              className="mt-[2px] h-[14px] w-[14px] cursor-pointer accent-[#166EFF]"
            />
            <span>
              <span className="block text-[12.5px] text-[#1f2329]">创建后进入知识库</span>
              <span className="block text-[11.5px] text-[#8c8c8c]">可立即上传第一批文档</span>
            </span>
          </label>
        </form>

        {/* 底部操作 */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#f0f0f0] px-6 py-3.5">
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            className="h-9 cursor-pointer rounded-[6px] border border-[#dcdfe6] bg-white px-4 text-[13px] text-[#606266] hover:border-[#c0c4cc] hover:text-[#1f2329] disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-[6px] bg-[#166EFF] px-4 text-[13px] font-medium text-white hover:bg-[#0f5bd6] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy && <Loader2 className="h-[14px] w-[14px] animate-spin" />}
            {busy ? '创建中…' : '创建'}
          </button>
        </div>
      </div>

      {/* 放弃创建确认 */}
      {confirmClose && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmClose(false)
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="discard-kb-title"
            className="w-[360px] rounded-[10px] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
          >
            <h3 id="discard-kb-title" className="text-[15px] font-semibold text-[#1f2329]">
              放弃创建？
            </h3>
            <p className="mt-1.5 text-[13px] leading-[20px] text-[#606266]">
              已填写的内容不会保留。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmClose(false)}
                className="h-9 cursor-pointer rounded-[6px] border border-[#dcdfe6] bg-white px-4 text-[13px] text-[#606266] hover:text-[#1f2329]"
              >
                继续编辑
              </button>
              <button
                onClick={onClose}
                className="h-9 cursor-pointer rounded-[6px] bg-[#f5222d] px-4 text-[13px] font-medium text-white hover:bg-[#d91a23]"
              >
                放弃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
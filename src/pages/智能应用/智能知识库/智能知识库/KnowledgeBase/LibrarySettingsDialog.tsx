/**
 * 库设置 · 分块与解析富化
 *
 * 分块与富化都归库创建人维护，平台只提供内置推荐预设。
 * 修改只影响后续上传与重新解析，不回溯改写已生成的索引。
 */
import { useEffect, useState } from 'react'
import { Check, Info, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react'
import { SettingsModal } from '../SettingsUI'
import {
  CHUNK_STRATEGIES,
  DEFAULT_KB_CHUNK,
  SIZE_MAX,
  SIZE_MIN,
  clearKbChunk,
  getStrategy,
  loadKbChunk,
  saveKbChunk,
  type KbChunk,
} from './policy'
import {
  DEFAULT_ENRICHMENT,
  PROMPT_MAX,
  QUESTION_MAX,
  QUESTION_MIN,
  clearKbEnrichment,
  loadKbEnrichment,
  normalizeEnrichment,
  saveKbEnrichment,
  type EnrichmentConfig,
} from './enrichment'

type ParamErrors = { size?: string; overlap?: string }

export function LibrarySettingsDialog({
  kbId,
  kbName,
  initialChunk,
  onClose,
  onSaved,
}: {
  kbId: string
  kbName: string
  initialChunk?: KbChunk
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const baseChunk = initialChunk ?? DEFAULT_KB_CHUNK
  const [chunk, setChunk] = useState<KbChunk>(() => loadKbChunk(kbId) ?? baseChunk)
  const [chunkOverride, setChunkOverride] = useState(() => Boolean(loadKbChunk(kbId)))
  const [sizeText, setSizeText] = useState(() => String((loadKbChunk(kbId) ?? baseChunk).size))
  const [overlapText, setOverlapText] = useState(() =>
    String((loadKbChunk(kbId) ?? baseChunk).overlap),
  )
  const [chunkErrors, setChunkErrors] = useState<ParamErrors>({})

  const [override, setOverride] = useState<EnrichmentConfig | null>(() => loadKbEnrichment(kbId))
  const [draft, setDraft] = useState<EnrichmentConfig>(
    () => loadKbEnrichment(kbId) ?? DEFAULT_ENRICHMENT,
  )
  const [countText, setCountText] = useState(String((loadKbEnrichment(kbId) ?? DEFAULT_ENRICHMENT).questionCount))
  const [error, setError] = useState('')

  useEffect(() => {
    const existing = loadKbEnrichment(kbId)
    setOverride(existing)
    const initial = existing ?? DEFAULT_ENRICHMENT
    setDraft(initial)
    setCountText(String(initial.questionCount))
    setError('')

    const savedChunk = loadKbChunk(kbId)
    const initialChunkValue = savedChunk ?? initialChunk ?? DEFAULT_KB_CHUNK
    setChunk(initialChunkValue)
    setChunkOverride(Boolean(savedChunk))
    setSizeText(String(initialChunkValue.size))
    setOverlapText(String(initialChunkValue.overlap))
    setChunkErrors({})
  }, [kbId, initialChunk])

  const updateEnrichment = (patch: Partial<EnrichmentConfig>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const pickStrategy = (key: KbChunk['strategy']) => {
    const meta = getStrategy(key)
    setChunk({ strategy: key, size: meta.size, overlap: meta.overlap })
    setSizeText(String(meta.size))
    setOverlapText(String(meta.overlap))
    setChunkOverride(true)
    setChunkErrors({})
  }

  const validateChunk = (): ParamErrors => {
    const next: ParamErrors = {}
    const size = Number(sizeText)
    const overlap = Number(overlapText)
    if (!sizeText.trim() || !Number.isInteger(size) || size < SIZE_MIN || size > SIZE_MAX) {
      next.size = `请输入 ${SIZE_MIN}–${SIZE_MAX} 之间的整数`
    }
    if (!overlapText.trim() || !Number.isInteger(overlap) || overlap < 0) {
      next.overlap = '请输入不小于 0 的整数'
    } else if (!next.size && overlap > Math.floor(size / 2)) {
      next.overlap = '重叠不能超过块大小的一半'
    }
    return next
  }

  const save = () => {
    const chunkErrorsNext = validateChunk()
    const count = Number(countText)
    const enrichmentInvalid =
      draft.questionGeneration &&
      (!countText.trim() ||
        !Number.isInteger(count) ||
        count < QUESTION_MIN ||
        count > QUESTION_MAX)

    if (chunkErrorsNext.size || chunkErrorsNext.overlap) {
      setChunkErrors(chunkErrorsNext)
      return
    }
    if (enrichmentInvalid) {
      setError(`请输入 ${QUESTION_MIN}–${QUESTION_MAX} 之间的整数`)
      return
    }

    const nextChunk: KbChunk = {
      strategy: chunk.strategy,
      size: Number(sizeText),
      overlap: Number(overlapText),
    }
    const isDefaultChunk =
      nextChunk.strategy === DEFAULT_KB_CHUNK.strategy &&
      nextChunk.size === DEFAULT_KB_CHUNK.size &&
      nextChunk.overlap === DEFAULT_KB_CHUNK.overlap
    if (isDefaultChunk) {
      clearKbChunk(kbId)
    } else {
      saveKbChunk(kbId, nextChunk)
    }

    const nextEnrichment = normalizeEnrichment({ ...draft, questionCount: count })
    const isDefaultEnrichment =
      nextEnrichment.questionGeneration === DEFAULT_ENRICHMENT.questionGeneration &&
      nextEnrichment.questionCount === DEFAULT_ENRICHMENT.questionCount &&
      nextEnrichment.questionPrompt.trim() === DEFAULT_ENRICHMENT.questionPrompt
    if (isDefaultEnrichment) {
      clearKbEnrichment(kbId)
    } else {
      saveKbEnrichment(kbId, nextEnrichment)
    }

    onSaved(`已保存「${kbName}」的库设置，后续上传生效`)
    onClose()
  }

  const resetChunk = () => {
    setChunk(DEFAULT_KB_CHUNK)
    setSizeText(String(DEFAULT_KB_CHUNK.size))
    setOverlapText(String(DEFAULT_KB_CHUNK.overlap))
    setChunkOverride(false)
    setChunkErrors({})
  }

  const resetEnrichment = () => {
    setDraft(DEFAULT_ENRICHMENT)
    setCountText(String(DEFAULT_ENRICHMENT.questionCount))
    setOverride(null)
    setError('')
  }

  const chunkCustomized =
    chunkOverride ||
    chunk.strategy !== DEFAULT_KB_CHUNK.strategy ||
    Number(sizeText) !== DEFAULT_KB_CHUNK.size ||
    Number(overlapText) !== DEFAULT_KB_CHUNK.overlap
  const enrichmentCustomized = Boolean(override)

  return (
    <SettingsModal
      title="库设置"
      width="w-[640px]"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] cursor-pointer rounded-[4px] border border-[#E5E6EB] px-[14px] text-[13px] text-[#4E5969] hover:border-[#166EFF] hover:text-[#166EFF]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={save}
            className="h-[32px] cursor-pointer rounded-[4px] bg-[#166EFF] px-[14px] text-[13px] text-white hover:bg-[#0E5FE0]"
          >
            保存
          </button>
        </>
      }
    >
      {/* 分块设置 */}
      <div className="flex items-center gap-[8px] border-b border-[#F2F3F5] pb-[12px]">
        <SlidersHorizontal className="h-[15px] w-[15px] text-[#166EFF]" />
        <span className="text-[13px] font-medium text-[#1D2129]">分块设置</span>
        <span
          className={`rounded-[3px] px-[6px] py-[1px] text-[11px] ${
            chunkCustomized ? 'bg-[#FFF7E8] text-[#8A4B00]' : 'bg-[#F2F3F5] text-[#4E5969]'
          }`}
        >
          {chunkCustomized ? '已自定义' : '使用推荐配置'}
        </span>
        {chunkCustomized && (
          <button
            type="button"
            onClick={resetChunk}
            className="ml-auto flex cursor-pointer items-center gap-[4px] text-[12px] text-[#166EFF] hover:underline"
          >
            <RotateCcw className="h-[12px] w-[12px]" />
            恢复推荐值
          </button>
        )}
      </div>

      <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
        {CHUNK_STRATEGIES.map((s) => {
          const selected = chunk.strategy === s.key
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => pickStrategy(s.key)}
              aria-pressed={selected}
              className={`relative cursor-pointer rounded-[5px] border px-[12px] py-[10px] text-left transition ${
                selected
                  ? 'border-[#166EFF] bg-[#F7FAFF] ring-1 ring-[#166EFF]'
                  : 'border-[#E5E6EB] bg-white hover:border-[#9DBCF7]'
              }`}
            >
              <div className="flex items-center gap-[6px]">
                <span
                  className={`text-[12.5px] font-medium ${
                    selected ? 'text-[#166EFF]' : 'text-[#1D2129]'
                  }`}
                >
                  {s.label}
                </span>
                {s.recommended && (
                  <span className="rounded bg-[#EEF4FF] px-[5px] py-[1px] text-[10.5px] text-[#166EFF]">
                    推荐
                  </span>
                )}
                {selected && <Check className="ml-auto h-[13px] w-[13px] text-[#166EFF]" />}
              </div>
              <p className="mt-[4px] line-clamp-2 min-h-[32px] text-[11.5px] leading-[16px] text-[#86909C]">
                {s.desc}
              </p>
              <p className="mt-[2px] text-[11px] text-[#B0B3B8]">
                {s.size} / {s.overlap} tokens
              </p>
            </button>
          )
        })}
      </div>

      <div className="mt-[14px] grid grid-cols-2 gap-[12px]">
        <div>
          <label htmlFor="kb-chunk-size" className="mb-[6px] block text-[12px] text-[#4E5969]">
            块大小（tokens）
          </label>
          <input
            id="kb-chunk-size"
            inputMode="numeric"
            value={sizeText}
            onChange={(e) => {
              setSizeText(e.target.value)
              setChunk((prev) => ({ ...prev, size: Number(e.target.value) }))
              setChunkOverride(true)
              setChunkErrors({})
            }}
            className={`h-[34px] w-full rounded-[4px] border bg-white px-[10px] text-[13px] text-[#1D2129] outline-none focus:ring-[2px] ${
              chunkErrors.size
                ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/15'
                : 'border-[#E5E6EB] focus:border-[#166EFF] focus:ring-[#166EFF]/15'
            }`}
          />
          {chunkErrors.size && (
            <p className="mt-[4px] text-[11.5px] text-[#F53F3F]">{chunkErrors.size}</p>
          )}
        </div>
        <div>
          <label htmlFor="kb-chunk-overlap" className="mb-[6px] block text-[12px] text-[#4E5969]">
            重叠（tokens）
          </label>
          <input
            id="kb-chunk-overlap"
            inputMode="numeric"
            value={overlapText}
            onChange={(e) => {
              setOverlapText(e.target.value)
              setChunk((prev) => ({ ...prev, overlap: Number(e.target.value) }))
              setChunkOverride(true)
              setChunkErrors({})
            }}
            className={`h-[34px] w-full rounded-[4px] border bg-white px-[10px] text-[13px] text-[#1D2129] outline-none focus:ring-[2px] ${
              chunkErrors.overlap
                ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/15'
                : 'border-[#E5E6EB] focus:border-[#166EFF] focus:ring-[#166EFF]/15'
            }`}
          />
          {chunkErrors.overlap && (
            <p className="mt-[4px] text-[11.5px] text-[#F53F3F]">{chunkErrors.overlap}</p>
          )}
        </div>
      </div>
      <p className="mt-[8px] flex items-start gap-[4px] text-[11.5px] leading-[17px] text-[#86909C]">
        <Info className="mt-[2px] h-[12px] w-[12px] shrink-0" />
        保存后只影响后续上传与重新解析；已入库文档需重新解析才会按新参数切分。
      </p>

      <div className="my-[18px] h-px bg-[#F2F3F5]" />

      {/* 解析与富化 */}
      <div className="flex items-center gap-[8px]">
        <Sparkles className="h-[15px] w-[15px] text-[#166EFF]" />
        <span className="text-[13px] font-medium text-[#1D2129]">解析与富化</span>
        <span
          className={`rounded-[3px] px-[6px] py-[1px] text-[11px] ${
            enrichmentCustomized ? 'bg-[#FFF7E8] text-[#8A4B00]' : 'bg-[#F2F3F5] text-[#4E5969]'
          }`}
        >
          {enrichmentCustomized ? '已自定义' : '使用推荐配置'}
        </span>
        {enrichmentCustomized && (
          <button
            type="button"
            onClick={resetEnrichment}
            className="ml-auto flex cursor-pointer items-center gap-[4px] text-[12px] text-[#166EFF] hover:underline"
          >
            <RotateCcw className="h-[12px] w-[12px]" />
            恢复推荐值
          </button>
        )}
      </div>

      <div className="mt-[12px] flex items-start gap-[12px] rounded-[5px] border border-[#E5E6EB] bg-[#FAFBFC] px-[14px] py-[12px]">
        <Sparkles className="mt-[1px] h-[16px] w-[16px] shrink-0 text-[#166EFF]" />
        <div>
          <p className="text-[13px] font-medium text-[#1D2129]">AI 问题生成</p>
          <p className="mt-[3px] text-[12px] leading-[18px] text-[#4E5969]">
            解析切分后按分块调用对话模型生成问题并写入索引，提升口语化提问的召回效果。
          </p>
          <p className="mt-[4px] text-[12px] leading-[18px] text-[#FF7D00]">
            每个分块一次模型调用，长文档开启后解析耗时与模型用量会明显上升。
          </p>
        </div>
      </div>

      <div className="mt-[14px] flex items-center gap-[10px]">
        <button
          type="button"
          role="switch"
          aria-checked={draft.questionGeneration}
          onClick={() => updateEnrichment({ questionGeneration: !draft.questionGeneration })}
          className="flex cursor-pointer items-center gap-[10px]"
        >
          <span
            className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition ${
              draft.questionGeneration ? 'bg-[#166EFF]' : 'bg-[#C9CDD4]'
            }`}
          >
            <span
              className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-all ${
                draft.questionGeneration ? 'left-[16px]' : 'left-[2px]'
              }`}
            />
          </span>
          <span className="text-[13px] text-[#1D2129]">
            {draft.questionGeneration ? '已开启' : '已关闭'}
          </span>
        </button>
      </div>

      <div className="mt-[14px]">
        <label htmlFor="kb-enrichment-count" className="mb-[6px] block text-[12px] text-[#4E5969]">
          每个分块生成问题数量
        </label>
        <input
          id="kb-enrichment-count"
          inputMode="numeric"
          value={countText}
          disabled={!draft.questionGeneration}
          onChange={(e) => {
            setCountText(e.target.value)
            setError('')
          }}
          className={`h-[34px] w-[160px] rounded-[4px] border bg-white px-[10px] text-[13px] text-[#1D2129] outline-none focus:ring-[2px] disabled:cursor-not-allowed disabled:bg-[#F7F8FA] disabled:text-[#86909C] ${
            error
              ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/15'
              : 'border-[#E5E6EB] focus:border-[#166EFF] focus:ring-[#166EFF]/15'
          }`}
        />
        {error ? (
          <p className="mt-[4px] text-[11.5px] text-[#F53F3F]">{error}</p>
        ) : (
          <p className="mt-[4px] text-[11.5px] text-[#86909C]">
            可填 {QUESTION_MIN}–{QUESTION_MAX}，推荐 {DEFAULT_ENRICHMENT.questionCount} 个。
          </p>
        )}
      </div>

      <div className="mt-[14px]">
        <div className="mb-[6px] flex items-center justify-between">
          <label htmlFor="kb-enrichment-prompt" className="text-[12px] text-[#4E5969]">
            问题生成要求
          </label>
          <span className="text-[11.5px] text-[#86909C]">
            {draft.questionPrompt.length} / {PROMPT_MAX}
          </span>
        </div>
        <textarea
          id="kb-enrichment-prompt"
          value={draft.questionPrompt}
          disabled={!draft.questionGeneration}
          maxLength={PROMPT_MAX}
          onChange={(e) => updateEnrichment({ questionPrompt: e.target.value })}
          placeholder="选填。例如：站在运维人员视角提问，问题中包含具体设备型号与告警名称，避免是非题。留空则沿用内置提示词。"
          className="h-[84px] w-full resize-y rounded-[4px] border border-[#E5E6EB] bg-white px-[10px] py-[8px] text-[13px] leading-[20px] text-[#1D2129] outline-none placeholder:text-[#C9CDD4] focus:border-[#166EFF] focus:ring-[2px] focus:ring-[#166EFF]/15 disabled:cursor-not-allowed disabled:bg-[#F7F8FA] disabled:text-[#86909C]"
        />
      </div>
    </SettingsModal>
  )
}
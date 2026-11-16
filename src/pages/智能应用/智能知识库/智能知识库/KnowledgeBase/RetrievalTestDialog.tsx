import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CornerDownLeft,
  Database,
  ExternalLink,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react'
import { SettingsModal } from '../SettingsUI'
import { useModelRegistry } from '../ModelManagement/store'
import {
  queryTerms,
  searchRetrieval,
  type RetrievalResponse,
} from './retrieval'
import type { KbIndexState } from './indexState'

const DEFAULT_QUERY = '容器云集群扩容失败怎么排查'
const TOP_K_OPTIONS = [1, 3, 5, 10, 20]

function Highlighted({ text, terms }: { text: string; terms: string[] }) {
  const usable = Array.from(new Set(terms.filter((term) => term.length >= 2))).slice(0, 80)
  if (usable.length === 0) return <>{text}</>
  const pattern = usable
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const parts = text.split(new RegExp(`(${pattern})`, 'gi'))
  const lowered = new Set(usable.map((term) => term.toLowerCase()))
  return (
    <>
      {parts.map((part, index) =>
        lowered.has(part.toLowerCase()) ? (
          <mark
            key={`${part}-${index}`}
            className="rounded-[2px] bg-[#FFF1CC] px-[1px] text-[#7A4A00]"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  )
}

function scoreTone(score: number) {
  if (score >= 0.6) return 'border-[#D9F0D0] bg-[#F2FAED] text-[#3F7A1F]'
  if (score >= 0.4) return 'border-[#D9ECFF] bg-[#ECF5FF] text-[#166EFF]'
  return 'border-[#E5E6EB] bg-[#F7F8FA] text-[#4E5969]'
}

export function RetrievalTestDialog({
  kbName,
  indexState,
  onClose,
  onOpenDoc,
}: {
  kbName: string
  indexState?: KbIndexState
  onClose: () => void
  onOpenDoc: (docName: string) => void
}) {
  const { models, defaults } = useModelRegistry()
  const rerankModel = models.find(
    (model) => model.id === defaults.rerank && model.capability === 'rerank',
  )
  const [query, setQuery] = useState(DEFAULT_QUERY)
  const [topK, setTopK] = useState(5)
  const [threshold, setThreshold] = useState('0.3')
  const [rerank, setRerank] = useState(Boolean(rerankModel))
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<RetrievalResponse>(() =>
    searchRetrieval({ query: DEFAULT_QUERY, topK: 5, threshold: 0.3, rerank: Boolean(rerankModel) }),
  )
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const run = () => {
    if (!query.trim()) return
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    setLoading(true)
    const nextThreshold = Math.min(1, Math.max(0, Number(threshold) || 0))
    timerRef.current = window.setTimeout(() => {
      setResponse(searchRetrieval({ query, topK, threshold: nextThreshold, rerank }))
      setLoading(false)
      timerRef.current = null
    }, 320)
  }

  const terms = queryTerms(query)
  const activeThreshold = Math.min(1, Math.max(0, Number(threshold) || 0))

  return (
    <SettingsModal title="召回测试" width="w-[900px]" onClose={onClose} footer={
      <button
        type="button"
        onClick={onClose}
        className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969] hover:border-[#166EFF] hover:text-[#166EFF]"
      >
        关闭
      </button>
    }>
      <div className="flex items-center gap-[10px] rounded-[4px] border border-[#E5E6EB] bg-[#FAFBFC] px-[12px] py-[9px] text-[12px] text-[#4E5969]">
        <Database className="h-[14px] w-[14px] shrink-0 text-[#86909C]" />
        <span className="min-w-0 truncate">
          <span className="font-medium text-[#1D2129]">{kbName}</span>
          <span className="mx-[6px] text-[#C9CDD4]">·</span>
          索引模型 {indexState?.modelName ?? 'BGE-M3'}
          <span className="mx-[6px] text-[#C9CDD4]">·</span>
          {indexState?.docs ?? 0} 篇文档
        </span>
        <span className="ml-auto shrink-0 text-[#86909C]">
          先用查询验证召回质量，再调整 TopK 与阈值
        </span>
      </div>

      {indexState?.status !== 'ready' && indexState && (
        <div className="mt-[10px] flex items-start gap-[7px] rounded-[4px] border border-[#FFE4BA] bg-[#FFF7E8] px-[12px] py-[8px] text-[12px] leading-[18px] text-[#8A4B00]">
          <AlertTriangle className="mt-[2px] h-[13px] w-[13px] shrink-0 text-[#FF7D00]" />
          <span>
            {indexState.status === 'rebuilding'
              ? `索引正在重建（${indexState.progress ?? 0}%），当前召回结果可能来自旧索引。`
              : '当前索引尚未使用新的向量模型，结果可能不代表重建后的召回效果。'}
          </span>
        </div>
      )}

      <div className="mt-[14px]">
        <div className="mb-[6px] flex items-center justify-between">
          <label htmlFor="retrieval-query" className="text-[13px] text-[#4E5969]">
            查询内容
          </label>
          <span className="text-[11px] text-[#A9AEB8]">Ctrl / ⌘ + Enter 执行</span>
        </div>
        <div className="relative">
          <textarea
            id="retrieval-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                run()
              }
            }}
            rows={3}
            placeholder="输入一个用户可能提出的问题，例如：集群扩容失败怎么排查？"
            className="w-full resize-none rounded-[4px] border border-[#D9DEE7] bg-white px-[11px] py-[9px] pr-[42px] text-[13px] leading-[21px] text-[#1D2129] outline-none transition-colors placeholder:text-[#A9AEB8] focus:border-[#166EFF]"
          />
          <button
            type="button"
            onClick={run}
            disabled={loading || !query.trim()}
            aria-label="执行召回测试"
            className="absolute bottom-[9px] right-[9px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[3px] bg-[#166EFF] text-white transition-colors hover:bg-[#0E5FE0] disabled:cursor-not-allowed disabled:bg-[#B7CCF5]"
          >
            {loading ? (
              <Loader2 className="h-[14px] w-[14px] animate-spin" />
            ) : (
              <Search className="h-[14px] w-[14px]" />
            )}
          </button>
        </div>
        <div className="mt-[6px] flex flex-wrap items-center gap-[6px]">
          <span className="text-[11px] text-[#A9AEB8]">试试：</span>
          {['集群扩容失败怎么排查', '项目配额不足怎么办', '发布失败如何回滚'].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuery(example)}
              className="cursor-pointer rounded-[3px] bg-[#F2F3F5] px-[7px] py-[2px] text-[11px] text-[#4E5969] hover:bg-[#E8F3FF] hover:text-[#166EFF]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-[14px] flex flex-wrap items-end gap-x-[16px] gap-y-[10px] rounded-[4px] border border-[#E5E6EB] px-[12px] py-[10px]">
        <div>
          <label htmlFor="retrieval-topk" className="mb-[4px] block text-[11px] text-[#86909C]">
            TopK
          </label>
          <select
            id="retrieval-topk"
            value={topK}
            onChange={(event) => setTopK(Number(event.target.value))}
            className="h-[30px] w-[78px] cursor-pointer rounded-[3px] border border-[#D9DEE7] bg-white px-[7px] text-[12px] text-[#1D2129] outline-none focus:border-[#166EFF]"
          >
            {TOP_K_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="retrieval-threshold"
            className="mb-[4px] block text-[11px] text-[#86909C]"
          >
            相似度阈值
          </label>
          <input
            id="retrieval-threshold"
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
            onBlur={() => setThreshold(activeThreshold.toFixed(2))}
            className="h-[30px] w-[82px] rounded-[3px] border border-[#D9DEE7] bg-white px-[7px] text-[12px] text-[#1D2129] outline-none focus:border-[#166EFF]"
          />
        </div>
        <div>
          <span className="mb-[4px] block text-[11px] text-[#86909C]">重排</span>
          <div className="flex h-[30px] items-center gap-[7px]">
            <button
              type="button"
              role="switch"
              aria-checked={rerank}
              disabled={!rerankModel}
              onClick={() => setRerank((prev) => !prev)}
              className={`relative h-[18px] w-[32px] cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                rerank ? 'bg-[#166EFF]' : 'bg-[#C9CDD4]'
              }`}
            >
              <span
                className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-all ${
                  rerank ? 'left-[16px]' : 'left-[2px]'
                }`}
              />
            </button>
            <span className="text-[11px] text-[#86909C]">
              {rerankModel ? rerankModel.name : '未配置重排模型'}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-[8px]">
          <button
            type="button"
            onClick={run}
            disabled={loading || !query.trim()}
            className="flex h-[30px] cursor-pointer items-center gap-[5px] rounded-[3px] bg-[#166EFF] px-[13px] text-[13px] text-white hover:bg-[#0E5FE0] disabled:cursor-not-allowed disabled:bg-[#B7CCF5]"
          >
            {loading ? (
              <Loader2 className="h-[13px] w-[13px] animate-spin" />
            ) : (
              <Sparkles className="h-[13px] w-[13px]" />
            )}
            执行测试
          </button>
        </div>
      </div>

      <div className="mt-[16px] flex items-center justify-between gap-[12px]">
        <div className="flex items-center gap-[7px]">
          <h4 className="text-[13px] font-medium text-[#1D2129]">召回结果</h4>
          <span className="rounded-[9px] bg-[#F2F3F5] px-[7px] py-[1px] text-[11px] text-[#4E5969]">
            {loading ? '检索中' : `${response.results.length} 条`}
          </span>
        </div>
        {!loading && (
          <p className="text-[11.5px] text-[#86909C]">
            命中 {response.results.length} 个分块 · 候选 {response.candidates} · 耗时{' '}
            {response.elapsed}ms · {rerank ? '已重排' : '未重排'}
          </p>
        )}
      </div>

      <div className={`mt-[8px] space-y-[8px] ${loading ? 'opacity-55' : ''}`}>
        {!loading && response.results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[4px] border border-dashed border-[#E5E6EB] px-6 py-10 text-center">
            <Search className="mb-[8px] h-[24px] w-[24px] text-[#C9CDD4]" />
            <p className="text-[13px] font-medium text-[#1D2129]">没有命中达到阈值的内容</p>
            <p className="mt-[4px] text-[12px] text-[#86909C]">
              可以降低相似度阈值、换一种问法，或先确认相关文档已完成解析。
            </p>
          </div>
        ) : (
          response.results.map((item, index) => (
            <article
              key={item.id}
              className="rounded-[4px] border border-[#E5E6EB] px-[13px] py-[11px] transition-colors hover:border-[#B7CCF5]"
            >
              <div className="flex items-center gap-[8px]">
                <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-[3px] bg-[#F2F3F5] px-[5px] text-[11px] font-medium text-[#4E5969]">
                  {index + 1}
                </span>
                <span className="min-w-0 truncate text-[12px] text-[#86909C]">
                  {item.docName}
                  <span className="mx-[5px] text-[#C9CDD4]">/</span>
                  <span className="text-[#4E5969]">{item.heading}</span>
                </span>
                <span
                  className={`ml-auto shrink-0 rounded-[3px] border px-[6px] py-[1px] text-[11px] font-medium ${scoreTone(item.score)}`}
                >
                  {item.score.toFixed(2)}
                </span>
              </div>
              <p className="mt-[7px] line-clamp-3 text-[13px] leading-[21px] text-[#1D2129]">
                <Highlighted text={item.body} terms={terms} />
              </p>
              <div className="mt-[8px] flex flex-wrap items-center gap-x-[12px] gap-y-[4px] text-[11px] text-[#A9AEB8]">
                <span>{item.strategy}</span>
                <span>{item.tokens} tokens</span>
                <span className="flex items-center gap-[3px]">
                  <Sparkles className="h-[10px] w-[10px]" />
                  AI 问题 {item.questions}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenDoc(item.docName)
                    onClose()
                  }}
                  className="ml-auto flex cursor-pointer items-center gap-[3px] text-[11px] text-[#166EFF] hover:underline"
                >
                  查看原文
                  <ExternalLink className="h-[10px] w-[10px]" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-[12px] flex items-center gap-[5px] text-[11px] text-[#A9AEB8]">
        <CornerDownLeft className="h-[11px] w-[11px]" />
        测试结果仅用于调参，不会写入知识库或改变线上问答配置。
      </div>
    </SettingsModal>
  )
}
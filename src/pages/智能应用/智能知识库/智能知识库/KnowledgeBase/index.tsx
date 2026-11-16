/**
 * 知识库 - 库列表（卡片墙）
 *
 * 版式对齐「在线服务」列表页：顶部工具栏（创建 + 搜索）+ 白色卡片网格 + 分页条。
 * 卡片只留库名、两行描述与 文档 / 创建人 / 创建时间，不放状态、Embedding 与更新时间；
 * 底部保留 进入知识库 / 删除 操作，整张卡片也可点击进入。
 *
 * 点卡片进入当前库的文档工作台：库内固定当前库，不切库，也不提供概览 / 分块 /
 * 检索测试 / 设置；顶部用「返回 + 知识库详情」承接，不做面包屑。
 */
import { useMemo, useState } from 'react'
import { AlertTriangle, Library, Loader2, Plus, RefreshCw, Search, Settings2, X } from 'lucide-react'
import { CreateKbDialog, type CreateKbPayload } from './CreateDialog'
import type { KbRecord } from './model'
import { CAPABILITY_LABEL, missingCapabilities, useModelRegistry } from '../ModelManagement/store'
import { SettingsModal } from '../SettingsUI'
import {
  startRebuild,
  useKbIndexStates,
  type KbIndexState,
} from './indexState'

const PAGE_SIZES = ['12', '24', '48']

function KbCard({
  kb,
  indexState,
  onOpen,
  onRebuild,
}: {
  kb: KbRecord
  indexState?: KbIndexState
  onOpen: (name: string) => void
  onRebuild: (name: string) => void
}) {
  const stat = (label: string, value: string) => (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="truncate text-[12px] text-[#8c8c8c]">{label}</span>
      <span className="truncate text-[15px] font-medium text-[#1f2329]" title={value}>
        {value}
      </span>
    </div>
  )

  return (
    <div
      onClick={() => onOpen(kb.name)}
      className="flex h-full cursor-pointer flex-col rounded-[8px] border border-[#e6e8eb] bg-white px-5 pt-4 pb-4 transition-shadow hover:border-[#c9d8ff] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
    >
      {/* 库名 + 右上角创建时间 */}
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="truncate text-[17px] font-semibold text-[#1f2329] hover:text-[#166EFF]">
          {kb.name}
        </h3>
        <span className="shrink-0 text-[12px] text-[#8c8c8c]" title={`创建时间 ${kb.createdAt}`}>
          {kb.createdAt}
        </span>
      </div>

      <div className="mt-[6px] h-[18px]">
        {indexState && indexState.status !== 'ready' && (
          <>
          {indexState.status === 'stale' && (
            <span className="inline-flex items-center gap-[4px] rounded-[3px] bg-[#FFF7E8] px-[6px] py-[1px] text-[11px] text-[#8A4B00]">
              <AlertTriangle className="h-[10px] w-[10px] text-[#FF7D00]" />
              索引待重建
            </span>
          )}
          {indexState.status === 'rebuilding' && (
            <span className="inline-flex items-center gap-[4px] rounded-[3px] bg-[#E8F3FF] px-[6px] py-[1px] text-[11px] text-[#166EFF]">
              <Loader2 className="h-[10px] w-[10px] animate-spin" />
              重建中 {indexState.progress ?? 0}%
            </span>
          )}
          </>
        )}
      </div>

      {/* 描述 */}
      <p
        className="mt-2 line-clamp-2 min-h-[40px] text-[13px] leading-[20px] text-[#8c8c8c]"
        title={kb.desc}
      >
        {kb.desc}
      </p>

      {/* 文档数 / 创建人 */}
      <div className="mt-4 mb-5 grid grid-cols-2 gap-2">
        {stat('文档', `${kb.docs} 篇`)}
        {stat('创建人', kb.creator)}
      </div>

      {/* 底部：快捷操作 */}
      <div className="mt-auto flex items-center justify-end border-t border-[#f0f0f0] pt-3">
        <div className="flex shrink-0 items-center gap-3 text-[13px]">
          {indexState?.status === 'stale' && (
            <a
              onClick={(e) => {
                e.stopPropagation()
                onRebuild(kb.name)
              }}
              className="flex cursor-pointer items-center gap-[3px] text-[#FF7D00] hover:underline"
            >
              <RefreshCw className="h-[11px] w-[11px]" />
              重建
            </a>
          )}
          <a
            onClick={(e) => {
              e.stopPropagation()
              onOpen(kb.name)
            }}
            className="cursor-pointer text-[#166EFF]"
          >
            进入知识库
          </a>
          <a className="cursor-pointer text-[#F5222D]">删除</a>
        </div>
      </div>
    </div>
  )
}

export function KnowledgeBaseListPage({
  kbs,
  onOpen,
  onCreate,
  onRequestDefaultSetup,
  onNotify,
}: {
  kbs: KbRecord[]
  onOpen: (name: string) => void
  onCreate: (payload: CreateKbPayload, enterAfterCreate: boolean) => void
  onRequestDefaultSetup?: () => void
  onNotify?: (message: string) => void
}) {
  const { models, defaults } = useModelRegistry()
  const indexStates = useKbIndexStates()
  const missing = missingCapabilities(defaults)
  const [keyword, setKeyword] = useState('')
  const [pageSize, setPageSize] = useState(12)
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [rebuildTargets, setRebuildTargets] = useState<string[] | null>(null)

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return kbs
    return kbs.filter(
      (kb) => kb.name.toLowerCase().includes(kw) || kb.desc.toLowerCase().includes(kw),
    )
  }, [kbs, keyword])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const staleKbs = kbs.filter((kb) => indexStates[kb.name]?.status === 'stale')
  const rebuildingKbs = kbs.filter((kb) => indexStates[kb.name]?.status === 'rebuilding')
  const staleModelNames = Array.from(
    new Set(staleKbs.map((kb) => indexStates[kb.name]?.modelName).filter(Boolean)),
  )
  const rebuildItems = rebuildTargets
    ? rebuildTargets
        .map((name) => ({ name, state: indexStates[name] }))
        .filter((item): item is { name: string; state: KbIndexState } => Boolean(item.state))
    : []
  const rebuildDocs = rebuildItems.reduce((sum, item) => sum + item.state.docs, 0)
  const defaultEmbedding = models.find(
    (model) => model.id === defaults.embedding && model.capability === 'embedding',
  )

  const confirmRebuild = () => {
    if (!rebuildTargets || rebuildTargets.length === 0) return
    const started = startRebuild(rebuildTargets, defaultEmbedding
      ? { id: defaultEmbedding.id, name: defaultEmbedding.name }
      : undefined)
    setRebuildTargets(null)
    onNotify?.(started > 0 ? `已开始重建 ${started} 个知识库的索引` : '所选知识库已在重建中')
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-[#F5F7FA]">
      <div className="flex flex-1 min-h-0 flex-col bg-white">
        {/* 页面标题与说明 */}
        <div className="shrink-0 pl-[18px] pr-[24px] pt-4 pb-3">
          <h1 className="text-[20px] font-bold leading-[30px] text-[#000]">知识库</h1>
          <p className="text-[13px] text-[#6c6c6c]">
            集中管理知识库与文档，分块、解析与检索偏好可在库设置中按需调整。
          </p>
        </div>

        {missing.length > 0 && (
          <div className="flex shrink-0 items-center gap-[8px] border-b border-[#FFE4BA] bg-[#FFF7E8] pl-[18px] pr-[24px] py-[8px]">
            <AlertTriangle className="h-[14px] w-[14px] shrink-0 text-[#FF7D00]" />
            <span className="text-[12.5px] leading-[18px] text-[#8A4B00]">
              必选默认模型尚未配置完成，暂时无法创建知识库，请联系平台管理员。
            </span>
          </div>
        )}

        {(staleKbs.length > 0 || rebuildingKbs.length > 0) && (
          <div className="flex shrink-0 items-start gap-[8px] border-b border-[#FFE4BA] bg-[#FFF7E8] pl-[18px] pr-[24px] py-[9px]">
            <RefreshCw className="mt-[2px] h-[14px] w-[14px] shrink-0 text-[#FF7D00]" />
            <div className="min-w-0 flex-1 text-[12.5px] leading-[18px] text-[#8A4B00]">
              {staleKbs.length > 0 ? (
                <p>
                  {staleKbs.length} 个知识库仍使用旧向量模型
                  {staleModelNames.length > 0 ? ` ${staleModelNames.join('、')}` : ''}
                  ，重建后才能按新模型检索。
                  {rebuildingKbs.length > 0 && `另有 ${rebuildingKbs.length} 个库正在重建。`}
                </p>
              ) : (
                <p>正在重建 {rebuildingKbs.length} 个知识库的索引，期间仍可继续检索。</p>
              )}
            </div>
            {staleKbs.length > 0 && (
              <button
                type="button"
                onClick={() => setRebuildTargets(staleKbs.map((kb) => kb.name))}
                className="shrink-0 cursor-pointer rounded-[3px] border border-[#FFD08A] bg-white px-[10px] py-[2px] text-[12px] text-[#8A4B00] hover:border-[#FF7D00]"
              >
                全部重建
              </button>
            )}
          </div>
        )}

        {/* 工具栏：左侧创建，右侧过滤 */}
        <div className="flex h-[70px] shrink-0 items-center gap-[18px] border-b border-[#f0f0f0] pl-[18px] pr-[24px]">
          <button
            onClick={() => {
              if (missing.length > 0) {
                setBlockOpen(true)
                return
              }
              setCreateOpen(true)
            }}
            className="flex h-[35px] shrink-0 cursor-pointer items-center gap-[6px] rounded bg-[#166EFF] pl-[18px] pr-[20px] text-[15px] text-white"
          >
            <Plus className="h-[16px] w-[16px]" strokeWidth={2} />
            创建知识库
          </button>

          <div className="relative ml-auto flex h-[35px] w-[260px] items-center rounded border border-[#dcdfe6] bg-white pl-[10px] focus-within:border-[#166EFF]">
            <Search className="h-[15px] w-[15px] shrink-0 text-[#a8abb2]" />
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(1)
              }}
              placeholder="搜索库名称 / 描述"
              className="h-full w-full bg-transparent px-2 text-[13.5px] text-[#1f2329] outline-none placeholder:text-[#a8abb2]"
            />
            {keyword && (
              <button
                onClick={() => {
                  setKeyword('')
                  setPage(1)
                }}
                className="mr-1 shrink-0 cursor-pointer p-1 text-[#a8abb2] hover:text-[#606266]"
                title="清空"
              >
                <X className="h-[13px] w-[13px]" />
              </button>
            )}
          </div>

        </div>

        {/* 卡片区域 */}
        <div className="flex-1 min-h-0 overflow-auto px-4 pt-4 pb-4">
          {rows.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {rows.map((kb) => (
                <KbCard
                  key={kb.name}
                  kb={kb}
                  indexState={indexStates[kb.name]}
                  onOpen={onOpen}
                  onRebuild={(name) => setRebuildTargets([name])}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-[#909399]">
              <Library className="mb-2 h-[28px] w-[28px]" />
              <span className="text-[13px]">没有匹配的知识库</span>
            </div>
          )}
        </div>

        {/* 分页 */}
        <div className="flex h-[78px] shrink-0 items-start justify-end border-t border-[#f6f6f6] pl-[18px] pr-[28px] pt-[12px]">
          <span className="mr-5 flex h-[36px] items-center text-[14.5px] text-[#656565]">共 {total} 条</span>
          <select
            value={String(pageSize)}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="h-[35px] w-[100px] cursor-pointer rounded border border-[#dcdfe6] bg-white px-2 text-[13.5px] text-[#606266] outline-none"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} 条/页
              </option>
            ))}
          </select>
          <div className="ml-[19px] flex items-center gap-[10px]">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded ${
                page <= 1 ? 'cursor-not-allowed bg-[#f5f5f5]' : 'bg-[#EEEEEE]'
              }`}
              aria-label="上一页"
            >
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M6.5 1.5 3 5l3.5 3.5" stroke="#595959" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="h-[35px] w-[36px] cursor-pointer rounded-[6px] bg-[#166EFF] text-[14.5px] text-white">
              {page}
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded ${
                page >= totalPages ? 'cursor-not-allowed bg-[#f5f5f5]' : 'bg-[#EEEEEE]'
              }`}
              aria-label="下一页"
            >
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M3.5 1.5 7 5 3.5 8.5" stroke="#595959" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {rebuildTargets && (
        <SettingsModal
          title="重建索引"
          width="520px"
          onClose={() => setRebuildTargets(null)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setRebuildTargets(null)}
                className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmRebuild}
                className="flex h-[32px] items-center gap-[5px] rounded-[3px] bg-[#166EFF] px-[14px] text-[13px] text-white hover:bg-[#0E5FE0]"
              >
                <RefreshCw className="h-[13px] w-[13px]" />
                开始重建
              </button>
            </>
          }
        >
          <p className="text-[13px] leading-[21px] text-[#4E5969]">
            将重新切分并向量化以下 {rebuildItems.length} 个知识库的 {rebuildDocs} 篇文档。
            重建期间仍可继续检索，但结果可能不是最新索引。
          </p>
          <div className="mt-[12px] max-h-[240px] overflow-y-auto rounded-[4px] border border-[#E5E6EB]">
            {rebuildItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-[12px] border-b border-[#F2F3F5] px-[12px] py-[9px] text-[13px] last:border-b-0"
              >
                <span className="min-w-0 truncate text-[#1D2129]">{item.name}</span>
                <span className="shrink-0 text-[12px] text-[#86909C]">
                  {item.state.docs} 篇 · 目标{' '}
                  {item.state.targetModelName ?? defaultEmbedding?.name ?? item.state.modelName}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-[10px] text-[12px] leading-[18px] text-[#86909C]">
            重建完成后，这些知识库将使用新的向量模型生成索引。
          </p>
        </SettingsModal>
      )}

      {blockOpen && (
        <SettingsModal
          title="无法创建知识库"
          width="500px"
          onClose={() => setBlockOpen(false)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setBlockOpen(false)}
                className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969]"
              >
                知道了
              </button>
              {onRequestDefaultSetup && (
                <button
                  type="button"
                  onClick={() => {
                    setBlockOpen(false)
                    onRequestDefaultSetup()
                  }}
                  className="flex h-[32px] items-center gap-[5px] rounded-[3px] bg-[#166EFF] px-[14px] text-[13px] text-white"
                >
                  <Settings2 className="h-[13px] w-[13px]" />
                  前往设置默认模型
                </button>
              )}
            </>
          }
        >
          <p className="text-[13px] leading-[21px] text-[#4E5969]">
            知识库需要对话模型与向量模型完成问答与索引，以下必选默认配置尚未完成：
          </p>
          <ul className="mt-[12px] space-y-[6px] rounded-[4px] bg-[#FFF7E8] px-[14px] py-[10px]">
            {missing.map((capability) => (
              <li key={capability} className="flex items-center gap-[7px] text-[13px] text-[#8A4B00]">
                <span className="h-[5px] w-[5px] rounded-full bg-[#FF7D00]" />
                {CAPABILITY_LABEL[capability]}
              </li>
            ))}
          </ul>
          <p className="mt-[12px] text-[12.5px] leading-[19px] text-[#86909C]">
            请联系平台管理员在「系统设置 → 模型管理」中完成配置，配置完成后即可正常创建知识库。
          </p>
        </SettingsModal>
      )}

      {/* 建库弹窗：基础信息 + 可选高级设置 */}
      {createOpen && (
        <CreateKbDialog
          existingNames={kbs.map((kb) => kb.name)}
          onClose={() => setCreateOpen(false)}
          onCreate={(payload, enterAfterCreate) => {
            setCreateOpen(false)
            setKeyword('')
            setPage(1)
            onCreate(payload, enterAfterCreate)
          }}
        />
      )}
    </div>
  )
}
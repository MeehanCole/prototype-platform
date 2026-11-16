import { useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Flower2,
  Link2,
  Minus,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react'
import {
  EnabledBadge,
  FieldLabel,
  PrimaryButton,
  SettingsModal,
  SettingsPageHeader,
  SettingsPagination,
  SettingsSearch,
  SettingsToolbar,
  inputClass,
} from '../SettingsUI'
import {
  CAPABILITIES,
  CAPABILITY_DESCRIPTION,
  CAPABILITY_LABEL,
  CAPABILITY_SHORT_LABEL,
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_MAX_OUTPUT_TOKENS,
  MODEL_PROVIDER,
  OPTIONAL_CAPABILITY_HINT,
  REQUIRED_CAPABILITIES,
  isDefaultModel,
  isRequiredCapability,
  missingCapabilities,
  modelsForCapability,
  removeModel,
  saveDefaults,
  saveModel,
  toggleModel,
  useModelRegistry,
  type DefaultModels,
  type ModelCapability,
  type ModelItem,
  type ModelProtocol,
} from './store'
import { getEmbeddingImpact, queueEmbeddingMigration } from '../KnowledgeBase/indexState'

const PROTOCOLS: ModelProtocol[] = [
  'OpenAI Chat Completions',
  'OpenAI Responses',
  'Anthropic Messages',
  'Google Generative AI',
]

const MODEL_ID_OPTIONS = [
  'GPT-4o',
  'GPT-4o mini',
  'Qwen3.8-Flash-Next',
  'Qwen2.5-VL-7B-Instruct',
  'DeepSeek-V3.1',
  'BGE-M3',
  'BGE-Reranker-v2-M3',
]

function formatTokenCount(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return String(value)
}

/** 模型管理：默认模型配置 + 模型卡片 + 添加/编辑/启停/删除 */
export function ModelManagementPage({
  defaultsOpenOnMount = false,
  onDefaultsModalOpened,
  onNotify,
}: {
  defaultsOpenOnMount?: boolean
  onDefaultsModalOpened?: () => void
  onNotify?: (message: string) => void
}) {
  const registry = useModelRegistry()
  const { models, defaults } = registry
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<ModelItem | null>(null)
  const [defaultsOpen, setDefaultsOpen] = useState(defaultsOpenOnMount)

  const missing = missingCapabilities(defaults)
  const configuredCount = REQUIRED_CAPABILITIES.length - missing.length

  const openDefaults = () => {
    setDefaultsOpen(true)
    onDefaultsModalOpened?.()
  }

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return models
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(keyword) ||
        model.baseUrl.toLowerCase().includes(keyword) ||
        CAPABILITY_LABEL[model.capability].includes(keyword) ||
        (Boolean(model.supportsVision) && '多模态'.includes(keyword)),
    )
  }, [models, query])

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  const missingText = `缺少：${missing.map((capability) => CAPABILITY_LABEL[capability]).join('、')}`

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <SettingsPageHeader
        title="模型管理"
        description="添加和管理模型，并配置知识库统一使用的默认模型。"
      />

      <div className="shrink-0 border-b border-[#E5E6EB] px-[24px] py-[14px]">
        <div className="flex items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[14px] font-medium text-[#1D2129]">默认模型</span>
            <span
              className={`rounded-[3px] px-[8px] py-[1px] text-[12px] ${
                missing.length === 0
                  ? 'bg-[#E8FFF0] text-[#00B42A]'
                  : 'bg-[#FFF3E0] text-[#D25F00]'
              }`}
            >
              {configuredCount}/{REQUIRED_CAPABILITIES.length} 必选已配置
            </span>
          </div>
          <button
            type="button"
            onClick={openDefaults}
            className="flex h-[32px] shrink-0 items-center gap-[6px] rounded-[3px] border border-[#166EFF] bg-white px-[12px] text-[13px] text-[#166EFF] transition-colors hover:bg-[#F2F7FF]"
          >
            <Settings2 className="h-[14px] w-[14px]" />
            设置默认模型
          </button>
        </div>

        <div className="mt-[12px] grid grid-cols-1 gap-[10px] md:grid-cols-2 xl:grid-cols-3">
          {CAPABILITIES.map((capability) => {
            const modelId = defaults[capability]
            const model = models.find((item) => item.id === modelId)
            const optional = !isRequiredCapability(capability)
            return (
              <div
                key={capability}
                className={`rounded-[4px] border px-[12px] py-[9px] ${
                  model
                    ? 'border-[#E5E6EB] bg-[#FAFBFC]'
                    : optional
                      ? 'border-[#E5E6EB] bg-white'
                      : 'border-[#FFD8A8] bg-[#FFF9F0]'
                }`}
              >
                <div className="flex items-center justify-between gap-[8px]">
                  <span className="flex items-center gap-[6px] text-[12px] text-[#86909C]">
                    {CAPABILITY_LABEL[capability]}
                    {optional && (
                      <span className="rounded-[2px] bg-[#F2F3F5] px-[5px] py-[1px] text-[11px] text-[#86909C]">
                        可选
                      </span>
                    )}
                  </span>
                  {model ? (
                    <CheckCircle2 className="h-[13px] w-[13px] shrink-0 text-[#00B42A]" />
                  ) : optional ? null : (
                    <AlertCircle className="h-[13px] w-[13px] shrink-0 text-[#FF7D00]" />
                  )}
                </div>
                <div
                  className={`mt-[3px] truncate text-[13px] font-medium ${
                    model ? 'text-[#1D2129]' : optional ? 'text-[#86909C]' : 'text-[#D25F00]'
                  }`}
                  title={model?.name ?? (optional ? '未配置（可选）' : '未配置')}
                >
                  {model?.name ?? (optional ? '未配置（可选）' : '未配置')}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {missing.length > 0 && (
        <div className="flex shrink-0 items-center gap-[8px] border-b border-[#FFE4BA] bg-[#FFF7E8] px-[24px] py-[8px]">
          <AlertTriangle className="h-[14px] w-[14px] shrink-0 text-[#FF7D00]" />
          <span className="text-[12.5px] leading-[18px] text-[#8A4B00]">
            必选默认模型尚未配置完整（{missingText}）。未完成配置前，将无法创建知识库；重排模型为可选项，不影响创建。
          </span>
          <button
            type="button"
            onClick={openDefaults}
            className="ml-auto shrink-0 text-[12.5px] font-medium text-[#D25F00] hover:text-[#B24F00]"
          >
            立即设置
          </button>
        </div>
      )}

      <SettingsToolbar
        actions={
          <SettingsSearch
            value={draftQuery}
            onChange={setDraftQuery}
            onSearch={() => {
              setQuery(draftQuery)
              setPage(1)
            }}
            onReset={() => {
              setDraftQuery('')
              setQuery('')
              setPage(1)
            }}
            placeholder="搜索模型名称 / 能力"
          />
        }
      >
        <PrimaryButton onClick={() => setModal('create')}>
          <Plus className="h-[14px] w-[14px]" />
          添加模型
        </PrimaryButton>
      </SettingsToolbar>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#F5F7FA] px-[24px] py-[18px]">
        {pageItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
            {pageItems.map((model) => {
              const usedAsDefault = isDefaultModel(registry, model.id)
              return (
                <div key={model.id} className="overflow-hidden rounded-[5px] border border-[#E5E6EB] bg-white">
                  <div className="flex items-start justify-between gap-[16px] px-[20px] pb-[18px] pt-[18px]">
                    <div className="flex min-w-0 items-center gap-[12px]">
                      <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#EAF2FF]">
                        <Flower2 className="h-[22px] w-[22px] text-[#166EFF]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-[8px]">
                          <h3 className="truncate text-[15px] font-medium text-[#1D2129]">{model.name}</h3>
                          <EnabledBadge enabled={model.enabled} />
                          <span className="rounded-[3px] bg-[#F2F3F5] px-[6px] py-[1px] text-[11px] text-[#4E5969]">
                            {CAPABILITY_SHORT_LABEL[model.capability]}
                          </span>
                          {model.capability === 'chat' && model.supportsVision && (
                            <span className="rounded-[3px] bg-[#E8F7EE] px-[6px] py-[1px] text-[11px] text-[#00A344]">
                              多模态
                            </span>
                          )}
                          {usedAsDefault && (
                            <span
                              className="rounded-[3px] bg-[#EAF2FF] px-[6px] py-[1px] text-[11px] text-[#166EFF]"
                              title={`当前${CAPABILITY_LABEL[model.capability]}`}
                            >
                              默认
                            </span>
                          )}
                        </div>
                        <p className="mt-[4px] text-[12px] text-[#86909C]">
                          {model.protocol} · 上下文 {formatTokenCount(model.contextWindow)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={model.baseUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="打开请求地址"
                      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[3px] border border-[#D9DEE7] text-[#166EFF] transition-colors hover:border-[#166EFF] hover:bg-[#F2F7FF]"
                    >
                      <Link2 className="h-[15px] w-[15px]" />
                    </a>
                  </div>

                  <div className="mx-[20px] rounded-[3px] bg-[#F7F8FA] px-[12px] py-[10px]">
                    <div className="text-[12px] text-[#86909C]">请求地址</div>
                    <div className="mt-[4px] break-all font-mono text-[13px] leading-[20px] text-[#4E5969]">
                      {model.baseUrl}
                    </div>
                  </div>

                  <div className="mt-[16px] flex items-center gap-[8px] border-t border-[#E5E6EB] px-[20px] py-[10px]">
                    <button
                      type="button"
                      onClick={() => toggleModel(model.id)}
                      disabled={usedAsDefault}
                      title={usedAsDefault ? '默认模型不可停用，请先更换默认模型' : undefined}
                      className={`flex h-[28px] items-center gap-[4px] rounded-[3px] border px-[10px] text-[12px] transition-colors ${
                        model.enabled
                          ? 'border-[#C9E8CD] bg-[#F4FFF5] text-[#00B42A]'
                          : 'border-[#D9DEE7] bg-white text-[#4E5969] hover:border-[#166EFF] hover:text-[#166EFF]'
                      } ${usedAsDefault ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <Check className="h-[12px] w-[12px]" />
                      {model.enabled ? '已启用' : '启用'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(model)
                        setModal('edit')
                      }}
                      title="编辑模型"
                      className="flex h-[28px] w-[28px] items-center justify-center rounded-[3px] border border-[#D9DEE7] bg-white text-[#166EFF] transition-colors hover:border-[#166EFF]"
                    >
                      <Edit3 className="h-[13px] w-[13px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModel(model.id)}
                      disabled={usedAsDefault}
                      title={usedAsDefault ? '默认模型不可删除，请先更换默认模型' : '删除模型'}
                      className={`flex h-[28px] w-[28px] items-center justify-center rounded-[3px] border border-[#D9DEE7] bg-white text-[#F53F3F] transition-colors hover:border-[#F53F3F] ${
                        usedAsDefault ? 'cursor-not-allowed opacity-40 hover:border-[#D9DEE7]' : ''
                      }`}
                    >
                      <Trash2 className="h-[13px] w-[13px]" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-[320px] flex-col items-center justify-center rounded-[5px] border border-[#E5E6EB] bg-white">
            <Flower2 className="mb-[12px] h-[44px] w-[44px] text-[#C9CDD4]" />
            <p className="text-[14px] text-[#86909C]">暂无匹配的模型</p>
          </div>
        )}
      </div>

      <SettingsPagination
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />

      {defaultsOpen && (
        <DefaultModelModal
          models={models}
          defaults={defaults}
          onClose={() => setDefaultsOpen(false)}
          onSubmit={(next, migration) => {
            saveDefaults(next)
            if (migration && next.embedding) {
              const target = models.find((model) => model.id === next.embedding)
              if (target) {
                const affected = queueEmbeddingMigration(
                  { id: target.id, name: target.name },
                  migration,
                )
                onNotify?.(
                  migration === 'now'
                    ? `已切换默认向量模型，开始重建 ${affected} 个知识库的索引`
                    : `已切换默认向量模型，${affected} 个知识库已标记为待重建`,
                )
              }
            }
            setDefaultsOpen(false)
          }}
        />
      )}

      {modal && (
        <ModelModal
          model={modal === 'edit' ? editing : null}
          isDefault={Boolean(editing && isDefaultModel(registry, editing.id))}
          onClose={() => {
            setModal(null)
            setEditing(null)
          }}
          onSubmit={(model) => {
            saveModel(model)
            setModal(null)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function DefaultModelModal({
  models,
  defaults,
  onClose,
  onSubmit,
}: {
  models: ModelItem[]
  defaults: DefaultModels
  onClose: () => void
  onSubmit: (defaults: DefaultModels, migration?: 'later' | 'now') => void
}) {
  const [draft, setDraft] = useState<DefaultModels>({ ...defaults })
  const [confirmingEmbedding, setConfirmingEmbedding] = useState(false)

  const embeddingChanged = draft.embedding !== defaults.embedding && Boolean(defaults.embedding)
  const targetEmbedding = models.find((model) => model.id === draft.embedding)
  const currentEmbedding = models.find((model) => model.id === defaults.embedding)
  const impact = embeddingChanged && draft.embedding ? getEmbeddingImpact(draft.embedding) : null

  const save = () => {
    if (embeddingChanged && !confirmingEmbedding && impact && impact.items.length > 0) {
      setConfirmingEmbedding(true)
      return
    }
    onSubmit(draft)
  }

  if (confirmingEmbedding) {
    return (
      <SettingsModal
        title="确认更换向量模型"
        width="600px"
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmingEmbedding(false)}
              className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969]"
            >
              返回修改
            </button>
            <button
              type="button"
              onClick={() => onSubmit(draft, 'later')}
              className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969] hover:border-[#166EFF] hover:text-[#166EFF]"
            >
              仅切换默认，稍后重建
            </button>
            <button
              type="button"
              onClick={() => onSubmit(draft, 'now')}
              className="h-[32px] rounded-[3px] bg-[#166EFF] px-[16px] text-[13px] text-white"
            >
              切换并立即重建
            </button>
          </>
        }
      >
        <div className="flex gap-[12px] rounded-[4px] border border-[#FFE4BA] bg-[#FFF7E8] px-[14px] py-[12px]">
          <AlertTriangle className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[#FF7D00]" />
          <div className="text-[13px] leading-[21px] text-[#8A4B00]">
            <p className="font-medium">
              {impact && impact.items.length > 0
                ? `将影响 ${impact.items.length} 个知识库、${impact.totalDocs} 篇文档的索引。`
                : '更换后，已有文档的索引不会自动迁移。'}
            </p>
            <p className="mt-[6px]">
              旧索引不会自动迁移，重建完成前仍按旧模型检索。对话模型与重排模型的变更不受影响。
            </p>
          </div>
        </div>

        {impact && (
          <>
            <div className="mt-[14px] flex items-center justify-between text-[12px]">
              <span className="text-[#4E5969]">模型变化</span>
              <span className="flex items-center gap-[6px] font-medium text-[#1D2129]">
                <span className="rounded-[3px] bg-[#F2F3F5] px-[6px] py-[2px] text-[#4E5969]">
                  {currentEmbedding?.name ?? '未配置'}
                </span>
                <span className="text-[#86909C]">→</span>
                <span className="rounded-[3px] bg-[#E8F3FF] px-[6px] py-[2px] text-[#166EFF]">
                  {targetEmbedding?.name ?? '新模型'}
                </span>
              </span>
            </div>

            <div className="mt-[14px] overflow-hidden rounded-[4px] border border-[#E5E6EB]">
              <div className="flex items-center justify-between bg-[#FAFBFC] px-[12px] py-[8px] text-[12px] text-[#86909C]">
                <span>待重建知识库</span>
                <span>文档 / 当前模型</span>
              </div>
              <div className="max-h-[220px] overflow-y-auto">
                {impact.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-[12px] border-t border-[#F2F3F5] px-[12px] py-[9px] text-[13px]"
                  >
                    <span className="min-w-0 truncate text-[#1D2129]">{item.name}</span>
                    <span className="flex shrink-0 items-center gap-[8px] text-[12px] text-[#86909C]">
                      <span>{item.docs} 篇</span>
                      <span className="text-[#C9CDD4]">·</span>
                      <span>{item.currentModelName}</span>
                      {item.status === 'stale' && (
                        <span className="rounded-[2px] bg-[#FFF7E8] px-[4px] py-[1px] text-[11px] text-[#8A4B00]">
                          待重建
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {impact.empty.length > 0 && (
              <p className="mt-[8px] text-[12px] leading-[18px] text-[#86909C]">
                {impact.empty.length} 个空库没有索引，切换后直接使用新模型，无需重建。
              </p>
            )}
          </>
        )}

        <p className="mt-[12px] text-[12px] leading-[18px] text-[#86909C]">
          选择「立即重建」后会进入重建队列，期间知识库仍可正常检索，但结果可能不是最新索引。
        </p>
      </SettingsModal>
    )
  }

  return (
    <SettingsModal
      title="设置默认模型"
      width="520px"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={save}
            className="h-[32px] rounded-[3px] bg-[#166EFF] px-[16px] text-[13px] text-white"
          >
            保存
          </button>
        </>
      }
    >
      <p className="mb-[16px] rounded-[3px] bg-[#F7F8FA] px-[12px] py-[9px] text-[12px] leading-[19px] text-[#4E5969]">
        对话模型与向量模型为必选项，重排模型可选。默认模型对全部知识库生效，更换向量模型后，已有知识库需要重建索引。
      </p>
      <div className="space-y-[16px]">
        {CAPABILITIES.map((capability) => {
          const options = modelsForCapability(models, capability)
          const optional = !isRequiredCapability(capability)
          return (
            <div key={capability}>
              <FieldLabel required={!optional}>{CAPABILITY_LABEL[capability]}</FieldLabel>
              <div className="relative">
                <select
                  value={draft[capability] ?? ''}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [capability]: event.target.value || null,
                    }))
                  }
                  disabled={options.length === 0}
                  className={`${inputClass} appearance-none pr-[32px] disabled:cursor-not-allowed disabled:bg-[#F7F8FA] disabled:text-[#86909C]`}
                >
                  <option value="">
                    {options.length === 0
                      ? optional
                        ? '暂不启用（可选）'
                        : '暂无可用模型，请先添加'
                      : optional
                        ? `不启用${CAPABILITY_LABEL[capability]}（可选）`
                        : '请选择'}
                  </option>
                  {options.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                      {model.supportsVision ? '（多模态）' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[10px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#86909C]" />
              </div>
              <p className="mt-[5px] text-[12px] text-[#86909C]">
                {optional ? OPTIONAL_CAPABILITY_HINT[capability] : CAPABILITY_DESCRIPTION[capability]}
              </p>
            </div>
          )
        })}
      </div>
    </SettingsModal>
  )
}

function ModelModal({
  model,
  isDefault,
  onClose,
  onSubmit,
}: {
  model: ModelItem | null
  isDefault: boolean
  onClose: () => void
  onSubmit: (model: ModelItem) => void
}) {
  const [name, setName] = useState(model?.name ?? '')
  const [capability, setCapability] = useState<ModelCapability>(model?.capability ?? 'chat')
  const [supportsVision, setSupportsVision] = useState(Boolean(model?.supportsVision))
  const [protocol, setProtocol] = useState<ModelProtocol>(model?.protocol ?? 'OpenAI Chat Completions')
  const [baseUrl, setBaseUrl] = useState(model?.baseUrl ?? '')
  const [apiKey, setApiKey] = useState('')
  const [maxOutputTokens, setMaxOutputTokens] = useState(
    model?.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
  )
  const [contextWindow, setContextWindow] = useState(model?.contextWindow ?? DEFAULT_CONTEXT_WINDOW)
  const [modelOptionsOpen, setModelOptionsOpen] = useState(false)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)

  const valid =
    Boolean(name.trim()) &&
    Boolean(baseUrl.trim()) &&
    maxOutputTokens > 0 &&
    contextWindow > 0

  const fetchModels = () => {
    setFetchedAt(Date.now())
    setModelOptionsOpen(true)
  }

  return (
    <SettingsModal
      title={model ? '编辑模型' : '添加模型'}
      width="w-[820px]"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] rounded-[3px] border border-[#D9DEE7] px-[14px] text-[13px] text-[#4E5969]"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() =>
              onSubmit({
                id: model?.id ?? `model-${Date.now()}`,
                name: name.trim(),
                capability,
                supportsVision: capability === 'chat' ? supportsVision : false,
                protocol,
                baseUrl: baseUrl.trim(),
                provider: MODEL_PROVIDER,
                maxOutputTokens,
                contextWindow,
                enabled: model?.enabled ?? true,
              })
            }
            className="h-[32px] rounded-[3px] bg-[#166EFF] px-[16px] text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {model ? '保存' : '添加'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-x-[24px] gap-y-[18px] md:grid-cols-2">
        <div>
          <FieldLabel>模型服务商</FieldLabel>
          <input
            value={MODEL_PROVIDER}
            readOnly
            className={`${inputClass} cursor-default bg-[#F7F8FA] text-[#4E5969] focus:border-[#D9DEE7]`}
          />
        </div>

        <div>
          <FieldLabel required>API 格式</FieldLabel>
          <div className="relative">
            <select
              value={protocol}
              onChange={(event) => setProtocol(event.target.value as ModelProtocol)}
              className={`${inputClass} appearance-none pr-[32px]`}
            >
              {PROTOCOLS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[10px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#86909C]" />
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel required>请求地址</FieldLabel>
          <input
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://api.example.com/v1"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel required>模型 ID</FieldLabel>
          <div className="flex items-start gap-[10px]">
            <div
              className="relative min-w-0 flex-1"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setModelOptionsOpen(false)
                }
              }}
            >
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="如 GPT-4o"
                role="combobox"
                aria-expanded={modelOptionsOpen}
                aria-controls="model-id-options"
                className={`${inputClass} pr-[34px]`}
              />
              <button
                type="button"
                disabled={!fetchedAt}
                onClick={() => setModelOptionsOpen((open) => !open)}
                title={fetchedAt ? undefined : '请先获取模型列表'}
                className="absolute right-[2px] top-[2px] flex h-[30px] w-[30px] items-center justify-center text-[#86909C] transition-colors hover:text-[#166EFF] disabled:cursor-not-allowed disabled:text-[#C9CDD4]"
                aria-label="展开模型 ID 候选"
              >
                <ChevronDown
                  className={`h-[14px] w-[14px] transition-transform ${modelOptionsOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {modelOptionsOpen && (
                <div
                  id="model-id-options"
                  className="absolute left-0 right-0 top-[38px] z-20 max-h-[192px] overflow-y-auto rounded-[4px] border border-[#E5E6EB] bg-white py-[4px] shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
                >
                  {MODEL_ID_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setName(option)
                        setModelOptionsOpen(false)
                      }}
                      className={`block w-full px-[12px] py-[7px] text-left text-[13px] transition-colors hover:bg-[#F2F7FF] ${
                        option === name ? 'bg-[#F2F7FF] text-[#166EFF]' : 'text-[#1D2129]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={!baseUrl.trim()}
              onClick={fetchModels}
              title={!baseUrl.trim() ? '请先填写请求地址' : '从模型服务获取可用模型'}
              className="h-[34px] shrink-0 rounded-[3px] border border-[#D9DEE7] bg-white px-[14px] text-[13px] text-[#4E5969] transition-colors hover:border-[#166EFF] hover:text-[#166EFF] disabled:cursor-not-allowed disabled:bg-[#F7F8FA] disabled:text-[#A9AEB8]"
            >
              {fetchedAt ? '重新获取' : '获取模型列表'}
            </button>
          </div>
          {fetchedAt && (
            <p className="mt-[5px] text-[12px] text-[#00B42A]">
              已获取 {MODEL_ID_OPTIONS.length} 个可用模型，可从下拉列表中选择。
            </p>
          )}
        </div>

        <div>
          <FieldLabel required>模型能力</FieldLabel>
          <div className="grid grid-cols-3 overflow-hidden rounded-[4px] border border-[#D9DEE7]">
            {CAPABILITIES.map((item) => {
              const selected = capability === item
              return (
                <button
                  key={item}
                  type="button"
                  disabled={isDefault}
                  onClick={() => setCapability(item)}
                  className={`h-[34px] whitespace-nowrap border-r border-[#D9DEE7] text-[12.5px] transition-colors last:border-r-0 ${
                    selected
                      ? 'bg-[#EAF2FF] font-medium text-[#166EFF]'
                      : 'bg-white text-[#4E5969] hover:bg-[#F7F8FA]'
                  } ${isDefault ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {CAPABILITY_SHORT_LABEL[item]}
                  {!isRequiredCapability(item) && (
                    <span className="ml-[3px] text-[10.5px] text-[#86909C]">可选</span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="mt-[5px] text-[12px] text-[#86909C]">{CAPABILITY_DESCRIPTION[capability]}</p>
          {capability === 'chat' && (
            <label className="mt-[8px] flex cursor-pointer items-start gap-[6px] text-[12px] leading-[18px] text-[#4E5969]">
              <input
                type="checkbox"
                checked={supportsVision}
                onChange={(event) => setSupportsVision(event.target.checked)}
                className="mt-[2px] h-[13px] w-[13px] shrink-0 accent-[#166EFF]"
              />
              <span>
                支持图片理解
                <span className="text-[#86909C]">（多模态，随对话模型一起生效）</span>
              </span>
            </label>
          )}
          {isDefault && (
            <p className="mt-[5px] text-[12px] text-[#D25F00]">
              该模型正在作为默认模型使用，能力类型不可修改；如需调整，请先在「设置默认模型」中更换。
            </p>
          )}
        </div>

        <div>
          <FieldLabel>API Key</FieldLabel>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={model ? '留空则不修改' : '请输入 API Key（选填）'}
            className={inputClass}
          />
          <p className="mt-[5px] text-[12px] text-[#86909C]">内网或网关部署时可留空。</p>
        </div>

        <TokenField
          label="最大输出长度（Token）"
          value={maxOutputTokens}
          onChange={setMaxOutputTokens}
        />
        <TokenField label="上下文窗口（Token）" value={contextWindow} onChange={setContextWindow} />
      </div>
    </SettingsModal>
  )
}

function TokenField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const adjust = (delta: number) => onChange(Math.max(1, value + delta))

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-[34px] overflow-hidden rounded-[3px] border border-[#D9DEE7] bg-white focus-within:border-[#166EFF]">
        <button
          type="button"
          onClick={() => adjust(-1024)}
          disabled={value <= 1}
          aria-label={`减少${label}`}
          className="flex w-[34px] shrink-0 items-center justify-center border-r border-[#E5E6EB] text-[#4E5969] transition-colors hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:text-[#C9CDD4]"
        >
          <Minus className="h-[13px] w-[13px]" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isFinite(next)) onChange(next)
          }}
          className="min-w-0 flex-1 border-0 bg-transparent px-[8px] text-center text-[13px] text-[#1D2129] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => adjust(1024)}
          aria-label={`增加${label}`}
          className="flex w-[34px] shrink-0 items-center justify-center border-l border-[#E5E6EB] text-[#4E5969] transition-colors hover:bg-[#F7F8FA]"
        >
          <Plus className="h-[13px] w-[13px]" />
        </button>
      </div>
    </div>
  )
}

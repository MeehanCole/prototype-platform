import { useMemo, useState } from 'react'
import { Check, Edit3, Flower2, Link2, Plus, Trash2 } from 'lucide-react'
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

type ModelProtocol = 'OpenAI Chat Completions' | 'OpenAI Responses' | 'Anthropic Messages'

interface ModelItem {
  id: string
  name: string
  protocol: ModelProtocol
  baseUrl: string
  enabled: boolean
}

const PROTOCOLS: ModelProtocol[] = ['OpenAI Chat Completions', 'OpenAI Responses', 'Anthropic Messages']

const INITIAL_MODELS: ModelItem[] = [
  {
    id: 'qwen-3-8-flash-next',
    name: 'Qwen3.8-Flash-Next',
    protocol: 'OpenAI Chat Completions',
    baseUrl: 'https://token-api.gientech.com/inference/0rsjal14/v1',
    enabled: true,
  },
]

/** 模型管理：模型卡片 + 添加/编辑/启停/删除 */
export function ModelManagementPage() {
  const [models, setModels] = useState<ModelItem[]>(INITIAL_MODELS)
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<ModelItem | null>(null)

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return models
    return models.filter(
      (model) => model.name.toLowerCase().includes(keyword) || model.baseUrl.toLowerCase().includes(keyword),
    )
  }, [models, query])

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggle = (id: string) => {
    setModels((current) =>
      current.map((model) => (model.id === id ? { ...model, enabled: !model.enabled } : model)),
    )
  }

  const remove = (id: string) => {
    setModels((current) => current.filter((model) => model.id !== id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <SettingsPageHeader title="模型管理" description="添加和管理模型，支持编辑、校验、探测与启用。" />
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
            placeholder="搜索模型名称"
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
            {pageItems.map((model) => (
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
                      </div>
                      <p className="mt-[4px] text-[12px] text-[#86909C]">{model.protocol}</p>
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
                    onClick={() => toggle(model.id)}
                    className={`flex h-[28px] items-center gap-[4px] rounded-[3px] border px-[10px] text-[12px] transition-colors ${
                      model.enabled
                        ? 'border-[#C9E8CD] bg-[#F4FFF5] text-[#00B42A]'
                        : 'border-[#D9DEE7] bg-white text-[#4E5969] hover:border-[#166EFF] hover:text-[#166EFF]'
                    }`}
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
                    onClick={() => remove(model.id)}
                    title="删除模型"
                    className="flex h-[28px] w-[28px] items-center justify-center rounded-[3px] border border-[#D9DEE7] bg-white text-[#F53F3F] transition-colors hover:border-[#F53F3F]"
                  >
                    <Trash2 className="h-[13px] w-[13px]" />
                  </button>
                </div>
              </div>
            ))}
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

      {modal && (
        <ModelModal
          model={modal === 'edit' ? editing : null}
          onClose={() => {
            setModal(null)
            setEditing(null)
          }}
          onSubmit={(model) => {
            setModels((current) =>
              modal === 'edit'
                ? current.map((item) => (item.id === model.id ? model : item))
                : [...current, model],
            )
            setModal(null)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function ModelModal({
  model,
  onClose,
  onSubmit,
}: {
  model: ModelItem | null
  onClose: () => void
  onSubmit: (model: ModelItem) => void
}) {
  const [name, setName] = useState(model?.name ?? '')
  const [protocol, setProtocol] = useState<ModelProtocol>(model?.protocol ?? 'OpenAI Chat Completions')
  const [baseUrl, setBaseUrl] = useState(model?.baseUrl ?? '')
  const [apiKey, setApiKey] = useState('')
  const valid = name.trim() && baseUrl.trim()

  return (
    <SettingsModal
      title={model ? '编辑模型' : '添加模型'}
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
                protocol,
                baseUrl: baseUrl.trim(),
                enabled: model?.enabled ?? true,
              })
            }
            className="h-[32px] rounded-[3px] bg-[#166EFF] px-[16px] text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            确认
          </button>
        </>
      }
    >
      <div className="space-y-[16px]">
        <div>
          <FieldLabel required>模型名称</FieldLabel>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="请输入模型名称"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel required>接口协议</FieldLabel>
          <select
            value={protocol}
            onChange={(event) => setProtocol(event.target.value as ModelProtocol)}
            className={inputClass}
          >
            {PROTOCOLS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel required>请求地址</FieldLabel>
          <input
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://example.com/v1"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel>API Key</FieldLabel>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={model ? '留空则不修改' : '请输入 API Key'}
            className={inputClass}
          />
        </div>
      </div>
    </SettingsModal>
  )
}
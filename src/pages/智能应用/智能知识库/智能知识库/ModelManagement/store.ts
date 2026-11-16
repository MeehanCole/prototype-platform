import { useSyncExternalStore } from 'react'

export type ModelCapability = 'chat' | 'embedding' | 'rerank'

export type ModelProtocol =
  | 'OpenAI Chat Completions'
  | 'OpenAI Responses'
  | 'Anthropic Messages'
  | 'Google Generative AI'

export interface ModelItem {
  id: string
  name: string
  capability: ModelCapability
  protocol: ModelProtocol
  baseUrl: string
  provider: string
  maxOutputTokens: number
  contextWindow: number
  enabled: boolean
  /** 对话模型是否支持图片输入（多模态），仅对 chat 能力生效。 */
  supportsVision?: boolean
}

export type DefaultModels = Record<ModelCapability, string | null>

export interface ModelRegistry {
  version: number
  models: ModelItem[]
  defaults: DefaultModels
}

const REGISTRY_VERSION = 3

export const CAPABILITIES: ModelCapability[] = ['chat', 'embedding', 'rerank']

/** 知识库创建与问答所必需的能力，重排模型为可选项。 */
export const REQUIRED_CAPABILITIES: ModelCapability[] = ['chat', 'embedding']

export function isRequiredCapability(capability: ModelCapability) {
  return REQUIRED_CAPABILITIES.includes(capability)
}

export const MODEL_PROVIDER = '算力加速平台'
export const DEFAULT_MAX_OUTPUT_TOKENS = 4096
export const DEFAULT_CONTEXT_WINDOW = 128000

export const CAPABILITY_LABEL: Record<ModelCapability, string> = {
  chat: '对话模型',
  embedding: '向量模型',
  rerank: '重排模型',
}

export const CAPABILITY_SHORT_LABEL: Record<ModelCapability, string> = {
  chat: '对话',
  embedding: '向量',
  rerank: '重排',
}

export const CAPABILITY_DESCRIPTION: Record<ModelCapability, string> = {
  chat: '用于知识库问答与内容生成，支持图片理解的模型可同时处理图片与扫描件。',
  embedding: '用于文档向量化与语义召回',
  rerank: '用于检索结果重排序',
}

export const OPTIONAL_CAPABILITY_HINT: Partial<Record<ModelCapability, string>> = {
  rerank: '可选，不配置时检索结果不进行重排序。',
}

const STORAGE_KEY = 'ikb-model-registry-v1'

export const INITIAL_MODELS: ModelItem[] = [
  {
    id: 'qwen-3-8-flash-next',
    name: 'Qwen3.8-Flash-Next',
    capability: 'chat',
    protocol: 'OpenAI Chat Completions',
    baseUrl: 'https://token-api.gientech.com/inference/0rsjal14/v1',
    provider: MODEL_PROVIDER,
    maxOutputTokens: 8192,
    contextWindow: 128000,
    enabled: true,
  },
  {
    id: 'bge-m3',
    name: 'BGE-M3',
    capability: 'embedding',
    protocol: 'OpenAI Responses',
    baseUrl: 'https://token-api.gientech.com/inference/0rsjal14/v1',
    provider: MODEL_PROVIDER,
    maxOutputTokens: 8192,
    contextWindow: 8192,
    enabled: true,
  },
  {
    id: 'bge-reranker-v2-m3',
    name: 'BGE-Reranker-v2-M3',
    capability: 'rerank',
    protocol: 'OpenAI Responses',
    baseUrl: 'https://token-api.gientech.com/inference/0rsjal14/v1',
    provider: MODEL_PROVIDER,
    maxOutputTokens: 4096,
    contextWindow: 8192,
    enabled: true,
  },
  {
    id: 'qwen2-5-vl-7b-instruct',
    name: 'Qwen2.5-VL-7B-Instruct',
    capability: 'chat',
    supportsVision: true,
    protocol: 'OpenAI Chat Completions',
    baseUrl: 'https://token-api.gientech.com/inference/0rsjal14/v1',
    provider: MODEL_PROVIDER,
    maxOutputTokens: 4096,
    contextWindow: 32768,
    enabled: true,
  },
]

const EMPTY_DEFAULTS: DefaultModels = {
  chat: null,
  embedding: null,
  rerank: null,
}

function createInitialRegistry(): ModelRegistry {
  return {
    version: REGISTRY_VERSION,
    models: INITIAL_MODELS.map((model) => ({ ...model })),
    defaults: { ...EMPTY_DEFAULTS },
  }
}

function isCapability(value: unknown): value is ModelCapability {
  return value === 'chat' || value === 'embedding' || value === 'rerank'
}

function isStoredCapability(value: unknown): value is ModelCapability | 'vision' {
  return isCapability(value) || value === 'vision'
}

function loadRegistry(): ModelRegistry {
  if (typeof window === 'undefined') return createInitialRegistry()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialRegistry()
    const parsed = JSON.parse(raw) as Partial<ModelRegistry>
    if (!Array.isArray(parsed.models)) return createInitialRegistry()

    type StoredModel = Omit<ModelItem, 'capability'> & { capability: ModelCapability | 'vision' }
    const storedModels = parsed.models as StoredModel[]
    const models: ModelItem[] = storedModels
      .filter(
        (model): model is StoredModel =>
          Boolean(model) &&
          typeof model.id === 'string' &&
          typeof model.name === 'string' &&
          isStoredCapability(model.capability) &&
          typeof model.baseUrl === 'string',
      )
      .map((model) => {
        const capability: ModelCapability = model.capability === 'vision' ? 'chat' : model.capability
        return {
          ...model,
          capability,
          // 旧版本的独立多模态模型并入对话模型，并保留图片理解标记。
          supportsVision: model.capability === 'vision' || Boolean(model.supportsVision),
          provider: typeof model.provider === 'string' ? model.provider : MODEL_PROVIDER,
          maxOutputTokens:
            typeof model.maxOutputTokens === 'number' ? model.maxOutputTokens : DEFAULT_MAX_OUTPUT_TOKENS,
          contextWindow:
            typeof model.contextWindow === 'number' ? model.contextWindow : DEFAULT_CONTEXT_WINDOW,
        }
      })
    // v1 没有多模态模型，升级时补入内置视觉模型；之后的新增与删除仍以用户数据为准。
    if ((typeof parsed.version === 'number' ? parsed.version : 1) < 2) {
      for (const seed of INITIAL_MODELS) {
        if (seed.supportsVision && !models.some((model) => model.id === seed.id)) {
          models.push({ ...seed })
        }
      }
    }
    const defaults: DefaultModels = { ...EMPTY_DEFAULTS }
    for (const capability of CAPABILITIES) {
      const value = parsed.defaults?.[capability]
      const target = models.find((model) => model.id === value)
      defaults[capability] = target && target.capability === capability && target.enabled ? target.id : null
    }
    return { version: REGISTRY_VERSION, models, defaults }
  } catch {
    return createInitialRegistry()
  }
}

let registry: ModelRegistry = loadRegistry()
persist()
const listeners = new Set<() => void>()

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registry))
  } catch {
    // 存储不可用时只保留内存态，不影响原型交互。
  }
}

function commit(next: ModelRegistry) {
  registry = next
  persist()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return registry
}

export function useModelRegistry(): ModelRegistry {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function saveModel(model: ModelItem) {
  const exists = registry.models.some((item) => item.id === model.id)
  commit({
    ...registry,
    models: exists
      ? registry.models.map((item) => (item.id === model.id ? model : item))
      : [...registry.models, model],
  })
}

export function removeModel(id: string) {
  const defaults = { ...registry.defaults }
  for (const capability of CAPABILITIES) {
    if (defaults[capability] === id) defaults[capability] = null
  }
  commit({ ...registry, models: registry.models.filter((model) => model.id !== id), defaults })
}

export function toggleModel(id: string) {
  const target = registry.models.find((model) => model.id === id)
  if (!target) return
  if (registry.defaults[target.capability] === id) return
  commit({
    ...registry,
    models: registry.models.map((model) =>
      model.id === id ? { ...model, enabled: !model.enabled } : model,
    ),
  })
}

export function saveDefaults(defaults: DefaultModels) {
  const sanitized: DefaultModels = { ...EMPTY_DEFAULTS }
  for (const capability of CAPABILITIES) {
    const target = registry.models.find((model) => model.id === defaults[capability])
    sanitized[capability] =
      target && target.capability === capability && target.enabled ? target.id : null
  }
  commit({ ...registry, defaults: sanitized })
}

export function isDefaultModel(registryState: ModelRegistry, id: string) {
  return CAPABILITIES.some((capability) => registryState.defaults[capability] === id)
}

export function missingCapabilities(defaults: DefaultModels): ModelCapability[] {
  return REQUIRED_CAPABILITIES.filter((capability) => !defaults[capability])
}

export function modelsForCapability(models: ModelItem[], capability: ModelCapability) {
  return models.filter((model) => model.capability === capability && model.enabled)
}
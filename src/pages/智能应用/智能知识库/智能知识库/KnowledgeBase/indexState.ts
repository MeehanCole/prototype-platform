/**
 * 知识库索引状态
 *
 * 每个库记录“当前索引实际使用的向量模型”。更换平台默认向量模型后，
 * 旧库不会自动迁移，而是标记为待重建；重建过程在此集中模拟与持久化，
 * 让列表、库详情与模型管理共享同一份状态。
 */
import { useSyncExternalStore } from 'react'
import { KB_RECORDS } from './model'

export type IndexStatus = 'ready' | 'stale' | 'rebuilding'

export type KbIndexState = {
  /** 当前索引实际使用的向量模型 */
  modelId: string
  modelName: string
  /** 最近一次完成索引的时间 */
  indexedAt: string
  status: IndexStatus
  /** 重建目标模型；待重建或重建中才有值 */
  targetModelId?: string
  targetModelName?: string
  /** 重建进度 0–100，仅 rebuilding 时有意义 */
  progress?: number
  /** 文档数快照，用于计算影响面 */
  docs: number
}

type IndexStore = Record<string, KbIndexState>

const STORAGE_KEY = 'ikb-kb-index-v1'
const LEGACY_MODEL = { id: 'bge-m3', name: 'BGE-M3' }

function today() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function seedState(): IndexStore {
  const store: IndexStore = {}
  for (const kb of KB_RECORDS) {
    store[kb.name] = {
      modelId: LEGACY_MODEL.id,
      modelName: LEGACY_MODEL.name,
      indexedAt: kb.createdAt,
      status: 'ready',
      docs: kb.docs,
    }
  }
  return store
}

function isEntry(value: unknown): value is KbIndexState {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<KbIndexState>
  return (
    typeof entry.modelId === 'string' &&
    typeof entry.modelName === 'string' &&
    typeof entry.indexedAt === 'string' &&
    (entry.status === 'ready' || entry.status === 'stale' || entry.status === 'rebuilding') &&
    typeof entry.docs === 'number'
  )
}

function load(): IndexStore {
  if (typeof window === 'undefined') return seedState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : null
    const store: IndexStore = {}
    if (parsed && typeof parsed === 'object') {
      for (const [name, value] of Object.entries(parsed)) {
        if (isEntry(value)) {
          store[name] = {
            ...value,
            docs: Math.max(0, Math.round(value.docs)),
            progress:
              value.status === 'rebuilding'
                ? Math.min(99, Math.max(0, Math.round(value.progress ?? 0)))
                : undefined,
          }
        }
      }
    }
    // 旧数据或新增演示库补齐，不覆盖已有状态。
    for (const kb of KB_RECORDS) {
      if (!store[kb.name]) {
        store[kb.name] = {
          modelId: LEGACY_MODEL.id,
          modelName: LEGACY_MODEL.name,
          indexedAt: kb.createdAt,
          status: 'ready',
          docs: kb.docs,
        }
      }
    }
    return store
  } catch {
    return seedState()
  }
}

let store: IndexStore = load()
const listeners = new Set<() => void>()
let timer: number | null = null

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* 存储不可用时仅保留当前会话 */
  }
}

function emit() {
  persist()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return store
}

export function useKbIndexStates() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getKbIndexState(name: string): KbIndexState | undefined {
  return store[name]
}

function complete(entry: KbIndexState): KbIndexState {
  return {
    modelId: entry.targetModelId ?? entry.modelId,
    modelName: entry.targetModelName ?? entry.modelName,
    indexedAt: today(),
    status: 'ready',
    docs: entry.docs,
  }
}

function tick() {
  const next: IndexStore = { ...store }
  let changed = false
  for (const [name, entry] of Object.entries(store)) {
    if (entry.status !== 'rebuilding') continue
    const progress = Math.min(100, (entry.progress ?? 0) + 12)
    if (progress >= 100) {
      next[name] = complete(entry)
    } else {
      next[name] = { ...entry, progress }
    }
    changed = true
  }
  if (!changed) {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
    return
  }
  store = next
  emit()
}

function ensureTicker() {
  if (typeof window === 'undefined') return
  if (timer !== null) return
  timer = window.setInterval(tick, 520)
}

/** 新建库时登记索引快照；重复名称不覆盖已有状态 */
export function registerKbIndex(
  name: string,
  docs: number,
  model: { id: string; name: string },
) {
  if (store[name]) {
    if (store[name].docs !== docs) {
      store = { ...store, [name]: { ...store[name], docs } }
      emit()
    }
    return
  }
  store = {
    ...store,
    [name]: {
      modelId: model.id,
      modelName: model.name,
      indexedAt: today(),
      status: 'ready',
      docs,
    },
  }
  emit()
}

export type EmbeddingImpact = {
  items: Array<{ name: string; docs: number; currentModelName: string; status: IndexStatus }>
  empty: Array<{ name: string }>
  totalDocs: number
}

/** 计算切换到目标向量模型后需要重建的库 */
export function getEmbeddingImpact(targetModelId: string): EmbeddingImpact {
  const items: EmbeddingImpact['items'] = []
  const empty: EmbeddingImpact['empty'] = []
  for (const [name, entry] of Object.entries(store)) {
    if (entry.docs === 0) {
      empty.push({ name })
      continue
    }
    if (entry.modelId === targetModelId || entry.status === 'rebuilding') continue
    items.push({
      name,
      docs: entry.docs,
      currentModelName: entry.modelName,
      status: entry.status,
    })
  }
  items.sort((a, b) => b.docs - a.docs)
  return {
    items,
    empty,
    totalDocs: items.reduce((sum, item) => sum + item.docs, 0),
  }
}

/**
 * 记录一次默认向量模型切换。
 * - later：旧库标记待重建，仍按旧索引检索；
 * - now：旧库立即进入重建队列。
 */
export function queueEmbeddingMigration(
  target: { id: string; name: string },
  mode: 'later' | 'now',
) {
  const next: IndexStore = { ...store }
  let affected = 0
  for (const [name, entry] of Object.entries(store)) {
    if (entry.docs === 0) {
      // 空库还没有索引，直接跟随新默认值，不产生待重建状态。
      next[name] = { ...entry, modelId: target.id, modelName: target.name }
      continue
    }
    if (entry.modelId === target.id || entry.status === 'rebuilding') continue
    affected += 1
    next[name] = {
      ...entry,
      status: mode === 'now' ? 'rebuilding' : 'stale',
      progress: mode === 'now' ? 0 : undefined,
      targetModelId: target.id,
      targetModelName: target.name,
    }
  }
  store = next
  emit()
  if (mode === 'now' && affected > 0) ensureTicker()
  return affected
}

/** 对指定库发起重建；未显式指定目标时使用切换时记录的目标模型 */
export function startRebuild(
  names: string[],
  target?: { id: string; name: string },
) {
  const next: IndexStore = { ...store }
  let started = 0
  for (const name of names) {
    const entry = store[name]
    if (!entry || entry.status === 'rebuilding') continue
    const targetId = target?.id ?? entry.targetModelId ?? entry.modelId
    const targetName = target?.name ?? entry.targetModelName ?? entry.modelName
    if (entry.docs === 0) {
      next[name] = {
        modelId: targetId,
        modelName: targetName,
        indexedAt: today(),
        status: 'ready',
        docs: 0,
      }
      continue
    }
    next[name] = {
      ...entry,
      status: 'rebuilding',
      progress: 0,
      targetModelId: targetId,
      targetModelName: targetName,
    }
    started += 1
  }
  store = next
  emit()
  if (started > 0) ensureTicker()
  return started
}

/** 每次进入库列表时同步文档数快照，保证影响面按当前数量计算 */
export function syncKbDocs(name: string, docs: number) {
  const entry = store[name]
  if (!entry || entry.docs === docs) return
  store = { ...store, [name]: { ...entry, docs } }
  emit()
}
/**
 * 知识库分块策略与按库配置
 *
 * 平台只提供内置推荐预设与边界，不再维护可编辑的平台默认值；
 * 分块参数由库创建人在建库时选择、在「库设置」中按库调整。
 * 模型、向量化等能力仍由平台管理员统一配置且对业务用户不可见。
 */
import type { ChunkStrategyKey } from './model'

export type ChunkStrategy = {
  key: ChunkStrategyKey
  label: string
  desc: string
  size: number
  overlap: number
  recommended?: boolean
}

/** 四档切分策略及推荐默认值（与《方案设计》§4.5 对齐） */
export const CHUNK_STRATEGIES: ChunkStrategy[] = [
  {
    key: 'auto',
    label: '自动',
    desc: '按文档结构自动选择切分方式，适合大多数场景。',
    size: 512,
    overlap: 80,
    recommended: true,
  },
  {
    key: 'heading',
    label: '按标题层级',
    desc: '以 Markdown / Word 标题为边界，保留章节完整。',
    size: 768,
    overlap: 80,
  },
  {
    key: 'semantic',
    label: '按语义段落',
    desc: '以分页符、章节标记、空行为边界，适合扫描件。',
    size: 768,
    overlap: 120,
  },
  {
    key: 'fixed',
    label: '固定长度',
    desc: '按字符数硬切，适合无结构长文与日志导出。',
    size: 1024,
    overlap: 150,
  },
]

export const SIZE_MIN = 128
export const SIZE_MAX = 2048

export type KbChunk = {
  strategy: ChunkStrategyKey
  size: number
  overlap: number
}

/** 内置推荐预设，建库与「恢复推荐值」共用 */
export const DEFAULT_KB_CHUNK: KbChunk = {
  strategy: 'auto',
  size: 512,
  overlap: 80,
}

const KB_CHUNK_KEY = 'ikb-kb-chunk-v1'

type KbChunkMap = Record<string, KbChunk>

function readMap(): KbChunkMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(KB_CHUNK_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as KbChunkMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeMap(map: KbChunkMap) {
  try {
    window.localStorage.setItem(KB_CHUNK_KEY, JSON.stringify(map))
  } catch {
    /* 存储不可用时仅保留本次会话 */
  }
}

export function getStrategy(key: ChunkStrategyKey): ChunkStrategy {
  return CHUNK_STRATEGIES.find((s) => s.key === key) ?? CHUNK_STRATEGIES[0]
}

export function loadKbChunk(kbId: string): KbChunk | null {
  return readMap()[kbId] ?? null
}

export function saveKbChunk(kbId: string, chunk: KbChunk) {
  writeMap({ ...readMap(), [kbId]: chunk })
}

export function clearKbChunk(kbId: string) {
  const map = readMap()
  if (!(kbId in map)) return
  delete map[kbId]
  writeMap(map)
}
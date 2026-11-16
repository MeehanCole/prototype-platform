/**
 * 知识库解析与富化配置
 *
 * 治理口径：产品内置推荐预设（开启、3 个/块），
 * 库创建人可在「库设置 · 解析与富化」按库调整，不回溯影响已生成的内容。
 * 自动关联标签依赖标签体系、自动生成描述改为文档级操作，均不在此模型内。
 */

/** AI 问题生成：解析完成后按分块批量生成问题，用于提升召回 */
export type EnrichmentConfig = {
  questionGeneration: boolean
  /** 每个分块生成的问题数量 */
  questionCount: number
  /** 额外的问题生成要求，空串表示使用平台内置提示词 */
  questionPrompt: string
}

export const QUESTION_MIN = 1
export const QUESTION_MAX = 10
export const PROMPT_MAX = 4000

export const DEFAULT_ENRICHMENT: EnrichmentConfig = {
  questionGeneration: true,
  questionCount: 3,
  questionPrompt: '',
}

/** 按库覆盖的存储键，值为 { [kbId]: EnrichmentConfig } */
export const KB_ENRICHMENT_KEY = 'ikb-kb-enrichment-v1'

function clampCount(value: unknown): number {
  const num = Number(value)
  if (!Number.isFinite(num)) return DEFAULT_ENRICHMENT.questionCount
  return Math.min(QUESTION_MAX, Math.max(QUESTION_MIN, Math.round(num)))
}

export function normalizeEnrichment(input?: Partial<EnrichmentConfig> | null): EnrichmentConfig {
  if (!input) return { ...DEFAULT_ENRICHMENT }
  return {
    questionGeneration:
      typeof input.questionGeneration === 'boolean'
        ? input.questionGeneration
        : DEFAULT_ENRICHMENT.questionGeneration,
    questionCount: clampCount(input.questionCount),
    questionPrompt:
      typeof input.questionPrompt === 'string'
        ? input.questionPrompt.slice(0, PROMPT_MAX)
        : DEFAULT_ENRICHMENT.questionPrompt,
  }
}

function readAll(): Record<string, EnrichmentConfig> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(KB_ENRICHMENT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Partial<EnrichmentConfig>>
    const result: Record<string, EnrichmentConfig> = {}
    Object.entries(parsed).forEach(([kbId, value]) => {
      result[kbId] = normalizeEnrichment(value)
    })
    return result
  } catch {
    return {}
  }
}

/** 读取某个库的覆盖配置；未覆盖时返回 null，由调用方回落到平台默认值 */
export function loadKbEnrichment(kbId: string): EnrichmentConfig | null {
  const all = readAll()
  return all[kbId] ?? null
}

export function saveKbEnrichment(kbId: string, config: EnrichmentConfig) {
  if (typeof window === 'undefined') return
  try {
    const all = readAll()
    all[kbId] = normalizeEnrichment(config)
    window.localStorage.setItem(KB_ENRICHMENT_KEY, JSON.stringify(all))
  } catch {
    /* 存储不可用时仅保留本次会话 */
  }
}

export function clearKbEnrichment(kbId: string) {
  if (typeof window === 'undefined') return
  try {
    const all = readAll()
    delete all[kbId]
    window.localStorage.setItem(KB_ENRICHMENT_KEY, JSON.stringify(all))
  } catch {
    /* 忽略 */
  }
}
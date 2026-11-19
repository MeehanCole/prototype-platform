/**
 * 数据集存储空间（数据存储 / 数据库）配置的本地 Mock 状态
 *
 * 真实场景下，租户/项目需要先在平台侧开通数据存储空间（RustFS / S3 兼容存储桶），
 * 数据集才能被读取与上传。原型通过 localStorage 记录该开关：
 *   - 默认「已开通」，保证列表、创建、详情等既有流程可直接演示；
 *   - 将 `configured` 置为 false（或在页面 URL 上带 `?noSpace=1`）即可复现
 *     「未检测到数据集空间」的阻断提示。
 */
const SPACE_KEY = 'calspeed.storage.space.v1'

export interface StorageSpaceConfig {
  /** 当前租户/项目是否已创建数据存储空间 */
  configured: boolean
  /** 存储引擎，例如 RustFS（S3 兼容） */
  provider: string
  /** 数据桶名称 */
  bucket: string
  updatedAt: string
}

export const DEFAULT_SPACE_CONFIG: StorageSpaceConfig = {
  configured: true,
  provider: 'RustFS',
  bucket: 'datasets-pool',
  updatedAt: '2026-11-19 10:00:00',
}

/** 读取存储空间配置；无存储或解析失败时回退到默认（已开通） */
export function readSpaceConfig(): StorageSpaceConfig {
  if (typeof window === 'undefined') return DEFAULT_SPACE_CONFIG
  try {
    const raw = window.localStorage.getItem(SPACE_KEY)
    if (!raw) return DEFAULT_SPACE_CONFIG
    const parsed = JSON.parse(raw) as Partial<StorageSpaceConfig>
    return {
      configured: parsed.configured !== false,
      provider: parsed.provider ?? DEFAULT_SPACE_CONFIG.provider,
      bucket: parsed.bucket ?? DEFAULT_SPACE_CONFIG.bucket,
      updatedAt: parsed.updatedAt ?? DEFAULT_SPACE_CONFIG.updatedAt,
    }
  } catch {
    return DEFAULT_SPACE_CONFIG
  }
}

/** 覆盖写入存储空间配置 */
export function writeSpaceConfig(next: StorageSpaceConfig) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SPACE_KEY, JSON.stringify(next))
  } catch {
    // 忽略隐私模式等场景下的写入失败
  }
}

/** 是否已具备数据集空间；forceMissing 用于 URL 演示开关 */
export function isSpaceReady(forceMissing = false): boolean {
  if (forceMissing) return false
  return readSpaceConfig().configured
}

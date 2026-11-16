/**
 * 参数配置 · 知识库容量与配额
 *
 * 模型、向量库与索引属于「模型管理」，不在此处重复配置。
 * 业务用户不可见、不可选，也不在知识库创建/设置中出现。
 */

export interface PlatformConfig {
  /** 单库文档数上限（篇） */
  libraryDocLimit: number
  /** 单库存储上限（GB） */
  libraryStorageLimit: number
  /** 单文件大小上限（MB） */
  fileSizeLimit: number
  /** 单用户可创建知识库数量 */
  userLibraryLimit: number
}

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  libraryDocLimit: 5000,
  libraryStorageLimit: 50,
  fileSizeLimit: 100,
  userLibraryLimit: 20,
}

/** 兼容旧版单独存储的配额键 */
export const PLATFORM_CONFIG_KEY = 'kb.platformConfig'

export function loadPlatformConfig(): PlatformConfig {
  try {
    const raw = localStorage.getItem(PLATFORM_CONFIG_KEY)
    if (raw) return { ...DEFAULT_PLATFORM_CONFIG, ...JSON.parse(raw) }
  } catch {
    /* 忽略解析错误 */
  }
  return DEFAULT_PLATFORM_CONFIG
}

export function savePlatformConfig(config: PlatformConfig) {
  localStorage.setItem(PLATFORM_CONFIG_KEY, JSON.stringify(config))
}
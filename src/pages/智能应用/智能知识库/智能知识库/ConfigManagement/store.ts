/**
 * 参数配置 · 平台设置共享状态
 *
 * 平台只维护容量配额；分块与富化由库创建人在库内自行配置。
 * 写入 localStorage，切换页面或刷新后仍保留；不做跨标签页同步。
 */
import { useSyncExternalStore } from 'react'
import {
  DEFAULT_PLATFORM_CONFIG,
  type PlatformConfig,
} from './platform'

export type PlatformSettings = {
  /** 建库、上传与容量配额 */
  quota: PlatformConfig
}

export const PLATFORM_SETTINGS_KEY = 'ikb-platform-settings-v1'

const listeners = new Set<() => void>()

function load(): PlatformSettings {
  if (typeof window === 'undefined') {
    return { quota: DEFAULT_PLATFORM_CONFIG }
  }
  try {
    const raw = window.localStorage.getItem(PLATFORM_SETTINGS_KEY)
    if (!raw) return { quota: DEFAULT_PLATFORM_CONFIG }
    const parsed = JSON.parse(raw) as Partial<PlatformSettings>
    return { quota: { ...DEFAULT_PLATFORM_CONFIG, ...parsed.quota } }
  } catch {
    return { quota: DEFAULT_PLATFORM_CONFIG }
  }
}

let state: PlatformSettings = load()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function updatePlatformSettings(patch: Partial<PlatformSettings>) {
  state = { ...state, ...patch }
  try {
    window.localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(state))
  } catch {
    /* 存储不可用时仅保留本次会话 */
  }
  emit()
}

export function usePlatformSettings(): PlatformSettings {
  return useSyncExternalStore(subscribe, () => state, () => state)
}
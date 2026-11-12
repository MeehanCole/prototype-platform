/**
 * 功能点目录（跨页面）
 *
 * 页面里的 feature-tags.tsx 各自导出 FEATURES；这里用 Vite glob 汇总成
 * 「按业务模块分组」的只读目录，供 Host 层的「本次变更」速览面板使用。
 *
 * 这样面板不依赖页面是否已挂载，也不需要页面把状态提升到 Host：
 * 切到同模块任意页面，都能看到本轮全部简要变动点。
 */
import { pageRegistry } from '@/host/router/pageRegistry'
import type { FeatureDoc, FeatureMap } from './core'

export interface CatalogEntry {
  code: string
  doc: FeatureDoc
  /** 该功能点所属页面路由，用于「查看完整说明」时判断是否在当前页 */
  pagePath: string
}

export interface CatalogPage {
  path: string
  title: string
  entries: CatalogEntry[]
}

export interface CatalogModule {
  name: string
  pages: CatalogPage[]
  total: number
}

const featureModules = import.meta.glob('/src/pages/**/feature-tags.tsx', {
  eager: true,
}) as Record<string, { FEATURES?: FeatureMap }>

/** 取当前页面所属业务模块的变更目录；无 feature-tags 的模块返回 null */
export function getModuleCatalog(routePath: string): CatalogModule | null {
  const current = pageRegistry.find((p) => p.path === routePath)
  if (!current) return null

  const pages: CatalogPage[] = pageRegistry
    .filter((p) => p.meta.module === current.meta.module)
    .map((p) => {
      const mod = featureModules[`${p.dir}/feature-tags.tsx`]
      const features = mod?.FEATURES
      if (!features) return null
      const entries = Object.entries(features)
        .filter(([, doc]) => doc && (doc.type === '新增' || doc.type === '变更'))
        .map(([code, doc]) => ({ code, doc, pagePath: p.path }))
      if (entries.length === 0) return null
      return { path: p.path, title: p.meta.title, entries }
    })
    .filter((p): p is CatalogPage => p !== null)
    // 固定按页面注册顺序，避免切换页面时清单重排；当前页由面板自行滚动定位

  if (pages.length === 0) return null
  return {
    name: current.meta.module,
    pages,
    total: pages.reduce((n, p) => n + p.entries.length, 0),
  }
}
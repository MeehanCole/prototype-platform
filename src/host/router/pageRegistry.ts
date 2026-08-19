/**
 * pageRegistry - host core
 * auto-scan pages dir for meta.json, collect components + PRD docs, build routes + nav
 */

export interface FeatureChange {
  /** 功能点编号, 如 A.01 / B.02 / FR-1 */
  code: string
  /** 变更类型: A=重构 / B=新增 / M=修改 / R=删除 */
  type: 'A' | 'B' | 'M' | 'R'
  /** 功能点标题 */
  title: string
  /** 一句话描述 */
  desc?: string
}

export interface VersionSummary {
  /** 版本一句话摘要 */
  summary?: string
  /** 本版本相对上一版本的功能变更清单 */
  features?: FeatureChange[]
}

export type PageStatus = 'draft' | 'review' | 'accepted' | 'archived'

export interface PageMeta {
  title: string
  module: string
  /** 代码来源: ai / figma / screenshot / manual */
  source?: string
  /** 目标产品设计系统, 如 element-plus / ant-design / arco-design / naive-ui */
  designSystem?: string
  /** 页面负责人 */
  owner?: string
  /** 页面状态: draft(草稿) / review(评审中) / accepted(已验收) / archived(已归档) */
  status?: PageStatus
  /** 最后更新时间 YYYY-MM-DD */
  updatedAt?: string
  /** 页面一句话描述 */
  description?: string
  defaultVersion?: string
  versions?: string[]
  tags?: string[]
  prdFiles?: Record<string, string>
  /** 按版本的变更摘要, key 为版本名("default" 或 "v1"/"v2") */
  versionSummary?: Record<string, VersionSummary>
}

export interface PageEntry {
  /** route path, e.g. /crm/login */
  path: string
  /** dir absolute path, e.g. /src/pages/CRM/Login */
  dir: string
  /** metadata */
  meta: PageMeta
  /** default entry component loader (React.lazy compatible) */
  component: () => Promise<{ default: React.ComponentType }>
  /** versioned component loaders, key is version name like "v1" */
  versionComponents: Record<string, () => Promise<{ default: React.ComponentType }>>
  /** PRD doc content, key is version name ("default" or "v1"/"v2") */
  prdContents: Record<string, string>
}

// scan all meta.json (eager mode, collected at build time)
const metas = import.meta.glob('/src/pages/**/meta.json', { eager: true })

// scan all entry components (lazy mode, loaded on demand)
const entries = import.meta.glob('/src/pages/**/index.tsx')
const versionFiles = import.meta.glob('/src/pages/**/_versions/*.tsx')

// scan all PRD markdown (eager + raw mode, text collected at build time)
const prdRawModules = import.meta.glob('/src/pages/**/*.md', {
  eager: true,
  query: '?raw',
}) as Record<string, { default: string }>

function buildPageRegistry(): PageEntry[] {
  const pages: PageEntry[] = []

  for (const [metaPath, metaMod] of Object.entries(metas)) {
    const meta = (metaMod as { default: PageMeta }).default
    if (!meta || !meta.title || !meta.module) continue

    // derive route: /src/pages/CRM/Login/meta.json -> /crm/login
    const dir = metaPath.replace('/meta.json', '')
    const routePath = dir.replace('/src/pages', '').toLowerCase()

    // default entry component
    const entryKey = `${dir}/index.tsx`
    const component = entries[entryKey] as
      | (() => Promise<{ default: React.ComponentType }>)
      | undefined
    if (!component) continue

    // versioned components
    const versionComponents: Record<
      string,
      () => Promise<{ default: React.ComponentType }>
    > = {}
    const versionsDir = `${dir}/_versions/`
    for (const [vPath, vLoader] of Object.entries(versionFiles)) {
      if (vPath.startsWith(versionsDir)) {
        const vName = vPath.replace(versionsDir, '').replace('.tsx', '')
        versionComponents[vName] = vLoader as () => Promise<{
          default: React.ComponentType
        }>
      }
    }

    // PRD doc content
    const prdContents: Record<string, string> = {}
    for (const [prdPath, prdMod] of Object.entries(prdRawModules)) {
      if (prdPath.startsWith(dir + '/') && prdPath.endsWith('.md')) {
        const fileName = prdPath.replace(dir + '/', '').replace('.md', '')
        // prd.md -> "default", prd_v1.md -> "v1", prd_v2.md -> "v2"
        const versionKey =
          fileName === 'prd' ? 'default' : fileName.replace('prd_', '')
        prdContents[versionKey] = prdMod.default
      }
    }

    pages.push({
      path: routePath,
      dir,
      meta,
      component,
      versionComponents,
      prdContents,
    })
  }

  return pages
}

export const pageRegistry = buildPageRegistry()

/** group by module, for Sidebar rendering */
export function getPagesByModule(): Record<string, PageEntry[]> {
  const grouped: Record<string, PageEntry[]> = {}
  for (const page of pageRegistry) {
    const mod = page.meta.module
    if (!grouped[mod]) grouped[mod] = []
    grouped[mod].push(page)
  }
  return grouped
}

/** find page by route path */
export function findPageByPath(path: string): PageEntry | undefined {
  return pageRegistry.find((p) => p.path === path)
}

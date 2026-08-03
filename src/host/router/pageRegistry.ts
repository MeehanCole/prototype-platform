/**
 * pageRegistry - host core
 * auto-scan pages dir for meta.json, collect components + PRD docs, build routes + nav
 */

export interface PageMeta {
  title: string
  module: string
  defaultVersion?: string
  versions?: string[]
  tags?: string[]
  prdFiles?: Record<string, string>
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

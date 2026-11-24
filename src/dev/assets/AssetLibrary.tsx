/**
 * 开发态素材库（仅 `npm run dev`）
 *
 * 目的：素材沉淀后时间一长就忘了有哪些、长什么样、怎么用。
 * 这里把它们集中成一个可浏览、可实时预览、可复制用法、可读文档的页面。
 *
 * ⚠️ 生产隔离：
 *   - 本模块只被 App.tsx 里的 `import.meta.env.DEV` 分支以 lazy() 动态引入；
 *   - `npm run build` 时该分支被静态求值为 false，整块代码（含文档）不会进入产物；
 *   - 不要把它注册进 pageRegistry，也不要放进 src/pages。
 */
import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Boxes, FileText, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ASSETS, DOCS, type AssetEntry, type DocEntry } from './registry'
import { CodeBlock, CopyButton, MetaCard, SectionTitle } from './ui'
import {
  AiChatAvatarDemo,
  DesignTokensDemo,
  FeatureTagDemo,
  IconsDemo,
  ProductNavDemo,
  ResourceQuotaDemo,
  ShellDemo,
  TablePaginationDemo,
} from './Demos'
import { DocsView } from './DocsView'
import { SHELL_ICONS } from '@/lib/platform-shell'
import { NAV_ICONS } from '@/lib/product-nav'
import { presets } from '@/host/design-systems/presets'
import { useWorkbenchTheme } from '@/host/theme/workbenchTheme'
import reusableAssetsDoc from '../../../.skills/reusable-assets.md?raw'

// ?raw 内嵌：docs 目录用 glob，.skills 不在 docs 下，单独静态引入
const docModules = import.meta.glob('/docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const DOC_CONTENT: Record<string, string> = {
  ...docModules,
  '/.skills/reusable-assets.md': reusableAssetsDoc,
}

const ICON_COUNT = Object.keys(SHELL_ICONS).length + Object.keys(NAV_ICONS).length

export default function AssetLibrary() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')

  const selectedId = params.get('a') || ASSETS[0].id
  const select = (id: string) => setParams({ a: id })

  const kw = query.trim().toLowerCase()
  const matches = (fields: string[]) =>
    !kw || fields.join(' ').toLowerCase().includes(kw)

  const filteredAssets = ASSETS.filter((a) =>
    matches([a.name, a.summary, a.kind, ...a.tags]),
  )
  const filteredDocs = DOCS.filter((d) =>
    matches([d.name, d.summary, ...d.tags]),
  )

  const activeAsset = ASSETS.find((a) => a.id === selectedId)
  const activeDoc = DOCS.find((d) => d.id === selectedId)

  const componentAssets = filteredAssets.filter((a) => a.kind === '组件素材')
  const specAssets = filteredAssets.filter((a) => a.kind === '设计规范')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      {/* 顶部：标题 + 统计 */}
      <header className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Boxes size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-foreground">素材库</h1>
              <span className="rounded bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary">
                DEV ONLY
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              开发环境可浏览 · 正式构建不包含本页 · 素材改动请以真实页面为唯一来源
            </p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Stat value={ASSETS.length} label="素材" />
            <Stat value={ICON_COUNT} label="图标" />
            <Stat value={presets.length} label="设计系统" />
            <Stat value={DOCS.length} label="文档" />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 左侧：素材清单 */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/10">
          <div className="border-b border-border p-2">
            <label className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 focus-within:border-primary/50">
              <Search size={13} className="shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索素材 / 文档"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-2">
            <NavGroup label={`组件素材 · ${componentAssets.length}`}>
              {componentAssets.map((asset) => (
                <NavItem
                  key={asset.id}
                  active={asset.id === selectedId}
                  onClick={() => select(asset.id)}
                  icon={<Boxes size={12} />}
                  name={asset.name}
                />
              ))}
            </NavGroup>

            <NavGroup label={`设计规范 · ${specAssets.length}`}>
              {specAssets.map((asset) => (
                <NavItem
                  key={asset.id}
                  active={asset.id === selectedId}
                  onClick={() => select(asset.id)}
                  icon={<Boxes size={12} />}
                  name={asset.name}
                />
              ))}
            </NavGroup>

            <NavGroup label={`规范文档 · ${filteredDocs.length}`}>
              {filteredDocs.map((doc) => (
                <NavItem
                  key={doc.id}
                  active={doc.id === selectedId}
                  onClick={() => select(doc.id)}
                  icon={<FileText size={12} />}
                  name={doc.name}
                />
              ))}
            </NavGroup>

            {filteredAssets.length === 0 && filteredDocs.length === 0 && (
              <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
                没有匹配的素材
              </p>
            )}
          </div>

          <div className="border-t border-border px-2 py-2 text-[10px] leading-4 text-muted-foreground">
            新增素材：在
            <span className="mx-0.5 font-mono text-foreground/70">src/dev/assets/registry.ts</span>
            登记
          </div>
        </aside>

        {/* 右侧：详情 */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {activeAsset ? (
            <AssetDetail asset={activeAsset} onOpenDoc={select} />
          ) : activeDoc ? (
            <DocDetail doc={activeDoc} onBack={() => select(ASSETS[0].id)} />
          ) : (
            <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
              选择左侧的一个素材查看详情
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── 小部件 ─────────────────────────────────────────────────────────────────

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-right">
      <div className="text-sm font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItem({
  active,
  onClick,
  icon,
  name,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  name: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors',
        active
          ? 'bg-primary/10 font-medium text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded',
          active ? 'bg-primary/15 text-primary' : 'bg-muted/70 text-muted-foreground',
        )}
      >
        {icon}
      </span>
      <span className="truncate">{name}</span>
    </button>
  )
}

function AssetDemo({ id }: { id: string }) {
  switch (id) {
    case 'ai-chat-avatar':
      return <AiChatAvatarDemo />
    case 'platform-shell':
      return <ShellDemo />
    case 'product-nav':
      return <ProductNavDemo />
    case 'feature-tags':
      return <FeatureTagDemo />
    case 'icons':
      return <IconsDemo />
    case 'design-systems':
      return <DesignTokensDemo />
    case 'table-pagination':
      return <TablePaginationDemo />
    case 'resource-quota':
      return <ResourceQuotaDemo />
    default:
      return null
  }
}

function AssetDetail({
  asset,
  onOpenDoc,
}: {
  asset: AssetEntry
  onOpenDoc: (id: string) => void
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {asset.kind}
          </span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
            {asset.status === 'stable' ? '已在真实页面使用' : '可用 · 仍在演进'}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            仅开发环境
          </span>
        </div>
        <h1 className="mt-2 text-lg font-semibold text-foreground">{asset.name}</h1>
        <p className="mt-1 max-w-3xl text-[12px] leading-6 text-muted-foreground">
          {asset.summary}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetaCard label="引入路径">
          <div className="flex items-center justify-between gap-2">
            <code className="truncate font-mono text-[11.5px] text-foreground">
              {asset.importPath}
            </code>
            <CopyButton text={asset.importPath} />
          </div>
        </MetaCard>
        <MetaCard label="使用方">{asset.usage.join(' · ')}</MetaCard>
      </div>

      <section>
        <SectionTitle hint="真实组件 + 现有 preset，不是截图">实时预览</SectionTitle>
        <AssetDemo id={asset.id} />
      </section>

      <section>
        <SectionTitle hint="可直接复制到 _shared.tsx / 页面">最小接入</SectionTitle>
        <CodeBlock code={asset.snippet} />
      </section>

      {asset.docs.length > 0 && (
        <section>
          <SectionTitle>相关文档</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {asset.docs.map(({ id }) => {
              const doc = DOCS.find((d) => d.id === id)
              if (!doc) return null
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onOpenDoc(id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <FileText size={12} />
                  {doc.name}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <SectionTitle>标签</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {asset.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

function DocDetail({ doc, onBack }: { doc: DocEntry; onBack: () => void }) {
  const { theme } = useWorkbenchTheme()
  const content = DOC_CONTENT[doc.file] ?? ''

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← 返回素材库
      </button>

      <header className="mb-3">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            规范文档
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            仅开发环境
          </span>
        </div>
        <h1 className="mt-2 text-lg font-semibold text-foreground">{doc.name}</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">{doc.summary}</p>
      </header>

      <div className="rounded-lg border border-border bg-card p-5">
        <DocsView content={content} theme={theme} />
      </div>

      <p className="mt-3 text-[10px] text-muted-foreground/70">
        文档路径 {doc.file}
      </p>
    </div>
  )
}

/**
 * 开发态素材库 · 各素材的实时预览
 *
 * 预览统一使用真实素材组件 + 现有 preset（算力加速平台），确保「素材库里看到的样子」
 * 和页面里用的是同一份实现；不复制任何视觉。
 */
import { useState } from 'react'
import { CALSPEED_SHELL } from '@/lib/platform-shell/presets/calspeed'
import { PlatformHeader, SideNav, ShellIcon, SHELL_ICONS } from '@/lib/platform-shell'
import {
  ProductNav,
  NavIcon,
  NAV_ICONS,
  CALSPEED_PRODUCT_NAV,
} from '@/lib/product-nav'
import { presets } from '@/host/design-systems/presets'
import {
  DocProvider,
  DocPanel,
  FeatureBadge,
  NewTag,
  type FeatureMap,
} from '@/lib/feature-tags/core'
import { cn } from '@/lib/utils'
import { copyText } from './clipboard'
import { TablePagination } from '@/lib/table-pagination'
import { SearchBar } from '@/lib/search-bar'
import {
  ResourceQuotaBoard,
  type ResourceQuotaCluster,
} from '@/lib/resource-quota'
import aiChatAvatar from '@/assets/ai/ai-chat-avatar.png'
import {
  ProjectQuotaBoard,
  type ProjectQuotaContainerGroup,
  type ProjectQuotaInfo,
  type ProjectQuotaRow,
} from '@/lib/project-quota'

const SHELL_ROWS = CALSPEED_SHELL.rows('在线服务')

// ─── 智能对话头像 ─────────────────────────────────────────────────────────────

export function AiChatAvatarDemo() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* 素材是白底 PNG，只在浅色表面上用 multiply 预览，避免深色主题下整块变黑 */}
      <div className="flex flex-wrap items-end gap-6 rounded-md bg-[#F5F7FA] p-4">
        <div className="flex flex-col items-center gap-2">
          <img src={aiChatAvatar} alt="智能对话头像" className="h-[72px] w-[72px] object-contain mix-blend-multiply" />
          <span className="text-[11px] text-[#8a8f99]">72px · 悬浮入口</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <img src={aiChatAvatar} alt="智能对话头像" className="h-[48px] w-[48px] object-contain mix-blend-multiply" />
          <span className="text-[11px] text-[#8a8f99]">48px</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <img src={aiChatAvatar} alt="智能对话头像" className="h-[96px] w-[96px] object-contain mix-blend-multiply" />
          <span className="text-[11px] text-[#8a8f99]">96px</span>
        </div>
      </div>
      <p className="mt-4 text-[12px] leading-6 text-muted-foreground">
        素材为白底 PNG，浅色页面统一加 <code className="font-mono text-foreground">mix-blend-multiply</code> 融掉白底；
        深色背景请先准备透明底版本。
      </p>
    </div>
  )
}

// ─── 平台外壳 ────────────────────────────────────────────────────────────────

export function ShellDemo() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <PlatformHeader
        productName={CALSPEED_SHELL.productName}
        consoleLabel={CALSPEED_SHELL.consoleLabel}
        userName={CALSPEED_SHELL.userName}
        accountName={CALSPEED_SHELL.accountName}
        onNavClick={() => setNavOpen((v) => !v)}
      />

      <div className="relative flex h-[380px] overflow-hidden">
        <SideNav
          rows={SHELL_ROWS}
          tenant={CALSPEED_SHELL.tenant}
          menuTitle={CALSPEED_SHELL.menuTitle}
          onNavigate={() => setNavOpen(false)}
        />

        <div className="flex-1 overflow-hidden bg-[#f5f6f8] p-4">
          <div className="rounded-md border border-dashed border-[#d9d9d9] bg-white/60 p-4 text-[12px] leading-6 text-[#8c8c8c]">
            这是素材预览：顶栏 66px + 左侧导航 256px，菜单内容来自
            <span className="mx-1 font-mono text-[#333]">CALSPEED_SHELL</span>
            preset。点左上角 9 宫格可看产品导航面板。
          </div>
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            className="mt-3 rounded border border-[#d9d9d9] bg-white px-3 py-1.5 text-[12px] text-[#333] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
          >
            {navOpen ? '关闭' : '打开'}产品导航面板
          </button>
        </div>

        {navOpen && (
          <ProductNav
            columns={CALSPEED_PRODUCT_NAV}
            onItemClick={() => setNavOpen(false)}
            onClose={() => setNavOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

// ─── 九宫格产品导航 ──────────────────────────────────────────────────────────

export function ProductNavDemo() {
  const [open, setOpen] = useState(true)

  return (
    <div className="space-y-2">
      <div className="relative h-[560px] overflow-hidden rounded-lg border border-border bg-[#f5f6f8]">
        {open ? (
          <ProductNav
            columns={CALSPEED_PRODUCT_NAV}
            onItemClick={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded border border-[#d9d9d9] bg-white px-3 py-1.5 text-[12px] text-[#333] transition-colors hover:border-[#166eff] hover:text-[#166eff]"
            >
              打开产品导航面板
            </button>
          </div>
        )}
      </div>
      <p className="text-[11px] leading-5 text-muted-foreground">
        面板是绝对定位浮层（距左 12 / 距顶 8），实际使用时挂在「顶栏下方的
        relative 容器」里，盖住侧栏与内容区；Esc / 点外部 / 再点 9 宫格关闭。
      </p>
    </div>
  )
}

// ─── 图标集 ──────────────────────────────────────────────────────────────────

const SHELL_ICON_NAMES = Object.keys(SHELL_ICONS)
const NAV_ICON_NAMES = Object.keys(NAV_ICONS)

export function IconsDemo() {
  const [tab, setTab] = useState<'shell' | 'nav'>('shell')
  const [copied, setCopied] = useState('')

  const names = tab === 'shell' ? SHELL_ICON_NAMES : NAV_ICON_NAMES

  const copy = async (name: string) => {
    const snippet =
      tab === 'shell' ? `<ShellIcon name="${name}" />` : `<NavIcon name="${name}" />`
    if (!(await copyText(snippet))) return
    setCopied(name)
    window.setTimeout(() => setCopied((prev) => (prev === name ? '' : prev)), 1500)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-muted p-0.5">
          <button
            type="button"
            onClick={() => setTab('shell')}
            className={cn(
              'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
              tab === 'shell'
                ? 'bg-background text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            外壳图标 · {SHELL_ICON_NAMES.length}
          </button>
          <button
            type="button"
            onClick={() => setTab('nav')}
            className={cn(
              'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
              tab === 'nav'
                ? 'bg-background text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            九宫格图标 · {NAV_ICON_NAMES.length}
          </button>
        </div>
        <span className="text-[11px] text-muted-foreground">点击任一图标复制用法</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => copy(name)}
            title={`复制 <${tab === 'shell' ? 'ShellIcon' : 'NavIcon'} name="${name}" />`}
            className={cn(
              'flex items-center gap-2 rounded-md border px-2 py-2 text-left transition-colors',
              copied === name
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent',
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted/60">
              {tab === 'shell' ? (
                <ShellIcon name={name} size={18} />
              ) : (
                <NavIcon name={name} size={16} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] text-foreground">
                {copied === name ? '已复制' : name}
              </span>
              <span className="block truncate font-mono text-[9px] text-muted-foreground">
                {tab === 'shell' ? 'ShellIcon' : 'NavIcon'}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── 设计系统 token ─────────────────────────────────────────────────────────

const COLOR_KEYS = ['--color-primary', '--color-success', '--color-warning', '--color-danger'] as const

export function DesignTokensDemo() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {presets.map((preset) => (
        <div key={preset.id} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-foreground">{preset.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{preset.description}</div>
            </div>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              {preset.id}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {COLOR_KEYS.map((key) => (
              <div key={key} className="min-w-0">
                <div
                  className="h-8 rounded border border-black/5"
                  style={{ background: preset.tokens[key] }}
                />
                <div className="mt-1 truncate font-mono text-[9px] text-muted-foreground">
                  {preset.tokens[key]}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div
              className="h-8 w-8 shrink-0 border border-border bg-muted"
              style={{ borderRadius: preset.tokens['--radius-card'] }}
            />
            <div className="min-w-0 flex-1">
              <div
                className="h-8 rounded bg-card"
                style={{ boxShadow: preset.tokens['--shadow-card'] }}
              />
            </div>
            <div className="shrink-0 text-right font-mono text-[9px] leading-4 text-muted-foreground">
              r {preset.tokens['--radius-card']}
              <br />
              {preset.tokens['--font-size-base']}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <span
              className="px-2 py-1 text-[11px] font-medium text-white"
              style={{
                background: preset.tokens['--color-primary'],
                borderRadius: preset.tokens['--radius-btn'],
              }}
            >
              主按钮
            </span>
            <span
              className="border px-2 py-1 text-[11px]"
              style={{
                borderColor: preset.tokens['--color-primary'],
                color: preset.tokens['--color-primary'],
                borderRadius: preset.tokens['--radius-btn'],
              }}
            >
              次按钮
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 功能点批注 ──────────────────────────────────────────────────────────────

const DEMO_FEATURES: FeatureMap = {
  'F-01': {
    type: '新增',
    title: '团队统计卡',
    changes: ['新增团队维度的调用量统计', '支持按部门筛选'],
    rules: [{ rule: '部门为空时展示全租户', message: '请选择部门' }],
    scope: '仅团队管理员可见',
    prdRef: 'PRD 4.2.1',
    doc: `## 4.2.1 团队统计卡

展示团队近 7 天调用量、成功率与平均耗时。

- 数据延迟不超过 5 分钟
- 无数据时展示空状态`,
  },
  'M.01': {
    type: '变更',
    title: '部门筛选',
    changes: ['筛选器支持多选', '筛选结果同步到统计卡'],
    scope: '全部用户',
  },
}

export function FeatureTagDemo() {
  const [showFeat, setShowFeat] = useState(true)
  const [code, setCode] = useState<string | null>(null)

  return (
    <DocProvider showFeat={showFeat} features={DEMO_FEATURES} onOpenDoc={setCode}>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-[12px] text-foreground">
            <input
              type="checkbox"
              checked={showFeat}
              onChange={(e) => setShowFeat(e.target.checked)}
              className="rounded border-border"
            />
            显示新增功能点
          </label>
          <span className="text-[11px] text-muted-foreground">
            关闭后 NewTag 不渲染，与工作台右上角开关行为一致
          </span>
        </div>

        <div className="mt-4 rounded-md border border-border bg-background p-4">
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-foreground">
            在线服务 · 服务列表
            <NewTag code="F-01" />
            <NewTag code="M.01" compact />
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded border border-border/70 px-3 py-2 text-[12px]">
              <span className="text-foreground">qwen2.5-72b-instruct</span>
              <span className="flex items-center gap-2 text-muted-foreground">
                运行中 <NewTag code="F-01" compact />
              </span>
            </div>
            <div className="flex items-center justify-between rounded border border-border/70 px-3 py-2 text-[12px]">
              <span className="text-foreground">deepseek-v3</span>
              <span className="flex items-center gap-2 text-muted-foreground">
                已停止 <NewTag code="M.01" compact />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>独立徽标（不依赖 Context）：</span>
          <FeatureBadge type="新增" label="独立徽标" lines={['直接渲染，可用于任意位置']} />
          <FeatureBadge type="变更" label="紧凑态" compact />
        </div>
      </div>

      <DocPanel code={code} onClose={() => setCode(null)} />
    </DocProvider>
  )
}

// ─── 资源配额卡片 ────────────────────────────────────────────────────────────

const RESOURCE_QUOTA_CLUSTERS: ResourceQuotaCluster[] = [
  {
    id: 'changsha-dc-cluster',
    name: '长沙智算中心',
    code: 'changsha-dc-cluster',
    rows: [
      { key: 'cpuLimit', label: 'CPU 限制', kind: 'cpu', used: 96, quota: 128, icon: 'cpu' },
      { key: 'cpuRequest', label: 'CPU 请求', kind: 'cpu', used: 48, quota: 64, icon: null },
      { key: 'memLimit', label: '内存限制', kind: 'mem', used: 320, quota: 512, icon: 'mem' },
      { key: 'memRequest', label: '内存请求', kind: 'mem', used: 160, quota: 256, icon: null },
    ],
  },
  {
    id: 'host-cluster',
    name: '长沙实验室',
    code: 'host-cluster',
    rows: [
      { key: 'cpuLimit', label: 'CPU 限制', kind: 'cpu', used: 8, quota: null, icon: 'cpu' },
      { key: 'cpuRequest', label: 'CPU 请求', kind: 'cpu', used: 4, quota: null, icon: null },
      { key: 'memLimit', label: '内存限制', kind: 'mem', used: 32, quota: null, icon: 'mem' },
      { key: 'memRequest', label: '内存请求', kind: 'mem', used: 16, quota: null, icon: null },
    ],
  },
]

export function ResourceQuotaDemo() {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <ResourceQuotaBoard
        title="租户配额"
        description="用于管理和分配租户中所有项目的资源使用总量。"
        clusters={RESOURCE_QUOTA_CLUSTERS}
        refreshedAt="10:28"
        onRefresh={() => {}}
        onEdit={() => {}}
      />
    </div>
  )
}

// ─── 项目配额工作台 ──────────────────────────────────────────────────────────

const PROJECT_QUOTA_INFO: ProjectQuotaInfo = {
  name: 'magic-cs158',
  tenant: 'magic-cs128',
  creator: '-',
  createdAt: '2025-09-23 13:41:38',
  members: '5',
  serviceAccounts: '0',
  description: '-',
}

const PROJECT_QUOTA_CONTAINER_ROWS: ProjectQuotaRow[] = [
  { key: 'cpuRequest', label: 'CPU 请求', icon: 'cpu', unit: '核', used: null, quota: 32 },
  { key: 'cpuLimit', label: 'CPU 限制', icon: 'cpu', unit: '核', used: null, quota: 64 },
  { key: 'memRequest', label: '内存请求', icon: 'mem', unit: 'GiB', used: null, quota: 128 },
  { key: 'memLimit', label: '内存限制', icon: 'mem', unit: 'GiB', used: null, quota: 256 },
]

const PROJECT_QUOTA_ROWS: ProjectQuotaRow[] = [
  { key: 'cpuLimit', label: 'CPU 限制', icon: 'cpu', unit: '核', used: null, quota: 64 },
  { key: 'cpuRequest', label: 'CPU 请求', icon: 'cpu', unit: '核', used: null, quota: 32 },
  { key: 'pods', label: '容器组', icon: 'pod', unit: '', used: 62, quota: 100 },
  { key: 'services', label: '服务', icon: 'service', unit: '', used: 44, quota: null },
  { key: 'storage', label: '数据存储', icon: 'storage', unit: 'GB', used: null, quota: 500 },
]

const PROJECT_QUOTA_GROUPS: ProjectQuotaContainerGroup[] = [
  { key: 'cpu', label: 'CPU', icon: 'cpu', requestKey: 'cpuRequest', limitKey: 'cpuLimit' },
  { key: 'mem', label: '内存', icon: 'mem', requestKey: 'memRequest', limitKey: 'memLimit' },
]

const PROJECT_QUOTA_ICONS = {
  home: <span className="text-[13px]">⌂</span>,
  building: <span className="text-[13px]">▣</span>,
  user: <span className="text-[13px]">◎</span>,
  clock: <span className="text-[13px]">◷</span>,
  idcard: <span className="text-[13px]">▤</span>,
  notebook: <span className="text-[13px]">▥</span>,
  trash: <span className="text-[13px]">×</span>,
  resource: (kind: ProjectQuotaRow['icon']) => (
    <span className="text-[13px] text-[#4e5969]">
      {kind === 'cpu' ? '▦' : kind === 'mem' ? '▥' : kind === 'storage' ? '▣' : '▤'}
    </span>
  ),
}

export function ProjectQuotaDemo() {
  const [activeTab, setActiveTab] = useState('配额')

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <ProjectQuotaBoard
        info={PROJECT_QUOTA_INFO}
        containerRows={PROJECT_QUOTA_CONTAINER_ROWS}
        containerGroups={PROJECT_QUOTA_GROUPS}
        projectRows={PROJECT_QUOTA_ROWS}
        tabs={['资源状态', '配额', '用量统计', '元数据']}
        quotaTab="配额"
        activeTab={activeTab}
        sectionTitles={{ containerQuota: '容器配额', projectQuota: '项目配额' }}
        icons={PROJECT_QUOTA_ICONS}
        title="项目概览"
        manageItems={[
          { key: 'info', label: '编辑项目信息', icon: <span className="text-[12px]">✎</span> },
          { key: 'projectQuota', label: '编辑项目配额', icon: <span className="text-[12px]">▤</span> },
          { key: 'containerQuota', label: '编辑容器配额', icon: <span className="text-[12px]">▣</span> },
        ]}
        onTabChange={setActiveTab}
        onManageItem={() => {}}
        onDelete={() => {}}
      />
    </div>
  )
}

// ─── 表格分页 ────────────────────────────────────────────────────────────────

export function TablePaginationDemo() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [page2, setPage2] = useState(6)

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <p className="mb-3 text-[11px] text-muted-foreground">默认态 · 共 5 条</p>
        <TablePagination
          total={5}
          page={page}
          pageSize={pageSize}
          onChange={({ page: p, pageSize: s }) => {
            setPage(p)
            setPageSize(s)
          }}
        />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-[11px] text-muted-foreground">
          多页折叠态 · 当前第 {page2} 页 / 共 20 页（超过 7 页自动省略）
        </p>
        <TablePagination
          total={200}
          page={page2}
          pageSize={10}
          onChange={({ page: p }) => setPage2(p)}
        />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-[11px] text-muted-foreground">
          隐藏条数选择器 + 右侧插槽
        </p>
        <TablePagination
          total={48}
          page={1}
          pageSize={10}
          showPageSize={false}
          extra={<span className="text-[11px] text-muted-foreground">最后更新 10:28</span>}
          onChange={() => {}}
        />
      </div>

      <p className="text-[11px] leading-5 text-muted-foreground">
        当前页与条数选择器聚焦描边取 <code className="font-mono text-foreground">var(--shell-accent)</code>，
        改一个 CSS 变量即可与顶栏/侧栏一起换品牌色。
      </p>
    </div>
  )
}
// ─── 检索条 ──────────────────────────────────────────────────────────────────

export function SearchBarDemo() {
  const [plain, setPlain] = useState('')
  const [filterKeyword, setFilterKeyword] = useState('')
  const [field, setField] = useState('name')

  const card = 'rounded-[4px] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <p className="mb-3 text-[11px] text-muted-foreground">单输入形态 · 不传 fields</p>
        <div className={card}>
          <SearchBar
            value={plain}
            onChange={setPlain}
            onSearch={() => {}}
            onRefresh={() => {}}
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-[11px] text-muted-foreground">
          带过滤项形态 · 传 fields（当前字段：{field}）
        </p>
        <div className={card}>
          <SearchBar
            value={filterKeyword}
            onChange={setFilterKeyword}
            onSearch={() => {}}
            fields={[
              { label: '名称', value: 'name' },
              { label: '状态', value: 'status' },
              { label: '创建人', value: 'creator' },
            ]}
            fieldValue={field}
            onFieldChange={setField}
            placeholder="请输入"
            onRefresh={() => {}}
          />
        </div>
      </div>

      <p className="text-[11px] leading-5 text-muted-foreground">
        卡片外壳（白底 + 阴影 + 内边距）由使用方包裹，组件只负责一行控件；聚焦描边取{' '}
        <code className="font-mono text-foreground">var(--shell-accent)</code>。
      </p>
    </div>
  )
}
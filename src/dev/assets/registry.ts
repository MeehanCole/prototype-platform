/**
 * 开发态素材库 · 登记表
 *
 * 只描述「有哪些素材 / 怎么用 / 文档在哪」，不做任何渲染。
 * 新增素材时在这里加一条；需要专属预览时在 Demos.tsx 里按 id 补一个 demo。
 *
 * ⚠️ 本目录只在 `npm run dev` 生效，正式构建不会包含。
 */

export type AssetKind = '组件素材' | '设计规范'

export interface AssetDocRef {
  /** DOCS 里的 id */
  id: string
}

export interface AssetEntry {
  id: string
  kind: AssetKind
  name: string
  /** 一句话说明它是什么、解决什么问题 */
  summary: string
  /** 稳定度：stable=已在真实页面使用；beta=可用但仍在演进 */
  status: 'stable' | 'beta'
  /** 页面里的 import 路径（不是文件路径） */
  importPath: string
  /** 真实使用方，帮助判断改动影响面 */
  usage: string[]
  tags: string[]
  docs: AssetDocRef[]
  /** 最小接入代码 */
  snippet: string
}

export interface DocEntry {
  id: string
  name: string
  /** DOC_CONTENT 的 key：/docs/... 或 /.skills/... */
  file: string
  summary: string
  tags: string[]
}

export const ASSETS: AssetEntry[] = [
  {
    id: 'platform-shell',
    kind: '组件素材',
    name: '平台外壳',
    summary:
      '66px 产品顶栏 + 256px 左侧导航 + 30 个线性图标。视觉与间距已 1:1 定稿，产品差异只走 props / preset。',
    status: 'stable',
    importPath: '@/lib/platform-shell',
    usage: ['在线服务优化 · 7 个页面', '智能知识库', '智能诊断'],
    tags: ['外壳', '顶栏', '侧栏', '图标', 'preset'],
    docs: [{ id: 'doc-platform-shell' }],
    snippet: `import { PlatformHeader, SideNav, ShellIcon } from '@/lib/platform-shell'
import { CALSPEED_SHELL } from '@/lib/platform-shell/presets/calspeed'

<PlatformHeader productName="你的产品" consoleLabel={false} />

<SideNav
  rows={CALSPEED_SHELL.rows('在线服务')}
  tenant={CALSPEED_SHELL.tenant}
  menuTitle="菜单标题"
  onNavigate={(path) => navigate(path)}
/>

<ShellIcon name="book" size={20} color="#166eff" />`,
  },
  {
    id: 'product-nav',
    kind: '组件素材',
    name: '九宫格产品导航',
    summary:
      '点顶栏 9 宫格弹出的 5 列产品导航浮层：名称搜索、分组服务项、按角色过滤，整页浮层不遮挡底层页面。',
    status: 'stable',
    importPath: '@/lib/product-nav',
    usage: ['智能知识库', '产品外壳各页面'],
    tags: ['九宫格', '导航面板', '5 列', '角色可见性'],
    docs: [{ id: 'doc-product-nav' }, { id: 'doc-ai-nav' }],
    snippet: `import { ProductNav, CALSPEED_PRODUCT_NAV } from '@/lib/product-nav'

{navOpen && (
  <ProductNav
    columns={CALSPEED_PRODUCT_NAV}
    role="admin"            // admin / user
    onItemClick={() => setNavOpen(false)}
    onClose={() => setNavOpen(false)}
  />
)}`,
  },
  {
    id: 'feature-tags',
    kind: '组件素材',
    name: '功能点批注',
    summary:
      'FeatureBadge / NewTag / DocPanel 三件套：页面只维护 FEATURES 配置，批注、悬浮说明、右侧详情面板全部复用。',
    status: 'stable',
    importPath: '@/lib/feature-tags/core',
    usage: ['在线服务系列', '智能诊断', '云 API 管理', '租户门户'],
    tags: ['批注', 'PRD', 'DocPanel', '变更'],
    docs: [{ id: 'doc-assets-rule' }],
    snippet: `import { DocProvider, NewTag, DocPanel } from '@/lib/feature-tags/core'

<DocProvider showFeat={showFeat} features={FEATURES} onOpenDoc={setCode}>
  <h2>
    服务名称
    <NewTag code="F-01" />
  </h2>
  <DocPanel code={code} onClose={() => setCode(null)} />
</DocProvider>`,
  },
  {
    id: 'table-pagination',
    kind: '组件素材',
    name: '表格分页',
    summary:
      '一行式分页：共 N 条 + 每页条数 + ‹ 页码 ›。控件统一 35px 高、2px 圆角，当前页为品牌色实心方块，超过 7 页自动折叠为省略号。',
    status: 'stable',
    importPath: '@/lib/table-pagination',
    usage: ['数据集管理'],
    tags: ['分页', '页码', '每页条数', '表格'],
    docs: [{ id: 'doc-table-pagination' }],
    snippet: `import { TablePagination } from '@/lib/table-pagination'

<TablePagination
  total={filtered.length}
  page={page}
  pageSize={pageSize}
  onChange={({ page: nextPage, pageSize: nextSize }) => {
    setPageSize(nextSize)
    setPage(nextPage)
  }}
/>`,
  },
  {
    id: 'search-bar',
    kind: '组件素材',
    name: '检索条',
    summary:
      '组合式检索条：输入框 + 后置放大镜 + 刷新按钮；传 fields 即带前置字段下拉（名称/状态…），不传为单输入。高 32px、4px 圆角、灰底 addon。',
    status: 'beta',
    importPath: '@/lib/search-bar',
    usage: ['素材库预览（待接入列表页工具栏）'],
    tags: ['检索', '搜索', '筛选', '字段下拉', '刷新'],
    docs: [{ id: 'doc-search-bar' }],
    snippet: `import { SearchBar } from '@/lib/search-bar'

<SearchBar
  value={keyword}
  onChange={setKeyword}
  onSearch={() => setPage(1)}
  onRefresh={reload}
/>

// 带过滤项
<SearchBar
  value={keyword}
  onChange={setKeyword}
  onSearch={() => setPage(1)}
  fields={[{ label: '名称', value: 'name' }, { label: '状态', value: 'status' }]}
  fieldValue={field}
  onFieldChange={setField}
  placeholder="请输入"
/>`,
  },
  {
    id: 'resource-quota',
    kind: '组件素材',
    name: '资源配额卡片',
    summary:
      '「资源类型 / 已使用 / 配额 / 余量」四列表格与集群卡片：支持不限制形态、80% 用量告警、刷新与编辑入口，业务只传数据和回调。',
    status: 'stable',
    importPath: '@/lib/resource-quota',
    usage: ['租户配额（隐藏页）'],
    tags: ['配额', '集群', 'CPU', '内存', '表格', '卡片'],
    docs: [{ id: 'doc-resource-quota' }],
    snippet: `import {
  ResourceQuotaBoard,
  type ResourceQuotaCluster,
} from '@/lib/resource-quota'

const clusters: ResourceQuotaCluster[] = [
  {
    id: 'cluster-a',
    name: '长沙智算中心',
    code: 'changsha-dc-cluster',
    rows: [
      { key: 'cpuLimit', label: 'CPU 限制', kind: 'cpu', used: 96, quota: 128 },
      { key: 'cpuRequest', label: 'CPU 请求', kind: 'cpu', used: 48, quota: 64 },
      { key: 'memLimit', label: '内存限制', kind: 'mem', used: 320, quota: 512 },
      { key: 'memRequest', label: '内存请求', kind: 'mem', used: 160, quota: 256 },
    ],
  },
]

<ResourceQuotaBoard
  title="资源配额"
  clusters={clusters}
  onRefresh={() => console.log('refresh')}
  onEdit={(cluster) => console.log(cluster.id)}
/>`,
  },
  {
    id: 'project-quota',
    kind: '组件素材',
    name: '项目配额工作台',
    summary:
      '项目概览的配额视图：基本信息卡、Tab、容器配额与项目配额长条卡片。业务数据、图标、管理菜单与弹窗全部由 props 注入。',
    status: 'stable',
    importPath: '@/lib/project-quota',
    usage: ['数据管理 · 项目配额'],
    tags: ['项目配额', '容器配额', '长条卡片', '工作台'],
    docs: [{ id: 'doc-project-quota' }],
    snippet: `import {
  ProjectQuotaBoard,
  type ProjectQuotaInfo,
  type ProjectQuotaRow,
  type ProjectQuotaContainerGroup,
} from '@/lib/project-quota'

<ProjectQuotaBoard
  info={info}
  containerRows={containerRows}
  containerGroups={containerGroups}
  projectRows={projectRows}
  tabs={['资源状态', '配额', '用量统计', '元数据']}
  quotaTab="配额"
  activeTab={activeTab}
  sectionTitles={{ containerQuota: '容器配额', projectQuota: '项目配额' }}
  icons={icons}
  title="项目概览"
  manageItems={manageItems}
  onTabChange={setActiveTab}
  onManageItem={openDialog}
  onDelete={openDeleteDialog}
/>`,
  },
  {
    id: 'icons',
    kind: '设计规范',
    name: '图标集',
    summary:
      '外壳 30 个 21×21 线性图标（strokeWidth 1.5）+ 九宫格图标 key 表。图标只写名字，不引第三方图标库打断风格。',
    status: 'stable',
    importPath: '@/lib/platform-shell · @/lib/product-nav',
    usage: ['平台外壳', '九宫格产品导航'],
    tags: ['图标', '线性', 'ShellIcon', 'NavIcon'],
    docs: [{ id: 'doc-platform-shell' }, { id: 'doc-product-nav' }],
    snippet: `import { ShellIcon, SHELL_ICONS } from '@/lib/platform-shell'
import { NavIcon, NAV_ICONS } from '@/lib/product-nav'

<ShellIcon name="book" size={20} color="#166eff" />
<NavIcon name="Library" size={16} />`,
  },
  {
    id: 'ai-chat-avatar',
    kind: '设计规范',
    name: '智能对话头像',
    summary:
      '蓝色对话气泡机器人头像（112×112 PNG，白底）。用于悬浮对话入口与 AI 助手品牌位；接入浅色页面时用 mix-blend-multiply 融掉白底。',
    status: 'beta',
    importPath: '@/assets/ai/ai-chat-avatar.png',
    usage: ['智能知识库 · 悬浮对话入口（默认半收起，可拖动吸附左右边缘）'],
    tags: ['头像', 'AI', '对话', '悬浮入口', 'PNG'],
    docs: [],
    snippet: `import aiChatAvatar from '@/assets/ai/ai-chat-avatar.png'

<img
  src={aiChatAvatar}
  alt="智能对话"
  className="h-[72px] w-[72px] object-contain mix-blend-multiply"
/>`,
  },
  {
    id: 'design-systems',
    kind: '设计规范',
    name: '设计系统 Token',
    summary:
      '5 套设计系统的颜色 / 圆角 / 阴影 token（Default、Element Plus、Ant Design、Arco、Naive UI），页面通过 meta.designSystem 声明目标。',
    status: 'stable',
    importPath: '@/host/design-systems/presets',
    usage: ['设计系统切换器', 'meta.json · designSystem 字段'],
    tags: ['token', '主题', 'Element Plus', 'Ant Design', 'Arco', 'Naive UI'],
    docs: [],
    snippet: `import { useDesignSystem } from '@/host/design-systems/useDesignSystem'

const { current, presets, switchTo } = useDesignSystem()

<button onClick={() => switchTo('element-plus')}>
  {current.name}
</button>`,
  },
]

export const DOCS: DocEntry[] = [
  {
    id: 'doc-platform-shell',
    name: '平台外壳素材',
    file: '/docs/PlatformShell/平台外壳素材.md',
    summary: '组成、视觉规格表、最小接入、换品牌色与注意事项',
    tags: ['外壳', '规格'],
  },
  {
    id: 'doc-product-nav',
    name: '产品导航面板',
    file: '/docs/ProductNav/产品导航面板.md',
    summary: '九宫格面板的 5 列规格、数据形态、角色可见性与接入示例',
    tags: ['九宫格', '规格'],
  },
  {
    id: 'doc-ai-nav',
    name: '智能中心信息架构',
    file: '/docs/ProductNav/智能中心信息架构.md',
    summary: '智能中心前台 / 后台的导航归类依据',
    tags: ['导航', '信息架构'],
  },
  {
    id: 'doc-table-pagination',
    name: '表格分页素材',
    file: '/docs/TablePagination/表格分页.md',
    summary: '一行式分页的视觉规格表、页码折叠规则、props 清单与换品牌色方法',
    tags: ['分页', '规格'],
  },
  {
    id: 'doc-search-bar',
    name: '检索条素材',
    file: '/docs/SearchBar/检索条.md',
    summary: '两种形态、视觉规格表、props 清单与最小接入',
    tags: ['检索', '规格'],
  },
  {
    id: 'doc-resource-quota',
    name: '资源配额卡片素材',
    file: '/docs/ResourceQuota/资源配额素材.md',
    summary: '组成、视觉规格、props 清单、最小接入与变更规则',
    tags: ['配额', '规格'],
  },
  {
    id: 'doc-project-quota',
    name: '项目配额工作台素材',
    file: '/docs/ProjectQuota/项目配额素材.md',
    summary: '组成、视觉规格、props 清单、最小接入与变更规则',
    tags: ['项目配额', '规格'],
  },
  {
    id: 'doc-assets-rule',
    name: '可复用素材规范',
    file: '/.skills/reusable-assets.md',
    summary: '什么时候该抽素材、放哪里、抽取步骤、硬约束与自检清单',
    tags: ['规范', '流程'],
  },
]

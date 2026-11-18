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
    id: 'doc-assets-rule',
    name: '可复用素材规范',
    file: '/.skills/reusable-assets.md',
    summary: '什么时候该抽素材、放哪里、抽取步骤、硬约束与自检清单',
    tags: ['规范', '流程'],
  },
]

/**
 * 平台外壳素材（通用件）
 *
 * 一份从「算力加速平台」1:1 还原页面里抽出来的产品外壳：
 *   顶栏 PlatformHeader（66px）+ 左侧导航 SideNav（256px）+ 线性图标集 ShellIcon
 *   + 9 宫格产品导航面板 ProductNav（独立素材 src/lib/product-nav，此处兼容再导出）。
 *
 * 设计约束：
 *   - 本目录只放结构与视觉，不放任何具体产品的菜单数据；
 *     菜单通过 `rows` 传入，品牌/租户/文案通过 props 传入。
 *   - 不依赖 react-router：跳转一律走 `onNavigate(path)` 回调。
 *   - 主题色统一取 CSS 变量 `--shell-accent`（定义在 src/index.css）。
 *
 * 用法见 docs/PlatformShell/平台外壳素材.md。
 */
export { PlatformHeader } from './PlatformHeader'
export type { PlatformHeaderProps } from './PlatformHeader'
export { SideNav } from './SideNav'
export type { SideNavProps } from './SideNav'
// 面板已抽成独立素材 src/lib/product-nav，这里再导出以兼容旧路径
export { ProductNav } from '../product-nav'
export type { ProductNavProps } from '../product-nav'
export { NavIcon, NAV_ICONS } from '../product-nav'
export { ShellIcon, SHELL_ICONS } from './icons'
export type {
  ShellNavLevel,
  ShellNavRow,
  ShellTenant,
  PlatformShellPreset,
  ShellPanelItem,
  ShellPanelGroup,
  ShellPanelSection,
  ShellPanelColumn,
  ShellPanelPreset,
} from './types'
/** 「算力加速平台」完整预设，可作为新产品的复制起点 */
export { CALSPEED_SHELL } from './presets/calspeed'
export { CALSPEED_PRODUCT_NAV } from '../product-nav'
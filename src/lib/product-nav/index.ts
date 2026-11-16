/**
 * 产品导航面板素材（通用件）
 *
 * 从「算力加速平台」1:1 还原页面里抽出的 9 宫格产品导航弹层：
 * 顶栏 9 宫格触发 → 5 列等宽浮层 + 名称搜索 + 分组服务项 + 图标集。
 *
 * 设计约束：
 *   - 组件内不出现任何产品文案，菜单数据全部通过 `columns`（preset）传入；
 *   - 不依赖 react-router：点击服务项只回调 `onItemClick(item)`，跳转由使用方决定；
 *   - 关闭行为：Esc / 点面板外 / 再次点 9 宫格，由使用方控制 `onClose`；
 *   - 图标只写 key（如 `'Gauge'`），未知 key 兜底显示灰色 X。
 *
 * 用法见 docs/ProductNav/产品导航面板.md；示例数据见 presets/calspeedNav。
 */
export { ProductNav } from './ProductNav'
export type { ProductNavProps, ProductNavRole } from './ProductNav'
export { NavIcon, NAV_ICONS } from './icons'
export type {
  ShellPanelItem,
  ShellPanelGroup,
  ShellPanelSection,
  ShellPanelColumn,
  ShellPanelPreset,
  ShellPanelVisibility,
} from './types'
/** 「算力加速平台」五列预设，可直接作为新产品导航的复制起点 */
export { CALSPEED_PRODUCT_NAV } from './presets/calspeedNav'

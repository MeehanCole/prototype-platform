/**
 * 平台外壳数据类型（通用件）
 */

/** 菜单层级：1=产品级，2=需求级，3=页面级 */
export type ShellNavLevel = 1 | 2 | 3

export type ShellNavRow =
  /** 分组小标题（灰字，不可点） */
  | { kind: 'section'; label: string }
  /** 菜单行 */
  | {
      kind: 'item' | 'group' | 'sub'
      label: string
      /** 对应 SHELL_ICONS 的 key */
      icon?: string
      lvl?: ShellNavLevel
      /** 当前页高亮（由 preset 依 activeKey 计算，不要在组件里写死） */
      active?: boolean
      /** group 行展开态箭头 */
      chevron?: 'up' | 'down'
      /** 点击跳转路由；不传则不可跳转 */
      path?: string
      /** 覆盖跳转行为（默认走 onNavigate） */
      onClick?: () => void
    }

export interface ShellTenant {
  /** 节点名，超长自行截断为「长沙…」 */
  node: string
  /** 租户 / 工作空间名 */
  workspace: string
}

/** 一套完整的产品外壳配置，可整份抽出来复用 */
export interface PlatformShellPreset {
  productName: string
  /** 顶栏左侧次按钮文案 */
  consoleLabel?: string
  /** 顶栏右侧当前用户显示名 */
  userName?: string
  /** 顶栏右侧账号名 */
  accountName?: string
  /** 侧边栏顶部租户胶囊 */
  tenant?: ShellTenant
  /** 侧边栏菜单标题，如「算网服务」 */
  menuTitle?: string
  /** 按 activeKey 生成菜单行（展开态 / 高亮依赖当前页） */
  rows: (activeKey?: string) => ShellNavRow[]
}
/**
 * 九宫格产品导航面板的类型已随面板迁至 src/lib/product-nav/types，
 * 这里再导出保持旧引用可用。
 */
export type {
  ShellPanelItem,
  ShellPanelGroup,
  ShellPanelSection,
  ShellPanelColumn,
  ShellPanelPreset,
} from '../product-nav/types'

/**
 * 产品导航面板（9 宫格弹层）数据结构
 *
 * 只描述"有哪些栏 / 哪些产品 / 哪些分组 / 哪些服务"，
 * 几何、配色、交互全部在 ProductNav 组件内，产品文案只在 preset 里。
 */

/**
 * 可见性：不填 = 所有已登录用户可见；'admin' = 仅平台管理员可见
 *
 * 只做「导航层面」的显隐，真正的鉴权仍由路由守卫兜底；
 * 过滤在 ProductNav 内完成，过滤后为空的分组/产品整块不渲染。
 */
export type ShellPanelVisibility = 'admin'

/** 面板内的一个服务项（二级菜单） */
export interface ShellPanelItem {
  label: string
  /** 对应 NAV_ICONS 的 key（lucide 图标名） */
  icon: string
  /** 角色可见性，默认全员可见 */
  visibleTo?: ShellPanelVisibility
}

/** 面板内的分组（带蓝色圆点的灰字小标题）；没有 label 则是产品级直挂项 */
export interface ShellPanelGroup {
  label?: string
  items: ShellPanelItem[]
  /** 角色可见性，默认全员可见 */
  visibleTo?: ShellPanelVisibility
}

/** 面板内的一栏内容，通常对应一个产品；同栏可上下堆叠多个产品 */
export interface ShellPanelSection {
  title: string
  icon: string
  groups: ShellPanelGroup[]
}

/** 产品导航面板的一列 */
export interface ShellPanelColumn {
  sections: ShellPanelSection[]
}

/** 产品导航面板预设：5 列等宽，栏内按产品分段 */
export type ShellPanelPreset = ShellPanelColumn[]

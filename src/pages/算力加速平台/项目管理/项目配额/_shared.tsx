/**
 * 「项目配额」页面的产品外壳（薄适配层）
 *
 * 外壳视觉一律复用 src/lib/platform-shell（顶栏 66px / 侧栏 256px / 菜单行高 40px）；
 * 菜单内容取自设计稿的项目级导航：
 *   标题「项目管理」：总览 / 项目成员 / 服务账户
 *   分组「授权管理」：项目角色 / 角色授权 / 授权资源池
 *   分组「项目设置」：项目网关 / 日志收集
 *
 * 本页等价于「项目概览 → 配额 Tab」，因此高亮「总览」，与设计稿一致。
 */
import { useNavigate } from 'react-router-dom'
import {
  PlatformHeader as ShellHeader,
  SideNav as ShellSideNav,
} from '@/lib/platform-shell'
import { CALSPEED_SHELL } from '@/lib/platform-shell/presets/calspeed'
import type { ShellNavRow } from '@/lib/platform-shell'

/** 当前页路由（项目概览的「配额」视图） */
const PAGE_PATH = '/算力加速平台/项目管理/项目配额'

function buildRows(activeKey?: string): ShellNavRow[] {
  const rows: ShellNavRow[] = [
    {
      kind: 'item',
      label: '总览',
      icon: 'overview',
      lvl: 2,
      active: activeKey === '总览',
      path: PAGE_PATH,
    },
    { kind: 'item', label: '项目成员', icon: 'message', lvl: 2 },
    { kind: 'item', label: '服务账户', icon: 'loginbox', lvl: 2 },
    { kind: 'section', label: '授权管理' },
    { kind: 'item', label: '项目角色', icon: 'key', lvl: 2 },
    { kind: 'item', label: '角色授权', icon: 'percent', lvl: 2 },
    { kind: 'item', label: '授权资源池', icon: 'containers', lvl: 2 },
    { kind: 'section', label: '项目设置' },
    { kind: 'item', label: '项目网关', icon: 'apicloud', lvl: 2 },
    { kind: 'item', label: '日志收集', icon: 'library', lvl: 2 },
  ]
  return rows
}

export function PlatformHeader() {
  const shell = CALSPEED_SHELL
  return (
    <ShellHeader
      productName={shell.productName}
      consoleLabel={shell.consoleLabel}
      userName={shell.userName}
      accountName={shell.accountName}
    />
  )
}

export function SideNav({ activeKey = '总览' }: { activeKey?: string }) {
  const navigate = useNavigate()
  const shell = CALSPEED_SHELL
  return (
    <ShellSideNav
      rows={buildRows(activeKey)}
      tenant={shell.tenant}
      menuTitle="项目管理"
      onNavigate={navigate}
    />
  )
}

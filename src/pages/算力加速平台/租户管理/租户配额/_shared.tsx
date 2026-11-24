/**
 * 「租户配额」页面的产品外壳（薄适配层）
 *
 * 外壳本体复用 src/lib/platform-shell，视觉一律走通用件（顶栏 66px / 侧栏 256px / 菜单行高 40px），
 * 本文件只负责把设计稿里的「租户管理」菜单内容喂给 SideNav。
 *
 * 菜单：总览 / 项目管理 / 租户配额 / 授权集群 / 租户成员 / 租户角色（一级，无分组小标题）。
 * 其它菜单页暂未建页面，因此只给「租户配额」配 path，其余项不可跳转。
 */
import { useNavigate } from 'react-router-dom'
import {
  PlatformHeader as ShellHeader,
  SideNav as ShellSideNav,
} from '@/lib/platform-shell'
import { CALSPEED_SHELL } from '@/lib/platform-shell/presets/calspeed'
import type { ShellNavRow } from '@/lib/platform-shell'

/** 当前页路由 */
const PAGE_PATH = '/算力加速平台/租户管理/租户配额'

function buildRows(activeKey?: string): ShellNavRow[] {
  const rows: ShellNavRow[] = [
    { kind: 'item', label: '总览', icon: 'overview', lvl: 1 },
    { kind: 'item', label: '项目管理', icon: 'containers', lvl: 1 },
    {
      kind: 'item',
      label: '租户配额',
      icon: 'percent',
      lvl: 1,
      active: activeKey === '租户配额',
      path: PAGE_PATH,
    },
    { kind: 'item', label: '授权集群', icon: 'hosts', lvl: 1 },
    { kind: 'item', label: '租户成员', icon: 'message', lvl: 1 },
    { kind: 'item', label: '租户角色', icon: 'loginbox', lvl: 1 },
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

export function SideNav({ activeKey = '租户配额' }: { activeKey?: string }) {
  const navigate = useNavigate()
  const shell = CALSPEED_SHELL
  return (
    <ShellSideNav
      rows={buildRows(activeKey)}
      tenant={shell.tenant}
      menuTitle="租户管理"
      onNavigate={navigate}
    />
  )
}

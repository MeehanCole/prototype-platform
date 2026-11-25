/**
 * 「项目配额」页面的产品外壳（薄适配层）
 *
 * 外壳本体复用 src/lib/platform-shell，本文件只负责：
 *   1. 在「算力加速平台」预设基础上，往菜单里补一条「项目配额」；
 *   2. 把 react-router 的 navigate 注入给 SideNav。
 *
 * 不修改共享预设 CALSPEED_SHELL，避免其它页面菜单被连带改动。
 */
import { useNavigate } from 'react-router-dom'
import {
  PlatformHeader as ShellHeader,
  SideNav as ShellSideNav,
} from '@/lib/platform-shell'
import { CALSPEED_SHELL } from '@/lib/platform-shell/presets/calspeed'
import type { ShellNavRow } from '@/lib/platform-shell'

const PAGE_PATH = '/算力加速平台/数据管理/项目配额'

/** 在「基础资源」分组末尾插入「项目配额」菜单项 */
function buildRows(activeKey?: string): ShellNavRow[] {
  const rows = CALSPEED_SHELL.rows(activeKey)
  const entry: ShellNavRow = {
    kind: 'item',
    label: '项目配额',
    icon: 'repo',
    lvl: 2,
    active: activeKey === '项目配额',
    path: PAGE_PATH,
  }
  const sectionIndex = rows.findIndex(
    (row) => row.kind === 'section' && row.label === '基础资源',
  )
  if (sectionIndex < 0) return [...rows, entry]
  const nextSectionIndex = rows.findIndex(
    (row, i) => i > sectionIndex && row.kind === 'section',
  )
  const insertAt = nextSectionIndex < 0 ? rows.length : nextSectionIndex
  return [...rows.slice(0, insertAt), entry, ...rows.slice(insertAt)]
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

export function SideNav({ activeKey = '项目配额' }: { activeKey?: string }) {
  const navigate = useNavigate()
  const shell = CALSPEED_SHELL
  return (
    <ShellSideNav
      rows={buildRows(activeKey)}
      tenant={shell.tenant}
      menuTitle={shell.menuTitle}
      onNavigate={navigate}
    />
  )
}

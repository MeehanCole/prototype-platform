/**
 * 「数据集管理」相关页面的产品外壳（薄适配层）
 *
 * 外壳本体复用 src/lib/platform-shell，本文件只负责：
 *   1. 在「基础资源」分组内插入数据集管理条目；
 *   2. 为「算力评测」分组下的性能评估条目补上跳转与选中态；
 *   3. 把 react-router 的 navigate 注入给 SideNav。
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

const DATASET_PATH = '/算力加速平台/数据管理/数据集管理'
const PERF_PATH = '/算力加速平台/数据管理/性能评估'

/** 在「基础资源」分组末尾插入数据集管理，并给「算力评测」下的性能评估补跳转 */
function buildRows(activeKey?: string): ShellNavRow[] {
  const baseRows = CALSPEED_SHELL.rows(activeKey)

  const rows = baseRows.map((row) =>
    row.kind === 'item' && row.label === '性能评估'
      ? { ...row, path: PERF_PATH, active: activeKey === '性能评估' }
      : row,
  )

  const entries: ShellNavRow[] = [
    {
      kind: 'item',
      label: '数据集管理',
      icon: 'repo',
      lvl: 2,
      active: activeKey === '数据集管理',
      path: DATASET_PATH,
    },
  ]
  const sectionIndex = rows.findIndex(
    (row) => row.kind === 'section' && row.label === '基础资源',
  )
  if (sectionIndex < 0) return [...rows, ...entries]
  const nextSectionIndex = rows.findIndex(
    (row, i) => i > sectionIndex && row.kind === 'section',
  )
  const insertAt = nextSectionIndex < 0 ? rows.length : nextSectionIndex
  return [...rows.slice(0, insertAt), ...entries, ...rows.slice(insertAt)]
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

export function SideNav({ activeKey = '数据集管理' }: { activeKey?: string }) {
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
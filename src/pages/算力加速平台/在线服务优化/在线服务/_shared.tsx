/**
 * 「在线服务」系列页面的产品外壳（薄适配层）
 *
 * 外壳本体已抽到 src/lib/platform-shell，本文件只负责：
 *   1. 套用「算力加速平台」预设（CALSPEED_SHELL）；
 *   2. 把 react-router 的 navigate 注入给 SideNav。
 *
 * 页面里的 import 保持不变：`import { PlatformHeader, SideNav } from '../_shared'`。
 * 新页面请直接用 src/lib/platform-shell，不要再复制外壳实现。
 */
import { useNavigate } from 'react-router-dom'
import { PlatformHeader as ShellHeader, SideNav as ShellSideNav } from '@/lib/platform-shell'
import { CALSPEED_SHELL } from '@/lib/platform-shell/presets/calspeed'

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

export function SideNav({ activeKey = '在线服务' }: { activeKey?: string }) {
  const navigate = useNavigate()
  const shell = CALSPEED_SHELL
  return (
    <ShellSideNav
      rows={shell.rows(activeKey)}
      tenant={shell.tenant}
      menuTitle={shell.menuTitle}
      onNavigate={navigate}
    />
  )
}
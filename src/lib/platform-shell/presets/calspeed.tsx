/**
 * 「算力加速平台」外壳预设
 *
 * 这是 1:1 还原态的一份完整配置，可作为新原型外壳的复制起点：
 *   - 视觉（顶栏 / 侧栏 / 图标 / 间距）全部来自通用件，不要改；
 *   - 换产品时复制本文件，改 productName / tenant / menuTitle / rows 即可。
 *
 * 菜单路径使用真实路由（dir 转小写），确保点击可跳转。
 */
import type { PlatformShellPreset, ShellNavRow } from '../types'

export const CALSPEED_SHELL: PlatformShellPreset = {
  productName: '算力加速平台',
  consoleLabel: '管理工作台',
  userName: '张虎测试',
  accountName: 'admin',
  tenant: { node: '长沙…', workspace: 'zhan…' },
  menuTitle: '算网服务',
  rows: (activeKey = '在线服务'): ShellNavRow[] => [
    { kind: 'item', label: '快速入门', icon: 'book', lvl: 1 },
    { kind: 'item', label: '总览', icon: 'overview', lvl: 1 },
    { kind: 'section', label: '弹性算力' },
    { kind: 'sub', label: '容器实例', icon: 'containers', lvl: 2 },
    { kind: 'sub', label: '主机实例', icon: 'hosts', lvl: 2 },
    { kind: 'sub', label: '裸金属实例', icon: 'baremetal', lvl: 2 },
    { kind: 'section', label: '模型服务' },
    { kind: 'item', label: '模型广场', icon: 'plaza', lvl: 2 },
    { kind: 'item', label: '模型仓库', icon: 'repo', lvl: 2 },
    {
      kind: 'group',
      label: '推理服务',
      icon: 'infer',
      lvl: 2,
      chevron: activeKey === '在线服务' ? 'up' : 'down',
    },
    { kind: 'sub', label: '推理实例', icon: 'layers', lvl: 3 },
    {
      kind: 'sub',
      label: '在线服务',
      icon: 'gem',
      lvl: 3,
      active: activeKey === '在线服务',
      path: '/算力加速平台/在线服务优化/在线服务',
    },
    {
      kind: 'item',
      label: '模型体验',
      icon: 'exp',
      lvl: 2,
      active: activeKey === '模型体验',
      path: '/算力加速平台/在线服务优化/模型体验',
    },
    {
      kind: 'group',
      label: 'API 管理',
      icon: 'apicloud',
      lvl: 2,
      chevron: activeKey === 'API Key' ? 'up' : 'down',
    },
    {
      kind: 'sub',
      label: 'API Key',
      icon: 'key',
      lvl: 3,
      active: activeKey === 'API Key',
      path: '/算力加速平台/在线服务优化/apikey',
    },
    { kind: 'sub', label: '用量统计', icon: 'usage', lvl: 3 },
    { kind: 'sub', label: '模型调用分析', icon: 'link', lvl: 3 },
    { kind: 'section', label: '基础资源' },
    { kind: 'item', label: '存储管理', icon: 'hdd', lvl: 2 },
    { kind: 'item', label: '镜像管理', icon: 'mirror', lvl: 2 },
    { kind: 'section', label: '算力评测' },
    { kind: 'item', label: '算力评估', icon: 'percent', lvl: 2 },
    { kind: 'item', label: '性能评估', icon: 'wave', lvl: 2 },
  ],
}
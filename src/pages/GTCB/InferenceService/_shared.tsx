/**
 * 算力加速平台-弹性扩缩容 - 平台外壳 (1:1 还原)
 * 顶栏 + 左侧两级导航；约束: 根 h-[calc(100vh-68px)]，顶栏 shrink-0，内容区内部滚动
 */
import type { ComponentType, ReactNode } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  Box,
  ChevronDown,
  ChevronRight,
  Cloud,
  Cog,
  Copy,
  Database,
  Disc,
  Globe,
  HardDrive,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Lock,
  MonitorPlay,
  MousePointer2,
  PanelLeftClose,
  Server,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const BLUE = '#1668ff'

interface NavItem {
  label: string
  icon?: ComponentType<{ size?: number | string; className?: string }>
  active?: boolean
  chevron?: 'down' | 'right'
  indent?: boolean
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    label: '算力平台',
    items: [
      { label: '快速入门', icon: LayoutList },
      { label: '总览', icon: LayoutDashboard },
      { label: '弹性算力', icon: Cog, chevron: 'down' },
      { label: '容器实例', icon: Box, indent: true },
      { label: '主机实例', icon: Server, indent: true },
      { label: '裸金属实例', icon: Database, indent: true },
      { label: '模型服务', icon: Cog, chevron: 'down' },
      { label: '模型广场', icon: Sparkles, indent: true },
      { label: '私有模型', icon: Lock, indent: true },
      { label: '推理服务', icon: Cog, indent: true, active: true },
      { label: '在线服务', icon: MonitorPlay, indent: true },
      { label: '模型体验', icon: MousePointer2, indent: true },
      { label: 'API 管理', icon: Cloud, indent: true, chevron: 'right' },
      { label: '模型链路分析', icon: Workflow, indent: true },
    ],
  },
  {
    label: '基础资源',
    items: [
      { label: '存储管理', icon: HardDrive },
      { label: '镜像管理', icon: Disc },
    ],
  },
  {
    label: '算力评测',
    items: [
      { label: '算力评估', icon: BarChart3 },
      { label: '性能评估', icon: Activity },
    ],
  },
]

/** 顶栏 */
export function TopBar() {
  return (
    <header className="shrink-0 h-11 border-b border-[#e5e6eb] bg-white flex items-center px-3 gap-3">
      {/* 左: logo + 产品名 + 管理工作台 */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-[#1668ff] flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-white">G</span>
        </div>
        <span className="text-[14px] font-semibold text-[#1f2329] whitespace-nowrap">
          算力加速平台-弹性扩缩容
        </span>
        <button className="ml-1 h-7 px-2 flex items-center gap-1.5 rounded-[2px] border border-[#d9dce3] text-[12px] text-[#1f2329] hover:border-[#1668ff] hover:text-[#1668ff]">
          <LayoutGrid size={13} />
          管理工作台
        </button>
      </div>

      {/* 右: 语言 / 租户 / 用户 */}
      <div className="ml-auto flex items-center gap-3 shrink-0 text-[12px] text-[#1f2329]">
        <button className="flex items-center gap-1 hover:text-[#1668ff]">
          <Globe size={14} className="text-[#646a73]" />
          中文
          <ChevronDown size={12} className="text-[#8f959e]" />
        </button>
        <button className="flex items-center gap-1 hover:text-[#1668ff]">
          <Bell size={14} className="text-[#646a73]" />
          测试租户
          <ChevronDown size={12} className="text-[#8f959e]" />
        </button>
        <button className="flex items-center gap-1.5 hover:text-[#1668ff]">
          <span className="w-6 h-6 rounded-full bg-[#d6e4ff] text-[#1668ff] text-[10px] font-medium flex items-center justify-center">
            ad
          </span>
          admin
          <ChevronDown size={12} className="text-[#8f959e]" />
        </button>
      </div>
    </header>
  )
}

/** 左侧导航 */
export function SideNav() {
  return (
    <aside className="w-[166px] shrink-0 border-r border-[#e5e6eb] bg-white flex flex-col">
      {/* 项目/空间选择 */}
      <div className="px-2 pt-2 shrink-0">
        <button className="w-full flex items-center gap-1.5 rounded-[2px] border border-[#d9dce3] bg-[#f7f8fa] px-2 py-1.5 text-[12px] text-[#1f2329] hover:border-[#1668ff]">
          <span className="truncate">host--- 测试...</span>
          <Copy size={12} className="ml-auto shrink-0 text-[#8f959e]" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        {NAV.map((section) => (
          <div key={section.label} className="mb-1">
            <div className="px-3 pt-2 pb-1 text-[11px] text-[#8f959e]">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className={cn(
                    'w-full flex items-center gap-1.5 h-7 text-[13px] transition-colors',
                    item.indent ? 'pl-5 pr-2' : 'px-3',
                    item.active
                      ? 'bg-[#eef4ff] text-[#1668ff] font-medium'
                      : 'text-[#1f2329] hover:bg-[#f7f8fa]',
                  )}
                >
                  {Icon && (
                    <Icon
                      size={13}
                      className={cn('shrink-0', item.active ? 'text-[#1668ff]' : 'text-[#646a73]')}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                  {item.chevron === 'down' && <ChevronDown size={12} className="ml-auto shrink-0 text-[#8f959e]" />}
                  {item.chevron === 'right' && <ChevronRight size={12} className="ml-auto shrink-0 text-[#8f959e]" />}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 h-8 border-t border-[#e5e6eb] flex items-center px-3">
        <button className="text-[#646a73] hover:text-[#1668ff]" title="收起导航">
          <PanelLeftClose size={14} />
        </button>
      </div>
    </aside>
  )
}

/** 蓝色实心 info 小圆点 */
export function InfoDot() {
  return (
    <span className="w-3 h-3 rounded-full bg-[#1668ff] text-white text-[8px] font-bold leading-none flex items-center justify-center shrink-0">
      i
    </span>
  )
}

/** 状态徽标 */
export function StatusBadge({ status }: { status: 'off' | 'running' }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-[2px] px-1.5 py-px text-[11px] leading-4 text-white',
        status === 'running' ? 'bg-[#52c41a]' : 'bg-[#2e2e2e]',
      )}
    >
      {status === 'running' ? '运行中' : '已关机'}
    </span>
  )
}

/** 页面根容器 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-[calc(100vh-68px)] flex flex-col overflow-hidden bg-white text-[#1f2329]">
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <SideNav />
        <main className="flex-1 min-w-0 flex flex-col">{children}</main>
      </div>
    </div>
  )
}

/** 蓝色主色常量，供页面复用 */
export const PRIMARY = BLUE

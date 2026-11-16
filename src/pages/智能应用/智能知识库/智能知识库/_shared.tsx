/**
 * 智能知识库 - 共享组件（薄适配层）
 *
 * 外壳已抽为公共素材 `src/lib/platform-shell`，本文件只负责：
 *   1. 把 66px 顶栏 + 256px 侧栏套到知识库应用上；
 *   2. 把「应用内切换」的 activePage/onPageChange 翻译成菜单行 onClick。
 *
 * 历史：v0.1 从「智能诊断」1:1 复制了 lucide 版外壳（56px 顶栏 + 200px 侧栏 + 12宫格弹窗），
 * 现统一到平台外壳素材，视觉与「算力加速平台」保持一致。
 * 模块清单 = 九宫格面板「智能中心」列的 1:1 投影：智能应用（智能知识库）+ 系统设置（模型/工具/技能/参数配置）。
 */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { PlatformHeader, SideNav, type ShellNavRow } from '@/lib/platform-shell'
import { ProductNav, CALSPEED_PRODUCT_NAV } from '@/lib/product-nav'
import { DiagnosisDialog } from './DiagnosisDialog'

// ─── 应用内子页面（单入口：状态切换，不注册路由）─────────────────────────────────

/**
 * 应用内模块清单 = 九宫格面板「智能中心」列的 1:1 投影。
 * 分组与条目顺序跟 calspeedNav.tsx 保持一致，改一处要同步另一处。
 */
export const KB_PAGES: { key: string; label: string; icon: string }[] = [
  // 智能应用（所有登录用户）
  { key: 'kb', label: '智能知识库', icon: 'library' },
  // 系统设置（仅平台管理员可见）
  { key: 'model', label: '模型管理', icon: 'infer' },
  { key: 'tool', label: '工具管理', icon: 'consolehex' },
  { key: 'skill', label: '技能管理', icon: 'gem' },
  { key: 'param', label: '参数配置', icon: 'switchbox' },
]

// ─── 默认模型（模型管理设置，会话发起默认使用）─────────────────────────────────────

const DEFAULT_MODEL_KEY = 'aiops.defaultModel'
const DEFAULT_MODEL_FALLBACK = 'DeepSeek-R1'

export function getDefaultModel(): string {
  try {
    return localStorage.getItem(DEFAULT_MODEL_KEY) || DEFAULT_MODEL_FALLBACK
  } catch {
    return DEFAULT_MODEL_FALLBACK
  }
}

export function setDefaultModel(name: string) {
  localStorage.setItem(DEFAULT_MODEL_KEY, name)
}

// ─── 平台外壳：素材顶栏 + 素材侧栏 + 内容区 ────────────────────────────────────────

export function PlatformShell({
  children,
  activePage,
  onPageChange,
}: {
  children: ReactNode
  activePage: string
  onPageChange: (page: string) => void
}) {
  const [navOpen, setNavOpen] = useState(false)

  const item = (key: string): ShellNavRow => {
    const page = KB_PAGES.find((p) => p.key === key)!
    return {
      kind: 'item',
      label: page.label,
      icon: page.icon,
      lvl: 2,
      active: activePage === key,
      onClick: () => onPageChange(key),
    }
  }

  const rows: ShellNavRow[] = [
    { kind: 'section', label: '智能应用' },
    ...['kb'].map(item),
    { kind: 'section', label: '系统设置' },
    ...['model', 'tool', 'skill', 'param'].map(item),
  ]

  return (
    <div className="h-[calc(100vh-68px)] flex flex-col overflow-hidden">
      <PlatformHeader
        productName="智能应用"
        consoleLabel="管理工作台"
        userName="张虎测试"
        accountName="admin"
        onNavClick={() => setNavOpen((v) => !v)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <SideNav rows={rows} menuTitle="智能中心" />
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA] relative">{children}</div>
        {/* 9 宫格产品导航：整页浮层，盖住侧栏 + 内容 */}
        {navOpen && (
          <ProductNav columns={CALSPEED_PRODUCT_NAV} onClose={() => setNavOpen(false)} onItemClick={() => setNavOpen(false)} />
        )}
      </div>
    </div>
  )
}

// ─── 右侧浮动对话入口按钮 + 共享诊断对话框（scene 模式）───────────────────────────

export function FloatingChatButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[24px] right-[24px] z-40 w-[48px] h-[48px] bg-[#409EFF] text-white rounded-full shadow-[0_4px_12px_rgba(64,158,255,0.4)] hover:bg-[#66B1FF] hover:shadow-[0_6px_16px_rgba(64,158,255,0.5)] transition-all flex items-center justify-center"
        title="智能诊断"
      >
        <MessageSquare className="w-[22px] h-[22px]" />
      </button>

      {/* 共享诊断对话框：scene 模式（先选场景或手动输入，再走五阶段诊断） */}
      {open && <DiagnosisDialog mode="scene" onClose={() => setOpen(false)} />}
    </>
  )
}

// ─── 分页组件（Element Plus 风格）────────────────────────────────────────────────

/**
 * 通用分页组件
 * @param current 当前页码（从 1 开始）
 * @param total   总条数
 * @param pageSize 每页条数
 * @param onChange 页码变化回调
 */
export function Pagination({
  current,
  total,
  pageSize,
  onChange,
}: {
  current: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  // 生成页码列表：1 ... 4 5 6 ... 10（当前页前后各展示 1 个页码，首尾固定）
  const pages: (number | '...')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - current) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  const cls = (active: boolean, disabled: boolean) =>
    `min-w-[28px] h-[28px] px-[6px] text-[13px] rounded-[4px] flex items-center justify-center transition-colors ${
      disabled
        ? 'text-[#C0C4CC] cursor-not-allowed'
        : active
          ? 'bg-[#409EFF] text-white border border-[#409EFF]'
          : 'bg-white text-[#606266] border border-[#DCDFE6] hover:text-[#409EFF] hover:border-[#409EFF]'
    }`

  return (
    <div className="flex items-center gap-[6px]">
      <span className="text-[13px] text-[#606266] mr-[8px]">共 {total} 条</span>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        className={cls(false, current <= 1)}
        title="上一页"
      >
        <ChevronLeft className="w-[14px] h-[14px]" />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-[4px] text-[13px] text-[#909399]">
            ...
          </span>
        ) : (
          <button key={p} onClick={() => onChange(p)} className={cls(p === current, false)}>
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current >= totalPages}
        className={cls(false, current >= totalPages)}
        title="下一页"
      >
        <ChevronRight className="w-[14px] h-[14px]" />
      </button>
    </div>
  )
}
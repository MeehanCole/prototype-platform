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
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PlatformHeader, SideNav, type ShellNavRow } from '@/lib/platform-shell'
import { ProductNav, CALSPEED_PRODUCT_NAV } from '@/lib/product-nav'
import { ChatInterface } from './ChatInterface'
import aiChatAvatar from '@/assets/ai/ai-chat-avatar.png'

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

// ─── 浮动对话入口：默认半收在边缘，可拖动吸附 + 记住位置 ───────────────────────────

const FAB_SIZE = 72
const FAB_MARGIN = 20
const FAB_STORAGE_KEY = 'aiops.kb.chatFab.v2'
/** 收起时露出的宽度：72 / 2 = 36px，保持一半可点 */
const FAB_PEEK = FAB_SIZE / 2

type FabSide = 'left' | 'right'
type FabAnchor = { side: FabSide; top: number }
type Box = { width: number; height: number }

/** fixed 元素若被带 transform 的祖先包裹，定位基准是那个祖先而不是 viewport */
function getFixedContainingBlock(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null
  while (node) {
    const cs = getComputedStyle(node)
    if (
      cs.transform !== 'none' ||
      cs.perspective !== 'none' ||
      cs.filter !== 'none' ||
      cs.backdropFilter !== 'none' ||
      /transform|perspective|filter/.test(cs.willChange || '') ||
      /paint|layout|strict|content/.test(cs.contain || '')
    ) {
      return node
    }
    node = node.parentElement
  }
  return null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function readFabAnchor(): FabAnchor | null {
  try {
    const raw = localStorage.getItem(FAB_STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<FabAnchor>
    if (
      (value.side === 'left' || value.side === 'right') &&
      typeof value.top === 'number' &&
      Number.isFinite(value.top)
    ) {
      return { side: value.side, top: value.top }
    }
  } catch {
    // 本地存储不可用时走默认位置
  }
  return null
}

function saveFabAnchor(anchor: FabAnchor) {
  try {
    localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify(anchor))
  } catch {
    // 忽略隐私模式等写入失败
  }
}

type DragState = {
  pointerId: number
  startX: number
  startY: number
  offsetX: number
  offsetY: number
  moved: boolean
  x: number
  y: number
}

export function FloatingChatButton({ activeKb = null }: { activeKb?: string | null }) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<FabAnchor | null>(readFabAnchor)
  const [box, setBox] = useState<Box | null>(null)
  const [hovered, setHovered] = useState(false)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const skipClickRef = useRef(false)

  // 量出真正的定位容器（项目外壳有 transform，fixed 以它为基准），并跟随尺寸变化
  useEffect(() => {
    const button = buttonRef.current
    if (!button) return
    const container = getFixedContainingBlock(button)
    containerRef.current = container

    // 用 clientWidth/Height（布局尺寸）而不是 rect：外层的淡入 transform 不会影响定位基准尺寸
    const measure = () => {
      const el = container ?? document.documentElement
      const next = { width: el.clientWidth, height: el.clientHeight }
      setBox((prev) =>
        prev && prev.width === next.width && prev.height === next.height ? prev : next,
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (container) observer.observe(container)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const side: FabSide = anchor?.side ?? 'right'
  const maxTop = box ? Math.max(FAB_MARGIN, box.height - FAB_SIZE - FAB_MARGIN) : FAB_MARGIN
  const restTop = box ? Math.max(FAB_MARGIN, box.height - FAB_MARGIN - FAB_SIZE) : FAB_MARGIN
  const top = dragPos?.y ?? clamp(anchor?.top ?? restTop, FAB_MARGIN, maxTop)
  const expanded = hovered || dragPos !== null
  const restX = box ? (side === 'right' ? box.width - FAB_PEEK : FAB_PEEK - FAB_SIZE) : 0
  // 展开时贴住边缘：收起露出的那一半始终在按钮范围内，鼠标不会因按钮移开而抖动
  const openX = box ? (side === 'right' ? box.width - FAB_SIZE : 0) : 0
  const left = dragPos?.x ?? (expanded ? openX : restX)

  const clampLocal = (x: number, y: number) => {
    if (!box) return { x, y }
    return {
      x: clamp(x, 0, box.width - FAB_SIZE),
      y: clamp(y, FAB_MARGIN, maxTop),
    }
  }

  const localPoint = (event: React.PointerEvent<HTMLButtonElement>) => {
    const container = containerRef.current
    const rect = (container ?? document.documentElement).getBoundingClientRect()
    return {
      x: event.clientX - rect.left - (container?.clientLeft ?? 0),
      y: event.clientY - rect.top - (container?.clientTop ?? 0),
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (!box) return
    const point = localPoint(event)
    const offsetX = point.x - left
    const offsetY = point.y - top
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX,
      offsetY,
      moved: false,
      x: left,
      y: top,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId || !box) return
    if (!drag.moved) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return
      drag.moved = true
    }
    const point = localPoint(event)
    const next = clampLocal(point.x - drag.offsetX, point.y - drag.offsetY)
    drag.x = next.x
    drag.y = next.y
    setDragPos(next)
  }

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (!drag.moved) {
      setDragPos(null)
      return
    }
    const nextSide: FabSide = drag.x + FAB_SIZE / 2 < (box?.width ?? 0) / 2 ? 'left' : 'right'
    const next: FabAnchor = { side: nextSide, top: drag.y }
    setAnchor(next)
    saveFabAnchor(next)
    setDragPos(null)
    setHovered(false)
    // pointerup 之后浏览器还会补一个 click，拖动结束时不要误开对话
    skipClickRef.current = true
    window.setTimeout(() => {
      skipClickRef.current = false
    }, 0)
  }

  const handleClick = () => {
    if (skipClickRef.current) {
      skipClickRef.current = false
      return
    }
    setOpen(true)
  }

  return (
    <>
      {/* 浮动按钮：品牌对话头像；默认半收，悬停/聚焦展开，拖动后吸附左/右边缘 */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="group fixed z-40 flex h-[72px] w-[72px] cursor-grab touch-none select-none items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#409EFF] focus-visible:ring-offset-2 active:cursor-grabbing"
        style={{
          left,
          top,
          visibility: box ? 'visible' : 'hidden',
          transition: dragPos ? 'none' : 'left 220ms ease, top 220ms ease',
        }}
        title="智能对话（拖动可换边）"
        aria-label="打开智能对话"
      >
        <img
          src={aiChatAvatar}
          alt=""
          draggable={false}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-[1.04]"
        />
      </button>

      {/* 对话页：抽屉式智能对话 */}
      {open && <ChatInterface activeKb={activeKb} onClose={() => setOpen(false)} />}
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
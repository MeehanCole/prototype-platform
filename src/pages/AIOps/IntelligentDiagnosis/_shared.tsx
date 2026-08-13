/**
 * 智能诊断平台 - 共享组件
 * 方案1：右侧浮动对话入口按钮 + 平台级 Header/导航栏
 * 完整应用单入口：内部状态切换，不注册多个路由
 */
import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  MessageSquare,
  X,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Ticket,
  Users,
  Building2,
  LayoutGrid,
} from 'lucide-react'
import { DiagnosisDialog } from './DiagnosisDialog'

// ─── 平台级 Header + 左侧导航 ────────────────────────────────────────────────────

/** AIOps 页面（可切换原型内部页面；管理面无智能对话页，对话统一走应用面常驻入口） */
export const AIOPS_PAGES = [
  { key: 'model', label: '模型管理' },
  { key: 'tool', label: '工具管理' },
  { key: 'skill', label: '技能管理' },
  { key: 'config', label: '配置管理' },
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

/** 平台完整导航结构：一级分类 → 二级分类 → 菜单项（非 AIOps 分类为静态展示） */
const PLATFORM_NAV: { title: string; groups: { title?: string; items: string[] }[] }[] = [
  {
    title: '智算服务',
    groups: [
      { items: ['快速入门', '总览'] },
      { title: '弹性算力', items: ['容器实例', '主机实例', '裸金属实例'] },
      { title: '模型服务', items: ['模型广场', '私有模型', '推理服务', '模型体验', 'API 管理'] },
      { title: '基础资源', items: ['存储管理', '镜像管理'] },
      { title: '算力评测', items: ['算力评估', '性能评估'] },
    ],
  },
  {
    title: '容器云',
    groups: [
      { title: '容器服务', items: ['总览', '容器应用', '应用负载', '配置管理', '容器网络', '容器存储'] },
      { title: '多云管理', items: ['多云容器服务', '总览', '多云应用', '多云负载', '配置管理', '网络管理', '存储管理'] },
    ],
  },
  {
    title: 'CICD',
    groups: [{ items: ['总览', '流水线', '仓库管理'] }],
  },
  {
    title: '中间件',
    groups: [{ title: '数据服务', items: ['MySQL', 'Kafka', 'Redis'] }],
  },
  {
    title: '平台巡检',
    groups: [{ title: '巡检中心', items: ['巡检规则', '巡检计划', '巡检结果'] }],
  },
  {
    title: '运维中心',
    groups: [
      { title: '操作审计', items: ['平台审计'] },
      { title: '平台运维', items: ['监控中心', '告警中心', '日志管理'] },
      { title: '应用运维', items: ['监控中心', '告警中心', '日志管理'] },
      { title: '系统管理', items: ['通知配置', '运维参数'] },
    ],
  },
  {
    title: '交付中心',
    groups: [{ items: ['镜像仓库', '应用中心'] }],
  },
  {
    title: '运营中心',
    groups: [{ items: ['资产概览', '资产清单', '资产分配', '运营报表', '规格管理', '订单管理'] }],
  },
]

/** 平台导航中可切换原型页面的菜单项（默认隐藏的页面，通过全局导航调出） */
const NAV_CLICKABLE: { cat: string; item: string; key: string }[] = [
  { cat: '运维中心', item: '告警中心', key: 'alert' },
]

/** 平台外壳：顶部 Header + 常驻左侧导航 + 内容区；12宫格图标弹出平铺导航弹窗 */
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

  return (
    <div className="h-[calc(100vh-68px)] flex flex-col overflow-hidden">
      <PlatformHeader onOpenNav={() => setNavOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {/* 告警中心页自带导航栏，隐藏常驻智能中心导航，避免双重导航 */}
        {activePage !== 'alert' && <PlatformSidebar activePage={activePage} onPageChange={onPageChange} />}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA] relative">{children}</div>
      </div>
      {/* 12宫格平铺导航弹窗 */}
      <PlatformNavModal open={navOpen} onClose={() => setNavOpen(false)} activePage={activePage} onPageChange={onPageChange} />
    </div>
  )
}

/** 平台顶部 Header - 白色背景，左侧 12宫格图标弹出平铺导航 */
function PlatformHeader({
  onOpenNav,
}: {
  onOpenNav: () => void
}) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-[56px] bg-white flex items-center shrink-0 z-10 border-b border-[#E4E7ED]">
      {/* 12宫格图标：弹出平台导航平铺弹窗 */}
      <div className="flex items-center pl-[16px] shrink-0">
        <button
          onClick={onOpenNav}
          title="平台导航"
          className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] text-[#606266] hover:text-[#409EFF] hover:bg-[#F5F7FA] transition-colors"
        >
          <LayoutGrid size={18} />
        </button>
      </div>

      {/* Logo + 平台名称 */}
      <div className="flex items-center pl-[12px] pr-[16px] shrink-0">
        <div className="w-[32px] h-[32px] bg-[#1e5aa8] rounded-[6px] flex items-center justify-center mr-[10px]">
          <span className="text-[13px] font-bold text-white">AI</span>
        </div>
        <span className="text-[16px] font-semibold text-[#303133] whitespace-nowrap">算力加速平台</span>
      </div>

      {/* 管理工作台按钮 */}
      <div className="flex items-center h-full pl-[8px]">
        <button className="flex items-center gap-[6px] h-[32px] px-[14px] border border-[#DCDFE6] rounded-[4px] text-[#606266] text-[13px] hover:border-[#409EFF] hover:text-[#409EFF] transition-colors">
          <LayoutGrid size={14} />
          管理工作台
        </button>
      </div>

      {/* 右侧操作 */}
      <div className="flex items-center gap-[2px] ml-auto pr-[24px] shrink-0">
        <button className="relative flex items-center gap-[4px] h-[32px] px-[10px] text-[#606266] hover:text-[#409EFF] rounded-[4px] transition-colors">
          <Bell size={16} />
          <span className="text-[13px]">帮助文档</span>
          <span className="absolute top-[4px] right-[6px] w-[6px] h-[6px] bg-[#F56C6C] rounded-full" />
        </button>
        <button className="flex items-center gap-[4px] h-[32px] px-[10px] text-[#606266] hover:text-[#409EFF] rounded-[4px] transition-colors">
          <Ticket size={16} />
          <span className="text-[13px]">工单</span>
        </button>
        <button className="flex items-center gap-[4px] h-[32px] px-[10px] text-[#606266] hover:text-[#409EFF] rounded-[4px] transition-colors">
          <Users size={16} />
          <span className="text-[13px]">加入蓝信群</span>
        </button>

        <div className="w-[1px] h-[20px] bg-[#EBEEF5] mx-[10px]" />

        <button className="flex items-center gap-[4px] h-[32px] px-[10px] text-[#606266] hover:text-[#409EFF] rounded-[4px] transition-colors">
          <Building2 size={16} />
          <span className="text-[13px]">系统租户</span>
        </button>

        {/* 用户下拉 */}
        <div ref={menuRef} className="relative ml-[8px]">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-[6px] h-[36px] px-[8px] rounded-[4px] hover:bg-[#F5F7FA] transition-colors"
          >
            <div className="w-[28px] h-[28px] bg-[#1e5aa8] rounded-full flex items-center justify-center">
              <User className="w-[14px] h-[14px] text-white" />
            </div>
            <span className="text-[13px] text-[#303133]">admin</span>
            <ChevronDown size={12} className={`text-[#909399] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-[4px] w-[150px] bg-white border border-[#E4E7ED] rounded-[4px] shadow-lg z-50 py-[4px]">
              <button className="w-full px-[12px] py-[8px] text-[13px] text-[#606266] hover:bg-[#F5F7FA] hover:text-[#409EFF] transition-colors flex items-center gap-[8px] text-left">
                <Settings size={14} />
                个人设置
              </button>
              <div className="h-[1px] bg-[#EBEEF5] mx-[8px]" />
              <button className="w-full px-[12px] py-[8px] text-[13px] text-[#606266] hover:bg-[#F5F7FA] hover:text-[#F56C6C] transition-colors flex items-center gap-[8px] text-left">
                <LogOut size={14} />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/** 左侧常驻导航栏 - 智能中心分类（AIOps 管理 3 个子页面），不受 12宫格弹窗影响 */
function PlatformSidebar({
  activePage,
  onPageChange,
}: {
  activePage: string
  onPageChange: (page: string) => void
}) {
  return (
    <aside className="w-[200px] shrink-0 bg-[#FFFFFF] border-r border-[#DCDFE6] flex flex-col overflow-hidden">
      <nav className="flex-1 overflow-y-auto py-[8px]">
        {/* 智能中心（本原型新增）- 承载 AIOps 管理子页面 */}
        <div className="px-[16px] pt-[8px] pb-[4px] text-[12px] font-medium text-[#909399] tracking-wider">
          智能中心
        </div>
        <div className="px-[16px] pt-[4px] pb-[2px] text-[12px] text-[#A0A0A0]">AIOps管理</div>
        {AIOPS_PAGES.map((page) => (
          <button
            key={page.key}
            onClick={() => onPageChange(page.key)}
            className={`w-full flex items-center px-[16px] py-[10px] text-[14px] transition-colors ${
              activePage === page.key
                ? 'text-[#409EFF] font-medium bg-[#ECF5FF] border-r-[2px] border-[#409EFF]'
                : 'text-[#303133] hover:bg-[#F5F7FA]'
            }`}
          >
            {page.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

/** 12宫格平铺导航弹窗 - 所有分类横向平铺并排，与真实平台一致；仅智能中心菜单可点击切换页面 */
function PlatformNavModal({
  open,
  onClose,
  activePage,
  onPageChange,
}: {
  open: boolean
  onClose: () => void
  activePage: string
  onPageChange: (page: string) => void
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  // 全部一级分类（真实平台分类 + 智能中心）
  const allCats = [
    ...PLATFORM_NAV.map((cat) => ({
      title: cat.title,
      groups: cat.groups,
    })),
    {
      title: '智能中心',
      groups: [
        {
          title: 'AIOps管理',
          items: AIOPS_PAGES.map((p) => p.label),
        },
      ],
    },
  ]

  return (
    <>
      {/* 遮罩层：点击关闭 */}
      <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.3)]" onClick={onClose} />
      {/* 弹窗：左上角定位（顶部顶着页面，12宫格图标下方展开） */}
      <div
        className="fixed left-0 top-0 z-50 bg-[#FFFFFF] shadow-[0_8px_32px_rgba(0,0,0,0.16)] border border-[#DCDFE6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between pl-[20px] pr-[12px] py-[10px] border-b border-[#DCDFE6]">
          <div className="flex items-center gap-[8px]">
            <LayoutGrid className="w-[16px] h-[16px] text-[#409EFF]" />
            <h2 className="text-[14px] font-medium text-[#303133]">平台导航</h2>
          </div>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center text-[#A0A0A0] hover:text-[#606266] hover:bg-[#F5F7FA] rounded-[4px] transition-colors"
          >
            <X className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* 分类横向平铺：一级分类并排成多列，每列内菜单项纵向排列 */}
        <div className="p-[12px] grid grid-cols-4 gap-x-[16px] gap-y-[12px] max-h-[calc(100vh-140px)] overflow-y-auto">
          {allCats.map((cat) => (
            <div key={cat.title} className="w-[140px]">
              <div className="text-[13px] font-medium text-[#303133] mb-[8px] pb-[5px] border-b border-[#EBEEF5] whitespace-nowrap">
                {cat.title}
              </div>
              <div className="space-y-[6px]">
                {cat.groups.map((g, gi) => (
                  <div key={gi} className="space-y-[2px]">
                    {g.title && <div className="text-[12px] text-[#909399]">{g.title}</div>}
                    {g.items.map((item) => {
                      // 可点击菜单项：智能中心 5 项 + 运维中心「告警中心」→ 切换原型页面
                      const platformPage = NAV_CLICKABLE.find((p) => p.cat === cat.title && p.item === item)
                      const page =
                        cat.title === '智能中心'
                          ? AIOPS_PAGES.find((p) => p.label === item)
                          : platformPage
                            ? { key: platformPage.key, label: item }
                            : undefined
                      const isActive = page ? activePage === page.key : false
                      const clickable = !!page
                      return (
                        <button
                          key={item}
                          disabled={!clickable}
                          onClick={() => {
                            if (page) {
                              onPageChange(page.key)
                              onClose()
                            }
                          }}
                          className={`block w-full text-left text-[12px] px-[6px] py-[3px] rounded-[4px] transition-colors whitespace-nowrap ${
                            isActive
                              ? 'text-[#606266] cursor-default'
                              : clickable
                                ? 'text-[#606266] hover:text-[#409EFF] hover:bg-[#F5F7FA] cursor-pointer'
                                : 'text-[#606266] cursor-default'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
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
/**
 * 产品顶栏（通用件）
 *
 * 来源：「算力加速平台」1:1 还原外壳（截图 01-在线服务.webp），66px 白底、单像素分隔线。
 * 所有间距/字号均为截图实测值，改动会破坏还原度；产品差异请走 props，不要复制本文件。
 */
import type { ReactNode } from 'react'
import { ShellIcon } from './icons'

/** 左侧 3×3 点阵导航入口（点击展开产品类导航面板） */
function DotGrid({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="产品导航"
      data-shell-nav-trigger
      className={`shrink-0 flex items-center justify-center rounded-[4px] p-[2px] ${
        onClick ? 'cursor-pointer hover:bg-[#f4f6fa]' : 'cursor-default'
      }`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        {[0, 9, 18].flatMap((y) =>
          [0, 9, 18].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill="#d3d3d3" />),
        )}
      </svg>
    </button>
  )
}

/** 默认品牌标：3D「AI」字标 + 银色环（算力加速平台） */
function GlobeLogo() {
  return (
    <svg width="49" height="44" viewBox="0 0 49 44" aria-hidden>
      <defs>
        <linearGradient id="shell-lg-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0f3f8" />
          <stop offset="0.55" stopColor="#c9d4e5" />
          <stop offset="1" stopColor="#adbdd8" />
        </linearGradient>
        <linearGradient id="shell-lg-ai" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7aa7f0" />
          <stop offset="1" stopColor="#2563d8" />
        </linearGradient>
      </defs>
      <ellipse cx="24.5" cy="36.5" rx="16" ry="3" fill="#c3cedd" opacity="0.5" />
      <ellipse cx="24.5" cy="21.5" rx="23.5" ry="9.5" fill="url(#shell-lg-ring)" />
      <ellipse cx="24.5" cy="21.1" rx="17.2" ry="5.4" fill="#fdfdfe" />
      <text
        x="7.5"
        y="25.5"
        fontFamily="'Arial Black','Helvetica Neue',sans-serif"
        fontSize="26"
        fontWeight="800"
        fill="url(#shell-lg-ai)"
        transform="skewX(-7)"
      >
        AI
      </text>
      <path d="M1 21.5a23.5 9.5 0 0 0 47 0" fill="none" stroke="url(#shell-lg-ring)" strokeWidth="4.6" />
      <path d="M24.5 31a23.5 9.5 0 0 0 23.5-9.5" fill="none" stroke="#9db6e4" strokeWidth="2.2" opacity="0.75" />
    </svg>
  )
}

function Avatar() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="block rounded-full">
      <circle cx="13" cy="13" r="13" fill="#b9c9ec" />
      <path d="M13 5.4c-2.8 0-4.4 1.9-4.4 4.4 0 1.6.7 2.9 1.8 3.7h5.2c1.1-.8 1.8-2.1 1.8-3.7 0-2.5-1.6-4.4-4.4-4.4Z" fill="#e3b78f" />
      <path d="M13 4.8c-3.1 0-5 2.1-5 4.8 0 .5.05 1 .17 1.5C9.1 9.3 10.7 8.3 13 8.3s3.9 1 4.83 2.8c.12-.5.17-1 .17-1.5 0-2.7-1.9-4.8-5-4.8Z" fill="#3f4254" />
      <path d="M4.4 24.8c.6-4.4 4.1-6.6 8.6-6.6s8 2.2 8.6 6.6Z" fill="#3d5fae" />
      <path d="M13 18.4 10.9 20.9 13 24.4l2.1-3.5Z" fill="#eef2f8" />
    </svg>
  )
}

export interface PlatformHeaderProps {
  /** 产品名，如「算力加速平台」 */
  productName?: string
  /** 品牌标，默认 3D AI 字标；其它产品可传自己的 logo（建议 49×44 以内） */
  logo?: ReactNode
  /** 左侧次按钮文案，传 false 隐藏 */
  consoleLabel?: string | false
  onConsoleClick?: () => void
  /** 语言区文案 */
  languageLabel?: string
  onLanguageClick?: () => void
  /** 通知铃铛 */
  onNotificationClick?: () => void
  /** 顶栏右侧显示的用户名 */
  userName?: string
  /** 左侧 9 宫格：展开产品类导航面板 */
  onNavClick?: () => void
  /** 顶栏右侧账号名 */
  accountName?: string
  onAccountClick?: () => void
  /** 整块替换右侧账号区（传了就不渲染默认账号区） */
  right?: ReactNode
  className?: string
}

export function PlatformHeader({
  productName = '算力加速平台',
  logo,
  consoleLabel = '管理工作台',
  onConsoleClick,
  onNavClick,
  languageLabel = '中文',
  onLanguageClick,
  onNotificationClick,
  userName = '张虎测试',
  accountName = 'admin',
  onAccountClick,
  right,
  className = '',
}: PlatformHeaderProps) {
  return (
    <header
      className={`shrink-0 h-[66px] bg-white border-b border-[#f0f0f0] flex items-center pl-[22px] pr-[4px] select-none ${className}`}
    >
      {/* 左：产品标识 */}
      <DotGrid onClick={onNavClick} />
      <div className="ml-[26px]">{logo ?? <GlobeLogo />}</div>
      <span className="ml-[28px] relative text-[20px] font-semibold text-[#1c1c1c] before:absolute before:-left-[12px] before:top-1/2 before:-translate-y-1/2 before:h-[17px] before:w-px before:bg-[#eaeaea]">
        {productName}
      </span>
      {consoleLabel !== false && (
        <span
          onClick={onConsoleClick}
          className={`ml-[27px] h-[31px] pl-[21px] pr-[19px] flex items-center gap-[11px] rounded-[6px] border border-[#dfdfdf] bg-white text-[15px] text-[#333] ${onConsoleClick ? 'cursor-pointer' : ''}`}
        >
          <ShellIcon name="consolehex" size={16} color="#555" />
          {consoleLabel}
        </span>
      )}

      {/* 右：账号区 */}
      <div className="ml-auto flex items-center">
        {right ?? (
          <>
            <span className="inline-flex w-[22px] h-[22px] rounded-full border border-[#8fa8e0] items-center justify-center leading-none">
              <span className="text-[8px] leading-[9px] text-[#3b6fd4]">
                中<span className="block text-[7px] leading-[8px]">En</span>
              </span>
            </span>
            <span
              onClick={onLanguageClick}
              className={`ml-[9px] text-[15px] text-[#333] ${onLanguageClick ? 'cursor-pointer' : ''}`}
            >
              {languageLabel}
            </span>
            <span
              onClick={onNotificationClick}
              className={`ml-[29px] flex ${onNotificationClick ? 'cursor-pointer' : ''}`}
              aria-label="通知"
            >
              <ShellIcon name="bell" size={24} color="#166EFF" />
            </span>
            <span className="ml-[26px] text-[18px] text-[#1f1f1f]">{userName}</span>
            <span className="ml-[13px] flex">
              <ShellIcon name="switchbox" size={20} color="#555" />
            </span>
            <span
              onClick={onAccountClick}
              className={`ml-[36px] inline-flex items-center ${onAccountClick ? 'cursor-pointer' : ''}`}
            >
              <Avatar />
              <span className="ml-[12px] text-[15px] text-[#292929]">{accountName}</span>
              <ShellIcon name="chevronDown" size={18} color="#666" className="ml-2" />
            </span>
          </>
        )}
      </div>
    </header>
  )
}
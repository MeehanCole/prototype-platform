/**
 * 平台外壳图标集（通用件）
 *
 * 取自「算力加速平台」1:1 还原外壳，viewBox 21×21、1.5px 线框；
 * 新增图标只在本文件追加，不要在页面里内联复制。
 * 规范见 docs/PlatformShell/平台外壳素材.md。
 */
import type { ReactNode } from 'react'

export const SHELL_ICONS: Record<string, ReactNode> = {
  key: (
    <>
      <circle cx="8" cy="8" r="4.5" />
      <path d="m11.5 11.5 5.5 5.5m-2-2 2 2m-3.5-0.5 1.5 1.5" />
    </>
  ),
  usage: (
    <>
      <rect x="4" y="11" width="3.5" height="6" rx="0.5" />
      <rect x="9.5" y="7" width="3.5" height="10" rx="0.5" />
      <rect x="15" y="4" width="3.5" height="13" rx="0.5" />
    </>
  ),
  book: (
    <>
      <rect x="4.5" y="3.5" width="13" height="14" rx="1.5" />
      <path d="M8.5 3.5v14" />
      <circle cx="3" cy="8" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="3" cy="11" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  overview: (
    <>
      <circle cx="10.5" cy="10.5" r="7" fill="currentColor" stroke="none" />
      <path d="M10.5 10.5V4.9a5.6 5.6 0 0 1 3.9 1.6Z" fill="#fff" stroke="none" />
      <circle cx="8" cy="12.3" r="1.1" fill="#fff" stroke="none" />
    </>
  ),
  containers: (
    <>
      <rect x="5.5" y="3" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="6" r="1" fill="#fff" stroke="none" />
      <rect x="3" y="12" width="4.6" height="4.6" rx="1" fill="currentColor" stroke="none" />
      <rect x="8.2" y="12" width="4.6" height="4.6" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.4" y="12" width="4.6" height="4.6" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  hosts: (
    <>
      <rect x="3.5" y="3.5" width="14" height="4" rx="1" fill="currentColor" stroke="none" />
      <rect x="3.5" y="9" width="14" height="4" rx="1" fill="currentColor" stroke="none" />
      <circle cx="6" cy="5.5" r="0.9" fill="#fff" stroke="none" />
      <circle cx="6" cy="11" r="0.9" fill="#fff" stroke="none" />
      <path d="M5 15h9.5a1.6 1.6 0 0 1 1.6 1.6v.4H3.4v-.4A1.6 1.6 0 0 1 5 15Z" fill="currentColor" stroke="none" />
    </>
  ),
  baremetal: (
    <>
      <path d="M6.8 13.5h7.5a2.6 2.6 0 0 0 .5-5.15 4.2 4.2 0 0 0-8.2-1.05 3 3 0 0 0 .2 6.2Z" />
      <circle cx="10.5" cy="11" r="1.9" fill="currentColor" stroke="none" />
    </>
  ),
  plaza: (
    <>
      <path d="M4.5 7v-1.5a1 1 0 0 1 1-1H7M14 4.5h1.5a1 1 0 0 1 1 1V7M16.5 14v1.5a1 1 0 0 1-1 1H14M7 16.5H5.5a1 1 0 0 1-1-1V14" />
      <path d="m10.5 7.8 3 1.7v3.4l-3 1.7-3-1.7v-3.4Z" />
      <path d="m7.5 9.5 3 1.7 3-1.7M10.5 11.2v3.4" />
    </>
  ),
  repo: (
    <>
      <path d="M10.5 3.5 16 6.7v6.6l-5.5 3.2-5.5-3.2V6.7Z" fill="currentColor" stroke="none" />
      <path d="M10.5 3.5 16 6.7 10.5 9.9 5 6.7Z" fill="#fff" fillOpacity="0.4" stroke="none" />
      <path d="M5 6.7v6.6l5.5 3.2V9.9Z" fill="#fff" fillOpacity="0.2" stroke="none" />
    </>
  ),
  infer: (
    <>
      <path d="M5.5 4h6.5l3 3v3.5" />
      <path d="M12 4v3.5h3" />
      <rect x="8.5" y="9.5" width="8.5" height="7.5" rx="1.5" fill="currentColor" stroke="none" />
      <path d="m11.5 12-1.3 1.75 1.3 1.75M15 12l1.3 1.75L15 15.5" stroke="#fff" strokeWidth="1.1" />
    </>
  ),
  layers: (
    <>
      <path d="m10.5 4 5.5 3-5.5 3-5.5-3Z" />
      <path d="m5 10.7 5.5 3 5.5-3" />
      <path d="m5 13.7 5.5 3 5.5-3" />
    </>
  ),
  gem: (
    <>
      <path d="M10.5 2.4 18.9 8.3 10.5 17.4 2.1 8.3Z" />
      <path d="M7.9 8.7h5.2" />
    </>
  ),
  exp: (
    <>
      <path d="M5.4 8.2a6 6 0 0 1 9.8-1.6" strokeWidth="1.8" />
      <path d="M15.6 12.8a6 6 0 0 1-9.8 1.6" strokeWidth="1.8" />
      <path d="M15.6 4.4v2.9h-2.9" />
      <path d="M5.4 16.6v-2.9h2.9" />
    </>
  ),
  apicloud: (
    <>
      <path d="M6.6 13.5h7.8a2.6 2.6 0 0 0 .5-5.15 4.2 4.2 0 0 0-8.2-1.05 3 3 0 0 0-.1 6.2Z" />
      <path d="M8.6 10.4h3.8" />
      <path d="M10.5 13.5v2.2m-1.2-1.2 1.2 1.2 1.2-1.2" />
    </>
  ),
  link: (
    <>
      <circle cx="6.5" cy="6" r="1.7" />
      <circle cx="14.5" cy="13.5" r="1.7" />
      <circle cx="13.5" cy="6.5" r="1" />
      <path d="M7.6 7.4c1.8 1.6 2.4 3.6.9 5.1" />
      <path d="M8.5 12.5c1.5-.6 3.2-.9 4.4-.6" />
    </>
  ),
  hdd: (
    <>
      <rect x="4" y="5" width="13" height="11" rx="1.8" />
      <circle cx="13.6" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <path d="M6.6 12.6h7.8" />
    </>
  ),
  mirror: (
    <>
      <rect x="4.5" y="4" width="5" height="13" rx="1" />
      <rect x="11.5" y="4" width="5" height="13" rx="1" />
    </>
  ),
  percent: (
    <>
      <rect x="4" y="4" width="13" height="13" rx="2" />
      <circle cx="8.3" cy="8.3" r="1.1" />
      <circle cx="12.7" cy="12.7" r="1.1" />
      <path d="M13 8 8 13" />
    </>
  ),
  wave: (
    <>
      <rect x="4" y="4" width="13" height="13" rx="2" />
      <path d="M6.5 10.5c1.2-2.2 2.3-2.2 3.5 0s2.3 2.2 3.5 0" />
    </>
  ),
  loginbox: (
    <>
      <rect x="3.5" y="3.5" width="14" height="14" rx="2.5" />
      <path d="M8.5 10.5H18" />
      <path d="m15.5 8 2.5 2.5L15.5 13" />
    </>
  ),
  collapse: (
    <>
      <path d="M7 5.5h10M7 10.5h10M7 15.5h10" />
      <path d="M5.5 10.5H2.8m2-2-2 2 2 2" />
    </>
  ),
  consolehex: (
    <>
      <path d="M10.5 2.5 17.5 6.75v8.5L10.5 19.5 3.5 15.25v-8.5Z" />
      <path d="M7.2 8.9 10.5 7.2l3.3 1.7-3.3 1.7Z" />
      <path d="M7.2 8.9v4.6l3.3 1.7v-4.6" />
      <path d="M13.8 8.9v4.6l-3.3 1.7v-4.6" />
    </>
  ),
  bell: (
    <>
      <path d="M10.5 4a5 5 0 0 0-5 5v3l-1.5 2.5h13L15.5 12V9a5 5 0 0 0-5-5Z" />
      <path d="M8.8 16.5a1.8 1.8 0 0 0 3.4 0" />
    </>
  ),
  chevronUp: <path d="m6 13 4.5-4.5L15 13" />,
  chevronDown: <path d="m6 8 4.5 4.5L15 8" />,
  refresh: (
    <>
      <path d="M16.5 10.5a6 6 0 1 1-1.8-4.3" />
      <path d="M16.5 3.5v3.3h-3.3" />
    </>
  ),
  plusCircle: (
    <>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M10.5 7.5v6M7.5 10.5h6" />
    </>
  ),
  switchbox: (
    <>
      <rect x="3.5" y="3.5" width="14" height="14" rx="2.5" />
      <path d="M7 8.5h7.2" />
      <path d="m11.8 6.3 2.4 2.2-2.4 2.2" />
      <path d="M14 12.5H6.8" />
      <path d="m9.2 10.3-2.4 2.2 2.4 2.2" />
    </>
  ),
  /** 智能中心 · 控制台（对话 / 历史会话） */
  message: (
    <>
      <rect x="3.5" y="4" width="14" height="10.5" rx="2" />
      <path d="M7.2 14.5v3.2L11 14.5" />
      <path d="M7.5 8.2h6" />
      <path d="M7.5 10.8h3.5" />
    </>
  ),
  /** 智能中心 · 知识库（文档库） */
  library: (
    <>
      <rect x="3.8" y="3.5" width="4" height="14" rx="1" />
      <rect x="9.2" y="3.5" width="4" height="14" rx="1" />
      <path d="m14.9 4.7 2.3 12.6" />
    </>
  ),
}

export function ShellIcon({
  name,
  size = 16,
  color = '#6b7280',
  className = '',
}: {
  name: string
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 21 21"
      fill="none"
      stroke={color}
      style={{ color }}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {SHELL_ICONS[name]}
    </svg>
  )
}

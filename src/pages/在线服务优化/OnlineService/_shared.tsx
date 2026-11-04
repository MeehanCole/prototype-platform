/**
 * 产品外壳还原（R1：产品 Header / Sidebar 必须放在页面自己的 _shared.tsx 中）。
 * 所有 token 仅来自本项目截图 01-在线服务.webp。
 */

/* ---------- 小图标（16px 线框，#6b7280；active 时用 #166EFF） ---------- */

const ICON_PATHS: Record<string, React.ReactNode> = {
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
}

function Icon({ name, size = 16, color = '#6b7280', className = '' }: { name: string; size?: number; color?: string; className?: string }) {
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
      {ICON_PATHS[name]}
    </svg>
  )
}

/* ---------- 产品顶栏（66px） ---------- */

function DotGrid() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      {[0, 9, 18].flatMap((y) =>
        [0, 9, 18].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill="#d3d3d3" />),
      )}
    </svg>
  )
}

/* 3D “AI” 字标 + 银色环（按 6x 放大裁剪还原） */
function GlobeLogo() {
  return (
    <svg width="49" height="44" viewBox="0 0 49 44" aria-hidden>
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0f3f8" />
          <stop offset="0.55" stopColor="#c9d4e5" />
          <stop offset="1" stopColor="#adbdd8" />
        </linearGradient>
        <linearGradient id="lg-ai" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7aa7f0" />
          <stop offset="1" stopColor="#2563d8" />
        </linearGradient>
      </defs>
      <ellipse cx="24.5" cy="36.5" rx="16" ry="3" fill="#c3cedd" opacity="0.5" />
      <ellipse cx="24.5" cy="21.5" rx="23.5" ry="9.5" fill="url(#lg-ring)" />
      <ellipse cx="24.5" cy="21.1" rx="17.2" ry="5.4" fill="#fdfdfe" />
      <text
        x="7.5"
        y="25.5"
        fontFamily="'Arial Black','Helvetica Neue',sans-serif"
        fontSize="26"
        fontWeight="800"
        fill="url(#lg-ai)"
        transform="skewX(-7)"
      >
        AI
      </text>
      <path d="M1 21.5a23.5 9.5 0 0 0 47 0" fill="none" stroke="url(#lg-ring)" strokeWidth="4.6" />
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

export function PlatformHeader() {
  return (
    <header className="shrink-0 h-[66px] bg-white border-b border-[#f0f0f0] flex items-center pl-[22px] pr-[4px] select-none">
      {/* 左：产品标识 */}
      <DotGrid />
      <div className="ml-[26px]">
        <GlobeLogo />
      </div>
      <span className="ml-[28px] relative text-[20px] font-semibold text-[#1c1c1c] before:absolute before:-left-[12px] before:top-1/2 before:-translate-y-1/2 before:h-[17px] before:w-px before:bg-[#eaeaea]">算力加速平台</span>
      <span className="ml-[27px] h-[31px] pl-[21px] pr-[19px] flex items-center gap-[11px] rounded-[6px] border border-[#dfdfdf] bg-white text-[15px] text-[#333]">
        <Icon name="consolehex" size={16} color="#555" />
        管理工作台
      </span>

      {/* 右：账号区 */}
      <div className="ml-auto flex items-center">
        <span className="inline-flex w-[22px] h-[22px] rounded-full border border-[#8fa8e0] items-center justify-center leading-none">
          <span className="text-[8px] leading-[9px] text-[#3b6fd4]">
            中<span className="block text-[7px] leading-[8px]">En</span>
          </span>
        </span>
        <span className="ml-[9px] text-[15px] text-[#333]">中文</span>
        <span className="ml-[29px]">
          <Icon name="bell" size={24} color="#166EFF" />
        </span>
        <span className="ml-[26px] text-[18px] text-[#1f1f1f]">张虎测试</span>
        <span className="ml-[13px]">
          <Icon name="switchbox" size={20} color="#555" />
        </span>
        <span className="ml-[36px] inline-flex items-center">
          <Avatar />
        </span>
        <span className="ml-[12px] text-[15px] text-[#292929]">admin</span>
        <Icon name="chevronDown" size={18} color="#666" className="ml-2" />
      </div>
    </header>
  )
}

/* ---------- 左侧导航（256px） ---------- */

interface NavRow {
  kind: 'item' | 'section' | 'group' | 'sub'
  label: string
  icon?: string
  active?: boolean
  lvl?: 1 | 2 | 3
  chevron?: 'up' | 'down'
}

const NAV_ROWS: NavRow[] = [
  { kind: 'item', label: '快速入门', icon: 'book', lvl: 1 },
  { kind: 'item', label: '总览', icon: 'overview', lvl: 1 },
  { kind: 'section', label: '弹性算力' },
  { kind: 'sub', label: '容器实例', icon: 'containers', lvl: 2 },
  { kind: 'sub', label: '主机实例', icon: 'hosts', lvl: 2 },
  { kind: 'sub', label: '裸金属实例', icon: 'baremetal', lvl: 2 },
  { kind: 'section', label: '模型服务' },
  { kind: 'item', label: '模型广场', icon: 'plaza', lvl: 2 },
  { kind: 'item', label: '模型仓库', icon: 'repo', lvl: 2 },
  { kind: 'group', label: '推理服务', icon: 'infer', lvl: 2, chevron: 'up' },
  { kind: 'sub', label: '推理实例', icon: 'layers', lvl: 3 },
  { kind: 'sub', label: '在线服务', icon: 'gem', active: true, lvl: 3 },
  { kind: 'item', label: '模型体验', icon: 'exp', lvl: 2 },
  { kind: 'group', label: 'API 管理', icon: 'apicloud', lvl: 2, chevron: 'down' },
  { kind: 'sub', label: '模型链路分析', icon: 'link', lvl: 2 },
  { kind: 'section', label: '基础资源' },
  { kind: 'item', label: '存储管理', icon: 'hdd', lvl: 2 },
  { kind: 'item', label: '镜像管理', icon: 'mirror', lvl: 2 },
  { kind: 'section', label: '算力评测' },
  { kind: 'item', label: '算力评估', icon: 'percent', lvl: 2 },
  { kind: 'item', label: '性能评估', icon: 'wave', lvl: 2 },
]

export function SideNav() {
  return (
    <aside className="w-[256px] shrink-0 bg-white border-r border-[#eaeaea] flex flex-col overflow-y-auto select-none">
      {/* 节点 / 租户胶囊 */}
      <div className="pl-[14px] pt-[22px]">
        <div className="flex items-center gap-2 rounded-md bg-[#edf1f8] pl-[11px] pr-2.5 h-[47px] w-[201px]">
          <span className="text-[18px] text-[#166EFF] whitespace-nowrap">长沙…</span>
          <span className="text-[18px] text-[#166EFF]">–</span>
          <span className="text-[18px] text-[#166EFF] whitespace-nowrap">zhan…</span>
          <span className="ml-auto">
            <Icon name="switchbox" size={24} color="#166EFF" />
          </span>
        </div>
      </div>

      {/* 标题 */}
      <div className="pl-[26px] pt-[20px] pb-[15px] text-[18px] font-bold text-[#111]">算力平台</div>

      {/* 菜单行（行高 45px） */}
      <nav className="flex-1">
        {NAV_ROWS.map((row) => {
          if (row.kind === 'section') {
            return (
              <div key={row.label} className="h-[45px] flex items-start pt-[15px] pl-[28px] text-[15px] text-[#8c8c8c]">
                {row.label}
              </div>
            )
          }
          const iconColor = row.active ? '#166EFF' : '#1f2329'
          if (row.active) {
            return (
              <div key={row.label} className="h-[45px] flex items-center">
                <div className="ml-[8px] h-[35px] rounded-md bg-[#ECF1FD] flex items-center pl-[56px] pr-3 w-[214px]">
                  <Icon name={row.icon!} size={20} color={iconColor} />
                  <span className="ml-[8px] text-[18px] text-[#166EFF]">{row.label}</span>
                </div>
              </div>
            )
          }
          const indent = row.lvl === 1 ? 'pl-[26px]' : row.lvl === 3 ? 'pl-[64px]' : 'pl-[46px]'
          return (
            <div
              key={row.label}
              className={`h-[45px] flex items-center cursor-pointer hover:bg-[#f7f8fa] ${indent}`}
            >
              {row.icon && <Icon name={row.icon} size={20} color={iconColor} />}
              <span className="ml-[9px] text-[18px] text-[#262626]">
                {row.label}
              </span>
              {row.chevron && (
                <Icon name={row.chevron === 'up' ? 'chevronUp' : 'chevronDown'} size={14} color="#999" className="ml-[21px]" />
              )}
            </div>
          )
        })}
      </nav>

      {/* 底部收起按钮 */}
      <div className="shrink-0 border-t border-[#f0f0f0] pt-[10px] pb-2 pl-4">
        <button className="cursor-pointer block ml-[159px]" aria-label="收起侧边栏">
          <Icon name="collapse" size={18} color="#666" />
        </button>
      </div>
    </aside>
  )
}
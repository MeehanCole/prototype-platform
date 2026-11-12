import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocPanel, DocProvider, FEATURES } from '../feature-tags'
import { PlatformHeader, SideNav } from '../../OnlineService/_shared'

interface ServiceBinding {
  name: string
  model: string
  running: boolean
  path?: string
}

interface ApiKeyItem {
  id: string
  name: string
  maskedKey: string
  plainKey: string
  limit: string
  officialServices: ServiceBinding[]
  privateServices: ServiceBinding[]
  createdAt: string
  // 限流配置
  tokenQuotaEnabled?: boolean
  tokenQuota?: string
  tpmEnabled?: boolean
  tpmLimit?: string
  // 描述
  description?: string
  // IP 白名单
  whitelistEnabled?: boolean
  whitelist?: string[]
  // 启用 / 禁用状态（默认 true）
  enabled?: boolean
}

const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: '1',
    name: 'api-key-202507271600',
    maskedKey: 'sk-****************************',
    plainKey: 'sk-7xK9pL2mQ8vN4wT6yR1zA3bC5dE0fG9q',
    limit: '–',
    officialServices: [],
    privateServices: [],
    createdAt: '5 分钟前',
    tokenQuotaEnabled: true,
    tokenQuota: '111',
    tpmEnabled: true,
    tpmLimit: '11',
    description: '主要用于生产环境核心流量调用',
    whitelistEnabled: true,
    whitelist: ['192.168.1.100', '10.0.0.0/24'],
    enabled: true,
  },
  {
    id: '2',
    name: 'api-key-01',
    maskedKey: 'sk-****************************',
    plainKey: 'sk-9mX2wE8rT4yU1iO6pA3sD5fG7hJ0kL2v',
    limit: '–',
    officialServices: [],
    privateServices: [
      { name: "e'e", model: '无', running: false },
      { name: 'deepseek-test', model: 'deepseek-v3-pro', running: true, path: '/在线服务优化/onlineservicedetail?name=deepseek-test&v=v2' },
    ],
    createdAt: '3 个月前',
    tokenQuotaEnabled: false,
    tpmEnabled: false,
    description: '内部测试专用密钥',
    enabled: true,
  },
  {
    id: '3',
    name: 'api-key-202507271520',
    maskedKey: 'sk-****************************',
    plainKey: 'sk-4bV7nC1xZ9mQ3wE5rT8yU2iO6pA0sD8f',
    limit: '–',
    officialServices: [],
    privateServices: [
      { name: 'gtai-72b', model: 'Qwen2.5-72B-Instruct', running: true, path: '/在线服务优化/onlineservicedetail?name=gtai-72b&v=v2' },
    ],
    createdAt: '3 个月前',
    tokenQuotaEnabled: false,
    tpmEnabled: false,
    description: '',
    enabled: true,
  },
  {
    id: '4',
    name: 'api-key-202507271442',
    maskedKey: 'sk-****************************',
    plainKey: 'sk-1zX3cE5vB7nN9mM2qW4rT6yU8iO0pA4s',
    limit: '–',
    officialServices: [],
    privateServices: [],
    createdAt: '4 个月前',
    tokenQuotaEnabled: false,
    tpmEnabled: false,
    description: '',
    enabled: false,
  },
  {
    id: '5',
    name: 'api-key-202506141443',
    maskedKey: 'sk-****************************',
    plainKey: 'sk-8aC2vB4nN6mM8qW0rT2yU4iO6pA8sD0f',
    limit: '–',
    officialServices: [
      { name: 'muxi-zgq', model: 'Qwen2.5-0.5B-Instruct', running: true },
    ],
    privateServices: [],
    createdAt: '7 个月前',
    tokenQuotaEnabled: false,
    tpmEnabled: false,
    description: '早期接入的旧密钥，仅供灰度验证',
    whitelistEnabled: true,
    whitelist: ['2408:400a::1', '172.16.0.0/16', '2001:db8::/32'],
    enabled: true,
  },
]

// 可供绑定的官方服务选项
const OFFICIAL_OPTIONS = [
  { name: 'muxi-zgq', model: 'Qwen2-0.5B-Instruct', running: true },
  { name: 'qwen-instruct', model: 'Qwen2-0.5B-Instruct', running: true },
  { name: 'deepseek-chat', model: 'DeepSeek-V3', running: true },
  { name: 'glm-4-flash', model: 'GLM-4-Flash', running: true },
]

// 可供绑定的私有服务选项
const PRIVATE_OPTIONS = [
  { name: 'deepseek-test', model: 'deepseek-v3-pro', running: true, path: '/在线服务优化/onlineservicedetail?name=deepseek-test&v=v2' },
  { name: 'gtai-72b', model: 'Qwen2.5-72B-Instruct', running: true, path: '/在线服务优化/onlineservicedetail?name=gtai-72b&v=v2' },
  { name: "e'e", model: '无', running: false },
  { name: 'component-test', model: 'deepseek-v3-pro', running: true, path: '/在线服务优化/onlineservicedetail?name=component-test&v=v2' },
  { name: 'ctc', model: '无', running: false },
]

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[20px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#166EFF]' : 'bg-[#dcdfe6]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-[20px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function Page({ __showFeat = false }: { __showFeat?: boolean }) {
  const [docCode, setDocCode] = useState<string | null>(null)
  const navigate = useNavigate()

  // 搜索关键字
  const [keyword, setKeyword] = useState('')
  // 数据源
  const [list, setList] = useState<ApiKeyItem[]>(INITIAL_API_KEYS)
  // 明文可见状态 Map
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({})
  // 复制反馈
  const [copiedId, setCopiedId] = useState<string | null>(null)
  // 刷新动效
  const [refreshing, setRefreshing] = useState(false)

  // 弹窗状态：'create' | 'edit' | 'bind' | 'rateLimit' | 'whitelist' | 'delete' | 'toggleStatus' | null
  const [modalType, setModalType] = useState<
    'create' | 'edit' | 'bind' | 'rateLimit' | 'whitelist' | 'delete' | 'toggleStatus' | null
  >(null)
  const [activeItem, setActiveItem] = useState<ApiKeyItem | null>(null)
  // 操作列更多下拉菜单当前展开的行 ID
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // 弹窗表单状态
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')

  // 服务绑定弹窗状态
  const [selectedOfficial, setSelectedOfficial] = useState<string>('')
  const [selectedPrivate, setSelectedPrivate] = useState<string>('')
  const [showOfficialDropdown, setShowOfficialDropdown] = useState(false)
  const [showPrivateDropdown, setShowPrivateDropdown] = useState(false)

  // 设置限流弹窗状态
  const [quotaSwitch, setQuotaSwitch] = useState(false)
  const [quotaValue, setQuotaValue] = useState('')
  const [tpmSwitch, setTpmSwitch] = useState(false)
  const [tpmValue, setTpmValue] = useState('')

  // 设置白名单弹窗状态
  const [whitelistSwitch, setWhitelistSwitch] = useState(false)
  const [whitelistItems, setWhitelistItems] = useState<string[]>([])
  const [whitelistDraft, setWhitelistDraft] = useState('')

  // 过滤后的列表
  const filteredList = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return list
    return list.filter((item) => item.name.toLowerCase().includes(kw))
  }, [list, keyword])

  // 复制 Key 到剪贴板
  const handleCopy = (item: ApiKeyItem) => {
    try {
      navigator.clipboard?.writeText(item.plainKey)
    } catch {
      /* ignore */
    }
    setCopiedId(item.id)
    setTimeout(() => {
      setCopiedId((prev) => (prev === item.id ? null : prev))
    }, 1500)
  }

  // 切换可见性
  const toggleVisibility = (id: string) => {
    setVisibleMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // 点击刷新
  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }

  // 打开创建 API Key 弹窗
  const openCreateModal = () => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const MM = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    setNameInput(`api-key-${yyyy}${MM}${dd}${hh}${mm}`)
    setDescInput('')
    setActiveItem(null)
    setModalType('create')
  }

  // 打开编辑 API Key 弹窗
  const openEditModal = (item: ApiKeyItem) => {
    setActiveItem(item)
    setNameInput(item.name)
    setDescInput(item.description || '')
    setModalType('edit')
  }

  // 打开删除确认弹窗
  const openDeleteModal = (item: ApiKeyItem) => {
    setActiveItem(item)
    setModalType('delete')
  }

  // 打开启用 / 禁用确认弹窗
  const openToggleStatusModal = (item: ApiKeyItem) => {
    setActiveItem(item)
    setModalType('toggleStatus')
  }

  // 打开服务绑定弹窗
  const openBindModal = (item: ApiKeyItem) => {
    setActiveItem(item)
    setSelectedOfficial(item.officialServices[0]?.name || '')
    setSelectedPrivate(item.privateServices[0]?.name || '')
    setShowOfficialDropdown(false)
    setShowPrivateDropdown(false)
    setModalType('bind')
  }

  // 打开设置限流弹窗
  const openRateLimitModal = (item: ApiKeyItem) => {
    setActiveItem(item)
    setQuotaSwitch(item.tokenQuotaEnabled ?? true)
    setQuotaValue(item.tokenQuota || '')
    setTpmSwitch(item.tpmEnabled ?? true)
    setTpmValue(item.tpmLimit || '')
    setModalType('rateLimit')
  }

  // 打开设置白名单弹窗
  const openWhitelistModal = (item: ApiKeyItem) => {
    setActiveItem(item)
    setWhitelistSwitch(item.whitelistEnabled ?? false)
    setWhitelistItems(item.whitelist || [])
    setWhitelistDraft('')
    setModalType('whitelist')
  }

  // 白名单：解析输入文本（支持逗号、中文逗号、分号、空格、换行分隔）
  const parseWhitelistDraft = (raw: string): string[] =>
    raw
      .split(/[,，;；\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)

  // 白名单：追加一个 IP（用于回车 / 逗号提交）
  const addWhitelistItem = (raw: string) => {
    const vals = parseWhitelistDraft(raw)
    if (vals.length === 0) return
    setWhitelistItems((prev) => {
      const next = [...prev]
      vals.forEach((v) => {
        if (!next.includes(v)) next.push(v)
      })
      return next
    })
    setWhitelistDraft('')
  }

  // 白名单：删除一个 IP
  const removeWhitelistItem = (ip: string) => {
    setWhitelistItems((prev) => prev.filter((x) => x !== ip))
  }

  // 保存新建
  const handleSaveCreate = () => {
    if (!nameInput.trim()) return
    const newItem: ApiKeyItem = {
      id: String(Date.now()),
      name: nameInput.trim(),
      maskedKey: 'sk-****************************',
      plainKey: `sk-${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      limit: '–',
      officialServices: [],
      privateServices: [],
      createdAt: '刚刚',
      tokenQuotaEnabled: false,
      tpmEnabled: false,
      description: descInput.trim(),
    }
    setList([newItem, ...list])
    setModalType(null)
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (!activeItem || !nameInput.trim()) return
    setList((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, name: nameInput.trim(), description: descInput.trim() } : item)),
    )
    setModalType(null)
  }

  // 确认删除
  const handleConfirmDelete = () => {
    if (!activeItem) return
    setList((prev) => prev.filter((item) => item.id !== activeItem.id))
    setModalType(null)
  }

  // 确认切换启用/禁用状态
  const handleConfirmToggleStatus = () => {
    if (!activeItem) return
    const targetStatus = activeItem.enabled === false
    setList((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, enabled: targetStatus } : item)),
    )
    setModalType(null)
  }

  // 保存服务绑定
  const handleSaveBind = () => {
    if (!activeItem) return
    const offOpt = OFFICIAL_OPTIONS.find((o) => o.name === selectedOfficial)
    const priOpt = PRIVATE_OPTIONS.find((p) => p.name === selectedPrivate)

    setList((prev) =>
      prev.map((item) => {
        if (item.id !== activeItem.id) return item
        return {
          ...item,
          officialServices: offOpt ? [offOpt] : [],
          privateServices: priOpt ? [priOpt] : [],
        }
      }),
    )
    setModalType(null)
  }

  // 保存设置限流
  const handleSaveRateLimit = () => {
    if (!activeItem) return
    let limitDisplay = '–'
    if (quotaSwitch && quotaValue) {
      limitDisplay = `${Number(quotaValue).toLocaleString()} Tokens`
    } else if (tpmSwitch && tpmValue) {
      limitDisplay = `${Number(tpmValue).toLocaleString()} TPM`
    }
    setList((prev) =>
      prev.map((item) => {
        if (item.id !== activeItem.id) return item
        return {
          ...item,
          limit: limitDisplay,
          tokenQuotaEnabled: quotaSwitch,
          tokenQuota: quotaValue,
          tpmEnabled: tpmSwitch,
          tpmLimit: tpmValue,
        }
      }),
    )
    setModalType(null)
  }

  // 保存设置白名单
  const handleSaveWhitelist = () => {
    if (!activeItem) return
    const ips = whitelistItems
    setList((prev) =>
      prev.map((item) => {
        if (item.id !== activeItem.id) return item
        return {
          ...item,
          whitelistEnabled: whitelistSwitch,
          whitelist: whitelistSwitch ? ips : [],
        }
      }),
    )
    setModalType(null)
  }

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="relative h-[calc((100vh-57px)/0.9)] w-[calc(100%/0.9)] origin-top-left scale-[0.9] flex flex-col overflow-hidden bg-white text-[#1f2329] [font-family:'PingFang_SC','Helvetica_Neue',Arial,sans-serif]">
        {/* 产品顶栏 */}
        <PlatformHeader />

        <div className="flex-1 min-h-0 flex">
          {/* 左侧侧边栏，activeKey 指向 API Key */}
          <SideNav activeKey="API Key" />

          {/* 主工作区 */}
          <main className="flex-1 min-w-0 flex flex-col px-[24px] pt-[20px] pb-[16px] overflow-hidden bg-white">
            {/* 页面主标题 */}
            <div className="shrink-0 flex items-center justify-between pb-[16px]">
              <h1 className="text-[18px] font-bold text-[#1f2329] leading-[26px]">API Key 管理</h1>
            </div>

            {/* 工具栏：新建按钮 + 搜索与刷新 */}
            <div className="shrink-0 flex items-center justify-between pb-[14px]">
              {/* 左侧：+ 新建 按钮 */}
              <button
                onClick={openCreateModal}
                className="h-[32px] px-[14px] inline-flex items-center gap-[6px] rounded-[4px] bg-[#166EFF] text-[13px] text-white hover:bg-[#135ad4] transition-colors cursor-pointer shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M8 5v6M5 8h6" />
                </svg>
                <span>新建</span>
              </button>

              {/* 右侧：搜索框 + 刷新按钮 */}
              <div className="flex items-center gap-[10px]">
                <div className="relative">
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="请输入名称搜索"
                    className="h-[32px] w-[210px] rounded-[4px] border border-[#d9d9d9] bg-white pl-[12px] pr-[30px] text-[13px] text-[#333] placeholder:text-[#bfbfbf] outline-none transition-colors focus:border-[#166EFF]"
                  />
                  <span className="pointer-events-none absolute right-[9px] top-1/2 -translate-y-1/2 text-[#999]">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="7" cy="7" r="4.5" />
                      <path d="m10.5 10.5 3.5 3.5" />
                    </svg>
                  </span>
                </div>

                <button
                  onClick={handleRefresh}
                  className="h-[32px] w-[32px] rounded-[4px] border border-[#d9d9d9] bg-white flex items-center justify-center text-[#666] hover:text-[#166EFF] hover:border-[#166EFF] transition-colors cursor-pointer shadow-sm"
                  title="刷新列表"
                  aria-label="刷新"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={refreshing ? 'animate-spin text-[#166EFF]' : ''}
                    aria-hidden
                  >
                    <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
                    <path d="M13.5 2.5v3.6h-3.6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 表格容器 */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="h-[38px] bg-[#F4F6F9] text-[#4a5475] font-medium border-b border-[#ececec] select-none">
                      <th className="pl-[16px] font-normal w-[8%]">名称</th>
                      <th className="font-normal w-[12%]">API Key</th>
                      <th className="font-normal w-[10%]">描述</th>
                      <th className="font-normal w-[10%]">
                        <div className="inline-flex items-center gap-1.5 group relative cursor-help">
                          <span>官方服务</span>
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="#4a5475" className="shrink-0" aria-hidden>
                            <circle cx="8" cy="8" r="7.5" fill="#4a5475" />
                            <circle cx="8" cy="4.5" r="1.1" fill="#fff" />
                            <path d="M7 7.2h1.6V12H7z" fill="#fff" />
                            <path d="M6.3 12h3v-1h-3z" fill="#fff" />
                          </svg>
                          {/* 状态注释浮层 */}
                          <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-30 hidden group-hover:flex items-center gap-[6px] px-[12px] py-[7px] bg-white border border-[#e8e8e8] rounded-[4px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] whitespace-nowrap text-[12px]">
                            <span className="text-[#595959]">服务状态:</span>
                            <span className="w-[7px] h-[7px] rounded-full bg-[#52C18E] ml-1 shrink-0" />
                            <span className="text-[#262626]">已发布</span>
                            <span className="text-[#d9d9d9] mx-1">|</span>
                            <span className="w-[7px] h-[7px] rounded-full bg-[#F82709] shrink-0" />
                            <span className="text-[#262626]">未发布</span>
                            <div className="absolute -bottom-[5px] left-[24px] w-[8px] h-[8px] bg-white border-b border-r border-[#e8e8e8] rotate-45 transform" />
                          </div>
                        </div>
                      </th>
                      <th className="font-normal w-[10%]">
                        <div className="inline-flex items-center gap-1.5 group relative cursor-help">
                          <span>私有服务</span>
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="#4a5475" className="shrink-0" aria-hidden>
                            <circle cx="8" cy="8" r="7.5" fill="#4a5475" />
                            <circle cx="8" cy="4.5" r="1.1" fill="#fff" />
                            <path d="M7 7.2h1.6V12H7z" fill="#fff" />
                            <path d="M6.3 12h3v-1h-3z" fill="#fff" />
                          </svg>
                          {/* 状态注释浮层 */}
                          <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-30 hidden group-hover:flex items-center gap-[6px] px-[12px] py-[7px] bg-white border border-[#e8e8e8] rounded-[4px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] whitespace-nowrap text-[12px]">
                            <span className="text-[#595959]">服务状态:</span>
                            <span className="w-[7px] h-[7px] rounded-full bg-[#52C18E] ml-1 shrink-0" />
                            <span className="text-[#262626]">已发布</span>
                            <span className="text-[#d9d9d9] mx-1">|</span>
                            <span className="w-[7px] h-[7px] rounded-full bg-[#F82709] shrink-0" />
                            <span className="text-[#262626]">未发布</span>
                            <div className="absolute -bottom-[5px] left-[24px] w-[8px] h-[8px] bg-white border-b border-r border-[#e8e8e8] rotate-45 transform" />
                          </div>
                        </div>
                      </th>
                      <th className="font-normal w-[8%]">限额配置</th>
                      <th className="font-normal w-[10%]">白名单</th>
                      <th className="font-normal w-[7%]">创建时间</th>
                      <th className="pr-[16px] font-normal w-[1%] whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f2f2]">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="h-[180px] text-center text-[#999] text-[13px]">
                          暂无匹配数据
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((row) => {
                        const isVisible = !!visibleMap[row.id]
                        const isCopied = copiedId === row.id
                        return (
                          <tr key={row.id} className="min-h-[48px] hover:bg-[#fafbfe] transition-colors">
                            {/* 名称 */}
                            <td className="pl-[16px] text-[#262626] font-normal truncate">
                              <div className="flex items-center gap-2">
                                <span className={row.enabled === false ? 'text-[#8c8c8c]' : 'text-[#262626]'}>
                                  {row.name}
                                </span>
                                {row.enabled === false && (
                                  <span className="inline-block px-[6px] py-[0px] text-[11px] leading-[18px] rounded-[3px] bg-[#f5f5f5] text-[#8c8c8c] border border-[#e0e0e0]">
                                    已禁用
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* API Key */}
                            <td className="text-[#333] pr-2">
                              <div className="flex items-center gap-[6px]">
                                <span className="font-mono text-[12px] text-[#555] tracking-tight truncate max-w-[170px]">
                                  {isVisible ? row.plainKey : row.maskedKey}
                                </span>
                                {/* 复制按钮：蓝色 #166EFF */}
                                <button
                                  onClick={() => handleCopy(row)}
                                  className="text-[#166EFF] hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                                  title={isCopied ? '已复制！' : '复制 API Key'}
                                >
                                  {isCopied ? (
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#52C41A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                      <path d="M3 8.5 6.5 12 13 4.5" />
                                    </svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#166EFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                      <rect x="5.5" y="5.5" width="8" height="8" rx="1.2" />
                                      <path d="M3.5 10.5V3.5a1 1 0 0 1 1-1h7" />
                                    </svg>
                                  )}
                                </button>
                                {/* 眼睛查看/隐藏图标：灰色 #909399 */}
                                <button
                                  onClick={() => toggleVisibility(row.id)}
                                  className="text-[#909399] hover:text-[#166EFF] transition-colors cursor-pointer shrink-0"
                                  title={isVisible ? '隐藏' : '查看明文'}
                                >
                                  {isVisible ? (
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                      <circle cx="8" cy="8" r="2.5" />
                                      <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" />
                                    </svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                      <circle cx="8" cy="8" r="2.5" />
                                      <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" />
                                      <path d="M3 3l10 10" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* 描述 */}
                            <td className="text-[#595959] pr-2 truncate" title={row.description || undefined}>
                              {row.description || '–'}
                            </td>

                            {/* 官方服务 */}
                            <td className="pr-2">
                              {row.officialServices.length === 0 ? (
                                <span className="text-[#8c8c8c]">–</span>
                              ) : (
                                <div className="flex flex-col gap-[4px] py-[6px]">
                                  {row.officialServices.map((s) => (
                                    <div key={s.name} className="flex items-center gap-[5px] text-[12px] truncate">
                                      <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${s.running ? 'bg-[#52C18E]' : 'bg-[#F82709]'}`} />
                                      <span className="text-[#333] truncate">
                                        {s.name} <span className="text-[#8c8c8c]">|</span> {s.model}
                                      </span>
                                      {/* 链条 Link 图标：蓝色 #166EFF */}
                                      <button
                                        onClick={() => s.path && navigate(s.path)}
                                        className={`text-[#166EFF] hover:opacity-80 transition-opacity shrink-0 inline-flex items-center ${s.path ? 'cursor-pointer' : 'cursor-default'}`}
                                        title={s.path ? `查看 ${s.name} 在线服务详情` : undefined}
                                      >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>

                            {/* 私有服务 */}
                            <td className="pr-2">
                              {row.privateServices.length === 0 ? (
                                <span className="text-[#8c8c8c]">–</span>
                              ) : (
                                <div className="flex flex-col gap-[4px] py-[6px]">
                                  {row.privateServices.map((s) => (
                                    <div key={s.name} className="flex items-center gap-[5px] text-[12px] truncate">
                                      <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${s.running ? 'bg-[#52C18E]' : 'bg-[#F82709]'}`} />
                                      <span
                                        onClick={() => s.path && navigate(s.path)}
                                        className={`text-[#333] truncate ${s.path ? 'hover:text-[#166EFF] cursor-pointer' : ''}`}
                                      >
                                        {s.name} <span className="text-[#8c8c8c]">|</span> {s.model}
                                      </span>
                                      {/* 链条 Link 图标：蓝色 #166EFF */}
                                      <button
                                        onClick={() => s.path && navigate(s.path)}
                                        className={`text-[#166EFF] hover:opacity-80 transition-opacity shrink-0 inline-flex items-center ${s.path ? 'cursor-pointer' : 'cursor-default'}`}
                                        title={s.path ? `查看 ${s.name} 在线服务详情` : undefined}
                                      >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>

                            {/* 限额配置 */}
                            <td className="text-[#262626] pr-2">
                              {row.tokenQuotaEnabled || row.tpmEnabled ? (
                                <div className="flex flex-col gap-[2px] py-[6px] text-[12px] leading-[18px]">
                                  {row.tokenQuotaEnabled && (
                                    <div className="whitespace-nowrap">
                                      <span className="text-[#333]">总Token额度：</span>
                                      <span className="text-[#333] ml-1">{row.tokenQuota || '111'} Tokens</span>
                                    </div>
                                  )}
                                  {row.tpmEnabled && (
                                    <div className="whitespace-nowrap">
                                      <span className="text-[#333]">请求Token上限：</span>
                                      <span className="text-[#333] ml-1">{row.tpmLimit || '11'} Tokens / 分钟</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[#595959] text-[13px]">–</span>
                              )}
                            </td>

                            {/* 白名单 */}
                            <td className="pr-2">
                              {!row.whitelistEnabled || !row.whitelist || row.whitelist.length === 0 ? (
                                <span className="text-[#8c8c8c]">–</span>
                              ) : (
                                <div className="flex flex-wrap gap-[4px] py-[4px]">
                                  {row.whitelist.slice(0, 4).map((ip) => (
                                    <span
                                      key={ip}
                                      className="inline-block max-w-[130px] truncate rounded-[3px] bg-[#eef4ff] text-[#166EFF] border border-[#d6e4ff] px-[6px] py-[1px] text-[11px] leading-[18px]"
                                      title={ip}
                                    >
                                      {ip}
                                    </span>
                                  ))}
                                  {row.whitelist.length > 4 && (
                                    <span className="inline-block text-[#8c8c8c] px-[2px] py-[1px] text-[11px] leading-[18px]">
                                      +{row.whitelist.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* 创建时间 */}
                            <td className="text-[#595959] whitespace-nowrap">{row.createdAt}</td>

                            {/* 操作列：参考样式，外部为 编辑、服务绑定 及 ··· 气泡菜单 */}
                            <td className="pr-[16px]">
                              <div className="flex items-center gap-[12px] text-[13px] text-[#166EFF] whitespace-nowrap">
                                <a
                                  onClick={() => openEditModal(row)}
                                  className="hover:underline cursor-pointer"
                                >
                                  编辑
                                </a>
                                <a
                                  onClick={() => openBindModal(row)}
                                  className="hover:underline cursor-pointer"
                                >
                                  服务绑定
                                </a>
                                <div className="relative inline-flex items-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenMenuId(openMenuId === row.id ? null : row.id)
                                    }}
                                    className="text-[#166EFF] hover:opacity-80 transition-opacity cursor-pointer p-0.5 inline-flex items-center justify-center font-bold tracking-widest text-[14px]"
                                    title="更多操作"
                                  >
                                    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                                      <circle cx="3" cy="8" r="1.5" />
                                      <circle cx="8" cy="8" r="1.5" />
                                      <circle cx="13" cy="8" r="1.5" />
                                    </svg>
                                  </button>

                                  {/* 气泡下拉菜单，参考用户提供样式 */}
                                  {openMenuId === row.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-30"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setOpenMenuId(null)
                                        }}
                                      />
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-[-14px] top-[calc(100%+8px)] z-40 w-[112px] bg-white rounded-[6px] border border-[#e4e7ed] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-[6px] flex flex-col text-[13px] select-none"
                                      >
                                        {/* 顶部白色小尖角朝上指向 ··· */}
                                        <div className="absolute -top-[5px] right-[20px] w-[8px] h-[8px] bg-white border-t border-l border-[#e4e7ed] rotate-45 transform" />

                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null)
                                            openRateLimitModal(row)
                                          }}
                                          className="h-[34px] px-[12px] text-center text-[#333] hover:text-[#166EFF] hover:bg-[#f5f7fa] transition-colors cursor-pointer"
                                        >
                                          设置限流
                                        </button>
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null)
                                            openWhitelistModal(row)
                                          }}
                                          className="h-[34px] px-[12px] text-center text-[#333] hover:text-[#166EFF] hover:bg-[#f5f7fa] transition-colors cursor-pointer"
                                        >
                                          设置白名单
                                        </button>
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null)
                                            openToggleStatusModal(row)
                                          }}
                                          className="h-[34px] px-[12px] text-center text-[#333] hover:text-[#166EFF] hover:bg-[#f5f7fa] transition-colors cursor-pointer"
                                        >
                                          {row.enabled === false ? '启用' : '禁用'}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setOpenMenuId(null)
                                            openDeleteModal(row)
                                          }}
                                          className="h-[34px] px-[12px] text-center text-[#333] hover:text-[#F82709] hover:bg-[#f5f7fa] transition-colors cursor-pointer"
                                        >
                                          删除
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 底部分页栏 */}
              <div className="h-[48px] shrink-0 border-t border-[#f0f0f0] bg-white flex items-center justify-end px-[16px] text-[13px] text-[#595959] gap-[12px] select-none">
                <span>共 {filteredList.length} 条</span>
                <span className="inline-flex items-center justify-between h-[28px] w-[90px] rounded border border-[#d9d9d9] px-[8px] bg-white text-[#333] cursor-pointer">
                  10条/页
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="m2 3.5 3 3 3-3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="flex items-center gap-[6px]">
                  <button className="h-[28px] w-[28px] flex items-center justify-center rounded bg-[#f5f5f5] text-[#bbb] cursor-not-allowed">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M6.5 1.5 3 5l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button className="h-[28px] w-[28px] rounded bg-[#166EFF] text-white font-medium flex items-center justify-center cursor-pointer">
                    1
                  </button>
                  <button className="h-[28px] w-[28px] flex items-center justify-center rounded bg-[#f5f5f5] text-[#bbb] cursor-not-allowed">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M3.5 1.5 7 5 3.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <span>前往</span>
                <input
                  defaultValue="1"
                  className="h-[28px] w-[44px] rounded border border-[#d9d9d9] text-center text-[13px] text-[#333] outline-none"
                />
                <span>页</span>
              </div>
            </div>
          </main>
        </div>

        {/* 悬浮 AI 助手按钮 */}
        <button
          className="absolute top-[920px] right-0 h-[44px] w-[26px] rounded-l-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] border border-[#e6e9f0] border-r-0 flex items-center justify-end pr-[3px] cursor-pointer"
          aria-label="AI 助手"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <circle cx="9" cy="9" r="7" fill="#eaf1ff" />
            <circle cx="9" cy="9" r="7" fill="none" stroke="#166EFF" strokeWidth="1" />
            <circle cx="7.2" cy="7.2" r="1.4" fill="#166EFF" />
            <circle cx="11.4" cy="10.6" r="2.2" fill="#166EFF" />
          </svg>
        </button>

        {/* ============================================================== */}
        {/* ---------- 交互弹窗：1:1 还原用户上传的 4 个真实弹窗 ---------- */}
        {/* ============================================================== */}

        {/* 1.【创建 API Key】弹窗（对应图 4：media_1794278637938_73f950fa.png） */}
        {modalType === 'create' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
            <div className="w-[560px] rounded-[8px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="h-[56px] px-[24px] flex items-center justify-between border-b border-[#f0f0f0]">
                <h3 className="text-[16px] font-semibold text-[#1f2329]">创建 API Key</h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-[#999] hover:text-[#333] transition-colors cursor-pointer text-[18px] leading-none"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              <div className="p-[24px] flex flex-col gap-[20px]">
                <div className="flex items-center">
                  <label className="w-[60px] text-[14px] text-[#333] shrink-0 select-none">
                    名称 <span className="text-[#f5222d]">*</span>
                  </label>
                  <div className="relative flex-1">
                    <input
                      value={nameInput}
                      maxLength={32}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="请输入 API Key 名称"
                      className="h-[36px] w-full rounded-[4px] border border-[#dcdfe6] pl-[12px] pr-[65px] text-[13px] text-[#333] placeholder:text-[#bfbfbf] outline-none transition-colors focus:border-[#166EFF]"
                    />
                    <span className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[12px] text-[#909399] select-none font-mono">
                      {nameInput.length} / 32
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <label className="w-[60px] pt-[7px] text-[14px] text-[#333] shrink-0 select-none">
                    描述
                  </label>
                  <div className="relative flex-1">
                    <textarea
                      value={descInput}
                      maxLength={200}
                      onChange={(e) => setDescInput(e.target.value)}
                      placeholder="请输入 API Key 描述（选填）"
                      rows={3}
                      className="w-full rounded-[4px] border border-[#dcdfe6] pl-[12px] pr-[12px] py-[8px] text-[13px] text-[#333] placeholder:text-[#bfbfbf] outline-none transition-colors resize-none focus:border-[#166EFF]"
                    />
                    <span className="pointer-events-none absolute right-[12px] bottom-[8px] text-[12px] text-[#909399] select-none font-mono">
                      {descInput.length} / 200
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[64px] px-[24px] flex items-center justify-end gap-[12px] border-t border-[#f0f0f0]">
                <button
                  onClick={() => setModalType(null)}
                  className="h-[32px] px-[20px] rounded-[4px] border border-[#dcdfe6] bg-white text-[13px] text-[#606266] hover:text-[#166EFF] hover:border-[#166EFF] transition-colors cursor-pointer"
                >
                  取 消
                </button>
                <button
                  onClick={handleSaveCreate}
                  disabled={!nameInput.trim()}
                  className={`h-[32px] px-[20px] rounded-[4px] text-[13px] text-white transition-colors shadow-sm ${
                    nameInput.trim() ? 'bg-[#166EFF] hover:bg-[#135ad4] cursor-pointer' : 'bg-[#a0cfff] cursor-not-allowed'
                  }`}
                >
                  确 定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2.【编辑 API Key】弹窗（对应图 1：media_1794278598946_5bcaf54b.png） */}
        {modalType === 'edit' && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
            <div className="w-[560px] rounded-[8px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="h-[56px] px-[24px] flex items-center justify-between border-b border-[#f0f0f0]">
                <h3 className="text-[16px] font-semibold text-[#1f2329]">编辑 API Key</h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-[#999] hover:text-[#333] transition-colors cursor-pointer text-[18px] leading-none"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              <div className="p-[24px] flex flex-col gap-[20px]">
                <div className="flex items-center">
                  <label className="w-[60px] text-[14px] text-[#333] shrink-0 select-none">
                    名称 <span className="text-[#f5222d]">*</span>
                  </label>
                  <div className="relative flex-1">
                    <input
                      value={nameInput}
                      maxLength={32}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="请输入 API Key 名称"
                      className="h-[36px] w-full rounded-[4px] border border-[#dcdfe6] pl-[12px] pr-[65px] text-[13px] text-[#333] placeholder:text-[#bfbfbf] outline-none transition-colors focus:border-[#166EFF]"
                    />
                    <span className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[12px] text-[#909399] select-none font-mono">
                      {nameInput.length} / 32
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <label className="w-[60px] pt-[7px] text-[14px] text-[#333] shrink-0 select-none">
                    描述
                  </label>
                  <div className="relative flex-1">
                    <textarea
                      value={descInput}
                      maxLength={200}
                      onChange={(e) => setDescInput(e.target.value)}
                      placeholder="请输入 API Key 描述（选填）"
                      rows={3}
                      className="w-full rounded-[4px] border border-[#dcdfe6] pl-[12px] pr-[12px] py-[8px] text-[13px] text-[#333] placeholder:text-[#bfbfbf] outline-none transition-colors resize-none focus:border-[#166EFF]"
                    />
                    <span className="pointer-events-none absolute right-[12px] bottom-[8px] text-[12px] text-[#909399] select-none font-mono">
                      {descInput.length} / 200
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[64px] px-[24px] flex items-center justify-end gap-[12px] border-t border-[#f0f0f0]">
                <button
                  onClick={() => setModalType(null)}
                  className="h-[32px] px-[20px] rounded-[4px] border border-[#dcdfe6] bg-white text-[13px] text-[#606266] hover:text-[#166EFF] hover:border-[#166EFF] transition-colors cursor-pointer"
                >
                  取 消
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!nameInput.trim()}
                  className={`h-[32px] px-[20px] rounded-[4px] text-[13px] text-white transition-colors shadow-sm ${
                    nameInput.trim() ? 'bg-[#166EFF] hover:bg-[#135ad4] cursor-pointer' : 'bg-[#a0cfff] cursor-not-allowed'
                  }`}
                >
                  确 定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3.【服务绑定】弹窗（对应图 2：media_1794278612875_c1c2e882.png） */}
        {modalType === 'bind' && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
            <div className="w-[620px] rounded-[8px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="h-[56px] px-[24px] flex items-center justify-between border-b border-[#f0f0f0]">
                <h3 className="text-[16px] font-semibold text-[#1f2329]">服务绑定</h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-[#999] hover:text-[#333] transition-colors cursor-pointer text-[18px] leading-none"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              <div className="p-[24px] flex flex-col gap-[20px] text-[13px]">
                {/* 官方服务下拉选择框 */}
                <div className="flex items-center">
                  <label className="w-[85px] text-[14px] text-[#333] shrink-0 select-none">
                    官方服务
                  </label>
                  <div className="relative flex-1">
                    <div
                      onClick={() => {
                        setShowOfficialDropdown(!showOfficialDropdown)
                        setShowPrivateDropdown(false)
                      }}
                      className="h-[36px] w-full rounded-[4px] border border-[#dcdfe6] px-[12px] flex items-center justify-between text-[13px] bg-white cursor-pointer hover:border-[#c0c4cc] transition-colors"
                    >
                      <span className={selectedOfficial ? 'text-[#333]' : 'text-[#a8abb2]'}>
                        {selectedOfficial ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-[6px] h-[6px] rounded-full bg-[#52C18E]" />
                            {selectedOfficial}
                          </span>
                        ) : (
                          '请选择官方服务'
                        )}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#909399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m3 6 5 5 5-5" />
                      </svg>
                    </div>

                    {showOfficialDropdown && (
                      <div className="absolute top-[40px] left-0 right-0 z-20 rounded-[4px] border border-[#e4e7ed] bg-white py-1 shadow-lg max-h-[180px] overflow-y-auto">
                        <div
                          onClick={() => {
                            setSelectedOfficial('')
                            setShowOfficialDropdown(false)
                          }}
                          className="h-[32px] px-3 flex items-center text-[#909399] hover:bg-[#f5f7fa] cursor-pointer"
                        >
                          不绑定
                        </div>
                        {OFFICIAL_OPTIONS.map((opt) => (
                          <div
                            key={opt.name}
                            onClick={() => {
                              setSelectedOfficial(opt.name)
                              setShowOfficialDropdown(false)
                            }}
                            className={`h-[34px] px-3 flex items-center justify-between hover:bg-[#f5f7fa] cursor-pointer ${
                              selectedOfficial === opt.name ? 'text-[#166EFF] font-medium bg-[#f0f7ff]' : 'text-[#333]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-[6px] h-[6px] rounded-full bg-[#52C18E]" />
                              {opt.name} <span className="text-[#999]">({opt.model})</span>
                            </span>
                            {selectedOfficial === opt.name && (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#166EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 8.5 3.5 3.5 6.5-7" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 私有服务下拉选择框 */}
                <div className="flex items-center">
                  <label className="w-[85px] text-[14px] text-[#333] shrink-0 select-none">
                    私有服务
                  </label>
                  <div className="relative flex-1">
                    <div
                      onClick={() => {
                        setShowPrivateDropdown(!showPrivateDropdown)
                        setShowOfficialDropdown(false)
                      }}
                      className="h-[36px] w-full rounded-[4px] border border-[#dcdfe6] px-[12px] flex items-center justify-between text-[13px] bg-white cursor-pointer hover:border-[#c0c4cc] transition-colors"
                    >
                      <span className={selectedPrivate ? 'text-[#333]' : 'text-[#a8abb2]'}>
                        {selectedPrivate ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-[6px] h-[6px] rounded-full bg-[#52C18E]" />
                            {selectedPrivate}
                          </span>
                        ) : (
                          '请选择私有服务'
                        )}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#909399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m3 6 5 5 5-5" />
                      </svg>
                    </div>

                    {showPrivateDropdown && (
                      <div className="absolute top-[40px] left-0 right-0 z-20 rounded-[4px] border border-[#e4e7ed] bg-white py-1 shadow-lg max-h-[180px] overflow-y-auto">
                        <div
                          onClick={() => {
                            setSelectedPrivate('')
                            setShowPrivateDropdown(false)
                          }}
                          className="h-[32px] px-3 flex items-center text-[#909399] hover:bg-[#f5f7fa] cursor-pointer"
                        >
                          不绑定
                        </div>
                        {PRIVATE_OPTIONS.map((opt) => (
                          <div
                            key={opt.name}
                            onClick={() => {
                              setSelectedPrivate(opt.name)
                              setShowPrivateDropdown(false)
                            }}
                            className={`h-[34px] px-3 flex items-center justify-between hover:bg-[#f5f7fa] cursor-pointer ${
                              selectedPrivate === opt.name ? 'text-[#166EFF] font-medium bg-[#f0f7ff]' : 'text-[#333]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className={`w-[6px] h-[6px] rounded-full ${opt.running ? 'bg-[#52C18E]' : 'bg-[#F82709]'}`} />
                              {opt.name} <span className="text-[#999]">({opt.model})</span>
                            </span>
                            {selectedPrivate === opt.name && (
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#166EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 8.5 3.5 3.5 6.5-7" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-[64px] px-[24px] flex items-center justify-end gap-[12px] border-t border-[#f0f0f0]">
                <button
                  onClick={() => setModalType(null)}
                  className="h-[32px] px-[20px] rounded-[4px] border border-[#dcdfe6] bg-white text-[13px] text-[#606266] hover:text-[#166EFF] hover:border-[#166EFF] transition-colors cursor-pointer"
                >
                  取 消
                </button>
                <button
                  onClick={handleSaveBind}
                  className="h-[32px] px-[20px] rounded-[4px] bg-[#166EFF] text-[13px] text-white hover:bg-[#135ad4] transition-colors cursor-pointer shadow-sm"
                >
                  确 定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4.【设置限流】弹窗（对应图 3：media_1794278626387_8984d0ae.png） */}
        {modalType === 'rateLimit' && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
            <div className="w-[620px] rounded-[8px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="h-[56px] px-[24px] flex items-center justify-between border-b border-[#f0f0f0]">
                <h3 className="text-[16px] font-semibold text-[#1f2329]">设置限流</h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-[#999] hover:text-[#333] transition-colors cursor-pointer text-[18px] leading-none"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              <div className="p-[24px] flex flex-col gap-[20px] text-[13px]">
                {/* 开关 1：启动Token额度 */}
                <div className="flex items-center gap-[12px]">
                  <Switch checked={quotaSwitch} onChange={setQuotaSwitch} />
                  <span className="text-[14px] text-[#333] select-none font-normal">启动Token额度</span>
                </div>

                {/* 总Token额度输入项 */}
                {quotaSwitch && (
                  <div className="flex items-center">
                    <label className="w-[125px] text-[14px] text-[#333] shrink-0 select-none">
                      总Token额度 <span className="text-[#f5222d]">*</span>
                    </label>
                    <div className="flex items-center gap-[8px]">
                      <input
                        value={quotaValue}
                        onChange={(e) => setQuotaValue(e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="0-100000000000"
                        className="h-[36px] w-[200px] rounded-[4px] border border-[#dcdfe6] px-[12px] text-[13px] text-[#333] placeholder:text-[#a8abb2] outline-none transition-colors focus:border-[#166EFF]"
                      />
                      <span className="text-[13px] text-[#606266] select-none">Tokens</span>
                    </div>
                  </div>
                )}

                {/* 开关 2：启动Token限流（TPM） */}
                <div className="flex items-center gap-[12px] mt-[4px]">
                  <Switch checked={tpmSwitch} onChange={setTpmSwitch} />
                  <span className="text-[14px] text-[#333] select-none font-normal">启动Token限流（TPM）</span>
                </div>

                {/* 请求Token上限输入项 */}
                {tpmSwitch && (
                  <div className="flex items-center">
                    <label className="w-[125px] text-[14px] text-[#333] shrink-0 select-none">
                      请求Token上限 <span className="text-[#f5222d]">*</span>
                    </label>
                    <div className="flex items-center gap-[8px]">
                      <input
                        value={tpmValue}
                        onChange={(e) => setTpmValue(e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="0-1000000"
                        className="h-[36px] w-[200px] rounded-[4px] border border-[#dcdfe6] px-[12px] text-[13px] text-[#333] placeholder:text-[#a8abb2] outline-none transition-colors focus:border-[#166EFF]"
                      />
                      <span className="text-[13px] text-[#606266] select-none">Tokens / 分钟</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-[64px] px-[24px] flex items-center justify-end gap-[12px] border-t border-[#f0f0f0]">
                <button
                  onClick={() => setModalType(null)}
                  className="h-[32px] px-[20px] rounded-[4px] border border-[#dcdfe6] bg-white text-[13px] text-[#606266] hover:text-[#166EFF] hover:border-[#166EFF] transition-colors cursor-pointer"
                >
                  取 消
                </button>
                <button
                  onClick={handleSaveRateLimit}
                  className="h-[32px] px-[20px] rounded-[4px] bg-[#166EFF] text-[13px] text-white hover:bg-[#135ad4] transition-colors cursor-pointer shadow-sm"
                >
                  确 定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5.【设置白名单】弹窗 */}
        {modalType === 'whitelist' && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
            <div className="w-[620px] rounded-[8px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="h-[56px] px-[24px] flex items-center justify-between border-b border-[#f0f0f0]">
                <h3 className="text-[16px] font-semibold text-[#1f2329]">设置白名单</h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-[#999] hover:text-[#333] transition-colors cursor-pointer text-[18px] leading-none"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              <div className="p-[24px] flex flex-col gap-[20px] text-[13px]">
                {/* 启用白名单开关 */}
                <div className="flex items-center gap-[12px]">
                  <Switch checked={whitelistSwitch} onChange={setWhitelistSwitch} />
                  <span className="text-[14px] text-[#333] select-none font-normal">启用 IP 白名单</span>
                </div>

                {/* 白名单输入项（开关开启时展示） */}
                {whitelistSwitch && (
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[14px] text-[#333] select-none flex items-center gap-[6px]">
                      IP 地址
                      <span className="text-[#999] text-[12px] font-normal">（支持 IPv4、IPv6、网段 CIDR，多个用逗号隔开）</span>
                    </label>
                    <div className="min-h-[96px] w-full rounded-[4px] border border-[#dcdfe6] px-[10px] py-[8px] focus-within:border-[#166EFF] transition-colors">
                      <div className="flex flex-wrap gap-[6px]">
                        {whitelistItems.map((ip) => (
                          <span
                            key={ip}
                            className="group inline-flex items-center gap-[4px] max-w-[100%] rounded-[4px] bg-[#eef4ff] text-[#166EFF] border border-[#d6e4ff] pl-[8px] pr-[4px] py-[2px] text-[12px] leading-[20px]"
                          >
                            <span className="truncate" title={ip}>{ip}</span>
                            <button
                              type="button"
                              onClick={() => removeWhitelistItem(ip)}
                              className="shrink-0 flex items-center justify-center w-[16px] h-[16px] rounded-[3px] text-[#166EFF] hover:bg-[#166EFF] hover:text-white transition-colors cursor-pointer"
                              aria-label={`删除 ${ip}`}
                            >
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                                <path d="M3 3l6 6M9 3l-6 6" />
                              </svg>
                            </button>
                          </span>
                        ))}
                        <input
                          value={whitelistDraft}
                          onChange={(e) => setWhitelistDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',' || e.key === '，' || e.key === ';' || e.key === '；') {
                              e.preventDefault()
                              addWhitelistItem(whitelistDraft)
                            } else if (e.key === 'Backspace' && whitelistDraft === '' && whitelistItems.length > 0) {
                              removeWhitelistItem(whitelistItems[whitelistItems.length - 1])
                            }
                          }}
                          onBlur={() => addWhitelistItem(whitelistDraft)}
                          placeholder={whitelistItems.length === 0 ? '如：192.168.1.100, 10.0.0.0/24, 2408:400a::1, 2001:db8::/32' : ''}
                          className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] text-[#333] placeholder:text-[#a8abb2] py-[2px]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-[64px] px-[24px] flex items-center justify-end gap-[12px] border-t border-[#f0f0f0]">
                <button
                  onClick={() => setModalType(null)}
                  className="h-[32px] px-[20px] rounded-[4px] border border-[#dcdfe6] bg-white text-[13px] text-[#606266] hover:text-[#166EFF] hover:border-[#166EFF] transition-colors cursor-pointer"
                >
                  取 消
                </button>
                <button
                  onClick={handleSaveWhitelist}
                  className="h-[32px] px-[20px] rounded-[4px] bg-[#166EFF] text-[13px] text-white hover:bg-[#135ad4] transition-colors cursor-pointer shadow-sm"
                >
                  确 定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6.【删除确认】弹窗 */}
        {modalType === 'delete' && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
            <div className="w-[420px] rounded-[8px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="h-[52px] px-[20px] flex items-center justify-between border-b border-[#f0f0f0]">
                <h3 className="text-[15px] font-semibold text-[#1f2329]">删除 API Key</h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-[#999] hover:text-[#333] transition-colors cursor-pointer text-[18px] leading-none"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>
              <div className="p-[20px] text-[13px] text-[#555] leading-relaxed">
                确定要删除 API Key <span className="font-semibold text-[#1f2329]">“{activeItem.name}”</span> 吗？删除后该凭证将立即失效，不可恢复。
              </div>
              <div className="h-[56px] px-[20px] flex items-center justify-end gap-[10px] border-t border-[#f0f0f0]">
                <button
                  onClick={() => setModalType(null)}
                  className="h-[32px] px-[18px] rounded-[4px] border border-[#dcdfe6] bg-white text-[13px] text-[#606266] hover:text-[#166EFF] hover:border-[#166EFF] transition-colors cursor-pointer"
                >
                  取 消
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="h-[32px] px-[18px] rounded-[4px] bg-[#166EFF] text-[13px] text-white hover:bg-[#135ad4] transition-colors cursor-pointer shadow-sm"
                >
                  确 定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7.【启用 / 禁用确认】弹窗 */}
        {modalType === 'toggleStatus' && activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
            <div className="w-[420px] rounded-[8px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="h-[52px] px-[20px] flex items-center justify-between border-b border-[#f0f0f0]">
                <h3 className="text-[15px] font-semibold text-[#1f2329]">
                  {activeItem.enabled === false ? '启用 API Key' : '禁用 API Key'}
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-[#999] hover:text-[#333] transition-colors cursor-pointer text-[18px] leading-none"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>
              <div className="p-[20px] text-[13px] text-[#555] leading-relaxed">
                {activeItem.enabled === false ? (
                  <>
                    确定要启用 API Key <span className="font-semibold text-[#1f2329]">“{activeItem.name}”</span> 吗？启用后该凭证将恢复正常服务调用鉴权。
                  </>
                ) : (
                  <>
                    确定要禁用 API Key <span className="font-semibold text-[#1f2329]">“{activeItem.name}”</span> 吗？禁用后通过该凭证发起的服务调用请求将被拒绝。
                  </>
                )}
              </div>
              <div className="h-[56px] px-[20px] flex items-center justify-end gap-[10px] border-t border-[#f0f0f0]">
                <button
                  onClick={() => setModalType(null)}
                  className="h-[32px] px-[18px] rounded-[4px] border border-[#dcdfe6] bg-white text-[13px] text-[#606266] hover:text-[#166EFF] hover:border-[#166EFF] transition-colors cursor-pointer"
                >
                  取 消
                </button>
                <button
                  onClick={handleConfirmToggleStatus}
                  className="h-[32px] px-[18px] rounded-[4px] bg-[#166EFF] text-[13px] text-white hover:bg-[#135ad4] transition-colors cursor-pointer shadow-sm"
                >
                  确 定
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

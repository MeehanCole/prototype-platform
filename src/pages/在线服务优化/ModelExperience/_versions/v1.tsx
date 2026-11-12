import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { PlatformHeader, SideNav } from '../../OnlineService/_shared'
import { DocPanel, DocProvider, FEATURES, NewTag } from '../feature-tags'

// 预置 API Key 列表与绑定的模型信息
interface ApiKeyConfig {
  id: string
  name: string
  hasService: boolean
  serviceName?: string
  modelName?: string
  supportedTypes?: ('text' | 'vision')[]
  disabled?: boolean
}

const API_KEY_LIST: ApiKeyConfig[] = [
  { id: '1', name: 'api-key-202604141440', hasService: false, disabled: false },
  { id: '2', name: 'api-key-202607271628', hasService: false, disabled: false },
  { id: '3', name: 'api-key-202611101046', hasService: false, disabled: true },
  { id: '4', name: 'api-key-202607161350', hasService: false, disabled: true },
  { id: '5', name: 'api-key-zh', hasService: false, disabled: false },
  { id: '6', name: 'api-key-2026111111759', hasService: false, disabled: true },
  {
    id: '7',
    name: 'api-key-202611091033',
    hasService: true,
    serviceName: 'test-04',
    modelName: 'qwen-2.5-7b',
    supportedTypes: ['text'], // 仅支持纯文本，不支持图文
    disabled: false,
  },
  {
    id: '8',
    name: 'api-key-multimodal-01',
    hasService: true,
    serviceName: 'qwen2-vl-7b-service',
    modelName: 'qwen2-vl-7b',
    supportedTypes: ['text', 'vision'], // 支持图文与纯文本
    disabled: false,
  },
]

// 消息接口
interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  imageUrl?: string
}

// 灵敏的交互式提示气泡组件（通过 Portal 渲染到 body 顶层，避免被滚动容器/侧栏裁切与遮挡）
function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  const iconRef = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, placeLeft: false })

  useEffect(() => {
    if (!visible) return
    const update = () => {
      const rect = iconRef.current?.getBoundingClientRect()
      if (!rect) return
      const placeLeft = rect.right + 16 + 240 > window.innerWidth
      setPos({
        top: rect.top + rect.height / 2,
        left: placeLeft ? rect.left - 8 : rect.right + 8,
        placeLeft,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [visible])

  return (
    <span className="relative inline-flex items-center">
      <span
        ref={iconRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-help text-[#999] hover:text-[#166EFF] text-[13px] transition-colors select-none leading-none"
      >
        ⓘ
      </span>
      {visible &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              transform: pos.placeLeft ? 'translate(-100%, -50%)' : 'translateY(-50%)',
            }}
            className="z-[9999] whitespace-nowrap bg-[#1f2329] text-white text-[12px] px-2.5 py-1 rounded shadow-lg pointer-events-none"
          >
            {text}
            <span
              className={`absolute top-1/2 -translate-y-1/2 border-4 border-transparent ${
                pos.placeLeft ? 'left-full border-l-[#1f2329]' : 'right-full border-r-[#1f2329]'
              }`}
            />
          </span>,
          document.body
        )}
    </span>
  )
}

// 带滑块圆圈上方跟随数值（无背景、不遮挡圆圈）与右侧 ⓘ 的滑块组件
function SliderParam({
  icon,
  label,
  tooltip,
  value,
  min,
  max,
  step,
  isFloat,
  onChange,
}: {
  icon?: React.ReactNode
  label: string
  tooltip: string
  value: number
  min: number
  max: number
  step: number
  isFloat?: boolean
  onChange: (v: number) => void
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const displayVal = isFloat ? value.toFixed(2) : value.toString()

  return (
    <div className="pt-1">
      {/* 标题行：左侧图标+参数名，右侧 ⓘ */}
      <div className="flex items-center justify-between text-[13px] text-[#262626]">
        <div className="flex items-center gap-1.5 font-normal">
          {icon}
          <span>{label}</span>
        </div>
        <InfoTooltip text={tooltip} />
      </div>

      {/* 滑动条容器：上方跟随无背景数值 */}
      <div className="relative pt-6 pb-0.5">
        {/* 跟随数值：无背景色、不遮挡圆圈，纯蓝色文本 */}
        <div
          className="absolute top-0.5 -translate-x-1/2 pointer-events-none transition-all duration-75 text-[12px] font-medium text-[#166EFF] whitespace-nowrap"
          style={{ left: `calc(${pct}% + ${7 - pct * 0.14}px)` }}
        >
          {displayVal}
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(isFloat ? parseFloat(e.target.value) : Number(e.target.value))}
          className="w-full h-1.5 bg-[#e4e7ed] rounded-lg appearance-none cursor-pointer accent-[#166EFF] block"
        />
      </div>

      {/* 两端刻度值 */}
      <div className="flex justify-between text-[11px] text-[#8c8c8c] mt-0.5">
        <span>{isFloat ? min.toFixed(2) : min}</span>
        <span>{isFloat ? max.toFixed(2) : max}</span>
      </div>
    </div>
  )
}

export default function ModelExperience({ __showFeat = false }: { __showFeat?: boolean }) {
  const navigate = useNavigate()
  const [docCode, setDocCode] = useState<string | null>(null)

  // 1. 左侧面板应用类型：'text' 对话型应用 | 'vision' 图文对话型应用
  const [appType, setAppType] = useState<'text' | 'vision'>('text')

  // 右上角停用/启用状态
  const [isServiceActive, setIsServiceActive] = useState(true)

  // 2. 当前选中的 API Key
  const [selectedKey, setSelectedKey] = useState<string>('api-key-202611091033')
  const [keyDropdownOpen, setKeyDropdownOpen] = useState(false)
  const keyDropdownRef = useRef<HTMLDivElement>(null)

  // 刷新模型状态动效
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null)

  // 计算当前 API Key 针对当前体验类型的支持状态
  const currentKeyConfig = API_KEY_LIST.find((k) => k.name === selectedKey) || API_KEY_LIST[0]

  let modelStatus: 'ready' | 'no_service' | 'unsupported_type' = 'ready'
  if (!currentKeyConfig.hasService) {
    modelStatus = 'no_service'
  } else if (currentKeyConfig.supportedTypes && !currentKeyConfig.supportedTypes.includes(appType)) {
    modelStatus = 'unsupported_type'
  } else {
    modelStatus = 'ready'
  }

  // 3. 模型选择
  const [selectedService, setSelectedService] = useState<string>(currentKeyConfig.serviceName || 'test-04')
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false)
  const serviceDropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部自动收起下拉面板
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (keyDropdownRef.current && !keyDropdownRef.current.contains(e.target as Node)) {
        setKeyDropdownOpen(false)
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(e.target as Node)) {
        setServiceDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 当切换 API Key 时同步（被禁用的无法选中）
  const handleSelectKey = (keyName: string) => {
    const target = API_KEY_LIST.find((k) => k.name === keyName)
    if (target?.disabled) return
    setSelectedKey(keyName)
    setKeyDropdownOpen(false)
    if (target?.hasService) {
      setSelectedService(target.serviceName || 'test-04')
    }
  }

  // 刷新模型按钮动作
  const handleRefreshModels = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setRefreshNotice('已刷新模型状态')
      setTimeout(() => setRefreshNotice(null), 2500)
    }, 800)
  }

  // 4. 超参数设置
  const [systemPrompt, setSystemPrompt] = useState('你是一个AI智能聊天机器人。')
  const [maxTokens, setMaxTokens] = useState(1024)
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.7)
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0)

  // 5. 对话消息列表
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: '我是模型推理体验助手，请问有什么需要我协助的？',
    },
  ])

  // 输入框状态
  const [inputPrompt, setInputPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  // 消息滚动到底部
  const chatBottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  // 发送消息
  const handleSend = () => {
    if (!inputPrompt.trim() && !uploadedImage) return
    if (isGenerating) return

    const userText = inputPrompt.trim()
    const currentImg = uploadedImage
    setInputPrompt('')
    setUploadedImage(null)

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText,
      imageUrl: currentImg || undefined,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsGenerating(true)

    // 模拟大模型推理流式返回
    setTimeout(() => {
      let reply = ''
      if (appType === 'vision' && currentImg) {
        reply = `我已成功接收并分析了您发送的图像！结合当前提示词「${systemPrompt}」，图像呈现了明确的视觉内容。如果您需要我提取图中的文字、检测目标或进行图表趋势解读，请随时向我提问。`
      } else if (userText.includes('你好') || userText.includes('谁')) {
        reply = `你好！我是基于 ${currentKeyConfig.modelName || 'Qwen-2.5-7B'} 部署的高性能模型推理体验助手。当前温度为 ${temperature.toFixed(2)}，Max Tokens 为 ${maxTokens}。我可以为您提供精准的代码编写、文档润色、数理推演与智能问答服务。`
      } else if (userText.includes('代码') || userText.includes('算法')) {
        reply = `很高兴为您编写代码！以下是一段高效的代码示例：\n\n\`\`\`python\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\`\`\`\n\n该实现平均时间复杂度为 O(n log n)，适合实际生产环境使用。`
      } else {
        reply = `收到您的提问：「${userText}」。\n\n在当前参数配置下（Top-P: ${topP.toFixed(2)}，温度: ${temperature.toFixed(2)}），模型能够保证回答的准确性与丰富度。根据您的业务需求，我们支持通过 API Key 进行高并发线上调用，也支持在控制台进行参数的精细化调优。`
      }

      const assistantMsg: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        role: 'assistant',
        content: reply,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsGenerating(false)
    }, 700)
  }

  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-white text-[#1f2329] [font-family:'PingFang_SC','Helvetica_Neue',Arial,sans-serif]">
      {/* 1. 产品统一顶栏（通栏横贯） */}
      <PlatformHeader />

      {/* 2. 侧边栏与主内容工作区 */}
      <div className="flex-1 min-h-0 flex">
        {/* 统一侧边导航栏 (activeKey="模型体验") */}
        <SideNav activeKey="模型体验" />

        {/* 主工作区 */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-white">
          {/* 页面主标题条 */}
          <div className="h-[74px] shrink-0 px-7 flex items-center justify-between border-b border-[#f0f0f0] bg-white">
            <div>
              <h1 className="text-[20px] font-bold text-[#1f1f1f] leading-none">模型体验</h1>
              <p className="text-[13px] text-[#8c8c8c] mt-2 leading-none">
                为您提供模型推理的在线体验服务，旨在帮助您快速了解并测试各类模型的功能与效果。
              </p>
            </div>

            {/* 右上角按钮：停用 */}
            <button
              onClick={() => setIsServiceActive(!isServiceActive)}
              className={`h-[34px] px-4 rounded-[5px] text-[14px] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer ${
                isServiceActive
                  ? 'bg-[#166EFF] hover:bg-[#135cd4] text-white'
                  : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M5.5 8h5" />
              </svg>
              <span>{isServiceActive ? '停用' : '启用'}</span>
            </button>
          </div>

          {/* 下部双栏区域 */}
          <div className="flex-1 min-h-0 flex overflow-hidden bg-white">
            {/* 左栏：参数配置面板 */}
            <aside className="w-[280px] shrink-0 border-r border-[#eaedf1] bg-white flex flex-col overflow-hidden">
              {/* 顶部应用类型纵向列表 */}
              <div className="p-3 pb-3 border-b border-[#e5e7eb] shrink-0">
                <div className="space-y-1.5">
                  {/* 1. 对话型应用 */}
                  <div
                    onClick={() => setAppType('text')}
                    className={`h-[38px] px-3.5 rounded-[7px] flex items-center gap-2 cursor-pointer transition-colors ${
                      appType === 'text'
                        ? 'bg-[#ececec] text-[#111] font-bold'
                        : 'bg-transparent text-[#333] hover:bg-[#f7f8fa] font-normal'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={appType === 'text' ? '2' : '1.5'}>
                      <rect x="2.5" y="3.5" width="15" height="10" rx="2" />
                      <path d="M6 7.5h8M6 10h5" />
                      <path d="M5.5 13.5l-2 3v-3" />
                    </svg>
                    <span className="text-[14px]">对话型应用</span>
                  </div>

                  {/* 2. 图文对话型应用 */}
                  <div
                    onClick={() => setAppType('vision')}
                    className={`h-[38px] px-3.5 rounded-[7px] flex items-center gap-2 cursor-pointer transition-colors ${
                      appType === 'vision'
                        ? 'bg-[#ececec] text-[#111] font-bold'
                        : 'bg-transparent text-[#333] hover:bg-[#f7f8fa] font-normal'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={appType === 'vision' ? '2.2' : '1.5'}>
                      <path d="M3 4a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 17 4v9a1.5 1.5 0 0 1-1.5 1.5H7l-3.5 3.5v-3.5H4A1.5 1.5 0 0 1 3 13V4Z" />
                      <rect x="6.5" y="6.5" width="4" height="3" rx="0.5" strokeWidth="1.2" />
                      <circle cx="13" cy="8" r="1" fill="currentColor" />
                    </svg>
                    <span className="text-[14px]">图文对话型应用</span>
                  </div>
                </div>
              </div>

              {/* 参数表单滚动区 */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* 1. 选择 API Key (附带提示图标，鼠标移入立即展示提示气泡) */}
                <div ref={keyDropdownRef} className="relative">
                  {/* 变更标记：绝对定位，不占布局 */}
                  <NewTag code="F-01" compact className="absolute right-0 top-0" />
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-[14px] font-normal text-[#1f1f1f]">
                      选择API Key:
                    </label>
                    <InfoTooltip text="只有启用的 API Key 可以使用" />
                  </div>
                  <div
                    onClick={() => setKeyDropdownOpen(!keyDropdownOpen)}
                    className="h-[40px] px-3.5 rounded-[7px] border border-[#d9d9d9] hover:border-[#166EFF] bg-white flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="text-[14px] text-[#1f1f1f] font-mono tracking-tight truncate">{selectedKey}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="#1f1f1f"
                      strokeWidth="2.4"
                      className={`transition-transform duration-200 ${keyDropdownOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="M3.5 6l4.5 4.5 4.5-4.5" />
                    </svg>
                  </div>

                  {/* 下拉面板：不展示禁用的 apikey，仅展示启用的列表 */}
                  {keyDropdownOpen && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#e4e7ed] rounded-[7px] shadow-lg max-h-[260px] overflow-y-auto py-1">
                      {API_KEY_LIST.filter((k) => !k.disabled).map((k) => (
                        <div
                          key={k.id}
                          onClick={() => handleSelectKey(k.name)}
                          className={`px-3.5 py-2 text-[13px] cursor-pointer flex items-center justify-between transition-colors ${
                            selectedKey === k.name
                              ? 'bg-[#f4f7fc] text-[#166EFF] font-medium'
                              : 'text-[#333] hover:bg-[#f7f8fa]'
                          }`}
                        >
                          <span className="font-mono truncate">{k.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. 选择模型 */}
                <div ref={serviceDropdownRef} className="relative">
                  <label
                    className={`block text-[14px] font-normal mb-1.5 ${
                      modelStatus === 'unsupported_type' || modelStatus === 'no_service'
                        ? 'text-[#8c8c8c]'
                        : 'text-[#1f1f1f]'
                    }`}
                  >
                    选择模型:
                  </label>

                  {/* 情况 A：不支持此体验类型 */}
                  {modelStatus === 'unsupported_type' ? (
                    <>
                      <div className="h-[40px] px-3.5 rounded-[7px] border border-[#e5e7eb] bg-[#fbfbfb] flex items-center justify-between text-[#8c8c8c] cursor-not-allowed">
                        <span className="text-[14px]">没有可选的模型</span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#8c8c8c" strokeWidth="2.2">
                          <path d="M3.5 6l4.5 4.5 4.5-4.5" />
                        </svg>
                      </div>

                      {/* 浅蓝紫提示卡片 */}
                      <div className="mt-3.5 p-3.5 rounded-[8px] bg-[#edf3fd] text-[#003b8e] text-[13px] leading-[1.6]">
                        当前 API Key 下暂无支持此体验类型的模型，请切换体验类型或绑定支持该类型的已发布模型服务。
                      </div>

                      {/* 刷新模型按钮 */}
                      <div className="mt-3 flex justify-end items-center gap-2">
                        {refreshNotice && (
                          <span className="text-[12px] text-[#16a34a] animate-fade-in">{refreshNotice}</span>
                        )}
                        <button
                          onClick={handleRefreshModels}
                          disabled={isRefreshing}
                          className="h-[32px] px-3.5 rounded-[6px] border border-[#d9d9d9] hover:border-[#166EFF] bg-white text-[13px] text-[#1f1f1f] hover:text-[#166EFF] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        >
                          {isRefreshing && (
                            <svg className="animate-spin h-3.5 w-3.5 text-[#166EFF]" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                          )}
                          <span>刷新模型</span>
                        </button>
                      </div>
                    </>
                  ) : modelStatus === 'no_service' ? (
                    /* 情况 B：API Key 本身无绑定任何模型服务 */
                    <>
                      <div className="h-[40px] px-3.5 rounded-[7px] border border-[#e5e7eb] bg-[#fbfbfb] flex items-center justify-between text-[#8c8c8c] cursor-not-allowed">
                        <span className="text-[14px]">请先选择模型</span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#8c8c8c" strokeWidth="2.2">
                          <path d="M3.5 6l4.5 4.5 4.5-4.5" />
                        </svg>
                      </div>

                      <div className="mt-3.5 p-3.5 rounded-[8px] bg-[#edf4fe] border border-[#d2e4fc] text-[13px] leading-[1.6] text-[#2963d4]">
                        当前 API Key 下暂无已发布的大模型服务，请在 API Key 页面绑定已发布的大模型服务。
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => navigate('/在线服务优化/apikey')}
                          className="h-[28px] px-3 rounded-[5px] bg-[#ffffff] border border-[#bad5fb] text-[#166EFF] text-[12px] font-medium hover:bg-[#e4efff] cursor-pointer transition-colors shadow-2xs"
                        >
                          去绑定
                        </button>
                      </div>
                    </>
                  ) : (
                    /* 情况 C：有可用的模型服务，展示选择框与调优配置 */
                    <div>
                      <div
                        onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                        className="h-[40px] px-3.5 rounded-[7px] border border-[#d9d9d9] hover:border-[#166EFF] bg-white flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="text-[14px] text-[#1f1f1f] font-medium truncate">{selectedService}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="#1f1f1f"
                          strokeWidth="2.4"
                          className={`transition-transform duration-200 ${serviceDropdownOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="M3.5 6l4.5 4.5 4.5-4.5" />
                        </svg>
                      </div>

                      {serviceDropdownOpen && (
                        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#e4e7ed] rounded-[7px] shadow-lg overflow-hidden py-1">
                          <div
                            onClick={() => {
                              setSelectedService('test-04')
                              setServiceDropdownOpen(false)
                            }}
                            className="px-3.5 py-2 text-[13px] text-[#262626] hover:bg-[#f7f8fa] cursor-pointer"
                          >
                            test-04 (qwen-2.5-7b)
                          </div>
                          {appType === 'vision' && (
                            <div
                              onClick={() => {
                                setSelectedService('qwen2-vl-7b-service')
                                setServiceDropdownOpen(false)
                              }}
                              className="px-3.5 py-2 text-[13px] text-[#262626] hover:bg-[#f7f8fa] cursor-pointer"
                            >
                              qwen2-vl-7b-service (qwen2-vl-7b)
                            </div>
                          )}
                        </div>
                      )}

                      {/* 刷新模型按钮 */}
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleRefreshModels}
                          disabled={isRefreshing}
                          className="h-[26px] px-2.5 rounded-[4px] border border-[#d9d9d9] hover:border-[#166EFF] bg-white text-[12px] text-[#595959] hover:text-[#166EFF] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {isRefreshing && (
                            <svg className="animate-spin h-3 w-3 text-[#166EFF]" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                          )}
                          <span>刷新模型</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 仅在已绑定模型服务且支持当前类型时展示提示词与超参数配置 */}
                {modelStatus === 'ready' && (
                  <>
                    {/* 3. 提示词 (System Prompt) */}
                    <div>
                      <label className="block text-[13px] font-medium text-[#262626] mb-1.5">
                        提示词
                      </label>
                      <textarea
                        rows={3}
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="w-full p-2.5 rounded-[6px] border border-[#d9d9d9] focus:border-[#166EFF] focus:outline-none text-[13px] text-[#262626] leading-relaxed resize-none"
                        placeholder="请输入系统级人设提示词..."
                      />
                    </div>

                    {/* 4. 超参数滑动条：无背景跟随数值、右侧 ⓘ 图标 */}
                    <div className="space-y-4 pt-1">
                      {/* Max Tokens */}
                      <SliderParam
                        label="Max Tokens"
                        tooltip="限制单次模型输出的最大 token 数"
                        value={maxTokens}
                        min={1}
                        max={8196}
                        step={1}
                        onChange={setMaxTokens}
                      />

                      {/* 温度 (Temperature) */}
                      <SliderParam
                        icon={<span className="text-[#f97316]">🔥</span>}
                        label="温度"
                        tooltip="控制生成随机性。值越高越有创造力，值越低越聚焦严谨"
                        value={temperature}
                        min={0.0}
                        max={2.0}
                        step={0.01}
                        isFloat
                        onChange={setTemperature}
                      />

                      {/* Top-P */}
                      <SliderParam
                        icon={<span className="text-[#3b82f6]">📊</span>}
                        label="Top-P"
                        tooltip="核采样概率阈值"
                        value={topP}
                        min={0.0}
                        max={1.0}
                        step={0.01}
                        isFloat
                        onChange={setTopP}
                      />

                      {/* Frequency Penalty */}
                      <SliderParam
                        icon={
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
                            <path d="M1.5 8h2.5l2-5 3 10 2.5-7 1.5 2h1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        }
                        label="Frequency Penalty"
                        tooltip="降低重复词句的倾向"
                        value={frequencyPenalty}
                        min={-2.0}
                        max={2.0}
                        step={0.01}
                        isFloat
                        onChange={setFrequencyPenalty}
                      />
                    </div>

                    {/* 5. 底部模型服务与模型名称 (无外框纯文字展示) */}
                    <div className="pt-4 border-t border-[#f0f0f0] space-y-2">
                      <div>
                        <div className="text-[12px] text-[#595959] flex items-center gap-1.5">
                          <span className="text-[#10b981]">✓</span>
                          <span>模型服务:</span>
                        </div>
                        <span className="block mt-1 text-[13px] text-[#059669] font-medium pl-4">
                          {currentKeyConfig.serviceName || selectedService}
                        </span>
                      </div>

                      <div>
                        <div className="text-[12px] text-[#595959] flex items-center gap-1.5">
                          <span className="text-[#6366f1]">🏷️</span>
                          <span>模型名称:</span>
                        </div>
                        <span className="block mt-1 text-[13px] text-[#059669] font-medium pl-4">
                          {currentKeyConfig.modelName || 'qwen-2.5-7b'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>

            {/* 右栏：主交互体验区域 */}
            <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
              {/* 顶部欢迎横幅 */}
              <div className="px-6 pt-5 pb-2 shrink-0">
                <h2 className="text-[17px] font-bold text-[#1f2329] flex items-center gap-2">
                  <span>📖</span>
                  <span>欢迎体验大模型服务！</span>
                </h2>
              </div>

              {/* 场景 1：无可用模型服务（未绑定或不支持当前体验类型） */}
              {modelStatus !== 'ready' ? (
                <div className="px-6 py-3">
                  <div className="p-3.5 rounded-[6px] bg-[#edf4fe] border border-[#d2e4fc] text-[14px] text-[#2963d4] flex items-center justify-between">
                    <span>
                      {modelStatus === 'unsupported_type'
                        ? '当前 API Key 下暂无支持此体验类型的模型，请切换体验类型或绑定支持该类型的已发布模型服务。'
                        : '当前 API Key 下暂无已发布的模型服务，请在 API Key 页面绑定已发布的模型服务。'}
                    </span>
                    {modelStatus === 'no_service' && (
                      <button
                        onClick={() => navigate('/在线服务优化/apikey')}
                        className="ml-4 shrink-0 text-[#166EFF] underline hover:text-[#1150c2] cursor-pointer text-[13px] font-medium"
                      >
                        前往绑定 &gt;
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                /* 场景 2：有已发布并匹配的模型服务，展示交互对话区 */
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  {/* 消息滚动流 */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* 助手头像：金橙色机器人 */}
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white text-[15px] shadow-sm shrink-0 mt-0.5">
                            🤖
                          </div>
                        )}

                        {/* 气泡主体 */}
                        <div className={`max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          {/* 用户上传的图片预览 */}
                          {msg.imageUrl && (
                            <div className="mb-2 max-w-[280px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                              <img src={msg.imageUrl} alt="User upload" className="w-full h-auto object-cover" />
                            </div>
                          )}

                          {/* 机器人消息无背景框(反馈 11)；用户消息带蓝底气泡 */}
                          {msg.role === 'assistant' ? (
                            <div className="text-[14px] text-[#1f2329] leading-relaxed py-1 whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          ) : (
                            <div className="rounded-xl px-4 py-3 text-[14px] leading-relaxed shadow-xs bg-[#166EFF] text-white rounded-br-none">
                              {msg.content}
                            </div>
                          )}
                        </div>

                        {/* 用户头像 */}
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                            我
                          </div>
                        )}
                      </div>
                    ))}

                    {/* 正在生成中的动效 */}
                    {isGenerating && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white text-[15px] shadow-sm shrink-0 animate-pulse mt-0.5">
                          🤖
                        </div>
                        <div className="py-1 text-[13px] text-[#6b7280] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#166EFF] animate-bounce" />
                          <span className="w-2 h-2 rounded-full bg-[#166EFF] animate-bounce [animation-delay:0.2s]" />
                          <span className="w-2 h-2 rounded-full bg-[#166EFF] animate-bounce [animation-delay:0.4s]" />
                          <span className="ml-1 text-[12px] text-[#9ca3af]">模型正在深度思考中...</span>
                        </div>
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* 底部输入框区 */}
                  <div className="p-4 border-t border-[#f0f0f0] bg-white">
                    {/* 若处于图文模式且已选图片，显示图片预览条 */}
                    {appType === 'vision' && uploadedImage && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="relative inline-block border border-[#d9d9d9] rounded-md overflow-hidden">
                          <img src={uploadedImage} alt="Preview" className="w-12 h-12 object-cover" />
                          <button
                            onClick={() => setUploadedImage(null)}
                            className="absolute top-0 right-0 bg-black/60 text-white rounded-bl p-0.5 hover:bg-black text-[10px] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="text-[12px] text-[#8c8c8c]">已选择 1 张待分析图像</span>
                      </div>
                    )}

                    {/* 输入框胶囊容器 */}
                    <div className="flex items-center gap-2 bg-[#f4f6f8] rounded-full px-4 py-1.5 border border-[#e5e7eb] focus-within:border-[#166EFF] focus-within:bg-white transition-all">
                      {/* 图文模式下的图片上传按钮 */}
                      {appType === 'vision' && (
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImage(
                              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
                            )
                          }}
                          title="上传图片"
                          className="text-[#6b7280] hover:text-[#166EFF] p-1.5 cursor-pointer rounded-full hover:bg-gray-200/60 transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="3" y="3" width="14" height="14" rx="3" />
                            <circle cx="8" cy="8" r="1.5" />
                            <path d="m17 13-4-4-6 6" />
                          </svg>
                        </button>
                      )}

                      <input
                        type="text"
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        placeholder="询问任何问题"
                        className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#1f2329] placeholder:text-[#9ca3af] py-1"
                      />

                      {/* 发送纸飞机按钮 */}
                      <button
                        onClick={handleSend}
                        disabled={isGenerating || (!inputPrompt.trim() && !uploadedImage)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          inputPrompt.trim() || uploadedImage
                            ? 'bg-[#166EFF] hover:bg-[#135cd4] text-white shadow-xs'
                            : 'bg-transparent text-[#b0b8c4] cursor-not-allowed'
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M4 10l12-6-4 12-3-5-5-1z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
    <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

/**
 * 智能对话页（还原版）
 *
 * 视觉基线来自截图：全屏白底、顶部「新会话」栏、空态品牌头像、底部悬浮输入区。
 * 先保持结构简单，后续的检索/推理/产物面板在此基础上迭代。
 */
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  AtSign,
  ChevronDown,
  FileText,
  Folder,
  Hand,
  History,
  Maximize,
  MessageCirclePlus,
  Minimize2,
  Plus,
  Send,
  X,
} from 'lucide-react'
import aiChatAvatar from '@/assets/ai/ai-chat-avatar.png'
import { AssistantMessage } from './AssistantMessage'
import { DocumentPreviewPane } from './DocumentPreviewPane'
import { MentionPopover } from './MentionPopover'
import {
  buildKnowledgeReply,
  getKbMention,
  type MentionTarget,
  type RetrievalCitation,
  type StructuredReply,
} from './knowledgeRag'

type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string
  mentions?: MentionTarget[]
  status?: 'retrieving' | 'done'
  reply?: StructuredReply
}
type ApprovalMode = 'manual' | 'auto'

const APPROVAL_LABEL: Record<ApprovalMode, string> = {
  manual: '手动审批',
  auto: '自动执行',
}

const MIN_DRAWER_WIDTH = 380

function clampDrawerWidth(width: number) {
  const max = window.innerWidth
  const min = Math.min(MIN_DRAWER_WIDTH, max)
  return Math.min(Math.max(width, min), max)
}

export function ChatInterface({
  onClose,
  activeKb = null,
}: {
  onClose: () => void
  activeKb?: string | null
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [approval, setApproval] = useState<ApprovalMode>('manual')
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentions, setMentions] = useState<MentionTarget[]>(() => {
    const preset = activeKb ? getKbMention(activeKb) : undefined
    return preset ? [preset] : []
  })
  const [citationPanel, setCitationPanel] = useState<{
    items: RetrievalCitation[]
    activeId?: string
  } | null>(null)
  const [files, setFiles] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [drawerWidth, setDrawerWidth] = useState(() => clampDrawerWidth(Math.round(window.innerWidth * 0.5)))
  const [resizing, setResizing] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const replyTimer = useRef<number | null>(null)
  const resizeDragRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null)
  const seq = useRef(0)

  useEffect(() => {
    const onResize = () => setDrawerWidth((w) => clampDrawerWidth(w))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
      if (replyTimer.current) window.clearTimeout(replyTimer.current)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (mentionOpen) {
        setMentionOpen(false)
        return
      }
      if (approvalOpen) {
        setApprovalOpen(false)
        return
      }
      if (citationPanel) {
        setCitationPanel(null)
        return
      }
      if (historyOpen) {
        setHistoryOpen(false)
        return
      }
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mentionOpen, approvalOpen, citationPanel, historyOpen, onClose])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const resizeInput = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`
  }

  const toggleMention = (item: MentionTarget) => {
    setMentions((prev) =>
      prev.some((m) => m.id === item.id) ? prev.filter((m) => m.id !== item.id) : [...prev, item],
    )
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    const activeMentions = [...mentions]
    seq.current += 1
    const userMsgId = seq.current
    seq.current += 1
    const assistantMsgId = seq.current

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: text, mentions: activeMentions },
      { id: assistantMsgId, role: 'assistant', content: '', status: 'retrieving' },
    ])
    setInput('')
    setFiles([])
    setMentionOpen(false)
    requestAnimationFrame(() => {
      resizeInput()
      inputRef.current?.focus()
    })

    if (replyTimer.current) window.clearTimeout(replyTimer.current)
    replyTimer.current = window.setTimeout(() => {
      const reply = buildKnowledgeReply(text, activeMentions)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, status: 'done', reply } : m,
        ),
      )
    }, 520)
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      setToast('当前浏览器不支持全屏')
    }
  }

  const pickFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []).map((file) => file.name)
    if (picked.length) setFiles((prev) => [...prev, ...picked])
    event.target.value = ''
  }

  const startNewChat = () => {
    if (replyTimer.current) window.clearTimeout(replyTimer.current)
    setMessages([])
    setInput('')
    setFiles([])
    setCitationPanel(null)
    setMentionOpen(false)
    setHistoryOpen(false)
    setApprovalOpen(false)
    const preset = activeKb ? getKbMention(activeKb) : undefined
    setMentions(preset ? [preset] : [])
    requestAnimationFrame(() => {
      resizeInput()
      inputRef.current?.focus()
    })
  }

  const openCitationPanel = (items: RetrievalCitation[], activeId?: string) => {
    setCitationPanel({ items, activeId })
    // 若当前对话抽屉过宽，自动收敛至约 45% 宽度，给左侧文档预览留出充足阅读空间
    const leftOffset = fullscreen ? 0 : 32
    const maxAllowedChat = Math.max(360, window.innerWidth - leftOffset - 420)
    if (drawerWidth > maxAllowedChat) {
      setDrawerWidth(Math.max(360, Math.round(window.innerWidth * 0.45)))
    }
  }

  const clampSplitChatWidth = (width: number) => {
    if (!citationPanel) return clampDrawerWidth(width)
    const leftOffset = fullscreen ? 0 : 32
    const max = Math.max(360, window.innerWidth - leftOffset - 360)
    return Math.min(Math.max(width, 360), max)
  }

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    resizeDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: drawerWidth,
    }
    setResizing(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = resizeDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const delta = drag.startX - event.clientX
    setDrawerWidth(clampSplitChatWidth(drag.startWidth + delta))
  }

  const endResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = resizeDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    resizeDragRef.current = null
    setResizing(false)
  }

  const title = '新会话'
  const leftDocOffset = fullscreen ? 0 : 32
  const effectiveChatWidth = fullscreen && !citationPanel ? window.innerWidth : drawerWidth

  return createPortal(
    <div className="fixed inset-0 z-[120]">
      {/* 遮罩：默认弹出半屏，点击左侧底层页面可收起 */}
      {!fullscreen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 bg-black/15"
        />
      )}

      {/* 左侧文档预览面板（点击引用文档或引用条时展开） */}
      {citationPanel && (
        <DocumentPreviewPane
          items={citationPanel.items}
          activeId={citationPanel.activeId}
          leftOffset={leftDocOffset}
          rightOffset={effectiveChatWidth}
          onSelect={(id) =>
            setCitationPanel((prev) => (prev ? { ...prev, activeId: id } : null))
          }
          onClose={() => setCitationPanel(null)}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="智能对话"
        style={fullscreen && !citationPanel ? undefined : { width: effectiveChatWidth }}
        className={`fixed inset-y-0 right-0 z-20 flex flex-col overflow-hidden bg-white text-[#1F2329] ${
          resizing ? 'select-none' : ''
        } ${
          fullscreen && !citationPanel
            ? 'left-0 border-0 shadow-none'
            : 'border-l border-[#E5E8EE] shadow-[-8px_0_24px_rgba(16,24,40,0.08)]'
        }`}
      >
        {/* 左侧边缘拖拽手柄：支持自由调整抽屉宽度（分栏时同步调整左右比例） */}
        {(!fullscreen || Boolean(citationPanel)) && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="拖动调整对话抽屉宽度"
            title="拖动调整宽度"
            onPointerDown={startResize}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            className="group absolute inset-y-0 left-0 z-40 flex w-[10px] cursor-ew-resize touch-none items-center justify-start"
          >
            <div
              className={`h-full w-[2px] transition-colors ${
                resizing ? 'bg-[#409EFF]' : 'bg-transparent group-hover:bg-[#409EFF]/60'
              }`}
            />
          </div>
        )}
        {/* 顶部：会话标题 + 工具区 */}
        <header className="relative z-20 flex h-[54px] shrink-0 items-center justify-between border-b border-[#EDEFF3] px-6">
          <h1 className="truncate text-[14px] font-medium text-[#1F2329]">
            {title}
          </h1>
          <div className="flex items-center gap-[2px] text-[#4E5969]">
            <HeaderButton label="历史会话" active={historyOpen} onClick={() => setHistoryOpen((v) => !v)}>
              <History className="h-[17px] w-[17px]" strokeWidth={1.7} />
            </HeaderButton>
            <HeaderButton label="新建会话" onClick={startNewChat}>
              <MessageCirclePlus className="h-[17px] w-[17px]" strokeWidth={1.7} />
            </HeaderButton>
            <span className="mx-[8px] h-[14px] w-px bg-[#E5E8EE]" aria-hidden />
            <HeaderButton label={fullscreen ? '退出全屏' : '全屏'} onClick={toggleFullscreen}>
              {fullscreen ? (
                <Minimize2 className="h-[16px] w-[16px]" strokeWidth={1.7} />
              ) : (
                <Maximize className="h-[16px] w-[16px]" strokeWidth={1.7} />
              )}
            </HeaderButton>
            <HeaderButton label="关闭" onClick={onClose}>
              <X className="h-[17px] w-[17px]" strokeWidth={1.7} />
            </HeaderButton>
          </div>
        </header>

        {/* 会话区 */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-[4vh]">
              <img
                src={aiChatAvatar}
                alt="Copilot AI 智能助手"
                draggable={false}
                className="h-[92px] w-[92px] select-none object-contain mix-blend-multiply"
              />
              <h2 className="mt-2 text-[13px] font-normal text-[#909399]">有什么可以帮你？</h2>
              <p className="mt-1 text-[12px] text-[#B3B8C2]">输入消息，直接开始会话。</p>
            </div>
          ) : (
            <div className="w-full px-6 py-6">
              <div className="space-y-6">
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div key={message.id} className="flex flex-col items-end gap-1.5">
                      {message.mentions && message.mentions.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {message.mentions.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1 rounded-full bg-[#F5F7FA] px-2 py-0.5 text-[11px] text-[#606266]"
                            >
                              {m.kind === 'kb' ? (
                                <Folder className="h-[11px] w-[11px] text-[#34A853]" />
                              ) : (
                                <FileText className="h-[11px] w-[11px] text-[#8A9099]" />
                              )}
                              {m.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="max-w-[78%] whitespace-pre-wrap rounded-[14px] rounded-br-[6px] bg-[#F3F5F8] px-[16px] py-[11px] text-[14px] leading-[1.75] text-[#1F2329]">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex items-start gap-[12px]">
                      <img
                        src={aiChatAvatar}
                        alt=""
                        className="mt-[2px] h-[28px] w-[28px] shrink-0 object-contain mix-blend-multiply"
                      />
                      <AssistantMessage
                        status={message.status ?? 'done'}
                        reply={message.reply}
                        onOpenCitations={openCitationPanel}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* 历史会话：右侧轻量抽屉 */}
        {historyOpen && (
          <>
            <button
              type="button"
              aria-label="关闭历史会话"
              onClick={() => setHistoryOpen(false)}
              className="absolute inset-0 z-20 cursor-default bg-transparent"
            />
            <aside className="absolute bottom-0 right-0 top-[54px] z-30 w-[320px] border-l border-[#EDEFF3] bg-white px-5 py-5 shadow-[-8px_0_24px_rgba(16,24,40,0.04)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-medium text-[#1F2329]">历史会话</h2>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#8A9099] hover:bg-[#F5F6F8] hover:text-[#4E5969]"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-10 flex flex-col items-center text-center">
                <History className="h-8 w-8 text-[#D5D9E0]" strokeWidth={1.5} />
                <p className="mt-3 text-[13px] text-[#8A9099]">暂无历史会话</p>
                <p className="mt-1 text-[12px] text-[#B3B8C2]">开始对话后，记录会出现在这里</p>
              </div>
            </aside>
          </>
        )}

        {/* 底部输入区 */}
        <div className="relative z-10 shrink-0 px-6 pb-5 pt-2">
          <div className="relative w-full rounded-[14px] border border-[#E5E8EE] bg-white shadow-[0_2px_12px_rgba(16,24,40,0.03)] transition-colors focus-within:border-[#C9D2E0]">
            {mentionOpen && (
              <MentionPopover
                selected={mentions}
                onToggle={toggleMention}
                onClose={() => setMentionOpen(false)}
              />
            )}

            {(mentions.length > 0 || files.length > 0) && (
              <div className="flex flex-wrap gap-1.5 px-4 pt-3">
                {mentions.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex max-w-[220px] items-center gap-1.5 rounded-md border border-[#E5E8EE] bg-[#F7F9FC] px-2 py-0.5 text-[12px] text-[#1F2329]"
                  >
                    {item.kind === 'kb' ? (
                      <Folder className="h-[12px] w-[12px] shrink-0 text-[#34A853]" />
                    ) : (
                      <FileText className="h-[12px] w-[12px] shrink-0 text-[#8A9099]" />
                    )}
                    <span className="truncate">{item.name}</span>
                    <button
                      type="button"
                      aria-label={`移除 ${item.name}`}
                      onClick={() => toggleMention(item)}
                      className="text-[#9AA0AA] hover:text-[#4E5969]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {files.map((file, index) => (
                  <span
                    key={`${file}-${index}`}
                    className="inline-flex max-w-[240px] items-center gap-1.5 rounded-md bg-[#F3F5F8] px-2.5 py-0.5 text-[12px] text-[#4E5969]"
                  >
                    <span className="truncate">{file}</span>
                    <button
                      type="button"
                      aria-label={`移除 ${file}`}
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                      className="text-[#9AA0AA] hover:text-[#4E5969]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              onChange={(event) => {
                const val = event.target.value
                setInput(val)
                resizeInput()
                if (val.endsWith('@')) setMentionOpen(true)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  send()
                }
              }}
              placeholder="输入问题，或描述你想完成的事（输入 @ 引用知识库或文件）"
              className="block max-h-[144px] min-h-[48px] w-full resize-none bg-transparent px-4 pt-3.5 text-[14px] leading-[1.6] text-[#1F2329] outline-none placeholder:text-[#B3B8C2]"
            />

            <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1">
              <div className="flex items-center gap-1.5">
                <input ref={fileRef} type="file" multiple className="hidden" onChange={pickFiles} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  title="添加附件"
                  aria-label="添加附件"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#606266] transition-colors hover:bg-[#F3F5F8] hover:text-[#1F2329]"
                >
                  <Plus className="h-[17px] w-[17px]" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => setMentionOpen((v) => !v)}
                  title="引用知识库或文件 (@)"
                  aria-label="引用知识库或文件"
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    mentionOpen
                      ? 'bg-[#ECF5FF] text-[#409EFF]'
                      : 'text-[#606266] hover:bg-[#F3F5F8] hover:text-[#1F2329]'
                  }`}
                >
                  <AtSign className="h-[15px] w-[15px]" strokeWidth={1.8} />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setApprovalOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={approvalOpen}
                    className={`flex h-[28px] items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition-colors ${
                      approvalOpen
                        ? 'border-[#C9D2E0] bg-[#F7F8FA] text-[#1F2329]'
                        : 'border-[#E5E8EE] text-[#606266] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <Hand className="h-[13px] w-[13px] text-[#8A9099]" strokeWidth={1.7} />
                    {APPROVAL_LABEL[approval]}
                    <ChevronDown
                      className={`h-[12px] w-[12px] text-[#9AA0AA] transition-transform ${approvalOpen ? 'rotate-180' : ''}`}
                      strokeWidth={1.8}
                    />
                  </button>

                  {approvalOpen && (
                    <div
                      role="menu"
                      className="absolute bottom-[36px] left-0 w-[188px] rounded-xl border border-[#E7EAF0] bg-white p-1.5 shadow-[0_8px_28px_rgba(16,24,40,0.12)]"
                    >
                      {(['manual', 'auto'] as ApprovalMode[]).map((mode) => (
                        <button
                          key={mode}
                          role="menuitemradio"
                          aria-checked={approval === mode}
                          onClick={() => {
                            setApproval(mode)
                            setApprovalOpen(false)
                          }}
                          className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-[#F5F7FA]"
                        >
                          <span
                            className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${approval === mode ? 'bg-[#409EFF]' : 'bg-transparent'}`}
                          />
                          <span className="min-w-0">
                            <span className="block text-[13px] text-[#1F2329]">{APPROVAL_LABEL[mode]}</span>
                            <span className="mt-0.5 block text-[11px] leading-4 text-[#9AA0AA]">
                              {mode === 'manual' ? '每一步执行前先确认' : '连续执行，仅在异常时打断'}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="语音输入"
                  aria-label="语音输入"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#C0C4CC] transition-colors hover:bg-[#F3F5F8]"
                >
                  <span className="h-[15px] w-[15px] rounded-full border-[1.5px] border-[#DCDFE6]" />
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={!input.trim()}
                  title="发送"
                  aria-label="发送"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F5] text-[#B3B8C2] transition-colors disabled:cursor-not-allowed enabled:bg-[#409EFF] enabled:text-white enabled:hover:bg-[#66B1FF]"
                >
                  <Send className="h-[15px] w-[15px]" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div className="pointer-events-none absolute bottom-[120px] left-1/2 z-40 -translate-x-1/2 rounded-lg bg-[#1F2329] px-4 py-2 text-[12px] text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function HeaderButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
        active ? 'bg-[#F0F3F8] text-[#1F2329]' : 'text-[#5A6270] hover:bg-[#F5F6F8] hover:text-[#1F2329]'
      }`}
    >
      {children}
    </button>
  )
}

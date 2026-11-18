/**
 * 智能知识库（单入口应用 / 子页面聚合路由）
 *
 * 侧栏 = 九宫格面板「智能中心」列的 1:1 投影：
 *   智能应用  → 智能知识库
 *   系统设置  → 模型管理 / 工具管理 / 技能管理 / 参数配置（仅管理员）
 * 单入口：内部状态切换，不注册子路由。
 */
import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { PlatformShell, FloatingChatButton } from './_shared'
import { ModelManagementPage } from './ModelManagement'
import { ToolManagementPage } from './ToolManagement'
import { SkillManagementPage } from './SkillManagement'
import { ConfigManagementPage } from './ConfigManagement'
import { KnowledgeBaseListPage } from './KnowledgeBase'
import { KnowledgeBaseWorkspace } from './KnowledgeBase/Workspace'
import { KB_RECORDS, type KbRecord } from './KnowledgeBase/model'
import type { CreateKbPayload } from './KnowledgeBase/CreateDialog'
import { useModelRegistry } from './ModelManagement/store'
import { registerKbIndex, removeKbIndex } from './KnowledgeBase/indexState'
import { DocPanel, DocProvider, FEATURES } from './feature-tags'

export default function IntelligentKnowledgeBaseApp({ __showFeat = false }: { __showFeat?: boolean }) {
  const [activePage, setActivePage] = useState('kb')
  const { models, defaults } = useModelRegistry()
  const [docCode, setDocCode] = useState<string | null>(null)
  /** 已进入的库名；null = 库列表 */
  const [openKb, setOpenKb] = useState<string | null>(null)
  /** 库列表（建库后即时插入；切页后仍保留，刷新恢复 Mock） */
  const [kbs, setKbs] = useState<KbRecord[]>(KB_RECORDS)
  const [toast, setToast] = useState<string | null>(null)
  /** 从知识库阻断弹窗跳转时，自动打开默认模型设置 */
  const [defaultsRequested, setDefaultsRequested] = useState(false)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const changePage = (key: string) => {
    setActivePage(key)
    setOpenKb(null)
    setDefaultsRequested(false)
  }

  const requestDefaultSetup = () => {
    setActivePage('model')
    setOpenKb(null)
    setDefaultsRequested(true)
  }

  const createKb = (payload: CreateKbPayload, enterAfterCreate: boolean) => {
    const embedding = models.find(
      (model) => model.id === defaults.embedding && model.capability === 'embedding',
    )
    const record: KbRecord = {
      name: payload.name,
      desc: payload.desc || '暂无描述。',
      docs: 0,
      creator: '张虎测试',
      createdAt: '2026-11-13',
      chunk: payload.chunk,
    }
    setKbs((prev) => [record, ...prev])
    registerKbIndex(record.name, record.docs, {
      id: embedding?.id ?? 'bge-m3',
      name: embedding?.name ?? 'BGE-M3',
    })
    setToast(`知识库「${record.name}」已创建`)
    if (enterAfterCreate) setOpenKb(record.name)
  }

  const deleteKb = (name: string) => {
    setKbs((prev) => prev.filter((kb) => kb.name !== name))
    removeKbIndex(name)
    if (openKb === name) setOpenKb(null)
    setToast(`知识库「${name}」已删除`)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'kb': {
        const currentKb = openKb ? kbs.find((kb) => kb.name === openKb) : undefined
        return currentKb ? (
          <KnowledgeBaseWorkspace
            kb={currentKb}
            onBack={() => setOpenKb(null)}
            onNotify={setToast}
          />
        ) : (
          <KnowledgeBaseListPage
            kbs={kbs}
            onOpen={setOpenKb}
            onCreate={createKb}
            onDelete={deleteKb}
            onRequestDefaultSetup={requestDefaultSetup}
            onNotify={setToast}
          />
        )
      }
      case 'model':
        return (
          <ModelManagementPage
            defaultsOpenOnMount={defaultsRequested}
            onDefaultsModalOpened={() => setDefaultsRequested(false)}
            onNotify={setToast}
          />
        )
      case 'tool':
        return <ToolManagementPage />
      case 'skill':
        return <SkillManagementPage />
      case 'param':
        return <ConfigManagementPage />
      default:
        return <ModelManagementPage />
    }
  }

  return (
    <DocProvider
      showFeat={__showFeat}
      features={FEATURES}
      accent="hsl(243 75% 59%)"
      onOpenDoc={setDocCode}
    >
      <PlatformShell activePage={activePage} onPageChange={changePage}>
        <FloatingChatButton activeKb={activePage === 'kb' ? openKb : null} />
        {renderPage()}
        {toast && (
          <div className="pointer-events-none fixed bottom-[32px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-[6px] border border-[#e1f3d8] bg-[#f0f9eb] px-4 py-2.5 text-[13px] text-[#3f7a1f] shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <CheckCircle2 className="h-[15px] w-[15px] text-[#67C23A]" />
            {toast}
          </div>
        )}
      </PlatformShell>
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}
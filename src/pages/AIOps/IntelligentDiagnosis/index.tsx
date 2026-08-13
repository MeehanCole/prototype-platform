/**
 * [功能标注] PRD FR-4 智能诊断（应用面统一入口 / 子页面聚合路由）
 * IssuePilot 智能诊断平台 - 单入口聚合
 * 1 个完整应用 = 1 个 index.tsx，内部通过状态切换子页面
 * 子页面：模型管理 / 工具管理 / 技能管理（管理面无独立智能对话页，对话统一走应用面常驻入口；自定义智能体已移除，统一主 Agent + 预置 Skill + 动态派发 Subagent）
 */
import { useState } from 'react'
import { PlatformShell, FloatingChatButton } from './_shared'
import { ModelManagementPage } from './ModelManagement'
import { ToolManagementPage } from './ToolManagement'
import { SkillManagementPage } from './SkillManagement'
import { ConfigManagementPage } from './ConfigManagement'
import { AlertCenterPage } from './AlertCenter'
import { DocProvider, DocPanel } from './feature-tags'

export default function IntelligentDiagnosisApp({ __showFeat = false }: { __showFeat?: boolean }) {
  const [activePage, setActivePage] = useState('model')
  const [docCode, setDocCode] = useState<string | null>(null)

  const renderPage = () => {
    switch (activePage) {
      case 'model':
        return <ModelManagementPage />
      case 'tool':
        return <ToolManagementPage />
      case 'skill':
        return <SkillManagementPage />
      case 'config':
        return <ConfigManagementPage />
      case 'alert':
        return <AlertCenterPage />
      default:
        return <ModelManagementPage />
    }
  }

  return (
    <DocProvider showFeat={__showFeat} onOpenDoc={setDocCode}>
      <PlatformShell activePage={activePage} onPageChange={setActivePage}>
        <FloatingChatButton />
        {renderPage()}
      </PlatformShell>
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}

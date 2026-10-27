/**
 * 智能诊断 · 功能点批注配置
 *
 * 通用件（Provider / NewTag / DocPanel / pick）来自 @/lib/feature-tags/core。
 * 规范：.skills/agent-rules.md D3　模板：.skills/templates.md §10
 */
import prdRaw from './prd.md?raw'
import { pick, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag } from '@/lib/feature-tags/core'

type LegacyType = 'A' | 'B' | 'M' | 'R'

/** 原 FEATURE_LABELS 数据（标题 + 一句话说明 + PRD 抽取范围） */
const LABELS: Record<
  string,
  { type: LegacyType; title: string; desc: string; from: string; to?: string }
> = {
  'FR-1': {
    type: 'M',
    title: '模型管理',
    desc: '模型注册、启停控制、默认模型设置；支持 LLM / 视觉模型，仅 LLM 可设为默认。',
    from: '**FR-1',
    to: '**FR-2',
  },
  'FR-2': {
    type: 'M',
    title: '工具管理 (MCP)',
    desc: 'MCP 工具服务注册与管理：协议（SSE/Streamable HTTP）、自定义请求头、连通性测试、函数查看与调试。',
    from: '**FR-2',
    to: '**FR-3',
  },
  'FR-3': {
    type: 'M',
    title: '技能管理',
    desc: 'SKILL.md 技能导入/导出/删除；技能即文件，文件存在即生效，由开发侧维护，原型不提供创建/编辑。',
    from: '**FR-3',
    to: '**FR-4',
  },
  'FR-4': {
    type: 'M',
    title: '智能诊断（应用面统一入口）',
    desc: 'Copilot AI 智能助手：常驻对话 + 告警行内联动，五阶段诊断流程，诊断历史还原与导出。',
    from: '**FR-4',
    to: '**FR-5',
  },
  'FR-5': {
    type: 'M',
    title: '告警中心',
    desc: '告警消息中心（概览/指标/日志/事件/历史 5 Tab），行内「智能诊断」联动发起诊断。',
    from: '**FR-5',
    to: '**FR-6',
  },
  'FR-6': {
    type: 'M',
    title: '配置管理（Agent 运行参数）',
    desc: '本轮新增：Agent 迭代次数、上下文压缩上限、诊断超时、并发 Subagent 数、最大回溯步数；参数为前端原型，实际生效依赖后端。',
    from: '**FR-6',
    to: '**F-Copilot',
  },
  'F-Copilot': {
    type: 'M',
    title: '对话助手统一命名 Copilot AI 智能助手',
    desc: '本轮变更：对话框顶部标题、欢迎语、导出报告统一命名为「Copilot AI 智能助手」，替代原「智能诊断助手」。',
    from: '**F-Copilot',
    to: '**F-Perm',
  },
  'F-Perm': {
    type: 'M',
    title: '工具权限统一 OIDC + RBAC 管控',
    desc: '本轮变更：移除工具级「所需权限域」声明与前端预检 UI，权限判定完全落在后端资源侧 RBAC 与项目域过滤。',
    from: '**F-Perm',
  },
}

export const FEATURES: Record<string, FeatureDoc> = Object.fromEntries(
  Object.entries(LABELS).map(([code, v]) => [
    code,
    {
      type: v.type === 'A' ? '新增' : '变更',
      title: v.title,
      changes: [v.desc],
      doc: pick(prdRaw, v.from, v.to),
    } satisfies FeatureDoc,
  ]),
)

/**
 * 智能知识库 · 功能点批注配置（FR-1~FR-5 沿用智能诊断基线，FR-6 已按知识库参数配置重写（运行与存储 + 容量与配额），FR-7 向量索引迁移与重建，FR-8 库内召回测试）
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
    desc: '模型卡片列表：模型名称、能力分类（对话/向量/重排）、多模态标记、协议类型、请求地址与启用状态；支持搜索、添加、编辑、启停与删除。对话模型可标记「支持图片理解」，随对话默认模型生效；页首统一设置三类默认模型（对话、向量必选，重排可选）并展示必选项配置进度，必选项缺失时持续提示且阻止创建知识库，默认模型受引用保护。',
    from: '**FR-1',
    to: '**FR-2',
  },
  'FR-2': {
    type: 'M',
    title: '工具管理 (MCP)',
    desc: 'MCP 服务器注册与管理：MCP 名称、连接方式、服务地址与启用开关；支持搜索、添加、编辑与删除。',
    from: '**FR-2',
    to: '**FR-3',
  },
  'FR-3': {
    type: 'M',
    title: '技能管理',
    desc: '技能双 Tab：用户技能支持搜索、导入、停用/启用、导出与删除；内置技能提供 42 个只读技能卡片与分页浏览。',
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
    title: '参数配置（运行与存储、容量与配额）',
    desc: '单页无 Tab。运行与存储：运行资源、数据库/对象存储占用、会话清理与审计保留；容量与配额：单库文档、单库存储、单文件大小、单用户建库四项平台上限，支持校验、保存与还原。不提供默认分块与解析富化配置；新建库使用内置推荐预设，库内「库设置」由创建人维护分块与富化，只影响后续上传与重新解析。',
    from: '**FR-6',
    to: '**FR-7',
  },
  'FR-7': {
    type: 'M',
    title: '向量索引迁移与重建',
    desc: '切换默认向量模型时先展示影响范围（受影响知识库、文档数、旧/新模型）与空库提示，可选「仅切换默认，稍后重建」或「切换并立即重建」；待重建库在列表与工作台展示旧模型提示与状态徽标，支持单库重建与全部重建，重建过程展示进度，完成后更新索引模型与时间。空库直接跟随新模型，不产生待重建状态。',
    from: '**FR-7',
    to: '**FR-8',
  },
  'FR-8': {
    type: 'M',
    title: '召回测试（库内最小闭环）',
    desc: '工作台提供「召回测试」：输入问题后按当前索引模型检索，支持 TopK、相似度阈值与重排开关（无默认重排模型时禁用），展示命中分块、得分、文档/标题、高亮片段与耗时；可「查看原文」跳转到对应文档详情，未索引/待重建/重建中给出状态提示。',
    from: '**FR-8',
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

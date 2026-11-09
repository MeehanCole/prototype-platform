import prdRaw from './prd_v2.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-01': {
    type: '变更',
    title: '在线服务页面整体重新设计（卡片列表 + 过滤条件优化 + 术语统一）',
    changes: [
      '列表视图由 11 列宽表格重构为响应式「服务卡片列表」，单卡聚合发布状态/范围、调用模型名与接入地址一键复制、后端推理实例健康与路由权重进度条、高可用标签（缓存 / Fallback / 限流）及底部精简监控指标（含悬停明细提示与快捷操作）',
      '顶部过滤条件由独立三框并列搜索卡优化为顶栏右侧「字段切换 + 动态输入/下拉」一体化组合筛选器（支持切换「服务名称」「调用模型名」「发布类型」并保持后置输入框/下拉框尺寸与边框对齐）',
      '统一全链路业务术语：「策略名称 → 服务名称」「模型名称 → 调用模型名」「后端服务类型（内部/外部推理服务） → 后端推理类型（内部/外部推理实例）」「后端服务实例 → 后端推理实例」',
    ],
    rules: [
      { rule: '灰度发布（金丝雀 / 蓝绿）服务卡片', message: '同样展示「🛡 Fallback」标签（灰度发布策略下不再隐藏）' },
      { rule: '未发布状态的服务卡片', message: '接入地址显示为「–」，复制按钮置灰禁用并提示「未发布，暂无接入地址」' },
    ],
    prdRef: 'FR-1',
    doc: pick(prdRaw, '**FR-1 在线服务页面整体重新设计**'),
  },
}

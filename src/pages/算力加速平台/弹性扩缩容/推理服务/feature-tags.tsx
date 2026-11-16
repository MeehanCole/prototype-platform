/**
 * 推理服务 · 功能点批注配置（变更点视角）
 *
 * 通用件（Provider / NewTag / DocPanel / pick）来自 @/lib/feature-tags/core，
 * 本文件只保留「本次改了什么」的配置。
 * 规范：.skills/agent-rules.md D3　　模板：.skills/templates.md §10
 */
import prdRaw from './prd.md?raw'
import { pick, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag } from '@/lib/feature-tags/core'

export const FEATURES: Record<string, FeatureDoc> = {
  'F-CARD': {
    type: '变更',
    title: '卡片新增「指标模式」取值，模型副本改显区间',
    changes: ['「弹性模式」字段新增取值「指标模式」', '该模式下「模型副本」显示区间（如 1–4）'],
    prdRef: 'PRD 4.1',
    doc: pick(prdRaw, '| 弹性模式展示 |', '| 状态 |'),
  },

  'F-METRIC': {
    type: '新增',
    title: '弹性模式新增第三项「指标模式」',
    changes: [
      '在「常规模式 / Serverless 模式」之外新增「指标模式」',
      '按算力指标判断是否放开副本上限，不再只看请求数',
      '选中后表单为：指标来源 → 伸缩条件 → 副本区间 → 缩容检测窗口',
    ],
    scope: '仅 vLLM 框架可选；KTransformer 下置灰',
    rules: [
      { rule: '指标模式必须先选「算力规格」', message: '指标模式需先选择算力规格' },
      { rule: '最小模型副本数 ≥ 1', message: '最小模型副本数不能为 0（算力资源冷启动需数分钟，至少保留 1 个副本）' },
      { rule: '最小副本数 ≤ 最大副本数（允许相等）', message: '最大模型副本数不能小于最小模型副本数' },
    ],
    prdRef: 'PRD 4.2.1',
    doc: pick(prdRaw, '按算力指标判断是否需要扩容', '**指标来源：内置指标**'),
  },

  'F-MULTI': {
    type: '新增',
    title: '内置指标支持多条件组合',
    changes: [
      '伸缩条件支持 1~3 条，每条「指标 + ≥ + 阈值」',
      '2 条及以上出现「且 / 或」条件关系',
      '聚合方式必填（平均值 / 最大值 / 求和）',
    ],
    rules: [
      { rule: '伸缩条件 1 ~ 3 条', message: '达到 3 条后不再显示「添加条件」' },
      { rule: '条件关系必填（2 条及以上时）', message: '默认「且」' },
      { rule: '聚合方式必填', message: '默认「平均值」' },
    ],
    prdRef: 'PRD 4.2.1',
    doc: pick(prdRaw, '**指标来源：内置指标**', '**指标来源：自定义表达式**'),
  },

  'F-CUSTOM': {
    type: '新增',
    title: '指标来源新增「自定义 PromQL」',
    changes: [
      '不再只能选内置指标，可手写完整判断条件（含比较）',
      '因此该模式下不出现「阈值」字段',
      '输入时联想可用指标名，保存前校验必须返回单值',
    ],
    rules: [
      { rule: '表达式非空', message: '请输入指标表达式' },
      { rule: '必须包含比较条件', message: '表达式未包含比较条件，请写成「指标 > 阈值」的形式' },
      { rule: '必须返回单个数值', message: '返回多个序列，请使用聚合' },
    ],
    prdRef: 'PRD 4.2.1',
    doc: pick(prdRaw, '**指标来源：自定义表达式**', '**模式限制**'),
  },

  'F-VENDOR': {
    type: '新增',
    title: '指标按算力型号过滤，支持多厂商',
    changes: [
      '「算力型号」取自「算力规格」选中行，指标随之过滤',
      '支持英伟达 / 昇腾 / Metax / 寒武纪 / 海光 / 天数',
      '英伟达 7 项指标，其余厂商为算力利用率 + 显存使用率',
    ],
    prdRef: 'PRD 第 6 节',
    doc: pick(prdRaw, '## 6. 指标能力说明', '## 7.'),
  },

  'F-LIMIT': {
    type: '变更',
    title: 'KTransformer 不再提供弹性选项',
    changes: [
      'KTransformer 框架下仅可选「常规模式」',
      'Serverless / 指标模式置灰不可点',
      '切换到 KTransformer 时自动回落到常规模式',
    ],
    rules: [{ rule: 'KTransformer 仅允许「常规模式」', message: '置灰 + 悬停提示' }],
    prdRef: 'PRD 4.2.1',
    doc: pick(prdRaw, '**模式限制**', '### 4.3'),
  },

  'F-DETAIL': {
    type: '变更',
    title: '详情新增指标模式的弹性配置回显',
    changes: [
      '「弹性伸缩」分区新增指标模式内容',
      '展示：伸缩条件（含且/或）、聚合方式、最小/最大副本、缩容检测窗口',
      '算力型号不在此重复，底部「规格信息」已有',
    ],
    scope: '弹性模式为「指标模式」时才展示',
    prdRef: 'PRD 4.4',
    doc: pick(prdRaw, '**基本信息 · 弹性伸缩**', '> 算力型号不在弹性分区'),
  },
}

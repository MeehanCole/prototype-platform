import prdRaw from './prd_v2.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-01': {
    type: '变更',
    title: '基础配置信息上移至顶部概览卡，并与创建页字段对齐',
    changes: [
      '将原【服务配置】Tab 下的基础配置信息上移整合至页面顶部概览卡，切换任意 Tab 均常驻可见',
      '第一行展示服务名称、发布状态及操作按钮（发布/停止发布、编辑、删除、刷新）',
      '第二行以 3 列网格展示：服务名称、调用模型名、发布类型、后端推理类型、后端推理实例、创建时间及关联模型（公开发布+内部推理实例时）',
    ],
    prdRef: 'FR-1',
    doc: pick(prdRaw, '**FR-1 服务名称统一**'),
  },
  'F-02': {
    type: '变更',
    title: '「模型名称」改为「调用模型名」并与 API 文档联动',
    changes: [
      '标签由「模型名称」改为「调用模型名」，与创建/编辑页完全一致',
      '同步驱动【API 文档】Tab 示例代码中 "model" 字段动态展示当前服务的调用模型名',
    ],
    prdRef: 'FR-2',
    doc: pick(prdRaw, '**FR-2 调用模型名统一**'),
  },
  'F-03': {
    type: '变更',
    title: '「后端推理类型」统一与高可用安全项对齐',
    changes: [
      '顶部概览卡展示「后端推理类型」，枚举值为「内部推理实例 / 外部推理实例」',
      '【模型Fallback】在常规路由或未开启灰度时展示「是否开启」与「兜底推理实例」，灰度发布下自动隐藏',
      '【全局限流】开启时补充展示「请求频次上限」，【请求超时时间】命名与创建页一致',
    ],
    prdRef: 'FR-3',
    doc: pick(prdRaw, '**FR-3 后端推理类型统一与模型Fallback联动**'),
  },
  'F-04': {
    type: '变更',
    title: '「后端推理实例」展示对齐',
    changes: [
      '顶部概览卡展示关联的「后端推理实例」及运行状态（正常 / 异常），与列表页和创建/编辑页一致',
    ],
    prdRef: 'FR-4',
    doc: pick(prdRaw, '**FR-4 后端推理实例统一**'),
  },
  'F-05': {
    type: '新增',
    title: '【服务配置】聚焦策略项并与创建页对齐（缓存 / 流量分发 / 高可用与安全）',
    changes: [
      '【服务配置】Tab 纯粹承载策略项：缓存加速 -> 流量分发策略 -> 模型Fallback -> 全局限流 -> 请求超时时间',
      '【流量分发策略】展示「是否开启」「策略类型（常规路由策略 / 灰度发布策略）」「分发方式（按权重分发 / 金丝雀发布 / 蓝绿发布）」与「权重配置」',
      '蓝绿发布在「权重配置」中采用与创建页相同的状态徽章「当前生效 (100%) / 待命 (0%)」只读展示',
    ],
    prdRef: 'FR-5',
    doc: pick(prdRaw, '**FR-5 路由策略灰度发布（金丝雀 / 蓝绿）**'),
  },
}

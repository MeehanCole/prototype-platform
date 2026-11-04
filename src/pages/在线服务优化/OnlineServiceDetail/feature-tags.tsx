import prdRaw from './prd_v2.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-01': {
    type: '变更',
    title: '基本信息「策略名称」改为「服务名称」',
    changes: [
      '【服务配置】->【基本信息】中第 1 项标签由「策略名称」改为「服务名称」',
    ],
    prdRef: 'FR-1',
    doc: pick(prdRaw, '**FR-1 服务名称统一**'),
  },
  'F-02': {
    type: '变更',
    title: '基本信息「模型名称」改为「调用模型名」',
    changes: [
      '【服务配置】->【基本信息】中第 2 项标签由「模型名称」改为「调用模型名」',
    ],
    prdRef: 'FR-2',
    doc: pick(prdRaw, '**FR-2 调用模型名统一**'),
  },
  'F-03': {
    type: '变更',
    title: '「后端推理类型」及选项统一为「内部/外部推理实例」',
    changes: [
      '【基本信息】展示「后端推理类型」，枚举值为「内部推理实例 / 外部推理实例」',
      '【模型Fallback】中备用模型类型标签同步改为「内部推理实例 / 外部推理实例」',
    ],
    prdRef: 'FR-3',
    doc: pick(prdRaw, '**FR-3 后端推理类型统一**'),
  },
  'F-04': {
    type: '变更',
    title: '「后端推理实例」展示对齐',
    changes: [
      '【基本信息】展示关联的「后端推理实例」及状态，与列表页和创建/编辑页字段名完全一致',
    ],
    prdRef: 'FR-4',
    doc: pick(prdRaw, '**FR-4 后端推理实例统一**'),
  },
}

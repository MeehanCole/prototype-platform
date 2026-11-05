import prdRaw from './prd_v2.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-01': {
    type: '变更',
    title: '「策略名称」统一改为「服务名称」',
    changes: [
      '顶部筛选区标签由「策略名称」改为「服务名称」，占位提示改为「请输入服务名称」',
      '列表表格第 1 列列头由「策略名称」改为「服务名称」',
      '与菜单名称「在线服务」及按钮「创建在线服务」保持概念一致',
    ],
    prdRef: 'FR-1',
    doc: pick(prdRaw, '**FR-1 服务名称统一**'),
  },
  'F-02': {
    type: '变更',
    title: '「模型名称」统一改为「调用模型名」',
    changes: [
      '顶部筛选区标签由「模型名称」改为「调用模型名」，占位提示改为「请选择调用模型名」',
      '列表表格第 2 列列头由「模型名称」改为「调用模型名」',
      '明确其代表 API 调用时的 model 请求参数，避免与关联模型混淆',
    ],
    prdRef: 'FR-2',
    doc: pick(prdRaw, '**FR-2 调用模型名统一**'),
  },
  'F-03': {
    type: '变更',
    title: '「后端服务类型」改为「后端推理类型」及选项对齐',
    changes: [
      '列表表格第 7 列列头由「后端服务类型」改为「后端推理类型」',
      '单元格枚举值由「内部推理服务 / 外部推理服务」改为「内部推理实例 / 外部推理实例」',
      '与左侧菜单「推理实例」及后续字段口径保持一致',
    ],
    prdRef: 'FR-3',
    doc: pick(prdRaw, '**FR-3 后端推理类型优化**'),
  },
  'F-04': {
    type: '变更',
    title: '「后端服务实例」统一改为「后端推理实例」',
    changes: [
      '列表表格第 8 列列头由「后端服务实例」改为「后端推理实例」',
      '与创建页、编辑页、详情页统一字段名称',
    ],
    prdRef: 'FR-4',
    doc: pick(prdRaw, '**FR-4 后端推理实例统一**'),
  },
  'F-05': {
    type: '新增',
    title: '路由策略灰度发布与移除Fallback',
    changes: [
      '路由策略支持「按权重分发」「金丝雀发布」「蓝绿发布」三种发布模式',
      '卡片与表格直观展示实例角色（基线/金丝雀/主/备）与流量权重',
      '下线移除冗余的「模型Fallback」',
    ],
    prdRef: 'FR-6',
    doc: pick(prdRaw, '**FR-6 路由策略升级与灰度发布**'),
  },
}

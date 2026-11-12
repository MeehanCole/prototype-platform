import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-01': {
    type: '变更',
    title: '「选择 API Key」新增说明提示，下拉仅展示已启用的 API Key',
    changes: [
      '「选择 API Key」标题右侧新增 ⓘ 说明提示，悬停展示「只有启用的 API Key 可以使用」',
      '提示气泡通过 Portal 挂载到页面最上层，不再被左侧面板的滚动容器裁切或被其他浮层遮挡',
      'API Key 下拉列表过滤掉停用项，仅保留启用状态的 API Key 可选',
    ],
    scope: '提示与过滤仅作用于「选择 API Key」控件，已选中的 API Key 显示逻辑不变',
    prdRef: 'PRD 2 · 左侧控制面板 · API Key 选择',
    doc: pick(prdRaw, '**API Key 选择**', '**模型服务选择**'),
  },
}
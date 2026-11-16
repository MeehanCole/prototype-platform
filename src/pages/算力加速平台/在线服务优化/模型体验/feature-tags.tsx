import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-01': {
    type: '变更',
    title: '「选择 API Key」说明提示明确可用条件：启用且未开启 IP 白名单限制',
    changes: [
      '「选择 API Key」标题右侧 ⓘ 提示文案更新为「只有启用且未开启 IP 白名单限制的 API Key 可以使用」',
      '提示气泡通过 Portal 挂载到页面最上层，不再被左侧面板的滚动容器裁切或被其他浮层遮挡',
      'API Key 下拉列表过滤掉停用项，仅保留启用状态的 API Key 可选；开启 IP 白名单限制的 API Key 同样不可使用',
    ],
    scope: '可用条件与提示仅作用于「选择 API Key」控件，已选中的 API Key 显示逻辑不变',
    prdRef: 'PRD 2 · 左侧控制面板 · API Key 选择',
    doc: pick(prdRaw, '**API Key 选择**', '**模型服务选择**'),
  },
}
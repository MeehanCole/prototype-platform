import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-ASSET': {
    type: '变更',
    title: '抽成通用资源配额展示组件',
    changes: [
      '集群卡片与配额表格抽到通用资源配额展示组件，页面只保留业务数据与弹窗状态',
      '开发环境新增实时预览，与租户配额页面共用同一实现',
      '租户配额从协作台导航隐藏，直接路由仍可访问',
    ],
    prdRef: 'FR-1 集群配额卡片',
    doc: pick(prdRaw, '### FR-1 集群配额卡片', '### FR-2 配额表格'),
  },
  'F-STORAGE': {
    type: '变更',
    title: '调整数据存储配额提示布局',
    changes: [
      '容量提示改为「当前系统存储容量：1000 GB ｜ 当前剩余可分配配额：200 GB」',
      '移除蓝色超分注意块与 CircleAlert 图标',
      '数据存储输入框与上方 CPU / 内存输入框左对齐、等宽，容量提示与输入行同排展示',
    ],
    prdRef: 'FR-3 编辑配额弹窗',
    doc: pick(prdRaw, '1. **数据存储**', '2. **GPU 配额**'),
  },
}

import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-STORAGE': {
    type: '新增',
    title: '新增数据存储配额管理',
    changes: [
      '项目配额列表新增「数据存储」行，展示资源类型、已使用、配额和余量',
      '编辑项目配额弹窗提供数据存储容量输入，单位为 GB',
      '输入区旁展示当前系统存储容量与剩余可分配配额，辅助配置容量',
      '数据存储配额留空表示不限制，保存后同步更新列表中的配额与余量',
    ],
    prdRef: 'FR-6 编辑项目配额 / 编辑容器配额',
    doc: pick(prdRaw, '1. **数据存储**', '2. **GPU 配额**'),
  },
}

import prdRaw from './prd.md?raw'
import { DocPanel, DocProvider, NewTag, pick, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-SPACE-CHECK': {
    type: '新增',
    title: '新增存储空间校验',
    changes: [
      '进入页面即校验当前项目的数据存储空间是否开通',
      '未开通时展示「未检测到数据集空间」阻断提示，并说明无法读取或上传数据集',
    ],
    rules: [
      {
        rule: '当前项目必须已配置数据存储空间',
        message: '系统检测到该项目尚未在平台中分配数据存储空间，无法直接读取或上传数据集。请联系管理员',
      },
    ],
    prdRef: 'FR-1 存储空间校验与阻断提示弹窗',
    doc: pick(prdRaw, '### FR-1 存储空间校验与阻断提示弹窗', '### FR-2 空列表'),
    scope: '仅未开通数据存储空间时展示',
  },
}

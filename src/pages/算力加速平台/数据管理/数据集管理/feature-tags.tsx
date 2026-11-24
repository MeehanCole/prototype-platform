import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-SEARCH': {
    type: '变更',
    title: '收窄数据集搜索为名称检索',
    changes: [
      '列表搜索只按数据集名称匹配，移除原检索字段下拉',
      '输入关键字后点击放大镜或回车才会生效，搜索后回到第 1 页',
    ],
    prdRef: 'FR-2 搜索',
    doc: pick(prdRaw, '### FR-2 搜索', '### FR-3 创建数据集'),
  },
  'F-CLEAR': {
    type: '新增',
    title: '新增搜索关键字清空入口',
    changes: [
      '输入框有内容时显示清空按钮',
      '点击清空会同时清除草稿关键字与生效筛选，并回到第 1 页',
    ],
    prdRef: 'FR-2 搜索 · 业务规则 5',
    doc: pick(prdRaw, '5. **点击清空按钮**', '### FR-3 创建数据集'),
  },
  'F-PAGINATION': {
    type: '变更',
    title: '抽出统一表格分页素材',
    changes: [
      '列表分页改用共享 TablePagination 组件',
      '上一页、页码、下一页与每页条数选择均由同一组件提供',
      '组件已注册为素材库示例，供其他表格复用',
    ],
    prdRef: 'FR-8 分页',
    doc: pick(prdRaw, '### FR-8 分页', '### FR-9 存储空间前置校验'),
  },
}

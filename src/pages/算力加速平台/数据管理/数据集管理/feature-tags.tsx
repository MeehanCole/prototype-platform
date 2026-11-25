import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-LIST': {
    type: '新增',
    title: '新增数据集列表展示',
    changes: [
      '以表格展示数据集名称、最新版本、数据集标签、状态、创建者、创建时间与操作',
      '数据集名称支持进入详情并可直接编辑，状态列展示导入结果并悬浮说明失败原因',
      '无数据时展示空态文案并引导创建数据集',
    ],
    prdRef: 'FR-1 数据集列表',
    doc: pick(prdRaw, '### FR-1 数据集列表', '### FR-2 搜索'),
  },
  'F-SEARCH': {
    type: '新增',
    title: '新增数据集名称检索',
    changes: [
      '工具栏提供数据集名称关键字输入与放大镜按钮',
      '仅按数据集名称进行模糊匹配，大小写不敏感',
      '点击放大镜或回车后执行搜索，并回到第 1 页',
    ],
    prdRef: 'FR-2 搜索',
    doc: pick(prdRaw, '### FR-2 搜索', '### FR-3 创建数据集'),
  },
  'F-CLEAR': {
    type: '新增',
    title: '新增搜索关键字清空入口',
    changes: [
      '输入框有内容时显示清空按钮',
      '点击后同时清空输入关键字和列表筛选，并回到第 1 页',
    ],
    prdRef: 'FR-2 搜索 · 业务规则 5',
    doc: pick(prdRaw, '5. **点击清空按钮**', '### FR-3 创建数据集'),
  },
  'F-PAGINATION': {
    type: '新增',
    title: '新增统一表格分页',
    changes: [
      '列表提供上一页、页码、下一页与每页条数选择',
      '支持 10 / 20 / 50 条每页，筛选后按结果重新分页',
      '分页控件复用 TablePagination，保持一致交互',
    ],
    prdRef: 'FR-8 分页',
    doc: pick(prdRaw, '### FR-8 分页', '### FR-9 存储空间前置校验'),
  },
}

import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-DATASET-SOURCE': {
    type: '新增',
    title: '新增平台数据集数据来源',
    changes: [
      '数据集来源由单一合成数据扩展为「内部合成数据 / 平台数据集」两项单选，默认仍为内部合成数据',
    ],
    prdRef: 'FR-数据集来源',
    doc: pick(prdRaw, '#### 数据集来源', '##### 平台数据集'),
  },
  'F-DATASET-SEARCH': {
    type: '新增',
    title: '新增平台数据集名称检索',
    changes: [
      '数据集下拉浮层不设分类标签页，改为顶部搜索框，按名称模糊检索（大小写不敏感的子串匹配）',
    ],
    prdRef: 'FR-平台数据集 · 检索',
    doc: pick(prdRaw, '**名称检索**', '**版本选择**'),
  },
  'F-DATASET-VERSION': {
    type: '新增',
    title: '新增数据集版本选择',
    changes: [
      '选中数据集后，选择器右侧出现版本下拉，默认选中最新版本',
    ],
    prdRef: 'FR-平台数据集 · 版本选择',
    doc: pick(prdRaw, '**版本选择**', '**清空选项**'),
  },
  'F-DATASET-CLEAR': {
    type: '新增',
    title: '新增检索与已选清空入口',
    changes: [
      '搜索框有内容时右侧出现 ✕，点击清空关键字并恢复完整列表',
      '已选数据集后选择框内名称右侧出现 ✕，点击同时清空数据集与版本、收起浮层且不触发下拉展开',
    ],
    prdRef: 'FR-平台数据集 · 清空选项',
    doc: pick(prdRaw, '**清空选项**', '**说明**'),
  },
}
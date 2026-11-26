import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-RETURN': {
    type: '新增',
    title: '新增独立创建表单页',
    changes: [
      '创建数据集使用独立表单页承载，页面顶部提供返回栏',
      '页面只保留基本信息区块：名称、数据集标签、数据集描述，创建流程不包含文件上传',
      '点击返回箭头或取消按钮回到数据集列表，不保存输入',
    ],
    prdRef: 'FR-1 返回栏',
    doc: pick(prdRaw, '### FR-1 返回栏', '### FR-2 基本信息'),
  },
  'F-BASIC': {
    type: '新增',
    title: '新增基本信息填写',
    changes: [
      '数据集名称必填，限制 56 字符并校验允许字符集',
      '数据集描述选填，限制 300 字并实时展示字数计数',
      '名称输入非法字符时输入框标红并展示校验提示',
    ],
    prdRef: 'FR-2 基本信息',
    doc: pick(prdRaw, '### FR-2 基本信息', '### FR-3 数据集标签'),
  },
  'F-TAGS': {
    type: '新增',
    title: '新增数据集标签',
    changes: [
      '提供预置标签快选与自定义标签输入，最多选择 3 个',
      '标签仅用于展示与归类，不参与列表搜索与提交校验',
      '列表页与详情页以蓝色 chips 展示已选标签',
    ],
    prdRef: 'FR-3 数据集标签',
    doc: pick(prdRaw, '### FR-3 数据集标签', '### FR-3b 数据集描述'),
  },
  'F-SUBMIT': {
    type: '新增',
    title: '新增提交与 V1 初始化',
    changes: [
      '底部提供取消与创建按钮，取消直接返回列表',
      '仅名称合法即可创建，不要求选择或上传任何文件',
      '提交后写入 V1 初始化版本（版本说明「创建完成，等待上传文件」）并跳回列表首位',
    ],
    rules: [
      { rule: '数据集名称非空且字符集合法', message: '数据集名称仅支持大小写英文字母、汉字、数字、短划线（-）、下划线（_）' },
    ],
    prdRef: 'FR-4 提交',
    doc: pick(prdRaw, '### FR-4 提交', '### FR-5 存储空间校验'),
  },
}

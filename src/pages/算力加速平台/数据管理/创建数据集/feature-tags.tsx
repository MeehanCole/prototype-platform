import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-RETURN': {
    type: '新增',
    title: '新增独立创建表单页',
    changes: [
      '创建数据集使用独立表单页承载，页面顶部提供返回栏',
      '表单按「基本信息 / 数据上传」两个区块纵向排列',
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
  'F-NORMAL-UPLOAD': {
    type: '新增',
    title: '新增普通上传',
    changes: [
      '拖拽区与文件选择器支持普通上传，不限制文件格式',
      '单文件超过 2048M 自动忽略，单次最多保留 20 个文件',
      '已选文件按扩展名图标、文件名、大小与待上传状态展示，并支持删除',
    ],
    prdRef: 'FR-4 数据集上传 · 普通上传',
    doc: pick(prdRaw, '- **普通上传**：', '- **客户端上传**：'),
  },
  'F-CLIENT-UPLOAD': {
    type: '新增',
    title: '新增客户端上传',
    changes: [
      '客户端上传页签展示创建后分配路径与凭证的前置说明',
      '提供三段 mc 命令模板与复制按钮，路径与凭证以占位符展示',
      '真实路径与凭证由创建成功后的数据集详情页回填',
    ],
    prdRef: 'FR-4 数据集上传 · 客户端上传',
    doc: pick(prdRaw, '- **客户端上传**：', '- **布局约束**'),
  },
  'F-SUBMIT': {
    type: '新增',
    title: '新增提交与状态初始化',
    changes: [
      '底部提供取消与创建按钮，取消直接返回列表',
      '名称合法且满足上传方式要求时，创建按钮才可用',
      '提交后写入 V1 版本与初始化状态，并跳回列表首位',
    ],
    rules: [
      { rule: '数据集名称非空且字符集合法', message: '数据集名称仅支持大小写英文字母、汉字、数字、短划线（-）、下划线（_）' },
    ],
    prdRef: 'FR-5 提交',
    doc: pick(prdRaw, '### FR-5 提交', '### FR-6 存储空间校验'),
  },
}

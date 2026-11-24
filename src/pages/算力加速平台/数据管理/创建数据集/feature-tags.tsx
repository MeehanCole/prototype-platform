import prdRaw from './prd.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-NO-TYPE': {
    type: '变更',
    title: '移除数据集类型并改用标签',
    changes: [
      '删除数据集类型单选、jsonl 格式说明与模板下载',
      '改用「数据集标签 + 数据集描述」表达用途，描述字段不影响提交校验',
      '普通上传不再限制文件格式，仅保留大小与数量约束',
    ],
    prdRef: 'FR-3c 已移除的内容',
    doc: pick(prdRaw, '### FR-3c 已移除的内容', '### FR-4 数据集上传'),
  },
  'F-CLIENT-UPLOAD': {
    type: '变更',
    title: '补充客户端上传入口说明',
    changes: [
      '客户端上传页新增浅蓝前置说明条，明确创建后才会分配真实路径与凭证',
      '入口说明改为「在数据集列表或详情页点击「上传文件」，切到客户端上传即可复制可直接执行的命令」',
      '创建前命令继续以占位符展示，真实路径与凭证由创建后页面回填',
    ],
    prdRef: 'FR-4 数据集上传',
    doc: pick(prdRaw, '1. 面板上方为浅蓝信息条', '2. **创建前不存在真实地址**'),
  },
}

import prdRaw from './prd_v1.md?raw'
import { pick, DocPanel, DocProvider, NewTag, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag }

export const FEATURES: Record<string, FeatureDoc> = {
  'F-01': {
    type: '新增',
    title: 'API Key 管理列表及 4 项核心交互弹窗 1:1 逆向还原',
    changes: [
      '1:1 还原 API Key 管理表格，包含名称、API Key 脱敏及复制/查看、限制额度、官方服务、私有服务、创建时间及操作列',
      '1:1 还原【创建 API Key】弹窗：支持名称输入（默认自动生成时间戳名称）、字数计数器（20 / 32）与确定取消',
      '1:1 还原【编辑 API Key】弹窗：支持修改名称及字符计数限制',
      '1:1 还原【服务绑定】弹窗：提供「官方服务」与「私有服务」下拉选择器',
      '1:1 还原【设置限流】弹窗：支持「启动Token额度」（总Token额度）与「启动Token限流（TPM）」（请求Token上限）双开关及表单联动',
    ],
    rules: [
      { rule: 'API Key 创建与编辑', message: '名称为必填项（红星），带 32 字符计数限制，创建默认预填时间戳名称' },
      { rule: '服务绑定', message: '支持独立下拉绑定官方预置推理服务与私有自建服务' },
      { rule: '设置限流', message: '分别支持开启 Token 总额度限制与 TPM 请求频率限流（Tokens / 分钟）' },
    ],
    prdRef: 'FR-1',
    doc: pick(prdRaw, '**FR-1 密钥列表展示**'),
  },
}

/**
 * 数据集管理 - Mock 数据
 *
 * 纯前端演示数据：结构与字段按「数据集列表 / 详情」需要组织，
 * 后续对接真实接口时替换本文件的 MOCK_DATASETS 即可，组件不内联大段常量。
 */

export type DatasetType = '微调训练' | '模型评测' | '知识库' | '多模态'
export type DatasetFormat = 'JSONL' | 'Parquet' | 'CSV' | 'Markdown' | '图片+标注'
export type DatasetStatus = '就绪' | '解析中' | '上传中' | '已归档'
export type DatasetSource = '本地文件' | '对象存储' | '已有数据集'

export interface DatasetVersion {
  version: string
  note: string
  samples: number
  createdAt: string
}

export interface Dataset {
  id: string
  name: string
  type: DatasetType
  format: DatasetFormat
  /** 样本条数 */
  samples: number
  /** 占用存储（GB） */
  sizeGB: number
  status: DatasetStatus
  updatedAt: string
  creator: string
  description: string
  source: DatasetSource
  /** 存储路径 / 来源地址 */
  location: string
  /** 标签列（字段名） */
  fields: string[]
  /** 版本记录，最新在前 */
  versions: DatasetVersion[]
  /** 被哪些服务 / 评测任务引用 */
  usedBy: string[]
}

export const MOCK_DATASETS: Dataset[] = [
  {
    id: 'ds-qwen3-35b-sft',
    name: 'qwen3-35b-指令微调集',
    type: '微调训练',
    format: 'JSONL',
    samples: 124000,
    sizeGB: 3.2,
    status: '就绪',
    updatedAt: '2026-11-17 18:24',
    creator: 'admin',
    description: '面向 Qwen3-35B 的通用指令微调语料，覆盖问答、摘要、改写三类任务。',
    source: '对象存储',
    location: 'obs://llm-data/finetune/qwen3-35b-sft-v3',
    fields: ['instruction', 'input', 'output', 'system'],
    versions: [
      { version: 'v3', note: '补充 2.4 万条摘要类样本，清洗重复项', samples: 124000, createdAt: '2026-11-17 18:24' },
      { version: 'v2', note: '剔除格式异常样本 860 条', samples: 100000, createdAt: '2026-11-02 10:12' },
      { version: 'v1', note: '初始导入', samples: 100860, createdAt: '2026-10-18 09:40' },
    ],
    usedBy: ['推理服务 / qwen3-指标弹性', '模型体验 / Qwen3-35B'],
  },
  {
    id: 'ds-cs-qa-eval',
    name: '客服对话质检集 v2',
    type: '模型评测',
    format: 'JSONL',
    samples: 8600,
    sizeGB: 0.21,
    status: '就绪',
    updatedAt: '2026-11-16 14:05',
    creator: 'zhanghu',
    description: '客服场景多轮对话质检评测集，含标准答案与人工评分。',
    source: '本地文件',
    location: 'obs://llm-data/eval/cs-qa-v2',
    fields: ['session_id', 'turns', 'reference', 'score'],
    versions: [
      { version: 'v2', note: '新增 1,200 条退款场景对话', samples: 8600, createdAt: '2026-11-16 14:05' },
      { version: 'v1', note: '初始导入', samples: 7400, createdAt: '2026-10-29 16:31' },
    ],
    usedBy: ['模型评测 / 客服质检基线'],
  },
  {
    id: 'ds-manual-kb',
    name: '产品手册知识库',
    type: '知识库',
    format: 'Markdown',
    samples: 1240,
    sizeGB: 0.09,
    status: '就绪',
    updatedAt: '2026-11-15 11:20',
    creator: 'lianghua',
    description: '算力加速平台各产品线用户手册切片，用于知识库问答召回。',
    source: '对象存储',
    location: 'obs://llm-data/kb/product-manual-2026q4',
    fields: ['doc_id', 'title', 'section', 'content'],
    versions: [
      { version: 'v5', note: '同步 2026Q4 手册改版', samples: 1240, createdAt: '2026-11-15 11:20' },
      { version: 'v4', note: '补充推理服务章节', samples: 1180, createdAt: '2026-10-21 09:02' },
    ],
    usedBy: ['知识库 / 平台手册问答'],
  },
  {
    id: 'ds-code-eval',
    name: '代码补全评测集',
    type: '模型评测',
    format: 'JSONL',
    samples: 2000,
    sizeGB: 0.05,
    status: '解析中',
    updatedAt: '2026-11-18 09:41',
    creator: 'admin',
    description: 'HumanEval 与内部仓库混合的代码补全评测样本，正在解析字段。',
    source: '本地文件',
    location: 'obs://llm-data/eval/code-completion',
    fields: ['prompt', 'canonical_solution', 'test'],
    versions: [
      { version: 'v1', note: '初始导入，解析中', samples: 2000, createdAt: '2026-11-18 09:41' },
    ],
    usedBy: [],
  },
  {
    id: 'ds-multi-turn-pref',
    name: '多轮对话偏好集',
    type: '微调训练',
    format: 'Parquet',
    samples: 45000,
    sizeGB: 1.8,
    status: '就绪',
    updatedAt: '2026-11-14 17:38',
    creator: 'zhanghu',
    description: 'DPO 偏好对数据，chosen / rejected 成对组织，用于对齐训练。',
    source: '对象存储',
    location: 'obs://llm-data/finetune/multi-turn-dpo',
    fields: ['prompt', 'chosen', 'rejected', 'meta'],
    versions: [
      { version: 'v2', note: '按周增量合并 8,000 对', samples: 45000, createdAt: '2026-11-14 17:38' },
      { version: 'v1', note: '初始导入', samples: 37000, createdAt: '2026-10-30 15:10' },
    ],
    usedBy: ['推理服务 / deepseek-自定义弹性'],
  },
  {
    id: 'ds-medical-desens',
    name: '医疗问诊脱敏集',
    type: '微调训练',
    format: 'CSV',
    samples: 6200,
    sizeGB: 0.13,
    status: '就绪',
    updatedAt: '2026-11-12 10:55',
    creator: 'lianghua',
    description: '已脱敏的医疗问诊问答对，用于行业模型冷启动微调。',
    source: '本地文件',
    location: 'obs://llm-data/finetune/medical-desens',
    fields: ['question', 'answer', 'department', 'age_group'],
    versions: [
      { version: 'v1', note: '初始导入', samples: 6200, createdAt: '2026-11-12 10:55' },
    ],
    usedBy: [],
  },
  {
    id: 'ds-image-cls',
    name: '图片分类标注集',
    type: '多模态',
    format: '图片+标注',
    samples: 30000,
    sizeGB: 21.6,
    status: '上传中',
    updatedAt: '2026-11-18 10:02',
    creator: 'admin',
    description: '工业质检图像分类标注集，图片与 JSON 标注文件成对上传。',
    source: '本地文件',
    location: 'obs://llm-data/multimodal/image-cls-30k',
    fields: ['image', 'label', 'bbox', 'split'],
    versions: [
      { version: 'v1', note: '上传中（62%）', samples: 30000, createdAt: '2026-11-18 10:02' },
    ],
    usedBy: [],
  },
  {
    id: 'ds-intent-legacy',
    name: '旧版意图识别集',
    type: '微调训练',
    format: 'JSONL',
    samples: 9800,
    sizeGB: 0.24,
    status: '已归档',
    updatedAt: '2026-10-08 09:16',
    creator: 'zhanghu',
    description: '旧版意图识别训练集，已由「客服对话质检集 v2」替代归档。',
    source: '已有数据集',
    location: 'obs://llm-data/archive/intent-legacy',
    fields: ['text', 'intent', 'confidence'],
    versions: [
      { version: 'v1', note: '初始导入', samples: 9800, createdAt: '2026-10-08 09:16' },
    ],
    usedBy: [],
  },
]

/** 顶部统计卡数据（由数据集汇总，避免手写漂移） */
export function buildStats(datasets: Dataset[] = MOCK_DATASETS) {
  const total = datasets.length
  const ready = datasets.filter((d) => d.status === '就绪').length
  const sizeGB = datasets.reduce((sum, d) => sum + d.sizeGB, 0)
  const finetune = datasets.filter((d) => d.type === '微调训练').length
  return [
    { key: 'total', label: '数据集总数', value: `${total}`, suffix: '个' },
    { key: 'size', label: '占用存储', value: sizeGB.toFixed(1), suffix: 'GB' },
    { key: 'finetune', label: '微调训练集', value: `${finetune}`, suffix: '个' },
    { key: 'ready', label: '可用数据集', value: `${ready}`, suffix: ` / ${total}` },
  ]
}

export const TYPE_OPTIONS: DatasetType[] = ['微调训练', '模型评测', '知识库', '多模态']
export const FORMAT_OPTIONS: DatasetFormat[] = ['JSONL', 'Parquet', 'CSV', 'Markdown', '图片+标注']
export const SOURCE_OPTIONS: DatasetSource[] = ['本地文件', '对象存储', '已有数据集']

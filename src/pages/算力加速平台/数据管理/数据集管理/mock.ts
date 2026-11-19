/**
 * 数据集管理 Mock 数据
 * 字段与设计稿表格列一一对应：名称 / 最新版本 / 类型 / 状态 / 创建者 / 创建时间
 */

/**
 * 数据集/版本状态（统一用「导入」这一条状态轴）
 *
 *   初始化 → 导入中 → 导入成功 / 导入失败
 *
 * 「导入中」覆盖从数据传输到服务端解析的整个区间：
 *   - 客户端上传时，前半段是本地上传（进度写到 upload 字段）；
 *   - 普通上传时，文件直达服务端，直接进入解析。
 * 不对「上传」单独设状态，避免出现「上传完成却没有上传成功」的断头路。
 */
export type DatasetStatus = '导入成功' | '初始化' | '导入中' | '导入失败'
export type DatasetType = '评测数据集' | '训练数据集' | '知识库数据集'

/**
 * 客户端上传的探测进度（模拟 ListObjectsV2 轮询结果）
 *
 * 真实实现由服务端定时列出桶前缀下的对象，依据「对象数 / 总字节 / 最近修改时间」
 * 判定上传是否开始、是否仍在增长、是否已稳定，再把结论写回数据集状态。
 */
export interface UploadProbe {
  /** 已探测到的对象（文件）数 */
  filesReceived: number
  /** 本次上传预计的文件总数；未知时为 undefined，只显示已接收数 */
  filesExpected?: number
  /** 已接收字节数 */
  bytesReceived: number
  /** 最近一次探测到写入的时间 */
  lastWriteAt: string
}

export interface DatasetVersion {
  version: string
  note: string
  createdAt: string
  samples: number
  /** 该版本的导入状态；未填时回退使用所属数据集的状态 */
  status?: DatasetStatus
  /** 该版本导入失败时的原因 */
  errorMessage?: string
  /** 客户端上传进度，在「导入中」阶段回填，用于展示 3/8 这类传输进度 */
  upload?: UploadProbe
}

export interface Dataset {
  id: string
  name: string
  /** 数据集描述，创建时选填，最长 300 字 */
  description?: string
  latestVersion: string
  type: DatasetType
  status: DatasetStatus
  creator: string
  createdAt: string
  /** 导入失败时的原因，悬浮状态列展示 */
  errorMessage?: string
  location: string
  samples: number
  sizeGB: number
  versions: DatasetVersion[]
  /** 客户端上传探测进度（冗余到数据集层，便于列表页直接展示） */
  upload?: UploadProbe
}

export const TYPE_OPTIONS: DatasetType[] = ['评测数据集', '训练数据集', '知识库数据集']

/** 创建弹窗中每个数据集类型的说明文案 */
export const TYPE_DESCRIPTIONS: Record<DatasetType, string> = {
  评测数据集: '用于模型性能评估，包括 QA 标准答案和打分维度，支持自动评测。',
  训练数据集: '用于模型微调训练，包含指令与回复样本，支持增量迭代。',
  知识库数据集: '用于知识库检索与问答，包含文档语料与分块索引。',
}

export const NAME_MAX_LENGTH = 56
export const DESC_MAX_LENGTH = 300

export const SEARCH_FIELDS = ['名称', '创建者', '类型'] as const
export type SearchField = (typeof SEARCH_FIELDS)[number]

export const PAGE_SIZES = [10, 20, 50] as const

export const MOCK_DATASETS: Dataset[] = [
  {
    id: 'ds-fin-qa',
    name: '金融QA数据集',
    latestVersion: 'V2',
    type: '评测数据集',
    status: '导入成功',
    creator: 'lihang',
    createdAt: '2026-04-07 14:32:21',
    location: 'obs://llm-data/eval/fin-qa-v2',
    samples: 12800,
    sizeGB: 0.42,
    versions: [
      {
        version: 'V2',
        note: '补充 1.2 万条金融问答，清洗重复项',
        createdAt: '2026-04-07 14:32:21',
        samples: 12800,
        status: '导入成功',
      },
      {
        version: 'V1',
        note: '初始导入',
        createdAt: '2026-03-28 10:12:04',
        samples: 9600,
        status: '导入成功',
      },
    ],
  },
  {
    id: 'ds-law-qa',
    name: '法律QA数据集',
    latestVersion: 'V1',
    type: '评测数据集',
    status: '初始化',
    creator: 'licheng',
    createdAt: '2026-04-07 14:29:00',
    location: 'obs://llm-data/eval/law-qa-v1',
    samples: 0,
    sizeGB: 0,
    versions: [
      {
        version: 'V1',
        note: '初始导入，等待解析',
        createdAt: '2026-04-07 14:29:00',
        samples: 0,
        status: '初始化',
      },
    ],
  },
  {
    id: 'ds-sft-general',
    name: '通用指令微调数据集',
    latestVersion: 'V1',
    type: '训练数据集',
    status: '导入中',
    creator: 'wangqiang',
    createdAt: '2026-04-08 09:15:42',
    location: 'obs://llm-data/train/sft-general-v1',
    samples: 0,
    sizeGB: 0,
    versions: [
      {
        version: 'V1',
        note: '上传 12 个文件，正在解析导入',
        createdAt: '2026-04-08 09:15:42',
        samples: 0,
        status: '导入中',
      },
    ],
  },
  {
    id: 'ds-medical-qa',
    name: '医疗问答数据集',
    latestVersion: 'V1',
    type: '评测数据集',
    status: '导入中',
    creator: 'sunyu',
    createdAt: '2026-04-08 10:36:18',
    location: 'obs://llm-data/eval/medical-qa-v1',
    samples: 0,
    sizeGB: 1.9,
    upload: {
      filesReceived: 3,
      filesExpected: 8,
      bytesReceived: 1.9 * 1024 * 1024 * 1024,
      lastWriteAt: '2026-04-08 10:41:52',
    },
    versions: [
      {
        version: 'V1',
        note: '客户端上传中，已接收 3/8 个文件',
        createdAt: '2026-04-08 10:36:18',
        samples: 0,
        status: '导入中',
        upload: {
          filesReceived: 3,
          filesExpected: 8,
          bytesReceived: 1.9 * 1024 * 1024 * 1024,
          lastWriteAt: '2026-04-08 10:41:52',
        },
      },
    ],
  },
  {
    id: 'ds-manual-kb',
    name: '产品手册知识库',
    latestVersion: 'V3',
    type: '知识库数据集',
    status: '导入成功',
    creator: 'zhaomin',
    createdAt: '2026-04-06 16:48:09',
    location: 'obs://llm-data/kb/manual-v3',
    samples: 8640,
    sizeGB: 0.87,
    versions: [
      {
        version: 'V3',
        note: '追加新版产品手册，重新分块',
        createdAt: '2026-04-06 16:48:09',
        samples: 8640,
        status: '导入成功',
      },
      {
        version: 'V2',
        note: '补充售后 FAQ',
        createdAt: '2026-03-30 11:22:53',
        samples: 6120,
        status: '导入成功',
      },
      {
        version: 'V1',
        note: '初始导入',
        createdAt: '2026-03-21 09:04:18',
        samples: 3980,
        status: '导入成功',
      },
    ],
  },
  {
    id: 'ds-custom',
    name: '自定义数据集',
    latestVersion: 'V1',
    type: '评测数据集',
    status: '导入失败',
    creator: 'huangyufu',
    createdAt: '2026-04-07 14:20:21',
    errorMessage: '桶：存储不足，无法导入',
    location: 'obs://llm-data/eval/custom-v1',
    samples: 0,
    sizeGB: 0,
    versions: [
      {
        version: 'V1',
        note: '导入失败：存储不足',
        createdAt: '2026-04-07 14:20:21',
        samples: 0,
        status: '导入失败',
        errorMessage: '桶：存储不足，无法导入',
      },
    ],
  },
]

/** 生成下一个版本号：V1 -> V2 */
export function nextVersion(current: string) {
  const num = Number.parseInt(current.replace(/^V/i, ''), 10)
  return `V${Number.isNaN(num) ? 1 : num + 1}`
}

export function nowStamp() {
  const d = new Date()
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
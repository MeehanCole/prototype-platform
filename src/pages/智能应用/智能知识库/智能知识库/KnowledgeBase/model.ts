/**
 * 知识库 - 数据模型与初始 Mock
 *
 * 从列表页抽出，供列表、建库向导与工作区共用；避免 Workspace ↔ index 的循环引用。
 */
export type ChunkStrategyKey = 'auto' | 'heading' | 'semantic' | 'fixed'

export type KbRecord = {
  name: string
  desc: string
  /** 文档数（0 = 空库） */
  docs: number
  /** 创建人 */
  creator: string
  /** 创建时间 */
  createdAt: string
  /** 建库时确定的分块参数（空 = 使用内置推荐预设 auto 512/80） */
  chunk?: {
    strategy: ChunkStrategyKey
    size: number
    overlap: number
  }
}

export const KB_RECORDS: KbRecord[] = [
  {
    name: '产品文档库',
    desc: '容器云与算力加速平台的产品手册、发布说明、API 文档，面向售前与客户自助查询。',
    docs: 128,
    creator: '张虎',
    createdAt: '2025-08-14',
  },
  {
    name: '运维知识库',
    desc: '一线运维处置手册、变更规范与巡检清单，用于值班同学快速定位与恢复。',
    docs: 96,
    creator: '李萌',
    createdAt: '2025-06-02',
  },
  {
    name: '故障案例库',
    desc: '近两年集群与推理服务的典型故障复盘，含现象、根因、处置动作与验证方式。',
    docs: 74,
    creator: '王涛',
    createdAt: '2025-10-21',
  },
  {
    name: '研发规范库',
    desc: '编码规范、代码评审清单、分支与发布流程，供研发与外包同学查阅。',
    docs: 41,
    creator: '陈晨',
    createdAt: '2025-03-18',
  },
  {
    name: '客户交付资料',
    desc: '交付模板、验收标准与常见问题答复口径，仅交付团队可见。',
    docs: 0,
    creator: '赵敏',
    createdAt: '2026-01-09',
  },
]
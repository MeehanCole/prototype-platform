/**
 * 召回测试（演示数据）
 *
 * 不接真实向量服务，用中文二元词 + 标题命中模拟相似度，便于验证
 * TopK、阈值、重排开关与结果展示的交互闭环。
 */
export type RetrievalChunk = {
  id: string
  docName: string
  heading: string
  body: string
  strategy: '标题分块' | '语义分块' | '固定长度'
  tokens: number
  questions: number
}

export type RetrievalResult = RetrievalChunk & {
  score: number
  rawScore: number
}

export type RetrievalResponse = {
  results: RetrievalResult[]
  candidates: number
  elapsed: number
}

const CHUNKS: RetrievalChunk[] = [
  {
    id: 'c-01',
    docName: '部署与升级手册.pdf',
    heading: '集群扩容失败排查',
    body: '容器云集群在业务高峰期出现扩容失败时，先检查节点池配额与可用区资源余量。若事件中出现 InsufficientInstanceCapacity，说明目标规格库存不足，可切换可用区或调整实例规格后重试。',
    strategy: '标题分块',
    tokens: 118,
    questions: 3,
  },
  {
    id: 'c-02',
    docName: '部署与升级手册.pdf',
    heading: '集群扩容操作步骤',
    body: '在集群详情页进入「节点管理」，点击「扩容节点」，选择节点池、实例规格与目标数量。提交后可在变更记录中查看扩容进度；扩容失败时保留失败原因与操作审计。',
    strategy: '标题分块',
    tokens: 96,
    questions: 3,
  },
  {
    id: 'c-03',
    docName: '部署与升级手册.pdf',
    heading: '扩容失败常见原因',
    body: '常见原因包括：云账号余额不足、节点池达到数量上限、安全组规则缺失、镜像拉取失败，以及节点初始化脚本执行超时。建议按事件时间线逐项排查。',
    strategy: '语义分块',
    tokens: 84,
    questions: 2,
  },
  {
    id: 'c-04',
    docName: '平台产品白皮书.pdf',
    heading: '核心能力',
    body: '多集群统一纳管：一套控制台管理生产、测试与边缘集群。应用编排与发布支持灰度、蓝绿与回滚；可观测性统一采集日志、指标与链路；权限治理按租户、角色与资源配额分层管控。',
    strategy: '标题分块',
    tokens: 132,
    questions: 4,
  },
  {
    id: 'c-05',
    docName: '平台产品白皮书.pdf',
    heading: '典型场景',
    body: '适用于多云资源统一管理、传统应用容器化迁移、研发测试环境自助交付，以及跨集群故障快速定位。结合弹性伸缩策略，可在业务高峰前自动扩容节点。',
    strategy: '语义分块',
    tokens: 78,
    questions: 2,
  },
  {
    id: 'c-06',
    docName: '常见问题解答.docx',
    heading: '资源与配额',
    body: '创建应用提示配额不足时，可在「项目设置 · 配额」查看 CPU、内存与存储用量，或提交配额调整申请。扩容集群前请确认项目配额与云账号余额均充足。',
    strategy: '标题分块',
    tokens: 92,
    questions: 3,
  },
  {
    id: 'c-07',
    docName: '快速入门指南.pdf',
    heading: '创建第一个应用',
    body: '进入「应用管理」点击「新建应用」，填写应用名称、选择镜像与目标集群，按需配置端口和环境变量后提交。应用创建后可在详情页查看 Pod 状态、事件与日志。',
    strategy: '固定长度',
    tokens: 104,
    questions: 2,
  },
  {
    id: 'c-08',
    docName: '快速入门指南.pdf',
    heading: '查看运行状态',
    body: '应用状态变为「运行中」后，通过访问地址验证服务是否正常。若长时间处于等待调度，请检查节点资源与调度策略，必要时对集群进行扩容。',
    strategy: '固定长度',
    tokens: 88,
    questions: 2,
  },
  {
    id: 'c-09',
    docName: '权限与角色说明.pdf',
    heading: '权限矩阵',
    body: '项目管理员可管理成员与配额；开发者可创建和发布应用；只读成员仅可查看资源与日志。跨项目操作需单独授权。集群扩容操作需要项目管理员或平台运维角色。',
    strategy: '标题分块',
    tokens: 86,
    questions: 2,
  },
  {
    id: 'c-10',
    docName: '接口调用说明.md',
    heading: '错误处理',
    body: '4xx 表示请求参数或权限问题，5xx 表示服务异常。建议客户端按 code 字段做分支处理，并对 429 响应进行退避重试。扩容接口返回 409 时通常表示已有变更进行中。',
    strategy: '语义分块',
    tokens: 90,
    questions: 2,
  },
  {
    id: 'c-11',
    docName: '数据导入模板.xlsx',
    heading: '导入校验',
    body: '上传后平台会先做格式与配额校验，全部通过才会创建资源。失败记录可下载错误明细，修正后重新导入。批量扩容前建议先用模板校验实例规格。',
    strategy: '固定长度',
    tokens: 72,
    questions: 1,
  },
  {
    id: 'c-12',
    docName: '版本更新记录.md',
    heading: 'v2.4.0',
    body: '新增多集群应用批量发布与发布单审批；优化日志检索性能；修复大文件上传偶发中断的问题。集群扩容流程新增失败原因提示与重试入口。',
    strategy: '语义分块',
    tokens: 68,
    questions: 2,
  },
]

/** 中文二元词 + 英文数字词，避免依赖分词服务 */
export function queryTerms(query: string) {
  const normalized = query.toLowerCase().replace(/\s+/g, '')
  const terms = new Set<string>()
  for (const segment of normalized.match(/[\u4e00-\u9fa5]+/g) ?? []) {
    if (segment.length <= 2) {
      terms.add(segment)
      continue
    }
    for (let i = 0; i < segment.length - 1; i += 1) terms.add(segment.slice(i, i + 2))
  }
  for (const word of normalized.match(/[a-z0-9]{2,}/g) ?? []) terms.add(word)
  return Array.from(terms)
}

function density(terms: string[], text: string) {
  if (terms.length === 0) return 0
  return terms.filter((term) => text.includes(term)).length / terms.length
}

export function searchRetrieval({
  query,
  topK,
  threshold,
  rerank,
}: {
  query: string
  topK: number
  threshold: number
  rerank: boolean
}): RetrievalResponse {
  const trimmed = query.trim()
  if (!trimmed) return { results: [], candidates: 0, elapsed: 0 }
  const terms = queryTerms(trimmed)
  const normalized = trimmed.toLowerCase().replace(/\s+/g, '')

  const scored = CHUNKS.map((chunk) => {
    const body = `${chunk.heading}\n${chunk.body}`.toLowerCase()
    const title = chunk.heading.toLowerCase()
    const bodyDensity = density(terms, body)
    const titleDensity = density(terms, title)
    let rawScore = bodyDensity * 0.65 + titleDensity * 0.35
    if (body.replace(/\s+/g, '').includes(normalized)) rawScore += 0.2
    rawScore = Math.min(0.98, rawScore)
    let score = rawScore
    if (rerank) {
      score = Math.min(0.99, rawScore + titleDensity * 0.08 + (rawScore > 0 ? 0.02 : 0))
    }
    return { ...chunk, rawScore: Number(rawScore.toFixed(3)), score: Number(score.toFixed(3)) }
  })

  const candidates = scored.filter((item) => item.score > 0).length
  const results = scored
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return {
    results,
    candidates,
    elapsed: Math.round(38 + trimmed.length * 2 + results.length * 7 + (rerank ? 46 : 0)),
  }
}
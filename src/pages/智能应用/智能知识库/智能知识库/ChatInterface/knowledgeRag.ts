import { KB_RECORDS } from '../KnowledgeBase/model'

export type MentionTarget = {
  id: string
  kind: 'kb' | 'file'
  name: string
  kbName?: string
  docsCount?: number
}

export type RetrievalCitation = {
  id: string
  docName: string
  kbName: string
  heading: string
  snippet: string
  score: number
}

export type DocPreviewBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string; highlight?: boolean }
  | { type: 'code'; text: string }

export type DocPreviewData = {
  title: string
  blocks: DocPreviewBlock[]
}

export function getDocumentPreview(citation: RetrievalCitation): DocPreviewData {
  if (citation.docName.includes('知识库问题') || citation.heading.includes('Etcd') || citation.snippet.includes('Etcd')) {
    return {
      title: '环境 IO 性能差导致 Etcd 服务异常',
      blocks: [
        { type: 'h2', text: '一、问题概述' },
        {
          type: 'p',
          text: '问题标题：环境 IO 性能差导致 Etcd 服务异常。',
        },
        {
          type: 'p',
          text: '问题描述：Docker 服务启动后，Kubelet 服务也恢复正常，但是 kube-apiserver 等服务一直没有触发启动，排查后发现 Etcd 服务不正常。',
          highlight: citation.id === 'cit-1',
        },
        { type: 'h2', text: '二、问题现象' },
        {
          type: 'p',
          text: '查看 kube-apiserver 服务状态，相关容器组均未正常启动，状态为 Exited。考虑到 kube-apiserver 等 Kubernetes 系统服务组件受 Etcd 服务的影响，接下来先排查下 Etcd 等服务是否异常。',
          highlight: citation.id === 'cit-1',
        },
        {
          type: 'code',
          text: '# docker ps -a | grep apiserver\n3c6d15273e60  pause:3.2          "pause"   5 minutes ago  Exited (0)\n6a0855ce1b25  kube-apiserver     "kube-apiserver..."  4 days ago  Exited (1) 10 hours ago',
        },
        { type: 'h2', text: '三、问题定位' },
        {
          type: 'p',
          text: '查询 Etcd 服务状态，发现有提示信息 "apply request took too long"，正常情况下期望耗时在 100ms 以内，环境上接近 10s。',
          highlight: citation.id === 'cit-2',
        },
        {
          type: 'code',
          text: '# systemctl status etcd\n● etcd.service - etcd\n   Active: active (running)\n   WARN: apply request took too long, took 9.842s (expected 100ms)',
        },
        {
          type: 'p',
          text: 'Etcd 请求超时通常对应网络和 IO 性能很差的场景。使用 fio 工具测试磁盘 IO 性能，平时正常环境只需要 20s 可以跑完，在问题环境上跑了 4 个多小时。进一步排查发现有同事在环境上运行加压测试脚本，导致磁盘 IO 性能下降严重。',
          highlight: citation.id === 'cit-3',
        },
        { type: 'h2', text: '四、解决方案' },
        {
          type: 'p',
          text: '停止加压测试脚本，使得磁盘 IO 性能恢复正常。之后 Etcd 服务通信恢复正常，最终环境集群服务也恢复正常。',
        },
      ],
    }
  }

  return {
    title: citation.docName.replace(/\.[^.]+$/, ''),
    blocks: [
      { type: 'h2', text: `一、${citation.heading}` },
      {
        type: 'p',
        text: `所属知识库：${citation.kbName}。本文档用于说明核心操作规范、参数约束以及常见异常排查路径，便于一线运维与研发同学快速定位处理。`,
      },
      {
        type: 'p',
        text: citation.snippet,
        highlight: true,
      },
      { type: 'h2', text: '二、操作建议与注意事项' },
      {
        type: 'p',
        text: '1. 执行变更前请先确认当前集群与节点池状态处于健康阈值内，并保留完整操作审计日志。',
      },
      {
        type: 'p',
        text: '2. 若遇到资源配额或底层依赖异常，请结合监控指标与事件时间线逐项核查，确认恢复后再放开业务流量。',
      },
    ],
  }
}

export type ReplySection = {
  heading: string
  text: string
  citationId?: string
}

export type AgentStep = {
  kind: 'think' | 'search' | 'done'
  title: string
  detail?: string
}

export type StructuredReply = {
  title: string
  agentSteps: AgentStep[]
  sections: ReplySection[]
  stepsTitle?: string
  steps?: string[]
  citations: RetrievalCitation[]
}

export const MENTION_KBS: MentionTarget[] = KB_RECORDS.map((kb) => ({
  id: `kb:${kb.name}`,
  kind: 'kb',
  name: kb.name,
  docsCount: kb.docs,
}))

export const MENTION_FILES: MentionTarget[] = [
  { id: 'file:知识库问题排查.docx', kind: 'file', name: '知识库问题排查.docx', kbName: '故障案例库' },
  { id: 'file:部署与升级手册.pdf', kind: 'file', name: '部署与升级手册.pdf', kbName: '运维知识库' },
  { id: 'file:平台产品白皮书.pdf', kind: 'file', name: '平台产品白皮书.pdf', kbName: '产品文档库' },
  { id: 'file:常见问题解答.docx', kind: 'file', name: '常见问题解答.docx', kbName: '产品文档库' },
  { id: 'file:快速入门指南.pdf', kind: 'file', name: '快速入门指南.pdf', kbName: '产品文档库' },
  { id: 'file:权限与角色说明.pdf', kind: 'file', name: '权限与角色说明.pdf', kbName: '产品文档库' },
  { id: 'file:接口调用说明.md', kind: 'file', name: '接口调用说明.md', kbName: '研发规范库' },
  { id: 'file:版本更新记录.md', kind: 'file', name: '版本更新记录.md', kbName: '产品文档库' },
]

export function getKbMention(kbName: string): MentionTarget | undefined {
  return MENTION_KBS.find((item) => item.name === kbName)
}

export function buildKnowledgeReply(query: string, mentions: MentionTarget[]): StructuredReply {
  const q = query.toLowerCase()
  const scopedKb = mentions.find((m) => m.kind === 'kb')?.name
  const scopedFile = mentions.find((m) => m.kind === 'file')?.name

  if (q.includes('etcd') || q.includes('io') || q.includes('性能') || q.includes('异常')) {
    const doc = scopedFile || '知识库问题排查.docx'
    const kb = scopedKb || '故障案例库'
    const citations: RetrievalCitation[] = [
      {
        id: 'cit-1',
        docName: doc,
        kbName: kb,
        heading: '问题现象与状态检查',
        snippet: 'Docker 服务启动后，Kubelet 服务恢复正常，但 kube-apiserver 等核心组件容器状态为 Exited，排查发现 Etcd 服务异常。',
        score: 0.94,
      },
      {
        id: 'cit-2',
        docName: '部署与升级手册.pdf',
        kbName: scopedKb || '运维知识库',
        heading: 'Etcd 耗时阈值说明',
        snippet: '查询 Etcd 服务状态时若出现 apply request took too long，正常期望耗时在 100ms 以内，异常环境往往接近 10s。',
        score: 0.89,
      },
      {
        id: 'cit-3',
        docName: '常见问题解答.docx',
        kbName: scopedKb || '产品文档库',
        heading: '磁盘 IO 压测影响',
        snippet: '使用 fio 工具测试磁盘 IO 性能，排除压测脚本、大文件拷贝或备份任务对 Etcd WAL 落盘的阻塞。',
        score: 0.84,
      },
    ]

    return {
      title: '环境 IO 性能差导致 Etcd 服务异常',
      agentSteps: [
        { kind: 'think', title: '已完成问题理解' },
        {
          kind: 'search',
          title: '检索知识库：「环境IO性能差导致Etcd服务异常的原因和解决方法」',
          detail: '找到 5 个结果',
        },
        { kind: 'think', title: '思考' },
        { kind: 'done', title: '完成' },
      ],
      sections: [
        {
          heading: '问题概述',
          text: 'Docker 服务启动后，Kubelet 服务恢复正常，但 `kube-apiserver` 等服务一直没有触发启动；排查后发现 Etcd 服务不正常。',
          citationId: 'cit-1',
        },
        {
          heading: '问题定位',
          text: '查询 Etcd 服务状态时，发现提示信息 `apply request took too long`：正常情况下期望耗时在 100ms 以内，而问题环境中接近 10s。',
          citationId: 'cit-2',
        },
        {
          heading: '问题原因与解决',
          text: 'Etcd 请求超时通常对应磁盘 IO 性能极差的场景。使用 `fio` 测试磁盘 IO 后发现存在加压脚本占用大量 IO，停止加压任务后 Etcd 与集群服务随之恢复正常。',
          citationId: 'cit-3',
        },
      ],
      stepsTitle: '处理要点',
      steps: [
        '通过 `systemctl status etcd` 检查 Etcd 状态，关注 `apply request took too long` 等耗时异常提示。',
        '使用 `fio` 等工具验证磁盘 IO 性能是否明显低于正常水平。',
        '排查环境中是否存在压测、拷贝、备份等大量占用磁盘 IO 的任务。',
        '停止异常加压任务，恢复磁盘 IO 后确认 Etcd 通信及集群服务是否恢复。',
      ],
      citations,
    }
  }

  if (q.includes('扩容') || q.includes('节点') || q.includes('集群')) {
    const kb = scopedKb || '运维知识库'
    const doc = scopedFile || '部署与升级手册.pdf'
    const citations: RetrievalCitation[] = [
      {
        id: 'cit-1',
        docName: doc,
        kbName: kb,
        heading: '集群扩容失败排查',
        snippet: '容器云集群在业务高峰期出现扩容失败时，先检查节点池配额与可用区资源余量。若事件中出现 InsufficientInstanceCapacity，说明目标规格库存不足。',
        score: 0.93,
      },
      {
        id: 'cit-2',
        docName: '部署与升级手册.pdf',
        kbName: kb,
        heading: '集群扩容操作步骤',
        snippet: '在集群详情页进入「节点管理」，点击「扩容节点」，选择节点池、实例规格与目标数量，提交后可在变更记录中查看进度。',
        score: 0.87,
      },
    ]

    return {
      title: '集群扩容失败排查与处理',
      agentSteps: [
        { kind: 'think', title: '已完成问题理解' },
        {
          kind: 'search',
          title: `检索知识库：「${query}」`,
          detail: `找到 ${citations.length + 2} 个结果`,
        },
        { kind: 'think', title: '思考' },
        { kind: 'done', title: '完成' },
      ],
      sections: [
        {
          heading: '定位思路',
          text: '优先检查节点池配额与可用区资源余量。若事件中出现 `InsufficientInstanceCapacity`，说明目标实例规格库存不足，可切换可用区或调整实例规格后重试。',
          citationId: 'cit-1',
        },
        {
          heading: '标准操作路径',
          text: '在集群详情页进入「节点管理」→「扩容节点」，确认节点池、规格与目标数量后提交，并在变更记录中核对操作审计。',
          citationId: 'cit-2',
        },
      ],
      stepsTitle: '核查清单',
      steps: [
        '核对云账号额度与节点池上限是否触顶。',
        '检查安全组规则与镜像仓库拉取连通性。',
        '查看节点初始化脚本日志是否超时。',
      ],
      citations,
    }
  }

  const targetKb = scopedKb || '产品文档库'
  const targetDoc = scopedFile || '平台产品白皮书.pdf'
  const citations: RetrievalCitation[] = [
    {
      id: 'cit-1',
      docName: targetDoc,
      kbName: targetKb,
      heading: '核心能力与架构说明',
      snippet: '一套控制台统一纳管生产、测试与边缘集群，支持灰度、蓝绿与回滚发布，并通过可观测性统一采集日志、指标与链路。',
      score: 0.91,
    },
    {
      id: 'cit-2',
      docName: '权限与角色说明.pdf',
      kbName: targetKb,
      heading: '分层权限治理',
      snippet: '权限治理按租户、角色与资源配额分层管控，确保不同业务团队在各自授权域内安全检索与使用知识资产。',
      score: 0.85,
    },
  ]

  return {
    title: `关于「${query.slice(0, 24)}${query.length > 24 ? '…' : ''}」的检索解答`,
    agentSteps: [
      { kind: 'think', title: '已完成问题理解' },
      {
        kind: 'search',
        title: `检索知识库：「${query.slice(0, 28)}${query.length > 28 ? '…' : ''}」`,
        detail: `找到 ${citations.length + 1} 个结果`,
      },
      { kind: 'think', title: '思考' },
      { kind: 'done', title: '完成' },
    ],
    sections: [
      {
        heading: '知识库检索结论',
        text: `已从「${targetKb}」命中相关文档片段。平台支持多集群统一纳管、应用灰度发布以及全链路可观测性采集，可结合具体业务场景进一步细化配置。`,
        citationId: 'cit-1',
      },
      {
        heading: '权限与使用说明',
        text: '不同知识库支持按租户与角色分层管控访问范围；如需限定问答范围，可在输入框通过 `@` 指定单个知识库或具体文档。',
        citationId: 'cit-2',
      },
    ],
    citations,
  }
}

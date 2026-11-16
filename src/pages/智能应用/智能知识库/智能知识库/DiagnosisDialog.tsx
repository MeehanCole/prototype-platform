/**
 * [功能标注] PRD FR-4 智能诊断（应用面统一入口）
 * 智能诊断对话 - 共享组件（告警中心 + 常驻对话 双入口复用）
 * 架构：主 Agent（统一入口）+ 预置 Skill（能力）+ 动态派发 Subagent（执行载体）
 * 交互规范：docs/IntelligentDiagnosis/diagnosis-workflow.md
 *
 * 两种触发模式：
 *  - scene 模式（常驻对话）：打开显示场景卡片，用户点击场景或手动输入后发起五阶段诊断
 *  - alert 模式（告警中心）：直接注入告警上下文，自动发起五阶段诊断
 *
 * 统一样式：右侧抽屉（可拖动宽度）+ 消息流 + 历史记录 + SVG 可视化
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import type { ReactNode, Dispatch, SetStateAction } from 'react'
import { NewTag } from './feature-tags'
import {
  X, Bot, User, Send, Sparkles, ChevronDown, History, Trash2, ArrowLeft, Download,
  Search, Activity, Network, Bell, Brain, Play, AlertCircle, Loader2, Check,
  Box, FileText, Database, Wifi, ShieldCheck, ExternalLink, Maximize2, Minimize2, PanelLeft, BookOpen, GitCompareArrows,
} from 'lucide-react'

// ─── 类型 ──────────────────────────────────────────────────────────────────────────

export interface ToolResult {
  name: string
  params: string
  summary: string
  detail: string[]
  icon: 'search' | 'activity' | 'network' | 'bell'
  /** 主 Agent 动态派发的 subagent（执行载体） */
  subagent: string
  /** subagent 调用的预置 skill（能力定义） */
  skill: string
  /** 可视化类型：指标趋势图 / 调用链路拓扑 / 火焰图（无则仅文本） */
  viz?: 'metric' | 'trace' | 'flame'
}

/** 诊断主题（告警行 / 场景 / 用户输入统一抽象） */
export interface DiagSubject {
  no: number
  policy: string
  level: string
  target: string
  project: string
  time: string
  message: string
}

export interface DiagHistoryItem {
  id: string
  policy: string
  level: string
  target: string
  project: string
  time: string
  message: string
  rootCause: string
  confidence: '高' | '中' | '低'
  evidence: string[]
  createdAt: string
}

/** 追问对话（诊断完成后继续 Q&A） */
export type Followup = { role: 'user' | 'assistant'; content: string }

/** 诊断产物（Artifact）：工具卡片在左侧面板中的展示实体 */
export interface ArtifactItem {
  id: string
  /** 产物标题（工具名） */
  name: string
  icon: ToolResult['icon']
  viz?: ToolResult['viz']
  /** 副标题（查询参数） */
  meta: string
  /** 面板展示的内容行（日志全文 / 原始查询结果） */
  lines: string[]
}

// ─── 场景定义（常驻对话空态引导）─────────────────────────────────────────────────

export interface DiagScene {
  key: string
  label: string
  desc: string
  icon: ReactNode
}

const DIAG_SCENES: DiagScene[] = [
  { key: 'container', label: '容器故障诊断', desc: 'Pod 异常 / 资源驱逐 / 镜像拉取失败', icon: <Box className="w-[16px] h-[16px]" /> },
  { key: 'log', label: '日志异常分析', desc: 'ERROR 高频 / 异常栈 / 关键词匹配', icon: <FileText className="w-[16px] h-[16px]" /> },
  { key: 'perf', label: '性能剖析', desc: 'CPU 热点 / 火焰图 / GC 分析', icon: <Activity className="w-[16px] h-[16px]" /> },
  { key: 'db', label: '数据库慢查询', desc: '慢 SQL / 连接池 / 锁等待', icon: <Database className="w-[16px] h-[16px]" /> },
  { key: 'network', label: '网络排障', desc: '连通性 / 延迟 / 丢包', icon: <Wifi className="w-[16px] h-[16px]" /> },
  { key: 'inspection', label: '集群健康巡检', desc: '运行巡检计划 / 健康状态 / 异常解读', icon: <ShieldCheck className="w-[16px] h-[16px]" /> },
]

/** 场景 → 模拟诊断主题（构造 DiagSubject 进入五阶段） */
function buildSceneSubject(scene: DiagScene): DiagSubject {
  const now = new Date().toLocaleString('zh-CN', { hour12: false })
  switch (scene.key) {
    case 'container':
      return {
        no: 1, policy: 'KubePodCrashLooping', level: '一般告警', project: 'test',
        target: '容器组 order-service-7d4b8c6f9-x2k3m', time: now,
        message: 'Pod is crash looping. Pod test/order-service-7d4b8c6f9-x2k3m has restarted 6 times in the last 10 minutes.',
      }
    case 'log':
      return {
        no: 1, policy: 'ErrorLogKeyword', level: '严重告警', project: 'magic-pd2',
        target: '日志采集器 filebeat-pd2', time: now,
        message: '[ERROR] connection refused to 10.10.60.61:3306, retrying... (occurred 42 times in 5 minutes)',
      }
    case 'perf':
      return {
        no: 1, policy: 'CPUProfileHigh', level: '一般告警', project: 'test',
        target: '服务 batch-processor', time: now,
        message: 'CPU 采样热点集中在 GC 与序列化（占比 64%），近 10 分钟持续高负载。',
      }
    case 'db':
      return {
        no: 1, policy: 'SlowQueryHigh', level: '一般告警', project: 'monitoring-system',
        target: '数据库 mysql-master', time: now,
        message: '检测到慢查询：SELECT * FROM orders WHERE ... 执行耗时 3.2s，近 1 小时出现 18 次。',
      }
    case 'network':
      return {
        no: 1, policy: 'NetworkLatencyHigh', level: '严重告警', project: 'test',
        target: '网络链路 gateway → order-service', time: now,
        message: '链路延迟持续升高，p99 延迟 1.2s，丢包率 0.8%，连接重试增多。',
      }
    case 'inspection':
    default:
      return {
        no: 1, policy: '集群健康巡检', level: '-', project: '-',
        target: '全集群（节点 / 服务 / 存储）', time: now,
        message: '运行已创建的巡检计划「集群健康巡检」，获取集群整体健康状态并解读异常项。',
      }
  }
}

// ─── 工具查询可视化（汇总 + 可展开原始 + SVG 图表）─────────────────────────────────

/** 按诊断主题生成工具查询结果（模拟） */
function buildToolResults(sub: DiagSubject): ToolResult[] {
  const hhmm = sub.time.slice(11, 16) || '10:00'
  const date = sub.time.slice(0, 10) || '2026-08-07'

  // 巡检场景：工具结果体现「调用巡检 skill → 运行已建计划 → 返回健康状态」
  if (sub.policy === '集群健康巡检') {
    return [
      {
        name: '巡检计划执行',
        params: '运行「集群健康巡检」计划',
        summary: '8 个巡检项执行完成（节点 / 服务 / 存储 / 网络 / GPU / 数据库）',
        icon: 'activity',
        subagent: '巡检执行 Subagent',
        skill: 'inspection-run skill',
        detail: [
          `${date} ${hhmm} - 巡检计划「集群健康巡检」开始执行`,
          `${date} ${hhmm} - 节点巡检 5/5 通过`,
          `${date} ${hhmm} - 服务巡检 12/13 通过，1 项异常`,
        ],
      },
      {
        name: '健康状态采集',
        params: '全集群 · 节点 / 服务 / 存储',
        summary: '节点 5/5 正常，服务 12/13 正常，存储 3/3 正常',
        icon: 'network',
        viz: 'metric',
        subagent: '健康检查 Subagent',
        skill: 'health-check skill',
        detail: [
          `节点：5 个节点全部 Running（CPU 均 <70%）`,
          `服务：ingress-nginx 内存使用率 91%（异常）`,
          `存储：PVC 使用率均 <60%`,
        ],
      },
      {
        name: '巡检结果分析',
        params: '最近一次巡检 · 异常项',
        summary: '发现 1 项异常：ingress-nginx 内存使用率偏高（91%）',
        icon: 'bell',
        subagent: '根因推理 Subagent',
        skill: 'report-analysis skill',
        detail: [
          `异常项 1：ingress-nginx 内存 91%，接近 95% 阈值`,
          `关联：近 1 小时 ingress 请求量上升 2.3 倍`,
          `建议：扩容副本或调优内存上限`,
        ],
      },
    ]
  }

  return [
    {
      name: '日志查询',
      params: '近 30 分钟 · 目标范围',
      summary: `命中 ERROR ${sub.no * 7} 条，报错关键字高频出现`,
      icon: 'search',
      subagent: '日志分析 Subagent',
      skill: 'log-analysis skill',
      detail: [
        `[ERROR] ${date} ${hhmm} - ${sub.message.slice(0, 70)}`,
        `[ERROR] ${date} ${hhmm} - connection refused, retrying...`,
        `[WARN] ${date} ${hhmm} - resource usage elevated on ${sub.target}`,
      ],
    },
    {
      name: '指标监控',
      params: '近 1 小时 · CPU / 内存 / IO',
      summary: `${sub.target} 资源使用率持续上升（87% → 92%）`,
      icon: 'activity',
      viz: 'metric',
      subagent: '指标分析 Subagent',
      skill: 'metric-analysis skill',
      detail: [
        `${date} ${hhmm.slice(0, 2)}:30 - 内存使用率 87.1%`,
        `${date} ${hhmm.slice(0, 2)}:45 - 内存使用率 89.3%`,
        `${date} ${hhmm} - 内存使用率 92.0%（超阈值）`,
      ],
    },
    {
      name: 'SkyWalking APM',
      params: '近 1 小时 · 调用链路',
      summary: `${sub.target} 依赖的下游服务出现超时，p99 延迟 1.2s`,
      icon: 'network',
      viz: 'trace',
      subagent: 'APM 链路 Subagent',
      skill: 'apm-trace skill',
      detail: [
        `gateway → ${sub.target.split(' ').pop()} 调用超时 1200ms`,
        `${sub.target.split(' ').pop()} → 数据库连接失败 3 次`,
      ],
    },
    {
      name: '告警关联',
      params: '近 24 小时 · 同目标',
      summary: `同目标关联告警 2 条（历史均已恢复）`,
      icon: 'bell',
      subagent: '根因推理 Subagent',
      skill: 'alert-correlation skill',
      detail: [
        `${date} 09:12 - ${sub.policy}（已恢复）`,
        `${date} 13:36 - 资源使用率升高（已恢复）`,
      ],
    },
    {
      name: '变更记录',
      params: '近 24 小时 · 关联变更单',
      summary: '关联 3 条变更：1 次发布、1 次配置调整、1 次镜像升级',
      icon: 'activity',
      subagent: '根因推理 Subagent',
      skill: 'change-correlation skill',
      detail: [
        `${date} 14:32 - 发布 order-service v2.4.1 上线`,
        `${date} 14:38 - 配置调整内存上限 512Mi → 1Gi`,
        `${date} 14:50 - 变更数据库连接池 max 50 → 100`,
        `${date} 15:02 - 镜像升级 ingress-nginx`,
      ],
    },
    {
      name: '性能剖析',
      params: '近 10 分钟 · CPU 采样',
      summary: `CPU 热点集中在 GC 与序列化（占比 64%）`,
      icon: 'activity',
      viz: 'flame',
      subagent: '指标分析 Subagent',
      skill: 'metric-analysis skill',
      detail: [
        'gc-GCTaskThread 采样 1240 次（32.1%）',
        'java.lang.String.<init> 采样 986 次（25.6%）',
        'com.example.BatchProcessor 采样 412 次（10.7%）',
      ],
    },
  ]
}

/** 按诊断主题生成 AI 思考过程文案（折叠展示） */
function buildThinking(sub: DiagSubject): string {
  if (sub.policy === '集群健康巡检') {
    return `已回收各 Subagent 的结构化回报：\n1. 巡检执行 Subagent（inspection-run skill）：巡检计划「集群健康巡检」执行完成，8/8 项已检查\n2. 健康检查 Subagent（health-check skill）：节点 5/5 正常，服务 12/13 正常，存储 3/3 正常\n3. 根因推理 Subagent（report-analysis skill）：异常项集中在 ingress-nginx 内存使用率（91%），与请求量上升关联\n综合判断：集群整体健康，存在 1 项需关注的服务内存风险，置信度较高。`
  }
  return `已回收各 Subagent 的结构化回报：\n1. 日志分析 Subagent（log-analysis skill）：${sub.target} 在告警窗口内频繁报错（${sub.message.slice(0, 40)}...）\n2. 指标分析 Subagent（metric-analysis skill）：资源使用率持续上升，与告警激活时间对齐\n3. APM 链路 Subagent（apm-trace skill）：下游调用超时，存在链路依赖\n4. 根因推理 Subagent（alert-correlation skill）：同目标历史多次触发，疑似资源类根因\n综合判断：根因指向资源压力，置信度较高。`
}

/** 按诊断主题生成差异化根因结论（模拟） */
function buildConclusion(sub: DiagSubject): { rootCause: string; confidence: '高' | '中' | '低'; evidence: string[] } {
  const p = sub.policy
  if (p === '集群健康巡检')
    return {
      rootCause: `集群整体健康（节点 5/5、存储 3/3 正常），1 项风险：ingress-nginx 内存使用率 91% 接近阈值`,
      confidence: '高',
      evidence: ['巡检结果：8/8 巡检项执行完成，服务 12/13 正常', '指标：ingress-nginx 内存 91%，近 1 小时请求量上升 2.3 倍', '关联：无其他异常告警'],
    }
  if (p.includes('CrashLoop') || p === 'PodMemoryHigh' || p === 'PodEvictionEvent' || p.includes('容器'))
    return {
      rootCause: `${sub.target} 所在节点资源（内存）压力上升，导致容器组重启/被驱逐（CrashLoop）`,
      confidence: '高',
      evidence: ['指标：节点内存使用率近 30 分钟持续上升（87% → 92%）', `日志：${sub.message.slice(0, 48)}...`, '时间线：与节点内存超限时间对齐'],
    }
  if (p.includes('Disk') || p === 'NodeDiskUsageHigh')
    return {
      rootCause: `${sub.target} 磁盘使用率超阈值（镜像 / 日志堆积），触发空间不足`,
      confidence: '高',
      evidence: ['指标：/var/lib/docker 使用率 87.3%，超过 85% 阈值', '日志：磁盘写满 / IO 阻塞报错片段', '时间线：近 12 小时缓慢增长'],
    }
  if (p.includes('Latency') || p.includes('Rejected') || p === 'APILatencyHigh' || p.includes('网络'))
    return {
      rootCause: `${sub.target} 高负载导致延迟 / 写入失败（连接或吞吐瓶颈）`,
      confidence: '中',
      evidence: ['指标：p99 延迟 1.2s，超过 500ms 阈值', '日志：连接拒绝 / 写入被拒片段', '时间线：与流量高峰对齐'],
    }
  if (p.includes('CPU') || p.includes('性能'))
    return {
      rootCause: `${sub.target} CPU 采样热点集中在 GC 与序列化，存在无谓对象分配`,
      confidence: '中',
      evidence: ['火焰图：GC 线程占比 32.1% + 序列化 25.6%', '指标：CPU 使用率近 10 分钟持续 >90%', '时间线：与性能劣化时间对齐'],
    }
  if (p.includes('SlowQuery') || p.includes('慢查询') || p.includes('数据库'))
    return {
      rootCause: `${sub.target} 存在慢查询（缺索引 / 全表扫描），拖慢整体链路`,
      confidence: '中',
      evidence: ['日志：慢 SQL 执行 3.2s，近 1 小时 18 次', '指标：连接池活跃连接接近上限', '时间线：与慢查询出现时间对齐'],
    }
  return {
    rootCause: `${sub.target} 相关异常触发 ${p} 策略（详情见证据）`,
    confidence: '中',
    evidence: [`日志：${sub.message.slice(0, 60)}...`, '时间线：与告警激活时间对齐'],
  }
}

/** 处理建议（executable 项提供「执行」按钮） */
const ADVICE_ITEMS = [
  { title: '查看诊断目标近 1 小时资源曲线，确认资源竞争', executable: false },
  { title: '重启容器组以恢复服务', executable: true },
  { title: '清理节点磁盘空间（镜像 / 日志）', executable: true },
]

/** 五阶段诊断计划步骤 */
const DIAG_PLAN_STEPS = ['查询相关日志与指标', '分析服务调用链路（APM）', '关联相似告警，收敛故障事件', '定位根因并给出处置建议']

/**
 * 后台统一 Agent 执行能力开关（模拟）：
 * 告警诊断与常驻对话共用同一后台 Agent（不区分场景），是否具备"执行"能力由其配置决定。
 * 默认 false = 未开通执行能力 → 处理建议区不展示执行按钮，提示联系平台管理员。
 */
const AGENT_EXEC_ENABLED = false

// ─── 诊断历史（localStorage 最近 20 条，双入口共用）────────────────────────────────

const HISTORY_KEY = 'aiops.diagHistory'
const HISTORY_MAX = 20

function loadHistory(): DiagHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as DiagHistoryItem[]) : []
  } catch {
    return []
  }
}

function saveToHistory(item: DiagHistoryItem) {
  const list = loadHistory().filter((h) => h.id !== item.id)
  list.unshift(item)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)))
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

/**
 * knowledge-base 技能的内置演示案例（原型阶段模拟"已沉淀的历史故障知识"）：
 * 真实后台按方案纪要 2026-08-10 决策：检索源 = 诊断历史（localStorage 20 条），
 * 接入 PG + ES 后平滑升级为结构化案例索引（keyword + BM25，无向量）。
 */
const KB_MOCK_CASES: DiagHistoryItem[] = [
  {
    id: 'kb-20260805-001',
    policy: 'PodMemoryHigh',
    level: '紧急',
    target: '目标服务',
    project: '生产环境',
    time: '2026-08-05 14:30',
    message: 'Pod 内存使用率超过 90% 阈值，持续 10 分钟',
    rootCause: '节点内存压力上升导致容器组重启（CrashLoop），根因是同节点多实例内存超配',
    confidence: '高',
    evidence: ['指标：节点内存 87% → 92%，与告警时间对齐', '处置：扩容节点 / 内存上限 512Mi → 1Gi'],
    createdAt: '2026-08-05 15:00',
  },
  {
    id: 'kb-20260730-002',
    policy: 'APILatencyHigh',
    level: '紧急',
    target: '目标服务',
    project: '生产环境',
    time: '2026-07-30 10:12',
    message: '接口 p99 延迟超过 500ms，持续 5 分钟',
    rootCause: 'ingress-nginx 镜像升级后路由表变更导致流量倾斜，单实例连接耗尽',
    confidence: '高',
    evidence: ['变更：15:02 ingress-nginx 镜像升级', '处置：回滚镜像 + 恢复流量调度'],
    createdAt: '2026-07-30 11:00',
  },
  {
    id: 'kb-20260722-003',
    policy: 'NodeDiskUsageHigh',
    level: '严重',
    target: '节点-01',
    project: '生产环境',
    time: '2026-07-22 09:00',
    message: '节点磁盘使用率超过 85% 阈值',
    rootCause: '镜像与日志堆积导致磁盘写满，触发 IO 阻塞',
    confidence: '中',
    evidence: ['指标：/var/lib/docker 87.3%', '处置：清理悬空镜像与过期日志'],
    createdAt: '2026-07-22 10:00',
  },
]

/**
 * knowledge-base 技能：检索历史诊断记录，返回最相似案例（参考而非答案）。
 * 匹配维度：告警策略（指纹）+ 监控目标 + 特征关键词；得分 >= 2 才视为命中。
 */
function findSimilarHistory(subject: DiagSubject, currentId?: string | null): DiagHistoryItem | null {
  const pool = [...loadHistory(), ...KB_MOCK_CASES].filter((h) => h.id !== currentId)
  const ss = `${subject.message}${subject.policy}${subject.target}`
  const KEYS = ['内存', '磁盘', '延迟', '连接', 'OOM', 'CPU', 'GC', '巡检', 'CrashLoop']
  let best: DiagHistoryItem | null = null
  let bestScore = 0
  for (const h of pool) {
    let s = 0
    if (h.policy === subject.policy) s += 3 // 同告警策略（指纹级命中）
    if (h.target === subject.target) s += 2 // 同监控目标
    const hs = `${h.rootCause}${h.message}${h.policy}${h.target}`
    for (const k of KEYS) if (hs.includes(k) && ss.includes(k)) s += 1
    if (s > bestScore) {
      bestScore = s
      best = h
    }
  }
  return bestScore >= 2 ? best : null
}

/** 导出单条诊断历史为 Markdown 报告（供复盘 / 工单粘贴） */
function exportHistoryMarkdown(item: DiagHistoryItem) {
  const md = [
    '# Copilot AI 智能助手诊断报告',
    '',
    `- **诊断主题**：${item.policy}`,
    `- **级别**：${item.level}`,
    `- **目标**：${item.target}`,
    `- **项目**：${item.project}`,
    `- **诊断时间**：${item.time}`,
    `- **记录时间**：${item.createdAt}`,
    '',
    '## 问题描述',
    '',
    item.message,
    '',
    '## 诊断结论',
    '',
    `> ${item.rootCause}`,
    '',
    `**置信度：${item.confidence}**`,
    '',
    '### 证据链',
    '',
    ...item.evidence.map((e) => `- ${e}`),
    '',
    '## 处理建议',
    '',
    ...ADVICE_ITEMS.map((a, i) => `${i + 1}. ${a.title}`),
    '',
  ].join('\n')

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `诊断报告-${item.policy}-${item.createdAt}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 导出当前进行中的对话为 Markdown 报告（含诊断全过程与追问） */
function exportConversationMarkdown(sub: DiagSubject, followups: Followup[]) {
  const conclusion = buildConclusion(sub)
  const toolResults = buildToolResults(sub)
  const md = [
    '# Copilot AI 智能助手诊断报告',
    '',
    `- **诊断主题**：${sub.policy}`,
    `- **级别**：${sub.level}`,
    `- **目标**：${sub.target}`,
    `- **项目**：${sub.project}`,
    `- **诊断时间**：${sub.time}`,
    '',
    '## 问题描述',
    '',
    sub.message,
    '',
    '## 诊断计划',
    '',
    ...DIAG_PLAN_STEPS.map((p, i) => `${i + 1}. ${p}`),
    '',
    '## 工具调用',
    '',
    ...toolResults.map((t) => `- **${t.name}**（${t.params}）：${t.summary}`),
    '',
    '## 诊断结论',
    '',
    `> ${conclusion.rootCause}`,
    '',
    `**置信度：${conclusion.confidence}**`,
    '',
    '### 证据链',
    '',
    ...conclusion.evidence.map((e) => `- ${e}`),
    '',
    '## 处理建议',
    '',
    ...ADVICE_ITEMS.map((a, i) => `${i + 1}. ${a.title}`),
    '',
    ...(followups.length
      ? [
          '## 追问对话',
          '',
          ...followups.map((m) => `**${m.role === 'user' ? '用户' : '助手'}**：${m.content}`),
          '',
        ]
      : []),
  ].join('\n')

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `诊断报告-${sub.policy}-${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 生成工具产物在面板中的完整内容行（日志类工具展开为模拟日志流） */
function buildArtifactLines(tool: ToolResult): string[] {
  if (tool.name === '日志查询' && tool.detail[0]) {
    const first = tool.detail[0]
    const date = first.slice(0, 10) || '2026-08-07'
    let h = Number(first.slice(11, 13)) || 10
    let m = Number(first.slice(14, 16)) || 0
    const seed = first.split(' - ')[1] ?? 'connection refused'
    const patterns = [
      seed,
      'connection refused, retrying...',
      'dial tcp 10.0.12.34:8080: connect: connection refused',
      'worker exit code 1, restarting (crash loop back-off)',
      'resource usage elevated on pod, eviction candidate',
      'memory limit exceeded, OOMKilled container',
      'failed to get metric: context deadline exceeded',
      'kubelet: eviction threshold crossed',
      'i/o timeout while reading response body',
      'reconnecting after 3s backoff',
    ]
    const lines: string[] = []
    for (let i = 0; i < 30; i++) {
      const ts = `${date} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const level = i % 4 === 0 ? 'ERROR' : i % 3 === 0 ? 'WARN' : 'INFO'
      lines.push(`[${level}] ${ts} - ${patterns[i % patterns.length]}`)
      m += 2
      if (m >= 60) {
        m -= 60
        h += 1
      }
    }
    return lines
  }
  return tool.detail
}

/** 导出单个诊断产物（Artifact）为 Markdown 文件 */
function exportArtifactMarkdown(item: ArtifactItem) {
  const md = [
    `# 诊断产物：${item.name}`,
    '',
    `- **查询参数**：${item.meta}`,
    '',
    '```',
    ...item.lines,
    '```',
    '',
  ].join('\n')
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `诊断产物-${item.name}-${Date.now()}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const levelCls = (level: string) =>
  level === '紧急告警'
    ? 'bg-[#FEF0F0] text-[#F56C6C]'
    : level === '严重告警'
      ? 'bg-[#FDF6EC] text-[#E6A23C]'
      : 'bg-[#F0F9EB] text-[#67C23A]'

/** 默认模型（模型管理设置，会话发起默认使用） */
function getDefaultModelName(): string {
  try {
    return localStorage.getItem('aiops.defaultModel') || 'DeepSeek-R1'
  } catch {
    return 'DeepSeek-R1'
  }
}

// ─── 共享诊断对话框（双入口复用）───────────────────────────────────────────────────

export function DiagnosisDialog({
  mode,
  presetSubject,
  initial,
  onClose,
}: {
  /** 触发模式：scene=常驻对话（先选场景）；alert=告警中心（直接注入） */
  mode: 'scene' | 'alert'
  /** alert 模式：预填的告警上下文 */
  presetSubject?: DiagSubject | null
  /** 历史还原快照（从历史列表点入，直接展示完成态） */
  initial?: DiagHistoryItem | null
  onClose: () => void
}) {
  // 历史还原时直接以快照进入完成态；否则 scene 模式先停留在场景选择页
  const [subject, setSubject] = useState<DiagSubject | null>(
    mode === 'alert' ? (presetSubject ?? null) : initial ? snapshotToSubject(initial) : null,
  )
  const [usingSnapshot, setUsingSnapshot] = useState(!!initial)
  const [runSeq, setRunSeq] = useState(0) // 每次发起/重跑递增，重挂载消息流
  const [historyItems, setHistoryItems] = useState<DiagHistoryItem[]>(loadHistory())
  const [view, setView] = useState<'chat' | 'history'>('chat')
  const [width, setWidth] = useState(560)
  const [followups, setFollowups] = useState<Followup[]>([]) // 追问对话（导出当前对话时随附）
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]) // 左侧面板收集的诊断产物
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null)
  const [panelMax, setPanelMax] = useState(false) // 产物面板最大化
  const dragRef = useRef(false)

  // Esc 关闭产物面板
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveArtifactId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 面板左右拖动调整宽度
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const w = Math.min(720, Math.max(400, window.innerWidth - e.clientX))
      setWidth(w)
    }
    const onUp = () => {
      dragRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startDrag = () => {
    dragRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  // 点击场景卡片 / 手动输入 → 生成主题并发起诊断
  const startDiagnosis = (sub: DiagSubject, snapshot: DiagHistoryItem | null = null) => {
    setSubject(sub)
    setUsingSnapshot(!!snapshot)
    setRunSeq((s) => s + 1)
    setFollowups([])
    setArtifacts([]) // 新诊断清空旧产物
    setActiveArtifactId(null)
  }

  // 打开工具产物到左侧面板（Artifact，点击工具卡片「在面板打开」触发）
  const openArtifact = (tool: ToolResult) => {
    const item: ArtifactItem = {
      id: `${tool.name}-${Date.now()}`,
      name: tool.name,
      icon: tool.icon,
      viz: tool.viz,
      meta: tool.params,
      lines: buildArtifactLines(tool),
    }
    setArtifacts((prev) => [...prev, item])
    setActiveArtifactId(item.id)
    // 保持当前面板状态：已最大化时新产物直接以最大化展示，不重置
  }

  // 移除单个产物，若移除当前激活项则切换到相邻产物
  const removeArtifact = (id: string) => {
    setArtifacts((prev) => {
      const idx = prev.findIndex((a) => a.id === id)
      if (idx === -1) return prev
      const next = prev.filter((a) => a.id !== id)
      if (activeArtifactId === id) {
        const fallback = next[idx - 1] ?? next[idx]
        setActiveArtifactId(fallback ? fallback.id : null)
      }
      return next
    })
  }

  // 从历史记录还原：用快照构造主题并直接跳到完成态
  const restoreFromHistory = (item: DiagHistoryItem) => {
    startDiagnosis(snapshotToSubject(item), item)
    setView('chat')
  }

  const restart = () => {
    setUsingSnapshot(false)
    setRunSeq((s) => s + 1)
  }

  // 重新回到场景选择（scene 模式：重跑后回到空态）
  const backToScenes = () => {
    setSubject(null)
    setUsingSnapshot(false)
    setRunSeq(0)
    setFollowups([])
  }

  const title =
    mode === 'alert' ? 'Copilot AI 智能助手 · 告警' : 'Copilot AI 智能助手'
  const subtitle = subject ? `${subject.policy} · ${subject.target}` : '选择场景或直接描述你的问题'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* 同框联动容器：产物面板紧贴对话框左侧，整体从右侧滑出；最大化时占满视口让产物向左扩展 */}
      <div className={`relative h-full flex animate-[slideInRight_200ms_ease-out] ${panelMax ? 'w-full' : ''}`}>
        {activeArtifactId && artifacts.some((a) => a.id === activeArtifactId) && (
          <ArtifactPanel
            artifacts={artifacts}
            activeId={activeArtifactId}
            onSelect={setActiveArtifactId}
            onClose={() => setActiveArtifactId(null)}
            onRemove={removeArtifact}
            maximized={panelMax}
            onToggleMax={() => setPanelMax((p) => !p)}
          />
        )}
        <div
          className="relative h-full bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] flex flex-col"
          style={{ width: activeArtifactId ? Math.max(400, width - 480) : width }}
        >
        {/* 拖拽调整宽度把手（左边缘） */}
        <div
          onMouseDown={startDrag}
          title="拖动调整宽度"
          className="absolute left-0 top-0 bottom-0 w-[5px] cursor-col-resize hover:bg-[#409EFF]/40 transition-colors"
        />
        {/* 头部：标题 + 状态 + 历史 + 关闭 */}
        <div className="h-[56px] border-b border-[#DCDFE6] flex items-center justify-between px-[16px] shrink-0">
          <div className="flex items-center gap-[8px] min-w-0">
            <div className="w-[28px] h-[28px] bg-[#409EFF] rounded-[4px] flex items-center justify-center shrink-0">
              <Sparkles className="w-[14px] h-[14px] text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-[#303133] leading-tight truncate flex items-center gap-[6px]">{title} <NewTag code="FR-4" /></div>
              <div className="text-[11px] text-[#909399] leading-tight truncate">{subtitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-[6px] shrink-0">
            <button
              onClick={() => subject && exportConversationMarkdown(subject, followups)}
              disabled={!subject || view === 'history'}
              title="导出当前对话"
              className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] transition-colors ${
                subject && view !== 'history'
                  ? 'text-[#A0A0A0] hover:text-[#409EFF] hover:bg-[#ECF5FF]'
                  : 'text-[#C0C4CC] cursor-not-allowed'
              }`}
            >
              <Download className="w-[15px] h-[15px]" />
            </button>
            <button
              onClick={() => setView(view === 'history' ? 'chat' : 'history')}
              title="历史对话"
              className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] transition-colors ${
                view === 'history' ? 'text-[#409EFF] bg-[#ECF5FF]' : 'text-[#A0A0A0] hover:text-[#606266] hover:bg-[#F5F7FA]'
              }`}
            >
              <History className="w-[15px] h-[15px]" />
            </button>
            <button onClick={onClose} className="w-[28px] h-[28px] flex items-center justify-center text-[#A0A0A0] hover:text-[#606266] hover:bg-[#F5F7FA] rounded-[4px] transition-colors">
              <X className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>

        {/* 历史对话 / 诊断内容 切换 */}
        {view === 'history' ? (
          <HistoryList
            items={historyItems}
            onSelect={restoreFromHistory}
            onBack={() => setView('chat')}
            onClear={() => {
              clearHistory()
              setHistoryItems([])
            }}
          />
        ) : !subject ? (
          <ScenePicker onPick={startDiagnosis} onBackToAlert={mode === 'alert' ? () => setSubject(presetSubject ?? null) : undefined} />
        ) : (
          <DiagnosisFlow
            key={`${subject.policy}-${subject.target}-${runSeq}`}
            mode={mode}
            subject={subject}
            usingSnapshot={usingSnapshot}
            initial={initial ?? null}
            onRestart={restart}
            onBackToScenes={mode === 'scene' ? backToScenes : undefined}
            onSaved={() => setHistoryItems(loadHistory())}
            followups={followups}
            onFollowupsChange={setFollowups}
            onOpenArtifact={openArtifact}
          />
        )}
        </div>
      </div>
    </div>
  )
}

/** 历史快照 → 诊断主题 */
function snapshotToSubject(item: DiagHistoryItem): DiagSubject {
  return {
    no: 0,
    policy: item.policy,
    level: item.level,
    project: item.project,
    target: item.target,
    time: item.time,
    message: item.message,
  }
}

/** 场景选择页（scene 模式空态）：对话式欢迎 + 建议场景 + 底部固定输入框 */
function ScenePicker({
  onPick,
  onBackToAlert,
}: {
  onPick: (sub: DiagSubject, snapshot?: DiagHistoryItem | null) => void
  onBackToAlert?: () => void
}) {
  const [input, setInput] = useState('')
  const defaultModelName = getDefaultModelName()

  const handleManualSend = () => {
    if (!input.trim()) return
    const now = new Date().toLocaleString('zh-CN', { hour12: false })
    onPick({
      no: 1,
      policy: '通用诊断',
      level: '-',
      project: '-',
      target: '目标服务',
      time: now,
      message: input.trim(),
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 中间：空态欢迎区（对话式居中布局） */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center px-[24px] py-[36px]">
          {/* 助手头像 */}
          <div className="w-[52px] h-[52px] bg-[#409EFF] rounded-[14px] flex items-center justify-center shadow-[0_4px_12px_rgba(64,158,255,0.35)] shrink-0">
            <Bot className="w-[26px] h-[26px] text-white" />
          </div>
          <h2 className="text-[16px] font-semibold text-[#303133] mt-[14px] flex items-center gap-[6px]">你好，我是 Copilot AI 智能助手 <NewTag code="F-Copilot" /></h2>
          <p className="text-[13px] text-[#909399] mt-[6px] text-center leading-relaxed">
            描述你遇到的问题，或选择下方场景开始诊断
          </p>

          {/* 建议场景（ChatGPT 式 suggestion 卡片） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] mt-[26px] w-full max-w-[520px]">
            {DIAG_SCENES.map((s) => (
              <button
                key={s.key}
                onClick={() => onPick(buildSceneSubject(s))}
                className="flex items-center gap-[10px] p-[14px] bg-white border border-[#EBEEF5] rounded-[10px] text-left hover:border-[#409EFF] hover:shadow-[0_2px_8px_rgba(64,158,255,0.15)] transition-all group"
              >
                <span className="w-[32px] h-[32px] rounded-[8px] bg-[#ECF5FF] text-[#409EFF] flex items-center justify-center shrink-0 group-hover:bg-[#409EFF] group-hover:text-white transition-colors">
                  {s.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-[#303133]">{s.label}</span>
                  <span className="block text-[11px] text-[#909399] mt-[2px] truncate">{s.desc}</span>
                </span>
              </button>
            ))}
          </div>

          {onBackToAlert && (
            <button
              onClick={onBackToAlert}
              className="mt-[20px] h-[32px] px-[12px] border border-[#DCDFE6] text-[12px] text-[#606266] rounded-[4px] hover:border-[#409EFF] hover:text-[#409EFF] transition-colors"
            >
              返回告警上下文
            </button>
          )}
        </div>
      </div>

      {/* 底部：固定输入区（对话窗口样式） */}
      <div className="border-t border-[#DCDFE6] bg-white px-[16px] py-[12px] shrink-0">
        <div className="flex items-end gap-[8px] border border-[#DCDFE6] rounded-[10px] px-[14px] py-[10px] bg-white focus-within:border-[#409EFF] focus-within:shadow-[0_0_0_3px_rgba(64,158,255,0.1)] transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleManualSend()
              }
            }}
            placeholder="描述你遇到的问题，AI 将自动诊断..."
            rows={1}
            className="flex-1 resize-none outline-none text-[14px] text-[#303133] placeholder:text-[#A0A0A0] min-h-[22px] max-h-[96px] bg-transparent"
          />
          <button
            onClick={handleManualSend}
            disabled={!input.trim()}
            className="shrink-0 w-[32px] h-[32px] flex items-center justify-center bg-[#409EFF] text-white rounded-[8px] hover:bg-[#66B1FF] disabled:bg-[#C0C4CC] disabled:cursor-not-allowed transition-colors"
            title="发送"
          >
            <Send className="w-[15px] h-[15px]" />
          </button>
        </div>
        <p className="mt-[8px] text-[11px] text-[#C0C4CC] text-center">
          {defaultModelName} · 主 Agent 按需派发 Subagent 执行 Skill · Enter 发送，Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}

/** 五阶段诊断消息流（主 Agent + Subagent + Skill） */
function DiagnosisFlow({
  mode,
  subject,
  usingSnapshot,
  initial,
  onRestart,
  onBackToScenes,
  onSaved,
  followups,
  onFollowupsChange,
  onOpenArtifact,
}: {
  mode: 'scene' | 'alert'
  subject: DiagSubject
  usingSnapshot: boolean
  initial: DiagHistoryItem | null
  onRestart: () => void
  onBackToScenes?: () => void
  onSaved: () => void
  followups: Followup[]
  onFollowupsChange: Dispatch<SetStateAction<Followup[]>>
  /** 打开工具产物到左侧面板 */
  onOpenArtifact: (tool: ToolResult) => void
}) {
  const [input, setInput] = useState('')
  const [step, setStep] = useState(usingSnapshot ? 7 : 0) // 0 开始 → 7 完成（消息流式出现）
  const [failed] = useState(false)
  const [executed, setExecuted] = useState<string | null>(null)
  const savedRef = useRef(usingSnapshot)

  // 阶段推进：每条 AI 消息定时流式出现
  useEffect(() => {
    if (failed || step >= 7) return
    const t = setTimeout(() => setStep((s) => s + 1), 700)
    return () => clearTimeout(t)
  }, [step, failed])

  const conclusion = usingSnapshot && initial
    ? { rootCause: initial.rootCause, confidence: initial.confidence, evidence: initial.evidence }
    : buildConclusion(subject)
  // knowledge-base 技能：检索历史诊断记录，命中案例作为候选假设（参考非答案）
  const similarCase = useMemo(() => findSimilarHistory(subject, initial?.id), [subject, initial])
  const done = step >= 7 && !failed
  const toolResults = buildToolResults(subject)
  const thinkingText = buildThinking(subject)

  // 诊断完成时自动保存到历史（最近 20 条，双入口共用）
  useEffect(() => {
    if (!done || savedRef.current) return
    savedRef.current = true
    const item: DiagHistoryItem = {
      id: `${subject.policy}-${subject.target}-${Date.now()}`,
      policy: subject.policy,
      level: subject.level,
      target: subject.target,
      project: subject.project,
      time: subject.time,
      message: subject.message,
      rootCause: conclusion.rootCause,
      confidence: conclusion.confidence,
      evidence: conclusion.evidence,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    }
    saveToHistory(item)
    onSaved()
  }, [done, subject, conclusion, onSaved])

  const restart = () => {
    onRestart()
  }

  // 「采用验证步骤」：复用历史案例的验证路径核对当前证据（参考非答案，验证通过才采纳）
  const [adoptedId, setAdoptedId] = useState<string | null>(null)
  const adoptCase = (h: DiagHistoryItem) => {
    setAdoptedId(h.id)
    onFollowupsChange((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `已采用历史案例「${h.id}」的验证路径核对当前证据：① 核对近 24h 变更记录 ② 检查 ${h.target} 资源曲线 ③ 核对日志关键字。历史根因「${h.rootCause}」与本次证据链${h.policy === subject.policy ? '对齐，可作为处置参考' : '存在差异，需以当前证据为准'}。`,
      },
    ])
  }

  const handleSend = () => {
    if (!input.trim()) return
    onFollowupsChange((prev) => [...prev, { role: 'user', content: input.trim() }])
    setInput('')
    setTimeout(() => {
      onFollowupsChange((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `已结合「${subject.policy}」的上下文与证据链分析：${conclusion.rootCause}。如需更细粒度（如变更记录、影响范围），可继续追问。`,
        },
      ])
    }, 500)
  }

  return (
    <>
      {/* 诊断内容区（对话消息流） */}
      <div className="flex-1 overflow-y-auto px-[16px] py-[14px] space-y-[12px] bg-[#FAFBFC]">
        {/* 1. 用户请求（带人像图标） */}
        <div className="flex justify-end gap-[8px]">
          <div className="max-w-[85%] px-[12px] py-[9px] text-[13px] leading-relaxed whitespace-pre-wrap bg-[#409EFF] text-white rounded-[8px] rounded-tr-[4px]">
            {mode === 'alert'
              ? `请帮我诊断这条告警：\n告警策略：${subject.policy}\n告警级别：${subject.level}\n监控目标：${subject.target}\n项目：${subject.project}\n告警消息：${subject.message}`
              : subject.policy === '通用诊断'
                ? subject.message
                : `请帮我诊断：${subject.policy}\n监控目标：${subject.target}\n告警消息：${subject.message}`}
          </div>
          <div className="w-[28px] h-[28px] bg-[#909399] rounded-[4px] flex items-center justify-center shrink-0">
            <User className="w-[14px] h-[14px] text-white" />
          </div>
        </div>

        {/* 2. AI 思考（首次，折叠） */}
        {step >= 1 && (
          <AiBubble>
            <ThinkingBlock content="正在梳理告警上下文（策略 / 级别 / 目标 / 激活时间），制定诊断计划..." />
          </AiBubble>
        )}

        {/* 3. 诊断计划 */}
        {step >= 2 && (
          <AiBubble>
            <div className="px-[12px] py-[10px]">
              <div className="text-[12px] font-medium text-[#303133] mb-[6px]">诊断计划</div>
              {['查询相关日志与指标', '分析服务调用链路（APM）', '关联相似告警，收敛故障事件', '定位根因并给出处置建议'].map((p, i) => (
                <div key={i} className="flex items-center gap-[6px] text-[12px] text-[#606266] py-[2px]">
                  <span className="w-[14px] h-[14px] rounded-full bg-[#ECF5FF] text-[#409EFF] text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                  {p}
                </div>
              ))}
            </div>
          </AiBubble>
        )}

        {/* 4. 工具调用（汇总 + 可展开原始 + SVG 可视化） */}
        {step >= 3 && (
          <AiBubble>
            <div className="px-[12px] py-[10px]">
              <div className="text-[12px] font-medium text-[#303133] mb-[4px]">工具调用</div>
              <div className="text-[12px] text-[#606266] mb-[8px] leading-relaxed">
                我将调用多个 Subagent 并行进行深度诊断（日志分析 / 指标分析 / APM 链路 / 告警关联 / 性能剖析），请稍候...
              </div>
              <div className="space-y-[6px]">
                <KnowledgeHitCard matchedCase={similarCase} />
                {toolResults.map((t) => (
                  <ToolCard key={t.name} tool={t} onOpenArtifact={onOpenArtifact} />
                ))}
              </div>
            </div>
          </AiBubble>
        )}

        {/* 5. AI 思考（结合工具结果，折叠） */}
        {step >= 4 && (
          <AiBubble>
            <ThinkingBlock content={thinkingText} />
          </AiBubble>
        )}

        {/* 6. 根因分析 */}
        {step >= 5 && (
          <AiBubble>
            <div className="px-[12px] py-[10px]">
              <div className="flex items-center gap-[8px] mb-[8px]">
                <span className="text-[13px] font-medium text-[#303133]">诊断结论</span>
                <span
                  className={`text-[11px] px-[6px] py-[1px] rounded-full ${
                    conclusion.confidence === '高' ? 'bg-[#F0F9EB] text-[#67C23A]' : conclusion.confidence === '中' ? 'bg-[#FDF6EC] text-[#E6A23C]' : 'bg-[#FEF0F0] text-[#F56C6C]'
                  }`}
                >
                  置信度 {conclusion.confidence}
                </span>
              </div>
              <p className="text-[13px] text-[#303133] leading-relaxed mb-[8px]">{conclusion.rootCause}</p>
              <div className="border-t border-[#EBEEF5] pt-[8px]">
                <div className="text-[11px] text-[#909399] mb-[4px]">证据链</div>
                {conclusion.evidence.map((e, i) => (
                  <div key={i} className="text-[12px] text-[#606266] flex gap-[4px]">
                    <span className="text-[#409EFF]">·</span>
                    <span className="truncate" title={e}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          </AiBubble>
        )}

        {/* 6. 相似历史案例（knowledge-base 命中：参考非答案 + 一键采用验证步骤） */}
        {step >= 5 && !failed && (
          <AiBubble>
            {similarCase ? (
              <div className="px-[12px] py-[10px]">
                <div className="flex items-center gap-[6px] mb-[8px]">
                  <BookOpen className="w-[13px] h-[13px] text-[#E6A23C] shrink-0" />
                  <span className="text-[12px] font-medium text-[#303133]">相似历史案例</span>
                  <span className="text-[10px] px-[5px] py-[1px] rounded-full bg-[#FDF6EC] text-[#E6A23C]">knowledge-base 命中</span>
                </div>
                <div className="flex items-center gap-[8px] mb-[6px]">
                  <span className="text-[12px] text-[#303133] font-medium">{similarCase.policy}</span>
                  <span className="text-[11px] text-[#909399]">{similarCase.target} · {similarCase.time}</span>
                  <span className="text-[11px] text-[#C0C4CC] font-mono">{similarCase.id}</span>
                </div>
                <div className="text-[12px] text-[#606266] leading-relaxed mb-[4px]">{similarCase.rootCause}</div>
                <div className="text-[11px] text-[#909399] mb-[10px]">
                  {similarCase.evidence[similarCase.evidence.length - 1]}
                </div>
                {adoptedId === similarCase.id ? (
                  <div className="flex items-center gap-[4px] text-[12px] text-[#67C23A]">
                    <Check className="w-[12px] h-[12px]" />
                    已采用其验证步骤核对当前证据（见下方追问）
                  </div>
                ) : (
                  <button
                    onClick={() => adoptCase(similarCase)}
                    className="flex items-center gap-[4px] h-[26px] px-[10px] bg-[#E6A23C] text-white text-[11px] rounded-[4px] hover:bg-[#EBB563] transition-colors"
                  >
                    <GitCompareArrows className="w-[12px] h-[12px]" />
                    采用验证步骤
                  </button>
                )}
              </div>
            ) : (
              <div className="px-[12px] py-[8px] flex items-center gap-[6px] text-[11px] text-[#909399]">
                <BookOpen className="w-[12px] h-[12px] shrink-0" />
                knowledge-base 未命中相似历史案例（近 20 条），本次结论已保存供后续复用
              </div>
            )}
          </AiBubble>
        )}

        {/* 7. 处理建议（可执行项带操作按钮；无执行能力时提示） */}
        {step >= 6 && !failed && (
          <AiBubble>
            <div className="px-[12px] py-[10px]">
              <div className="text-[12px] font-medium text-[#303133] mb-[8px]">处理建议</div>
              <ol className="space-y-[8px]">
                {ADVICE_ITEMS.map((a, i) => (
                  <li key={i} className="flex items-center gap-[8px] text-[13px] text-[#606266]">
                    <span className="w-[18px] h-[18px] rounded-full bg-[#409EFF] text-white text-[11px] flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="flex-1">{a.title}</span>
                    {a.executable &&
                      AGENT_EXEC_ENABLED &&
                      (executed === a.title ? (
                        <span className="text-[12px] text-[#67C23A] shrink-0">已提交执行</span>
                      ) : (
                        <button
                          onClick={() => setExecuted(a.title)}
                          className="flex items-center gap-[3px] h-[24px] px-[8px] bg-[#409EFF] text-white text-[11px] rounded-[4px] hover:bg-[#66B1FF] transition-colors shrink-0"
                        >
                          <Play className="w-[11px] h-[11px]" />
                          执行
                        </button>
                      ))}
                  </li>
                ))}
              </ol>
              {!AGENT_EXEC_ENABLED && (
                <div className="mt-[10px] px-[10px] py-[8px] bg-[#FDF6EC] border border-[#FAEBCC] rounded-[4px] text-[12px] text-[#E6A23C] flex items-center gap-[6px]">
                  <AlertCircle className="w-[14px] h-[14px] shrink-0" />
                  当前无可执行智能体，请联系平台管理员
                </div>
              )}
              <div className="flex items-center gap-[8px] mt-[12px] border-t border-[#EBEEF5] pt-[10px]">
                <button onClick={restart} className="h-[28px] px-[12px] border border-[#DCDFE6] text-[12px] text-[#606266] rounded-[4px] hover:border-[#409EFF] hover:text-[#409EFF] transition-colors">
                  重新诊断
                </button>
                {onBackToScenes && (
                  <button onClick={onBackToScenes} className="h-[28px] px-[12px] border border-[#DCDFE6] text-[12px] text-[#606266] rounded-[4px] hover:border-[#409EFF] hover:text-[#409EFF] transition-colors">
                    换个场景
                  </button>
                )}
              </div>
            </div>
          </AiBubble>
        )}

        {/* 失败态 */}
        {failed && (
          <AiBubble>
            <div className="px-[12px] py-[10px]">
              <p className="text-[13px] text-[#606266] mb-[10px]">诊断过程中断（模拟），请重试。</p>
              <button onClick={restart} className="h-[28px] px-[12px] bg-[#409EFF] text-white text-[12px] rounded-[4px] hover:bg-[#66B1FF] transition-colors">重新诊断</button>
            </div>
          </AiBubble>
        )}

        {/* 追问对话流（带 AI / 人图标） */}
        {followups.map((m, i) => (
          <div key={i} className={`flex gap-[8px] ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' ? (
              <div className="w-[28px] h-[28px] bg-[#409EFF] rounded-[4px] flex items-center justify-center shrink-0">
                <Bot className="w-[14px] h-[14px] text-white" />
              </div>
            ) : (
              <div className="w-[28px] h-[28px] bg-[#909399] rounded-[4px] flex items-center justify-center shrink-0 order-last">
                <User className="w-[14px] h-[14px] text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-[12px] py-[9px] text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#409EFF] text-white rounded-[8px] rounded-tr-[4px]'
                  : 'bg-white text-[#303133] border border-[#EBEEF5] rounded-[8px] rounded-tl-[4px] shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* 输入区（对话窗口样式，与空态一致） */}
      <div className="border-t border-[#DCDFE6] bg-white px-[16px] py-[12px] shrink-0">
        <div className="flex items-end gap-[8px] border border-[#DCDFE6] rounded-[10px] px-[14px] py-[10px] bg-white focus-within:border-[#409EFF] focus-within:shadow-[0_0_0_3px_rgba(64,158,255,0.1)] transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="追问诊断细节..."
            rows={1}
            className="flex-1 resize-none outline-none text-[14px] text-[#303133] placeholder:text-[#A0A0A0] min-h-[22px] max-h-[96px] bg-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 w-[32px] h-[32px] flex items-center justify-center bg-[#409EFF] text-white rounded-[8px] hover:bg-[#66B1FF] disabled:bg-[#C0C4CC] disabled:cursor-not-allowed transition-colors"
            title="发送"
          >
            <Send className="w-[15px] h-[15px]" />
          </button>
        </div>
        <p className="mt-[8px] text-[11px] text-[#C0C4CC] text-center">Enter 发送，Shift+Enter 换行</p>
      </div>
    </>
  )
}

/** 历史对话列表（最近 20 条，点击还原） */
function HistoryList({
  items,
  onSelect,
  onBack,
  onClear,
}: {
  items: DiagHistoryItem[]
  onSelect: (item: DiagHistoryItem) => void
  onBack: () => void
  onClear: () => void
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-[16px] py-[10px] border-b border-[#EBEEF5] shrink-0">
        <button onClick={onBack} className="flex items-center gap-[4px] text-[13px] text-[#606266] hover:text-[#409EFF] transition-colors">
          <ArrowLeft className="w-[14px] h-[14px]" />
          返回诊断
        </button>
        <span className="text-[13px] text-[#303133] font-medium">历史对话</span>
        <button
          onClick={onClear}
          disabled={items.length === 0}
          className="flex items-center gap-[4px] text-[12px] text-[#909399] hover:text-[#F56C6C] disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-[13px] h-[13px]" />
          清空
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-[16px] py-[14px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#909399] text-[13px]">
            <History className="w-[36px] h-[36px] text-[#DCDFE6] mb-[8px]" />
            暂无历史对话
          </div>
        ) : (
          <div className="space-y-[10px]">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#EBEEF5] rounded-[6px] p-[10px] hover:border-[#409EFF] transition-colors"
              >
                <button
                  onClick={() => onSelect(item)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-[12px] font-medium text-[#303133] truncate">{item.policy}</span>
                    <span className="text-[11px] text-[#909399] shrink-0">{item.createdAt}</span>
                  </div>
                  <div className="text-[12px] text-[#606266] mt-[2px] truncate">{item.target}</div>
                  <div className="text-[12px] text-[#606266] mt-[6px] truncate" title={item.rootCause}>{item.rootCause}</div>
                  <div className="flex items-center gap-[6px] mt-[8px]">
                    <span className={`text-[11px] px-[6px] py-[1px] rounded-full ${levelCls(item.level)}`}>{item.level}</span>
                    <span
                      className={`text-[11px] px-[6px] py-[1px] rounded-full ${
                        item.confidence === '高' ? 'bg-[#F0F9EB] text-[#67C23A]' : item.confidence === '中' ? 'bg-[#FDF6EC] text-[#E6A23C]' : 'bg-[#FEF0F0] text-[#F56C6C]'
                      }`}
                    >
                      置信度 {item.confidence}
                    </span>
                  </div>
                </button>
                <div className="flex justify-end mt-[8px] pt-[8px] border-t border-[#EBEEF5]">
                  <button
                    onClick={() => exportHistoryMarkdown(item)}
                    className="flex items-center gap-[4px] text-[12px] text-[#909399] hover:text-[#409EFF] transition-colors"
                  >
                    <Download className="w-[13px] h-[13px]" />
                    导出报告
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** AI 消息气泡：Bot 图标 + 白底内容区（与智能对话风格一致） */
function AiBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-[8px]">
      <div className="w-[28px] h-[28px] bg-[#409EFF] rounded-[4px] flex items-center justify-center shrink-0">
        <Bot className="w-[14px] h-[14px] text-white" />
      </div>
      <div className="flex-1 min-w-0 bg-white border border-[#EBEEF5] rounded-[8px] rounded-tl-[4px] shadow-sm overflow-hidden">{children}</div>
    </div>
  )
}

/** 工具查询卡片：外层汇总 + subagent 执行链，点击展开查看原始内容与图表 */
function ToolCard({ tool, onOpenArtifact }: { tool: ToolResult; onOpenArtifact: (t: ToolResult) => void }) {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(true)
  // 模拟 subagent 执行耗时：短暂运行后回报完成
  useEffect(() => {
    const t = setTimeout(() => setRunning(false), 600)
    return () => clearTimeout(t)
  }, [])
  const iconMap = {
    search: <Search className="w-[12px] h-[12px]" />,
    activity: <Activity className="w-[12px] h-[12px]" />,
    network: <Network className="w-[12px] h-[12px]" />,
    bell: <Bell className="w-[12px] h-[12px]" />,
  }
  return (
    <div className="border border-[#EBEEF5] rounded-[4px] overflow-hidden">
      <div className="flex items-stretch">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-[8px] px-[10px] py-[8px] text-left hover:bg-[#F5F7FA] transition-colors min-w-0"
        >
          <span className="w-[22px] h-[22px] rounded-[4px] bg-[#ECF5FF] text-[#409EFF] flex items-center justify-center shrink-0">{iconMap[tool.icon]}</span>
          <span className="text-[12px] font-medium text-[#303133] shrink-0">{tool.name}</span>
          <span className="text-[11px] text-[#909399] shrink-0">{tool.params}</span>
          <span className="flex-1 text-[12px] text-[#606266] truncate ml-[4px]">{tool.summary}</span>
          {running ? (
            <span className="flex items-center gap-[4px] text-[11px] text-[#409EFF] shrink-0">
              <Loader2 className="w-[11px] h-[11px] animate-spin" />
              执行中
            </span>
          ) : (
            <span className="flex items-center gap-[3px] text-[11px] text-[#67C23A] shrink-0">
              <Check className="w-[11px] h-[11px]" />
              完成
            </span>
          )}
          <ChevronDown className={`w-[13px] h-[13px] text-[#909399] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => onOpenArtifact(tool)}
          title="在面板打开（Artifact）"
          className="w-[30px] flex items-center justify-center text-[#909399] hover:text-[#409EFF] hover:bg-[#ECF5FF] shrink-0 border-l border-[#EBEEF5] transition-colors"
        >
          <ExternalLink className="w-[13px] h-[13px]" />
        </button>
      </div>
      {/* 执行载体链：主 Agent 派发 subagent → 调用 skill */}
      <div className="flex items-center gap-[8px] px-[10px] pb-[8px] text-[11px] text-[#909399]">
        <span className="flex items-center gap-[3px] min-w-0">
          <Bot className="w-[11px] h-[11px] text-[#409EFF] shrink-0" />
          <span className="truncate">{tool.subagent}</span>
        </span>
        <span className="text-[#C0C4CC] shrink-0">→</span>
        <span className="flex items-center gap-[3px] min-w-0">
          <Sparkles className="w-[11px] h-[11px] text-[#E6A23C] shrink-0" />
          <span className="truncate">{tool.skill}</span>
        </span>
      </div>
      {open && (
        <div className="px-[10px] pb-[8px] border-t border-[#EBEEF5] bg-[#FAFBFC]">
          {tool.viz === 'metric' && <MetricChart />}
          {tool.viz === 'trace' && <TraceDiagram />}
          {tool.viz === 'flame' && <FlameGraph />}
          <div className="text-[11px] text-[#909399] py-[6px]">原始查询结果</div>
          {tool.detail.map((d, i) => (
            <div key={i} className="font-mono text-[11px] text-[#606266] leading-relaxed truncate" title={d}>
              {d}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** 知识库查询卡片（knowledge-base skill）：检索历史诊断记录，命中/未命中均展示 */
function KnowledgeHitCard({ matchedCase }: { matchedCase: DiagHistoryItem | null }) {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setRunning(false), 900)
    return () => clearTimeout(t)
  }, [])
  const matched = !!matchedCase
  return (
    <div className="border border-[#EBEEF5] rounded-[6px] bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-[6px] px-[10px] py-[8px]">
        <BookOpen className="w-[13px] h-[13px] text-[#E6A23C] shrink-0" />
        <span className="text-[12px] font-medium text-[#303133]">知识库查询</span>
        {running ? (
          <span className="flex items-center gap-[4px] text-[11px] text-[#909399] shrink-0">
            <Loader2 className="w-[11px] h-[11px] animate-spin" />
            检索历史诊断记录...
          </span>
        ) : matched ? (
          <span className="text-[11px] text-[#67C23A] shrink-0">命中 {matchedCase.policy} / {matchedCase.target}</span>
        ) : (
          <span className="text-[11px] text-[#909399] shrink-0">未命中相似历史</span>
        )}
        <span className="text-[10px] text-[#C0C4CC] shrink-0">knowledge-base skill</span>
        <ChevronDown className={`w-[12px] h-[12px] text-[#C0C4CC] ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-[10px] py-[8px] border-t border-[#EBEEF5] bg-[#FAFBFC]">
          {matched && matchedCase ? (
            <div className="space-y-[4px]">
              <div className="text-[11px] text-[#E6A23C]">命中历史案例（参考非答案）：</div>
              <div className="text-[12px] text-[#303133]">
                {matchedCase.policy} · {matchedCase.target} · {matchedCase.time}
              </div>
              <div className="text-[11px] text-[#606266] leading-relaxed" title={matchedCase.rootCause}>{matchedCase.rootCause}</div>
              <div className="text-[11px] text-[#909399]">已作为候选假设进入诊断验证，验证通过才采纳</div>
            </div>
          ) : (
            <div className="text-[11px] text-[#909399] leading-relaxed">检索近 20 条诊断历史，无相似案例——本次诊断结论保存后可作为后续参考。</div>
          )}
        </div>
      )}
    </div>
  )
}

/** 指标监控概览卡（CPU / 内存 / IO 状态 + 趋势） */
function MetricOverviewCards() {
  const items = [
    { label: 'CPU 使用率', value: '68%', status: '正常', color: '#67C23A', trend: '趋势平稳' },
    { label: '内存使用率', value: '92%', status: '超阈值', color: '#F56C6C', trend: '持续上升' },
    { label: '磁盘 IO', value: '45%', status: '正常', color: '#67C23A', trend: '趋势平稳' },
  ]
  return (
    <div className="grid grid-cols-3 gap-[8px] mb-[8px]">
      {items.map((it) => (
        <div key={it.label} className="border border-[#EBEEF5] rounded-[4px] bg-white p-[10px]">
          <div className="text-[11px] text-[#909399]">{it.label}</div>
          <div className="text-[16px] font-semibold mt-[4px]" style={{ color: it.color }}>{it.value}</div>
          <div className="flex items-center gap-[4px] mt-[4px]">
            <span className="w-[6px] h-[6px] rounded-full" style={{ background: it.color }} />
            <span className="text-[11px]" style={{ color: it.color }}>{it.status}</span>
          </div>
          <div className="text-[10px] text-[#C0C4CC] mt-[2px]">{it.trend}</div>
        </div>
      ))}
    </div>
  )
}

/** 链路节点耗时统计表（SkyWalking p99） */
function TraceStatsTable() {
  const rows = [
    { svc: 'gateway', method: 'POST /api/v1/diagnose', p99: '240ms', status: '正常', color: '#67C23A' },
    { svc: '目标服务', method: 'internal:runDiagnosis', p99: '1200ms', status: '超时', color: '#F56C6C' },
    { svc: 'DB 连接', method: 'mysql:query', p99: '失败 ×3', status: '失败', color: '#F56C6C' },
  ]
  return (
    <div className="border border-[#EBEEF5] rounded-[4px] bg-white overflow-hidden mb-[8px]">
      <div className="text-[11px] font-medium text-[#606266] px-[10px] py-[8px] border-b border-[#EBEEF5]">节点耗时统计（p99）</div>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-[#FAFBFC] text-[#909399]">
            <th className="text-left font-medium px-[10px] py-[6px]">服务</th>
            <th className="text-left font-medium px-[10px] py-[6px]">方法</th>
            <th className="text-left font-medium px-[10px] py-[6px]">耗时</th>
            <th className="text-left font-medium px-[10px] py-[6px]">状态</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[#EBEEF5]">
              <td className="px-[10px] py-[6px] text-[#303133]">{r.svc}</td>
              <td className="px-[10px] py-[6px] text-[#606266] font-mono">{r.method}</td>
              <td className="px-[10px] py-[6px] text-[#606266] font-mono">{r.p99}</td>
              <td className="px-[10px] py-[6px]">
                <span className="px-[6px] py-[1px] rounded-full text-[10px]" style={{ color: r.color, background: `${r.color}1A` }}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** 火焰图热点函数 Top 榜 */
function FlameTopTable() {
  const rows = [
    { fn: 'gc-GCTaskThread', pct: '32.1%', samples: 1240 },
    { fn: 'java.lang.String.<init>', pct: '25.6%', samples: 986 },
    { fn: 'com.example.BatchProcessor', pct: '10.7%', samples: 412 },
    { fn: 'org.apache.tomcat.util.http', pct: '6.2%', samples: 239 },
    { fn: 'sun.misc.Unsafe.park', pct: '4.8%', samples: 185 },
  ]
  return (
    <div className="border border-[#EBEEF5] rounded-[4px] bg-white overflow-hidden mb-[8px]">
      <div className="text-[11px] font-medium text-[#606266] px-[10px] py-[8px] border-b border-[#EBEEF5]">热点函数 Top 5</div>
      <div>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-[8px] px-[10px] py-[6px] border-t border-[#EBEEF5]">
            <span className="text-[10px] text-[#909399] w-[14px]">{i + 1}</span>
            <span className="flex-1 text-[11px] text-[#606266] font-mono truncate" title={r.fn}>{r.fn}</span>
            <span className="text-[11px] font-medium text-[#F56C6C] w-[46px] text-right">{r.pct}</span>
            <span className="text-[10px] text-[#C0C4CC] w-[52px] text-right">{r.samples} 次</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 日志结构化视图：字段卡展示（时间/级别/服务/消息）+ 级别筛选 + 关键词 + trace_id 关联 */
function LogStructuredView({ lines }: { lines: string[] }) {
  const [level, setLevel] = useState<'全部' | 'ERROR' | 'WARN' | 'INFO'>('全部')
  const [kw, setKw] = useState('')
  const counts = {
    ERROR: lines.filter((l) => l.includes('[ERROR]')).length,
    WARN: lines.filter((l) => l.includes('[WARN]')).length,
    INFO: lines.filter((l) => l.includes('[INFO]')).length,
  }
  const filtered = lines.filter((l) => {
    if (level !== '全部' && !l.includes(`[${level}]`)) return false
    if (kw && !l.toLowerCase().includes(kw.toLowerCase())) return false
    return true
  })
  // 模拟结构化字段：从行文本提取时间/级别，服务与 trace_id 为模拟字段
  const svcPool = ['api-gateway', 'order-service', 'order-service', 'mysql', 'ingress-nginx']
  const tracePool = ['a3f9c12d8b0e4f21', 'b7d0e5a9c3f14a82', 'e2c8f07a6d31b9c4']
  const parse = (line: string, i: number) => {
    const time = line.slice(0, 19)
    const lv = line.includes('[ERROR]') ? 'ERROR' : line.includes('[WARN]') ? 'WARN' : 'INFO'
    const msg = line.slice(line.indexOf(' - ') + 3) || line
    return { time, lv, svc: svcPool[i % svcPool.length], msg, trace: tracePool[i % tracePool.length] }
  }
  const lvColor: Record<string, string> = { ERROR: '#F56C6C', WARN: '#E6A23C', INFO: '#909399' }
  const highlight = (text: string) => {
    if (!kw) return text
    const idx = text.toLowerCase().indexOf(kw.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-[#FEF0F0] text-[#F56C6C] rounded-[2px]">{text.slice(idx, idx + kw.length)}</mark>
        {text.slice(idx + kw.length)}
      </>
    )
  }
  return (
    <div className="mb-[8px]">
      {/* 统计条 + 级别筛选 + 关键词 */}
      <div className="flex items-center gap-[6px] mb-[6px] flex-wrap">
        {(['全部', 'ERROR', 'WARN', 'INFO'] as const).map((lv) => (
          <button
            key={lv}
            onClick={() => setLevel(lv)}
            className={`h-[24px] px-[8px] text-[11px] rounded-[4px] border transition-colors ${
              level === lv
                ? 'bg-[#409EFF] border-[#409EFF] text-white'
                : 'bg-white border-[#EBEEF5] text-[#606266] hover:border-[#C0C4CC]'
            }`}
          >
            {lv} {lv !== '全部' ? counts[lv] : lines.length}
          </button>
        ))}
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="关键词过滤..."
          className="flex-1 min-w-[120px] h-[24px] px-[8px] text-[11px] border border-[#EBEEF5] rounded-[4px] outline-none focus:border-[#409EFF] focus:shadow-[0_0_0_2px_rgba(64,158,255,0.1)]"
        />
      </div>
      {/* 结构化字段卡列表 */}
      <div className="border border-[#EBEEF5] rounded-[4px] bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-[11px] text-[#C0C4CC] text-center py-[12px]">无匹配日志</div>
        ) : (
          filtered.map((line, i) => {
            const p = parse(line, i)
            return (
              <div key={i} className="px-[10px] py-[8px] border-t border-[#EBEEF5] first:border-t-0 hover:bg-[#FAFBFC] transition-colors">
                <div className="flex items-center gap-[6px] flex-wrap">
                  <span className="text-[10px] font-mono text-[#909399]">{p.time}</span>
                  <span className="px-[6px] py-[1px] rounded-full text-[10px] font-medium" style={{ color: lvColor[p.lv], background: `${lvColor[p.lv]}1A` }}>
                    {p.lv}
                  </span>
                  <span className="px-[6px] py-[1px] rounded-[4px] bg-[#F5F7FA] text-[#606266] text-[10px] font-mono">{p.svc}</span>
                  <span className="ml-auto text-[10px] text-[#409EFF] font-mono truncate max-w-[120px] cursor-pointer hover:underline" title="点击关联 Trace">
                    #{p.trace.slice(0, 8)}
                  </span>
                </div>
                <div className="text-[11px] text-[#606266] mt-[4px] font-mono leading-relaxed break-all">{highlight(p.msg)}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/** 链路瀑布图：span 按时间轴嵌套展示耗时，异常标红（Jaeger / Datadog 风格） */
function TraceWaterfall() {
  const spans = [
    { service: 'gateway', name: 'POST /api/v1/diagnose', start: 0, dur: 1200, status: '正常' },
    { service: '目标服务', name: 'internal:runDiagnosis', start: 80, dur: 980, status: '超时' },
    { service: '目标服务', name: 'internal:loadContext', start: 120, dur: 120, status: '正常' },
    { service: '目标服务', name: 'internal:queryMetrics', start: 260, dur: 180, status: '正常' },
    { service: '目标服务', name: 'internal:queryLogs', start: 460, dur: 140, status: '正常' },
    { service: 'DB 连接', name: 'mysql:query', start: 620, dur: 380, status: '失败' },
    { service: '目标服务', name: 'internal:serialize', start: 1030, dur: 140, status: '正常' },
  ]
  const total = 1300
  const axis = [0, 300, 600, 900, 1200]
  return (
    <div className="border border-[#EBEEF5] rounded-[4px] bg-white overflow-hidden mb-[8px]">
      <div className="text-[11px] font-medium text-[#606266] px-[10px] py-[8px] border-b border-[#EBEEF5]">链路瀑布图（Trace 下钻 · 时间轴）</div>
      {/* 时间刻度 */}
      <div className="px-[10px] pt-[8px]">
        <div className="flex text-[13px] text-[#909399]">
          <div className="w-[26%] min-w-[160px] max-w-[280px] shrink-0" />
          <div className="flex-1 relative h-[20px]">
            {axis.map((t) => (
              <span key={t} className="absolute -translate-x-1/2" style={{ left: `${(t / total) * 100}%` }}>
                {t}ms
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* span 行 */}
      <div className="px-[10px] py-[8px] space-y-[6px]">
        {spans.map((s, i) => {
          const isErr = s.status === '失败'
          const isWarn = s.status === '超时'
          const color = isErr ? '#F56C6C' : isWarn ? '#E6A23C' : '#409EFF'
          return (
            <div key={i} className="flex items-center gap-[8px]">
              <div className="w-[26%] min-w-[160px] max-w-[280px] shrink-0">
                <div className="text-[14px] text-[#303133] truncate">{s.name}</div>
                <div className="text-[12px] text-[#909399] truncate">{s.service}</div>
              </div>
              <div className="flex-1 relative h-[48px]">
                <div className="absolute inset-y-[7px] w-full bg-[#F5F7FA] rounded-[2px]" />
                <div
                  className="absolute top-[7px] bottom-[7px] rounded-[3px]"
                  style={{
                    left: `${(s.start / total) * 100}%`,
                    width: `${(s.dur / total) * 100}%`,
                    background: color,
                    opacity: 0.85,
                  }}
                >
                  {s.dur > 200 && (
                    <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[14px] text-white font-semibold">{s.dur}ms</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-[10px] pb-[8px] text-[12px] text-[#909399]">总耗时 1200ms · 红=失败 橙=超时 蓝=正常</div>
    </div>
  )
}

/** 事件变更时间线：发布/配置/变更按时间对齐故障（验证「变更引起故障」假设） */
function ChangeTimeline() {
  const events = [
    { time: '14:32', type: '发布', desc: 'order-service v2.4.1 上线', target: 'order-service', color: '#409EFF' },
    { time: '14:38', type: '配置', desc: '内存上限 512Mi → 1Gi', target: '目标服务', color: '#E6A23C' },
    { time: '14:50', type: '变更', desc: 'DB 连接池 max 50 → 100', target: '数据库', color: '#E6A23C' },
    { time: '15:02', type: '发布', desc: 'ingress-nginx 镜像升级', target: 'ingress', color: '#409EFF' },
  ]
  return (
    <div className="border border-[#EBEEF5] rounded-[4px] bg-white overflow-hidden mb-[8px]">
      <div className="text-[11px] font-medium text-[#606266] px-[10px] py-[8px] border-b border-[#EBEEF5]">变更记录（近 24 小时 · 与告警时间对齐）</div>
      <div className="px-[10px] py-[8px]">
        {/* 故障时间标记 */}
        <div className="flex items-center gap-[6px] px-[8px] py-[6px] rounded-[4px] bg-[#FEF0F0] border border-[#FDE2E2] mb-[8px]">
          <AlertCircle className="w-[12px] h-[12px] text-[#F56C6C] shrink-0" />
          <span className="text-[11px] text-[#F56C6C]">故障激活 15:10 · 最近的变更：15:02 ingress-nginx 镜像升级（疑似诱因）</span>
        </div>
        {events.map((e, i) => (
          <div key={i} className="relative pl-[18px] pb-[12px] last:pb-0">
            {i < events.length - 1 && <div className="absolute left-[4px] top-[14px] bottom-0 w-[1px] bg-[#EBEEF5]" />}
            <div className="absolute left-0 top-[5px] w-[9px] h-[9px] rounded-full" style={{ background: e.color }} />
            <div className="flex items-center gap-[6px] flex-wrap">
              <span className="text-[11px] font-mono text-[#606266]">{e.time}</span>
              <span className="px-[6px] py-[1px] rounded-full text-[10px]" style={{ color: e.color, background: `${e.color}1A` }}>
                {e.type}
              </span>
              <span className="text-[10px] text-[#909399]">{e.target}</span>
            </div>
            <div className="text-[12px] text-[#303133] mt-[2px]">{e.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 告警关联收敛视图：同目标历史告警分组 + 收敛提示 */
function AlertCorrelationView() {
  const alerts = [
    { time: '09:12', policy: 'PodCrashLoopBackOff', level: '紧急', target: '目标服务', status: '已恢复', dur: '42 分钟' },
    { time: '13:36', policy: 'NodeMemoryHigh', level: '严重', target: '节点-01', status: '已恢复', dur: '1.2 小时' },
    { time: '14:52', policy: 'APILatencyHigh', level: '紧急', target: '目标服务', status: '已恢复', dur: '38 分钟' },
  ]
  return (
    <div className="border border-[#EBEEF5] rounded-[4px] bg-white overflow-hidden mb-[8px]">
      <div className="text-[11px] font-medium text-[#606266] px-[10px] py-[8px] border-b border-[#EBEEF5]">告警关联（近 24 小时 · 同目标收敛）</div>
      <div className="px-[10px] py-[8px]">
        <div className="flex items-center gap-[6px] mb-[8px] px-[8px] py-[6px] rounded-[4px] bg-[#ECF5FF]">
          <Bell className="w-[12px] h-[12px] text-[#409EFF] shrink-0" />
          <span className="text-[11px] text-[#409EFF]">同目标 2 条历史告警收敛，与本次故障可能同因（内存压力）</span>
        </div>
        {alerts.map((a, i) => (
          <div key={i} className="flex items-center gap-[8px] py-[6px] border-t border-[#EBEEF5] first:border-t-0">
            <span className="text-[11px] font-mono text-[#606266] w-[48px] shrink-0">{a.time}</span>
            <span className="px-[6px] py-[1px] rounded-full text-[10px] text-[#F56C6C] bg-[#FEF0F0] shrink-0">{a.level}</span>
            <span className="flex-1 text-[11px] text-[#303133] truncate">{a.policy}</span>
            <span className="text-[10px] text-[#909399] w-[56px] truncate shrink-0">{a.target}</span>
            <span className="text-[10px] text-[#67C23A] shrink-0">{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 诊断产物面板（Artifact）：与对话框同框联动，紧贴对话框左侧展示工具产物 */
function ArtifactPanel({
  artifacts,
  activeId,
  onSelect,
  onClose,
  onRemove,
  maximized,
  onToggleMax,
}: {
  artifacts: ArtifactItem[]
  activeId: string
  onSelect: (id: string) => void
  onClose: () => void
  onRemove: (id: string) => void
  maximized: boolean
  onToggleMax: () => void
}) {
  const active = artifacts.find((a) => a.id === activeId)
  const iconMap = {
    search: <Search className="w-[12px] h-[12px]" />,
    activity: <Activity className="w-[12px] h-[12px]" />,
    network: <Network className="w-[12px] h-[12px]" />,
    bell: <Bell className="w-[12px] h-[12px]" />,
  }
  return (
    <div
      className={`relative h-full bg-white flex flex-col shrink-0 border-r border-[#DCDFE6] ${
        maximized ? 'flex-1' : 'w-[480px]'
      }`}
    >
      {/* 头部：标题 + 操作 */}
      <div className="h-[52px] border-b border-[#DCDFE6] flex items-center justify-between px-[12px] shrink-0">
        <div className="flex items-center gap-[8px] min-w-0">
          <PanelLeft className="w-[15px] h-[15px] text-[#409EFF] shrink-0" />
          <span className="text-[14px] font-semibold text-[#303133]">诊断产物</span>
          <span className="text-[11px] text-[#909399]">{artifacts.length} 个</span>
        </div>
        <div className="flex items-center gap-[4px] shrink-0">
          <button
            onClick={onToggleMax}
            title={maximized ? '还原' : '最大化'}
            className="w-[28px] h-[28px] flex items-center justify-center text-[#A0A0A0] hover:text-[#409EFF] hover:bg-[#ECF5FF] rounded-[4px] transition-colors"
          >
            {maximized ? <Minimize2 className="w-[14px] h-[14px]" /> : <Maximize2 className="w-[14px] h-[14px]" />}
          </button>
          <button
            onClick={() => active && exportArtifactMarkdown(active)}
            disabled={!active}
            title="导出当前产物"
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] transition-colors disabled:cursor-not-allowed disabled:text-[#C0C4CC] text-[#A0A0A0] hover:text-[#409EFF] hover:bg-[#ECF5FF]"
          >
            <Download className="w-[14px] h-[14px]" />
          </button>
          <button
            onClick={onClose}
            title="关闭产物面板"
            className="w-[28px] h-[28px] flex items-center justify-center text-[#A0A0A0] hover:text-[#606266] hover:bg-[#F5F7FA] rounded-[4px] transition-colors"
          >
            <X className="w-[16px] h-[16px]" />
          </button>
        </div>
      </div>

      {/* 产物 tab 条（多产物切换） */}
      <div className="flex items-center gap-[6px] px-[12px] py-[8px] border-b border-[#EBEEF5] overflow-x-auto shrink-0">
        {artifacts.map((a) => {
          const isActive = a.id === activeId
          return (
            <span
              key={a.id}
              className={`flex items-center gap-[4px] pl-[8px] pr-[4px] h-[28px] text-[12px] rounded-[4px] border transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#ECF5FF] border-[#409EFF] text-[#409EFF]'
                  : 'bg-white border-[#EBEEF5] text-[#606266] hover:border-[#C0C4CC]'
              }`}
            >
              <button onClick={() => onSelect(a.id)} className="flex items-center gap-[4px] min-w-0">
                <span className="shrink-0">{iconMap[a.icon]}</span>
                <span className="truncate max-w-[110px]">{a.name}</span>
              </button>
              <button
                onClick={() => onRemove(a.id)}
                title="关闭该产物"
                className="w-[16px] h-[16px] flex items-center justify-center rounded-[2px] text-[#C0C4CC] hover:text-[#606266] hover:bg-black/10 shrink-0"
              >
                <X className="w-[10px] h-[10px]" />
              </button>
            </span>
          )
        })}
      </div>

      {/* 内容区：按产物类型定制渲染 */}
      <div className="flex-1 overflow-y-auto p-[12px]">
        {active && (
          <div key={active.id}>
            {active.viz === 'metric' && (
              <>
                <MetricOverviewCards />
                <MetricChart />
              </>
            )}
            {active.viz === 'trace' && (
              <>
                <TraceDiagram />
                <TraceWaterfall />
                <TraceStatsTable />
              </>
            )}
            {active.viz === 'flame' && (
              <>
                <FlameGraph />
                <FlameTopTable />
              </>
            )}
            {active.name === '日志查询' && <LogStructuredView lines={active.lines} />}
            {active.name === '变更记录' && <ChangeTimeline />}
            {active.name === '告警关联' && <AlertCorrelationView />}
            {/* 原始查询结果：特殊类型已定制渲染，其余保留原始行 */}
            {active.name !== '日志查询' && active.name !== '变更记录' && active.name !== '告警关联' && active.lines.length > 0 && (
              <div className="mb-[8px]">
                <div className="text-[11px] text-[#909399] mb-[6px]">
                  {active.viz ? '原始查询结果' : '查询结果'}
                </div>
                <div className="border border-[#EBEEF5] rounded-[4px] bg-[#FAFBFC] p-[8px]">
                  {active.lines.map((line, i) => (
                    <div key={i} className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-[#606266]" title={line}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** AI 思考过程折叠块（CoT，默认收起） */
function ThinkingBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white border border-[#EBEEF5] rounded-[6px] shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-[6px] px-[12px] py-[8px] bg-[#F5F7FA] border-b border-[#EBEEF5] text-[12px] font-medium text-[#606266]"
      >
        <Brain className="w-[13px] h-[13px] text-[#909399]" />
        AI 思考过程
        <ChevronDown className={`w-[13px] h-[13px] ml-auto text-[#909399] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-[12px] py-[10px] text-[12px] text-[#909399] italic leading-relaxed whitespace-pre-wrap">{content}</div>
      )}
    </div>
  )
}

// ─── 工具可视化（内联 SVG 手绘，无第三方依赖）──────────────────────────────────────

/** 指标趋势折线图：内存使用率近 1 小时上升，虚线为阈值 */
function MetricChart() {
  const W = 420
  const H = 140
  const P = { l: 34, r: 10, t: 12, b: 22 }
  const iw = W - P.l - P.r
  const ih = H - P.t - P.b
  // 模拟 12 个采样点：72 → 92（逐步上升）
  const data = [72, 74, 73, 77, 79, 81, 83, 84, 86, 88, 90, 92]
  const max = 100
  const min = 60
  const x = (i: number) => P.l + (i / (data.length - 1)) * iw
  const y = (v: number) => P.t + (1 - (v - min) / (max - min)) * ih
  const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(data.length - 1).toFixed(1)},${P.t + ih} L${x(0).toFixed(1)},${P.t + ih} Z`
  const thr = y(85) // 85% 阈值线
  const last = data[data.length - 1]
  return (
    <div className="mb-[8px] border border-[#EBEEF5] rounded-[4px] bg-white p-[8px]">
      <div className="flex items-center justify-between mb-[4px]">
        <span className="text-[11px] font-medium text-[#606266]">内存使用率趋势（近 1 小时）</span>
        <span className="text-[11px] text-[#F56C6C] font-medium">当前 {last}%（超阈值）</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" role="img" aria-label="内存使用率趋势图">
        {[70, 80, 85, 90].map((v) => (
          <g key={v}>
            <line x1={P.l} y1={y(v)} x2={W - P.r} y2={y(v)} stroke="#F0F2F5" strokeWidth="1" />
            <text x={P.l - 6} y={y(v) + 3} fontSize="9" fill="#A0A0A0" textAnchor="end">{v}%</text>
          </g>
        ))}
        <line x1={P.l} y1={thr} x2={W - P.r} y2={thr} stroke="#F56C6C" strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - P.r} y={thr - 4} fontSize="8" fill="#F56C6C" textAnchor="end">阈值 85%</text>
        <path d={area} fill="rgba(64,158,255,0.12)" />
        <path d={line} fill="none" stroke="#409EFF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === data.length - 1 ? 3.5 : 2} fill={i === data.length - 1 ? '#F56C6C' : '#409EFF'} />
        ))}
        <text x={P.l} y={H - 8} fontSize="9" fill="#A0A0A0">09:00</text>
        <text x={P.l + iw / 2} y={H - 8} fontSize="9" fill="#A0A0A0" textAnchor="middle">09:30</text>
        <text x={W - P.r} y={H - 8} fontSize="9" fill="#A0A0A0" textAnchor="end">10:00</text>
      </svg>
    </div>
  )
}

/** 调用链路拓扑图：gateway → 目标服务 → 依赖（超时链路标红） */
function TraceDiagram() {
  const nodes = [
    { x: 20, label: 'gateway', sub: 'API 网关', color: '#409EFF' },
    { x: 150, label: '目标服务', sub: 'p99 1.2s ⚠', color: '#F56C6C' },
    { x: 280, label: 'DB 连接', sub: '超时 ×3', color: '#F56C6C' },
  ]
  const edges = [
    { x1: 88, y1: 60, x2: 140, y2: 60, label: '调用超时 1200ms', color: '#F56C6C' },
    { x1: 218, y1: 60, x2: 270, y2: 60, label: '连接失败', color: '#F56C6C' },
  ]
  return (
    <div className="mb-[8px] border border-[#EBEEF5] rounded-[4px] bg-white p-[8px]">
      <div className="text-[11px] font-medium text-[#606266] mb-[4px]">调用链路（SkyWalking 采样）</div>
      <svg viewBox="0 0 400 120" className="w-full block" role="img" aria-label="调用链路拓扑图">
        <defs>
          <marker id="traceArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#F56C6C" />
          </marker>
        </defs>
        {edges.map((e, i) => (
          <g key={i}>
            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={e.color} strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#traceArrow)" />
            <text x={(e.x1 + e.x2) / 2} y={e.y1 - 8} fontSize="8" fill={e.color} textAnchor="middle">{e.label}</text>
          </g>
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <rect x={n.x} y={38} width={66} height={44} rx="6" fill="#FFFFFF" stroke={n.color} strokeWidth="1.5" />
            <text x={n.x + 33} y={56} fontSize="9" fontWeight="600" fill="#303133" textAnchor="middle">{n.label}</text>
            <text x={n.x + 33} y={70} fontSize="8" fill={n.color} textAnchor="middle">{n.sub}</text>
          </g>
        ))}
        <text x={200} y={108} fontSize="8" fill="#909399" textAnchor="middle">异常链路已标红 · p99 延迟 1.2s 超过 500ms 阈值</text>
      </svg>
    </div>
  )
}

/** 火焰图：CPU 采样栈（宽度 = 耗时占比），模拟 GC / 序列化热点 */
function FlameGraph() {
  const rows: { name: string; w: number; color: string }[][] = [
    [{ name: 'root', w: 100, color: '#E4E7ED' }],
    [{ name: 'main', w: 100, color: '#409EFF' }],
    [
      { name: 'BatchProcessor.run', w: 44, color: '#66B1FF' },
      { name: 'GC GCTaskThread', w: 32, color: '#F56C6C' },
      { name: 'String.<init>', w: 24, color: '#E6A23C' },
    ],
    [
      { name: 'db.query', w: 28, color: '#79BBFF' },
      { name: 'serialize', w: 16, color: '#F78989' },
      { name: 'gc-concurrent', w: 18, color: '#FFC07F' },
      { name: 'json.parse', w: 14, color: '#F5DAB1' },
      { name: 'other', w: 24, color: '#B8C4D0' },
    ],
  ]
  const rowH = 34
  const H = rows.length * rowH + 24
  return (
    <div className="mb-[8px] border border-[#EBEEF5] rounded-[4px] bg-white p-[10px]">
      <div className="flex items-center justify-between mb-[6px]">
        <span className="text-[12px] font-medium text-[#606266]">CPU 火焰图（采样 3856 次 / 10min）</span>
        <span className="text-[12px] text-[#F56C6C]">GC 热点 32.1%</span>
      </div>
      <svg viewBox={`0 0 400 ${H}`} className="w-full block" role="img" aria-label="CPU 火焰图">
        {rows.map((row, r) => {
          let acc = 0
          return (
            <g key={r}>
              <text x={2} y={r * rowH + 24} fontSize="10" fill="#909399">{r}</text>
              {row.map((b, i) => {
                const x = acc * 4
                const w = b.w * 4
                acc += b.w
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={r * rowH + 4}
                      width={w}
                      height={rowH - 8}
                      rx="3"
                      fill={b.color}
                      opacity={0.92}
                    >
                      <title>{`${b.name} ${b.w}%`}</title>
                    </rect>
                    {w >= 72 && (
                      <text
                        x={x + w / 2}
                        y={r * rowH + 24}
                        fontSize="12"
                        fontWeight="600"
                        fill="#FFFFFF"
                        textAnchor="middle"
                        style={{ pointerEvents: 'none' }}
                      >
                        {b.name} {b.w}%
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}
        <text x={200} y={H - 8} fontSize="10" fill="#909399" textAnchor="middle">宽度 = CPU 采样占比 · 热点：GC 线程 32.1% + 序列化 25.6%</text>
      </svg>
    </div>
  )
}

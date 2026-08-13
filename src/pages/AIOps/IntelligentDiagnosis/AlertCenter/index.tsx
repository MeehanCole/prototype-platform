/**
 * [功能标注] PRD FR-5 告警中心
 * 告警中心 - 告警消息页面（1:1 还原平台"告警消息"截图）
 * 3 个核心 Tab：指标告警 / 日志告警 / 事件告警
 * 行内「智能诊断」→ 共享诊断对话框（默认隐藏，预填告警上下文自动发起诊断）
 * 入口：仅 12宫格全局导航「运维中心 → 告警中心」调出（默认隐藏）
 */
import { useState } from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'
import { NewTag } from "../feature-tags";
import { Pagination } from '../_shared'
import { DiagnosisDialog } from '../DiagnosisDialog'
import type { DiagSubject } from '../DiagnosisDialog'

type AlertTab = 'overview' | 'metric' | 'log' | 'event' | 'history'

interface AlertRow {
  no: number
  policy: string
  status: string
  level: string
  project: string
  target: string
  category: string
  time: string
  message: string
  product?: string
  source?: string
  reason?: string
  recoveredTime?: string
}

const TAB_LIST: { key: AlertTab; label: string }[] = [
  { key: 'overview', label: '概览' },
  { key: 'metric', label: '指标告警' },
  { key: 'log', label: '日志告警' },
  { key: 'event', label: '事件告警' },
  { key: 'history', label: '历史告警' },
]

/** 告警中心自带导航栏（1:1 还原截图：运维中心 → 告警中心 菜单树，静态展示） */
const SIDEBAR_NAV: { title?: string; items: { label: string; active?: boolean }[] }[] = [
  { items: [{ label: '操作审计' }, { label: '平台审计' }] },
  { title: '监控中心', items: [{ label: '集群状态' }, { label: '应用资源' }, { label: '网络流量' }, { label: '自定义监控' }] },
  {
    title: '告警中心',
    items: [
      { label: '告警消息', active: true },
      { label: '告警策略' },
      { label: '日志管理' },
      { label: '日志查询' },
      { label: '事件查询' },
      { label: '日志接收器' },
    ],
  },
  { title: '系统管理', items: [{ label: '通知配置' }, { label: '运维参数' }] },
]

/** 各 Tab 表格列（与截图 1:1） */
const TAB_COLUMNS: Record<AlertTab, { key: string; title: string }[]> = {
  overview: [],
  metric: [
    { key: 'no', title: 'No.' },
    { key: 'policy', title: '告警策略' },
    { key: 'status', title: '告警状态' },
    { key: 'level', title: '告警级别' },
    { key: 'project', title: '项目' },
    { key: 'target', title: '监控目标' },
    { key: 'product', title: '产品' },
    { key: 'category', title: '告警类别' },
    { key: 'source', title: '策略来源' },
    { key: 'time', title: '激活时间' },
    { key: 'message', title: '消息' },
  ],
  log: [
    { key: 'no', title: 'No.' },
    { key: 'policy', title: '告警策略' },
    { key: 'level', title: '告警级别' },
    { key: 'project', title: '项目' },
    { key: 'target', title: '监控目标' },
    { key: 'category', title: '告警类别' },
    { key: 'time', title: '激活时间' },
    { key: 'message', title: '消息' },
  ],
  event: [
    { key: 'no', title: 'No.' },
    { key: 'policy', title: '告警策略' },
    { key: 'level', title: '告警级别' },
    { key: 'project', title: '项目' },
    { key: 'target', title: '监控目标' },
    { key: 'category', title: '告警类别' },
    { key: 'reason', title: '事件原因' },
    { key: 'time', title: '激活时间' },
    { key: 'message', title: '事件消息' },
  ],
  history: [
    { key: 'no', title: 'No.' },
    { key: 'policy', title: '告警策略' },
    { key: 'level', title: '告警级别' },
    { key: 'project', title: '项目' },
    { key: 'target', title: '监控目标' },
    { key: 'category', title: '告警类别' },
    { key: 'time', title: '激活时间' },
    { key: 'recoveredTime', title: '恢复时间' },
  ],
}

/** 各 Tab 筛选字段（与截图 1:1） */
const TAB_FILTERS: Record<AlertTab, { label: string; placeholder: string; type: 'select' | 'input' | 'date' }[]> = {
  overview: [],
  metric: [
    { label: '项目', placeholder: '请选择项目', type: 'select' },
    { label: '目标类型', placeholder: '请选择监控目标类型', type: 'select' },
    { label: '策略来源', placeholder: '请选择策略来源', type: 'select' },
    { label: '告警状态', placeholder: '请选择告警状态', type: 'select' },
    { label: '目标名称', placeholder: '请输入监控目标名称关键字查询', type: 'input' },
    { label: '产品', placeholder: '请选择产品', type: 'select' },
    { label: '告警级别', placeholder: '请选择告警级别', type: 'select' },
    { label: '告警策略', placeholder: '请输入告警策略名称关键字查询', type: 'input' },
    { label: '告警类别', placeholder: '请选择告警类别', type: 'select' },
  ],
  log: [
    { label: '项目', placeholder: '请选择项目', type: 'select' },
    { label: '告警策略', placeholder: '请输入告警策略', type: 'input' },
    { label: '告警级别', placeholder: '请选择告警级别', type: 'select' },
    { label: '时间范围', placeholder: '开始时间 - 结束时间', type: 'date' },
    { label: '目标类型', placeholder: '请选择监控目标类型', type: 'select' },
    { label: '目标名称', placeholder: '请输入目标名称查询', type: 'input' },
  ],
  event: [
    { label: '项目', placeholder: '请选择项目', type: 'select' },
    { label: '告警策略', placeholder: '请输入告警策略', type: 'input' },
    { label: '告警级别', placeholder: '请选择告警级别', type: 'select' },
    { label: '目标类型', placeholder: '请选择监控目标类型', type: 'select' },
    { label: '目标名称', placeholder: '请输入目标名称查询', type: 'input' },
    { label: '事件原因', placeholder: '请输入事件原因查询', type: 'input' },
    { label: '时间范围', placeholder: '开始时间 - 结束时间', type: 'date' },
  ],
  history: [],
}

/** Mock 告警数据（沿用截图样例） */
const ALERT_DATA: Record<AlertTab, AlertRow[]> = {
  metric: [
    {
      no: 1, policy: 'KubePodCrashLooping', status: '判断中', level: '一般告警', project: 'test',
      target: '容器组 loadgen-deployment-667bd4dd94-vcl9b', product: '容器云', category: 'Kubernetes资源',
      source: '内置策略', time: '2026-08-06 16:53:00',
      message: 'Pod is crash looping. Pod test/loadgen-deployment-667bd4dd94-vcl9b has restarted 5 times in the last 10 minutes.',
    },
    {
      no: 2, policy: 'RowsRejectedOnIngestion', status: '已触发', level: '一般告警', project: 'monitoring-system',
      target: '服务 vminsert-vm', product: '容器云', category: '平台组件', source: '内置策略', time: '2026-08-06 15:01:30',
      message: 'Some rows are rejected on "10.10.60.61:8480". Ingested rows on instance "10.10.60.61:8480" are rejected: 2% of total.',
    },
    {
      no: 3, policy: 'KubePodCrashLooping', status: '已触发', level: '一般告警', project: 'magic-pd2',
      target: '容器组 modelmagic-service-data-776ff44f8c-4zmtk', product: '容器云', category: 'Kubernetes资源',
      source: '内置策略', time: '2026-08-06 13:36:30',
      message: 'Pod is crash looping. Pod magic-pd2/modelmagic-service-data-776ff44f8c-4zmtk has restarted 8 times.',
    },
    {
      no: 4, policy: 'NodeDiskUsageHigh', status: '已触发', level: '严重告警', project: 'monitoring-system',
      target: '节点 node-10.10.60.62', product: '容器云', category: '节点资源', source: '内置策略', time: '2026-08-06 11:20:00',
      message: 'Node disk usage is above 85% on /var/lib/docker. Current usage: 87.3%.',
    },
    {
      no: 5, policy: 'PodMemoryHigh', status: '已触发', level: '一般告警', project: 'magic-pd2',
      target: '容器组 modelmagic-service-data-776ff44f8c-4zmtk', product: '容器云', category: 'Kubernetes资源',
      source: '内置策略', time: '2026-08-06 10:05:00',
      message: 'Pod memory usage is above 90% of limit. Current usage: 92.1%.',
    },
    {
      no: 6, policy: 'APILatencyHigh', status: '判断中', level: '紧急告警', project: 'test',
      target: '服务 gateway', product: '算力加速平台', category: '应用性能', source: '自定义策略', time: '2026-08-06 09:40:00',
      message: 'API p99 latency is above 500ms on gateway. Current p99: 1.2s.',
    },
  ],
  log: [
    {
      no: 1, policy: 'ErrorLogKeyword', status: '已触发', level: '严重告警', project: 'magic-pd2',
      target: '日志采集器 filebeat-pd2', category: '关键词匹配', time: '2026-08-06 16:20:00',
      message: '[ERROR] connection refused to 10.10.60.61:3306, retrying... (occurred 42 times in 5 minutes)',
    },
    {
      no: 2, policy: 'ExceptionRegex', status: '已触发', level: '一般告警', project: 'test',
      target: '索引 vmware-index', category: '正则匹配', time: '2026-08-06 15:44:00',
      message: 'java.lang.OutOfMemoryError: Java heap space at com.example.service.BatchProcessor.process(BatchProcessor.java:127)',
    },
    {
      no: 3, policy: 'ErrorLogKeyword', status: '已触发', level: '一般告警', project: 'monitoring-system',
      target: '日志采集器 fluentd-monitor', category: '关键词匹配', time: '2026-08-06 14:10:00',
      message: '[WARN] failed to scrape metrics from vmagent: dial tcp 10.10.60.61:8429: connect: connection refused',
    },
    {
      no: 4, policy: 'ExceptionRegex', status: '判断中', level: '紧急告警', project: 'test',
      target: '索引 app-gateway-log', category: '正则匹配', time: '2026-08-06 12:30:00',
      message: 'Exception in thread "main" com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure',
    },
  ],
  event: [
    {
      no: 1, policy: 'NodeRebootEvent', status: '已触发', level: '严重告警', project: 'monitoring-system',
      target: '节点 node-10.10.60.62', category: '节点事件', reason: '节点重启', time: '2026-08-06 17:02:00',
      message: 'Node node-10.10.60.62 rebooted unexpectedly. System uptime reset to 3 minutes.',
    },
    {
      no: 2, policy: 'PodEvictionEvent', status: '已触发', level: '一般告警', project: 'magic-pd2',
      target: '容器组 modelmagic-service-data-776ff44f8c-4zmtk', category: 'Kubernetes事件', reason: '资源驱逐',
      time: '2026-08-06 15:50:00',
      message: 'Pod was evicted due to node pressure (memory). Node: node-10.10.60.62.',
    },
    {
      no: 3, policy: 'ImagePullFailEvent', status: '判断中', level: '一般告警', project: 'test',
      target: '容器组 loadgen-deployment-667bd4dd94-vcl9b', category: 'Kubernetes事件', reason: '镜像拉取失败',
      time: '2026-08-06 13:15:00',
      message: 'Failed to pull image "harbor.internal/aiops/loadgen:v2.3": manifest unknown.',
    },
  ],
  overview: [],
  history: [
    {
      no: 1, policy: 'KubePodCrashLooping', status: '已恢复', level: '一般告警', project: 'test',
      target: '容器组 loadgen-deployment-667bd4dd94-vcl9b', category: 'Kubernetes资源',
      time: '2026-08-05 09:12:00', recoveredTime: '2026-08-05 09:40:00', message: 'Pod has recovered after restart.',
    },
    {
      no: 2, policy: 'NodeDiskUsageHigh', status: '已恢复', level: '严重告警', project: 'monitoring-system',
      target: '节点 node-10.10.60.62', category: '节点资源',
      time: '2026-08-04 22:30:00', recoveredTime: '2026-08-05 01:15:00', message: 'Disk usage returned below 80%.',
    },
    {
      no: 3, policy: 'ErrorLogKeyword', status: '已恢复', level: '一般告警', project: 'magic-pd2',
      target: '日志采集器 filebeat-pd2', category: '关键词匹配',
      time: '2026-08-04 14:05:00', recoveredTime: '2026-08-04 14:50:00', message: 'No error logs detected in the last 10 minutes.',
    },
    {
      no: 4, policy: 'APILatencyHigh', status: '已恢复', level: '紧急告警', project: 'test',
      target: '服务 gateway', category: '应用性能',
      time: '2026-08-03 18:20:00', recoveredTime: '2026-08-03 18:55:00', message: 'API latency returned to normal (p99 < 200ms).',
    },
  ],
}

/** 概览 Tab 统计卡片（静态） */
const OVERVIEW_STATS = [
  { label: '告警总数', value: '13', sub: '当前告警', cls: 'text-[#409EFF] bg-[#ECF5FF]' },
  { label: '今日新增', value: '6', sub: '2026-08-07', cls: 'text-[#E6A23C] bg-[#FDF6EC]' },
  { label: '紧急告警', value: '2', sub: '需立即处理', cls: 'text-[#F56C6C] bg-[#FEF0F0]' },
  { label: '待处理', value: '3', sub: '含判断中', cls: 'text-[#67C23A] bg-[#F0F9EB]' },
]

/** 概览 Tab 类型分布（静态） */
const OVERVIEW_DISTRIBUTION = [
  { label: '指标告警', value: 6, color: '#409EFF' },
  { label: '日志告警', value: 4, color: '#E6A23C' },
  { label: '事件告警', value: 3, color: '#F56C6C' },
]

/** 表格徽标样式（与共享诊断组件一致的 Element Plus 配色） */
const levelCls = (level: string) =>
  level === '紧急告警'
    ? 'bg-[#FEF0F0] text-[#F56C6C]'
    : level === '严重告警'
      ? 'bg-[#FDF6EC] text-[#E6A23C]'
      : 'bg-[#F0F9EB] text-[#67C23A]'

const statusCls = (status: string) =>
  status === '判断中'
    ? 'bg-[#ECF5FF] text-[#409EFF]'
    : status === '已触发'
      ? 'bg-[#FDF6EC] text-[#E6A23C]'
      : 'bg-[#F0F9EB] text-[#67C23A]'

export function AlertCenterPage() {
  const [activeTab, setActiveTab] = useState<AlertTab>('metric')
  const [page, setPage] = useState(1)
  // 诊断对话框状态：告警行 → DiagSubject 注入共享组件（alert 模式直接发起）
  const [diagSubject, setDiagSubject] = useState<DiagSubject | null>(null)
  const [diagSeq, setDiagSeq] = useState(0)

  // 打开诊断面板：每次递增 seq，保证面板以全新状态挂载
  const openDiag = (row: AlertRow) => {
    setDiagSubject({
      no: row.no,
      policy: row.policy,
      level: row.level,
      project: row.project,
      target: row.target,
      time: row.time,
      message: row.message,
    })
    setDiagSeq((s) => s + 1)
  }

  const columns = TAB_COLUMNS[activeTab]
  const rows = ALERT_DATA[activeTab]
  const pageSize = 10

  const renderCell = (key: string, r: AlertRow) => {
    if (key === 'status') return <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[12px] ${statusCls(r.status)}`}>{r.status}</span>
    if (key === 'level') return <span className={`inline-block px-[8px] py-[2px] rounded-[4px] text-[12px] ${levelCls(r.level)}`}>{r.level}</span>
    const value = r[key as keyof AlertRow]
    if (key === 'message' && typeof value === 'string') {
      return (
        <span className="block max-w-[320px] truncate" title={value}>
          {value}
        </span>
      )
    }
    return <span>{String(value ?? '-')}</span>
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 左侧导航（1:1 还原截图菜单树，静态展示） */}
      <aside className="w-[200px] shrink-0 bg-[#F7F9FC] border-r border-[#DCDFE6] overflow-y-auto py-[8px]">
        {SIDEBAR_NAV.map((g, gi) => (
          <div key={gi}>
            {g.title && (
              <div className="px-[16px] pt-[12px] pb-[4px] text-[12px] font-medium text-[#909399] tracking-wider">{g.title}</div>
            )}
            <div className="space-y-[2px]">
              {g.items.map((it) => (
                <button
                  key={it.label}
                  className={`w-full flex items-center px-[16px] py-[8px] text-[13px] transition-colors ${
                    it.active
                      ? 'text-[#409EFF] bg-[#ECF5FF] font-medium border-r-[2px] border-[#409EFF]'
                      : 'text-[#606266] hover:text-[#409EFF] hover:bg-[#F5F7FA]'
                  }`}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* 告警内容区 */}
      <div className="flex-1 overflow-y-auto p-[20px]">
      <div className="bg-white border border-[#EBEEF5] rounded-[4px]">
        {/* 页面标题 */}
        <div className="px-[20px] pt-[18px] pb-[14px] border-b border-[#EBEEF5]">
          <h2 className="text-[18px] font-semibold text-[#303133] flex items-center gap-[6px]">告警消息 <NewTag code="FR-5" /></h2>
          <p className="text-[13px] text-[#909399] mt-[4px]">告警消息显示满足告警规则后触发的告警详细信息。</p>
        </div>

        {/* Tab 切换 */}
        <div className="flex items-center border-b border-[#E4E7ED] px-[8px]">
          {TAB_LIST.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setPage(1) }}
              className={`px-[18px] py-[12px] text-[14px] transition-colors border-b-[2px] -mb-[1px] ${
                activeTab === t.key
                  ? 'text-[#409EFF] border-[#409EFF] font-medium'
                  : 'text-[#606266] border-transparent hover:text-[#409EFF]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 筛选区（概览/历史告警为静态展示，不显示筛选） */}
        {activeTab !== 'overview' && activeTab !== 'history' && (
        <div className="px-[20px] py-[16px] border-b border-[#EBEEF5]">
          <div className="grid grid-cols-2 gap-x-[24px] gap-y-[14px]">
            {TAB_FILTERS[activeTab].map((f) => (
              <div key={f.label} className="flex items-center gap-[8px]">
                <label className="text-[13px] text-[#606266] whitespace-nowrap w-[70px] text-right shrink-0">{f.label}：</label>
                {f.type === 'select' ? (
                  <button className="flex-1 flex items-center justify-between h-[32px] px-[10px] border border-[#DCDFE6] rounded-[4px] text-[13px] text-[#A0A0A0] bg-white hover:border-[#409EFF] transition-colors">
                    <span>{f.placeholder}</span>
                    <ChevronDown size={13} />
                  </button>
                ) : f.type === 'date' ? (
                  <button className="flex-1 flex items-center justify-between h-[32px] px-[10px] border border-[#DCDFE6] rounded-[4px] text-[13px] text-[#A0A0A0] bg-white hover:border-[#409EFF] transition-colors">
                    <span>{f.placeholder}</span>
                    <ChevronDown size={13} />
                  </button>
                ) : (
                  <input
                    placeholder={f.placeholder}
                    className="flex-1 h-[32px] px-[10px] border border-[#DCDFE6] rounded-[4px] text-[13px] text-[#303133] placeholder:text-[#A0A0A0] outline-none focus:border-[#409EFF] transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-[10px] mt-[16px]">
            <button className="h-[32px] px-[16px] border border-[#DCDFE6] rounded-[4px] text-[13px] text-[#606266] hover:text-[#409EFF] hover:border-[#409EFF] transition-colors">重置</button>
            <button className="h-[32px] px-[16px] bg-[#409EFF] rounded-[4px] text-[13px] text-white hover:bg-[#66B1FF] transition-colors">查询</button>
          </div>
        </div>
        )}

        {/* 概览：静态统计卡片 + 类型分布 */}
        {activeTab === 'overview' ? (
          <div className="px-[20px] py-[16px]">
            <div className="grid grid-cols-4 gap-[16px]">
              {OVERVIEW_STATS.map((s) => (
                <div key={s.label} className="border border-[#EBEEF5] rounded-[4px] p-[16px]">
                  <div className={`inline-block text-[12px] px-[8px] py-[2px] rounded-[4px] ${s.cls}`}>{s.label}</div>
                  <div className="text-[28px] font-semibold text-[#303133] mt-[10px]">{s.value}</div>
                  <div className="text-[12px] text-[#909399] mt-[4px]">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="mt-[20px] border border-[#EBEEF5] rounded-[4px] p-[16px]">
              <div className="text-[14px] font-medium text-[#303133] mb-[14px]">告警类型分布</div>
              <div className="space-y-[12px]">
                {OVERVIEW_DISTRIBUTION.map((d) => (
                  <div key={d.label} className="flex items-center gap-[12px]">
                    <span className="text-[13px] text-[#606266] w-[70px] shrink-0">{d.label}</span>
                    <div className="flex-1 h-[8px] bg-[#F0F2F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(d.value / 13) * 100}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-[13px] text-[#606266] w-[30px] text-right">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
        <div className="px-[20px] py-[16px] overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F5F7FA]">
                {columns.map((c) => (
                  <th key={c.key} className="text-left px-[12px] py-[10px] font-medium text-[#909399] whitespace-nowrap">{c.title}</th>
                ))}
                {activeTab !== 'history' && (
                  <th className="text-left px-[12px] py-[10px] font-medium text-[#909399] whitespace-nowrap">操作</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.no} className="border-t border-[#EBEEF5] hover:bg-[#F5F7FA] transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className="px-[12px] py-[10px] text-[#606266] whitespace-nowrap align-middle">
                      {renderCell(c.key, r)}
                    </td>
                  ))}
                  {activeTab !== 'history' && (
                  <td className="px-[12px] py-[10px] align-middle">
                    <button
                      onClick={() => openDiag(r)}
                      className="flex items-center gap-[4px] text-[#409EFF] hover:text-[#66B1FF] transition-colors whitespace-nowrap"
                    >
                      <Sparkles size={13} />
                      智能诊断
                    </button>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <div className="flex items-center justify-end mt-[14px]">
            <Pagination current={page} total={rows.length * 3} pageSize={pageSize} onChange={setPage} />
          </div>
        </div>
        )}
      </div>

      {/* 智能诊断对话框（默认隐藏，点击行内「智能诊断」打开） */}
      {diagSubject && (
        <DiagnosisDialog
          key={`${diagSubject.policy}-${diagSubject.target}-${diagSeq}`}
          mode="alert"
          presetSubject={diagSubject}
          onClose={() => setDiagSubject(null)}
        />
      )}
      </div>
    </div>
  )
}

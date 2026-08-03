import { useState, useMemo } from 'react'

// OA Approval Center - Kanban + List dual view (DingTalk style)
// Element Plus preset: 4px radius, stripe table, headerBg, blue primary

type ApprovalType = 'leave' | 'expense' | 'purchase' | 'seal'
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'processing'
type TabKey = 'todo' | 'done' | 'cc' | 'mine'
type ViewMode = 'kanban' | 'list'

interface ApprovalItem {
  id: string
  title: string
  type: ApprovalType
  applicant: string
  submitTime: string
  currentNode: string
  status: ApprovalStatus
  urgent: boolean
  timeout: boolean
  amount?: string
  summary: string
}

interface TimelineNode {
  node: string
  approver: string
  time: string
  status: 'done' | 'current' | 'pending'
  opinion?: string
}

const TYPE_LABEL: Record<ApprovalType, string> = {
  leave: '请假',
  expense: '报销',
  purchase: '采购',
  seal: '用印',
}

const TYPE_COLOR: Record<ApprovalType, string> = {
  leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  expense: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  purchase: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  seal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
  processing: '审批中',
}

const STATUS_TAG: Record<ApprovalStatus, string> = {
  pending: 'bg-warning/15 text-warning',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
  processing: 'bg-primary/15 text-primary',
}

// mock data
const MOCK_ITEMS: ApprovalItem[] = [
  { id: 'OA-2026-0801', title: '年假申请 3 天', type: 'leave', applicant: '张三', submitTime: '08-01 09:12', currentNode: '部门经理审批', status: 'pending', urgent: true, timeout: false, summary: '8/4-8/6 年假,事由:家庭出行' },
  { id: 'OA-2026-0802', title: '差旅报销 ¥3,200', type: 'expense', applicant: '李四', submitTime: '08-01 10:30', currentNode: '财务复核', status: 'processing', urgent: false, timeout: false, amount: '¥3,200', summary: '上海客户拜访差旅,含机票+酒店' },
  { id: 'OA-2026-0803', title: '办公用品采购', type: 'purchase', applicant: '王五', submitTime: '07-31 16:45', currentNode: '部门经理审批', status: 'pending', urgent: false, timeout: true, amount: '¥1,580', summary: 'Q3 季度办公用品补充采购' },
  { id: 'OA-2026-0804', title: '合同用印申请', type: 'seal', applicant: '赵六', submitTime: '07-31 14:20', currentNode: '法务审核', status: 'processing', urgent: true, timeout: false, summary: '星河科技合作协议盖章,2 处用印' },
  { id: 'OA-2026-0805', title: '调休申请 1 天', type: 'leave', applicant: '孙七', submitTime: '07-30 11:00', currentNode: '部门经理审批', status: 'pending', urgent: false, timeout: false, summary: '8/8 调休,事由:个人事务' },
  { id: 'OA-2026-0806', title: '客户接待报销 ¥860', type: 'expense', applicant: '周八', submitTime: '07-30 09:30', currentNode: '部门经理审批', status: 'pending', urgent: false, timeout: true, amount: '¥860', summary: '7/28 客户来访接待餐饮' },
  { id: 'OA-2026-0807', title: '软件许可采购', type: 'purchase', applicant: '吴九', submitTime: '07-29 15:10', currentNode: 'IT 审核', status: 'processing', urgent: false, timeout: false, amount: '¥12,000', summary: '设计团队 Figma 团队版年付' },
  { id: 'OA-2026-0808', title: '授权书用印', type: 'seal', applicant: '郑十', submitTime: '07-29 10:00', currentNode: '总经理审批', status: 'processing', urgent: true, timeout: false, summary: '海蓝集团项目授权书,1 处用印' },
]

const MOCK_TIMELINE: TimelineNode[] = [
  { node: '发起申请', approver: '张三', time: '08-01 09:12', status: 'done', opinion: '提交申请' },
  { node: '直属主管审批', approver: '李主管', time: '08-01 09:45', status: 'done', opinion: '同意,注意工作交接' },
  { node: '部门经理审批', approver: '王经理', time: '—', status: 'current' },
  { node: 'HR 备案', approver: 'HR 系统', time: '—', status: 'pending' },
]

// sparkline: tiny trend chart
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 24
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={w} cy={pts[pts.length - 1].split(',')[1]} r="2" fill={color} />
    </svg>
  )
}

function StatCard({
  label,
  value,
  trend,
  trendData,
  accent,
}: {
  label: string
  value: string
  trend: string
  trendData: number[]
  accent: string
}) {
  return (
    <div className="rounded border border-border bg-background p-4 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
        </div>
        <Sparkline data={trendData} color={accent} />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{trend}</p>
    </div>
  )
}

function KanbanCard({
  item,
  onClick,
}: {
  item: ApprovalItem
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded border border-border bg-background p-3 shadow-soft hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-foreground line-clamp-1">{item.title}</span>
        {item.urgent && (
          <span className="shrink-0 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
            紧急
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{item.summary}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{item.applicant}</span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{item.submitTime}</span>
      </div>
      {item.timeout && (
        <div className="mt-2 rounded bg-warning/10 px-2 py-1 text-[10px] text-warning">
          超时未处理,请尽快审批
        </div>
      )}
    </button>
  )
}

function DetailDialog({
  item,
  onClose,
  onAction,
}: {
  item: ApprovalItem | null
  onClose: () => void
  onAction: (action: 'approve' | 'reject') => void
}) {
  const [opinion, setOpinion] = useState('')
  if (!item) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-[640px] max-h-[85vh] overflow-auto rounded border border-border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* dialog header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-foreground">{item.title}</h3>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_TAG[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            {item.urgent && (
              <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                紧急
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">
            ×
          </button>
        </div>

        {/* dialog body */}
        <div className="px-5 py-4 space-y-4">
          {/* apply info */}
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              申请信息
            </h4>
            <div className="rounded border border-border bg-muted/30 p-3 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <div><span className="text-muted-foreground">单号:</span> <span className="text-foreground tabular-nums">{item.id}</span></div>
                <div><span className="text-muted-foreground">类型:</span> <span className="text-foreground">{TYPE_LABEL[item.type]}</span></div>
                <div><span className="text-muted-foreground">发起人:</span> <span className="text-foreground">{item.applicant}</span></div>
                <div><span className="text-muted-foreground">提交时间:</span> <span className="text-foreground tabular-nums">{item.submitTime}</span></div>
                {item.amount && (
                  <div><span className="text-muted-foreground">金额:</span> <span className="text-foreground font-medium tabular-nums">{item.amount}</span></div>
                )}
                <div><span className="text-muted-foreground">当前节点:</span> <span className="text-primary">{item.currentNode}</span></div>
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <span className="text-muted-foreground">事由说明:</span>
                <p className="mt-1 text-foreground">{item.summary}</p>
              </div>
            </div>
          </section>

          {/* approval timeline */}
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              审批轨迹
            </h4>
            <div className="relative pl-4">
              <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
              {MOCK_TIMELINE.map((node, i) => (
                <div key={i} className="relative pb-3 last:pb-0">
                  <div
                    className={`absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-background ${
                      node.status === 'done'
                        ? 'bg-success'
                        : node.status === 'current'
                        ? 'bg-primary ring-2 ring-primary/30'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${node.status === 'current' ? 'font-medium text-primary' : 'text-foreground'}`}>
                      {node.node}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{node.time}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    审批人: {node.approver}
                    {node.opinion && <span className="ml-2">· {node.opinion}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* opinion input */}
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              审批意见
            </h4>
            <textarea
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              rows={3}
              placeholder="请输入审批意见(可选)"
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </section>
        </div>

        {/* dialog footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            onClick={onClose}
            className="rounded border border-border bg-background px-4 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onAction('reject')}
            className="rounded border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-sm text-destructive hover:bg-destructive/20 transition-colors"
          >
            驳回
          </button>
          <button
            onClick={() => onAction('approve')}
            className="rounded bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            同意
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalCenterPage() {
  const [tab, setTab] = useState<TabKey>('todo')
  const [view, setView] = useState<ViewMode>('kanban')
  const [selected, setSelected] = useState<ApprovalItem | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<ApprovalType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all')
  const [loading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const tabCount: Record<TabKey, number> = useMemo(
    () => ({ todo: 5, done: 23, cc: 8, mine: 12 }),
    [],
  )

  const filtered = useMemo(() => {
    let list = MOCK_ITEMS
    if (typeFilter !== 'all') list = list.filter((i) => i.type === typeFilter)
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter)
    // tab filter (mock: todo shows pending+processing)
    if (tab === 'todo') list = list.filter((i) => i.status === 'pending' || i.status === 'processing')
    return list
  }, [tab, typeFilter, statusFilter])

  const kanbanGroups = useMemo(() => {
    const groups: Record<ApprovalType, ApprovalItem[]> = { leave: [], expense: [], purchase: [], seal: [] }
    filtered.forEach((i) => groups[i.type].push(i))
    return groups
  }, [filtered])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const handleAction = (action: 'approve' | 'reject') => {
    showToast(action === 'approve' ? '已同意审批' : '已驳回审批')
    setSelected(null)
  }

  const handleBatchApprove = () => {
    if (checked.size === 0) return
    showToast(`已批量同意 ${checked.size} 项审批`)
    setChecked(new Set())
  }

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allChecked = filtered.length > 0 && checked.size === filtered.length

  return (
    <div className="min-h-[640px] bg-muted/20 p-4">
      {/* page header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">审批中心</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">统一处理各业务线审批事项</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ApprovalType | 'all')}
            className="rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">全部类型</option>
            <option value="leave">请假</option>
            <option value="expense">报销</option>
            <option value="purchase">采购</option>
            <option value="seal">用印</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus | 'all')}
            className="rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">全部状态</option>
            <option value="pending">待审批</option>
            <option value="processing">审批中</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
      </div>

      {/* stat dashboard */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        <StatCard label="待办事项" value={String(tabCount.todo)} trend="较昨日 +2" trendData={[3, 4, 3, 5, 4, 5, 5]} accent="hsl(243 75% 59%)" />
        <StatCard label="超时未处理" value="2" trend="需尽快处理" trendData={[1, 0, 2, 1, 3, 2, 2]} accent="hsl(38 92% 50%)" />
        <StatCard label="今日已处理" value="8" trend="较昨日 +3" trendData={[3, 5, 4, 6, 5, 7, 8]} accent="hsl(142 71% 45%)" />
        <StatCard label="本周已完成" value="47" trend="本周进度 78%" trendData={[8, 12, 9, 11, 7, 0, 0]} accent="hsl(200 80% 50%)" />
      </div>

      {/* tabs with badge */}
      <div className="mb-3 flex items-center gap-1 border-b border-border">
        {([
          { key: 'todo', label: '待办' },
          { key: 'done', label: '已办' },
          { key: 'cc', label: '抄送我' },
          { key: 'mine', label: '我发起的' },
        ] as { key: TabKey; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-3 py-2 text-sm transition-colors ${
              tab === t.key
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {tabCount[t.key] > 0 && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                  tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {tabCount[t.key]}
              </span>
            )}
            {tab === t.key && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* view switch + batch action */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-0.5 p-0.5 rounded border border-border bg-muted/40">
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1 text-xs rounded-sm transition-all ${
              view === 'kanban' ? 'bg-background text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            看板视图
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 text-xs rounded-sm transition-all ${
              view === 'list' ? 'bg-background text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            列表视图
          </button>
        </div>
        {view === 'list' && checked.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">已选 {checked.size} 项</span>
            <button
              onClick={handleBatchApprove}
              className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              批量同意
            </button>
          </div>
        )}
      </div>

      {/* content area */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded border border-border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl mb-3">
            ✓
          </div>
          <p className="text-sm">暂无审批事项</p>
          <p className="mt-1 text-xs">该分类下当前没有需要处理的审批</p>
        </div>
      ) : view === 'kanban' ? (
        /* kanban view */
        <div className="grid grid-cols-4 gap-3">
          {(Object.keys(TYPE_LABEL) as ApprovalType[]).map((t) => (
            <div key={t} className="rounded border border-border bg-background/50 p-2">
              <div className="flex items-center justify-between px-1 py-1.5 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLOR[t]}`}>
                    {TYPE_LABEL[t]}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">{kanbanGroups[t].length}</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                {kanbanGroups[t].map((item) => (
                  <KanbanCard key={item.id} item={item} onClick={() => setSelected(item)} />
                ))}
                {kanbanGroups[t].length === 0 && (
                  <div className="py-8 text-center text-[11px] text-muted-foreground">暂无</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* list view */
        <div className="rounded border border-border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="w-10 px-3 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={() => {
                      if (allChecked) setChecked(new Set())
                      else setChecked(new Set(filtered.map((i) => i.id)))
                    }}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">标题</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">类型</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">发起人</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">提交时间</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">当前节点</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">状态</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                    i % 2 === 1 ? 'bg-muted/10' : ''
                  } ${checked.has(item.id) ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={checked.has(item.id)}
                      onChange={() => toggleCheck(item.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setSelected(item)}
                      className="flex items-center gap-1.5 text-foreground hover:text-primary"
                    >
                      {item.urgent && <span className="text-destructive text-xs">●</span>}
                      <span className="font-medium">{item.title}</span>
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLOR[item.type]}`}>
                      {TYPE_LABEL[item.type]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-foreground">{item.applicant}</td>
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{item.submitTime}</td>
                  <td className="px-3 py-2.5 text-primary">{item.currentNode}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_TAG[item.status]}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                    {item.timeout && (
                      <span className="ml-1 text-[10px] text-warning">超时</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setSelected(item); }}
                            className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary hover:bg-primary/20 transition-colors"
                          >
                            同意
                          </button>
                          <button
                            onClick={() => { setSelected(item); }}
                            className="rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            驳回
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelected(item)}
                        className="rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        详情
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* pagination (EP background style) */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">共 {filtered.length} 条</span>
            <div className="flex items-center gap-1">
              <button className="rounded border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>
                上一页
              </button>
              <button className="rounded bg-primary px-2.5 py-1 text-xs text-primary-foreground">1</button>
              <button className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:bg-muted">2</button>
              <button className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:bg-muted">3</button>
              <button className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground hover:text-foreground">
                下一页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* detail dialog */}
      <DetailDialog item={selected} onClose={() => setSelected(null)} onAction={handleAction} />

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded bg-foreground px-4 py-2 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

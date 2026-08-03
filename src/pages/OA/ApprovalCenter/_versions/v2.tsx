import { useState, useMemo, useRef, useEffect, createContext, useContext, useCallback } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// Vite 打包时内嵌 PRD 原文，零后端依赖（纯静态部署友好）
import prdV2Raw from '../prd_v2.md?raw'

// OA Approval Center V2 - 个人视角 + 团队视角双轨制
// Mode C Hybrid Workflow: 在 V1 纯个人视角基础上,增量叠加团队视角管理功能
// 设计系统: Element Plus 预设 (#409EFF 主色, 4px 圆角, Stripe 表格)
// 功能点标注说明: 显示新增功能点开关已上移到 Host 顶部栏(缩放控件左侧);
//   开关按"路由+版本"粒度存 localStorage,版本切换自动 remount.
// 标注格式: A=Restructure / B=Add / M=Modify, 后接编号,例如 B.02 = Add 第 2 项
// 详细说明见 _workflow/c5_v1_vs_v2_changelog.md

const FEATURE_LABELS: Record<string, { title: string; type: 'A' | 'B' | 'M' | 'R'; desc: string }> = {
  'A.01': { type: 'A', title: '顶层双视角 Tab', desc: '原 4 个个人 Tab → 视角(个人/团队)+ 子 Tab 两层架构' },
  'M.01': { type: 'M', title: '新增部门/成员筛选', desc: '团队视角顶部新增部门下拉 + 成员下拉筛选' },
  'M.02': { type: 'M', title: '新增「仅看超时」筛选', desc: '团队视角顶部新增超时快速筛选' },
  'B.01': { type: 'B', title: '团队视角统计卡 4 张', desc: '替换个人版,新增:部门待办/超时/平均时长/本周通过,带趋势+可点跳' },
  'B.02': { type: 'B', title: '团队子 Tab 4 个', desc: '总览 / 团队待办 / 成员分布 / 效率排行,4 个团队视角子视图' },
  'B.03': { type: 'B', title: '总览 · 成员待办分布', desc: '横条进度条形图,一眼识别谁手上堆积,点击跳转成员分布' },
  'B.04': { type: 'B', title: '总览 · 类型分布 + 快捷操作', desc: '类型进度条 + 处理超时/看排行/成员分布 3 个快捷入口' },
  'B.05': { type: 'B', title: '团队待办列表(核心干预页)', desc: '新增:发起人/当前审批人/节点停留时长 3 列 + 行操作改催办/转交' },
  'M.03': { type: 'M', title: '团队看板分组改为节点', desc: '团队视角看板从「按类型」→「按当前节点」分列,识别环节瓶颈' },
  'B.06': { type: 'B', title: '成员分布看板', desc: '按成员分列看板,每人待办/超时一览,支持 6 列' },
  'B.07': { type: 'B', title: '效率排行表(简化 MVP)', desc: '排名(金银铜)/处理数/平均时长/超时数/对比条' },
  'M.04': { type: 'M', title: '详情弹窗 SLA 提示条', desc: '停留 ≥ 24h 红色警告条 + 新增当前审批人/停留字段' },
  'M.05': { type: 'M', title: '详情弹窗底部操作改为催办/转交', desc: '管理者不做决策只推进,转交禁用占位+即将上线' },
  'B.08': { type: 'B', title: '显示新增功能点开关', desc: '右上角切换所有 NEW 角标显隐,演示关/测试开' },
}

/**
 * 从 PRD 原文中提取指定 FR 段落（按 **FR-X 标记切分）
 * - 只传 startFr：提取该 FR 到下一个 FR 之间的内容
 * - 传 startFr + endFr：提取 [startFr, endFr) 之间的内容（含 startFr，不含 endFr）
 */
function extractSection(raw: string, startFr: string, endFr?: string): string {
  const lines = raw.split('\n')
  let start = -1, end = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (start < 0 && lines[i].includes(`**${startFr} `)) start = i
    if (endFr && lines[i].includes(`**${endFr} `)) { end = i; break }
  }
  if (!endFr && start >= 0) {
    // 未指定 endFr：遇到下一个 **FR- 自动截断
    for (let i = start + 1; i < lines.length; i++) {
      if (/^\*\*FR-/.test(lines[i])) { end = i; break }
    }
  }
  if (start === -1) return `（未找到 ${startFr} 的 PRD 段落，请检查 prd_v2.md）`
  return lines.slice(start, end).join('\n').trim()
}

// 功能点编号 → PRD 完整段落映射（点击文档图标弹出右侧面板展示）
const FEATURE_DOCS: Record<string, string> = {
  'A.01': extractSection(prdV2Raw, 'FR-1'),
  'M.01': extractSection(prdV2Raw, 'FR-2'),
  'B.01': extractSection(prdV2Raw, 'FR-3'),
  'B.02': extractSection(prdV2Raw, 'FR-4', 'FR-7'),
  'B.03': extractSection(prdV2Raw, 'FR-4'),
  'B.04': extractSection(prdV2Raw, 'FR-4'),
  'B.05': extractSection(prdV2Raw, 'FR-5'),
  'M.03': extractSection(prdV2Raw, 'FR-5'),
  'B.06': extractSection(prdV2Raw, 'FR-6'),
  'B.07': extractSection(prdV2Raw, 'FR-7'),
  'M.04': extractSection(prdV2Raw, 'FR-8'),
  'M.05': extractSection(prdV2Raw, 'FR-8'),
}

// DocContext：NewTag 点击文档图标 → 触发顶层单例 DocPanel 打开
const DocContext = createContext<(code: string) => void>(() => {})

// 功能点标注：胶囊形"说明"按钮，hover 显示简短 tooltip，点击弹出 PRD 详情面板
// - 有 PRD 详情（FEATURE_DOCS 有映射）：蓝色可点击，点击调 openDoc(code)
// - 无 PRD 详情：灰色仅 hover 显示简短描述，不可点击
// Portal tooltip 用 createPortal 渲染到 body，position:fixed 定位，脱离祖先 overflow 裁剪
function NewTag({ code }: { code: string }) {
  const hostRef = useRef<HTMLButtonElement | null>(null)
  const openDoc = useContext(DocContext)
  const [tip, setTip] = useState<{ top: number; left: number; above: boolean; show: boolean }>({ top: 0, left: 0, above: true, show: false })

  const f = FEATURE_LABELS[code]
  if (!f) return null
  const typeShort = { A: '重构', B: '新增', M: '修改', R: '删除' }[f.type]
  const hasDoc = !!FEATURE_DOCS[code]

  const showTip = () => {
    const el = hostRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const TIP_W = 208
    const above = r.top > 120
    let left = r.left + r.width / 2 - TIP_W / 2
    if (left < 8) left = 8
    const vw = window.innerWidth
    if (left + TIP_W > vw - 8) left = vw - 8 - TIP_W
    setTip({ top: above ? r.top - 6 : r.bottom + 6, left, above, show: true })
  }
  const hideTip = () => setTip(p => ({ ...p, show: false }))

  return (
    <>
      <button
        ref={hostRef}
        type="button"
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
        onClick={hasDoc ? (e) => { e.stopPropagation(); openDoc(code) } : undefined}
        title={hasDoc ? '查看 PRD 详细说明' : `${typeShort}：${f.title}`}
        aria-label={`${code} ${typeShort}`}
        tabIndex={0}
        className={`absolute -top-1.5 right-0 inline-flex items-center gap-0.5 h-4 px-1 rounded-full bg-background/95 ring-1 text-[9px] transition-colors z-10 whitespace-nowrap font-medium shadow-sm ${
          hasDoc
            ? 'ring-primary/40 text-primary hover:bg-primary/10 hover:ring-primary/60 cursor-pointer'
            : 'ring-border text-muted-foreground hover:bg-accent cursor-help'
        }`}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
        说明
      </button>
      {tip.show && createPortal(
        <div
          style={{
            position: 'fixed',
            top: tip.top,
            left: tip.left,
            zIndex: 99999,
            transform: tip.above ? 'translateY(-100%)' : 'translateY(0)',
          }}
          className="w-52 rounded-md bg-foreground px-3 py-2 text-[11px] text-background shadow-xl ring-1 ring-black/10 pointer-events-none leading-snug"
        >
          <span className="font-semibold block mb-0.5">{code} {f.title}</span>
          <span className="text-background/85">{f.desc}</span>
          {hasDoc && <span className="block mt-1 text-background/60 text-[10px]">点击查看完整 PRD</span>}
        </div>,
        document.body,
      )}
    </>
  )
}

// 高亮外框：包裹 children 给虚线外框 + relative 定位上下文
// width: fit-content 让容器按内容宽度收缩，不会在 flex/grid 中塌陷
function NewBox({ code, children }: { code: string; children: React.ReactNode }) {
  const f = FEATURE_LABELS[code]
  if (!f) return <>{children}</>
  return (
    <div className="relative w-fit rounded-sm ring-1 ring-dashed ring-border/60">
      {children}
      <NewTag code={code} />
    </div>
  )
}

/**
 * DocPanel - 功能点 PRD 详情右侧滑出面板
 * 通过 FEATURE_DOCS 映射取出该功能点对应的 PRD 完整段落（业务规则/权限/交互/验收/边界），
 * 用 ReactMarkdown 渲染。Esc 关闭、点遮罩关闭、× 关闭。
 */
function DocPanel({ code, onClose }: { code: string | null; onClose: () => void }) {
  // Esc 关闭
  useEffect(() => {
    if (!code) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [code, onClose])

  if (!code) return null
  const f = FEATURE_LABELS[code]
  const doc = FEATURE_DOCS[code] || '暂无该功能点的 PRD 详细描述'
  const typeShort = f ? { A: '重构', B: '新增', M: '修改', R: '删除' }[f.type] : ''

  // 用 createPortal 渲染到 document.body，绕过父容器的 transform: scale()
  // （zoom 缩放会创建新包含块，导致 fixed inset-0 定位相对缩放容器而非视口，底部出现白块）
  return createPortal(
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      {/* 面板：右侧滑出，点击不冒泡到遮罩 */}
      <div
        className="absolute right-0 top-0 h-full w-[400px] max-w-[90vw] bg-background border-l border-border shadow-2xl flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-start justify-between gap-2 px-5 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">{code}</span>
              {f && <span className="text-[11px] text-muted-foreground">{typeShort}</span>}
            </div>
            <h3 className="mt-1 text-sm font-semibold text-foreground">{f?.title || '功能点详情'}</h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="关闭 (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {/* 内容：PRD 段落 markdown 渲染 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-foreground/90 prose-li:text-foreground/90 prose-th:text-foreground prose-td:text-foreground/80 prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

type ApprovalType = 'leave' | 'expense' | 'purchase' | 'seal'
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'processing'
type ViewAngle = 'personal' | 'team'
type PersonalTab = 'todo' | 'done' | 'cc' | 'mine'
type TeamTab = 'overview' | 'teamTodo' | 'memberDist' | 'rank'
type ViewMode = 'kanban' | 'list'

interface ApprovalItem {
  id: string
  title: string
  type: ApprovalType
  applicant: string
  applicantDept: string
  submitTime: string
  currentNode: string
  currentApprover: string
  status: ApprovalStatus
  urgent: boolean
  timeout: boolean
  stayHours: number
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

interface MemberStat {
  name: string
  todoCount: number
  doneThisWeek: number
  avgHours: number
  timeoutCount: number
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

const DEPARTMENTS = ['全公司', '产品部', '销售部', '设计部', '行政部', '法务部']

const MOCK_MEMBERS: MemberStat[] = [
  { name: '张三', todoCount: 5, doneThisWeek: 12, avgHours: 18, timeoutCount: 0 },
  { name: '李四', todoCount: 2, doneThisWeek: 6, avgHours: 42, timeoutCount: 2 },
  { name: '王五', todoCount: 1, doneThisWeek: 9, avgHours: 10, timeoutCount: 0 },
  { name: '赵六', todoCount: 3, doneThisWeek: 8, avgHours: 15, timeoutCount: 0 },
  { name: '孙七', todoCount: 1, doneThisWeek: 4, avgHours: 28, timeoutCount: 1 },
  { name: '周八', todoCount: 2, doneThisWeek: 3, avgHours: 54, timeoutCount: 2 },
  { name: '吴九', todoCount: 0, doneThisWeek: 11, avgHours: 6, timeoutCount: 0 },
  { name: '郑十', todoCount: 2, doneThisWeek: 7, avgHours: 22, timeoutCount: 0 },
]

const MOCK_TEAM_ITEMS: ApprovalItem[] = [
  { id: 'T-260801', title: '年假申请 3 天', type: 'leave', applicant: '张三', applicantDept: '产品部', submitTime: '08-01 09:12', currentNode: '部门经理审批', currentApprover: '李经理', status: 'pending', urgent: true, timeout: false, stayHours: 6, summary: '8/4-8/6 年假,事由:家庭出行' },
  { id: 'T-260802', title: '差旅报销 3,200', type: 'expense', applicant: '李四', applicantDept: '销售部', submitTime: '08-01 10:30', currentNode: '财务复核', currentApprover: '王财务', status: 'processing', urgent: false, timeout: false, stayHours: 4, amount: '3,200', summary: '上海客户拜访差旅,含机票+酒店' },
  { id: 'T-260803', title: '办公用品采购', type: 'purchase', applicant: '王五', applicantDept: '行政部', submitTime: '07-31 16:45', currentNode: '部门经理审批', currentApprover: '赵经理', status: 'pending', urgent: false, timeout: true, stayHours: 40, amount: '1,580', summary: 'Q3 季度办公用品补充采购' },
  { id: 'T-260804', title: '合同用印申请', type: 'seal', applicant: '赵六', applicantDept: '法务部', submitTime: '07-31 14:20', currentNode: '法务审核', currentApprover: '孙法务', status: 'processing', urgent: true, timeout: false, stayHours: 12, summary: '星河科技合作协议盖章,2 处用印' },
  { id: 'T-260805', title: '调休申请 1 天', type: 'leave', applicant: '孙七', applicantDept: '产品部', submitTime: '07-30 11:00', currentNode: '部门经理审批', currentApprover: '李经理', status: 'pending', urgent: false, timeout: false, stayHours: 8, summary: '8/8 调休,事由:个人事务' },
  { id: 'T-260806', title: '客户接待报销 860', type: 'expense', applicant: '周八', applicantDept: '销售部', submitTime: '07-30 09:30', currentNode: '部门经理审批', currentApprover: '钱大区', status: 'pending', urgent: false, timeout: true, stayHours: 54, amount: '860', summary: '7/28 客户来访接待餐饮' },
  { id: 'T-260807', title: '软件许可采购', type: 'purchase', applicant: '吴九', applicantDept: '设计部', submitTime: '07-29 15:10', currentNode: 'IT 审核', currentApprover: '郑 IT', status: 'processing', urgent: false, timeout: false, stayHours: 2, amount: '12,000', summary: '设计团队 Figma 团队版年付' },
  { id: 'T-260808', title: '授权书用印', type: 'seal', applicant: '郑十', applicantDept: '销售部', submitTime: '07-29 10:00', currentNode: '总经理审批', currentApprover: '总经理', status: 'processing', urgent: true, timeout: false, stayHours: 18, summary: '海蓝集团项目授权书,1 处用印' },
  { id: 'T-260809', title: '病假申请 2 天', type: 'leave', applicant: '冯十一', applicantDept: '产品部', submitTime: '07-28 14:00', currentNode: '部门经理审批', currentApprover: '李经理', status: 'approved', urgent: false, timeout: false, stayHours: 0, summary: '7/29-7/30 病假,已通过' },
  { id: 'T-260810', title: '月度团建报销 2,400', type: 'expense', applicant: '陈十二', applicantDept: '设计部', submitTime: '07-28 10:20', currentNode: '部门经理审批', currentApprover: '经理 L', status: 'pending', urgent: false, timeout: true, stayHours: 68, amount: '2,400', summary: '7/26 部门月度团建聚餐+KTV' },
  { id: 'T-260811', title: '外部培训费用报销 6,800', type: 'expense', applicant: '张三', applicantDept: '产品部', submitTime: '07-27 15:00', currentNode: '财务复核', currentApprover: '王财务', status: 'approved', urgent: false, timeout: false, stayHours: 0, amount: '6,800', summary: '产品经理大会差旅+培训认证费' },
  { id: 'T-260812', title: '市场物料采购 15,000', type: 'purchase', applicant: '李四', applicantDept: '销售部', submitTime: '07-27 09:00', currentNode: '部门经理审批', currentApprover: '钱大区', status: 'pending', urgent: false, timeout: true, stayHours: 72, amount: '15,000', summary: 'Q3 客户活动礼品物料印刷品采购' },
  { id: 'T-260813', title: '年假申请 5 天', type: 'leave', applicant: '李四', applicantDept: '销售部', submitTime: '07-26 16:30', currentNode: '部门经理审批', currentApprover: '钱大区', status: 'pending', urgent: false, timeout: false, stayHours: 16, summary: '8/10-8/14 年假' },
  { id: 'T-260814', title: '劳动合同用印', type: 'seal', applicant: '王五', applicantDept: '行政部', submitTime: '07-26 11:00', currentNode: 'HR 审核', currentApprover: 'HR 周', status: 'approved', urgent: false, timeout: false, stayHours: 0, summary: '新员工入职劳动合同 5 份' },
  { id: 'T-260815', title: '客户招待报销 1,250', type: 'expense', applicant: '陈十二', applicantDept: '设计部', submitTime: '07-25 14:30', currentNode: '部门经理审批', currentApprover: '经理 L', status: 'pending', urgent: false, timeout: false, stayHours: 22, amount: '1,250', summary: '客户招待合作方公司交流晚餐' },
  { id: 'T-260816', title: '调休申请半天', type: 'leave', applicant: '吴九', applicantDept: '设计部', submitTime: '07-25 10:00', currentNode: '部门经理审批', currentApprover: '经理 L', status: 'rejected', urgent: false, timeout: false, stayHours: 0, summary: '7/26 下午调休' },
  { id: 'T-260817', title: '设备采购 28,000', type: 'purchase', applicant: '冯十一', applicantDept: '产品部', submitTime: '07-24 16:00', currentNode: '总经理审批', currentApprover: '总经理', status: 'processing', urgent: false, timeout: false, stayHours: 10, amount: '28,000', summary: '测试手机测试机采购 10 台' },
  { id: 'T-260818', title: '保密协议用印', type: 'seal', applicant: '孙七', applicantDept: '产品部', submitTime: '07-24 10:20', currentNode: '法务审核', currentApprover: '孙法务', status: 'pending', urgent: false, timeout: false, stayHours: 6, summary: '供应商 NDA 用印' },
]

const MOCK_TIMELINE: TimelineNode[] = [
  { node: '发起申请', approver: '张三', time: '08-01 09:12', status: 'done', opinion: '提交申请' },
  { node: '直属主管审批', approver: '李主管', time: '08-01 09:45', status: 'done', opinion: '同意,注意工作交接' },
  { node: '部门经理审批', approver: '王经理', time: '—', status: 'current' },
  { node: 'HR 备案', approver: 'HR 系统', time: '—', status: 'pending' },
]

function formatStay(n: number) {
  if (n < 1) return '不足 1 小时'
  if (n < 24) return n + ' 小时'
  const d = Math.floor(n / 24); const h = n % 24
  return h > 0 ? d + ' 天 ' + h + ' 小时' : d + ' 天'
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1
  const w = 80, h = 24
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return x.toFixed(1) + ',' + y.toFixed(1)
  })
  const lastY = pts[pts.length - 1].split(',')[1]
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={parseFloat(lastY)} r="2" fill={color} />
    </svg>
  )
}

function StatCard({ label, value, trend, trendData, accent, onClick }: {
  label: string; value: string; trend: string; trendData: number[]; accent: string; onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="w-full text-left rounded border border-border bg-background p-4 shadow-soft hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
        </div>
        <Sparkline data={trendData} color={accent} />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{trend}</p>
    </button>
  )
}

function KanbanCard({ item, onClick, extraInfo }: {
  item: ApprovalItem; onClick: () => void; extraInfo?: string
}) {
  return (
    <button onClick={onClick} className="w-full text-left rounded border border-border bg-background p-3 shadow-soft hover:border-primary/50 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-foreground line-clamp-1">{item.title}</span>
        {item.urgent && (
          <span className="shrink-0 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">紧急</span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{item.summary}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{item.applicant}</span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{item.submitTime}</span>
      </div>
      {extraInfo && <p className="mt-1 text-[10px] text-primary">{extraInfo}</p>}
      {item.timeout && (
        <div className="mt-2 rounded bg-warning/10 px-2 py-1 text-[10px] text-warning">
          超时 {formatStay(item.stayHours)},请尽快审批
        </div>
      )}
    </button>
  )
}

function DetailDialog({ item, onClose, onAction, teamMode, showFeat = true }: {
  item: ApprovalItem | null; onClose: () => void
  onAction: (a: 'approve' | 'reject' | 'urge' | 'transfer') => void
  teamMode: boolean
  showFeat?: boolean
}) {
  const [opinion, setOpinion] = useState('')
  if (!item) return null
  const showSLA = teamMode && item.stayHours >= 24
  const WTag = ({ code, children }: { code: string; children: React.ReactNode }) => {
    if (!showFeat) return <>{children}</>
    return (
      <span className="relative inline-flex">
        {children}
        <NewTag code={code} />
      </span>
    )
  }
  const WBox = ({ code, children }: { code: string; children: React.ReactNode }) => {
    if (!showFeat) return <>{children}</>
    return (
      <span className="relative inline-flex">
        {children}
        <NewTag code={code} />
      </span>
    )
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[680px] max-h-[85vh] overflow-auto rounded border border-border bg-background shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-medium text-foreground">{item.title}</h3>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_TAG[item.status]}`}>{STATUS_LABEL[item.status]}</span>
            {item.urgent && <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">紧急</span>}
            {teamMode && <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">发起人:{item.applicant}/{item.applicantDept}</span>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {showSLA && (
            <WBox code="M.04">
              <div className="rounded border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                ⚠ 当前节点【{item.currentNode}】已停留 {formatStay(item.stayHours)},超过 SLA(24 小时),建议催办
              </div>
            </WBox>
          )}
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">申请信息</h4>
            <div className="rounded border border-border bg-muted/30 p-3 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <div><span className="text-muted-foreground">单号:</span> <span className="text-foreground tabular-nums">{item.id}</span></div>
                <div><span className="text-muted-foreground">类型:</span> <span className="text-foreground">{TYPE_LABEL[item.type]}</span></div>
                <div><span className="text-muted-foreground">发起人:</span> <span className="text-foreground">{item.applicant} ({item.applicantDept})</span></div>
                <div><span className="text-muted-foreground">提交时间:</span> <span className="text-foreground tabular-nums">{item.submitTime}</span></div>
                {item.amount && <div><span className="text-muted-foreground">金额:</span> <span className="text-foreground font-medium tabular-nums">{item.amount}</span></div>}
                <WTag code="M.04">
                  <div><span className="text-muted-foreground">当前节点:</span> <span className="text-primary">{item.currentNode}</span></div>
                </WTag>
                {teamMode && <WTag code="M.04"><div><span className="text-muted-foreground">当前审批人:</span> <span className="text-foreground">{item.currentApprover}</span></div></WTag>}
                {teamMode && <WTag code="M.04"><div><span className="text-muted-foreground">节点停留:</span> <span className={item.stayHours >= 24 ? 'text-destructive' : 'text-foreground'}>{formatStay(item.stayHours)}</span></div></WTag>}
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <span className="text-muted-foreground">事由说明:</span>
                <p className="mt-1 text-foreground">{item.summary}</p>
              </div>
            </div>
          </section>
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">审批轨迹</h4>
            <div className="relative pl-4">
              <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
              {MOCK_TIMELINE.map((n, i) => (
                <div key={i} className="relative pb-3 last:pb-0">
                  <div className={`absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-background ${n.status === 'done' ? 'bg-success' : n.status === 'current' ? 'bg-primary ring-2 ring-primary/30' : 'bg-muted-foreground/30'}`} />
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${n.status === 'current' ? 'font-medium text-primary' : 'text-foreground'}`}>{n.node}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{n.time}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">审批人:{n.approver}{n.opinion ? ' · ' + n.opinion : ''}</div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {teamMode ? '管理者备注(仅催办/转交,不代替审批)' : '审批意见'}
            </h4>
            <textarea value={opinion} onChange={e => setOpinion(e.target.value)}
              rows={teamMode ? 2 : 3}
              placeholder={teamMode ? '催办备注(可选,将发送给当前审批人)' : '请输入审批意见(可选)'}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" />
          </section>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onClose} className="rounded border border-border bg-background px-4 py-1.5 text-sm text-foreground hover:bg-muted transition-colors">取消</button>
          {teamMode ? (
            <WTag code="M.05">
              <>
                <button onClick={() => onAction('transfer')} disabled title="转交能力即将上线,敬请期待"
                  className="rounded border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground opacity-60 cursor-not-allowed">转交(即将上线)</button>
                <button onClick={() => onAction('urge')}
                  className="rounded bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors">催办</button>
              </>
            </WTag>
          ) : (
            <>
              <button onClick={() => onAction('reject')} className="rounded border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-sm text-destructive hover:bg-destructive/20 transition-colors">驳回</button>
              <button onClick={() => onAction('approve')} className="rounded bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors">同意</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl mb-3">✓</div>
      <p className="text-sm">{title}</p>
      <p className="mt-1 text-xs">{sub}</p>
    </div>
  )
}

function ListView({ items, teamMode, checked, setChecked, allChecked, toggleCheck, setSelected, onBatch, showFeat = true }: {
  items: ApprovalItem[]; teamMode: boolean
  checked: Set<string>; setChecked: (s: Set<string>) => void
  allChecked: boolean; toggleCheck: (id: string) => void
  setSelected: (i: ApprovalItem) => void; onBatch: () => void
  showFeat?: boolean
}) {
  const hasChecks = checked.size > 0
  const LTag = ({ code, children }: { code: string; children: React.ReactNode }) => {
    if (!showFeat) return <>{children}</>
    return <span className="relative inline-flex">{children}<NewTag code={code} /></span>
  }
  return (
    <div className="rounded border border-border bg-background overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/40 border-b border-border">
            <th className="w-10 px-3 py-2.5 text-left">
              {!teamMode && <input type="checkbox" checked={allChecked} onChange={() => {
                if (allChecked) setChecked(new Set())
                else setChecked(new Set(items.map(i => i.id)))
              }} className="rounded border-border" />}
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">标题</th>
            {teamMode && <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"><LTag code="B.05">发起人/部门</LTag></th>}
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">类型</th>
            {teamMode && <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"><LTag code="B.05">当前审批人</LTag></th>}
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">提交时间</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">当前节点</th>
            {teamMode && <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"><LTag code="B.05">停留</LTag></th>}
            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">状态</th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={i.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 1 ? 'bg-muted/10' : ''} ${checked.has(i.id) ? 'bg-primary/5' : ''}`}>
              <td className="px-3 py-2.5">
                {!teamMode && <input type="checkbox" checked={checked.has(i.id)} onChange={() => toggleCheck(i.id)} className="rounded border-border" />}
              </td>
              <td className="px-3 py-2.5">
                <button onClick={() => setSelected(i)} className="flex items-center gap-1.5 text-foreground hover:text-primary">
                  {i.urgent && <span className="text-destructive text-xs">●</span>}
                  <span className="font-medium">{i.title}</span>
                </button>
              </td>
              {teamMode && <td className="px-3 py-2.5 text-foreground text-xs">{i.applicant}<span className="text-muted-foreground ml-1">/{i.applicantDept}</span></td>}
              <td className="px-3 py-2.5"><span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLOR[i.type]}`}>{TYPE_LABEL[i.type]}</span></td>
              {teamMode && <td className="px-3 py-2.5 text-foreground text-xs">{i.currentApprover}</td>}
              <td className="px-3 py-2.5 text-muted-foreground tabular-nums text-xs">{i.submitTime}</td>
              <td className="px-3 py-2.5 text-primary text-xs">{i.currentNode}</td>
              {teamMode && <td className="px-3 py-2.5"><span className={`text-xs tabular-nums ${i.stayHours >= 24 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>{formatStay(i.stayHours)}</span></td>}
              <td className="px-3 py-2.5">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_TAG[i.status]}`}>{STATUS_LABEL[i.status]}</span>
                {i.timeout && <span className="ml-1 text-[10px] text-warning">超时</span>}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-1">
                  {teamMode ? (
                    <LTag code="B.05">
                      <>
                        <button onClick={() => setSelected(i)} className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary hover:bg-primary/20 transition-colors">催办</button>
                        <button onClick={() => setSelected(i)} disabled title="转交即将上线" className="rounded border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground opacity-60 cursor-not-allowed">转交</button>
                      </>
                    </LTag>
                  ) : i.status === 'pending' ? (
                    <>
                      <button onClick={() => setSelected(i)} className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary hover:bg-primary/20 transition-colors">同意</button>
                      <button onClick={() => setSelected(i)} className="rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive hover:bg-destructive/20 transition-colors">驳回</button>
                    </>
                  ) : null}
                  <button onClick={() => setSelected(i)} className="rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">详情</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-muted/20">
        <span className="text-xs text-muted-foreground">共 {items.length} 条</span>
        <div className="flex items-center gap-3">
          {teamMode && hasChecks && showFeat && (<span className="text-[10px] rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 tabular-nums">新增 · B.05 批量催办/转交入口(待接入)</span>)}
          {!teamMode && hasChecks && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">已选 {checked.size} 项</span>
              <button onClick={onBatch} className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90 transition-colors">批量同意</button>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button className="rounded border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40" disabled>上一页</button>
            <button className="rounded bg-primary px-2.5 py-1 text-xs text-primary-foreground">1</button>
            <button className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:bg-muted">2</button>
            <button className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:bg-muted">3</button>
            <button className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground hover:text-foreground">下一页</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalCenterV2({ __showFeat = true }: { __showFeat?: boolean }) {
  const [angle, setAngle] = useState<ViewAngle>('team')
  const [pTab, setPTab] = useState<PersonalTab>('todo')
  const [tTab, setTTSSTab] = useState<TeamTab>('overview')
  const [view, setView] = useState<ViewMode>('kanban')
  const [dept, setDept] = useState('全公司')
  const [memberFilter, setMemberFilter] = useState('全部成员')
  const [selected, setSelected] = useState<ApprovalItem | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<ApprovalType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all')
  const [timeoutOnly, setTimeoutOnly] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // DocPanel：当前打开的功能点编号（null = 面板关闭）。NewTag 点击 📄 → openDoc(code)
  const [docCode, setDocCode] = useState<string | null>(null)
  const openDoc = useCallback((code: string) => setDocCode(code), [])

  // showFeat 开关已上移到 Host header（缩放控件左侧），通过 __showFeat prop 传入；
  // 不建议在页面内自己再存，保持按路由+版本隔离（Host 的 localStorage key）。
  const showFeat = !!__showFeat

  // 包裹器: box=true 时 NewBox 内部会加 NewTag，Tag 只返回 children；否则 Tag 自己包 relative + NewTag
  const Tag = ({ code, children, box }: { code: string; children: React.ReactNode; box?: boolean }) => {
    if (!showFeat) return <>{children}</>
    if (box) return <NewBox code={code}>{children}</NewBox>
    return (
      <span className="relative inline-flex">
        {children}
        <NewTag code={code} />
      </span>
    )
  }

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200) }

  const pCounts: Record<PersonalTab, number> = { todo: 5, done: 23, cc: 8, mine: 12 }
  const teamMembers = MOCK_MEMBERS

  const teamItems = useMemo(() => {
    let list = MOCK_TEAM_ITEMS
    if (dept !== '全公司') list = list.filter(i => i.applicantDept === dept)
    if (memberFilter !== '全部成员') list = list.filter(i => i.applicant === memberFilter)
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter)
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter)
    if (timeoutOnly) list = list.filter(i => i.timeout)
    return list
  }, [dept, memberFilter, typeFilter, statusFilter, timeoutOnly])

  const teamStats = useMemo(() => {
    const pending = teamItems.filter(i => i.status === 'pending' || i.status === 'processing').length
    const timeout = teamItems.filter(i => i.timeout).length
    const avgHours = Math.round(teamItems.reduce((s, i) => s + i.stayHours, 0) / Math.max(teamItems.length, 1))
    const doneW = teamItems.filter(i => i.status === 'approved').length
    return { pending, timeout, avgHours, doneW }
  }, [teamItems])

  const personalItems = useMemo(() => {
    const personal: ApprovalItem[] = MOCK_TEAM_ITEMS.slice(0, 8).map(i => ({ ...i, currentApprover: '我' }))
    let list = personal
    if (pTab === 'todo') list = list.filter(i => i.status === 'pending' || i.status === 'processing')
    if (pTab === 'done') list = list.filter(i => i.status === 'approved' || i.status === 'rejected')
    if (pTab === 'cc') list = list.slice(0, 3)
    if (pTab === 'mine') list = list.slice(0, 6)
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter)
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter)
    return list
  }, [pTab, typeFilter, statusFilter])

  const typeGroups = (items: ApprovalItem[]) => {
    const g: Record<ApprovalType, ApprovalItem[]> = { leave: [], expense: [], purchase: [], seal: [] }
    items.forEach(i => g[i.type].push(i))
    return g
  }
  const nodeGroups = (items: ApprovalItem[]) => {
    const g: Record<string, ApprovalItem[]> = {}
    items.forEach(i => { (g[i.currentNode] || (g[i.currentNode] = [])).push(i) })
    return g
  }
  const memberGroups = (items: ApprovalItem[]) => {
    const g: Record<string, ApprovalItem[]> = {}
    items.forEach(i => { (g[i.applicant] || (g[i.applicant] = [])).push(i) })
    return g
  }

  const toggleCheck = (id: string) => setChecked(prev => {
    const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n
  })

  const onApproveSelected = () => {
    if (checked.size === 0) return
    showToast('已批量同意 ' + checked.size + ' 项审批')
    setChecked(new Set())
  }
  const onUrgeTimeout = () => {
    const n = teamItems.filter(i => i.timeout).length
    showToast(n > 0 ? '已对 ' + n + ' 项超时审批发起催办' : '当前没有超时审批')
  }

  const allCheckedTeam = teamItems.length > 0 && checked.size === teamItems.length
  const allCheckedPersonal = personalItems.length > 0 && checked.size === personalItems.length
  const sortedMembers = [...teamMembers].sort((a, b) => b.doneThisWeek - a.doneThisWeek)
  const maxDone = Math.max(...sortedMembers.map(m => m.doneThisWeek), 1)

  const handleAction = (act: 'approve' | 'reject' | 'urge' | 'transfer') => {
    const map = { approve: '已同意审批', reject: '已驳回审批', urge: '已催办当前审批人', transfer: '转交功能占位' }
    showToast(map[act])
    setSelected(null)
  }

  return (
    <DocContext.Provider value={openDoc}>
    <div className="min-h-[640px] bg-muted/20 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">审批中心 <span className="text-xs font-normal text-muted-foreground ml-2 tabular-nums">V2 · 双视角版</span></h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {angle === 'personal' ? '统一处理各业务线审批事项' : '部门团队审批总览 · 进度监控与效率推进'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* B.08 显示新增功能点开关已移到 Host 顶部栏(缩放控件左侧)；筛选条件/仅看超时等功能点仍标注在原处 */}
          {angle === 'team' && (
            <>
              <Tag code="M.01">
                <select value={dept} onChange={e => setDept(e.target.value)} className="rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary">
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </Tag>
              <select value={memberFilter} onChange={e => setMemberFilter(e.target.value)} className="rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary">
                <option>全部成员</option>
                {teamMembers.map(m => <option key={m.name}>{m.name}</option>)}
              </select>
            </>
          )}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as ApprovalType | 'all')} className="rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary">
            <option value="all">全部类型</option><option value="leave">请假</option><option value="expense">报销</option><option value="purchase">采购</option><option value="seal">用印</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ApprovalStatus | 'all')} className="rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary">
            <option value="all">全部状态</option><option value="pending">待审批</option><option value="processing">审批中</option><option value="approved">已通过</option><option value="rejected">已驳回</option>
          </select>
          {angle === 'team' && (
            <Tag code="M.02">
              <label className="flex items-center gap-1 text-xs text-foreground">
                <input type="checkbox" checked={timeoutOnly} onChange={e => setTimeoutOnly(e.target.checked)} className="rounded border-border" />
                仅看超时
              </label>
            </Tag>
          )}
        </div>
      </div>

      {/* STAT CARDS: personal vs team */}
      {angle === 'personal' ? (
        <div className="mb-4 grid grid-cols-4 gap-3">
          <StatCard label="待办事项" value={String(pCounts.todo)} trend="较昨日 +2" trendData={[3, 4, 3, 5, 4, 5, 5]} accent="hsl(243 75% 59%)" />
          <StatCard label="超时未处理" value="2" trend="需尽快处理" trendData={[1, 0, 2, 1, 3, 2, 2]} accent="hsl(38 92% 50%)" />
          <StatCard label="今日已处理" value="8" trend="较昨日 +3" trendData={[3, 5, 4, 6, 5, 7, 8]} accent="hsl(142 71% 45%)" />
          <StatCard label="本周已完成" value="47" trend="本周进度 78%" trendData={[8, 12, 9, 11, 7, 0, 0]} accent="hsl(200 80% 50%)" />
        </div>
      ) : (
        <Tag code="B.01" box>
          <div className="mb-4 grid grid-cols-4 gap-3">
            <StatCard label="部门待办总数" value={String(teamStats.pending)}
              trend={'较昨日 ' + (teamStats.pending - 3 >= 0 ? '+' : '') + (teamStats.pending - 3)}
              trendData={[10, 12, 11, 13, 12, 14, teamStats.pending]} accent="hsl(243 75% 59%)" />
            <StatCard label="超时未处理" value={String(teamStats.timeout)}
              trend="点击一键催办" onClick={onUrgeTimeout}
              trendData={[2, 1, 3, 2, 4, 3, teamStats.timeout]} accent="hsl(38 92% 50%)" />
            <StatCard label="平均处理时长" value={teamStats.avgHours + 'h'}
              trend="同比上周 -6h"
              trendData={[32, 30, 28, 26, 24, 22, Math.round(teamStats.avgHours * 1.3)]} accent="hsl(142 71% 45%)" />
            <StatCard label="本周通过" value={String(teamStats.doneW * 3)}
              trend="本周进度 72%"
              trendData={[5, 7, 8, 10, 9, 12, teamStats.doneW * 3]} accent="hsl(200 80% 50%)" />
          </div>
        </Tag>
      )}

      {/* TOP ANGLE TAB: 个人 / 团队 */}
      <Tag code="A.01" box>
        <div className="mb-2 flex items-center gap-1 border-b border-border">
          {([
            { k: 'personal' as const, l: '个人视角' },
            { k: 'team' as const, l: '团队视角' },
          ]).map(a => (
            <Tag code="A.01">
              <button key={a.k} onClick={() => setAngle(a.k)}
                className={`relative px-3 py-2 text-sm transition-colors ${angle === a.k ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                {a.l}
                {angle === a.k && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
              </button>
            </Tag>
          ))}
        </div>
      </Tag>

      {/* SUB TABS: 按视角 */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 border-b border-border flex-1">
          {angle === 'personal' ? (
            ([
              { k: 'todo' as const, l: '待办' },
              { k: 'done' as const, l: '已办' },
              { k: 'cc' as const, l: '抄送我' },
              { k: 'mine' as const, l: '我发起的' },
            ]).map(t => (
              <button key={t.k} onClick={() => setPTab(t.k)}
                className={`relative px-3 py-2 text-sm transition-colors ${pTab === t.k ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                {t.l}
                {pCounts[t.k] > 0 && <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${pTab === t.k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{pCounts[t.k]}</span>}
                {pTab === t.k && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
              </button>
            ))
          ) : (
            <Tag code="B.02">
              {([
                { k: 'overview' as const, l: '总览' },
                { k: 'teamTodo' as const, l: '团队待办' },
                { k: 'memberDist' as const, l: '成员分布' },
                { k: 'rank' as const, l: '效率排行' },
              ]).map(t => (
                <Tag key={t.k} code="B.02">
                  <button onClick={() => setTTSSTab(t.k)}
                    className={`relative px-3 py-2 text-sm transition-colors ${tTab === t.k ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                    {t.l}
                    {tTab === t.k && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
                  </button>
                </Tag>
              ))}
            </Tag>
          )}
        </div>

        {((angle === 'team' && (tTab === 'teamTodo' || tTab === 'memberDist')) ||
          (angle === 'personal' && (pTab === 'todo' || pTab === 'mine'))) && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 p-0.5 rounded border border-border bg-muted/40">
              <button onClick={() => setView('kanban')}
                className={`px-3 py-1 text-xs rounded-sm transition-all ${view === 'kanban' ? 'bg-background text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}>看板视图</button>
              <button onClick={() => setView('list')}
                className={`px-3 py-1 text-xs rounded-sm transition-all ${view === 'list' ? 'bg-background text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'}`}>列表视图</button>
            </div>
          </div>
        )}
      </div>

      {/* MAIN: 按 angle / tab 分支渲染 */}
      {angle === 'personal' ? (
        renderPersonal()
      ) : tTab === 'overview' ? (
        renderOverview()
      ) : tTab === 'teamTodo' ? (
        renderTeamTodo()
      ) : tTab === 'memberDist' ? (
        renderMemberDist()
      ) : (
        renderRank()
      )}

      <DetailDialog item={selected} onClose={() => setSelected(null)} onAction={handleAction} teamMode={angle === 'team'} showFeat={showFeat} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded bg-foreground px-4 py-2 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}

      {/* 功能点 PRD 详情面板：右侧滑出，NewTag 点击 📄 触发，Esc/点遮罩/× 关闭 */}
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </div>
    </DocContext.Provider>
  )

  function renderPersonal() {
    if (personalItems.length === 0) return <EmptyState title="暂无审批事项" sub="该分类下当前没有需要处理的审批" />
    const g = typeGroups(personalItems)
    if (view === 'kanban') {
      return (
        <div className="grid grid-cols-4 gap-3">
          {(Object.keys(TYPE_LABEL) as ApprovalType[]).map(t => (
            <div key={t} className="rounded border border-border bg-background/50 p-2">
              <div className="flex items-center justify-between px-1 py-1.5 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLOR[t]}`}>{TYPE_LABEL[t]}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{g[t].length}</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                {g[t].map(i => <KanbanCard key={i.id} item={i} onClick={() => setSelected(i)} />)}
                {g[t].length === 0 && <div className="py-8 text-center text-[11px] text-muted-foreground">暂无</div>}
              </div>
            </div>
          ))}
        </div>
      )
    }
    return <ListView items={personalItems} teamMode={false} checked={checked} setChecked={setChecked} allChecked={allCheckedPersonal} toggleCheck={toggleCheck} setSelected={setSelected} onBatch={onApproveSelected} showFeat={showFeat} />
  }

  function renderOverview() {
    const g = typeGroups(teamItems)
    const byStatusPending = teamItems.filter(i => i.status === 'pending' || i.status === 'processing').length
    const byStatusTimeout = teamItems.filter(i => i.timeout).length
    const memberMaxTodo = Math.max(...teamMembers.map(m => m.todoCount), 1)
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-3">
          <Tag code="B.03" box>
            <div className="rounded border border-border bg-background p-4 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">成员待办分布</h3>
                <span className="text-[11px] text-muted-foreground">点击成员查看该成员看板</span>
              </div>
              <div className="space-y-2">
                {teamMembers.map(m => (
                  <button key={m.name}
                    onClick={() => { setMemberFilter(m.name); setTTSSTab('memberDist') }}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors text-left">
                    <div className="w-14 text-sm text-foreground tabular-nums shrink-0">{m.name}</div>
                    <div className="flex-1 h-5 rounded bg-muted/40 overflow-hidden">
                      <div className="h-full rounded bg-primary/80" style={{ width: (m.todoCount / memberMaxTodo * 100) + '%' }} />
                    </div>
                    <div className="w-20 text-right text-xs font-medium text-foreground tabular-nums">{m.todoCount} 待办</div>
                    {m.timeoutCount > 0 && <span className="text-[10px] rounded bg-destructive/15 text-destructive px-1.5 py-0.5 whitespace-nowrap">{m.timeoutCount}超时</span>}
                  </button>
                ))}
              </div>
            </div>
          </Tag>
          <div className="rounded border border-border bg-background p-4 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">最近待办 TOP 6</h3>
              <span className="text-[11px] text-muted-foreground">共 {byStatusPending} 项进行中 · {byStatusTimeout} 项超时</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {teamItems.slice(0, 6).map(i => (
                <KanbanCard key={i.id} item={i} onClick={() => setSelected(i)}
                  extraInfo={'审批人:' + i.currentApprover} />
              ))}
            </div>
          </div>
        </div>
        <Tag code="B.04" box>
          <div className="space-y-3">
            <div className="rounded border border-border bg-background p-4 shadow-soft">
              <h3 className="text-sm font-medium text-foreground mb-3">审批类型分布</h3>
              <div className="space-y-2">
                {(Object.keys(TYPE_LABEL) as ApprovalType[]).map(t => {
                  const n = g[t].length; const total = teamItems.length || 1
                  return (
                    <div key={t}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLOR[t]}`}>{TYPE_LABEL[t]}</span>
                        </span>
                        <span className="tabular-nums text-foreground">{n}</span>
                      </div>
                      <div className="h-2 rounded bg-muted/40 overflow-hidden">
                        <div className="h-full rounded bg-primary/80" style={{ width: (n / total * 100) + '%' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="rounded border border-border bg-background p-4 shadow-soft">
              <h3 className="text-sm font-medium text-foreground mb-3">管理者快捷操作</h3>
              <div className="space-y-2 text-xs">
                <button onClick={() => { setTTSSTab('teamTodo'); setTimeoutOnly(true) }}
                  className="w-full rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive hover:bg-destructive/20 transition-colors text-left">
                  处理超时审批 ({teamItems.filter(i => i.timeout).length}项)
                </button>
                <button onClick={() => setTTSSTab('rank')}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-foreground hover:bg-muted transition-colors text-left">
                  查看成员效率排行
                </button>
                <button onClick={() => setTTSSTab('memberDist')}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-foreground hover:bg-muted transition-colors text-left">
                  按成员查看分布看板
                </button>
              </div>
            </div>
          </div>
        </Tag>
      </div>
    )
  }

  function renderTeamTodo() {
    if (teamItems.length === 0) return <EmptyState title="团队当前无待办" sub="筛选条件下暂无审批事项,可切换部门或清空筛选" />
    if (view === 'kanban') {
      const g = nodeGroups(teamItems)
      const cols = Object.keys(g)
      return (
        <Tag code="M.03" box>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(' + Math.min(cols.length, 4) + ', minmax(0,1fr))' }}>
            {cols.map(colName => (
              <div key={colName} className="rounded border border-border bg-background/50 p-2">
                <div className="flex items-center justify-between px-1 py-1.5 mb-1">
                  <span className="text-xs font-medium text-primary line-clamp-1">{colName}</span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">{g[colName].length}</span>
                </div>
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5">
                  {g[colName].map(i => (
                    <KanbanCard key={i.id} item={i} onClick={() => setSelected(i)}
                      extraInfo={'审批人:' + i.currentApprover + ' · ' + formatStay(i.stayHours)} />
                  ))}
                  {g[colName].length === 0 && <div className="py-8 text-center text-[11px] text-muted-foreground">暂无</div>}
                </div>
              </div>
            ))}
          </div>
        </Tag>
      )
    }
    return <Tag code="B.05" box><ListView items={teamItems} teamMode={true} checked={checked} setChecked={setChecked} allChecked={allCheckedTeam} toggleCheck={toggleCheck} setSelected={setSelected} onBatch={onApproveSelected} showFeat={showFeat} /></Tag>
  }

  function renderMemberDist() {
    const groups = memberGroups(teamItems)
    const cols = teamMembers.map(m => m.name)
    return (
      <Tag code="B.06" box>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(' + Math.min(cols.length, 6) + ', minmax(0,1fr))' }}>
          {cols.map(name => {
            const list = groups[name] || []
            const m = teamMembers.find(x => x.name === name)
            return (
              <div key={name} className="rounded border border-border bg-background/50 p-2">
                <div className="px-1 py-1.5 mb-1 border-b border-border">
                  <div className="text-sm font-medium text-foreground">{name}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">待办 {m?.todoCount ?? 0} · 超时 {m?.timeoutCount ?? 0}</div>
                </div>
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5">
                  {list.map(i => <KanbanCard key={i.id} item={i} onClick={() => setSelected(i)}
                    extraInfo={'停留 ' + formatStay(i.stayHours)} />)}
                  {list.length === 0 && <div className="py-12 text-center text-[11px] text-muted-foreground">无待办 ✓</div>}
                </div>
              </div>
            )
          })}
        </div>
      </Tag>
    )
  }

  function renderRank() {
    return (
      <Tag code="B.07" box>
        <div className="rounded border border-border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="w-12 px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">排名</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">成员</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">本周处理</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">平均时长</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">超时数</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-2/5">处理数对比</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((m, idx) => (
                <tr key={m.name} className={`border-b border-border last:border-0 hover:bg-muted/10 ${idx % 2 === 1 ? 'bg-muted/10' : ''}`}>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex w-5 h-5 items-center justify-center rounded text-[11px] font-semibold tabular-nums ${
                      idx === 0 ? 'bg-warning/20 text-warning' :
                      idx === 1 ? 'bg-muted text-muted-foreground/80' :
                      idx === 2 ? 'bg-orange-400/20 text-orange-600' :
                      'bg-muted text-muted-foreground'
                    }`}>{idx + 1}</span>
                  </td>
                  <td className="px-3 py-2.5 text-foreground font-medium">{m.name}</td>
                  <td className="px-3 py-2.5 tabular-nums">{m.doneThisWeek}</td>
                  <td className={`px-3 py-2.5 tabular-nums ${m.avgHours > 24 ? 'text-destructive' : 'text-foreground'}`}>{m.avgHours}h</td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {m.timeoutCount > 0
                      ? <span className="rounded bg-destructive/15 text-destructive px-1.5 py-0.5 text-[10px] font-medium">{m.timeoutCount}</span>
                      : <span className="text-success text-[11px]">0</span>}
                  </td>
                  <td className="px-3 py-2.5"><div className="h-4 rounded bg-muted/40 overflow-hidden w-full"><div className="h-full rounded bg-primary/80" style={{ width: (m.doneThisWeek / maxDone * 100) + '%' }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tag>
    )
  }
}

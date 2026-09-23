// [功能标注] PRD FR-6 配置管理（运行时资源 + 租户配额 + 回收策略）
import { useState } from "react";
import { NewTag } from "../feature-tags";
import {
  Pencil,
  Check,
  X,
  Users,
  Box,
  Clock,
  Moon,
  Cpu,
  HardDrive,
  Timer,
  Database,
  Download,
} from "lucide-react";

// ─── 类型定义 ─────────────────────────────────────────────────────────────────────────

/** 管理员可调整的运行与资源参数 + 审批策略 */
interface RuntimeConfig {
  /** 每用户子智能体并发上限 */
  userSubagentConcurrency: number;
  /** 单用户运行时环境配额 */
  userSandboxQuota: number;
  /** 运行时环境最长生命周期（小时） */
  maxLifecycleHours: number;
  /** 运行时环境闲置回收期限（分钟） */
  idleReclamationMinutes: number;
  /** 新生成审批卡冻结等待期限（秒） */
  approvalWaitSeconds: number;
  /** Agent 会话数据保留期限（天） */
  auditRetentionDays: number;
}

const DEFAULT_RUNTIME: RuntimeConfig = {
  userSubagentConcurrency: 8,
  userSandboxQuota: 3,
  maxLifecycleHours: 24,
  idleReclamationMinutes: 15,
  approvalWaitSeconds: 300,
  auditRetentionDays: 180,
};

const RUNTIME_KEY = "aiops.runtimeConfig";

function load(key: string, fallback: RuntimeConfig): RuntimeConfig {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch {
    /* 忽略解析错误 */
  }
  return fallback;
}

// 运行时最小资源保障（平台托管，只读，不暴露编辑入口）
const RUNTIME_RESOURCE = { cpu: 2, memory: 4 }; // 核 / GiB

// ─── 可编辑字段定义 ───────────────────────────────────────────────────────────────────

interface EditableField {
  key: keyof RuntimeConfig;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  icon: typeof Users;
  desc: string;
}

const QUOTA_FIELDS: EditableField[] = [
  {
    key: "userSubagentConcurrency",
    label: "子智能体并发数",
    unit: "个",
    min: 1,
    max: 32,
    step: 1,
    icon: Users,
    desc: "单个用户同时运行的子智能体数量上限，保障多租户公平性。",
  },
  {
    key: "userSandboxQuota",
    label: "运行时上限",
    unit: "个",
    min: 1,
    max: 20,
    step: 1,
    icon: Box,
    desc: "单个用户可同时占用的运行时环境数量上限。",
  },
];

const RECLAIM_FIELDS: EditableField[] = [
  {
    key: "maxLifecycleHours",
    label: "最长生命周期",
    unit: "小时",
    min: 1,
    max: 168,
    step: 1,
    icon: Clock,
    desc: "单个运行时环境的最长存活时长，超时强制回收，防止资源泄漏。",
  },
  {
    key: "idleReclamationMinutes",
    label: "闲置回收期限",
    unit: "分钟",
    min: 1,
    max: 1440,
    step: 1,
    icon: Moon,
    desc: "运行时环境闲置超过该时长后自动回收，及时释放计算资源。",
  },
];

const APPROVAL_FIELDS: EditableField[] = [
  {
    key: "approvalWaitSeconds",
    label: "审批等待期限",
    unit: "秒",
    min: 0,
    max: 86400,
    step: 1,
    icon: Timer,
    desc: "新生成的审批卡冻结等待期限。已存在的审批卡保持原有期限不变。",
  },
];

const AUDIT_FIELDS: EditableField[] = [
  {
    key: "auditRetentionDays",
    label: "保留期限",
    unit: "天",
    min: 1,
    max: 3650,
    step: 1,
    icon: Database,
    desc: "Agent 会话存入数据库的保留时间，用于后续故障处理的按需导出。缩短期限会使更早的会话数据进入后台清理范围。本页不展示会话记录。",
  },
];

// ─── 主组件 ───────────────────────────────────────────────────────────────────────────

export function ConfigManagementPage() {
  const [config, setConfig] = useState<RuntimeConfig>(() => load(RUNTIME_KEY, DEFAULT_RUNTIME));
  const [savedAtByKey, setSavedAtByKey] = useState<Record<string, string>>({});

  const persist = (next: RuntimeConfig, key: keyof RuntimeConfig) => {
    setConfig(next);
    localStorage.setItem(RUNTIME_KEY, JSON.stringify(next));
    setSavedAtByKey((prev) => ({ ...prev, [key]: new Date().toLocaleString("zh-CN") }));
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 顶部操作栏 */}
      <div className="bg-[#FFFFFF] border-b border-[#DCDFE6] px-[24px] py-[12px] shrink-0 flex items-center justify-between">
        <h1 className="text-[16px] font-semibold text-[#303133] flex items-center gap-[6px]">
          配置管理 <NewTag code="FR-6" />
        </h1>
        <span className="text-[12px] text-[#909399]">点击卡片右上角「编辑」进行修改</span>
      </div>

      {/* 主体内容（可滚动） */}
      <div className="flex-1 min-h-0 overflow-y-auto p-[24px]">
        <div className="max-w-[1100px] mx-auto space-y-[24px]">
          {/* 运行时资源（平台托管，只读） */}
          <Section title="运行时资源">
            <div className="bg-[#F5F7FA] border border-dashed border-[#DCDFE6] rounded-[8px] p-[16px] flex items-center justify-between flex-wrap gap-[12px]">
              <div className="min-w-0">
                <h3 className="text-[14px] font-medium text-[#303133] mb-[4px]">运行时资源保障</h3>
                <p className="text-[12px] text-[#909399]">平台为每个诊断运行环境提供的最小资源保障。</p>
              </div>
              <div className="flex items-center gap-[24px] shrink-0">
                <div className="flex items-center gap-[8px]">
                  <Cpu className="w-[16px] h-[16px] text-[#409EFF]" />
                  <span className="text-[14px] text-[#303133]">
                    CPU <span className="font-medium">{RUNTIME_RESOURCE.cpu} 核</span>
                  </span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <HardDrive className="w-[16px] h-[16px] text-[#409EFF]" />
                  <span className="text-[14px] text-[#303133]">
                    内存 <span className="font-medium">{RUNTIME_RESOURCE.memory} GiB</span>
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* 租户配额 */}
          <Section title="并发与配额" subtitle="控制单用户的并发与运行时资源上限，保障多租户公平">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
              {QUOTA_FIELDS.map((f) => (
                <EditableCard
                  key={f.key}
                  field={f}
                  value={config[f.key]}
                  savedAt={savedAtByKey[f.key]}
                  onConfirm={(v) => persist({ ...config, [f.key]: v }, f.key)}
                />
              ))}
            </div>
          </Section>

          {/* 回收策略 */}
          <Section title="回收策略" subtitle="控制运行时环境的生命周期与闲置回收，避免资源泄漏与浪费">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
              {RECLAIM_FIELDS.map((f) => (
                <EditableCard
                  key={f.key}
                  field={f}
                  value={config[f.key]}
                  savedAt={savedAtByKey[f.key]}
                  onConfirm={(v) => persist({ ...config, [f.key]: v }, f.key)}
                />
              ))}
            </div>
          </Section>

          {/* 审批策略 */}
          <Section title="审批策略" subtitle="控制新生成审批卡的冻结等待期限">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
              {APPROVAL_FIELDS.map((f) => (
                <EditableCard
                  key={f.key}
                  field={f}
                  value={config[f.key]}
                  savedAt={savedAtByKey[f.key]}
                  onConfirm={(v) => persist({ ...config, [f.key]: v }, f.key)}
                />
              ))}
            </div>
          </Section>

          {/* 会话留存 */}
          <Section title="会话留存" subtitle="控制 Agent 会话数据的保留时长，供故障处理时导出">
            <AuditRetentionCard
              field={AUDIT_FIELDS[0]}
              value={config.auditRetentionDays}
              savedAt={savedAtByKey.auditRetentionDays}
              onConfirm={(v) => persist({ ...config, auditRetentionDays: v }, "auditRetentionDays")}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

// ─── 可编辑参数卡片（右上角编辑 / 右下角取消确认） ──────────────────────────────────────

function EditableCard({
  field,
  value,
  savedAt,
  onConfirm,
}: {
  field: EditableField;
  value: number;
  savedAt?: string;
  onConfirm: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const Icon = field.icon;

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const confirm = () => {
    onConfirm(draft);
    setEditing(false);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#DCDFE6] rounded-[8px] p-[16px]">
      {/* 头部：图标 + 标题 | 编辑按钮 */}
      <div className="flex items-start justify-between mb-[10px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[36px] h-[36px] bg-[#ecf5ff] rounded-[4px] flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px] text-[#409EFF]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-medium text-[#303133] leading-tight">{field.label}</h3>
            <span className="text-[12px] text-[#909399]">单位：{field.unit}</span>
          </div>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-[4px] px-[10px] h-[28px] text-[13px] text-[#409EFF] border border-[#b3d8ff] rounded-[4px] hover:bg-[#ecf5ff] transition-colors shrink-0"
          >
            <Pencil className="w-[13px] h-[13px]" />
            编辑
          </button>
        )}
      </div>

      {/* 描述 */}
      <p className="text-[13px] text-[#606266] leading-[1.6] mb-[12px]">{field.desc}</p>

      {/* 值展示 / 编辑输入 */}
      {editing ? (
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={draft}
          onChange={(e) => setDraft(Number(e.target.value))}
          className="w-[140px] h-[36px] px-[12px] text-[15px] font-medium border border-[#409EFF] rounded-[4px] bg-[#FFFFFF] text-[#303133] outline-none focus:ring-[2px] focus:ring-[#409EFF]/20"
          autoFocus
        />
      ) : (
        <div className="flex items-baseline gap-[6px]">
          <span className="text-[20px] font-semibold text-[#303133]">{value}</span>
          <span className="text-[13px] text-[#909399]">{field.unit}</span>
          {savedAt && <span className="ml-[8px] text-[12px] text-[#67C23A]">已保存 · {savedAt}</span>}
        </div>
      )}

      {/* 编辑态：右下角取消 / 确认 */}
      {editing && (
        <div className="flex items-center justify-end gap-[8px] mt-[16px]">
          <button
            onClick={cancel}
            className="h-[32px] px-[16px] text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#f5f7fa] transition-colors flex items-center gap-[4px]"
          >
            <X className="w-[14px] h-[14px]" />
            取消
          </button>
          <button
            onClick={confirm}
            className="h-[32px] px-[16px] bg-[#409EFF] text-white text-[14px] rounded-[4px] hover:bg-[#66b1ff] transition-colors flex items-center gap-[4px]"
          >
            <Check className="w-[14px] h-[14px]" />
            确认
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 审计保留卡片（保留期限编辑 + 导出按钮 + 时间范围弹窗） ──────────────────────────────

function AuditRetentionCard({
  field,
  value,
  savedAt,
  onConfirm,
}: {
  field: EditableField;
  value: number;
  savedAt?: string;
  onConfirm: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [exportOpen, setExportOpen] = useState(false);
  const Icon = field.icon;

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const confirm = () => {
    onConfirm(draft);
    setEditing(false);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#DCDFE6] rounded-[8px] p-[16px]">
      <div className="flex items-start justify-between mb-[10px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[36px] h-[36px] bg-[#ecf5ff] rounded-[4px] flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px] text-[#409EFF]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-medium text-[#303133] leading-tight">{field.label}</h3>
            <span className="text-[12px] text-[#909399]">单位：{field.unit}</span>
          </div>
        </div>
        {!editing && (
          <div className="flex items-center gap-[8px] shrink-0">
            <button
              onClick={() => setExportOpen(true)}
              className="inline-flex items-center gap-[4px] px-[10px] h-[28px] text-[13px] text-[#409EFF] border border-[#b3d8ff] rounded-[4px] hover:bg-[#ecf5ff] transition-colors"
            >
              <Download className="w-[13px] h-[13px]" />
              导出审计数据
            </button>
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-[4px] px-[10px] h-[28px] text-[13px] text-[#409EFF] border border-[#b3d8ff] rounded-[4px] hover:bg-[#ecf5ff] transition-colors"
            >
              <Pencil className="w-[13px] h-[13px]" />
              编辑
            </button>
          </div>
        )}
      </div>

      <p className="text-[13px] text-[#606266] leading-[1.6] mb-[12px]">{field.desc}</p>

      {editing ? (
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={draft}
          onChange={(e) => setDraft(Number(e.target.value))}
          className="w-[140px] h-[36px] px-[12px] text-[15px] font-medium border border-[#409EFF] rounded-[4px] bg-[#FFFFFF] text-[#303133] outline-none focus:ring-[2px] focus:ring-[#409EFF]/20"
          autoFocus
        />
      ) : (
        <div className="flex items-baseline gap-[6px]">
          <span className="text-[20px] font-semibold text-[#303133]">{value}</span>
          <span className="text-[13px] text-[#909399]">{field.unit}</span>
          {savedAt && <span className="ml-[8px] text-[12px] text-[#67C23A]">已保存 · {savedAt}</span>}
        </div>
      )}

      {editing ? (
        <div className="flex items-center justify-end gap-[8px] mt-[16px]">
          <button
            onClick={cancel}
            className="h-[32px] px-[16px] text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#f5f7fa] transition-colors flex items-center gap-[4px]"
          >
            <X className="w-[14px] h-[14px]" />
            取消
          </button>
          <button
            onClick={confirm}
            className="h-[32px] px-[16px] bg-[#409EFF] text-white text-[14px] rounded-[4px] hover:bg-[#66b1ff] transition-colors flex items-center gap-[4px]"
          >
            <Check className="w-[14px] h-[14px]" />
            确认
          </button>
        </div>
      ) : null}

      {exportOpen && (
        <ExportModal maxDays={value} onClose={() => setExportOpen(false)} />
      )}
    </div>
  );
}

// ─── 导出时间范围弹窗 ───────────────────────────────────────────────────────────────────

function ExportModal({
  maxDays,
  onClose,
}: {
  maxDays: number;
  onClose: () => void;
}) {
  const [range, setRange] = useState<"7" | "30" | "90" | "all">("30");
  const [exported, setExported] = useState(false);

  const rangeLabel: Record<string, string> = {
    "7": "近 7 天",
    "30": "近 30 天",
    "90": "近 90 天",
    all: `保留期内全部（${maxDays} 天）`,
  };

  const doExport = () => {
    // 原型阶段仅模拟导出结果
    setExported(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-[#FFFFFF] rounded-[8px] w-[420px] max-w-[90vw] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EBEEF5]">
          <h3 className="text-[15px] font-semibold text-[#303133]">导出审计数据</h3>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#909399] hover:bg-[#f5f7fa]"
          >
            <X className="w-[16px] h-[16px]" />
          </button>
        </div>

        <div className="px-[20px] py-[16px]">
          {exported ? (
            <div className="flex items-center gap-[8px] text-[13px] text-[#67C23A]">
              <Check className="w-[16px] h-[16px]" />
              已导出 {rangeLabel[range]} 的 Agent 会话数据
            </div>
          ) : (
            <>
              <p className="text-[13px] text-[#606266] mb-[12px]">
                选择导出时间范围（保留期内共 {maxDays} 天数据），用于后续故障处理分析。
              </p>
              <div className="grid grid-cols-2 gap-[8px]">
                {(["7", "30", "90", "all"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`h-[36px] px-[12px] text-[13px] rounded-[4px] border transition-colors ${
                      range === r
                        ? "bg-[#ecf5ff] text-[#409EFF] border-[#b3d8ff]"
                        : "bg-[#FFFFFF] text-[#606266] border-[#DCDFE6] hover:bg-[#f5f7fa]"
                    }`}
                  >
                    {rangeLabel[r]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-[8px] px-[20px] py-[16px] border-t border-[#EBEEF5]">
          <button
            onClick={onClose}
            className="h-[32px] px-[16px] text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#f5f7fa] transition-colors"
          >
            {exported ? "关闭" : "取消"}
          </button>
          {!exported && (
            <button
              onClick={doExport}
              className="h-[32px] px-[16px] bg-[#409EFF] text-white text-[14px] rounded-[4px] hover:bg-[#66b1ff] transition-colors flex items-center gap-[4px]"
            >
              <Download className="w-[14px] h-[14px]" />
              确认导出
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 分区容器 ─────────────────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FFFFFF] rounded-[8px] border border-[#DCDFE6] p-[20px]">
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h2 className="text-[15px] font-semibold text-[#303133]">{title}</h2>
          {subtitle && <p className="text-[12px] text-[#909399] mt-[2px]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

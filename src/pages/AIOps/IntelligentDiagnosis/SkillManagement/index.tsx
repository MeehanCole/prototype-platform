// [功能标注] PRD FR-3 技能管理
import { useState, useRef } from "react";
import { NewTag } from "../feature-tags";
import {
  Zap,
  Search,
  Trash2,
  X,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Download,
  FileText,
} from "lucide-react";
import { Pagination } from "../_shared";

// ─── 类型定义 ─────────────────────────────────────────────────────────────────────────

interface SkillItem {
  id: string;
  name: string;
  description: string;
  tools: string[];
  version: string;
  /** SKILL.md 指令正文（Markdown） */
  content: string;
  updatedAt: string;
}

// ─── SKILL.md 工具函数 ───────────────────────────────────────────────────────────────

/**
 * 解析 SKILL.md 的 YAML frontmatter：
 * ---
 * name: xxx
 * description: xxx
 * version: v1.0.0
 * ---
 * 返回 { meta, body }，body 为 frontmatter 之后的正文
 */
function parseSkillFile(raw: string): {
  meta: { name: string; description: string; version: string };
  body: string;
} {
  const meta = { name: "", description: "", version: "v1.0.0" };
  let body = raw;

  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const nameM = fm.match(/^name\s*:\s*(.+)$/m);
    const descM = fm.match(/^description\s*:\s*(.+)$/m);
    const verM = fm.match(/^version\s*:\s*(.+)$/m);
    if (nameM) meta.name = nameM[1].trim();
    if (descM) meta.description = descM[1].trim();
    if (verM) meta.version = verM[1].trim();
    body = raw.slice(fmMatch[0].length);
  }
  return { meta, body: body.trim() };
}

/** 生成 SKILL.md 文件内容（frontmatter + 正文） */
function buildSkillFile(item: {
  name: string;
  description: string;
  version: string;
  content: string;
}): string {
  return [
    "---",
    `name: ${item.name}`,
    `description: ${item.description}`,
    `version: ${item.version}`,
    "---",
    "",
    item.content.trim(),
    "",
  ].join("\n");
}

// ─── 常量 ─────────────────────────────────────────────────────────────────────────────

// ─── Mock 数据 ────────────────────────────────────────────────────────────────────────

const mockSkills: SkillItem[] = [
  {
    id: "1",
    name: "集群故障诊断",
    description: "自动检测 Kubernetes 集群异常状态，分析节点故障、Pod 调度失败、资源瓶颈等问题，并生成根因分析报告与修复建议。",
    tools: ["k8s-monitor", "log-analyzer", "ssh-executor"],
    version: "v2.1.0",
    updatedAt: "2026-08-05",
    content: [
      "# 集群故障诊断",
      "",
      "## 使用场景",
      "当用户报告集群异常（Pod 故障、节点不可用、资源瓶颈）时，按本技能流程执行诊断。",
      "",
      "## 执行步骤",
      "1. 调用 k8s-monitor 获取集群事件与资源状态",
      "2. 通过 log-analyzer 检索相关组件日志",
      "3. 定位根因并给出修复建议",
    ].join("\n"),
  },
  {
    id: "2",
    name: "日志根因分析",
    description: "基于海量应用日志和系统日志，通过模式匹配与异常检测算法，快速定位故障根因，支持多维度钻取分析。",
    tools: ["log-analyzer", "alert-manager"],
    version: "v1.3.0",
    updatedAt: "2026-08-02",
    content: [
      "# 日志根因分析",
      "",
      "## 触发条件",
      "告警系统推送日志异常事件时自动执行。",
      "",
      "## 执行步骤",
      "1. 解析告警事件提取时间窗口与关键词",
      "2. 调用 log-analyzer 检索日志",
      "3. 模式匹配定位根因，输出分析报告",
    ].join("\n"),
  },
  {
    id: "3",
    name: "GPU资源巡检",
    description: "定时巡检 GPU 集群的运行状态、利用率、显存占用和温度，发现异常时自动告警并生成巡检报告。",
    tools: ["gpu-monitor", "alert-manager", "report-generator"],
    version: "v1.0.0",
    updatedAt: "2026-07-28",
    content: [
      "# GPU资源巡检",
      "",
      "## 调度规则",
      "每 30 分钟执行一次，覆盖全部 GPU 节点。",
      "",
      "## 执行步骤",
      "1. 调用 gpu-monitor 采集利用率/显存/温度",
      "2. 阈值比对，异常触发 alert-manager 告警",
      "3. report-generator 生成巡检报告",
    ].join("\n"),
  },
  {
    id: "4",
    name: "告警聚合分析",
    description: "对来自不同监控系统的告警进行去重、关联和聚合，减少告警风暴，提炼关键事件并推送至处理流程。",
    tools: ["alert-manager", "k8s-monitor", "incident-manager"],
    version: "v2.0.0",
    updatedAt: "2026-07-20",
    content: [
      "# 告警聚合分析",
      "",
      "## 处理规则",
      "按时间窗口对告警去重、按根因关联聚类。",
      "",
      "## 执行步骤",
      "1. 汇总 alert-manager 告警流",
      "2. 关联 k8s-monitor 事件做聚类",
      "3. 提炼关键事件推送到 incident-manager",
    ].join("\n"),
  },
  {
    id: "5",
    name: "智能诊断会话",
    description: "提供交互式对话诊断能力，用户可通过自然语言描述问题，系统自动调度工具链进行诊断并给出结论。",
    tools: ["knowledge-base", "log-analyzer", "k8s-monitor", "db-diagnostic"],
    version: "v3.0.1",
    updatedAt: "2026-08-06",
    content: [
      "# 智能诊断会话",
      "",
      "## 使用场景",
      "用户在对话中描述故障，需要自动调度工具链完成诊断。",
      "",
      "## 执行步骤",
      "1. 理解用户意图，提取关键实体",
      "2. 按需调度 log-analyzer / k8s-monitor / db-diagnostic",
      "3. 汇总结论以对话形式回复",
    ].join("\n"),
  },
  {
    id: "6",
    name: "定时健康检查",
    description: "按预设周期对所有微服务进行健康检查，包括接口可用性、响应延迟、错误率等指标，异常时自动触发修复流程。",
    tools: ["health-checker", "alert-manager"],
    version: "v1.1.0",
    updatedAt: "2026-07-15",
    content: [
      "# 定时健康检查",
      "",
      "## 调度规则",
      "每 5 分钟检查一次全部微服务。",
      "",
      "## 执行步骤",
      "1. 调用 health-checker 探测接口可用性与延迟",
      "2. 错误率超阈值触发 alert-manager",
      "3. 输出健康报告",
    ].join("\n"),
  },
  {
    id: "8",
    name: "集群健康巡检",
    description: "按需运行已创建的巡检计划，采集节点、服务、存储、网络、GPU、数据库等健康状态，汇总巡检结果并解读异常项与风险。",
    tools: ["inspection-run", "health-check", "report-analysis"],
    version: "v1.0.0",
    updatedAt: "2026-08-07",
    content: [
      "# 集群健康巡检",
      "",
      "## 使用场景",
      "用户询问集群整体健康状态、要求运行巡检或解读巡检结果时，复用平台已创建的巡检计划，不重复实现定时调度。",
      "",
      "## 执行步骤",
      "1. 调用 inspection-run 运行已创建的巡检计划「集群健康巡检」",
      "2. 调用 health-check 采集节点 / 服务 / 存储 / 网络健康状态",
      "3. 调用 report-analysis 汇总巡检项结果，识别异常项与风险阈值",
      "4. 输出健康结论与异常解读",
    ].join("\n"),
  },
  {
    id: "7",
    name: "故障报告撰写规范",
    description: "指导 AI 按统一结构撰写故障报告：背景、影响范围、根因分析、修复措施、复盘建议，不依赖任何外部工具。",
    tools: [],
    version: "v1.0.0",
    updatedAt: "2026-08-06",
    content: [
      "# 故障报告撰写规范",
      "",
      "## 使用场景",
      "用户要求生成故障报告时，按本规范组织内容结构。",
      "",
      "## 报告结构",
      "1. 故障背景与现象",
      "2. 影响范围与等级",
      "3. 根因分析",
      "4. 修复措施与验证",
      "5. 复盘与改进建议",
      "",
      "## 注意事项",
      "- 语言精炼客观，结论先行",
    ].join("\n"),
  },
];

/** 创建向导可用的指令模板 */
const skillTemplates = [
  {
    id: "diag",
    name: "故障诊断模板",
    description: "适用于问题定位与根因分析的通用技能骨架",
    content: [
      "# {技能名称}",
      "",
      "## 使用场景",
      "描述该技能在什么情况下被调用。",
      "",
      "## 执行步骤",
      "1. 收集相关上下文信息",
      "2. 调用工具完成分析",
      "3. 输出结论与建议",
      "",
      "## 注意事项",
      "- 明确失败处理与边界条件",
    ].join("\n"),
  },
  {
    id: "inspect",
    name: "定时巡检模板",
    description: "适用于周期性巡检与状态上报类技能骨架",
    content: [
      "# {技能名称}",
      "",
      "## 调度规则",
      "描述执行周期与覆盖范围。",
      "",
      "## 检查项",
      "- 指标1",
      "- 指标2",
      "",
      "## 执行步骤",
      "1. 采集数据",
      "2. 阈值比对",
      "3. 生成巡检报告",
    ].join("\n"),
  },
];

// ─── 主组件 ───────────────────────────────────────────────────────────────────────────

export function SkillManagementPage() {
  const [skills, setSkills] = useState<SkillItem[]>(mockSkills);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const filteredSkills = skills.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 分页数据（筛选变化时安全回退页码）
  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedSkills = filteredSkills.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleDelete = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
  };

  const handleImportSkill = (skill: SkillItem) => {
    setSkills((prev) => [...prev, { ...skill, id: `imp-${Date.now()}` }]);
    setShowImportModal(false);
  };

  // 导出 SKILL.md（生成 frontmatter + 正文，下载为 .md 文件）
  const handleExportSkill = (skill: SkillItem) => {
    const file = buildSkillFile({
      name: skill.name,
      description: skill.description,
      version: skill.version,
      content: skill.content,
    });
    const blob = new Blob([file], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* 顶部操作栏 */}
      <div className="bg-[#FFFFFF] border-b border-[#DCDFE6] px-[24px] py-[12px] shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] font-semibold text-[#303133] flex items-center gap-[6px]">技能管理 <NewTag code="FR-3" /></h1>
          <div className="flex items-center gap-[12px]">
          <div className="relative">
            <Search className="w-[14px] h-[14px] absolute left-[10px] top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索技能名称或描述..."
              className="w-[240px] h-[32px] pl-[30px] pr-[10px] text-[14px] border border-[#DCDFE6] rounded-[4px] bg-[#FFFFFF] text-[#303133] placeholder:text-[#A0A0A0] outline-none focus:border-[#409EFF] transition-colors"
            />
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="h-[32px] px-[16px] bg-[#FFFFFF] text-[#606266] text-[14px] border border-[#DCDFE6] rounded-[4px] hover:text-[#409EFF] hover:border-[#409EFF] transition-colors flex items-center gap-[4px]"
            title="导入已有的 SKILL.md 技能文件"
          >
            <Upload className="w-[14px] h-[14px]" />
            导入技能
          </button>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 p-[24px] overflow-y-auto">
        {/* 技能卡片列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
          {pagedSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-[#FFFFFF] border border-[#DCDFE6] rounded-[8px] p-[16px] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow"
            >
              {/* 卡片头部 */}
              <div className="flex items-start justify-between mb-[12px]">
                <div className="flex items-center gap-[10px] min-w-0">
                  <div className="w-[40px] h-[40px] bg-[#ecf5ff] rounded-[4px] flex items-center justify-center shrink-0">
                    <Zap className="w-[20px] h-[20px] text-[#409EFF]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-medium text-[#303133] truncate">{skill.name}</h3>
                    <div className="flex items-center gap-[6px] mt-[4px]">
                      <span className="text-[12px] text-[#909399]">{skill.version}</span>
                      <span className="text-[12px] text-[#C0C4CC]">·</span>
                      <span className="text-[12px] text-[#C0C4CC]">{skill.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-[13px] text-[#606266] leading-[1.6] mb-[12px] line-clamp-2">
                {skill.description}
              </p>

              {/* 元信息 */}
              <div className="flex items-center gap-[16px] mb-[12px]">
                <div className="flex items-center gap-[4px] text-[12px] text-[#909399]">
                  <Layers className="w-[14px] h-[14px]" />
                  <span>{skill.tools.length > 0 ? `工具 ${skill.tools.length} 个` : "纯指令技能"}</span>
                </div>
              </div>

              {/* 绑定工具标签 */}
              {skill.tools.length > 0 ? (
                <div className="flex flex-wrap gap-[6px] mb-[12px]">
                  {skill.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-[6px] py-[1px] text-[12px] bg-[#f5f7fa] text-[#606266] border border-[#DCDFE6] rounded-[4px]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#A0A0A0] mb-[12px]">不依赖工具，由 AI 直接按指令执行</p>
              )}

              {/* 操作按钮 */}
              <div className="flex items-center justify-end gap-[4px] pt-[12px] border-t border-[#EBEEF5]">
                <button
                  onClick={() => handleExportSkill(skill)}
                  className="h-[28px] px-[8px] text-[12px] text-[#606266] rounded-[4px] hover:bg-[#f5f7fa] hover:text-[#409EFF] transition-colors flex items-center gap-[4px]"
                  title="导出 SKILL.md 文件"
                >
                  <Download className="w-[12px] h-[12px]" />
                  导出
                </button>
                <button
                  onClick={() => setConfirmDeleteId(skill.id)}
                  className="h-[28px] px-[8px] text-[12px] text-[#F56C6C] rounded-[4px] hover:bg-[#fef0f0] transition-colors flex items-center gap-[4px]"
                >
                  <Trash2 className="w-[12px] h-[12px]" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredSkills.length === 0 && (
          <div className="text-center py-[64px]">
            <Zap className="w-[48px] h-[48px] text-[#DCDFE6] mx-auto mb-[12px]" />
            <p className="text-[14px] text-[#909399]">暂无匹配的技能</p>
          </div>
        )}

        {/* 分页 */}
        {filteredSkills.length > 0 && (
          <div className="mt-[20px] flex justify-end">
            <Pagination
              current={safePage}
              total={filteredSkills.length}
              pageSize={pageSize}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {/* 导入技能弹窗 */}
      {showImportModal && (
        <ImportSkillModal
          onClose={() => setShowImportModal(false)}
          onSubmit={handleImportSkill}
        />
      )}

      {/* 删除确认弹窗 */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-[8px] w-[420px] shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-[24px] pt-[24px] pb-[16px]">
              <div className="flex items-center gap-[12px] mb-[8px]">
                <div className="w-[40px] h-[40px] bg-[#fef0f0] rounded-[4px] flex items-center justify-center">
                  <AlertTriangle className="w-[20px] h-[20px] text-[#F56C6C]" />
                </div>
                <h3 className="text-[16px] font-medium text-[#303133]">确认删除</h3>
              </div>
              <p className="text-[14px] text-[#606266] ml-[52px]">删除后不可恢复，确定要删除该技能吗？</p>
            </div>
            <div className="flex justify-end gap-[12px] px-[24px] pb-[16px]">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="h-[32px] px-[16px] text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#f5f7fa] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="h-[32px] px-[16px] text-[14px] text-white bg-[#F56C6C] rounded-[4px] hover:bg-[#f78989] transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
      </div>
      )}
      </div>
  );
}

// ─── 导入技能弹窗（上传 SKILL.md）──────────────────────────────────────────────────

function ImportSkillModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (skill: SkillItem) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<{ name: string; description: string; version: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRaw(text);
      const { meta } = parseSkillFile(text);
      setPreview(meta);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (!preview) return;
    const { meta, body } = parseSkillFile(raw);
    onSubmit({
      id: "",
      name: meta.name || fileName.replace(/\.(md|markdown|txt)$/i, ""),
      description: meta.description || "导入的技能",
      tools: [],
      version: meta.version,
      content: body,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] rounded-[8px] w-[560px] max-h-[85vh] overflow-y-auto shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#DCDFE6]">
          <h2 className="text-[16px] font-medium text-[#303133]">导入技能</h2>
          <button onClick={onClose} className="text-[#A0A0A0] hover:text-[#606266] transition-colors">
            <X className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* 内容 */}
        <div className="px-[24px] py-[20px] space-y-[16px]">
          {/* 上传区 */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) readFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-[8px] p-[24px] text-center cursor-pointer transition-colors ${
              dragOver ? "border-[#409EFF] bg-[#ecf5ff]" : "border-[#DCDFE6] hover:border-[#409EFF]"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".md,.markdown,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f);
              }}
            />
            <Upload className="w-[32px] h-[32px] text-[#909399] mx-auto mb-[8px]" />
            <p className="text-[14px] text-[#606266]">点击或拖拽上传 SKILL.md 文件</p>
            <p className="text-[12px] text-[#A0A0A0] mt-[4px]">支持 .md / .markdown 文件，自动解析 frontmatter</p>
          </div>

          {fileName && <div className="text-[12px] text-[#909399]">已选择：{fileName}</div>}

          {/* 解析结果 */}
          {preview && (
            <div className="bg-[#F5F7FA] rounded-[4px] p-[16px] space-y-[8px]">
              <div className="flex items-center gap-[8px]">
                <span className="text-[12px] text-[#909399] w-[60px] shrink-0">技能名称</span>
                <span className="text-[14px] text-[#303133] font-medium">
                  {preview.name || "（未识别，将使用文件名）"}
                </span>
              </div>
              <div className="flex items-start gap-[8px]">
                <span className="text-[12px] text-[#909399] w-[60px] shrink-0">描述</span>
                <span className="text-[13px] text-[#606266]">{preview.description || "（未识别）"}</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <span className="text-[12px] text-[#909399] w-[60px] shrink-0">版本</span>
                <span className="text-[13px] text-[#606266]">{preview.version}</span>
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="flex justify-end gap-[12px] px-[24px] py-[16px] border-t border-[#DCDFE6]">
          <button
            onClick={onClose}
            className="h-[32px] px-[16px] text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#f5f7fa] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!preview}
            className="h-[32px] px-[16px] text-[14px] text-white bg-[#409EFF] rounded-[4px] hover:bg-[#66b1ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
}


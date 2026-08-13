// [功能标注] PRD FR-2 工具管理 (MCP)
import { useState, useMemo, Fragment } from "react";
import { NewTag } from "../feature-tags";
import {
  Plus,
  Search,
  Trash2,
  X,
  Link2,
  Play,
  RotateCcw,
  Braces,
  Wifi,
  Server,
  Boxes,
  FileCode2,
  Check,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Pagination } from "../_shared";

// ─── 类型定义 ─────────────────────────────────────────────────────────────────────────

type Protocol = "sse" | "streamable-http";
type ToolType = "mcp" | "builtin" | "custom";

interface FuncParam {
  name: string;
  type: "string" | "object" | "array";
  required?: boolean;
  placeholder?: string;
}

/** MCP 工具暴露的函数（工具函数） */
interface McpFunction {
  name: string;
  description: string;
  endpoint: string;
  params: FuncParam[];
}

interface ToolItem {
  id: string;
  name: string;
  type: ToolType;
  protocol: Protocol;
  status: "on" | "off";
  endpoint: string;
  description: string;
  headers: { key: string; value: string }[];
  functions: McpFunction[];
}

// ─── 常量 ─────────────────────────────────────────────────────────────────────────────

const protocolOptions: { value: Protocol; label: string }[] = [
  { value: "sse", label: "SSE" },
  { value: "streamable-http", label: "Streamable HTTP" },
];

const typeConfig: Record<ToolType, { label: string; bg: string; text: string }> = {
  mcp: { label: "MCP工具", bg: "bg-[#e6f7ff]", text: "text-[#1890ff]" },
  builtin: { label: "内置工具", bg: "bg-[#f5f5f5]", text: "text-[#8c8c8c]" },
  custom: { label: "自定义工具", bg: "bg-[#fff7e6]", text: "text-[#fa8c16]" },
};

// ─── Mock 数据 ────────────────────────────────────────────────────────────────────────

const mockTools: ToolItem[] = [
  {
    id: "1",
    name: "Elasticsearch 诊断工具(111环境)",
    type: "mcp",
    protocol: "streamable-http",
    status: "on",
    endpoint: "http://10.62.48.111:32133/mcp",
    description: "基于 MCP 接入 Elasticsearch，支持搜索、ES|QL 查询、索引与分片诊断、Pod 日志查询",
    headers: [{ key: "Authorization", value: "Bearer sk-***" }],
    functions: [
      {
        name: "search",
        description: "Perform an Elasticsearch search with the provided query DSL.",
        endpoint: "STREAMABLE_HTTP",
        params: [
          { name: "index", type: "string", required: true, placeholder: "Name of the Elasticsearch index to search" },
          { name: "query_body", type: "object", required: true, placeholder: "请输入复杂对象 (JSON)" },
          { name: "fields", type: "array", placeholder: "请输入复杂对象 (JSON)" },
        ],
      },
      {
        name: "esql",
        description: "Perform an Elasticsearch ES|QL query.",
        endpoint: "STREAMABLE_HTTP",
        params: [
          { name: "query", type: "string", required: true, placeholder: "ES|QL 查询语句" },
        ],
      },
      {
        name: "get_shards",
        description: "Get shard information for all or specific indices.",
        endpoint: "STREAMABLE_HTTP",
        params: [
          { name: "index", type: "string", placeholder: "Index name or empty for all" },
        ],
      },
      {
        name: "get_pod_logs_from_es",
        description: "Query pod logs from Elasticsearch based on pod name.",
        endpoint: "STREAMABLE_HTTP",
        params: [
          { name: "pod_name", type: "string", required: true, placeholder: "Pod 名称" },
          { name: "namespace", type: "string", placeholder: "命名空间" },
          { name: "tail_lines", type: "string", placeholder: "末尾行数" },
        ],
      },
      {
        name: "get_mappings",
        description: "Get field mappings for a specific Elasticsearch index.",
        endpoint: "STREAMABLE_HTTP",
        params: [
          { name: "index", type: "string", required: true, placeholder: "Index name" },
        ],
      },
      {
        name: "list_indices",
        description: "List all available Elasticsearch indices.",
        endpoint: "STREAMABLE_HTTP",
        params: [],
      },
    ],
  },
  {
    id: "2",
    name: "Prometheus诊断工具(111环境)",
    type: "mcp",
    protocol: "streamable-http",
    status: "on",
    endpoint: "http://10.62.48.111:30242/mcp",
    description: "基于 MCP 接入 Prometheus，支持指标查询、告警规则检索与时间序列分析",
    headers: [],
    functions: [
      {
        name: "query_metric",
        description: "Execute a PromQL instant query and return metric values.",
        endpoint: "STREAMABLE_HTTP",
        params: [
          { name: "query", type: "string", required: true, placeholder: "PromQL 表达式" },
          { name: "time", type: "string", placeholder: "查询时间点" },
        ],
      },
      {
        name: "query_range",
        description: "Evaluate a PromQL expression over a range of time.",
        endpoint: "STREAMABLE_HTTP",
        params: [
          { name: "query", type: "string", required: true, placeholder: "PromQL 表达式" },
          { name: "start", type: "string", placeholder: "开始时间" },
          { name: "end", type: "string", placeholder: "结束时间" },
          { name: "step", type: "string", placeholder: "步长" },
        ],
      },
      {
        name: "list_alert_rules",
        description: "List all alerting rules with their states.",
        endpoint: "STREAMABLE_HTTP",
        params: [],
      },
      {
        name: "get_targets",
        description: "List current scrape targets and their health status.",
        endpoint: "STREAMABLE_HTTP",
        params: [],
      },
    ],
  },
  {
    id: "3",
    name: "k8s-cluster-diagnosis",
    type: "mcp",
    protocol: "sse",
    status: "on",
    endpoint: "http://k8s-diagnosis.svc:8080/sse",
    description: "Kubernetes 集群诊断工具，支持 Pod/Node/Service 异常检测",
    headers: [],
    functions: [
      {
        name: "list_pods",
        description: "List pods in a namespace with status.",
        endpoint: "SSE",
        params: [
          { name: "namespace", type: "string", required: true, placeholder: "命名空间" },
        ],
      },
      {
        name: "describe_node",
        description: "Get detail info of a node.",
        endpoint: "SSE",
        params: [
          { name: "node_name", type: "string", required: true, placeholder: "节点名称" },
        ],
      },
      {
        name: "get_pod_events",
        description: "Get events of a specific pod.",
        endpoint: "SSE",
        params: [
          { name: "pod_name", type: "string", required: true, placeholder: "Pod 名称" },
          { name: "namespace", type: "string", placeholder: "命名空间" },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "log-analyzer",
    type: "mcp",
    protocol: "sse",
    status: "off",
    endpoint: "http://log-analyzer.svc:8081/sse",
    description: "日志分析工具，从 ELK/Loki 检索分析应用日志",
    headers: [],
    functions: [
      {
        name: "search_logs",
        description: "Search logs by keywords and time range.",
        endpoint: "SSE",
        params: [
          { name: "query", type: "string", required: true, placeholder: "检索关键字" },
          { name: "start_time", type: "string", placeholder: "开始时间" },
          { name: "end_time", type: "string", placeholder: "结束时间" },
        ],
      },
      {
        name: "analyze_log_pattern",
        description: "Cluster logs into patterns and count occurrences.",
        endpoint: "SSE",
        params: [
          { name: "query", type: "string", required: true, placeholder: "检索关键字" },
          { name: "window", type: "string", placeholder: "时间窗口" },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "alert-query",
    type: "custom",
    protocol: "streamable-http",
    status: "on",
    endpoint: "http://10.0.1.50:9090/api/v1/alerts",
    description: "告警查询工具，对接 Prometheus AlertManager（自定义 HTTP 工具）",
    headers: [],
    functions: [],
  },
  {
    id: "6",
    name: "loggrep",
    type: "builtin",
    protocol: "sse",
    status: "on",
    endpoint: "内置",
    description: "内置日志检索命令工具，支持 grep 式日志过滤",
    headers: [],
    functions: [],
  },
  {
    id: "7",
    name: "db-performance-advisor",
    type: "custom",
    protocol: "streamable-http",
    status: "on",
    endpoint: "http://10.0.1.51:8083/advise",
    description: "数据库性能建议工具，分析慢查询和索引优化",
    headers: [{ key: "X-Api-Key", value: "****" }],
    functions: [],
  },
];

// ─── 表单模型 ─────────────────────────────────────────────────────────────────────────

interface ToolForm {
  name: string;
  type: ToolType;
  protocol: Protocol;
  endpoint: string;
  description: string;
  headers: { key: string; value: string }[];
}

const emptyForm: ToolForm = {
  name: "",
  type: "mcp",
  protocol: "sse",
  endpoint: "",
  description: "",
  headers: [],
};

// ─── 主组件 ───────────────────────────────────────────────────────────────────────────

export function ToolManagementPage() {
  const [tools, setTools] = useState<ToolItem[]>(mockTools);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeTab, setTypeTab] = useState<ToolType | "">("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [form, setForm] = useState<ToolForm>(emptyForm);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // 调试：新页面（非弹窗），面包屑导航
  const [debugTool, setDebugTool] = useState<ToolItem | null>(null);
  // 查看函数：行内展开（当前展开的工具 id）
  const [expandFuncId, setExpandFuncId] = useState<string | null>(null);

  // 统计（按类型）
  const stats = useMemo(() => {
    const total = tools.length;
    const builtin = tools.filter((t) => t.type === "builtin").length;
    const mcp = tools.filter((t) => t.type === "mcp").length;
    const custom = tools.filter((t) => t.type === "custom").length;
    return { total, builtin, mcp, custom };
  }, [tools]);

  // 筛选
  const filteredTools = useMemo(
    () =>
      tools.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = !typeTab || t.type === typeTab;
        return matchSearch && matchType;
      }),
    [tools, searchTerm, typeTab],
  );

  // 分页数据
  const totalPages = Math.max(1, Math.ceil(filteredTools.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedTools = filteredTools.slice((safePage - 1) * pageSize, safePage * pageSize);

  const openRegister = () => {
    setEditingTool(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (tool: ToolItem) => {
    setEditingTool(tool);
    setForm({
      name: tool.name,
      type: tool.type,
      protocol: tool.protocol,
      endpoint: tool.endpoint,
      description: tool.description,
      headers: tool.headers.map((h) => ({ ...h })),
    });
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (editingTool) {
      setTools((prev) =>
        prev.map((t) => (t.id === editingTool.id ? { ...t, ...form } : t)),
      );
    } else {
      const newTool: ToolItem = {
        id: String(Date.now()),
        ...form,
        status: "off",
        functions: [],
      };
      setTools((prev) => [...prev, newTool]);
    }
    setModalVisible(false);
  };

  const toggleStatus = (id: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "on" ? "off" : "on" } : t)),
    );
  };

  const handleDelete = (id: string) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
  };

  // 协议标签
  const ProtocolLabel = ({ protocol }: { protocol: Protocol }) => {
    const map: Record<Protocol, { label: string }> = {
      sse: { label: "SSE" },
      "streamable-http": { label: "Streamable HTTP" },
    };
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[#1890ff] bg-[#e6f7ff] text-[12px] leading-[18px] rounded-[4px]">
        {protocol === "sse" ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <Server className="w-3 h-3" />
        )}
        {map[protocol].label}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 调试为独立页面：面包屑 + 全屏内容，无遮罩 */}
      {debugTool ? (
        <DebugPage tool={debugTool} onBack={() => setDebugTool(null)} />
      ) : (
        <>
          {/* 页面标题 + 操作栏 */}
          <div className="p-[16px] px-[24px] bg-[#FFFFFF] border-b border-[#DCDFE6] shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-semibold text-[#303133] flex items-center gap-[6px]">工具管理 <NewTag code="FR-2" /></h1>
            <p className="text-[12px] text-[#909399] mt-[2px] flex items-center gap-[6px]">按分类查看并管理工具集合 <NewTag code="F-Perm" /></p>
          </div>
          <button
            onClick={openRegister}
            className="flex items-center gap-1.5 px-4 h-8 bg-[#409EFF] text-white text-[14px] rounded-[4px] hover:bg-[#66b1ff] transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加工具
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard color="#1890ff" label="总计" value={stats.total} />
          <StatCard color="#52c41a" label="内置" value={stats.builtin} />
          <StatCard color="#1890ff" label="MCP" value={stats.mcp} />
          <StatCard color="#fa8c16" label="自定义" value={stats.custom} />
        </div>

        {/* 筛选栏 */}
        <div className="bg-white rounded-[4px] border border-[#DCDFE6] px-4 py-3 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-[280px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索工具..."
                className="w-full h-9 pl-9 pr-3 text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 bg-[#F5F7FA] rounded-[4px] p-[2px]">
              {[
                { key: "", label: "全部" },
                { key: "mcp", label: "MCP工具" },
                { key: "builtin", label: "内置工具" },
                { key: "custom", label: "自定义工具" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setTypeTab(tab.key as ToolType | "");
                    setPage(1);
                  }}
                  className={`px-3 h-7 text-[13px] rounded-[4px] transition-colors ${
                    typeTab === tab.key
                      ? "bg-white text-[#409EFF] shadow-sm font-medium"
                      : "text-[#606266] hover:text-[#409EFF]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setTypeTab("");
              }}
              disabled={!searchTerm && !typeTab}
              className="h-9 px-3 text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#f5f7fa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-[4px] border border-[#DCDFE6] overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="bg-[#F5F7FA] border-b border-[#DCDFE6]">
                <Th className="w-[60px]">ID</Th>
                <Th>工具名称</Th>
                <Th>工具类型</Th>
                <Th>协议</Th>
                <Th>路径/来源</Th>
                <Th className="w-[80px]">开关</Th>
                <Th className="text-center w-[240px]">操作</Th>
              </tr>
            </thead>
            <tbody>
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-[14px] text-[#A0A0A0]">
                    暂无匹配的工具
                  </td>
                </tr>
              ) : (
                pagedTools.map((tool, idx) => {
                  const tc = typeConfig[tool.type];
                  return (
                    <Fragment key={tool.id}>
                      <tr
                        className="border-b border-[#DCDFE6] hover:bg-[#f5f7fa] transition-colors"
                      >
                        <Td>
                          <span className="text-[13px] text-[#909399]">{(safePage - 1) * pageSize + idx + 1}</span>
                        </Td>
                      <Td>
                        <span className="text-[14px] text-[#303133] font-medium">{tool.name}</span>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[12px] leading-[18px] rounded-[4px] ${tc.bg} ${tc.text}`}
                        >
                          {tc.label}
                        </span>
                      </Td>
                      <Td>
                        <ProtocolLabel protocol={tool.protocol} />
                      </Td>
                      <Td>
                        <code className="text-[12px] text-[#606266] font-mono break-all max-w-[240px] inline-block truncate align-middle">
                          {tool.endpoint}
                        </code>
                      </Td>
                      <Td>
                        <button
                          onClick={() => toggleStatus(tool.id)}
                          className={`w-[36px] h-[20px] rounded-full relative transition-colors ${
                            tool.status === "on" ? "bg-[#409EFF]" : "bg-[#DCDFE6]"
                          }`}
                        >
                          <span
                            className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow transition-all ${
                              tool.status === "on" ? "left-[18px]" : "left-[2px]"
                            }`}
                          />
                        </button>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setDebugTool(tool)}
                            title="调试"
                            className="text-[13px] text-[#1890ff] hover:text-[#409EFF] transition-colors"
                          >
                            调试
                          </button>
                          <button
                            onClick={() => openEdit(tool)}
                            title="编辑"
                            className="text-[13px] text-[#1890ff] hover:text-[#409EFF] transition-colors"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => setExpandFuncId(expandFuncId === tool.id ? null : tool.id)}
                            title="查看函数"
                            className={`text-[13px] transition-colors ${
                              expandFuncId === tool.id
                                ? "text-[#409EFF] font-medium"
                                : "text-[#1890ff] hover:text-[#409EFF]"
                            }`}
                          >
                            {expandFuncId === tool.id ? "收起函数" : "查看函数"}
                          </button>
                          <button
                            onClick={() => handleDelete(tool.id)}
                            title="删除"
                            className="text-[13px] text-[#f5222d] hover:text-[#ff4d4f] transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </Td>
                    </tr>
                    {/* 查看函数：行内展开（无遮罩） */}
                    {expandFuncId === tool.id && (
                      <tr className="bg-[#FAFAFA]">
                        <td colSpan={7} className="px-4 py-3">
                          <InlineFuncList tool={tool} />
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 底部统计 + 分页 */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[12px] text-[#909399]">共 {filteredTools.length} 条记录</span>
          <Pagination
            current={safePage}
            total={filteredTools.length}
            pageSize={pageSize}
            onChange={setPage}
          />
        </div>
      </div>

      {/* 注册/编辑弹窗 */}
      {modalVisible && (
        <ToolFormModal
          editing={!!editingTool}
          form={form}
          onChange={setForm}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
        />
      )}
      </>
    )}
    </div>
  );
}

// ─── 表格组件 ─────────────────────────────────────────────────────────────────────────

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-[13px] font-semibold text-[#606266] text-left whitespace-nowrap ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}

// ─── 统计卡片 ─────────────────────────────────────────────────────────────────────────

function StatCard({ color, label, value }: { color: string; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-[4px] border border-[#DCDFE6] px-5 py-4 flex items-center gap-4">
      <div className="flex-1">
        <div className="text-[12px] text-[#909399] leading-4">{label}</div>
        <div className="text-[22px] font-bold text-[#303133] leading-7 mt-0.5">{value}</div>
      </div>
      <div className="w-1 h-8 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}

// ─── 添加/编辑工具弹窗 ───────────────────────────────────────────────────────────────

function ToolFormModal({
  editing,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  editing: boolean;
  form: ToolForm;
  onChange: (f: ToolForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const update = <K extends keyof ToolForm>(key: K, value: ToolForm[K]) => {
    onChange({ ...form, [key]: value });
  };

  // 连通性测试状态：idle | testing | success | fail
  const [testState, setTestState] = useState<"idle" | "testing" | "success" | "fail">("idle");

  const runConnectivityTest = () => {
    if (!form.endpoint.trim()) return;
    setTestState("testing");
    setTimeout(() => setTestState("success"), 900);
  };

  const updateHeader = (i: number, key: string, value: string) => {
    const headers = form.headers.map((h, idx) => (idx === i ? { key, value } : h));
    update("headers", headers);
  };

  const removeHeader = (i: number) => {
    update("headers", form.headers.filter((_, idx) => idx !== i));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-[8px] w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCDFE6]">
          <h2 className="text-[16px] font-semibold text-[#303133]">
            {editing ? "编辑工具" : "添加工具"}
          </h2>
          <button onClick={onClose} className="text-[#A0A0A0] hover:text-[#606266] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单 */}
        <div className="p-6 space-y-5">
          {/* 类型选择（MCP / 自定义） */}
          <div>
            <label className="text-[14px] text-[#606266] font-medium mb-2 block">
              工具类型 <span className="text-[#F56C6C]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  value: "mcp" as ToolType,
                  icon: <Boxes className="w-5 h-5 text-[#1e40af]" />,
                  title: "MCP 工具",
                  desc: "基于 Model Context Protocol 协议，一键接入生态现有的标准能力",
                },
                {
                  value: "custom" as ToolType,
                  icon: <FileCode2 className="w-5 h-5 text-[#4b5563]" />,
                  title: "自定义工具",
                  desc: "通过 OpenAPI (Swagger) 规范定义，灵活对接任意 HTTP 服务",
                },
              ].map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => update("type", opt.value)}
                  className={`relative p-4 border rounded-[6px] cursor-pointer transition-colors ${
                    form.type === opt.value
                      ? "border-[#3b82f6] bg-[#eff6ff]"
                      : "border-[#DCDFE6] bg-white hover:border-[#409EFF]"
                  }`}
                >
                  {form.type === opt.value && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#3b82f6] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    {opt.icon}
                    <span className="text-[15px] font-semibold text-[#1f2937]">{opt.title}</span>
                  </div>
                  <p className="text-[13px] text-[#4b5563] leading-[1.5]">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <FormField label="协议" required>
            <select
              value={form.protocol}
              onChange={(e) => update("protocol", e.target.value as Protocol)}
              className="w-full h-9 px-3 text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] bg-white focus:outline-none focus:border-[#409EFF] transition-colors"
            >
              {protocolOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="工具名称" required>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="工具名称"
              className="w-full h-9 px-3 text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors"
            />
          </FormField>

          <FormField label="服务器地址" required>
            <input
              value={form.endpoint}
              onChange={(e) => update("endpoint", e.target.value)}
              placeholder="请输入URL地址，例如：http://localhost:8080/sse"
              className="w-full h-9 pl-9 pr-3 text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors font-mono"
            />
            <Link2 className="w-4 h-4 text-[#A0A0A0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </FormField>

          <FormField label="描述信息">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="请输入工具描述信息"
              rows={2}
              className="w-full px-3 py-2 text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors resize-none"
            />
          </FormField>

          {/* 请求头 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[14px] text-[#606266] font-medium">请求头</label>
              <button
                onClick={() => update("headers", [...form.headers, { key: "", value: "" }])}
                className="flex items-center gap-1 text-[13px] text-[#409EFF] hover:text-[#66b1ff] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                添加头部
              </button>
            </div>
            {form.headers.length === 0 ? (
              <div className="border border-dashed border-[#DCDFE6] rounded-[4px] py-8 text-center">
                <Link2 className="w-5 h-5 text-[#C0C4CC] mx-auto mb-2" />
                <p className="text-[13px] text-[#A0A0A0]">
                  暂无自定义请求头，点击上方"添加头部"进行配置
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {form.headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={h.key}
                      onChange={(e) => updateHeader(i, e.target.value, h.value)}
                      placeholder="Header 名称"
                      className="flex-1 h-8 px-2 text-[13px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors"
                    />
                    <input
                      value={h.value}
                      onChange={(e) => updateHeader(i, h.key, e.target.value)}
                      placeholder="值"
                      className="flex-1 h-8 px-2 text-[13px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors"
                    />
                    <button
                      onClick={() => removeHeader(i)}
                      className="p-1.5 text-[#F56C6C] hover:bg-[#fef0f0] rounded-[4px] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DCDFE6]">
          {/* 连通性测试 */}
          <button
            onClick={runConnectivityTest}
            disabled={!form.endpoint.trim() || testState === "testing"}
            className={`px-4 h-9 text-[14px] rounded-[4px] border transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              testState === "success"
                ? "border-[#67C23A] bg-[#f0f9eb] text-[#67C23A]"
                : "border-[#409EFF] bg-[#e5efff] text-[#1e40af] hover:bg-[#cce6ff]"
            }`}
          >
            {testState === "testing" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                测试中...
              </>
            ) : testState === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                连接成功
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                连通性测试
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 h-9 text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#f5f7fa] transition-colors"
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            className="px-4 h-9 text-[14px] text-white bg-[#409EFF] rounded-[4px] hover:bg-[#66b1ff] transition-colors"
          >
            {editing ? "保存修改" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 调试页（独立页面：面包屑 + 左侧函数列表 + 右侧参数表单 + 深色输出）─────────

function DebugPage({ tool, onBack }: { tool: ToolItem; onBack: () => void }) {
  const [selectedFunc, setSelectedFunc] = useState<McpFunction | null>(
    tool.functions[0] ?? null,
  );
  const [funcSearch, setFuncSearch] = useState("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const filteredFuncs = tool.functions.filter((f) =>
    f.name.toLowerCase().includes(funcSearch.toLowerCase()),
  );

  const selectFunc = (fn: McpFunction) => {
    setSelectedFunc(fn);
    setParams({});
    setOutput("");
    setHasRun(false);
  };

  const runDebug = () => {
    if (!selectedFunc) return;
    setRunning(true);
    setHasRun(true);
    setTimeout(() => {
      const argStr = Object.entries(params)
        .filter(([, v]) => v.trim() !== "")
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n");
      setOutput(
        `→ 调用 ${tool.name} 的 ${selectedFunc.name}()\n` +
          (argStr ? `参数:\n${argStr}\n` : "参数: (无)\n") +
          `→ 执行完成，耗时 312ms\n` +
          `→ 返回结果:\n{\n  "status": "success",\n  "message": "${selectedFunc.name} 执行成功",\n  "result": [\n    { "id": "demo-1", "value": 0.98 },\n    { "id": "demo-2", "value": 0.87 }\n  ]\n}`,
      );
      setRunning(false);
    }, 900);
  };

  const renderParamInput = (p: FuncParam) => {
    if (p.type === "object" || p.type === "array") {
      return (
        <textarea
          value={params[p.name] ?? ""}
          onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
          placeholder={p.placeholder || "请输入复杂对象 (JSON)"}
          rows={p.type === "object" ? 5 : 3}
          className="w-full px-3 py-2 text-[13px] font-mono text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors resize-y bg-[#FAFAFA]"
        />
      );
    }
    return (
      <input
        value={params[p.name] ?? ""}
        onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
        placeholder={p.placeholder || p.name}
        className="w-full h-8 px-2.5 text-[13px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors bg-[#FAFAFA]"
      />
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] min-h-0">
      {/* 面包屑导航 */}
      <div className="h-[40px] px-[24px] bg-[#FFFFFF] border-b border-[#DCDFE6] flex items-center gap-2 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] text-[#606266] hover:text-[#409EFF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回
        </button>
        <span className="text-[#C0C4CC]">/</span>
        <span className="text-[13px] text-[#909399]">工具管理</span>
        <span className="text-[#C0C4CC]">/</span>
        <span className="text-[13px] text-[#303133] font-medium">{tool.name}</span>
        <span className="text-[#C0C4CC]">/</span>
        <span className="text-[13px] text-[#409EFF]">调试</span>
        <span className="flex items-center gap-1 text-[12px] text-[#30d5c8] ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#30d5c8]" />
          在线
        </span>
        <span className="px-1.5 py-0.5 text-[11px] bg-[#f0f2f5] text-[#606266] rounded-[3px]">MCP</span>
      </div>

      <div className="flex flex-1 overflow-hidden bg-[#FFFFFF]">
        {/* 左侧：函数列表 */}
        <div className="w-[300px] shrink-0 border-r border-[#DCDFE6] flex flex-col bg-[#FFFFFF]">
            <div className="p-3 border-b border-[#EBEEF5]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  value={funcSearch}
                  onChange={(e) => setFuncSearch(e.target.value)}
                  placeholder="搜索函数..."
                  className="w-full h-8 pl-8 pr-2 text-[13px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 py-2 text-[12px] text-[#909399] font-medium">函数列表</div>
              {filteredFuncs.length === 0 ? (
                <p className="px-3 py-4 text-[12px] text-[#A0A0A0]">暂无函数</p>
              ) : (
                filteredFuncs.map((fn) => (
                  <button
                    key={fn.name}
                    onClick={() => selectFunc(fn)}
                    className={`w-full text-left px-3 py-2.5 border-b border-[#F5F7FA] transition-colors ${
                      selectedFunc?.name === fn.name
                        ? "bg-[#E6F4FF] border-r-[2px] border-r-[#409EFF]"
                        : "hover:bg-[#F5F7FA]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Braces className="w-3.5 h-3.5 text-[#409EFF] shrink-0" />
                      <span className="text-[13px] font-medium text-[#303133] truncate">{fn.name}</span>
                      <span className="ml-auto text-[10px] text-[#1890ff] bg-[#e6f7ff] rounded-[3px] px-1 py-px shrink-0">
                        {fn.endpoint}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#909399] mt-0.5 line-clamp-2">{fn.description}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 右侧：参数配置 + 调试输出 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedFunc ? (
              <>
                {/* 配置参数 */}
                <div className="border-b border-[#DCDFE6] shrink-0 overflow-y-auto max-h-[320px]">
                  <div className="flex items-center justify-between px-5 py-3">
                    <div>
                      <h3 className="text-[14px] font-medium text-[#303133]">{selectedFunc.name}</h3>
                      <p className="text-[12px] text-[#909399] mt-0.5">{selectedFunc.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setParams({})}
                        className="h-8 px-3 text-[13px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#f5f7fa] transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        重置
                      </button>
                      <button
                        onClick={runDebug}
                        disabled={running}
                        className="h-8 px-4 text-[13px] text-white bg-[#409EFF] rounded-[4px] hover:bg-[#66b1ff] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {running ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        运行调试
                      </button>
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <div className="text-[12px] text-[#909399] mb-2">输入参数</div>
                    {selectedFunc.params.length === 0 ? (
                      <p className="text-[13px] text-[#A0A0A0] py-2">该函数无输入参数</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedFunc.params.map((p) => (
                          <div key={p.name}>
                            <label className="flex items-center gap-1.5 text-[13px] text-[#303133] mb-1.5">
                              {p.name}
                              {p.required && <span className="text-[#F56C6C]">*</span>}
                              <span className="text-[11px] text-[#909399] bg-[#F5F7FA] px-1.5 py-px rounded-[3px]">
                                {p.type}
                              </span>
                            </label>
                            {renderParamInput(p)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 调试输出（深色控制台） */}
                <div className="flex-1 flex flex-col bg-[#1a1a1a] min-h-0">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2e2e2e] shrink-0">
                    <span className="text-[12px] text-[#9ca3af]">调试输出</span>
                    {hasRun && !running && (
                      <span className="text-[11px] text-[#67C23A] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        执行成功
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {!hasRun ? (
                      <div className="flex items-center justify-center h-full text-[#4b5563] text-[13px] font-mono">
                        {running ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            运行中...
                          </span>
                        ) : (
                          "等待运行指令..."
                        )}
                      </div>
                    ) : (
                      <pre className="text-[12px] leading-relaxed font-mono whitespace-pre-wrap text-[#d1d5db]">
                        {output}
                      </pre>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#A0A0A0] text-[14px]">
                该工具未暴露函数
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

// ─── 查看函数：行内展开列表（无遮罩，直接在查看函数下方展开）───────────────────

function InlineFuncList({ tool }: { tool: ToolItem }) {
  const [funcSearch, setFuncSearch] = useState("");

  const filteredFuncs = tool.functions.filter((f) =>
    f.name.toLowerCase().includes(funcSearch.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] font-medium text-[#303133]">
          {tool.name} 函数列表
        </span>
        <span className="text-[12px] text-[#909399]">（{tool.functions.length} 个）</span>
      </div>
      <div className="relative mb-3 max-w-[320px]">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
        <input
          value={funcSearch}
          onChange={(e) => setFuncSearch(e.target.value)}
          placeholder="搜索函数..."
          className="w-full h-8 pl-9 pr-3 text-[13px] text-[#303133] border border-[#DCDFE6] rounded-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors"
        />
      </div>

      {tool.functions.length === 0 ? (
        <div className="py-6 text-center">
          <Braces className="w-8 h-8 text-[#DCDFE6] mx-auto mb-2" />
          <p className="text-[13px] text-[#A0A0A0]">该工具未暴露函数</p>
        </div>
      ) : filteredFuncs.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-[#A0A0A0]">暂无匹配函数</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {filteredFuncs.map((fn) => (
            <div key={fn.name} className="border border-[#EBEEF5] rounded-[6px] p-3 bg-white hover:border-[#409EFF] transition-colors">
              <div className="flex items-center gap-2">
                <Braces className="w-4 h-4 text-[#409EFF] shrink-0" />
                <span className="text-[13px] font-medium text-[#303133]">{fn.name}</span>
                <span className="text-[10px] text-[#1890ff] bg-[#e6f7ff] rounded-[3px] px-1.5 py-px">
                  {fn.endpoint}
                </span>
                {fn.params.length > 0 && (
                  <span className="text-[11px] text-[#909399]">参数 {fn.params.length} 个</span>
                )}
              </div>
              <p className="text-[12px] text-[#606266] mt-1.5">{fn.description}</p>
              {fn.params.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {fn.params.map((p) => (
                    <span
                      key={p.name}
                      className="px-1.5 py-px text-[11px] bg-[#F5F7FA] text-[#909399] rounded-[3px]"
                    >
                      {p.name}
                      {p.required ? <span className="text-[#F56C6C]">*</span> : ""}
                      <span className="text-[#C0C4CC]"> · {p.type}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 表单字段包装 ─────────────────────────────────────────────────────────────────────

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[14px] text-[#606266] font-medium">
        {label}
        {required && <span className="text-[#F56C6C] ml-0.5">*</span>}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}

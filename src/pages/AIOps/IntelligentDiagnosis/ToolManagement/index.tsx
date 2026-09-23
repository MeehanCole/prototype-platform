// [功能标注] PRD FR-2 工具管理 (MCP)
import { useState, useMemo, Fragment, useRef } from "react";
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
  Loader2,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Pagination } from "../_shared";

// ─── 类型定义 ─────────────────────────────────────────────────────────────────────────

type Protocol = "sse" | "streamable-http";
type ToolType = "mcp" | "builtin";

/** MCP Server 生命周期状态（含连通性测试结果） */
type ToolStatus =
  | "disabled" // 已禁用：管理员关闭
  | "connecting" // 连接/更新中：尚未取得有效目录或正在刷新
  | "ready" // 已就绪：工具目录已成功发布
  | "degraded" // 状态异常：曾成功，后续刷新暂失败
  | "authRequired" // 凭据异常：缺失或已不可用
  | "incompatible" // 协议不兼容：协议或目录不符合要求
  | "unavailable"; // 服务不可达：地址/网络/传输问题

/** 鉴权通过自定义请求头（如 Authorization: Bearer xxx）承载，无需独立配置字段 */

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
  status: ToolStatus;
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
};

/** 状态徽标样式（7 态）：disabled 为持久态，其余为连通性/运行态 */
const statusConfig: Record<ToolStatus, { label: string; bg: string; text: string; dot: string }> = {
  disabled: { label: "已禁用", bg: "bg-[#f5f5f5]", text: "text-[#8c8c8c]", dot: "#8c8c8c" },
  connecting: { label: "连接中", bg: "bg-[#e6f7ff]", text: "text-[#1890ff]", dot: "#1890ff" },
  ready: { label: "已就绪", bg: "bg-[#f6ffed]", text: "text-[#52c41a]", dot: "#52c41a" },
  degraded: { label: "状态异常", bg: "bg-[#fff7e6]", text: "text-[#fa8c16]", dot: "#fa8c16" },
  authRequired: { label: "凭据异常", bg: "bg-[#fff1f0]", text: "text-[#f5222d]", dot: "#f5222d" },
  incompatible: { label: "协议不兼容", bg: "bg-[#fff1f0]", text: "text-[#f5222d]", dot: "#f5222d" },
  unavailable: { label: "服务不可达", bg: "bg-[#fff1f0]", text: "text-[#f5222d]", dot: "#f5222d" },
};

// ─── Mock 数据 ────────────────────────────────────────────────────────────────────────

const mockTools: ToolItem[] = [
  {
    id: "1",
    name: "Elasticsearch 诊断工具(111环境)",
    type: "mcp",
    protocol: "streamable-http",
    status: "ready",
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
    status: "ready",
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
    status: "ready",
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
    status: "disabled",
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
    type: "mcp",
    protocol: "streamable-http",
    status: "authRequired",
    endpoint: "http://10.0.1.50:9090/api/v1/alerts",
    description: "告警查询工具，对接 Prometheus AlertManager（MCP 接入）",
    headers: [],
    functions: [],
  },
  {
    id: "6",
    name: "loggrep",
    type: "builtin",
    protocol: "sse",
    status: "ready",
    endpoint: "内置",
    description: "内置日志检索命令工具，支持 grep 式日志过滤",
    headers: [],
    functions: [],
  },
  {
    id: "7",
    name: "db-performance-advisor",
    type: "mcp",
    protocol: "streamable-http",
    status: "degraded",
    endpoint: "http://10.0.1.51:8083/advise",
    description: "数据库性能建议工具，分析慢查询和索引优化",
    headers: [{ key: "X-Api-Key", value: "****" }],
    functions: [],
  },
  {
    id: "8",
    name: "node-terminal",
    type: "mcp",
    protocol: "sse",
    status: "unavailable",
    endpoint: "http://k8s-node.svc:8082/sse",
    description: "节点终端工具，基于特权 Pod + nsenter 接入 K8s 节点终端",
    headers: [],
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
  const [statusTab, setStatusTab] = useState<ToolStatus | "abnormal" | "">("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [form, setForm] = useState<ToolForm>(emptyForm);
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const pageSize = 5;

  // 调试：新页面（非弹窗），面包屑导航
  const [debugTool, setDebugTool] = useState<ToolItem | null>(null);
  // 查看函数：行内展开（当前展开的工具 id）
  const [expandFuncId, setExpandFuncId] = useState<string | null>(null);

  // 统计（按状态视角）
  const stats = useMemo(() => {
    const total = tools.length;
    const ready = tools.filter((t) => t.status === "ready").length;
    const abnormal = tools.filter((t) =>
      ["degraded", "authRequired", "incompatible", "unavailable"].includes(t.status),
    ).length;
    const disabled = tools.filter((t) => t.status === "disabled").length;
    return { total, ready, abnormal, disabled };
  }, [tools]);

  // 筛选
  const filteredTools = useMemo(
    () =>
      tools.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
          !statusTab ||
          (statusTab === "abnormal"
            ? ["degraded", "authRequired", "incompatible", "unavailable"].includes(t.status)
            : t.status === statusTab);
        return matchSearch && matchStatus;
      }),
    [tools, searchTerm, statusTab],
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
        status: "ready",
        functions: [],
      };
      setTools((prev) => [...prev, newTool]);
    }
    setModalVisible(false);
  };

  const toggleStatus = (id: string) => {
    setTools((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        // 关(disabled) → 开：先 connecting 中间态，模拟连接后落 ready
        if (t.status === "disabled") {
          setTimeout(() => {
            setTools((p) => p.map((x) => (x.id === id ? { ...x, status: "ready" } : x)));
          }, 1000);
          return { ...t, status: "connecting" };
        }
        // 开 / 异常态 → 停用
        return { ...t, status: "disabled" };
      }),
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
          {/* 页面标题 */}
          <div className="px-[24px] pt-[16px] pb-[8px] bg-[#FFFFFF] border-b border-[#DCDFE6] shrink-0">
        <h1 className="text-[16px] font-semibold text-[#303133] flex items-center gap-[6px]">工具管理 <NewTag code="FR-2" /></h1>
        <p className="text-[12px] text-[#909399] mt-[2px] flex items-center gap-[6px]">按分类查看并管理工具集合 <NewTag code="F-Perm" /></p>
      </div>
      {/* 工具栏：创建(左) + 搜索/筛选(右) */}
      <div className="px-[24px] py-[12px] bg-[#FFFFFF] border-b border-[#DCDFE6] shrink-0">
        <div className="flex items-center justify-between gap-[12px] flex-wrap">
          <button
            onClick={openRegister}
            className="flex items-center gap-1.5 px-4 h-8 bg-[#409EFF] text-white text-[14px] rounded-[4px] hover:bg-[#66b1ff] transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            添加工具
          </button>
          <div className="flex items-center gap-[12px] flex-wrap">
            <div className="flex items-center gap-1 bg-[#F5F7FA] rounded-[4px] p-[2px]">
              {[
                { key: "", label: "全部" },
                { key: "ready", label: "已就绪" },
                { key: "abnormal", label: "异常" },
                { key: "disabled", label: "已禁用" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusTab(tab.key as ToolStatus | "abnormal" | "");
                    setPage(1);
                  }}
                  className={`px-3 h-7 text-[13px] rounded-[4px] transition-colors ${
                    statusTab === tab.key
                      ? "bg-white text-[#409EFF] shadow-sm font-medium"
                      : "text-[#606266] hover:text-[#409EFF]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-stretch h-9 w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索工具..."
                  className="w-full h-9 pl-9 pr-9 text-[14px] text-[#303133] border border-[#DCDFE6] border-r-0 rounded-l-[4px] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#409EFF] transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] flex items-center justify-center rounded-full text-[#A0A0A0] hover:bg-[#E4E7ED] hover:text-[#606266] transition-colors"
                    title="清空搜索"
                  >
                    <X className="w-[14px] h-[14px]" />
                  </button>
                )}
              </div>
              <button
                onClick={() => searchRef.current?.focus()}
                className="h-9 px-[16px] bg-[#409EFF] text-white text-[14px] rounded-r-[4px] hover:bg-[#66b1ff] transition-colors flex items-center gap-[4px] shrink-0"
              >
                <Search className="w-[14px] h-[14px]" />
                <span>搜索</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* 统计卡片（状态视角） */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard color="#1890ff" label="总计" value={stats.total} />
          <StatCard color="#52c41a" label="已就绪" value={stats.ready} />
          <StatCard color="#F56C6C" label="异常" value={stats.abnormal} />
          <StatCard color="#909399" label="已禁用" value={stats.disabled} />
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-[4px] border border-[#DCDFE6] overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="bg-[#F5F7FA] border-b border-[#DCDFE6]">
                <Th className="w-[60px]">ID</Th>
                <Th>工具名称</Th>
                <Th>工具类型</Th>
                <Th>工具协议</Th>
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
                        <div className="flex items-center gap-2">
                          <ToolToggle status={tool.status} onClick={() => toggleStatus(tool.id)} />
                          {tool.status !== "disabled" && tool.status !== "ready" && tool.status !== "connecting" && (
                            <span className="relative flex items-center text-[#F56C6C] group">
                              <AlertTriangle className="w-4 h-4 cursor-help" />
                              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap rounded-[4px] bg-[#303133] px-2 py-1 text-[12px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm">
                                {statusConfig[tool.status].label}
                              </span>
                            </span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-center gap-3">
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

// ─── 开关（toggle） ──────────────────────────────────────────────────────────────────
// disabled=关（灰）；ready/异常态=开（蓝）；connecting=开+转圈；异常态下点击无效，需先停用

function ToolToggle({ status, onClick }: { status: ToolStatus; onClick: () => void }) {
  // 仅 ready / connecting 为开（蓝）；disabled 与 4 个异常态均为关（灰）——异常态是开启失败，开关回关
  const isOn = status === "ready" || status === "connecting";
  const isConnecting = status === "connecting";
  return (
    <button
      onClick={onClick}
      className={`w-[36px] h-[20px] rounded-full relative transition-colors ${
        isOn ? "bg-[#409EFF]" : "bg-[#DCDFE6]"
      }`}
      title={statusConfig[status].label}
    >
      <span
        className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow transition-all ${
          isOn ? "left-[18px]" : "left-[2px]"
        } flex items-center justify-center`}
      >
        {isConnecting && <Loader2 className="w-3 h-3 text-[#409EFF] animate-spin" />}
      </span>
    </button>
  );
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

  // 连通性测试：模拟 MCP Server 状态（connecting 为过程态，其余为测试结果）
  const [testState, setTestState] = useState<ToolStatus | "idle" | "testing">("idle");

  const runConnectivityTest = () => {
    if (!form.endpoint.trim()) return;
    setTestState("testing");
    setTimeout(() => {
      // 演示用判定：鉴权请求头缺失→authRequired；非法地址→unavailable；否则 ready
      const hasAuthHeader = form.headers.some((h) =>
        /^(authorization|x-api-key|api-key|token)$/i.test(h.key.trim()),
      );
      if (!hasAuthHeader) {
        setTestState("authRequired");
      } else if (!/^https?:\/\//.test(form.endpoint.trim())) {
        setTestState("unavailable");
      } else {
        setTestState("ready");
      }
    }, 900);
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
          <FormField label="工具协议" required>
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
              testState === "ready"
                ? "border-[#67C23A] bg-[#f0f9eb] text-[#67C23A]"
                : testState === "authRequired" || testState === "incompatible" || testState === "unavailable"
                ? "border-[#F56C6C] bg-[#fef0f0] text-[#F56C6C]"
                : "border-[#409EFF] bg-[#e5efff] text-[#1e40af] hover:bg-[#cce6ff]"
            }`}
          >
            {testState === "testing" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                测试中...
              </>
            ) : testState === "ready" ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                连接成功
              </>
            ) : testState === "authRequired" || testState === "incompatible" || testState === "unavailable" ? (
              <>
                <X className="w-4 h-4" />
                {testState === "authRequired" ? "凭据异常" : testState === "incompatible" ? "协议不兼容" : "服务不可达"}
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

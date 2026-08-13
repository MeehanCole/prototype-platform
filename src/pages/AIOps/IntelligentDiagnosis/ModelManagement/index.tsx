// [功能标注] PRD FR-1 模型管理
import { useState, useMemo } from "react";
import { NewTag } from "../feature-tags";
import {
  Cpu,
  Plus,
  Search,
  Edit3,
  Trash2,
  Play,
  CircleStop,
  Eye,
  X,
  CheckCircle2,
  Star,
  AlertTriangle,
  Server,
} from "lucide-react";
import { Pagination, getDefaultModel, setDefaultModel } from "../_shared";

// ─── 类型定义 ───────────────────────────────────────────────────────────────────────

type ModelStatus = "running" | "stopped" | "error";
type ModelType = "llm" | "embedding" | "image";

interface ModelItem {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  status: ModelStatus;
  endpoint: string;
  apiKey: string;
  description: string;
  createdAt: string;
}

// ─── 常量配置 ───────────────────────────────────────────────────────────────────────

const typeOptions: { value: ModelType; label: string }[] = [
  { value: "llm", label: "LLM" },
  { value: "embedding", label: "Embedding" },
  { value: "image", label: "Image" },
];

const typeColorMap: Record<ModelType, string> = {
  llm: "text-[#409EFF] bg-[#ECF5FF] border-[#B3D8FF]",
  embedding: "text-[#67C23A] bg-[#F0F9EB] border-[#C2E7B0]",
  image: "text-[#E6A23C] bg-[#FDF6EC] border-[#F5DAB1]",
};

const statusConfig: Record<ModelStatus, { label: string; color: string; dot: string }> = {
  running: { label: "运行中", color: "text-[#67C23A] bg-[#F0F9EB] border-[#C2E7B0]", dot: "#67C23A" },
  stopped: { label: "已停止", color: "text-[#909399] bg-[#F4F4F5] border-[#C8C9CC]", dot: "#909399" },
  error: { label: "异常", color: "text-[#F56C6C] bg-[#FEF0F0] border-[#FBC4C4]", dot: "#F56C6C" },
};

const statusFilterOptions = [
  { value: "", label: "全部" },
  { value: "running", label: "运行中" },
  { value: "stopped", label: "已停止" },
  { value: "error", label: "异常" },
];

const providerOptions = [
  "OpenAI",
  "Anthropic",
  "本地部署",
  "算力加速平台",
  "Google Cloud",
  "Azure",
];

// ─── Mock 数据 ──────────────────────────────────────────────────────────────────────

const mockModels: ModelItem[] = [
  {
    id: "1",
    name: "GPT-4o",
    provider: "OpenAI",
    type: "llm",
    status: "running",
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: "sk-****",
    description: "OpenAI 多模态大模型，支持文本和图像理解，适用于复杂推理与对话场景。",
    createdAt: "2026-06-01",
  },
  {
    id: "2",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    type: "llm",
    status: "running",
    endpoint: "https://api.anthropic.com/v1/messages",
    apiKey: "sk-ant-****",
    description: "Anthropic 旗舰对话模型，擅长长上下文理解和安全对齐。",
    createdAt: "2026-06-15",
  },
  {
    id: "3",
    name: "text-embedding-3-large",
    provider: "OpenAI",
    type: "embedding",
    status: "running",
    endpoint: "https://api.openai.com/v1/embeddings",
    apiKey: "sk-****",
    description: "OpenAI 高维度向量嵌入模型，用于语义搜索和 RAG 检索。",
    createdAt: "2026-05-20",
  },
  {
    id: "4",
    name: "Qwen2.5-72B",
    provider: "算力加速平台",
    type: "llm",
    status: "running",
    endpoint: "https://api.xxx.com/v1/chat/completions",
    apiKey: "sk-****",
    description: "通义千问 72B 参数模型，通过算力平台部署，高性能推理。",
    createdAt: "2026-07-01",
  },
  {
    id: "5",
    name: "DeepSeek-V3",
    provider: "本地部署",
    type: "llm",
    status: "stopped",
    endpoint: "http://localhost:8000/v1/chat/completions",
    apiKey: "sk-local-****",
    description: "DeepSeek-V3 本地部署版本，使用 vLLM 推理框架。",
    createdAt: "2026-07-10",
  },
  {
    id: "6",
    name: "BGE-M3",
    provider: "本地部署",
    type: "embedding",
    status: "stopped",
    endpoint: "http://localhost:8001/embed",
    apiKey: "sk-local-****",
    description: "BGE-M3 多语言向量嵌入模型，支持稠密和稀疏检索。",
    createdAt: "2026-06-20",
  },
  {
    id: "7",
    name: "Stable Diffusion XL",
    provider: "算力加速平台",
    type: "image",
    status: "error",
    endpoint: "https://api.xxx.com/v1/images/generate",
    apiKey: "sk-****",
    description: "Stable Diffusion XL 图像生成模型，用于图标和界面视觉素材生成。",
    createdAt: "2026-07-25",
  },
  {
    id: "8",
    name: "Gemini 1.5 Pro",
    provider: "Google Cloud",
    type: "llm",
    status: "running",
    endpoint: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent",
    apiKey: "AIza****",
    description: "Google Gemini 1.5 Pro，百万 token 上下文窗口，多模态能力。",
    createdAt: "2026-07-05",
  },
];

// ─── 主组件 ─────────────────────────────────────────────────────────────────────────

export function ModelManagementPage() {
  const [models, setModels] = useState<ModelItem[]>(mockModels);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);
  const [defaultModel, setDefaultModelName] = useState<string>(getDefaultModel());
  const pageSize = 4;

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = !statusFilter || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [models, searchTerm, statusFilter]);

  // 分页数据（筛选变化时安全回退页码）
  const totalPages = Math.max(1, Math.ceil(filteredModels.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedModels = filteredModels.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = useMemo(() => {
    const total = models.length;
    const running = models.filter((m) => m.status === "running").length;
    const error = models.filter((m) => m.status === "error").length;
    return { total, running, error };
  }, [models]);

  // 设为默认模型（仅 LLM 模型可设为会话默认，持久化到 localStorage）
  const handleSetDefault = (model: ModelItem) => {
    if (model.type !== "llm") return;
    setDefaultModel(model.name);
    setDefaultModelName(model.name);
  };

  const handleToggleStatus = (id: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newStatus: ModelStatus = m.status === "running" ? "stopped" : "running";
        return { ...m, status: newStatus };
      })
    );
  };

  const handleDelete = (id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
  };

  const handleViewDetail = (model: ModelItem) => {
    setSelectedModel(model);
    setShowDetailModal(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 页面标题与操作栏 */}
      <div className="p-[16px] px-[24px] bg-[#FFFFFF] border-b border-[#DCDFE6] shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] font-semibold text-[#303133] flex items-center gap-[6px]">模型管理 <NewTag code="FR-1" /></h1>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="h-[32px] px-[16px] bg-[#409EFF] text-white text-[14px] rounded-[4px] hover:bg-[#66B1FF] active:bg-[#3A8EE6] transition-colors flex items-center gap-[6px]"
          >
            <Plus className="w-[14px] h-[14px]" />
            <span>注册模型</span>
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 p-[24px] overflow-y-auto">

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] mb-[24px]">
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#DCDFE6] p-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] text-[#606266] mb-[8px]">模型总数</div>
              <div className="text-[28px] font-bold text-[#303133]">{stats.total}</div>
            </div>
            <div className="w-[40px] h-[40px] rounded-[8px] bg-[#ECF5FF] flex items-center justify-center">
              <Server className="w-[20px] h-[20px] text-[#409EFF]" />
            </div>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#DCDFE6] p-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] text-[#606266] mb-[8px]">运行中</div>
              <div className="text-[28px] font-bold text-[#303133]">{stats.running}</div>
            </div>
            <div className="w-[40px] h-[40px] rounded-[8px] bg-[#F0F9EB] flex items-center justify-center">
              <CheckCircle2 className="w-[20px] h-[20px] text-[#67C23A]" />
            </div>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-[8px] border border-[#DCDFE6] p-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] text-[#606266] mb-[8px]">异常</div>
              <div className="text-[28px] font-bold text-[#303133]">{stats.error}</div>
            </div>
            <div className="w-[40px] h-[40px] rounded-[8px] bg-[#FEF0F0] flex items-center justify-center">
              <AlertTriangle className="w-[20px] h-[20px] text-[#F56C6C]" />
            </div>
          </div>
        </div>
      </div>

      {/* 搜索与筛选栏 */}
      <div className="bg-[#FFFFFF] rounded-[8px] border border-[#DCDFE6] p-[16px] mb-[24px]">
        <div className="flex items-center gap-[12px] flex-wrap">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[240px] max-w-[360px]">
            <Search className="w-[16px] h-[16px] absolute left-[12px] top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索模型名称..."
              className="w-full h-[36px] pl-[36px] pr-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 transition-colors placeholder:text-[#A0A0A0]"
            />
          </div>

          {/* 状态筛选标签 */}
          <div className="flex items-center gap-[4px]">
            {statusFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`h-[32px] px-[12px] text-[12px] rounded-[4px] transition-colors ${
                  statusFilter === opt.value
                    ? "bg-[#409EFF] text-white"
                    : "bg-[#FFFFFF] text-[#606266] border border-[#DCDFE6] hover:text-[#409EFF] hover:border-[#409EFF]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 模型卡片网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        {pagedModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isDefault={model.type === 'llm' && model.name === defaultModel}
            onSetDefault={handleSetDefault}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
          />
        ))}
        {filteredModels.length === 0 && (
          <div className="col-span-2 bg-[#FFFFFF] rounded-[8px] border border-[#DCDFE6] p-[48px] text-center">
            <Cpu className="w-[48px] h-[48px] text-[#A0A0A0] mx-auto mb-[12px]" />
            <div className="text-[14px] text-[#606266]">没有找到匹配的模型</div>
          </div>
        )}
      </div>

      {/* 分页 */}
      <div className="mt-[20px] flex justify-end">
        <Pagination
          current={safePage}
          total={filteredModels.length}
          pageSize={pageSize}
          onChange={setPage}
        />
      </div>

      {/* 注册模型弹窗 */}
      {showRegisterModal && (
        <RegisterModelModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(newModel) => {
            setModels((prev) => [...prev, newModel]);
            setShowRegisterModal(false);
          }}
        />
      )}

      {/* 模型详情弹窗 */}
      {showDetailModal && selectedModel && (
        <ModelDetailModal
          model={selectedModel}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedModel(null);
          }}
        />
      )}
    </div>
    </div>
  );
}

// ─── 模型卡片组件 ────────────────────────────────────────────────────────────────────

function ModelCard({
  model,
  isDefault,
  onSetDefault,
  onToggleStatus,
  onDelete,
  onViewDetail,
}: {
  model: ModelItem;
  isDefault: boolean;
  onSetDefault: (model: ModelItem) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetail: (model: ModelItem) => void;
}) {
  const status = statusConfig[model.status];

  return (
    <div
      className="bg-[#FFFFFF] rounded-[8px] border border-[#DCDFE6] p-[20px] hover:border-[#409EFF] hover:shadow-[0_2px_12px_0_rgba(0,0,0,0.1)] transition-all cursor-pointer"
      onClick={() => onViewDetail(model)}
    >
      {/* 头部：名称 + 状态 */}
      <div className="flex items-start justify-between mb-[16px]">
        <div className="flex items-center gap-[12px] min-w-0">
          <div className="w-[40px] h-[40px] rounded-[8px] bg-[#ECF5FF] flex items-center justify-center shrink-0">
            <Cpu className="w-[20px] h-[20px] text-[#409EFF]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-[6px]">
              <div className="text-[16px] font-semibold text-[#303133] truncate">
                {model.name}
              </div>
              {isDefault && (
                <span className="inline-flex items-center gap-[2px] px-[6px] py-[1px] text-[10px] font-medium text-[#E6A23C] bg-[#FDF6EC] border border-[#F5DAB1] rounded-[4px] shrink-0">
                  <Star className="w-[9px] h-[9px]" />
                  默认模型
                </span>
              )}
            </div>
            <div className="text-[12px] text-[#909399] mt-[2px]">{model.provider}</div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] text-[12px] rounded-[4px] border shrink-0 ${status.color}`}
        >
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{ backgroundColor: status.dot }}
          />
          {status.label}
        </span>
      </div>

      {/* 类型标签 */}
      <div className="mb-[12px]">
        <span
          className={`inline-flex px-[6px] py-[1px] text-[12px] rounded-[4px] border ${typeColorMap[model.type]}`}
        >
          {typeOptions.find((t) => t.value === model.type)?.label}
        </span>
      </div>

      {/* API 端点 */}
      <div className="bg-[#F5F7FA] rounded-[4px] px-[12px] py-[8px] mb-[16px]">
        <div className="text-[11px] text-[#909399] mb-[4px]">API Endpoint</div>
        <div className="text-[12px] text-[#606266] font-mono truncate" title={model.endpoint}>
          {model.endpoint}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div
        className="flex items-center gap-[8px] pt-[12px] border-t border-[#EBEEF5]"
        onClick={(e) => e.stopPropagation()}
      >
        {model.type === 'llm' && !isDefault && (
          <button
            onClick={() => onSetDefault(model)}
            className="h-[32px] px-[12px] text-[12px] rounded-[4px] border transition-colors flex items-center gap-[4px] border-[#E6A23C] text-[#E6A23C] hover:bg-[#FDF6EC]"
            title="设为会话默认模型"
          >
            <Star className="w-[14px] h-[14px]" />
            <span>设为默认</span>
          </button>
        )}
        {model.type === 'llm' && isDefault && (
          <button
            onClick={() => onSetDefault(model)}
            className="h-[32px] px-[12px] text-[12px] rounded-[4px] border transition-colors flex items-center gap-[4px] border-[#DCDFE6] text-[#909399] bg-[#F5F7FA] cursor-default"
            title="当前默认模型"
          >
            <Star className="w-[14px] h-[14px]" />
            <span>默认模型</span>
          </button>
        )}
        <button
          onClick={() => onToggleStatus(model.id)}
          className={`h-[32px] px-[12px] text-[12px] rounded-[4px] border transition-colors flex items-center gap-[4px] ${
            model.status === "running"
              ? "border-[#F56C6C] text-[#F56C6C] hover:bg-[#FEF0F0]"
              : "border-[#67C23A] text-[#67C23A] hover:bg-[#F0F9EB]"
          }`}
          title={model.status === "running" ? "停止" : "启动"}
        >
          {model.status === "running" ? (
            <>
              <CircleStop className="w-[14px] h-[14px]" />
              <span>停止</span>
            </>
          ) : (
            <>
              <Play className="w-[14px] h-[14px]" />
              <span>启动</span>
            </>
          )}
        </button>
        <button
          onClick={() => onViewDetail(model)}
          className="h-[32px] w-[32px] flex items-center justify-center text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:text-[#409EFF] hover:border-[#409EFF] transition-colors"
          title="详情"
        >
          <Eye className="w-[14px] h-[14px]" />
        </button>
        <button
          className="h-[32px] w-[32px] flex items-center justify-center text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:text-[#409EFF] hover:border-[#409EFF] transition-colors"
          title="编辑"
        >
          <Edit3 className="w-[14px] h-[14px]" />
        </button>
        <button
          onClick={() => onDelete(model.id)}
          className="h-[32px] w-[32px] flex items-center justify-center text-[#F56C6C] border border-[#DCDFE6] rounded-[4px] hover:bg-[#FEF0F0] hover:border-[#F56C6C] transition-colors"
          title="删除"
        >
          <Trash2 className="w-[14px] h-[14px]" />
        </button>
      </div>
    </div>
  );
}

// ─── 注册模型弹窗 ─────────────────────────────────────────────────────────────────────

function RegisterModelModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (model: ModelItem) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    provider: "",
    type: "llm" as ModelType,
    endpoint: "",
    apiKey: "",
    description: "",
  });

  const handleSubmit = () => {
    if (!form.name || !form.provider || !form.endpoint || !form.apiKey) return;
    const newModel: ModelItem = {
      id: `m-${Date.now()}`,
      name: form.name,
      provider: form.provider,
      type: form.type,
      status: "stopped",
      endpoint: form.endpoint,
      apiKey: form.apiKey,
      description: form.description,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onSuccess(newModel);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#FFFFFF] rounded-[8px] w-[560px] max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#DCDFE6]">
          <h2 className="text-[18px] font-semibold text-[#303133]">注册模型</h2>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center text-[#A0A0A0] hover:text-[#606266] hover:bg-[#F5F7FA] rounded-[4px] transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="px-[24px] py-[20px] space-y-[16px]">
          <div className="grid grid-cols-2 gap-[16px]">
            <FormField label="模型名称" required>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如 GPT-4o"
                className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 placeholder:text-[#A0A0A0]"
              />
            </FormField>
            <FormField label="服务商" required>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] bg-[#FFFFFF]"
              >
                <option value="">请选择</option>
                {providerOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="模型类型" required>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ModelType })}
                className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] bg-[#FFFFFF]"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="API Endpoint" required>
              <input
                value={form.endpoint}
                onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                placeholder="https://api.example.com/v1/..."
                className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 placeholder:text-[#A0A0A0]"
              />
            </FormField>
          </div>
          <FormField label="API Key" required>
            <input
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="sk-..."
              type="password"
              className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 placeholder:text-[#A0A0A0]"
            />
          </FormField>
          <FormField label="描述">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="模型用途、适用场景等..."
              rows={3}
              className="w-full px-[12px] py-[8px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 resize-none placeholder:text-[#A0A0A0]"
            />
          </FormField>
        </div>

        {/* 弹窗底部 */}
        <div className="flex justify-end gap-[12px] px-[24px] py-[16px] border-t border-[#DCDFE6]">
          <button
            onClick={onClose}
            className="h-[36px] px-[16px] text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#F5F7FA] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="h-[36px] px-[16px] text-[14px] bg-[#409EFF] text-white rounded-[4px] hover:bg-[#66B1FF] active:bg-[#3A8EE6] transition-colors"
          >
            确认注册
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 模型详情弹窗 ─────────────────────────────────────────────────────────────────────

function ModelDetailModal({
  model,
  onClose,
}: {
  model: ModelItem;
  onClose: () => void;
}) {
  const status = statusConfig[model.status];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#FFFFFF] rounded-[8px] w-[560px] max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#DCDFE6]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[40px] rounded-[8px] bg-[#ECF5FF] flex items-center justify-center">
              <Cpu className="w-[20px] h-[20px] text-[#409EFF]" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#303133]">{model.name}</h2>
              <p className="text-[12px] text-[#909399] mt-[1px]">{model.provider}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center text-[#A0A0A0] hover:text-[#606266] hover:bg-[#F5F7FA] rounded-[4px] transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* 详情内容 */}
        <div className="px-[24px] py-[20px] space-y-[24px]">
          {/* 基本信息 */}
          <div>
            <h3 className="text-[14px] font-semibold text-[#303133] mb-[12px]">基本信息</h3>
            <div className="grid grid-cols-2 gap-[16px]">
              <DetailItem
                label="模型类型"
                value={
                  <span
                    className={`inline-flex px-[6px] py-[1px] text-[12px] rounded-[4px] border ${typeColorMap[model.type]}`}
                  >
                    {typeOptions.find((t) => t.value === model.type)?.label}
                  </span>
                }
              />
              <DetailItem
                label="状态"
                value={
                  <span
                    className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] text-[12px] rounded-[4px] border ${status.color}`}
                  >
                    <span
                      className="w-[6px] h-[6px] rounded-full"
                      style={{ backgroundColor: status.dot }}
                    />
                    {status.label}
                  </span>
                }
              />
              <DetailItem label="服务商" value={model.provider} />
              <DetailItem label="创建时间" value={model.createdAt} />
            </div>
          </div>

          {/* API 配置 */}
          <div>
            <h3 className="text-[14px] font-semibold text-[#303133] mb-[12px]">API 配置</h3>
            <div className="space-y-[12px]">
              <DetailItem
                label="Endpoint"
                value={
                  <code className="text-[12px] text-[#606266] bg-[#F5F7FA] px-[8px] py-[4px] rounded-[4px] block truncate">
                    {model.endpoint}
                  </code>
                }
              />
              <DetailItem
                label="API Key"
                value={
                  <code className="text-[12px] text-[#909399] bg-[#F5F7FA] px-[8px] py-[4px] rounded-[4px]">
                    {model.apiKey}
                  </code>
                }
              />
            </div>
          </div>

          {/* 描述 */}
          {model.description && (
            <div>
              <h3 className="text-[14px] font-semibold text-[#303133] mb-[12px]">描述</h3>
              <p className="text-[14px] text-[#606266] leading-relaxed">{model.description}</p>
            </div>
          )}
        </div>

        {/* 弹窗底部 */}
        <div className="flex justify-end gap-[12px] px-[24px] py-[16px] border-t border-[#DCDFE6]">
          <button
            onClick={onClose}
            className="h-[36px] px-[16px] text-[14px] text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:bg-[#F5F7FA] transition-colors"
          >
            关闭
          </button>
          <button className="h-[36px] px-[16px] text-[14px] bg-[#409EFF] text-white rounded-[4px] hover:bg-[#66B1FF] active:bg-[#3A8EE6] transition-colors flex items-center gap-[4px]">
            <Edit3 className="w-[14px] h-[14px]" />
            <span>编辑配置</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 辅助组件 ─────────────────────────────────────────────────────────────────────────

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
    <div className="flex flex-col gap-[6px]">
      <label className="text-[14px] text-[#606266] font-medium">
        {label}
        {required && <span className="text-[#F56C6C] ml-[4px]">*</span>}
      </label>
      {children}
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[12px] text-[#909399] mb-[4px]">{label}</div>
      <div className="text-[14px] text-[#303133]">{value}</div>
    </div>
  );
}
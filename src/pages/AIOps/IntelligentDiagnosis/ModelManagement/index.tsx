// [功能标注] PRD FR-1 模型管理
import { useState, useMemo, useRef } from "react";
import { NewTag } from "../feature-tags";
import {
  Cpu,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  X,
  Star,
} from "lucide-react";
import { Pagination, getDefaultModel, setDefaultModel } from "../_shared";

// ─── 类型定义 ───────────────────────────────────────────────────────────────────────

type ModelStatus = "running" | "stopped" | "error";
type ModelType = "chat" | "embedding" | "rerank" | "multimodal";

interface ModelItem {
  id: string;
  name: string;
  provider: string;
  type: ModelType;
  protocol: string;
  status: ModelStatus;
  baseUrl: string;
  apiKey: string;
  contextWindow: number;
  maxTokens: number;
  createdAt: string;
}

/** 平台内置模型统一归属的模型服务商（锁定，不给用户修改，预留外接模型口子） */
const DEFAULT_PROVIDER = "算力加速平台";

/** 可设为默认模型的类型：仅对话与多模态（嵌入/Rerank 为检索能力，不可作主推理模型） */
const canBeDefault = (type: ModelType) => type === "chat" || type === "multimodal";

// ─── 常量配置 ───────────────────────────────────────────────────────────────────────

const typeOptions: { value: ModelType; label: string }[] = [
  { value: "chat", label: "对话" },
  { value: "embedding", label: "嵌入" },
  { value: "rerank", label: "Rerank" },
  { value: "multimodal", label: "多模态" },
];

const typeFilterOptions = [
  { value: "", label: "全部" },
  { value: "chat", label: "对话" },
  { value: "embedding", label: "嵌入" },
  { value: "rerank", label: "Rerank" },
  { value: "multimodal", label: "多模态" },
];

const typeColorMap: Record<ModelType, string> = {
  chat: "text-[#409EFF] bg-[#ECF5FF] border-[#B3D8FF]",
  embedding: "text-[#67C23A] bg-[#F0F9EB] border-[#C2E7B0]",
  rerank: "text-[#9C27B0] bg-[#F3E5F5] border-[#E1BEE7]",
  multimodal: "text-[#E6A23C] bg-[#FDF6EC] border-[#F5DAB1]",
};

/** API 格式（平台封装模型服务层后，对外统一暴露的标准接口形态） */
const protocolOptions: { value: string; label: string }[] = [
  { value: "OpenAI Responses API 格式", label: "OpenAI Responses" },
  { value: "OpenAI Chat Completions 格式", label: "OpenAI Chat Completions" },
  { value: "Anthropic Messages 格式", label: "Anthropic Messages" },
];

// ─── Mock 数据 ──────────────────────────────────────────────────────────────────────

const mockModels: ModelItem[] = [
  {
    id: "1",
    name: "GPT-4o",
    provider: DEFAULT_PROVIDER,
    type: "multimodal",
    protocol: "OpenAI Responses API 格式",
    status: "running",
    baseUrl: "https://api.xxx.com/v1",
    apiKey: "sk-****",
    contextWindow: 128000,
    maxTokens: 4096,
    createdAt: "2026-06-01",
  },
  {
    id: "2",
    name: "Claude 3.5 Sonnet",
    provider: DEFAULT_PROVIDER,
    type: "chat",
    protocol: "Anthropic Messages 格式",
    status: "running",
    baseUrl: "https://api.xxx.com/v1",
    apiKey: "sk-ant-****",
    contextWindow: 200000,
    maxTokens: 8192,
    createdAt: "2026-06-15",
  },
  {
    id: "3",
    name: "text-embedding-3-large",
    provider: DEFAULT_PROVIDER,
    type: "embedding",
    protocol: "OpenAI Chat Completions 格式",
    status: "running",
    baseUrl: "https://api.xxx.com/v1",
    apiKey: "sk-****",
    contextWindow: 8191,
    maxTokens: 8191,
    createdAt: "2026-05-20",
  },
  {
    id: "4",
    name: "Qwen2.5-72B",
    provider: DEFAULT_PROVIDER,
    type: "chat",
    protocol: "OpenAI Chat Completions 格式",
    status: "running",
    baseUrl: "https://api.xxx.com/v1",
    apiKey: "sk-****",
    contextWindow: 128000,
    maxTokens: 4096,
    createdAt: "2026-07-01",
  },
  {
    id: "5",
    name: "DeepSeek-V3",
    provider: DEFAULT_PROVIDER,
    type: "chat",
    protocol: "OpenAI Chat Completions 格式",
    status: "stopped",
    baseUrl: "http://localhost:8000/v1",
    apiKey: "sk-local-****",
    contextWindow: 64000,
    maxTokens: 4096,
    createdAt: "2026-07-10",
  },
  {
    id: "6",
    name: "BGE-M3",
    provider: DEFAULT_PROVIDER,
    type: "embedding",
    protocol: "OpenAI Chat Completions 格式",
    status: "stopped",
    baseUrl: "http://localhost:8001/v1",
    apiKey: "sk-local-****",
    contextWindow: 8191,
    maxTokens: 8191,
    createdAt: "2026-06-20",
  },
  {
    id: "7",
    name: "Stable Diffusion XL",
    provider: DEFAULT_PROVIDER,
    type: "multimodal",
    protocol: "OpenAI Chat Completions 格式",
    status: "error",
    baseUrl: "https://api.xxx.com/v1",
    apiKey: "sk-****",
    contextWindow: 128000,
    maxTokens: 4096,
    createdAt: "2026-07-25",
  },
  {
    id: "8",
    name: "Gemini 1.5 Pro",
    provider: DEFAULT_PROVIDER,
    type: "multimodal",
    protocol: "OpenAI Chat Completions 格式",
    status: "running",
    baseUrl: "https://api.xxx.com/v1",
    apiKey: "AIza****",
    contextWindow: 1000000,
    maxTokens: 8192,
    createdAt: "2026-07-05",
  },
];

// ─── 主组件 ─────────────────────────────────────────────────────────────────────────

export function ModelManagementPage() {
  const [models, setModels] = useState<ModelItem[]>(mockModels);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const [defaultModel, setDefaultModelName] = useState<string>(getDefaultModel());
  const pageSize = 4;

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = !typeFilter || m.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [models, searchTerm, typeFilter]);

  // 分页数据（筛选变化时安全回退页码）
  const totalPages = Math.max(1, Math.ceil(filteredModels.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedModels = filteredModels.slice((safePage - 1) * pageSize, safePage * pageSize);

  // 设为默认模型（仅对话/多模态模型可设为会话默认，持久化到 localStorage）
  const handleSetDefault = (model: ModelItem) => {
    if (!canBeDefault(model.type)) return;
    setDefaultModel(model.name);
    setDefaultModelName(model.name);
  };

  const handleEdit = (model: ModelItem) => {
    setEditingModel(model);
    setShowEditModal(true);
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
      {/* 页面标题 */}
      <div className="px-[24px] pt-[16px] pb-[8px] bg-[#FFFFFF] border-b border-[#DCDFE6] shrink-0">
        <h1 className="text-[16px] font-semibold text-[#303133] flex items-center gap-[6px]">模型管理 <NewTag code="FR-1" /></h1>
      </div>
      {/* 工具栏：创建(左) + 搜索/筛选(右) */}
      <div className="px-[24px] py-[12px] bg-[#FFFFFF] border-b border-[#DCDFE6] shrink-0">
        <div className="flex items-center justify-between gap-[12px] flex-wrap">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="h-[32px] px-[16px] bg-[#409EFF] text-white text-[14px] rounded-[4px] hover:bg-[#66B1FF] active:bg-[#3A8EE6] transition-colors flex items-center gap-[6px] shrink-0"
          >
            <Plus className="w-[14px] h-[14px]" />
            <span>注册模型</span>
          </button>
          <div className="flex items-center gap-[12px] flex-wrap">
            {/* 类型筛选 */}
            <div className="flex items-center gap-1 bg-[#F5F7FA] rounded-[4px] p-[2px]">
              {typeFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={`px-3 h-7 text-[13px] rounded-[4px] transition-colors ${
                    typeFilter === opt.value
                      ? "bg-white text-[#409EFF] shadow-sm font-medium"
                      : "text-[#606266] hover:text-[#409EFF]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {/* 搜索框 */}
            <div className="flex items-stretch h-[36px] w-[240px]">
              <div className="relative flex-1">
                <Search className="w-[16px] h-[16px] absolute left-[12px] top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                <input
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索模型名称..."
                  className="w-full h-[36px] pl-[36px] pr-[36px] text-[14px] text-[#303133] border border-[#DCDFE6] border-r-0 rounded-l-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 transition-colors placeholder:text-[#A0A0A0]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] flex items-center justify-center rounded-full text-[#A0A0A0] hover:bg-[#F5F7FA] hover:text-[#606266] transition-colors"
                    title="清空搜索"
                  >
                    <X className="w-[14px] h-[14px]" />
                  </button>
                )}
              </div>
              <button
                onClick={() => searchRef.current?.focus()}
                className="h-[36px] px-[16px] bg-[#409EFF] text-white text-[14px] rounded-r-[4px] hover:bg-[#66B1FF] active:bg-[#3A8EE6] transition-colors flex items-center gap-[4px] shrink-0"
              >
                <Search className="w-[14px] h-[14px]" />
                <span>搜索</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 p-[24px] overflow-y-auto">

      {/* 模型卡片网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        {pagedModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isDefault={canBeDefault(model.type) && model.name === defaultModel}
            onSetDefault={handleSetDefault}
            onEdit={handleEdit}
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
        <ModelFormModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(newModel) => {
            setModels((prev) => [...prev, newModel]);
            setShowRegisterModal(false);
          }}
        />
      )}

      {/* 编辑模型弹窗 */}
      {showEditModal && editingModel && (
        <ModelFormModal
          model={editingModel}
          onClose={() => {
            setShowEditModal(false);
            setEditingModel(null);
          }}
          onSuccess={(saved) => {
            setModels((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
            setShowEditModal(false);
            setEditingModel(null);
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
  onEdit,
  onDelete,
  onViewDetail,
}: {
  model: ModelItem;
  isDefault: boolean;
  onSetDefault: (model: ModelItem) => void;
  onEdit: (model: ModelItem) => void;
  onDelete: (id: string) => void;
  onViewDetail: (model: ModelItem) => void;
}) {
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
            <div className="text-[12px] text-[#909399] mt-[2px]">{model.provider} · {protocolOptions.find((p) => p.value === model.protocol)?.label}</div>
          </div>
        </div>
      </div>

      {/* 类型标签 */}
      <div className="mb-[12px]">
        <span
          className={`inline-flex px-[6px] py-[1px] text-[12px] rounded-[4px] border ${typeColorMap[model.type]}`}
        >
          {typeOptions.find((t) => t.value === model.type)?.label}
        </span>
      </div>

      {/* BaseURL */}
      <div className="bg-[#F5F7FA] rounded-[4px] px-[12px] py-[8px] mb-[16px]">
        <div className="text-[11px] text-[#909399] mb-[4px]">请求地址</div>
        <div className="text-[12px] text-[#606266] font-mono truncate" title={model.baseUrl}>
          {model.baseUrl}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div
        className="flex items-center gap-[8px] pt-[12px] border-t border-[#EBEEF5]"
        onClick={(e) => e.stopPropagation()}
      >
        {canBeDefault(model.type) && !isDefault && (
          <button
            onClick={() => onSetDefault(model)}
            className="h-[32px] px-[12px] text-[12px] rounded-[4px] border transition-colors flex items-center gap-[4px] border-[#E6A23C] text-[#E6A23C] hover:bg-[#FDF6EC]"
            title="设为会话默认模型"
          >
            <Star className="w-[14px] h-[14px]" />
            <span>设为默认</span>
          </button>
        )}
        {canBeDefault(model.type) && isDefault && (
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
          onClick={() => onViewDetail(model)}
          className="h-[32px] w-[32px] flex items-center justify-center text-[#606266] border border-[#DCDFE6] rounded-[4px] hover:text-[#409EFF] hover:border-[#409EFF] transition-colors"
          title="详情"
        >
          <Eye className="w-[14px] h-[14px]" />
        </button>
        <button
          onClick={() => onEdit(model)}
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

// ─── 模型表单弹窗（注册 / 编辑共用） ──────────────────────────────────────────────────

function ModelFormModal({
  model,
  onClose,
  onSuccess,
}: {
  model?: ModelItem;
  onClose: () => void;
  onSuccess: (model: ModelItem) => void;
}) {
  const isEdit = !!model;
  const [form, setForm] = useState({
    name: model?.name ?? "",
    type: (model?.type ?? "chat") as ModelType,
    protocol: model?.protocol ?? "openai-chat",
    baseUrl: model?.baseUrl ?? "",
    apiKey: model?.apiKey ?? "",
    contextWindow: model?.contextWindow ?? 128000,
    maxTokens: model?.maxTokens ?? 4096,
  });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim() || !form.baseUrl.trim()) {
      setError("请填写模型名称和 BaseURL");
      return;
    }
    setError("");
    const saved: ModelItem = {
      id: model?.id ?? `m-${Date.now()}`,
      name: form.name.trim(),
      provider: model?.provider ?? DEFAULT_PROVIDER,
      type: form.type,
      protocol: form.protocol,
      status: model?.status ?? "stopped",
      baseUrl: form.baseUrl.trim(),
      apiKey: form.apiKey.trim(),
      contextWindow: form.contextWindow,
      maxTokens: form.maxTokens,
      createdAt: model?.createdAt ?? new Date().toISOString().slice(0, 10),
    };
    onSuccess(saved);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#FFFFFF] rounded-[8px] w-[560px] max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[#DCDFE6]">
          <h2 className="text-[18px] font-semibold text-[#303133]">{isEdit ? "编辑模型" : "注册模型"}</h2>
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
            <FormField label="模型服务商">
              <input
                value={DEFAULT_PROVIDER}
                disabled
                className="w-full h-[36px] px-[12px] text-[14px] text-[#909399] bg-[#F5F7FA] border border-[#DCDFE6] rounded-[4px] cursor-not-allowed"
              />
            </FormField>
            <FormField label="模型 ID" required>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如 GPT-4o"
                className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 placeholder:text-[#A0A0A0]"
              />
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
            <FormField label="API 格式" required>
              <select
                value={form.protocol}
                onChange={(e) => setForm({ ...form, protocol: e.target.value })}
                className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] bg-[#FFFFFF]"
              >
                {protocolOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="请求地址" required>
            <input
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
              className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 placeholder:text-[#A0A0A0]"
            />
          </FormField>
          <FormField label="API 密钥">
            <input
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="平台内网/网关部署可留空"
              type="password"
              className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20 placeholder:text-[#A0A0A0]"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-[16px]">
            <FormField label="上下文窗口 (tokens)">
              <input
                type="number"
                value={form.contextWindow}
                onChange={(e) => setForm({ ...form, contextWindow: Number(e.target.value) })}
                className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20"
              />
            </FormField>
            <FormField label="最大输出 max_token">
              <input
                type="number"
                value={form.maxTokens}
                onChange={(e) => setForm({ ...form, maxTokens: Number(e.target.value) })}
                className="w-full h-[36px] px-[12px] text-[14px] text-[#303133] border border-[#DCDFE6] rounded-[4px] outline-none focus:border-[#409EFF] focus:ring-[2px] focus:ring-[#409EFF]/20"
              />
            </FormField>
          </div>
        </div>

        {/* 弹窗底部 */}
        <div className="px-[24px] pt-[12px]">
          {error && (
            <div className="mb-[12px] text-[12px] text-[#F56C6C] bg-[#FEF0F0] border border-[#FBC4C4] rounded-[4px] px-[12px] py-[8px]">
              {error}
            </div>
          )}
        </div>
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
            {isEdit ? "保存修改" : "确认注册"}
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
            <DetailItem label="模型服务商" value={model.provider} />
            <DetailItem label="API 格式" value={protocolOptions.find((p) => p.value === model.protocol)?.label ?? model.protocol} />
            <DetailItem label="上下文窗口" value={`${model.contextWindow.toLocaleString()} tokens`} />
            <DetailItem label="最大输出" value={`${model.maxTokens.toLocaleString()} tokens`} />
            <DetailItem label="创建时间" value={model.createdAt} />
          </div>
        </div>

        {/* API 配置 */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#303133] mb-[12px]">API 配置</h3>
          <div className="space-y-[12px]">
            <DetailItem
              label="请求地址"
              value={
                <code className="text-[12px] text-[#606266] bg-[#F5F7FA] px-[8px] py-[4px] rounded-[4px] block truncate">
                  {model.baseUrl}
                </code>
              }
            />
            <DetailItem
              label="API 密钥"
              value={
                <code className="text-[12px] text-[#909399] bg-[#F5F7FA] px-[8px] py-[4px] rounded-[4px]">
                  {model.apiKey || "（未填写）"}
                </code>
              }
            />
          </div>
        </div>
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
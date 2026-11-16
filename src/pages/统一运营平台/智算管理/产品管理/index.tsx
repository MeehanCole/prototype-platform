import { useState, type ReactNode } from "react";
import {
  Plus,
  Search,
  RotateCcw,
  Upload,
  Download,
  Pencil,
  Eye,
  Bell,
  AlertCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  X,
  FolderTree,
  Shield,
} from "lucide-react";

// ─── 类型 ────────────────────────────────────────────────────────────────────
type TabKey = "list" | "catalog" | "whitelist";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  subName: string;
  imageInstance: string;
  enName: string;
  imageEnName: string;
  path: string;
  status: "enabled" | "disabled";
  updatedAt: string;
}

// ─── 模拟数据 ──────────────────────────────────────────────────────────────────
const mockProducts: ProductRow[] = [
  { id: "1", name: "开发平台", category: "通用类", subName: "开发环境", imageInstance: "智算平台开发环境镜像", enName: "Development Platform", imageEnName: "MirrorEnv1", path: "xunfei_pd_v1", status: "enabled", updatedAt: "2026-07-01 09:15:39" },
  { id: "2", name: "训练平台", category: "高性能类", subName: "训练环境", imageInstance: "智算平台训练环境镜像", enName: "Training Platform", imageEnName: "MirrorEnv2", path: "xunfei_tr_v1", status: "enabled", updatedAt: "2026-07-02 14:30:00" },
  { id: "3", name: "推理平台", category: "信创类", subName: "推理环境", imageInstance: "智算平台推理环境镜像", enName: "Inference Platform", imageEnName: "MirrorEnv3", path: "xunfei_inf_v1", status: "disabled", updatedAt: "2026-06-28 10:00:00" },
  { id: "4", name: "数据分析", category: "通用类", subName: "分析环境", imageInstance: "智算平台分析环境镜像", enName: "Data Analytics", imageEnName: "MirrorEnv4", path: "xunfei_da_v1", status: "enabled", updatedAt: "2026-07-03 16:45:22" },
  { id: "5", name: "模型服务", category: "高性能类", subName: "服务环境", imageInstance: "智算平台服务环境镜像", enName: "Model Service", imageEnName: "MirrorEnv5", path: "xunfei_ms_v1", status: "enabled", updatedAt: "2026-07-04 11:20:10" },
];

const categoryOptions = ["通用类", "信创类", "高性能类"];

const whitelistData: Record<string, { region: string; regionEn: string; grantedBy: string; grantedAt: string }[]> = {
  "开发环境": [
    { region: "测试区", regionEn: "CSA", grantedBy: "admin", grantedAt: "2026-06-01 10:00:00" },
    { region: "开发区", regionEn: "DSA", grantedBy: "admin", grantedAt: "2026-06-01 10:05:00" },
  ],
  "训练环境": [
    { region: "生产区", regionEn: "PSA", grantedBy: "admin", grantedAt: "2026-06-02 14:00:00" },
    { region: "测试区", regionEn: "CSA", grantedBy: "admin", grantedAt: "2026-06-02 14:30:00" },
  ],
  "推理环境": [
    { region: "生产区", regionEn: "PSA", grantedBy: "admin", grantedAt: "2026-06-03 09:00:00" },
  ],
};

// ─── 主组件 ────────────────────────────────────────────────────────────────────
export default function ProductManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("list");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 顶部导航 */}
      <header className="h-[50px] bg-[#043268] flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-[39px] h-[33px] bg-white/10 rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">IC</span>
          </div>
          <span className="text-white text-lg font-semibold tracking-wide">智算管理平台</span>
        </div>
        <div className="w-px h-5 bg-white/20 mx-4" />
        <nav className="flex items-center gap-6">
          <span className="text-white text-sm cursor-pointer hover:text-blue-300 transition-colors">总览</span>
          <span className="text-white text-sm cursor-pointer hover:text-blue-300 transition-colors">平台运营</span>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-white/80 text-sm">admin</span>
          <div className="w-7 h-7 rounded-full bg-[#1890FF] flex items-center justify-center cursor-pointer">
            <span className="text-white text-xs font-medium">A</span>
          </div>
          <Bell className="w-4 h-4 text-white/70 cursor-pointer hover:text-white transition-colors" />
        </div>
      </header>

      {/* 主体 */}
      <div className="flex flex-1 min-h-0">
        {/* 左侧菜单 */}
        <aside className="w-[202px] bg-[#F2F2F2]/62 border-r border-[#D7D7D7]/69 flex flex-col shrink-0">
          <div className="px-5 py-5">
            <h3 className="text-base font-semibold text-black mb-3">产品管理</h3>
          </div>
          <nav className="flex-1 px-2">
            <div
              onClick={() => setActiveTab("list")}
              className={`px-3 py-2 text-sm cursor-pointer rounded flex items-center gap-2 ${activeTab === "list" ? "text-[#1890FF] bg-[#F6F6F6]" : "text-[#797979] hover:text-[#333]"}`}
            >
              <FolderTree className="w-4 h-4" /> 产品管理
            </div>
            <div
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-2 text-sm cursor-pointer rounded flex items-center gap-2 ${activeTab === "catalog" ? "text-[#1890FF] bg-[#F6F6F6]" : "text-[#797979] hover:text-[#333]"}`}
            >
              <Plus className="w-4 h-4" /> 产品目录
            </div>
            <div
              onClick={() => setActiveTab("whitelist")}
              className={`px-3 py-2 text-sm cursor-pointer rounded flex items-center gap-2 ${activeTab === "whitelist" ? "text-[#1890FF] bg-[#F6F6F6]" : "text-[#797979] hover:text-[#333]"}`}
            >
              <Shield className="w-4 h-4" /> 产品白名单
            </div>
          </nav>
        </aside>

        {/* 右侧内容 */}
        <main className="flex-1 min-w-0 overflow-x-hidden p-4">
          {activeTab === "list" && <ProductList />}
          {activeTab === "catalog" && <ProductCatalog />}
          {activeTab === "whitelist" && <ProductWhitelist />}
        </main>
      </div>
    </div>
  );
}

// ─── 产品管理列表 ─────────────────────────────────────────────────────────────────
function ProductList() {
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showViewModal, setShowViewModal] = useState<ProductRow | null>(null);

  const filtered = mockProducts.filter((p) => {
    if (searchName && !p.name.includes(searchName)) return false;
    if (searchCategory && p.category !== searchCategory) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div>
      {/* 筛选区 */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#333] whitespace-nowrap">产品名称</label>
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-[200px] h-[29px] px-2 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1890FF]"
              placeholder="请选择产品名称"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#333] whitespace-nowrap">产品分类</label>
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-[150px] h-[29px] px-2 text-sm border border-[#D9D9D9] rounded bg-white focus:outline-none focus:border-[#1890FF]"
            >
              <option value="">请选择</option>
              {categoryOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="px-4 h-[29px] bg-[#1890FF] text-white text-xs rounded hover:bg-[#40a9ff] transition-colors flex items-center gap-1">
            <Search className="w-3 h-3" /> 查询
          </button>
          <button
            onClick={() => { setSearchName(""); setSearchCategory(""); }}
            className="px-4 h-[29px] bg-white text-[#333] text-xs border border-[#D9D9D9] rounded hover:bg-[#F6F6F6] transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> 重置
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F0F0F0]">
          <button className="px-3 h-[29px] bg-[#1890FF] text-white text-xs rounded hover:bg-[#40a9ff] transition-colors flex items-center gap-1">
            <Plus className="w-3 h-3" /> 创建
          </button>
          <button className="px-3 h-[29px] bg-[#AAAAAA] text-white text-xs rounded hover:bg-[#999] transition-colors flex items-center gap-1">
            <Upload className="w-3 h-3" /> 导入
          </button>
          <button className="px-3 h-[29px] border border-[#D9D9D9] text-[#333] text-xs rounded hover:bg-[#F6F6F6] transition-colors flex items-center gap-1">
            <Download className="w-3 h-3" /> 导出
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] text-sm">
            <thead>
              <tr className="bg-[#F2F2F2] text-[#333]">
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">产品名称</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">产品分类</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">子产品名称</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">镜像实例名</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">产品英文名</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">产品镜像英文名</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">产品路径</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">状态</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">更新时间</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className={`border-t border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors ${row.status === "disabled" ? "opacity-50" : ""}`}>
                  <td className="px-3 py-3 text-[#333]">{row.name}</td>
                  <td className="px-3 py-3 text-[#666]">{row.category}</td>
                  <td className="px-3 py-3 text-[#333]">{row.subName}</td>
                  <td className="px-3 py-3 text-[#666]">{row.imageInstance}</td>
                  <td className="px-3 py-3 text-[#666]">{row.enName}</td>
                  <td className="px-3 py-3 text-[#666]">{row.imageEnName}</td>
                  <td className="px-3 py-3 text-[#666] font-mono text-xs">{row.path}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${row.status === "enabled" ? "bg-[#E6F7FF] text-[#1890FF]" : "bg-[#F5F5F5] text-[#999]"}`}>
                      {row.status === "enabled" ? "启用" : "禁用"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[#999] text-xs">{row.updatedAt}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-[#1890FF] hover:underline text-xs">{row.status === "enabled" ? "禁用" : "启用"}</button>
                      <button onClick={() => setShowViewModal(row)} className="text-[#1890FF] hover:underline text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" /> 查看
                      </button>
                      <button className="text-[#1890FF] hover:underline text-xs flex items-center gap-1">
                        <Pencil className="w-3 h-3" /> 编辑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0F0F0]">
          <span className="text-xs text-[#666]">共 {filtered.length} 条</span>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="text-xs border border-[#D9D9D9] rounded px-2 py-1"
            >
              <option value={10}>10 条/页</option>
              <option value={20}>20 条/页</option>
              <option value={50}>50 条/页</option>
            </select>
            <button disabled={currentPage <= 1} className="w-7 h-7 flex items-center justify-center border border-[#D9D9D9] rounded text-xs disabled:opacity-40 hover:bg-[#F6F6F6]">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-xs text-[#333]">{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages} className="w-7 h-7 flex items-center justify-center border border-[#D9D9D9] rounded text-xs disabled:opacity-40 hover:bg-[#F6F6F6]">
              <ChevronRightIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {showViewModal && <ViewModal row={showViewModal} onClose={() => setShowViewModal(null)} />}
    </div>
  );
}

// ─── 产品目录（创建/编辑表单） ──────────────────────────────────────────────────────
function ProductCatalog() {
  const formInputClass = "w-full h-8 px-2 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1890FF] bg-white";
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
        <h2 className="text-base font-semibold text-[#333]">产品目录 - 创建</h2>
      </div>
      <div className="p-6 max-w-[900px]">
        {/* 基础信息 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#333] mb-3 pb-2 border-b border-[#F0F0F0]">基础信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="产品名称" required>
              <select className={formInputClass}><option value="">请选择</option><option>开发平台</option><option>训练平台</option></select>
            </FormField>
            <FormField label="产品分类" required>
              <select className={formInputClass}>{categoryOptions.map((c) => <option key={c}>{c}</option>)}</select>
            </FormField>
            <FormField label="产品镜像中文名" required>
              <input className={formInputClass} placeholder="如 智算平台开发环境镜像" />
            </FormField>
            <FormField label="产品镜像英文名" required>
              <input className={formInputClass} placeholder="如 MirrorEnv1" />
            </FormField>
            <FormField label="产品中文名" required>
              <input className={formInputClass} placeholder="如 开发平台" />
            </FormField>
            <FormField label="产品英文名" required>
              <input className={formInputClass} placeholder="如 Development Platform" />
            </FormField>
            <FormField label="产品编码" required>
              <input className={formInputClass} placeholder="如 dev_platform_v1" />
            </FormField>
            <FormField label="产品版本" required>
              <input className={formInputClass} placeholder="如 1.0.0" />
            </FormField>
            <FormField label="产品路径" required>
              <input className={formInputClass} placeholder="如 xunfei_pd_v1" />
            </FormField>
            <FormField label="子产品编码" required>
              <input className={formInputClass} placeholder="如 dev_env_v1" />
            </FormField>
          </div>
        </div>

        {/* 配额信息 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#333] mb-3 pb-2 border-b border-[#F0F0F0]">配额信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="镜像实例名" required>
              <select className={formInputClass}><option value="">请选择</option><option>智算平台开发环境镜像</option></select>
            </FormField>
            <FormField label="子产品路径" required>
              <input className={formInputClass} placeholder="如 dev_env_path" />
            </FormField>
            <FormField label="CPU" required>
              <select className={formInputClass}><option>2</option><option>4</option><option>8</option><option>16</option><option>32</option><option>64</option></select>
            </FormField>
            <FormField label="GPU" required>
              <select className={formInputClass}><option>0</option><option>1</option><option>2</option><option>4</option><option>8</option></select>
            </FormField>
            <FormField label="内存 (Gi)" required>
              <select className={formInputClass}><option>4</option><option>8</option><option>16</option><option>32</option><option>64</option><option>128</option></select>
            </FormField>
            <FormField label="存储 (Gi)" required>
              <select className={formInputClass}><option>100</option><option>500</option><option>1000</option><option>2000</option><option>4000</option></select>
            </FormField>
            <FormField label="产品镜像 CPU" required>
              <select className={formInputClass}><option>2</option><option>4</option><option>8</option></select>
            </FormField>
            <FormField label="产品镜像 GPU" required>
              <select className={formInputClass}><option>0</option><option>1</option><option>2</option></select>
            </FormField>
            <FormField label="产品镜像 内存" required>
              <select className={formInputClass}><option>4</option><option>8</option><option>16</option></select>
            </FormField>
            <FormField label="产品镜像 存储" required>
              <select className={formInputClass}><option>100</option><option>500</option><option>1000</option></select>
            </FormField>
            <FormField label="子产品白名单功能区" required>
              <select className={formInputClass} multiple>
                <option>测试区</option><option>开发区</option><option>生产区</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[#F0F0F0]">
          <button className="px-6 h-8 text-sm border border-[#D9D9D9] rounded hover:bg-[#F6F6F6] transition-colors">取消</button>
          <button className="px-6 h-8 text-sm bg-[#1890FF] text-white rounded hover:bg-[#40a9ff] transition-colors">保存</button>
        </div>
      </div>
    </div>
  );
}

// ─── 产品白名单 ───────────────────────────────────────────────────────────────────
function ProductWhitelist() {
  const [selectedSub, setSelectedSub] = useState("开发环境");
  const subProducts = ["开发环境", "训练环境", "推理环境", "分析环境", "服务环境"];
  const currentList = whitelistData[selectedSub] || [];

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] flex" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* 左栏：产品树 */}
      <div className="w-[240px] border-r border-[#F0F0F0] p-4">
        <h3 className="text-sm font-semibold text-[#333] mb-3">子产品列表</h3>
        <div className="flex flex-col gap-1">
          {subProducts.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub)}
              className={`text-left px-3 py-2 text-sm rounded transition-colors ${selectedSub === sub ? "bg-[#E6F7FF] text-[#1890FF]" : "text-[#666] hover:bg-[#F6F6F6]"}`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* 右栏：白名单表格 */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#333]">{selectedSub} - 白名单功能区</h3>
          <div className="flex gap-2">
            <button className="px-3 h-8 bg-[#1890FF] text-white text-xs rounded hover:bg-[#40a9ff] transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> 添加授权
            </button>
            <button className="px-3 h-8 border border-[#D9D9D9] text-[#333] text-xs rounded hover:bg-[#F6F6F6] transition-colors">批量移除</button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F2F2F2] text-[#333]">
              <th className="px-3 py-3 text-left font-medium">
                <input type="checkbox" className="accent-[#1890FF]" />
              </th>
              <th className="px-3 py-3 text-left font-medium">功能區中文名称</th>
              <th className="px-3 py-3 text-left font-medium">功能区英文名称</th>
              <th className="px-3 py-3 text-left font-medium">授权人</th>
              <th className="px-3 py-3 text-left font-medium">授权时间</th>
              <th className="px-3 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {currentList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#999]">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-10 h-10 text-[#D9D9D9]" />
                    <span>该子产品暂无白名单授权</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentList.map((item, idx) => (
                <tr key={idx} className="border-t border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-3 py-3"><input type="checkbox" className="accent-[#1890FF]" /></td>
                  <td className="px-3 py-3 text-[#333]">{item.region}</td>
                  <td className="px-3 py-3 text-[#666]">{item.regionEn}</td>
                  <td className="px-3 py-3 text-[#666]">{item.grantedBy}</td>
                  <td className="px-3 py-3 text-[#999] text-xs">{item.grantedAt}</td>
                  <td className="px-3 py-3">
                    <button className="text-[#D9001B] hover:underline text-xs">移除授权</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 查看详情模态框 ─────────────────────────────────────────────────────────────────
function ViewModal({ row, onClose }: { row: ProductRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-[720px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-base font-semibold text-[#333]">产品详情 - {row.name}</h2>
          <button onClick={onClose} className="text-[#999] hover:text-[#333]"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-3">
          <DescItem label="产品名称" value={row.name} />
          <DescItem label="产品分类" value={row.category} />
          <DescItem label="子产品名称" value={row.subName} />
          <DescItem label="镜像实例名" value={row.imageInstance} />
          <DescItem label="产品英文名" value={row.enName} />
          <DescItem label="产品镜像英文名" value={row.imageEnName} />
          <DescItem label="产品路径" value={row.path} />
          <DescItem label="状态" value={row.status === "enabled" ? "启用" : "禁用"} />
          <DescItem label="更新时间" value={row.updatedAt} />
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-[#F0F0F0]">
          <button onClick={onClose} className="px-6 h-8 text-sm border border-[#D9D9D9] rounded hover:bg-[#F6F6F6] transition-colors">关闭</button>
        </div>
      </div>
    </div>
  );
}

// ─── 辅助组件 ──────────────────────────────────────────────────────────────────────
function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#333]">
        {label} {required && <span className="text-[#D9001B]">*</span>}
      </label>
      {children}
    </div>
  );
}

function DescItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[#999] mb-1">{label}</span>
      <span className="text-sm text-[#333]">{value}</span>
    </div>
  );
}

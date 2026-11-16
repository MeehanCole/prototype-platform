import { useState, Fragment, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  RotateCcw,
  Upload,
  Download,
  Pencil,
  Trash2,
  Bell,
  LayoutGrid,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  AlertCircle,
} from "lucide-react";

// ─── 类型 ────────────────────────────────────────────────────────────────────
interface InstanceRow {
  id: string;
  regionCn: string;
  regionEn: string;
  cloudCn: string;
  cloudEn: string;
  cloudId: string;
  alias: string;
  techStack: string;
  zone: string;
  children?: { name: string; instances: string[] }[];
}

// ─── 模拟数据 ──────────────────────────────────────────────────────────────────
const mockRows: InstanceRow[] = [
  {
    id: "1",
    regionCn: "测试区",
    regionEn: "CSA",
    cloudCn: "平台测试花木云实例一",
    cloudEn: "CPT-SH-INS1",
    cloudId: "ptyunhm01",
    alias: "ptyunhm01.ccb.com",
    techStack: "互联网技术栈",
    zone: "一区",
    children: [
      { name: "测试区", instances: ["平台测试花木云实例一", "平台测试花木云实例二"] },
      { name: "开发区", instances: ["平台开发花木云实例一"] },
      { name: "生产区", instances: ["平台生产花木云实例一", "平台生产花木云实例二", "平台生产花木云实例三"] },
    ],
  },
  {
    id: "2",
    regionCn: "开发区",
    regionEn: "DSA",
    cloudCn: "平台开发花木云实例一",
    cloudEn: "CPT-SH-DEV1",
    cloudId: "ptyunhm02",
    alias: "ptyunhm02.ccb.com",
    techStack: "互联网技术栈",
    zone: "二区",
  },
  {
    id: "3",
    regionCn: "生产区",
    regionEn: "PSA",
    cloudCn: "平台生产花木云实例一",
    cloudEn: "CPT-SH-PROD1",
    cloudId: "ptyunhm03",
    alias: "ptyunhm03.ccb.com",
    techStack: "信创技术栈",
    zone: "三区",
  },
  {
    id: "4",
    regionCn: "测试区",
    regionEn: "CSA",
    cloudCn: "平台测试花木云实例二",
    cloudEn: "CPT-SH-INS2",
    cloudId: "ptyunhm04",
    alias: "ptyunhm04.ccb.com",
    techStack: "信创技术栈",
    zone: "二区",
  },
  {
    id: "5",
    regionCn: "生产区",
    regionEn: "PSA",
    cloudCn: "平台生产花木云实例二",
    cloudEn: "CPT-SH-PROD2",
    cloudId: "ptyunhm05",
    alias: "ptyunhm05.ccb.com",
    techStack: "互联网技术栈",
    zone: "一区",
  },
];

const cloudInstanceOptions = [
  "平台测试花木云实例一",
  "平台测试花木云实例二",
  "平台开发花木云实例一",
  "平台生产花木云实例一",
  "平台生产花木云实例二",
];

// ─── 组件 ────────────────────────────────────────────────────────────────────
export default function GlobalConfigPage() {
  const [selectedInstance, setSelectedInstance] = useState("");
  const [rows] = useState(mockRows);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredRows = selectedInstance
    ? rows.filter((r) => r.cloudCn === selectedInstance)
    : rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* ── 顶部导航栏 ── */}
      <header className="h-[50px] bg-[#043268] flex items-center px-4 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-[39px] h-[33px] bg-white/10 rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">IC</span>
          </div>
          <span className="text-white text-lg font-semibold tracking-wide">智算管理平台</span>
        </div>
        <div className="w-px h-5 bg-white/20 mx-4" />
        {/* 菜单 */}
        <nav className="flex items-center gap-6">
          <span className="text-white text-sm cursor-pointer hover:text-blue-300 transition-colors">总览</span>
          <span className="text-white text-sm cursor-pointer hover:text-blue-300 transition-colors">平台运营</span>
        </nav>
        {/* 右侧 */}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-white/80 text-sm">admin</span>
          <div className="w-7 h-7 rounded-full bg-[#1890FF] flex items-center justify-center cursor-pointer">
            <span className="text-white text-xs font-medium">A</span>
          </div>
          <Bell className="w-4 h-4 text-white/70 cursor-pointer hover:text-white transition-colors" />
        </div>
      </header>

      {/* ── 主体区域 ── */}
      <div className="flex flex-1 min-h-0">
        {/* 左侧菜单 */}
        <aside className="w-[202px] bg-[#F2F2F2]/62 border-r border-[#D7D7D7]/69 flex flex-col shrink-0">
          <div className="px-5 py-5">
            <h3 className="text-base font-semibold text-black mb-3">系统管理</h3>
          </div>
          <nav className="flex-1 px-2">
            <div className="px-3 py-2 text-sm text-[#797979] hover:text-[#333] cursor-pointer">配置中心</div>
            <div className="px-3 py-2 text-sm text-[#1890FF] bg-[#F6F6F6] rounded cursor-pointer flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              全局配置
            </div>
            <div className="px-3 py-2 text-sm text-[#797979] hover:text-[#333] cursor-pointer">实例管理</div>
            <div className="px-3 py-2 text-sm text-[#797979] hover:text-[#333] cursor-pointer">用户管理</div>
          </nav>
        </aside>

        {/* 右侧内容区 */}
        <main className="flex-1 min-w-0 overflow-x-hidden p-4">
          {/* 筛选区 */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#333] whitespace-nowrap">云实例名称</label>
                <div className="relative">
                  <select
                    value={selectedInstance}
                    onChange={(e) => setSelectedInstance(e.target.value)}
                    className="appearance-none w-[230px] h-[29px] px-2 pr-8 text-sm text-[#7F7F7F] border border-[#797979] rounded bg-white cursor-pointer focus:outline-none focus:border-[#1890FF]"
                  >
                    <option value="">请选择云实例名称</option>
                    {cloudInstanceOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-[#7F7F7F] pointer-events-none" />
                </div>
              </div>
              <button className="px-4 h-[29px] bg-[#1890FF] text-white text-xs rounded hover:bg-[#40a9ff] transition-colors flex items-center gap-1">
                <Search className="w-3 h-3" /> 查询
              </button>
              <button
                onClick={() => setSelectedInstance("")}
                className="px-4 h-[29px] bg-white text-[#333] text-xs border border-[#D9D9D9] rounded hover:bg-[#F6F6F6] transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> 重置
              </button>
            </div>
          </div>

          {/* 操作栏 + 表格 */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            {/* 操作按钮 */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F0F0F0]">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 h-[29px] bg-[#1890FF] text-white text-xs rounded hover:bg-[#40a9ff] transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> 创建
              </button>
              <button className="px-3 h-[29px] bg-[#AAAAAA] text-white text-xs rounded hover:bg-[#999] transition-colors flex items-center gap-1">
                <Upload className="w-3 h-3" /> 导入
              </button>
              <button className="px-3 h-[29px] border border-[#D9D9D9] text-[#333] text-xs rounded hover:bg-[#F6F6F6] transition-colors flex items-center gap-1">
                <Download className="w-3 h-3" /> 导出
              </button>
            </div>

            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="bg-[#F2F2F2] text-[#333]">
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">功能区中文名称</th>
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">功能区英文名称</th>
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">云实例中文名称</th>
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">云实例英文名称</th>
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">云实例ID</th>
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">云实例别名</th>
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">技术线</th>
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">可用区</th>
                    <th className="px-3 py-3 text-left font-medium whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16 text-[#999]">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-10 h-10 text-[#D9D9D9]" />
                          <span>暂无数据，试试其他筛选条件</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <Fragment key={row.id}>
                        <tr key={row.id} className="border-t border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-3 py-3">
                            <button
                              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                              className="text-[#1890FF] hover:underline flex items-center gap-1"
                            >
                              {expandedRow === row.id ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                              {row.regionCn}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-[#666]">{row.regionEn}</td>
                          <td className="px-3 py-3 text-[#333]">{row.cloudCn}</td>
                          <td className="px-3 py-3 text-[#666]">{row.cloudEn}</td>
                          <td className="px-3 py-3 text-[#666] font-mono text-xs">{row.cloudId}</td>
                          <td className="px-3 py-3 text-[#666] font-mono text-xs">{row.alias}</td>
                          <td className="px-3 py-3 text-[#333]">{row.techStack}</td>
                          <td className="px-3 py-3 text-[#333]">{row.zone}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <button className="text-[#1890FF] hover:underline text-xs flex items-center gap-1">
                                <Pencil className="w-3 h-3" /> 编辑
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(row.id)}
                                className="text-[#D9001B] hover:underline text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> 删除
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === row.id && row.children && (
                          <tr className="bg-[#FAFAFA]">
                            <td colSpan={9} className="px-6 py-3">
                              <div className="bg-[#FFF7E6] border border-[#FFE58F] rounded px-3 py-2 mb-3 text-xs text-[#D9001B] flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                一个功能区可以关联最多5个云实例
                              </div>
                              <div className="flex gap-6 flex-wrap">
                                {row.children.map((child) => (
                                  <div key={child.name} className="flex flex-col gap-1">
                                    <div className="text-xs font-medium text-[#333] flex items-center gap-1 mb-1">
                                      {child.name}
                                      <ChevronRight className="w-3 h-3 text-[#999]" />
                                    </div>
                                    {child.instances.map((inst) => (
                                      <span key={inst} className="text-xs text-[#666] pl-4">{inst}</span>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0F0F0]">
              <span className="text-xs text-[#666]">共 {filteredRows.length} 条</span>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="text-xs border border-[#D9D9D9] rounded px-2 py-1 cursor-pointer"
                >
                  <option value={10}>10 条/页</option>
                  <option value={20}>20 条/页</option>
                  <option value={50}>50 条/页</option>
                </select>
                <button
                  disabled={currentPage <= 1}
                  className="w-7 h-7 flex items-center justify-center border border-[#D9D9D9] rounded text-xs disabled:opacity-40 hover:bg-[#F6F6F6]"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-xs text-[#333]">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  className="w-7 h-7 flex items-center justify-center border border-[#D9D9D9] rounded text-xs disabled:opacity-40 hover:bg-[#F6F6F6]"
                >
                  <ChevronRightIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── 创建模态框 ── */}
      {showCreateModal && (
        <CreateModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* ── 删除确认 ── */}
      {showDeleteConfirm && (
        <DeleteConfirm
          onCancel={() => setShowDeleteConfirm(null)}
          onConfirm={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── 创建模态框 ──────────────────────────────────────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-[640px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
          <h2 className="text-base font-semibold text-[#333]">创建全局配置</h2>
          <button onClick={onClose} className="text-[#999] hover:text-[#333]">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <FormField label="功能区中文名称" required>
            <select className="w-full h-8 px-2 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1890FF]">
              <option value="">请选择</option>
              <option>测试区</option>
              <option>开发区</option>
              <option>生产区</option>
            </select>
          </FormField>
          <FormField label="功能区英文名称" required>
            <input className="w-full h-8 px-2 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1890FF]" placeholder="如 CSA" />
          </FormField>
          <FormField label="云实例中文名称" required>
            <select className="w-full h-8 px-2 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1890FF]">
              <option value="">请选择</option>
              {cloudInstanceOptions.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
          </FormField>
          <FormField label="云实例英文名称">
            <input disabled className="w-full h-8 px-2 text-sm border border-[#E5E7EB] rounded bg-[#F5F5F5] text-[#999]" placeholder="自动填充" />
          </FormField>
          <FormField label="云实例ID">
            <input disabled className="w-full h-8 px-2 text-sm border border-[#E5E7EB] rounded bg-[#F5F5F5] text-[#999]" placeholder="自动填充" />
          </FormField>
          <FormField label="云实例别名">
            <input className="w-full h-8 px-2 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1890FF]" placeholder="如 ptyunhm01.ccb.com" />
          </FormField>
          <FormField label="技术线" required>
            <select className="w-full h-8 px-2 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1890FF]">
              <option value="">请选择</option>
              <option>互联网技术栈</option>
              <option>信创技术栈</option>
            </select>
          </FormField>
          <FormField label="可用区" required>
            <select className="w-full h-8 px-2 text-sm border border-[#D9D9D9] rounded focus:outline-none focus:border-[#1890FF]">
              <option value="">请选择</option>
              <option>一区</option>
              <option>二区</option>
              <option>三区</option>
            </select>
          </FormField>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#F0F0F0]">
          <button onClick={onClose} className="px-4 h-8 text-sm border border-[#D9D9D9] rounded hover:bg-[#F6F6F6] transition-colors">取消</button>
          <button onClick={onClose} className="px-4 h-8 text-sm bg-[#1890FF] text-white rounded hover:bg-[#40a9ff] transition-colors">确定</button>
        </div>
      </div>
    </div>
  );
}

// ─── 删除确认 ────────────────────────────────────────────────────────────────────
function DeleteConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-lg w-[420px]" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#D9001B] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#333] font-medium mb-1">确认删除该映射关系吗？</p>
              <p className="text-xs text-[#666] leading-relaxed">
                删除后该功能区将不再路由到此云实例，已调度的作业不受影响。
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-3 border-t border-[#F0F0F0]">
          <button onClick={onCancel} className="px-4 h-8 text-sm border border-[#D9D9D9] rounded hover:bg-[#F6F6F6] transition-colors">取消</button>
          <button onClick={onConfirm} className="px-4 h-8 text-sm bg-[#D9001B] text-white rounded hover:bg-[#B00015] transition-colors">确认删除</button>
        </div>
      </div>
    </div>
  );
}

// ─── 表单字段 ────────────────────────────────────────────────────────────────────
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

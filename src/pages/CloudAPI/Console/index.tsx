import { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import prdRaw from "./prd.md?raw";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  RotateCcw,
  Upload,
  Download,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Folder,
  FolderOpen,
} from "lucide-react";

// ─── PRD extractSection ────────────────────────────────────────────────────────
function extractSection(raw: string, startFr: string, endFr?: string): string {
  const lines = raw.split("\n");
  let start = -1, end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`**${startFr}`)) start = i;
    if (endFr && lines[i].includes(`**${endFr}`)) { end = i; break; }
  }
  return lines.slice(start, end).join("\n").replace(/^#{1,6} /gm, (m) => m + " ");
}

const FEATURE_LABELS: Record<string, { type: "A" | "B" | "M" | "R"; title: string; desc: string }> = {
  "B.01": { type: "B", title: "接口管理（运营端）", desc: "运营端接口列表，支持18列展示、筛选、新增/发布/删除/导入/导出" },
  "B.02": { type: "B", title: "接口分类管理", desc: "左侧服务树5层级结构，右侧服务信息表单" },
  "B.03": { type: "B", title: "复杂类型参数管理", desc: "复杂类型列表，支持筛选、新增、编辑、删除" },
  "B.04": { type: "B", title: "接口管理（租户端）", desc: "租户视角接口列表" },
  "B.05": { type: "B", title: "同步记录管理", desc: "同步记录列表，支持筛选、更多搜索、查看详情" },
  "B.06": { type: "B", title: "新增复杂类型", desc: "复杂类型表单 + 参数内容表格" },
  "B.07": { type: "B", title: "编辑接口", desc: "多 Section 表单：基本信息、入参、出参、错误码、后端地址、签名鉴权" },
};

const FEATURE_DOCS: Record<string, string> = {
  "B.01": extractSection(prdRaw, "FR-1"),
  "B.02": extractSection(prdRaw, "FR-2"),
  "B.03": extractSection(prdRaw, "FR-3"),
  "B.04": extractSection(prdRaw, "FR-4"),
  "B.05": extractSection(prdRaw, "FR-5"),
  "B.06": extractSection(prdRaw, "FR-6"),
  "B.07": extractSection(prdRaw, "FR-7"),
};

const DocContext = createContext<{ openDoc: (code: string) => void; showFeat: boolean }>({ openDoc: () => {}, showFeat: false });

function NewTag({ code }: { code: string }) {
  const hostRef = useRef<HTMLButtonElement | null>(null);
  const { openDoc, showFeat } = useContext(DocContext);
  const [tip, setTip] = useState<{ top: number; left: number; above: boolean; show: boolean }>({ top: 0, left: 0, above: true, show: false });
  const f = FEATURE_LABELS[code];
  if (!showFeat) return null;
  if (!f) return null;
  const hasDoc = !!FEATURE_DOCS[code];
  const showTip = () => {
    const el = hostRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const TIP_W = 208;
    const above = r.top > 120;
    let left = r.left + r.width / 2 - TIP_W / 2;
    if (left < 8) left = 8;
    const vw = window.innerWidth;
    if (left + TIP_W > vw - 8) left = vw - 8 - TIP_W;
    setTip({ top: above ? r.top - 6 : r.bottom + 6, left, above, show: true });
  };
  const hideTip = () => setTip((p) => ({ ...p, show: false }));
  return (
    <>
      <button
        ref={hostRef}
        type="button"
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
        onClick={hasDoc ? (e) => { e.stopPropagation(); openDoc(code); } : undefined}
        title={hasDoc ? "查看 PRD 详细说明" : `${f.title}`}
        className={`absolute -top-1.5 right-0 inline-flex items-center gap-0.5 h-4 px-1 rounded-full bg-background/95 ring-1 text-[9px] transition-colors z-10 whitespace-nowrap font-medium shadow-sm ${hasDoc ? "ring-primary/40 text-primary hover:bg-primary/10 hover:ring-primary/60 cursor-pointer" : "ring-border text-muted-foreground hover:bg-accent cursor-help"}`}
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
          style={{ position: "fixed", top: tip.top, left: tip.left, zIndex: 99999, transform: tip.above ? "translateY(-100%)" : "translateY(0)" }}
          className="w-52 rounded-md bg-foreground px-3 py-2 text-[11px] text-background shadow-xl ring-1 ring-black/10 pointer-events-none leading-snug"
        >
          <span className="font-semibold block mb-0.5">{code} {f.title}</span>
          <span className="text-background/85">{f.desc}</span>
          {hasDoc && <span className="block mt-1 text-background/60 text-[10px]">点击查看完整 PRD</span>}
        </div>,
        document.body,
      )}
    </>
  );
}

function DocPanel({ code, onClose }: { code: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!code) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [code, onClose]);
  if (!code) return null;
  const f = FEATURE_LABELS[code];
  const doc = FEATURE_DOCS[code] || "暂无该功能点的 PRD 详细描述";
  return createPortal(
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div className="absolute right-0 top-0 h-full w-[400px] max-w-[90vw] bg-background border-l border-border shadow-2xl flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2 px-5 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">{code}</span>
              <span className="text-[11px] text-muted-foreground">新增</span>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-foreground">{f?.title || "功能点详情"}</h3>
          </div>
          <button onClick={onClose} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-foreground/90 prose-li:text-foreground/90 prose-th:text-foreground prose-td:text-foreground/80 prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type Page =
  | "sync-records"
  | "tenant-interfaces"
  | "tenant-categories"
  | "tenant-complex-types"
  | "add-complex-type"
  | "ops-interfaces"
  | "ops-categories"
  | "ops-complex-types"
  | "edit-interface";

// ─── shared primitives ────────────────────────────────────────────────────────

function Badge({ color, children }: { color: "green" | "orange" | "blue" | "gray"; children: ReactNode }) {
  const cls = {
    green: "bg-[#f6ffed] border-[#b7eb8f] text-[#52c41a]",
    orange: "bg-[#fff7e6] border-[#ffd591] text-[#fa8c16]",
    blue: "bg-[#e6f7ff] border-[#91d5ff] text-[#1890ff]",
    gray: "bg-gray-100 border-gray-300 text-gray-500",
  }[color];
  return (
    <span className={`inline-block border rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {children}
    </span>
  );
}

function Btn({
  variant = "default",
  size = "md",
  icon,
  children,
  onClick,
  type = "button",
}: {
  variant?: "primary" | "default" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base = "inline-flex items-center gap-1.5 rounded border font-medium transition-colors cursor-pointer whitespace-nowrap";
  const sz = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";
  const v = {
    primary: "bg-[#1890ff] border-[#1890ff] text-white hover:bg-[#40a9ff] hover:border-[#40a9ff]",
    default: "bg-white border-[#d9d9d9] text-[rgba(0,0,0,0.85)] hover:border-[#1890ff] hover:text-[#1890ff]",
    danger: "bg-white border-[#d9d9d9] text-[#ff4d4f] hover:border-[#ff4d4f]",
  }[variant];
  return (
    <button type={type} onClick={onClick} className={`${base} ${sz} ${v}`}>
      {icon}
      {children}
    </button>
  );
}

function SelectBox({
  value,
  onChange,
  options,
  placeholder = "全部",
  width = "w-40",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  width?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${width} h-8 border border-[#d9d9d9] rounded-sm px-2 text-sm bg-white text-[rgba(0,0,0,0.85)] focus:outline-none focus:border-[#1890ff]`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  width = "w-48",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "请输入"}
      className={`${width} h-8 border border-[#d9d9d9] rounded-sm px-2 text-sm bg-white text-[rgba(0,0,0,0.85)] placeholder-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#1890ff]`}
    />
  );
}

function FilterLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm text-[rgba(0,0,0,0.85)] font-medium whitespace-nowrap">{children}</span>;
}

function Pagination({
  total,
  page,
  pageSize,
  onPage,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0] bg-white">
      <span className="text-sm text-[rgba(0,0,0,0.45)]">共 {total} 条</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-8 w-8 flex items-center justify-center border border-[#d9d9d9] rounded bg-white text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={12} />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`h-8 w-8 flex items-center justify-center border rounded text-sm ${
              p === page
                ? "bg-[#1890ff] border-[#1890ff] text-white"
                : "border-[#d9d9d9] bg-white text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff]"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(Math.min(pages, page + 1))}
          disabled={page === pages}
          className="h-8 w-8 flex items-center justify-center border border-[#d9d9d9] rounded bg-white text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon size={12} />
        </button>
        <span className="ml-2 text-sm text-[rgba(0,0,0,0.45)]">{pageSize} 条/页</span>
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  width = "max-w-2xl",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-xl ${width} w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">{title}</h3>
          <button onClick={onClose} className="text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)]">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[rgba(0,0,0,0.85)] mb-1">
        {required && <span className="text-[#ff4d4f] mr-0.5">*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── sync records page ────────────────────────────────────────────────────────

const syncRecords = [
  { code: "s_wsp_a...", service: "审计管理", name: "textAdd4dd04", cnName: "测试api注册04", devType: "TCE客户端", status: "pending", version: "v1.0", isCloud: false, region: "武汉", syncTime: "2020-05-26 14:28:57", syncResult: "fail" },
  { code: "p_wsm_...", service: "云应用防火墙...", name: "CreateWafAccessControl", cnName: "新增Waf黑白名单", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2020-05-26 14:28:02", syncResult: "success" },
  { code: "p_vpc", service: "虚拟私有网络", name: "DescribeVpcPeeringConnections", cnName: "查询私有网络对等连接", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2020-05-26 14:28:02", syncResult: "success" },
  { code: "p_tdsql", service: "云数据库MySQL...", name: "DescribeInstances", cnName: "获取实例信息", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2017-03-12 14:28:52", syncResult: "success" },
  { code: "p_clb", service: "负载均衡", name: "DescribeCerts", cnName: "查询可用证书列表", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2018-03-17 14:28:52", syncResult: "success" },
  { code: "p_vpc", service: "虚拟私有网络", name: "DescribeRouterWithLocal", cnName: "查询路由策略列表", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2017-03-12 14:28:52", syncResult: "success" },
  { code: "p_cfs", service: "文件存储", name: "DescribeCfsFileSystemsByVpc", cnName: "使用VPC信息查询文件系统列表", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2019-07-19 14:28:52", syncResult: "success" },
  { code: "p_wsr_...", service: "云应用防火墙...", name: "DescribeCustomRuleList", cnName: "查询自定义防护规则", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2018-01-25 14:28:57", syncResult: "fail" },
  { code: "p_wsr_...", service: "云应用防火墙...", name: "DescribeDomains", cnName: "查看防护域名列表", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2018-01-25 14:28:57", syncResult: "success" },
  { code: "p_wsr_...", service: "云应用防火墙...", name: "SearchAttackLog", cnName: "查看攻击日志", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, region: "武汉", syncTime: "2018-01-25 14:28:57", syncResult: "success" },
];

function SyncRecordsPage() {
  const [service, setService] = useState("");
  const [apiName, setApiName] = useState("");
  const [version, setVersion] = useState("");
  const [syncResult, setSyncResult] = useState("");
  const [apiStatus, setApiStatus] = useState("");
  const [region, setRegion] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isCloud, setIsCloud] = useState("");
  const [syncTimeFrom, setSyncTimeFrom] = useState("");
  const [syncTimeTo, setSyncTimeTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewModal, setViewModal] = useState<typeof syncRecords[0] | null>(null);

  const filtered = syncRecords.filter((r) => {
    if (service && r.service !== service) return false;
    if (apiName && !r.name.toLowerCase().includes(apiName.toLowerCase())) return false;
    if (version && !r.version.includes(version)) return false;
    if (syncResult && r.syncResult !== syncResult) return false;
    if (apiStatus && r.status !== apiStatus) return false;
    if (region && r.region !== region) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="relative inline-block">
        <h2 className="inline text-base font-medium text-[rgba(0,0,0,0.85)]">同步记录管理</h2>
        <NewTag code="B.05" />
      </div>
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-4">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <div className="flex items-center gap-2">
            <FilterLabel>产品/服务</FilterLabel>
            <SelectBox value={service} onChange={setService} placeholder="请选择产品/服务" options={[{ label: "审计管理", value: "审计管理" }, { label: "云应用防火墙...", value: "云应用防火墙..." }, { label: "虚拟私有网络", value: "虚拟私有网络" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口名称</FilterLabel>
            <TextInput value={apiName} onChange={setApiName} placeholder="请输入" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>版本号</FilterLabel>
            <TextInput value={version} onChange={setVersion} placeholder="请输入" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>同步结果</FilterLabel>
            <SelectBox value={syncResult} onChange={setSyncResult} placeholder="请选择同步结果" options={[{ label: "成功", value: "success" }, { label: "失败", value: "fail" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口状态</FilterLabel>
            <SelectBox value={apiStatus} onChange={setApiStatus} placeholder="请选择接口状态" options={[{ label: "已发布", value: "published" }, { label: "待发布", value: "pending" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>目的地域</FilterLabel>
            <SelectBox value={region} onChange={setRegion} placeholder="请选择目的地域" options={[{ label: "武汉", value: "武汉" }, { label: "北京", value: "北京" }]} width="flex-1" />
          </div>
          {expanded && (
            <>
              <div className="flex items-center gap-2">
                <FilterLabel>是否云API</FilterLabel>
                <SelectBox value={isCloud} onChange={setIsCloud} options={[{ label: "是", value: "yes" }, { label: "否", value: "no" }]} width="flex-1" />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <FilterLabel>同步时间</FilterLabel>
                <input type="date" value={syncTimeFrom} onChange={(e) => setSyncTimeFrom(e.target.value)} className="flex-1 h-8 border border-[#d9d9d9] rounded-sm px-2 text-sm focus:outline-none focus:border-[#1890ff]" />
                <span className="text-[rgba(0,0,0,0.45)]">至</span>
                <input type="date" value={syncTimeTo} onChange={(e) => setSyncTimeTo(e.target.value)} className="flex-1 h-8 border border-[#d9d9d9] rounded-sm px-2 text-sm focus:outline-none focus:border-[#1890ff]" />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Btn variant="primary" icon={<Search size={14} />} onClick={() => setPage(1)}>查询</Btn>
            <Btn icon={<RotateCcw size={14} />} onClick={() => { setService(""); setApiName(""); setVersion(""); setSyncResult(""); setApiStatus(""); setRegion(""); setIsCloud(""); setSyncTimeFrom(""); setSyncTimeTo(""); }}>重置</Btn>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-[#1890ff] text-sm flex items-center gap-1 hover:text-[#40a9ff]">
            {expanded ? "收起" : "更多搜索"}
            <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#fafafa]">
                {["code","产品/服务","接口名称","接口中文名","接口转发类型","接口状态","版本号","是否云API","目的地域","同步时间","同步结果","操作"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[rgba(0,0,0,0.85)] font-medium whitespace-nowrap border-b border-[#e8e8e8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-4 py-3 font-mono text-xs text-[rgba(0,0,0,0.65)]">{r.code}</td>
                  <td className="px-4 py-3">{r.service}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.cnName}</td>
                  <td className="px-4 py-3">{r.devType}</td>
                  <td className="px-4 py-3">{r.status === "published" ? <Badge color="green">已发布</Badge> : <Badge color="orange">待发布</Badge>}</td>
                  <td className="px-4 py-3">{r.version}</td>
                  <td className="px-4 py-3">{r.isCloud ? "是" : "否"}</td>
                  <td className="px-4 py-3">{r.region}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.syncTime}</td>
                  <td className="px-4 py-3">{r.syncResult === "success" ? <Badge color="green">成功</Badge> : <Badge color="orange">失败</Badge>}</td>
                  <td className="px-4 py-3 text-[rgba(0,0,0,0.45)]">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={10} onPage={setPage} />
      </div>
      {viewModal && (
        <Modal title="同步记录详情" onClose={() => setViewModal(null)}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[["产品/服务", viewModal.service], ["接口名称", viewModal.name], ["接口中文名", viewModal.cnName], ["接口状态", viewModal.status === "published" ? "已发布" : "待发布"], ["版本号", viewModal.version], ["是否云API", viewModal.isCloud ? "是" : "否"], ["目的地域", viewModal.region], ["同步时间", viewModal.syncTime]].map(([k, v]) => (
              <div key={k}><span className="text-[rgba(0,0,0,0.45)]">{k}：</span><span className="text-[rgba(0,0,0,0.85)]">{v}</span></div>
            ))}
          </div>
          <div className="mt-4 flex justify-end"><Btn onClick={() => setViewModal(null)}>关闭</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ─── shared interface list page (used by both ops & tenant) ───────────────────

const interfaceData = [
  { code: "yunapi", service: "云API管理", name: "test-26042500", cnName: "测试", devType: "统一运营", status: "pending", version: "v1.0", isCloud: true, timeout: "5000", auth: "只签名不鉴权", callSystem: "-", owner: "88137693.zh", creator: "-", updater: "-", createTime: "2026-04-25 18:49:56", publishTime: "2026-04-25 18:49:56", updateTime: "-" },
  { code: "yunapi", service: "云API管理", name: "test-0815", cnName: "测试", devType: "统一运营", status: "pending", version: "v1.0", isCloud: false, timeout: "5000", auth: "既签名又鉴权", callSystem: "-", owner: "59385296.zh", creator: "-", updater: "-", createTime: "2025-08-15 17:16:14", publishTime: "2025-11-19 15:03:07", updateTime: "2025-11-19 15:03:13" },
  { code: "s_cfe", service: "安全防水墙", name: "queryMessageList09124", cnName: "路由消息列表08124", devType: "其他自研", status: "published", version: "v1.0", isCloud: true, timeout: "5000", auth: "只签名不鉴权", callSystem: "-", owner: "59385296.zh", creator: "59385296.zh", updater: "-", createTime: "2025-08-13 13:12:44", publishTime: "2025-08-13 13:12:44", updateTime: "-" },
  { code: "s_cfe", service: "安全防水墙", name: "queryMessageList08123", cnName: "路由消息列表08123", devType: "其他自研", status: "pending", version: "v1.0", isCloud: true, timeout: "5000", auth: "只签名不鉴权", callSystem: "-", owner: "59385296.zh", creator: "59385296.zh", updater: "-", createTime: "2025-08-12 13:01:28", publishTime: "-", updateTime: "-" },
  { code: "s_cfe", service: "安全防水墙", name: "queryMessageList06122", cnName: "路由消息列表06122", devType: "其他自研", status: "pending", version: "v1.0", isCloud: true, timeout: "5000", auth: "只签名不鉴权", callSystem: "-", owner: "59385296.zh", creator: "59385296.zh", updater: "-", createTime: "2025-08-12 13:08:37", publishTime: "-", updateTime: "-" },
];

function InterfaceListPage({ title, onEdit, featCode }: { title: string; onEdit: () => void; featCode?: string }) {
  const [service, setService] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [isCloud, setIsCloud] = useState("");
  const [createTimeFrom, setCreateTimeFrom] = useState("");
  const [updateTimeFrom, setUpdateTimeFrom] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const filtered = interfaceData.filter((r) => {
    if (service && r.service !== service) return false;
    if (name && !r.name.toLowerCase().includes(name.toLowerCase())) return false;
    if (status && r.status !== status) return false;
    if (isCloud === "yes" && !r.isCloud) return false;
    if (isCloud === "no" && r.isCloud) return false;
    return true;
  });

  const toggleAll = (checked: boolean) => {
    if (checked) setSelected(new Set(filtered.map((_, i) => i)));
    else setSelected(new Set());
  };

  return (
    <div className="p-6 space-y-4">
      <div className="relative inline-block">
        <h2 className="inline text-base font-medium text-[rgba(0,0,0,0.85)]">{title}</h2>
        {featCode && <NewTag code={featCode} />}
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-4">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <div className="flex items-center gap-2">
            <FilterLabel>产品/服务</FilterLabel>
            <SelectBox value={service} onChange={setService} placeholder="请选择产品/服务" options={[{ label: "云API管理", value: "云API管理" }, { label: "安全防水墙", value: "安全防水墙" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口名称</FilterLabel>
            <TextInput value={name} onChange={setName} placeholder="请输入接口名称" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口状态</FilterLabel>
            <SelectBox value={status} onChange={setStatus} placeholder="请选择" options={[{ label: "待发布", value: "pending" }, { label: "已发布", value: "published" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>是否云API</FilterLabel>
            <SelectBox value={isCloud} onChange={setIsCloud} placeholder="请选择" options={[{ label: "是", value: "yes" }, { label: "否", value: "no" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>创建时间</FilterLabel>
            <input type="date" value={createTimeFrom} onChange={(e) => setCreateTimeFrom(e.target.value)} className="flex-1 h-8 border border-[#d9d9d9] rounded-sm px-2 text-sm focus:outline-none focus:border-[#1890ff]" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>更新时间</FilterLabel>
            <input type="date" value={updateTimeFrom} onChange={(e) => setUpdateTimeFrom(e.target.value)} className="flex-1 h-8 border border-[#d9d9d9] rounded-sm px-2 text-sm focus:outline-none focus:border-[#1890ff]" />
          </div>
        </div>
        {/* Centered query/reset */}
        <div className="flex justify-center gap-3 mt-4">
          <Btn variant="primary" icon={<Search size={14} />} onClick={() => setPage(1)}>查询</Btn>
          <Btn icon={<RotateCcw size={14} />} onClick={() => { setService(""); setName(""); setStatus(""); setIsCloud(""); setCreateTimeFrom(""); setUpdateTimeFrom(""); }}>重置</Btn>
        </div>
      </div>

      {/* Toolbar: new/publish/delete on left, import/export on right */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Btn variant="primary" icon={<Plus size={14} />} onClick={onEdit}>新增</Btn>
          <Btn onClick={() => {}}>发布</Btn>
          <Btn variant="danger" icon={<Trash2 size={14} />} onClick={() => selected.size > 0 && setDeleteConfirm(true)}>删除</Btn>
        </div>
        <div className="flex gap-2">
          <Btn icon={<Upload size={14} />}>导入</Btn>
          <Btn icon={<Download size={14} />}>导出</Btn>
        </div>
      </div>

      {/* Table with horizontal scroll */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[2400px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#fafafa]">
                <th className="px-4 py-3 border-b border-[#e8e8e8] w-10">
                  <input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} className="w-4 h-4 accent-[#1890ff]" />
                </th>
                {["code","产品/服务","接口名称","接口中文名","接口转发类型","接口状态","版本号","是否云API","超时(毫秒)","签名鉴权","呼入系统","负责人","创建人","更新人","创建时间","发布时间","更新时间","操作"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[rgba(0,0,0,0.85)] font-medium whitespace-nowrap border-b border-[#e8e8e8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={19} className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无数据</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(i)} onChange={(e) => { setSelected((s) => { const ns = new Set(s); e.target.checked ? ns.add(i) : ns.delete(i); return ns; }); }} className="w-4 h-4 accent-[#1890ff]" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[rgba(0,0,0,0.65)]">{r.code}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.service}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.cnName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.devType}</td>
                  <td className="px-4 py-3">{r.status === "published" ? <Badge color="green">已发布</Badge> : <Badge color="orange">待发布</Badge>}</td>
                  <td className="px-4 py-3">{r.version}</td>
                  <td className="px-4 py-3">{r.isCloud ? "是" : "否"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.timeout}</td>
                  <td className="px-4 py-3 whitespace-nowrap max-w-[160px]">{r.auth}</td>
                  <td className="px-4 py-3">{r.callSystem}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.owner}</td>
                  <td className="px-4 py-3">{r.creator}</td>
                  <td className="px-4 py-3">{r.updater}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.createTime}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.publishTime}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.updateTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <button onClick={onEdit} className="text-[#1890ff] text-sm hover:text-[#40a9ff]">编辑</button>
                      <span className="text-[#d9d9d9]">|</span>
                      <button className="text-[#1890ff] text-sm hover:text-[#40a9ff]">发布</button>
                      <span className="text-[#d9d9d9]">|</span>
                      <button onClick={() => setDeleteConfirm(true)} className="text-[#ff4d4f] text-sm hover:text-[#ff7875]">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={10} onPage={setPage} />
      </div>

      {deleteConfirm && (
        <Modal title="确认删除" onClose={() => setDeleteConfirm(false)}>
          <p className="text-[rgba(0,0,0,0.85)]">确认删除选中的接口记录吗？此操作不可恢复。</p>
          <div className="flex justify-end gap-2 mt-4">
            <Btn onClick={() => setDeleteConfirm(false)}>取消</Btn>
            <Btn variant="primary" onClick={() => { setSelected(new Set()); setDeleteConfirm(false); }}>确定</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── complex types page ───────────────────────────────────────────────────────

const complexTypesData = [
  { name: "xevcev", version: "V1.0", service: "消息中心", ioType: "入参", cnDesc: "Filters", enDesc: "adyfdaf", createTime: "2023-09-25 21:06:05", updateTime: "2023-09-21 09:09:01" },
  { name: "TSendChannel", version: "V3", service: "消息中心", ioType: "出参", cnDesc: "发送通道配置", enDesc: "-", createTime: "2023-09-25 21:06:05", updateTime: "2023-09-25 21:06:05" },
  { name: "GlobalAcquireInterfaced & SearchContent", version: "", service: "云平台管理", ioType: "入参", cnDesc: "高级查询下拉项", enDesc: "-", createTime: "2023-09-25 21:06:05", updateTime: "2023-09-25 21:06:05" },
  { name: "EntBatchDeleteRule", version: "V3", service: "云平台管理", ioType: "入参", cnDesc: "【已经废弃，使用JSON来导入】黑名单批量删除", enDesc: "-", createTime: "2023-09-25 21:06:05", updateTime: "2023-09-25 21:06:05" },
  { name: "ListBatchInsertRule", version: "V3", service: "云平台管理", ioType: "入参", cnDesc: "【已经废弃，使用JSON来导入】黑白名单批量导入", enDesc: "-", createTime: "2023-09-25 21:06:05", updateTime: "2023-09-25 21:06:05" },
  { name: "UpdateAddWhitelistExceptConfigData", version: "", service: "云平台管理", ioType: "入参", cnDesc: "UpdateAddWhitelistExceptConfigData", enDesc: "-", createTime: "2023-09-25 21:06:05", updateTime: "2023-09-25 21:06:05" },
  { name: "UpdateAddWhitelistSta...", version: "", service: "云平台管理", ioType: "入参", cnDesc: "BlockConfigInter...", enDesc: "-", createTime: "2023-09-25 21:06:05", updateTime: "2023-09-25 21:06:05" },
];

function ComplexTypesPage({ onAdd }: { onAdd: () => void }) {
  const [typeName, setTypeName] = useState("");
  const [cnDesc, setCnDesc] = useState("");
  const [version, setVersion] = useState("");
  const [ioType, setIoType] = useState("");
  const [service, setService] = useState("");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<typeof complexTypesData[0] | null>(null);
  const [editForm, setEditForm] = useState({ name: "", cnDesc: "", enDesc: "", version: "", ioType: "", service: "" });
  const [data, setData] = useState(complexTypesData);

  const filtered = data.filter((r) => {
    if (typeName && !r.name.toLowerCase().includes(typeName.toLowerCase())) return false;
    if (cnDesc && !r.cnDesc.includes(cnDesc)) return false;
    if (version && !r.version.includes(version)) return false;
    if (ioType && r.ioType !== ioType) return false;
    if (service && r.service !== service) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="relative inline-block">
        <h2 className="inline text-base font-medium text-[rgba(0,0,0,0.85)]">复杂类型参数管理</h2>
        <NewTag code="B.03" />
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-4">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <div className="flex items-center gap-2">
            <FilterLabel>类型名称</FilterLabel>
            <TextInput value={typeName} onChange={setTypeName} placeholder="请输入类型名称" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>类型中文描述</FilterLabel>
            <TextInput value={cnDesc} onChange={setCnDesc} placeholder="请输入类型中文描述" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>版本</FilterLabel>
            <TextInput value={version} onChange={setVersion} placeholder="请输入版本" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>出入参类型</FilterLabel>
            <SelectBox value={ioType} onChange={setIoType} placeholder="请选择出入参类型" options={[{ label: "入参", value: "入参" }, { label: "出参", value: "出参" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>产品/服务</FilterLabel>
            <SelectBox value={service} onChange={setService} placeholder="请选择产品/服务" options={[{ label: "消息中心", value: "消息中心" }, { label: "云平台管理", value: "云平台管理" }]} width="flex-1" />
          </div>
        </div>
        {/* Centered query/reset, new on right */}
        <div className="flex items-center justify-between mt-4">
          <div className="w-24" />
          <div className="flex gap-3">
            <Btn variant="primary" icon={<Search size={14} />} onClick={() => setPage(1)}>查询</Btn>
            <Btn icon={<RotateCcw size={14} />} onClick={() => { setTypeName(""); setCnDesc(""); setVersion(""); setIoType(""); setService(""); }}>重置</Btn>
          </div>
          <div className="w-24 flex justify-end">
            <Btn variant="primary" icon={<Plus size={14} />} onClick={onAdd}>新增</Btn>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#fafafa]">
                {["类型名称","版本","产品/服务","出入参类型","类型中文描述","类型英文描述","创建时间","修改时间","操作"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[rgba(0,0,0,0.85)] font-medium whitespace-nowrap border-b border-[#e8e8e8]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[rgba(0,0,0,0.45)]">暂无数据</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-4 py-3 font-mono text-sm">{r.name}</td>
                  <td className="px-4 py-3">{r.version}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.service}</td>
                  <td className="px-4 py-3">{r.ioType === "入参" ? <Badge color="blue">入参</Badge> : <Badge color="green">出参</Badge>}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={r.cnDesc}>{r.cnDesc}</td>
                  <td className="px-4 py-3">{r.enDesc}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.createTime}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.updateTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditTarget(r); setEditForm({ name: r.name, cnDesc: r.cnDesc, enDesc: r.enDesc, version: r.version, ioType: r.ioType, service: r.service }); }} className="text-[#1890ff] text-sm hover:text-[#40a9ff]">编辑</button>
                      <button onClick={() => setDeleteConfirm(r.name)} className="text-[#ff4d4f] text-sm hover:text-[#ff7875]">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={10} onPage={setPage} />
      </div>

      {deleteConfirm && (
        <Modal title="确认删除" onClose={() => setDeleteConfirm(null)}>
          <p className="text-[rgba(0,0,0,0.85)]">确认删除类型 <strong>{deleteConfirm}</strong> 吗？此操作不可恢复。</p>
          <div className="flex justify-end gap-2 mt-4">
            <Btn onClick={() => setDeleteConfirm(null)}>取消</Btn>
            <Btn variant="primary" onClick={() => { setData((d) => d.filter((r) => r.name !== deleteConfirm)); setDeleteConfirm(null); }}>确定</Btn>
          </div>
        </Modal>
      )}

      {editTarget && (
        <Modal title="编辑复杂类型" onClose={() => setEditTarget(null)}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="类型名称" required>
              <TextInput value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} width="w-full" />
            </FormField>
            <FormField label="版本">
              <TextInput value={editForm.version} onChange={(v) => setEditForm({ ...editForm, version: v })} width="w-full" />
            </FormField>
            <FormField label="产品/服务" required>
              <SelectBox value={editForm.service} onChange={(v) => setEditForm({ ...editForm, service: v })} placeholder="请选择产品/服务" options={[{ label: "消息中心", value: "消息中心" }, { label: "云平台管理", value: "云平台管理" }]} width="w-full" />
            </FormField>
            <FormField label="出入参类型" required>
              <SelectBox value={editForm.ioType} onChange={(v) => setEditForm({ ...editForm, ioType: v })} placeholder="请选择出入参类型" options={[{ label: "入参", value: "入参" }, { label: "出参", value: "出参" }]} width="w-full" />
            </FormField>
            <FormField label="类型中文描述">
              <TextInput value={editForm.cnDesc} onChange={(v) => setEditForm({ ...editForm, cnDesc: v })} width="w-full" />
            </FormField>
            <FormField label="类型英文描述">
              <TextInput value={editForm.enDesc} onChange={(v) => setEditForm({ ...editForm, enDesc: v })} width="w-full" />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Btn onClick={() => setEditTarget(null)}>取消</Btn>
            <Btn variant="primary" onClick={() => {
              setData((d) => d.map((r) => r.name === editTarget.name ? { ...r, ...editForm } : r));
              setEditTarget(null);
            }}>确定</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── add complex type page ────────────────────────────────────────────────────

function AddComplexTypePage({ onBack }: { onBack: () => void }) {
  const [service, setService] = useState("");
  const [typeName, setTypeName] = useState("");
  const [cnDesc, setCnDesc] = useState("");
  const [enDesc, setEnDesc] = useState("");
  const [ioType, setIoType] = useState("");
  const [params, setParams] = useState<{ name: string; required: string; type: string; cnDesc: string; enDesc: string }[]>([]);
  const [showAddParam, setShowAddParam] = useState(false);
  const [newParam, setNewParam] = useState({ name: "", required: "否", type: "String", cnDesc: "", enDesc: "" });

  const addParam = () => {
    if (!newParam.name) return;
    setParams((p) => [...p, newParam]);
    setNewParam({ name: "", required: "否", type: "String", cnDesc: "", enDesc: "" });
    setShowAddParam(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-[#1890ff] text-sm flex items-center gap-1 hover:text-[#40a9ff]">
          <ChevronLeft size={14} /> 返回
        </button>
        <span className="text-[rgba(0,0,0,0.45)]">/</span>
        <span className="text-sm text-[rgba(0,0,0,0.85)]">新增复杂类型</span>
      </div>
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6 space-y-6">
        <div className="relative inline-block">
          <h3 className="inline text-base font-medium text-[rgba(0,0,0,0.85)]">新增复杂类型</h3>
          <NewTag code="B.06" />
        </div>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <FormField label="产品/服务" required>
            <SelectBox value={service} onChange={setService} placeholder="请选择产品/服务" options={[{ label: "消息中心", value: "消息中心" }, { label: "云平台管理", value: "云平台管理" }]} width="w-full" />
          </FormField>
          <FormField label="类型名称" required>
            <TextInput value={typeName} onChange={setTypeName} placeholder="请输入类型名称" width="w-full" />
          </FormField>
          <FormField label="类型中文描述">
            <TextInput value={cnDesc} onChange={setCnDesc} placeholder="请输入类型中文描述" width="w-full" />
          </FormField>
          <FormField label="类型英文描述">
            <TextInput value={enDesc} onChange={setEnDesc} placeholder="请输入类型英文描述" width="w-full" />
          </FormField>
          <FormField label="出入参类型" required>
            <SelectBox value={ioType} onChange={setIoType} placeholder="请选择出入参类型" options={[{ label: "入参", value: "入参" }, { label: "出参", value: "出参" }]} width="w-full" />
          </FormField>
        </div>
        <div>
          <h4 className="text-sm font-medium text-[rgba(0,0,0,0.85)] mb-3">参数内容</h4>
          <div className="mb-2">
            <Btn icon={<Plus size={14} />} onClick={() => setShowAddParam(true)} size="sm">添加参数</Btn>
          </div>
          <table className="w-full border-collapse text-sm border border-[#f0f0f0]">
            <thead>
              <tr className="bg-[#fafafa]">
                {["*参数名称","是否必填","*类型","数组类型","是否允许NULL","中文描述","英文描述","操作"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[rgba(0,0,0,0.85)] font-medium border-b border-[#f0f0f0] text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {params.length === 0 && !showAddParam ? (
                <tr><td colSpan={8} className="text-center py-8 text-[rgba(0,0,0,0.45)]">暂无数据</td></tr>
              ) : (
                <>
                  {params.map((p, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0]">
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2">{p.required}</td>
                      <td className="px-3 py-2">{p.type}</td>
                      <td className="px-3 py-2">-</td>
                      <td className="px-3 py-2">-</td>
                      <td className="px-3 py-2">{p.cnDesc}</td>
                      <td className="px-3 py-2">{p.enDesc}</td>
                      <td className="px-3 py-2"><button onClick={() => setParams((ps) => ps.filter((_, j) => j !== i))} className="text-[#ff4d4f] text-xs hover:text-[#ff7875]">删除</button></td>
                    </tr>
                  ))}
                  {showAddParam && (
                    <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                      <td className="px-2 py-1"><input value={newParam.name} onChange={(e) => setNewParam({ ...newParam, name: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="参数名称" /></td>
                      <td className="px-2 py-1"><select value={newParam.required} onChange={(e) => setNewParam({ ...newParam, required: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-1 text-xs"><option>是</option><option>否</option></select></td>
                      <td className="px-2 py-1"><select value={newParam.type} onChange={(e) => setNewParam({ ...newParam, type: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-1 text-xs"><option>String</option><option>Integer</option><option>Boolean</option><option>Array</option><option>Object</option></select></td>
                      <td className="px-2 py-1"><input className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs" placeholder="-" /></td>
                      <td className="px-2 py-1"><input className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs" placeholder="-" /></td>
                      <td className="px-2 py-1"><input value={newParam.cnDesc} onChange={(e) => setNewParam({ ...newParam, cnDesc: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="中文描述" /></td>
                      <td className="px-2 py-1"><input value={newParam.enDesc} onChange={(e) => setNewParam({ ...newParam, enDesc: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="英文描述" /></td>
                      <td className="px-2 py-1 flex gap-1 pt-2">
                        <button onClick={addParam} className="text-[#1890ff] text-xs hover:text-[#40a9ff]">确认</button>
                        <button onClick={() => setShowAddParam(false)} className="text-[rgba(0,0,0,0.45)] text-xs">取消</button>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 pt-2">
          <Btn variant="primary" onClick={onBack}>保存</Btn>
          <Btn onClick={onBack}>取消</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── interface category page (hierarchical tree, up to 5 levels) ──────────────

type TreeNode = { id: string; name: string; children: TreeNode[] };

const initTree: TreeNode[] = [
  { id: "1", name: "消息中心", children: [] },
  { id: "2", name: "安全防火墙", children: [
    { id: "2-1", name: "WAF防火墙", children: [
      { id: "2-1-1", name: "基础防护", children: [] },
      { id: "2-1-2", name: "高级防护", children: [] },
    ]},
  ]},
  { id: "3", name: "镜像", children: [] },
  { id: "4", name: "云监控", children: [] },
  { id: "5", name: "弹性云计算平台", children: [] },
  { id: "6", name: "告警", children: [] },
  { id: "7", name: "密钥服务", children: [] },
  { id: "8", name: "云平台管理", children: [
    { id: "8-1", name: "子服务A", children: [] },
  ]},
  { id: "9", name: "platform", children: [] },
  { id: "10", name: "弹性伸缩", children: [] },
  { id: "11", name: "主机安全", children: [] },
  { id: "12", name: "业务运维", children: [] },
  { id: "13", name: "云API管理", children: [] },
];

function countDepth(node: TreeNode): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(countDepth));
}

function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

function addNodeToTree(nodes: TreeNode[], parentId: string, newNode: TreeNode): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) return { ...n, children: [...n.children, newNode] };
    return { ...n, children: addNodeToTree(n.children, parentId, newNode) };
  });
}

function TreeNodeItem({
  node,
  depth,
  selectedId,
  onSelect,
  onAddChild,
  onDelete,
  expandedIds,
  toggleExpand,
}: {
  node: TreeNode;
  depth: number;
  selectedId: string;
  onSelect: (n: TreeNode) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;
  const nodeDepth = countDepth(node);
  const canAddChild = nodeDepth < 5;

  return (
    <div>
      <div
        className={`flex items-center group rounded px-2 py-1.5 cursor-pointer text-sm transition-colors ${
          selectedId === node.id ? "bg-[#e6f7ff] text-[#1890ff]" : "text-[rgba(0,0,0,0.85)] hover:bg-[#f5f5f5]"
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(node)}
      >
        <span className="w-4 mr-1 flex-shrink-0" onClick={(e) => { if (hasChildren) { e.stopPropagation(); toggleExpand(node.id); } }}>
          {hasChildren ? (
            isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          ) : null}
        </span>
        {hasChildren
          ? (isExpanded ? <FolderOpen size={14} className="mr-1.5 flex-shrink-0 text-[#faad14]" /> : <Folder size={14} className="mr-1.5 flex-shrink-0 text-[#faad14]" />)
          : <span className="w-4 mr-1.5 flex-shrink-0 text-[rgba(0,0,0,0.25)] text-xs">□</span>
        }
        <span className="flex-1 truncate">{node.name}</span>
        <span className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
          {canAddChild && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }}
              className="ml-1 p-0.5 text-[#1890ff] hover:text-[#40a9ff]"
              title="添加子节点"
            >
              <Plus size={11} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            className="ml-0.5 p-0.5 text-[rgba(0,0,0,0.35)] hover:text-[#ff4d4f]"
            title="删除节点"
          >
            <X size={11} />
          </button>
        </span>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onAddChild={onAddChild} onDelete={onDelete} expandedIds={expandedIds} toggleExpand={toggleExpand} />
          ))}
        </div>
      )}
    </div>
  );
}

function InterfaceCategoryPage() {
  const [tree, setTree] = useState<TreeNode[]>(initTree);
  const [selectedNode, setSelectedNode] = useState<TreeNode>(initTree[8]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["2", "8"]));
  const [cnName, setCnName] = useState(selectedNode.name);
  const [enName, setEnName] = useState(selectedNode.name.toLowerCase().replace(/\s/g, "_"));
  const [code, setCode] = useState(`s_${selectedNode.name.toLowerCase().replace(/\s/g, "_")}`);
  const [addingChildOf, setAddingChildOf] = useState<string | null>(null);
  const [newNodeName, setNewNodeName] = useState("");
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);

  const handleSelect = (n: TreeNode) => {
    setSelectedNode(n);
    setCnName(n.name);
    setEnName(n.name.toLowerCase().replace(/[\s/]/g, "_"));
    setCode(`s_${n.name.toLowerCase().replace(/[\s/]/g, "_")}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((s) => { const ns = new Set(s); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  };

  const handleAddRoot = () => {
    const id = `root-${Date.now()}`;
    setTree((t) => [...t, { id, name: "新服务", children: [] }]);
  };

  const handleAddChild = (parentId: string) => {
    setAddingChildOf(parentId);
    setNewNodeName("");
    setExpandedIds((s) => { const ns = new Set(s); ns.add(parentId); return ns; });
  };

  const confirmAddChild = () => {
    if (!newNodeName || !addingChildOf) return;
    const id = `node-${Date.now()}`;
    setTree((t) => addNodeToTree(t, addingChildOf, { id, name: newNodeName, children: [] }));
    setAddingChildOf(null);
    setNewNodeName("");
  };

  const deleteNode = (id: string) => {
    const removeNode = (nodes: TreeNode[]): TreeNode[] =>
      nodes.filter((n) => n.id !== id).map((n) => ({ ...n, children: removeNode(n.children) }));
    setTree((t) => removeNode(t));
    if (selectedNode.id === id) setSelectedNode(tree[0] ?? initTree[0]);
    setDeletingNodeId(null);
  };

  return (
    <div className="p-6">
      <div className="relative inline-block mb-4">
        <h2 className="inline text-base font-medium text-[rgba(0,0,0,0.85)]">接口分类管理</h2>
        <NewTag code="B.02" />
      </div>
      <div className="flex gap-4" style={{ height: "calc(100vh - 160px)" }}>
        {/* Tree Panel */}
        <div className="w-64 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] flex-shrink-0 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2 border-b border-[#f0f0f0]">
            <h3 className="text-sm font-medium text-[rgba(0,0,0,0.85)]">服务树列表</h3>
          </div>
          <div className="p-3">
            <Btn icon={<Plus size={12} />} size="sm" variant="primary" onClick={handleAddRoot}>新增服务</Btn>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {tree.map((node) => (
              <TreeNodeItem key={node.id} node={node} depth={0} selectedId={selectedNode.id} onSelect={handleSelect} onAddChild={handleAddChild} onDelete={(id) => setDeletingNodeId(id)} expandedIds={expandedIds} toggleExpand={toggleExpand} />
            ))}
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex-1 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6 overflow-y-auto">
          <h3 className="text-lg font-medium text-[rgba(0,0,0,0.85)] mb-6">服务信息</h3>
          <div className="space-y-5 max-w-xl">
            <FormField label="服务中文名称" required>
              <TextInput value={cnName} onChange={setCnName} width="w-full" />
            </FormField>
            <FormField label="服务英文名称" required>
              <TextInput value={enName} onChange={setEnName} width="w-full" />
            </FormField>
            <FormField label="服务编码" required>
              <TextInput value={code} onChange={setCode} width="w-full" />
            </FormField>
            <Btn variant="primary" onClick={() => {}}>提交</Btn>
          </div>
        </div>
      </div>

      {/* Add child node modal */}
      {addingChildOf && (
        <Modal title={`添加子节点 — ${findNode(tree, addingChildOf)?.name}`} onClose={() => setAddingChildOf(null)}>
          <FormField label="节点名称" required>
            <TextInput value={newNodeName} onChange={setNewNodeName} placeholder="请输入名称" width="w-full" />
          </FormField>
          <div className="flex justify-end gap-2 mt-4">
            <Btn onClick={() => setAddingChildOf(null)}>取消</Btn>
            <Btn variant="primary" onClick={confirmAddChild}>确定</Btn>
          </div>
        </Modal>
      )}

      {/* Delete node confirm modal */}
      {deletingNodeId && (
        <Modal title="确认删除" onClose={() => setDeletingNodeId(null)}>
          <p className="text-[rgba(0,0,0,0.85)]">确认删除节点 <strong>{findNode(tree, deletingNodeId)?.name}</strong> 及其所有子节点吗？此操作不可恢复。</p>
          <div className="flex justify-end gap-2 mt-4">
            <Btn onClick={() => setDeletingNodeId(null)}>取消</Btn>
            <Btn variant="primary" onClick={() => deleteNode(deletingNodeId)}>确定</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── edit interface page ──────────────────────────────────────────────────────

type Param = { name: string; required: string; type: string; cnDesc: string; enDesc: string };

function ParamTableSection({
  title,
  params,
  setParams,
}: {
  title: string;
  params: Param[];
  setParams: (p: Param[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newP, setNewP] = useState<Param>({ name: "", required: "否", type: "String", cnDesc: "", enDesc: "" });

  const confirm = () => {
    if (!newP.name) return;
    setParams([...params, newP]);
    setNewP({ name: "", required: "否", type: "String", cnDesc: "", enDesc: "" });
    setAdding(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
      <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full border-collapse text-sm border border-[#f0f0f0]">
          <thead>
            <tr className="bg-[#fafafa]">
              {["参数名称","是否必填","*类型","数组类型","是否允许NULL","中文描述","英文描述","操作"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[rgba(0,0,0,0.85)] font-medium border-b border-[#f0f0f0] text-xs whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {params.length === 0 && !adding ? (
              <tr><td colSpan={8} className="text-center py-6 text-[rgba(0,0,0,0.45)] text-sm">暂无数据</td></tr>
            ) : (
              <>
                {params.map((p, i) => (
                  <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                    <td className="px-3 py-2 text-sm">{p.name}</td>
                    <td className="px-3 py-2 text-sm">{p.required}</td>
                    <td className="px-3 py-2 text-sm">{p.type}</td>
                    <td className="px-3 py-2 text-sm">-</td>
                    <td className="px-3 py-2 text-sm">-</td>
                    <td className="px-3 py-2 text-sm">{p.cnDesc}</td>
                    <td className="px-3 py-2 text-sm">{p.enDesc || "-"}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => setParams(params.filter((_, j) => j !== i))} className="text-[#ff4d4f] text-xs hover:text-[#ff7875]">删除</button>
                    </td>
                  </tr>
                ))}
                {adding && (
                  <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                    <td className="px-2 py-1"><input value={newP.name} onChange={(e) => setNewP({ ...newP, name: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="参数名称" /></td>
                    <td className="px-2 py-1"><select value={newP.required} onChange={(e) => setNewP({ ...newP, required: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-1 text-xs"><option>是</option><option>否</option></select></td>
                    <td className="px-2 py-1"><select value={newP.type} onChange={(e) => setNewP({ ...newP, type: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-1 text-xs"><option>String</option><option>Integer</option><option>Boolean</option><option>Array</option><option>Object</option></select></td>
                    <td className="px-2 py-1"><input className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs" placeholder="-" /></td>
                    <td className="px-2 py-1"><input className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs" placeholder="-" /></td>
                    <td className="px-2 py-1"><input value={newP.cnDesc} onChange={(e) => setNewP({ ...newP, cnDesc: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="中文描述" /></td>
                    <td className="px-2 py-1"><input value={newP.enDesc} onChange={(e) => setNewP({ ...newP, enDesc: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="英文描述" /></td>
                    <td className="px-2 py-1">
                      <div className="flex gap-1 pt-1">
                        <button onClick={confirm} className="text-[#1890ff] text-xs hover:text-[#40a9ff]">确认</button>
                        <button onClick={() => setAdding(false)} className="text-[rgba(0,0,0,0.45)] text-xs">取消</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={() => setAdding(true)} className="mt-2 text-[#1890ff] text-sm flex items-center gap-1 hover:text-[#40a9ff]">
        <Plus size={12} /> 添加参数
      </button>
    </div>
  );
}

type BackendRow = { route: string; url: string; ifaceFreq: string; acctFreq: string; whitelist: string };

function EditInterfacePage({ onBack }: { onBack: () => void }) {
  const [inParams, setInParams] = useState<Param[]>([]);
  const [outParams, setOutParams] = useState<Param[]>([]);
  const [backendRows, setBackendRows] = useState<BackendRow[]>([
    { route: "jun004", url: "http://tce-api.com.tce26042500", ifaceFreq: "", acctFreq: "", whitelist: "" },
  ]);
  const [addingBackend, setAddingBackend] = useState(false);
  const [newBackend, setNewBackend] = useState<BackendRow>({ route: "", url: "", ifaceFreq: "", acctFreq: "", whitelist: "" });
  const [authType, setAuthType] = useState("只签名不鉴权");
  const [errorCodes, setErrorCodes] = useState([
    { code: "S01001", desc: "代码多余" }, { code: "S01111", desc: "内部错误s" },
    { code: "erroq", desc: "1234" }, { code: "ettt", desc: "890" },
    { code: "IdNotFound", desc: "工采用时间戳" }, { code: "number", desc: "数字编译" },
    { code: "DryRunOperation", desc: "" }, { code: "FailedOperation", desc: "" },
  ]);
  const [showAddError, setShowAddError] = useState(false);
  const [newError, setNewError] = useState({ code: "", desc: "" });

  const addError = () => {
    if (!newError.code) return;
    setErrorCodes((e) => [...e, newError]);
    setNewError({ code: "", desc: "" });
    setShowAddError(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onBack} className="text-[#1890ff] text-sm flex items-center gap-1 hover:text-[#40a9ff]">
          <ChevronLeft size={14} /> 返回
        </button>
        <span className="text-[rgba(0,0,0,0.45)]">/</span>
        <div className="relative inline-block">
          <span className="inline text-sm text-[rgba(0,0,0,0.85)]">编辑接口</span>
          <NewTag code="B.07" />
        </div>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6 space-y-5">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] border-b border-[#f0f0f0] pb-3">基本信息</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <FormField label="产品/服务">
            <input className="w-full h-8 border border-[#d9d9d9] rounded-sm px-3 text-sm bg-[#f5f5f5] text-[rgba(0,0,0,0.45)]" value="服务:云API管理" readOnly />
          </FormField>
          <FormField label="接口名称" required>
            <TextInput value="test-20241220" onChange={() => {}} width="w-full" />
          </FormField>
          <FormField label="接口中文名" required>
            <TextInput value="测试" onChange={() => {}} width="w-full" />
          </FormField>
          <FormField label="接口中文描述">
            <TextInput value="测试" onChange={() => {}} width="w-full" />
          </FormField>
          <FormField label="接口英文描述" required>
            <TextInput value="test" onChange={() => {}} width="w-full" />
          </FormField>
          <FormField label="版本">
            <TextInput value="v3.0" onChange={() => {}} width="w-full" />
          </FormField>
          {/* 接口转发类型 & 查询接口 on same row */}
          <FormField label="接口转发类型" required>
            <SelectBox value="统一运营" onChange={() => {}} options={[{ label: "统一运营", value: "统一运营" }, { label: "其他自研", value: "其他自研" }]} width="w-full" />
          </FormField>
          <FormField label="查询接口" required>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isQuery" defaultChecked className="accent-[#1890ff]" /> 是</label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isQuery" className="accent-[#1890ff]" /> 否</label>
            </div>
          </FormField>
          {/* 是否云API & 请求方式 on same row */}
          <FormField label="是否云API" required>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isCloud" defaultChecked className="accent-[#1890ff]" /> 是</label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isCloud" className="accent-[#1890ff]" /> 否</label>
            </div>
          </FormField>
          <FormField label="请求方式" required>
            <SelectBox value="POST" onChange={() => {}} options={[{ label: "POST", value: "POST" }, { label: "GET", value: "GET" }, { label: "PUT", value: "PUT" }, { label: "DELETE", value: "DELETE" }]} width="w-full" />
          </FormField>
        </div>
      </div>

      {/* 入参 */}
      <ParamTableSection title="入参" params={inParams} setParams={setInParams} />

      {/* 系统公共参数 */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-3">系统公共参数</h3>
        <div className="space-y-1 text-sm text-[rgba(0,0,0,0.65)]">
          <p>placementId</p>
          <p>appId</p>
          <p className="flex items-center gap-1"><span className="text-[#1890ff] border border-[#1890ff] rounded-sm px-1 text-xs">✓</span> pke-envId</p>
        </div>
      </div>

      {/* 出参 */}
      <ParamTableSection title="出参" params={outParams} setParams={setOutParams} />

      {/* 错误码定义 */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">错误码定义</h3>
          <Btn size="sm" icon={<Plus size={12} />} onClick={() => setShowAddError(true)}>新增错误码</Btn>
        </div>
        {showAddError && (
          <div className="flex gap-2 mb-3 items-center">
            <input value={newError.code} onChange={(e) => setNewError({ ...newError, code: e.target.value })} placeholder="错误码" className="h-7 w-36 border border-[#d9d9d9] rounded px-2 text-sm focus:outline-none focus:border-[#1890ff]" />
            <input value={newError.desc} onChange={(e) => setNewError({ ...newError, desc: e.target.value })} placeholder="描述" className="h-7 flex-1 border border-[#d9d9d9] rounded px-2 text-sm focus:outline-none focus:border-[#1890ff]" />
            <button onClick={addError} className="text-[#1890ff] text-sm hover:text-[#40a9ff]">确认</button>
            <button onClick={() => setShowAddError(false)} className="text-[rgba(0,0,0,0.45)] text-sm">取消</button>
          </div>
        )}
        <div className="space-y-1 text-sm text-[rgba(0,0,0,0.65)]">
          {errorCodes.map((e, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <span>{e.code}</span>
              {e.desc && <span className="text-[rgba(0,0,0,0.45)]">（{e.desc}）</span>}
              <button onClick={() => setErrorCodes((ec) => ec.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-[#ff4d4f] text-xs ml-1">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 后端地址及限频 */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-4">后端地址及限频<span className="text-[#ff4d4f] ml-0.5">*</span></h3>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-sm border border-[#f0f0f0]">
            <thead>
              <tr className="bg-[#fafafa]">
                {[
                  { label: "*路由", w: "w-32" },
                  { label: "*后端地址", w: "flex-1" },
                  { label: "接口限频(次/秒)", w: "w-36" },
                  { label: "账号限频(次/秒)", w: "w-36" },
                  { label: "账号限频白名单", w: "w-44" },
                  { label: "操作", w: "w-24" },
                ].map((h) => (
                  <th key={h.label} className={`text-left px-3 py-2 text-[rgba(0,0,0,0.85)] font-medium border-b border-[#f0f0f0] text-xs whitespace-nowrap ${h.w}`}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backendRows.length === 0 && !addingBackend ? (
                <tr><td colSpan={6} className="text-center py-8 text-[rgba(0,0,0,0.45)]">暂无数据</td></tr>
              ) : (
                <>
                  {backendRows.map((row, i) => (
                    <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                      <td className="px-3 py-2">{row.route}</td>
                      <td className="px-3 py-2 break-all">{row.url}</td>
                      <td className="px-3 py-2">{row.ifaceFreq || "-"}</td>
                      <td className="px-3 py-2">{row.acctFreq || "-"}</td>
                      <td className="px-3 py-2">{row.whitelist || "-"}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setBackendRows((rows) => [...rows, { ...row }])}
                            className="text-[#1890ff] text-xs hover:text-[#40a9ff]"
                          >复制</button>
                          <button
                            onClick={() => setBackendRows((rows) => rows.filter((_, j) => j !== i))}
                            className="text-[#ff4d4f] text-xs hover:text-[#ff7875]"
                          >删除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {addingBackend && (
                    <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                      <td className="px-2 py-1">
                        <input value={newBackend.route} onChange={(e) => setNewBackend({ ...newBackend, route: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="路由*" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={newBackend.url} onChange={(e) => setNewBackend({ ...newBackend, url: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="后端地址*" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={newBackend.ifaceFreq} onChange={(e) => setNewBackend({ ...newBackend, ifaceFreq: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="请输入" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={newBackend.acctFreq} onChange={(e) => setNewBackend({ ...newBackend, acctFreq: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="请输入" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={newBackend.whitelist} onChange={(e) => setNewBackend({ ...newBackend, whitelist: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="请输入" />
                      </td>
                      <td className="px-2 py-1">
                        <div className="flex gap-1 pt-1">
                          <button
                            onClick={() => {
                              if (!newBackend.route || !newBackend.url) return;
                              setBackendRows((rows) => [...rows, newBackend]);
                              setNewBackend({ route: "", url: "", ifaceFreq: "", acctFreq: "", whitelist: "" });
                              setAddingBackend(false);
                            }}
                            className="text-[#1890ff] text-xs hover:text-[#40a9ff]"
                          >确认</button>
                          <button onClick={() => setAddingBackend(false)} className="text-[rgba(0,0,0,0.45)] text-xs">取消</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        <button onClick={() => setAddingBackend(true)} className="mt-2 text-[#1890ff] text-sm flex items-center gap-1 hover:text-[#40a9ff]">
          <Plus size={12} /> 新增后端地址
        </button>
      </div>

      {/* 签名鉴权及其他配置 */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <FormField label="签名和鉴权" required>
            <SelectBox value={authType} onChange={setAuthType} placeholder="" options={[{ label: "只签名不鉴权", value: "只签名不鉴权" }, { label: "既签名又鉴权", value: "既签名又鉴权" }]} width="w-full" />
          </FormField>
          <FormField label="接口调用timeout值">
            <div className="flex gap-2 items-center">
              <TextInput value="9000" onChange={() => {}} width="flex-1" />
              <span className="text-sm text-[rgba(0,0,0,0.45)]">ms</span>
            </div>
          </FormField>
          <FormField label="呼入系统">
            <TextInput value="" onChange={() => {}} placeholder="请输入呼入系统名称，多个系统用,隔开" width="w-full" />
          </FormField>
          <FormField label="负责人">
            <TextInput value="" onChange={() => {}} placeholder="请输入负责人姓名，多个负责人用,隔开" width="w-full" />
          </FormField>
          <FormField label="变更记录">
            <textarea
              placeholder="请输入变更记录（最大长度200）"
              maxLength={200}
              className="w-full h-20 border border-[#d9d9d9] rounded-sm px-3 py-2 text-sm bg-white text-[rgba(0,0,0,0.85)] placeholder-[rgba(0,0,0,0.25)] focus:outline-none focus:border-[#1890ff] resize-none"
            />
          </FormField>
        </div>
      </div>

      <div className="flex gap-2 py-2">
        <Btn variant="primary" onClick={onBack}>保存</Btn>
        <Btn onClick={() => {}}>发布</Btn>
        <Btn onClick={onBack}>取消</Btn>
      </div>
    </div>
  );
}

// ─── sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activePage, setActivePage }: { activePage: Page; setActivePage: (p: Page) => void }) {
  const [opsOpen, setOpsOpen] = useState(true);
  const [tenantOpen, setTenantOpen] = useState(true);

  const navItem = (label: string, page: Page) => {
    const active = activePage === page;
    return (
      <button
        key={page}
        onClick={() => setActivePage(page)}
        className={`w-full flex items-center text-sm py-2.5 pl-[70px] pr-4 transition-colors relative ${
          active ? "bg-[#1890ff] text-white" : "text-[rgba(255,255,255,0.65)] hover:text-white"
        }`}
      >
        {active && <span className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r" />}
        {label}
      </button>
    );
  };

  const groupBtn = (label: string, open: boolean, toggle: () => void) => (
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between pl-11 pr-4 py-2.5 text-[rgba(255,255,255,0.65)] hover:text-white text-sm"
    >
      <span>{label}</span>
      <ChevronDown size={10} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
    </button>
  );

  return (
    <aside className="w-[200px] bg-[#001529] flex-shrink-0 flex flex-col">
      <div className="h-12 flex items-center px-5 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#1890ff] rounded flex items-center justify-center text-white text-xs font-bold">云</div>
          <span className="text-white text-base font-medium">统一运营平台</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="flex items-center px-5 py-2.5 text-[rgba(255,255,255,0.65)] text-sm">
          <span className="mr-2 opacity-50">◈</span>云API管理
        </div>
        {/* 运营端 */}
        <div>
          {groupBtn("运营端", opsOpen, () => setOpsOpen((o) => !o))}
          {opsOpen && (
            <div>
              {navItem("接口管理", "ops-interfaces")}
              {navItem("接口分类管理", "ops-categories")}
              {navItem("复杂类型参数管理", "ops-complex-types")}
            </div>
          )}
        </div>
        {/* 租户端 */}
        <div>
          {groupBtn("租户端", tenantOpen, () => setTenantOpen((t) => !t))}
          {tenantOpen && (
            <div>
              {navItem("接口管理", "tenant-interfaces")}
              {navItem("接口分类管理", "tenant-categories")}
              {navItem("复杂类型参数管理", "tenant-complex-types")}
              {navItem("同步记录管理", "sync-records")}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

// ─── top nav ──────────────────────────────────────────────────────────────────

function TopNav() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  return (
    <header className="h-12 bg-[#002140] flex items-center justify-between px-6 flex-shrink-0 relative z-40">
      <div className="flex items-center gap-6">
        <button className="text-white text-sm font-medium">云API管理</button>
        <button className="text-[rgba(255,255,255,0.65)] hover:text-white text-sm">总览</button>
        <button className="text-[rgba(255,255,255,0.65)] hover:text-white text-sm flex items-center gap-1">
          平台运营 <ChevronDown size={10} />
        </button>
      </div>
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded-full bg-[#1890ff] flex items-center justify-center text-white text-xs font-medium">张</div>
          <span className="text-[rgba(255,255,255,0.85)] text-sm">59385296.zh</span>
          <ChevronDown size={10} className={`text-[rgba(255,255,255,0.65)] transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
        </button>
        {userMenuOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border border-[#f0f0f0] py-1 z-50">
              <div className="px-4 py-2 border-b border-[#f0f0f0]">
                <p className="text-xs text-[rgba(0,0,0,0.45)]">当前账户</p>
                <p className="text-sm text-[rgba(0,0,0,0.85)] font-medium truncate">59385296.zh</p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); alert("已退出登录"); }}
                className="w-full text-left px-4 py-2 text-sm text-[rgba(0,0,0,0.85)] hover:bg-[#f5f5f5] flex items-center gap-2"
              >
                <X size={14} className="text-[rgba(0,0,0,0.45)]" />
                账户退出
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

// ─── app ──────────────────────────────────────────────────────────────────────

export default function CloudAPIConsole({ __showFeat }: { __showFeat?: boolean }) {
  const [activePage, setActivePage] = useState<Page>("sync-records");
  const [prevPage, setPrevPage] = useState<Page>("tenant-interfaces");
  const [docCode, setDocCode] = useState<string | null>(null);
  const openDoc = useCallback((code: string) => setDocCode(code), []);
  const closeDoc = useCallback(() => setDocCode(null), []);

  const navigate = (p: Page) => {
    setPrevPage(activePage);
    setActivePage(p);
  };

  const goBack = () => setActivePage(prevPage);

  const renderPage = () => {
    switch (activePage) {
      case "sync-records":
        return <SyncRecordsPage />;
      case "tenant-interfaces":
        return <InterfaceListPage title="接口列表" onEdit={() => navigate("edit-interface")} featCode="B.04" />;
      case "ops-interfaces":
        return <InterfaceListPage title="接口列表" onEdit={() => navigate("edit-interface")} featCode="B.01" />;
      case "tenant-categories":
      case "ops-categories":
        return <InterfaceCategoryPage />;
      case "tenant-complex-types":
        return <ComplexTypesPage onAdd={() => navigate("add-complex-type")} />;
      case "ops-complex-types":
        return <ComplexTypesPage onAdd={() => navigate("add-complex-type")} />;
      case "add-complex-type":
        return <AddComplexTypePage onBack={goBack} />;
      case "edit-interface":
        return <EditInterfacePage onBack={goBack} />;
      default:
        return <SyncRecordsPage />;
    }
  };

  return (
    <DocContext.Provider value={{ openDoc, showFeat: !!__showFeat }}>
      <div className="flex min-h-screen bg-[#f0f2f5] overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={navigate} />
        <div className="flex flex-1 flex-col min-w-0">
          <TopNav />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">{renderPage()}</main>
        </div>
      </div>
      <DocPanel code={docCode} onClose={closeDoc} />
    </DocContext.Provider>
  );
}

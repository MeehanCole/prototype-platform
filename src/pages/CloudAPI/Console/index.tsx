import { useState, ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  RotateCcw,
  Upload,
  Download,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

type Page =
  | "sync-records"
  | "tenant-interfaces"
  | "tenant-categories"
  | "tenant-complex-types"
  | "add-complex-type"
  | "ops-interfaces"
  | "ops-categories"
  | "edit-interface";

// ─── shared primitives ───────────────────────────────────────────────────────

function Badge({ color, children }: { color: "green" | "orange" | "blue" | "gray"; children: ReactNode }) {
  const cls = {
    green: "bg-[#f6ffed] border-[#b7eb8f] text-[#52c41a]",
    orange: "bg-[#fff7e6] border-[#ffd591] text-[#fa8c16]",
    blue: "bg-[#e6f7ff] border-[#91d5ff] text-[#1890ff]",
    gray: "bg-gray-100 border-gray-300 text-gray-500",
  }[color];
  return (
    <span className={`inline-block border rounded-sm px-1.5 py-0.5 text-xs font-medium ${cls}`}>
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
  const base = "inline-flex items-center gap-1.5 rounded border font-medium transition-colors cursor-pointer";
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
  const pages = Math.ceil(total / pageSize);
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

function Table({ headers, rows, minWidth = "min-w-[900px]" }: { headers: string[]; rows: ReactNode[][]; minWidth?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`${minWidth} w-full border-collapse text-sm`}>
        <thead>
          <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[rgba(0,0,0,0.85)] font-medium whitespace-nowrap border-b border-[#e8e8e8]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-12 text-[rgba(0,0,0,0.45)]">
                暂无数据
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-[rgba(0,0,0,0.85)] whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
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

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
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
  { code: "s_wsp_a...", service: "审计管理", name: "textAdd4dd04", cnName: "测试api注册04", devType: "TCE客户端", status: "pending", version: "v1.0", isCloud: false, baseVersion: "1", region: "武汉", syncTime: "2020-05-26 14:28:57" },
  { code: "p_wsm_...", service: "云应用防火墙...", name: "CreateWafAccessControl", cnName: "新增Waf黑白名单", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "-", region: "武汉", syncTime: "2020-05-26 14:28:02" },
  { code: "p_vpc", service: "虚拟私有网络", name: "DescribeVpcPeeringConnections", cnName: "查询私有网络对等连接", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "v3", region: "武汉", syncTime: "2020-05-26 14:28:02" },
  { code: "p_tdsql", service: "云数据库MySQL...", name: "DescribeInstances", cnName: "获取实例信息", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "-", region: "武汉", syncTime: "2017-03-12 14:28:52" },
  { code: "p_clb", service: "负载均衡", name: "DescribeCerts", cnName: "查询可用证书列表", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "-", region: "武汉", syncTime: "2018-03-17 14:28:52" },
  { code: "p_vpc", service: "虚拟私有网络", name: "DescribeRouterWithLocal", cnName: "查询路由策略列表", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "-", region: "武汉", syncTime: "2017-03-12 14:28:52" },
  { code: "p_cfs", service: "文件存储", name: "DescribeCfsFileSystemsByVpc", cnName: "使用VPC信息查询文件系统列表", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "-", region: "武汉", syncTime: "2019-07-19 14:28:52" },
  { code: "p_wsr_...", service: "云应用防火墙...", name: "DescribeCustomRuleList", cnName: "查询自定义防护规则", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "-", region: "武汉", syncTime: "2018-01-25 14:28:57" },
  { code: "p_wsr_...", service: "云应用防火墙...", name: "DescribeDomains", cnName: "查看防护域名列表", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "-", region: "武汉", syncTime: "2018-01-25 14:28:57" },
  { code: "p_wsr_...", service: "云应用防火墙...", name: "SearchAttackLog", cnName: "查看攻击日志", devType: "TCE客户端", status: "published", version: "v3", isCloud: true, baseVersion: "-", region: "武汉", syncTime: "2018-01-25 14:28:57" },
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
    if (syncResult && r.status !== syncResult) return false;
    if (apiStatus && r.status !== apiStatus) return false;
    if (region && r.region !== region) return false;
    return true;
  });

  const rows = filtered.map((r) => [
    <span className="font-mono text-xs text-[rgba(0,0,0,0.65)]">{r.code}</span>,
    r.service,
    r.name,
    r.cnName,
    r.devType,
    r.status === "published" ? <Badge color="green">已发布</Badge> : <Badge color="orange">待发布</Badge>,
    r.version,
    r.isCloud ? (
      <Check size={14} className="text-[rgba(0,0,0,0.85)]" />
    ) : (
      <span className="text-[rgba(0,0,0,0.45)]">否</span>
    ),
    r.baseVersion,
    r.region,
    r.syncTime,
    <button onClick={() => setViewModal(r)} className="text-[#1890ff] hover:text-[#40a9ff] text-sm">
      查看
    </button>,
  ]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-base font-medium text-[rgba(0,0,0,0.85)]">同步记录管理</h2>

      {/* Filter Panel */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-4">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <div className="flex items-center gap-2">
            <FilterLabel>产品/服务</FilterLabel>
            <SelectBox
              value={service}
              onChange={setService}
              options={[
                { label: "审计管理", value: "审计管理" },
                { label: "云应用防火墙...", value: "云应用防火墙..." },
                { label: "虚拟私有网络", value: "虚拟私有网络" },
                { label: "负载均衡", value: "负载均衡" },
                { label: "文件存储", value: "文件存储" },
              ]}
              width="flex-1"
            />
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
            <SelectBox
              value={syncResult}
              onChange={setSyncResult}
              options={[
                { label: "成功", value: "published" },
                { label: "失败", value: "pending" },
              ]}
              width="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口状态</FilterLabel>
            <SelectBox
              value={apiStatus}
              onChange={setApiStatus}
              options={[
                { label: "已发布", value: "published" },
                { label: "待发布", value: "pending" },
              ]}
              width="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>目的地域</FilterLabel>
            <SelectBox
              value={region}
              onChange={setRegion}
              options={[
                { label: "武汉", value: "武汉" },
                { label: "北京", value: "北京" },
              ]}
              width="flex-1"
            />
          </div>
          {expanded && (
            <>
              <div className="flex items-center gap-2">
                <FilterLabel>是否云API</FilterLabel>
                <SelectBox
                  value={isCloud}
                  onChange={setIsCloud}
                  options={[
                    { label: "是", value: "yes" },
                    { label: "否", value: "no" },
                  ]}
                  width="flex-1"
                />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <FilterLabel>同步时间</FilterLabel>
                <input
                  type="date"
                  value={syncTimeFrom}
                  onChange={(e) => setSyncTimeFrom(e.target.value)}
                  className="flex-1 h-8 border border-[#d9d9d9] rounded-sm px-2 text-sm focus:outline-none focus:border-[#1890ff]"
                />
                <span className="text-[rgba(0,0,0,0.45)]">至</span>
                <input
                  type="date"
                  value={syncTimeTo}
                  onChange={(e) => setSyncTimeTo(e.target.value)}
                  className="flex-1 h-8 border border-[#d9d9d9] rounded-sm px-2 text-sm focus:outline-none focus:border-[#1890ff]"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Btn variant="primary" icon={<Search size={14} />} onClick={() => setPage(1)}>
              查询
            </Btn>
            <Btn
              icon={<RotateCcw size={14} />}
              onClick={() => {
                setService(""); setApiName(""); setVersion(""); setSyncResult(""); setApiStatus(""); setRegion(""); setIsCloud(""); setSyncTimeFrom(""); setSyncTimeTo("");
              }}
            >
              重置
            </Btn>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#1890ff] text-sm flex items-center gap-1 hover:text-[#40a9ff]"
          >
            {expanded ? "关闭" : "更多搜索"}
            {expanded ? <ChevronDown size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <Table
          headers={["code", "产品/服务", "接口名称", "接口中文名", "接口开发类型", "接口状态", "版本号", "是否云API", "基础版本服务号", "目的地域", "同步时间", "操作"]}
          rows={rows}
          minWidth="min-w-[1400px]"
        />
        <Pagination total={filtered.length} page={page} pageSize={10} onPage={setPage} />
      </div>

      {viewModal && (
        <Modal title="同步记录详情" onClose={() => setViewModal(null)}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["产品/服务", viewModal.service],
              ["接口名称", viewModal.name],
              ["接口中文名", viewModal.cnName],
              ["接口开发类型", viewModal.devType],
              ["接口状态", viewModal.status === "published" ? "已发布" : "待发布"],
              ["版本号", viewModal.version],
              ["是否云API", viewModal.isCloud ? "是" : "否"],
              ["目的地域", viewModal.region],
              ["同步时间", viewModal.syncTime],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-[rgba(0,0,0,0.45)]">{k}：</span>
                <span className="text-[rgba(0,0,0,0.85)]">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Btn onClick={() => setViewModal(null)}>关闭</Btn>
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
  const [data, setData] = useState(complexTypesData);

  const filtered = data.filter((r) => {
    if (typeName && !r.name.toLowerCase().includes(typeName.toLowerCase())) return false;
    if (cnDesc && !r.cnDesc.includes(cnDesc)) return false;
    if (version && !r.version.includes(version)) return false;
    if (ioType && r.ioType !== ioType) return false;
    if (service && r.service !== service) return false;
    return true;
  });

  const rows = filtered.map((r) => [
    <span className="font-mono text-sm">{r.name}</span>,
    r.version,
    r.service,
    r.ioType === "入参" ? <Badge color="blue">入参</Badge> : <Badge color="green">出参</Badge>,
    <span className="max-w-[200px] block truncate" title={r.cnDesc}>{r.cnDesc}</span>,
    r.enDesc,
    r.createTime,
    r.updateTime,
    <div className="flex gap-2">
      <button className="text-[#1890ff] hover:text-[#40a9ff] text-sm">编辑</button>
      <button
        onClick={() => setDeleteConfirm(r.name)}
        className="text-[#ff4d4f] hover:text-[#ff7875] text-sm"
      >
        删除
      </button>
    </div>,
  ]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-base font-medium text-[rgba(0,0,0,0.85)]">复杂类型参数管理</h2>

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
            <SelectBox
              value={ioType}
              onChange={setIoType}
              options={[{ label: "入参", value: "入参" }, { label: "出参", value: "出参" }]}
              width="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>产品/服务</FilterLabel>
            <SelectBox
              value={service}
              onChange={setService}
              options={[{ label: "消息中心", value: "消息中心" }, { label: "云平台管理", value: "云平台管理" }]}
              width="flex-1"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Btn variant="primary" icon={<Search size={14} />} onClick={() => setPage(1)}>
            查询
          </Btn>
          <Btn
            icon={<RotateCcw size={14} />}
            onClick={() => { setTypeName(""); setCnDesc(""); setVersion(""); setIoType(""); setService(""); }}
          >
            重置
          </Btn>
        </div>
      </div>

      <div className="flex gap-2">
        <Btn variant="primary" icon={<Plus size={14} />} onClick={onAdd}>
          新增
        </Btn>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <Table
          headers={["类型名称", "版本", "服务", "出入参类型", "类型中文描述", "类型英文描述", "创建时间", "修改时间", "操作"]}
          rows={rows}
          minWidth="min-w-[1200px]"
        />
        <Pagination total={filtered.length} page={page} pageSize={10} onPage={setPage} />
      </div>

      {deleteConfirm && (
        <Modal title="确认删除" onClose={() => setDeleteConfirm(null)}>
          <p className="text-[rgba(0,0,0,0.85)]">确认删除类型 <strong>{deleteConfirm}</strong> 吗？此操作不可恢复。</p>
          <div className="flex justify-end gap-2 mt-4">
            <Btn onClick={() => setDeleteConfirm(null)}>取消</Btn>
            <Btn
              variant="danger"
              onClick={() => { setData((d) => d.filter((r) => r.name !== deleteConfirm)); setDeleteConfirm(null); }}
            >
              删除
            </Btn>
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
          <ChevronLeft size={14} />
          返回
        </button>
        <span className="text-[rgba(0,0,0,0.45)]">/</span>
        <span className="text-sm text-[rgba(0,0,0,0.85)]">新增复杂类型</span>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6 space-y-6">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">新增复杂类型</h3>

        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <FormField label="产品/服务" required>
            <SelectBox
              value={service}
              onChange={setService}
              options={[{ label: "消息中心", value: "消息中心" }, { label: "云平台管理", value: "云平台管理" }]}
              placeholder="请选择产品/服务"
              width="w-full"
            />
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
            <SelectBox
              value={ioType}
              onChange={setIoType}
              options={[{ label: "入参", value: "入参" }, { label: "出参", value: "出参" }]}
              placeholder="请选择"
              width="w-full"
            />
          </FormField>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[rgba(0,0,0,0.85)] mb-3">参数内容</h4>
          <div className="mb-2">
            <Btn icon={<Plus size={14} />} onClick={() => setShowAddParam(true)} size="sm">
              添加参数
            </Btn>
          </div>
          <table className="w-full border-collapse text-sm border border-[#f0f0f0]">
            <thead>
              <tr className="bg-[#fafafa]">
                {["*参数名称", "是否必填", "*类型", "数组类型", "是否允许NULL", "中文描述", "英文描述", "操作"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[rgba(0,0,0,0.85)] font-medium border-b border-[#f0f0f0]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {params.length === 0 && !showAddParam ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[rgba(0,0,0,0.45)]">暂无数据</td>
                </tr>
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
                      <td className="px-3 py-2">
                        <button onClick={() => setParams((ps) => ps.filter((_, j) => j !== i))} className="text-[#ff4d4f] text-xs hover:text-[#ff7875]">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {showAddParam && (
                    <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                      <td className="px-2 py-1">
                        <input value={newParam.name} onChange={(e) => setNewParam({ ...newParam, name: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="参数名称" />
                      </td>
                      <td className="px-2 py-1">
                        <select value={newParam.required} onChange={(e) => setNewParam({ ...newParam, required: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-1 text-xs">
                          <option>是</option><option>否</option>
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <select value={newParam.type} onChange={(e) => setNewParam({ ...newParam, type: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-1 text-xs">
                          <option>String</option><option>Integer</option><option>Boolean</option><option>Array</option><option>Object</option>
                        </select>
                      </td>
                      <td className="px-2 py-1"><input className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs" placeholder="-" /></td>
                      <td className="px-2 py-1"><input className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs" placeholder="-" /></td>
                      <td className="px-2 py-1">
                        <input value={newParam.cnDesc} onChange={(e) => setNewParam({ ...newParam, cnDesc: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="中文描述" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={newParam.enDesc} onChange={(e) => setNewParam({ ...newParam, enDesc: e.target.value })} className="w-full h-7 border border-[#d9d9d9] rounded px-2 text-xs focus:outline-none focus:border-[#1890ff]" placeholder="英文描述" />
                      </td>
                      <td className="px-2 py-1 flex gap-1">
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

// ─── interface category page ──────────────────────────────────────────────────

const serviceTree = [
  "消息中心", "安全防火墙", "镜像", "云监控", "弹性云计算平台", "告警",
  "密钥服务", "云平台管理", "运营管理平台", "platform", "弹性伸缩", "主机安全",
  "业务运维", "资源交付", "用户个性化设置", "监控平台", "容器安全服务", "agua",
  "工单管理", "docs", "TCE平台信息", "云数据库MariaDB", "云API管理", "基线库", "平台服务", "通信服务",
];

function InterfaceCategoryPage() {
  const [selected, setSelected] = useState("platform");
  const [cnName, setCnName] = useState("platform");
  const [enName, setEnName] = useState("developer");
  const [code, setCode] = useState("s_platform");
  const [showAdd, setShowAdd] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [services, setServices] = useState(serviceTree);

  const handleSelect = (s: string) => {
    setSelected(s);
    setCnName(s);
    setEnName(s.toLowerCase().replace(/\s/g, "_"));
    setCode(`s_${s.toLowerCase().replace(/\s/g, "_")}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-4">接口分类管理</h2>
      <div className="flex gap-4 h-[calc(100vh-160px)]">
        {/* Tree Panel */}
        <div className="w-64 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] flex-shrink-0 overflow-hidden flex flex-col">
          <div className="px-4 pt-4 pb-2 border-b border-[#f0f0f0]">
            <h3 className="text-sm font-medium text-[rgba(0,0,0,0.85)]">服务树列表</h3>
          </div>
          <div className="p-4">
            {showAdd ? (
              <div className="flex gap-1 mb-2">
                <input
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="服务名称"
                  className="flex-1 h-7 border border-[#1890ff] rounded px-2 text-xs focus:outline-none"
                />
                <button
                  onClick={() => { if (newServiceName) { setServices((s) => [...s, newServiceName]); setSelected(newServiceName); setShowAdd(false); setNewServiceName(""); } }}
                  className="text-[#1890ff] text-xs px-1"
                >
                  <Check size={12} />
                </button>
                <button onClick={() => setShowAdd(false)} className="text-[rgba(0,0,0,0.45)] text-xs px-1">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <Btn icon={<Plus size={12} />} size="sm" variant="primary" onClick={() => setShowAdd(true)}>
                新增服务
              </Btn>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {services.map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left hover:bg-[#e6f7ff] transition-colors ${
                  selected === s ? "bg-[#e6f7ff] text-[#1890ff]" : "text-[rgba(0,0,0,0.85)]"
                }`}
              >
                <span className="text-[rgba(0,0,0,0.45)]">□</span>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex-1 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
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
    </div>
  );
}

// ─── tenant interface list ────────────────────────────────────────────────────

const tenantInterfaceData = [
  { code: "yunapi", service: "云API管理", name: "test-26042500", cnName: "测试", devType: "统一运营", status: "pending", version: "v1.0", isCloud: true, baseVersion: "-", timeout: "5000", auth: "只签名不鉴权", system: "-", owner: "88137693.zh", createTime: "2026-04-25 18:49:56", publishTime: "2026-04-25 18:49:56" },
  { code: "yunapi", service: "云API管理", name: "test-0815", cnName: "测试", devType: "统一运营", status: "pending", version: "v1.0", isCloud: true, baseVersion: "-", timeout: "5000", auth: "只签名不鉴权", system: "-", owner: "59385296.zh", createTime: "2025-08-15 17:16:14", publishTime: "2025-11-19 15:03:07" },
];

function TenantInterfacesPage({ onEdit }: { onEdit: () => void }) {
  const [service, setService] = useState("");
  const [name, setName] = useState("");
  const [devType, setDevType] = useState("");
  const [status, setStatus] = useState("");
  const [version, setVersion] = useState("");
  const [backend, setBackend] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = tenantInterfaceData.filter((r) => {
    if (service && r.service !== service) return false;
    if (name && !r.name.toLowerCase().includes(name.toLowerCase())) return false;
    if (status && r.status !== status) return false;
    return true;
  });

  const rows = filtered.map((r, i) => [
    <input type="checkbox" checked={selected.has(i)} onChange={(e) => {
      setSelected((s) => { const ns = new Set(s); e.target.checked ? ns.add(i) : ns.delete(i); return ns; });
    }} className="w-4 h-4 accent-[#1890ff]" />,
    <span className="font-mono text-sm">{r.code}</span>,
    r.service,
    r.name,
    r.cnName,
    r.devType,
    r.status === "published" ? <Badge color="green">已发布</Badge> : <Badge color="orange">待发布</Badge>,
    r.version,
    r.isCloud ? <Check size={14} className="text-[rgba(0,0,0,0.85)]" /> : <span>否</span>,
    r.baseVersion,
    r.timeout,
    r.auth,
    r.system,
    r.owner,
    r.createTime,
    r.publishTime,
    <div className="flex items-center gap-2">
      <button onClick={onEdit} className="text-[#1890ff] text-sm hover:text-[#40a9ff]">编辑</button>
      <span className="text-[#d9d9d9]">|</span>
      <button className="text-[#1890ff] text-sm hover:text-[#40a9ff]">查看</button>
      <span className="text-[#d9d9d9]">|</span>
      <button className="text-[#1890ff] text-sm hover:text-[#40a9ff]">更多</button>
    </div>,
  ]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-base font-medium text-[rgba(0,0,0,0.85)]">接口列表</h2>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-4">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <div className="flex items-center gap-2">
            <FilterLabel>产品/服务</FilterLabel>
            <SelectBox value={service} onChange={setService} options={[{ label: "云API管理", value: "云API管理" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口名称</FilterLabel>
            <TextInput value={name} onChange={setName} placeholder="请输入接口名称" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口转发类型</FilterLabel>
            <SelectBox value={devType} onChange={setDevType} options={[{ label: "统一运营", value: "统一运营" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口状态</FilterLabel>
            <SelectBox value={status} onChange={setStatus} options={[{ label: "已发布", value: "published" }, { label: "待发布", value: "pending" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>版本号</FilterLabel>
            <TextInput value={version} onChange={setVersion} placeholder="请输入版本号" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>后端地址</FilterLabel>
            <TextInput value={backend} onChange={setBackend} placeholder="请输入后端地址" width="flex-1" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Btn variant="primary" icon={<Search size={14} />} onClick={() => setPage(1)}>查询</Btn>
            <Btn icon={<RotateCcw size={14} />} onClick={() => { setService(""); setName(""); setDevType(""); setStatus(""); setVersion(""); setBackend(""); }}>重置</Btn>
          </div>
          <button className="text-[#1890ff] text-sm hover:text-[#40a9ff]">更多搜索</button>
        </div>
      </div>

      <div className="flex gap-2">
        <Btn variant="primary" icon={<Plus size={14} />} onClick={onEdit}>新增</Btn>
        <Btn icon={<Upload size={14} />}>导入</Btn>
        <Btn icon={<Download size={14} />}>导出</Btn>
        <Btn onClick={() => {}}>发布</Btn>
        <Btn variant="danger" icon={<Trash2 size={14} />}>删除</Btn>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <Table
          headers={["", "code", "产品/服务", "接口名称", "接口中文名", "接口转发类型", "接口状态", "版本号", "是否云API", "基础运营版本号", "超时时间(秒)", "签名鉴权", "准入系统", "负责人", "创建时间", "发布时间", "操作"]}
          rows={rows}
          minWidth="min-w-[2000px]"
        />
        <Pagination total={filtered.length} page={page} pageSize={10} onPage={setPage} />
      </div>
    </div>
  );
}

// ─── edit interface page ──────────────────────────────────────────────────────

function EditInterfacePage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("一般编码出参");
  const [inParams, setInParams] = useState<{ name: string; required: string; type: string; cnDesc: string }[]>([]);
  const [outParams, setOutParams] = useState<{ name: string; required: string; type: string; cnDesc: string }[]>([]);

  const ParamTable = ({ params, onAdd }: { params: typeof inParams; onAdd: () => void }) => (
    <div>
      <table className="w-full border-collapse text-sm border border-[#f0f0f0]">
        <thead>
          <tr className="bg-[#fafafa]">
            {["参数名称", "是否必填", "*类型", "数组类型", "是否允许NULL", "中文描述", "英文描述"].map((h) => (
              <th key={h} className="text-left px-3 py-2 text-[rgba(0,0,0,0.85)] font-medium border-b border-[#f0f0f0] text-xs">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {params.length === 0 ? (
            <tr><td colSpan={7} className="text-center py-6 text-[rgba(0,0,0,0.45)] text-sm">暂无数据</td></tr>
          ) : params.map((p, i) => (
            <tr key={i} className="border-b border-[#f0f0f0]">
              <td className="px-3 py-2 text-sm">{p.name}</td>
              <td className="px-3 py-2 text-sm">{p.required}</td>
              <td className="px-3 py-2 text-sm">{p.type}</td>
              <td className="px-3 py-2 text-sm">-</td>
              <td className="px-3 py-2 text-sm">-</td>
              <td className="px-3 py-2 text-sm">{p.cnDesc}</td>
              <td className="px-3 py-2 text-sm">-</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onAdd} className="mt-2 text-[#1890ff] text-sm flex items-center gap-1 hover:text-[#40a9ff]">
        <Plus size={12} /> 添加参数
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onBack} className="text-[#1890ff] text-sm flex items-center gap-1 hover:text-[#40a9ff]">
          <ChevronLeft size={14} /> 返回
        </button>
        <span className="text-[rgba(0,0,0,0.45)]">/</span>
        <span className="text-sm text-[rgba(0,0,0,0.85)]">编辑接口</span>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6 space-y-6">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] border-b border-[#f0f0f0] pb-3">基本信息</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <FormField label="产品,服务">
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
          <FormField label="最近送达接口回调号">
            <TextInput value="" onChange={() => {}} placeholder="请输入" width="w-full" />
          </FormField>
          <FormField label="接口转发类型" required>
            <SelectBox value="统一运营" onChange={() => {}} options={[{ label: "统一运营", value: "统一运营" }]} width="w-full" />
          </FormField>
          <div className="flex gap-8">
            <FormField label="是否接口" required>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isInterface" defaultChecked className="accent-[#1890ff]" /> 是</label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isInterface" className="accent-[#1890ff]" /> 否</label>
              </div>
            </FormField>
            <FormField label="告询接口" required>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isQuery" defaultChecked className="accent-[#1890ff]" /> 是</label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isQuery" className="accent-[#1890ff]" /> 否</label>
              </div>
            </FormField>
          </div>
          <div className="flex gap-8">
            <FormField label="是否云API" required>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isCloud" defaultChecked className="accent-[#1890ff]" /> 是</label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="radio" name="isCloud" className="accent-[#1890ff]" /> 否</label>
              </div>
            </FormField>
            <FormField label="*请求方式">
              <SelectBox value="POST" onChange={() => {}} options={[{ label: "POST", value: "POST" }, { label: "GET", value: "GET" }]} width="w-36" />
            </FormField>
          </div>
        </div>
      </div>

      {/* Input params */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-4">入参</h3>
        <ParamTable params={inParams} onAdd={() => setInParams((p) => [...p, { name: "newParam", required: "否", type: "String", cnDesc: "参数描述" }])} />
      </div>

      {/* System params */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-3">系统公共参数</h3>
        <div className="space-y-1 text-sm text-[rgba(0,0,0,0.65)]">
          <p>placementId</p>
          <p>appId</p>
          <p className="flex items-center gap-1"><span className="text-[#1890ff] border border-[#1890ff] rounded-sm px-1 text-xs">✓</span> pke-envId</p>
        </div>
      </div>

      {/* Output params */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-4">出参</h3>
        <ParamTable params={outParams} onAdd={() => setOutParams((p) => [...p, { name: "result", required: "是", type: "Object", cnDesc: "返回结果" }])} />
      </div>

      {/* Error codes */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-3">错误码定义</h3>
        <div className="space-y-1 text-sm text-[rgba(0,0,0,0.65)]">
          {[["S01001", "代码多余"], ["S01111", "内部错误s"], ["erroq", "1234"], ["ettt", "890"], ["IdNotFound", "工采用时间戳"], ["number", "数字编译"], ["DryRunOperation", ""], ["FailedOperation", ""]].map(([code, desc]) => (
            <p key={code}>{code} {desc && <span className="text-[rgba(0,0,0,0.45)]">（{desc}）</span>}</p>
          ))}
        </div>
      </div>

      {/* Route config */}
      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-[rgba(0,0,0,0.85)]">法治配置</h3>
          <Btn size="sm" icon={<Plus size={12} />}>+新增法治路由</Btn>
        </div>
        <div className="flex gap-1 mb-4 border-b border-[#f0f0f0]">
          {["一般编码出参", "二级编码回出", "法否详情"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? "border-[#1890ff] text-[#1890ff]"
                  : "border-transparent text-[rgba(0,0,0,0.65)] hover:text-[rgba(0,0,0,0.85)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <FormField label="调点">
            <TextInput value="jun004" onChange={() => {}} width="w-full" />
          </FormField>
          <FormField label="后域地址">
            <div className="flex gap-2">
              <TextInput value="http://tce-api.com.tce26042500" onChange={() => {}} width="flex-1" />
              <button className="text-[#1890ff] text-xs whitespace-nowrap">+配置后域地址</button>
            </div>
          </FormField>
          <FormField label="接口周期">
            <div className="flex gap-2 items-center">
              <TextInput value="" onChange={() => {}} placeholder="请输入" width="flex-1" />
              <span className="text-sm text-[rgba(0,0,0,0.45)]">以秒</span>
            </div>
          </FormField>
          <FormField label="域号周期">
            <div className="flex gap-2 items-center">
              <TextInput value="" onChange={() => {}} placeholder="请输入" width="flex-1" />
              <span className="text-sm text-[rgba(0,0,0,0.45)]">以秒</span>
            </div>
          </FormField>
          <FormField label="域号同班白名单">
            <TextInput value="" onChange={() => {}} placeholder="请输入" width="w-full" />
          </FormField>
          <FormField label="签名名称">
            <SelectBox value="" onChange={() => {}} options={[{ label: "月度不鉴权", value: "月度不鉴权" }]} placeholder="月度不鉴权" width="w-full" />
          </FormField>
          <FormField label="接口调用timeout值">
            <div className="flex gap-2 items-center">
              <TextInput value="9000" onChange={() => {}} width="flex-1" />
              <span className="text-sm text-[rgba(0,0,0,0.45)]">ms</span>
            </div>
          </FormField>
          <FormField label="呼入系统">
            <TextInput value="" onChange={() => {}} placeholder="请输入" width="w-full" />
          </FormField>
          <FormField label="负责人">
            <TextInput value="" onChange={() => {}} placeholder="请输入" width="w-full" />
          </FormField>
          <FormField label="变更记录">
            <button className="text-[#1890ff] text-sm">查看</button>
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

// ─── ops interface list ───────────────────────────────────────────────────────

const opsInterfaceData = [
  { code: "code", service: "云API管理", name: "test-26042500", cnName: "测试", devType: "统一运营", status: "pending", version: "v1.0", isCloud: true },
  { code: "yunapi", service: "云API管理", name: "test-0815", cnName: "测试", devType: "统一运营", status: "pending", version: "v1.0", isCloud: false },
  { code: "s_cfe", service: "安全防水墙", name: "queryMessageList09124", cnName: "路路消息列表08124", devType: "统一应急", status: "published", version: "v1.0", isCloud: true },
  { code: "s_cfe", service: "安全防水墙", name: "queryMessageList08123", cnName: "路路消息列表08123", devType: "统一应急", status: "pending", version: "v1.0", isCloud: true },
  { code: "s_cfe", service: "安全防水墙", name: "queryMessageList06122", cnName: "路路消息列表06122", devType: "统一应急", status: "pending", version: "v1.0", isCloud: true },
];

function OpsInterfacesPage({ onEdit }: { onEdit: () => void }) {
  const [service, setService] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const filtered = opsInterfaceData.filter((r) => {
    if (service && r.service !== service) return false;
    if (name && !r.name.toLowerCase().includes(name.toLowerCase())) return false;
    if (status && r.status !== status) return false;
    return true;
  });

  const rows = filtered.map((r) => [
    <span className="font-mono text-xs text-[rgba(0,0,0,0.65)]">{r.code}</span>,
    r.service,
    r.name,
    r.cnName,
    r.devType,
    r.status === "published" ? <Badge color="green">已发布</Badge> : <Badge color="orange">待发布</Badge>,
    r.version,
    r.isCloud ? <Check size={14} className="text-[rgba(0,0,0,0.85)]" /> : <span className="text-[rgba(0,0,0,0.45)]">否</span>,
    <div className="flex items-center gap-2">
      <button onClick={onEdit} className="text-[#1890ff] text-sm hover:text-[#40a9ff]">编辑</button>
      <span className="text-[#d9d9d9]">|</span>
      <button className="text-[#1890ff] text-sm hover:text-[#40a9ff]">查看</button>
      <span className="text-[#d9d9d9]">|</span>
      <button className="text-[#1890ff] text-sm hover:text-[#40a9ff]">更多</button>
    </div>,
  ]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-base font-medium text-[rgba(0,0,0,0.85)]">接口列表</h2>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] p-4">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <div className="flex items-center gap-2">
            <FilterLabel>产品/服务</FilterLabel>
            <SelectBox value={service} onChange={setService} options={[{ label: "云API管理", value: "云API管理" }, { label: "安全防水墙", value: "安全防水墙" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口名称</FilterLabel>
            <TextInput value={name} onChange={setName} placeholder="请输入接口名称" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口转发类型</FilterLabel>
            <SelectBox value="" onChange={() => {}} options={[{ label: "统一运营", value: "统一运营" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>接口状态</FilterLabel>
            <SelectBox value={status} onChange={setStatus} options={[{ label: "已发布", value: "published" }, { label: "待发布", value: "pending" }]} width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>版本号</FilterLabel>
            <TextInput value="" onChange={() => {}} placeholder="请输入版本号" width="flex-1" />
          </div>
          <div className="flex items-center gap-2">
            <FilterLabel>后端地址</FilterLabel>
            <TextInput value="" onChange={() => {}} placeholder="请输入后端地址" width="flex-1" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Btn variant="primary" icon={<Search size={14} />}>查询</Btn>
            <Btn icon={<RotateCcw size={14} />} onClick={() => { setService(""); setName(""); setStatus(""); }}>重置</Btn>
          </div>
          <button className="text-[#1890ff] text-sm hover:text-[#40a9ff]">更多搜索</button>
        </div>
      </div>

      <div className="flex gap-2">
        <Btn variant="primary" icon={<Plus size={14} />} onClick={onEdit}>新增</Btn>
        <Btn icon={<Upload size={14} />}>导入</Btn>
        <Btn icon={<Download size={14} />}>导出</Btn>
        <Btn>发布</Btn>
        <Btn variant="danger">删除</Btn>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <Table
          headers={["code", "产品/服务", "接口名称", "接口中文名", "接口转发类型", "接口状态", "版本号", "是否云API", "操作"]}
          rows={rows}
        />
        <Pagination total={filtered.length} page={page} pageSize={10} onPage={setPage} />
      </div>
    </div>
  );
}

// ─── sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activePage, setActivePage }: { activePage: Page; setActivePage: (p: Page) => void }) {
  const [opsOpen, setOpsOpen] = useState(true);
  const [tenantOpen, setTenantOpen] = useState(true);

  const navItem = (label: string, page: Page, depth = 0) => {
    const active = activePage === page;
    return (
      <button
        key={page}
        onClick={() => setActivePage(page)}
        className={`w-full flex items-center text-sm py-2.5 transition-colors relative ${
          depth === 0 ? "pl-5" : depth === 1 ? "pl-11" : "pl-[70px]"
        } ${
          active
            ? "bg-[#1890ff] text-white"
            : "text-[rgba(255,255,255,0.65)] hover:text-white"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r" />
        )}
        {label}
      </button>
    );
  };

  return (
    <aside className="w-[200px] bg-[#001529] flex-shrink-0 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-12 flex items-center px-5 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#1890ff] rounded flex items-center justify-center text-white text-xs font-bold">云</div>
          <span className="text-white text-base font-medium">统一运营平台</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {/* Cloud API Management parent */}
        <div className="py-1">
          <div className="flex items-center px-5 py-2.5 text-[rgba(255,255,255,0.65)] text-sm">
            <span className="mr-2 text-[rgba(255,255,255,0.45)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4h2v2H7V4zm0 3h2v5H7V7z" fill="currentColor" fillOpacity="0.65" />
              </svg>
            </span>
            云API管理
          </div>

          {/* 运营端 */}
          <div>
            <button
              onClick={() => setOpsOpen(!opsOpen)}
              className="w-full flex items-center justify-between pl-11 pr-4 py-2.5 text-[rgba(255,255,255,0.65)] hover:text-white text-sm"
            >
              <span>运营端</span>
              <ChevronDown size={10} className={`transition-transform ${opsOpen ? "" : "-rotate-90"}`} />
            </button>
            {opsOpen && (
              <div>
                {navItem("接口管理", "ops-interfaces", 2)}
                {navItem("接口分类管理", "ops-categories", 2)}
              </div>
            )}
          </div>

          {/* 租户端 */}
          <div>
            <button
              onClick={() => setTenantOpen(!tenantOpen)}
              className="w-full flex items-center justify-between pl-11 pr-4 py-2.5 text-[rgba(255,255,255,0.65)] hover:text-white text-sm"
            >
              <span>租户端</span>
              <ChevronDown size={10} className={`transition-transform ${tenantOpen ? "" : "-rotate-90"}`} />
            </button>
            {tenantOpen && (
              <div>
                {navItem("接口管理", "tenant-interfaces", 2)}
                {navItem("接口分类管理", "tenant-categories", 2)}
                {navItem("复杂类型参数管理", "tenant-complex-types", 2)}
                {navItem("同步记录管理", "sync-records", 2)}
              </div>
            )}
          </div>
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
          <div className="w-6 h-6 rounded-full bg-[#1890ff] flex items-center justify-center text-white text-xs font-medium">
            张
          </div>
          <span className="text-[rgba(255,255,255,0.85)] text-sm">59385296.zh</span>
          <ChevronDown
            size={10}
            className={`text-[rgba(255,255,255,0.65)] transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
          />
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

export default function App() {
  const [activePage, setActivePage] = useState<Page>("sync-records");

  const handleNav = (p: Page) => setActivePage(p);

  const renderPage = () => {
    switch (activePage) {
      case "sync-records":
        return <SyncRecordsPage />;
      case "tenant-complex-types":
        return <ComplexTypesPage onAdd={() => setActivePage("add-complex-type")} />;
      case "add-complex-type":
        return <AddComplexTypePage onBack={() => setActivePage("tenant-complex-types")} />;
      case "tenant-categories":
        return <InterfaceCategoryPage />;
      case "ops-categories":
        return <InterfaceCategoryPage />;
      case "tenant-interfaces":
        return <TenantInterfacesPage onEdit={() => setActivePage("edit-interface")} />;
      case "ops-interfaces":
        return <OpsInterfacesPage onEdit={() => setActivePage("edit-interface")} />;
      case "edit-interface":
        return (
          <EditInterfacePage
            onBack={() =>
              setActivePage(activePage === "edit-interface" ? "tenant-interfaces" : activePage)
            }
          />
        );
      default:
        return <SyncRecordsPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] overflow-hidden">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={handleNav} />
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  );
}

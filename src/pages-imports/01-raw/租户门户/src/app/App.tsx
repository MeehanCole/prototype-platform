import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Modal =
  | null
  | "add-sub-account" | "import-data" | "add-to-group" | "edit-account"
  | "new-group" | "add-user" | "new-policy" | "associate-user-group"
  | "new-api-key" | "enable-uass" | "delete-user" | "delete-policy"
  | "assoc-policy" | "delete-api-key";

interface Policy {
  id: string;
  name: string;
  remark: string;
  type: "预置策略" | "自定义策略";
  created: string;
}

interface UserGroup {
  id: string;
  name: string;
  remark: string;
  userCount: number;
  created: string;
}

interface User {
  id: string;
  name: string;
  nickname: string;
  type: string;
  email: string;
  phone: string;
  uass: string;
  employee: string;
  created: string;
  status: "已启用" | "已禁用";
}

interface ApiKey {
  id: string;
  account: string;
  key: string;
  keyFull: string;
  created: string;
  status: "正常" | "已禁用";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_USERS: User[] = [
  { id: "100004611971", name: "test051514", nickname: "测试账号管理员测试", type: "子账号", email: "t@cpic.com", phone: "13822226666", uass: "u5137600.zh", employee: "u5137600", created: "2024-05-12 14:07", status: "已启用" },
  { id: "100004611970", name: "test051511", nickname: "测试0515", type: "子账号", email: "h@cpic.com", phone: "13500006666", uass: "u5137600.zh", employee: "u5137600", created: "2024-05-15 11:07", status: "已启用" },
  { id: "100004613356", name: "test222222222222222222222", nickname: "test222222222222222222222", type: "子账号", email: "zhangyi.zh@cpic.com", phone: "13811166666", uass: "zhangyi.zh", employee: "96536998", created: "2024-06-11 14:07", status: "已启用" },
  { id: "100004613354", name: "zhangguan10.zh@cpic.com", nickname: "zhangguan10.zh", type: "子账号", email: "zhangguan10.zh@cpic.com", phone: "13526668888", uass: "zhangguan10.zh", employee: "95219098", created: "2024-05-11 20:07", status: "已启用" },
  { id: "100004613353", name: "peiyuan99.zh", nickname: "peiyuan.zh", type: "子账号", email: "peiyuan.zh@cpic.com", phone: "13526668888", uass: "u5137600.zh", employee: "u5137600", created: "2024-05-11 20:07", status: "已启用" },
  { id: "100004613352", name: "changxian.zh", nickname: "changxian.zh", type: "子账号", email: "changxian.zh@cpic.com", phone: "15366666666", uass: "changxian.zh", employee: "43355223", created: "2024-05-11 20:07", status: "已启用" },
  { id: "100004613351", name: "jiaxusheng99.zh", nickname: "jiaxusheng.zh", type: "子账号", email: "jiaxusheng99.zh@cpic.com", phone: "13566666555", uass: "jiaxusheng.zh", employee: "11087823", created: "2024-05-11 20:07", status: "已启用" },
];

const GROUP_DATA = [
  "AAAAAA...", "test05121234566666", "test051222", "jhtest测试用户组0512",
  "测试用户组0512", "测试用户组0511", "测试预设策略", "新建测试用户组2300",
  "新建测试用户组2036", "新建测试用户组0476",
];

const INITIAL_GROUPS: UserGroup[] = [
  { id: "g001", name: "test", remark: "", userCount: 0, created: "2020-05-12 14:30:00" },
  { id: "g002", name: "test123", remark: "", userCount: 1, created: "2020-05-12 15:00:00" },
  { id: "g003", name: "测试用户组", remark: "测试备注", userCount: 3, created: "2020-05-12 10:00:00" },
  { id: "g004", name: "默认用户组", remark: "默认", userCount: 2, created: "2020-05-12 09:00:00" },
  { id: "g005", name: "jhtest测试用户组0512", remark: "", userCount: 0, created: "2020-05-12 16:00:00" },
  { id: "g006", name: "测试用户组0512", remark: "", userCount: 0, created: "2020-05-12 11:00:00" },
];

const INITIAL_API_KEYS: ApiKey[] = [
  { id: "k001", account: "admin", key: "************abcd", keyFull: "AKIDabcdefgh12345678abcd", created: "2025-06-15 10:30:00", status: "正常" },
  { id: "k002", account: "ops_user", key: "****************ef12", keyFull: "AKIDef12uvwxyz9876543210", created: "2025-06-14 14:20:00", status: "正常" },
  { id: "k003", account: "test_user", key: "**************gh56", keyFull: "AKIDgh56pqrstu1234567890", created: "2025-06-10 09:15:00", status: "已禁用" },
];

const INITIAL_POLICIES: Policy[] = [
  { id: "p001", name: "云实例", remark: "平台测试用的内部云实例", type: "预置策略", created: "2025-06-23 11:10:16" },
  { id: "p002", name: "虚拟化漏洞扫描系统-只读策略", remark: "虚拟化漏洞扫描系统只读权限", type: "预置策略", created: "2025-06-20 09:30:00" },
  { id: "p003", name: "平台管理员策略", remark: "平台全量管理权限", type: "自定义策略", created: "2025-05-15 14:20:00" },
  { id: "p004", name: "云服务器只读策略", remark: "", type: "预置策略", created: "2025-04-10 10:00:00" },
  { id: "p005", name: "对象存储读写策略", remark: "COS读写权限", type: "自定义策略", created: "2025-03-22 16:45:00" },
];

const AVAILABLE_GROUPS_LIST = [
  { name: "test0113测试用户组", remark: "" },
  { name: "test0113测试用户组2", remark: "" },
  { name: "测试用户组A", remark: "测试备注A" },
  { name: "开发组", remark: "开发人员组" },
  { name: "运维组", remark: "运维人员组" },
  { name: "默认用户组", remark: "" },
];

const AVAILABLE_USERS_LIST = [
  { name: "CrypZion", nickname: "" },
  { name: "heath", nickname: "开发-李雨萌" },
  { name: "wuxiaofu", nickname: "" },
  { name: "liuyanwen", nickname: "xiaoyanwen" },
  { name: "zhuxiaolin", nickname: "开发-赵晓林" },
  { name: "yanchunhong", nickname: "开发-闫春红" },
  { name: "fuyanming", nickname: "付艳明" },
  { name: "lihui", nickname: "xiaohui123" },
  { name: "pengxiaohui", nickname: "丁晓辉" },
];

const POLICY_PRODUCTS = ["三数云服务", "虚拟私有网络", "IT资管理", "应用管理", "专线接入", "三数数据分析-图数据库", "三数数据Oracle-图数据库"];
const POLICY_APIS = [
  { name: "DescribeInstances", url: "/api/v2/instances/list", desc: "查询实例列表", version: "v2" },
  { name: "DescribeInstanceDetail", url: "/api/v2/instances/detail", desc: "查询实例详情", version: "v2" },
  { name: "StartInstance", url: "/api/v2/instances/start", desc: "启动实例", version: "v2" },
  { name: "StopInstance", url: "/api/v2/instances/stop", desc: "关机实例", version: "v2" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const IC = {
  close: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M13.5 4.5L4.5 13.5" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.5"/>
      <path d="M4.5 4.5L13.5 13.5" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.5"/>
    </svg>
  ),
  search: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M12.25 12.25L9.71833 9.71833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <circle cx="5.83333" cy="5.83333" r="4.08333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
  plus: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.91667 7H11.0833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M7 2.91667V11.0833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
  upload: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 8.75V1.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M4.08333 4.66667L7 1.75L9.91667 4.66667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M2.33333 10.7917C2.33333 11.6667 2.91667 12.25 3.79167 12.25H10.2083C11.0833 12.25 11.6667 11.6667 11.6667 10.7917" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
  download: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.75V8.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M4.08333 5.83333L7 8.75L9.91667 5.83333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M2.33333 10.7917C2.33333 11.6667 2.91667 12.25 3.79167 12.25H10.2083C11.0833 12.25 11.6667 11.6667 11.6667 10.7917" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
  trash: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5.83333 6.41667V9.91667M8.16667 6.41667V9.91667M1.75 3.5H12.25M3.5 3.5L4.08333 11.0833C4.08333 11.6667 4.66667 12.25 5.25 12.25H8.75C9.33333 12.25 9.91667 11.6667 9.91667 11.0833L10.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M5.25 3.5V2.33333C5.25 1.75 5.83333 1.16667 6.41667 1.16667H7.58333C8.16667 1.16667 8.75 1.75 8.75 2.33333V3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
  group: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.75" y="3.5" width="4.66667" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.16667"/>
      <path d="M5.25 1.75V12.25M8.75 1.75V12.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.16667"/>
    </svg>
  ),
  edit: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.33333 11.6667L4.08333 11.0833L11.0833 4.08333C11.4167 3.75 11.4167 3.20833 11.0833 2.875C10.75 2.54167 10.2083 2.54167 9.875 2.875L2.875 9.875L2.33333 11.6667Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M8.75 2.91667L11.0833 5.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
  chevRight: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 12L10 8L6 4" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.33333"/>
    </svg>
  ),
  chevLeft: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8L10 4" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.33333"/>
    </svg>
  ),
  chevDown: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.16667"/>
    </svg>
  ),
  user: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.3337 14C13.3337 14 14.667 14 14.667 12.6667C14.667 11.3333 13.3337 7.33333 8.00033 7.33333C2.66699 7.33333 1.33366 11.3333 1.33366 12.6667C1.33366 14 2.66699 14 2.66699 14H13.3337Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/>
      <path d="M8.00033 6C9.47308 6 10.667 4.80609 10.667 3.33333C10.667 1.86057 9.47308 0.666664 8.00033 0.666664C6.52757 0.666664 5.33366 1.86057 5.33366 3.33333C5.33366 4.80609 6.52757 6 8.00033 6Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/>
    </svg>
  ),
  logout: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M12 12.75L15.75 9L12 5.25" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
      <path d="M15.75 9H6.75" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
      <path d="M9 15.75H3.75C3.15326 15.75 2.58097 15.5129 2.15901 15.091C1.73705 14.669 1.5 14.0967 1.5 13.5V4.5C1.5 3.90326 1.73705 3.33097 2.15901 2.90901C2.58097 2.48705 3.15326 2.25 3.75 2.25H9" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    </svg>
  ),
  alert: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.16667L12.8333 11.0833H1.16667L7 1.16667Z" stroke="#FF4D4F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M7 4.66667V7M7 9.33333H7.00583" stroke="#FF4D4F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
  moreHoriz: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="2.33333" cy="7" r="1.16667" fill="currentColor"/>
      <circle cx="7" cy="7" r="1.16667" fill="currentColor"/>
      <circle cx="11.6667" cy="7" r="1.16667" fill="currentColor"/>
    </svg>
  ),
  eye: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.16667 7C1.16667 7 3.5 2.33333 7 2.33333C10.5 2.33333 12.8333 7 12.8333 7C12.8333 7 10.5 11.6667 7 11.6667C3.5 11.6667 1.16667 7 1.16667 7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.16667"/>
    </svg>
  ),
  eyeOff: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.04167 2.04167L11.9583 11.9583M5.72917 5.72917C5.28333 6.17 5 6.79167 5 7.47917C5 8.84583 6.05833 9.95833 7.35417 9.95833C8.04167 9.95833 8.6625 9.6625 9.10417 9.22083" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
      <path d="M3.79167 3.5C2.57917 4.35 1.75 5.6 1.75 7C1.75 7 3.5 11.0833 7 11.0833C8.24583 11.0833 9.275 10.6292 10.0833 9.91667M6.41667 3.02083C6.6125 2.99583 6.80417 2.97917 7 2.97917C10.5 2.97917 12.25 7 12.25 7C12.25 7 11.8667 7.8225 11.2 8.59167" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
  info: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.83333" stroke="#1890ff" strokeWidth="1.16667"/>
      <path d="M7 6.41667V9.91667M7 4.66667H7.00583" stroke="#1890ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
    </svg>
  ),
};

// ─── Base UI ──────────────────────────────────────────────────────────────────

function BtnPrimary({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1 rounded-[4px] text-white font-medium transition-opacity hover:opacity-85 active:opacity-70"
      style={{ background: "#1890ff", height: 32, padding: "0 16px", fontSize: 14, flexShrink: 0, ...style }}
    >
      {children}
    </button>
  );
}

function BtnDefault({ children, onClick, danger, style }: { children: React.ReactNode; onClick?: () => void; danger?: boolean; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1 rounded-[4px] bg-white border border-[#d9d9d9] font-medium transition-colors hover:border-[#40a9ff] hover:text-[#40a9ff]"
      style={{ color: danger ? "#ff4d4f" : "rgba(0,0,0,0.85)", height: 32, padding: "0 15px", fontSize: 14, flexShrink: 0, ...style }}
    >
      {children}
    </button>
  );
}

function FieldInput({ value, onChange, placeholder, disabled, style }: { value: string; onChange?: (v: string) => void; placeholder?: string; disabled?: boolean; style?: React.CSSProperties }) {
  return (
    <input
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="rounded-[4px] border border-[#d9d9d9] bg-white outline-none transition-all focus:border-[#40a9ff] focus:shadow-[0_0_0_2px_rgba(24,144,255,0.2)] disabled:bg-[#f5f5f5] disabled:text-[rgba(0,0,0,0.45)]"
      style={{ height: 32, padding: "0 11px", fontSize: 14, color: "rgba(0,0,0,0.85)", width: style?.width ? undefined : "100%", ...style }}
    />
  );
}

function StatusTag({ status }: { status: string }) {
  const ok = status === "已启用";
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2 font-medium"
      style={{ height: 26, fontSize: 12, color: ok ? "#52c41a" : "#ff4d4f", background: ok ? "rgba(82,196,26,0.1)" : "rgba(255,77,79,0.1)", border: `1px solid ${ok ? "rgba(82,196,26,0.2)" : "rgba(255,77,79,0.2)"}` }}
    >
      {status}
    </span>
  );
}

function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-[#f0f0f0]">
      <span style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }}>共 {total} 条</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9] hover:border-[#40a9ff] transition-colors disabled:opacity-40"
          style={{ width: 32, height: 32 }}><IC.chevLeft /></button>
        {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onChange(p)}
            className="flex items-center justify-center rounded-[4px] transition-colors"
            style={{ width: 32, height: 32, fontSize: 14, fontWeight: page === p ? 500 : 400, background: page === p ? "#1890ff" : "white", color: page === p ? "white" : "rgba(0,0,0,0.85)", border: `1px solid ${page === p ? "#1890ff" : "#d9d9d9"}` }}
          >{p}</button>
        ))}
        {totalPages > 6 && <span style={{ fontSize: 14, color: "rgba(0,0,0,0.45)", margin: "0 4px" }}>…</span>}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9] hover:border-[#40a9ff] transition-colors disabled:opacity-40"
          style={{ width: 32, height: 32 }}><IC.chevRight /></button>
      </div>
      <div className="flex items-center gap-1 rounded-[4px] bg-white border border-[#d9d9d9]" style={{ height: 32, padding: "0 8px", fontSize: 14, color: "rgba(0,0,0,0.85)" }}>
        10条/页 <IC.chevDown />
      </div>
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, footer, width = 480, children }: {
  title: string; onClose: () => void;
  footer?: React.ReactNode; width?: number; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[8px] flex flex-col" style={{ width, maxHeight: "90vh", boxShadow: "0 4px 6px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between px-6 border-b border-[#f0f0f0]" style={{ height: 57, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>{title}</span>
          <button onClick={onClose} className="opacity-45 hover:opacity-85 transition-opacity"><IC.close /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 border-t border-[#f0f0f0]" style={{ height: 65, flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmModal({ title, content, onClose, onConfirm }: { title: string; content: React.ReactNode; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title={title} onClose={onClose} width={420}
      footer={<><BtnDefault onClick={onClose}>取消</BtnDefault><BtnPrimary onClick={onConfirm}>确定</BtnPrimary></>}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center rounded-[11px] flex-shrink-0 font-bold text-white" style={{ width: 22, height: 22, background: "#faad14", fontSize: 14 }}>!</div>
        <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>{content}</span>
      </div>
    </Modal>
  );
}

// ─── Top Header ───────────────────────────────────────────────────────────────

const NAV_ITEMS = ["总览", "资源管理", "用户权限", "计量管理", "客户服务", "消息中心", "行为审计"];

function TopHeader({ activeNav, onNav, onPersonal }: { activeNav: string; onNav: (n: string) => void; onPersonal: () => void }) {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center" style={{ height: 56, background: "#1e5aa8", boxShadow: "0 2px 2px rgba(0,0,0,0.08)", flexShrink: 0, zIndex: 10 }}>
      <div style={{ width: 120, paddingLeft: 24, flexShrink: 0 }}>
        <span className="font-medium text-white" style={{ fontSize: 16 }}>统一运营平台</span>
      </div>
      <div className="flex items-stretch flex-1 h-full">
        {NAV_ITEMS.map(item => (
          <button key={item} onClick={() => onNav(item)}
            className="relative flex items-center h-full font-medium text-white transition-opacity hover:opacity-100"
            style={{ padding: "0 20px", fontSize: 14, opacity: activeNav === item ? 1 : 0.75 }}
          >
            {item}
            {activeNav === item && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white rounded-sm" style={{ width: 55, height: 2 }} />}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2" style={{ paddingRight: 24, flexShrink: 0 }}>
        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button onClick={() => setDropOpen(v => !v)} className="flex items-center gap-2 rounded-[4px] px-2 py-1 transition-colors hover:bg-[rgba(255,255,255,0.12)]">
            <div className="flex items-center justify-center rounded-[14px]" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.25)" }}>
              <IC.user />
            </div>
            <span className="text-white" style={{ fontSize: 14 }}>uopsub.zh1</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.65 }}>
              <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2"/>
            </svg>
          </button>
          {dropOpen && (
            <div className="absolute right-0 bg-white rounded-[4px] py-1 z-50" style={{ top: 44, minWidth: 140, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <button onClick={() => { onPersonal(); setDropOpen(false); }}
                className="w-full flex items-center gap-2 px-4 hover:bg-[#f5f5f5] transition-colors"
                style={{ height: 40, fontSize: 14, color: "rgba(0,0,0,0.85)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3337 14C13.3337 14 14.667 14 14.667 12.6667C14.667 11.3333 13.3337 7.33333 8.00033 7.33333C2.66699 7.33333 1.33366 11.3333 1.33366 12.6667C1.33366 14 2.66699 14 2.66699 14H13.3337Z" stroke="rgba(0,0,0,0.65)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2"/>
                  <path d="M8.00033 6C9.47308 6 10.667 4.80609 10.667 3.33333C10.667 1.86057 9.47308 0.666664 8.00033 0.666664C6.52757 0.666664 5.33366 1.86057 5.33366 3.33333C5.33366 4.80609 6.52757 6 8.00033 6Z" stroke="rgba(0,0,0,0.65)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2"/>
                </svg>
                个人中心
              </button>
              <div style={{ height: 1, background: "#f0f0f0", margin: "2px 0" }} />
              <button className="w-full flex items-center gap-2 px-4 hover:bg-[#f5f5f5] transition-colors"
                style={{ height: 40, fontSize: 14, color: "rgba(0,0,0,0.85)" }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M12 12.75L15.75 9L12 5.25" stroke="rgba(0,0,0,0.65)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
                  <path d="M15.75 9H6.75" stroke="rgba(0,0,0,0.65)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
                  <path d="M9 15.75H3.75C3.15326 15.75 2.58097 15.5129 2.15901 15.091C1.73705 14.669 1.5 14.0967 1.5 13.5V4.5C1.5 3.90326 1.73705 3.33097 2.15901 2.90901C2.58097 2.48705 3.15326 2.25 3.75 2.25H9" stroke="rgba(0,0,0,0.65)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
                </svg>
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebars ─────────────────────────────────────────────────────────────────

function PersonalSidebar({ active, onSelect }: { active: string; onSelect: (k: string) => void }) {
  const items = [{ key: "personal-center", label: "个人中心" }, { key: "account-custody", label: "账号纳管" }];
  return (
    <div style={{ width: 200, background: "#001529", flexShrink: 0 }}>
      <div className="flex items-center uppercase tracking-[0.24px] font-medium" style={{ height: 44, paddingLeft: 20, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
        个人中心
      </div>
      {items.map(it => (
        <button key={it.key} onClick={() => onSelect(it.key)}
          className="w-full text-left flex items-center font-medium transition-colors"
          style={{ height: 40, paddingLeft: 20, fontSize: 14, color: active === it.key ? "#fff" : "rgba(255,255,255,0.65)", background: active === it.key ? "#1890ff" : "transparent" }}
        >{it.label}</button>
      ))}
    </div>
  );
}

const MGMT_ITEMS = [
  { key: "user-management", label: "用户管理" },
  { key: "user-group-management", label: "用户组管理" },
  { key: "policy-management", label: "策略管理" },
  { key: "cloud-api", label: "云API密钥" },
  { key: "uass-auth", label: "UASS认证管理" },
];

function UserMgmtSidebar({ active, onSelect }: { active: string; onSelect: (k: string) => void }) {
  return (
    <div style={{ width: 200, background: "#001529", flexShrink: 0 }}>
      <div className="flex items-center uppercase tracking-[0.24px] font-medium" style={{ height: 44, paddingLeft: 20, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
        用户权限
      </div>
      {MGMT_ITEMS.map(it => (
        <button key={it.key} onClick={() => onSelect(it.key)}
          className="w-full text-left flex items-center font-medium transition-colors"
          style={{ height: 40, paddingLeft: 20, fontSize: 14, color: active === it.key ? "#fff" : "rgba(255,255,255,0.65)", background: active === it.key ? "#1890ff" : "transparent" }}
        >{it.label}</button>
      ))}
    </div>
  );
}

// ─── Personal Center Page ─────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[8px] border border-[#e8e8e8] p-6" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
      <div className="font-medium mb-6" style={{ fontSize: 16, color: "rgba(0,0,0,0.85)" }}>{title}</div>
      {children}
    </div>
  );
}

function InfoItem({ label, value, editable, onEdit }: { label: string; value: string; editable?: boolean; onEdit?: () => void }) {
  return (
    <div className="flex items-center" style={{ fontSize: 14, minHeight: 22 }}>
      <span style={{ color: "rgba(0,0,0,0.65)", fontWeight: 500, minWidth: 70 }}>{label}：</span>
      <span style={{ color: "rgba(0,0,0,0.85)", marginLeft: 8 }}>{value}</span>
      {editable && (
        <button onClick={onEdit} className="ml-2 text-[#1890ff] opacity-60 hover:opacity-100 transition-opacity">
          <IC.edit />
        </button>
      )}
    </div>
  );
}

function PersonalCenterPage({ onEditAccount }: { onEditAccount: () => void }) {
  const [usbKey, setUsbKey] = useState(false);
  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 16, color: "rgba(0,0,0,0.85)" }}>个人中心</div>
      <Card title="账号信息">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <InfoItem label="账号ID" value="10000461005" />
          <InfoItem label="租户ID" value="1364610003" />
          <InfoItem label="登录账号" value="uopsub.zh1" />
          <InfoItem label="账号类型" value="子账号" />
          <InfoItem label="手机号" value="134****3456" />
          <InfoItem label="安全邮箱" value="u***@ccb.com" />
          <InfoItem label="UASS账号" value="—" editable onEdit={onEditAccount} />
          <InfoItem label="8位员工号" value="—" editable onEdit={onEditAccount} />
          <InfoItem label="昵称" value="uopsub.zh1" editable onEdit={onEditAccount} />
          <InfoItem label="注册时间" value="2022-06-16 14:17:57" />
        </div>
        <button className="mt-5" style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>修改密码</button>
      </Card>
      <Card title="账号权限">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          <InfoItem label="账号类型" value="子账号" />
          <InfoItem label="关联策略" value="平台管理员策略" />
          <InfoItem label="关联用户组" value="平台管理员用户组, 开发人员组" />
        </div>
      </Card>
      <Card title="账号安全设置">
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500 }}>安全设置：</span>
          <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>USBKey二次校验</span>
          <button onClick={() => setUsbKey(v => !v)} className="relative rounded-[12px] transition-colors"
            style={{ width: 44, height: 22, background: usbKey ? "#1890ff" : "rgba(0,0,0,0.25)", flexShrink: 0 }}>
            <span className="absolute top-[2px] rounded-[9px] bg-white transition-all"
              style={{ width: 18, height: 18, left: usbKey ? 24 : 2, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── User Management List Page ────────────────────────────────────────────────

function MoreMenu({ isDisabled, onAddToGroup, onToggleDisable }: { isDisabled: boolean; onAddToGroup: () => void; onToggleDisable: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div className="relative inline-block" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>更多</button>
      {open && (
        <div className="absolute right-0 z-20 bg-white border border-[#e8e8e8] rounded-[4px] py-1" style={{ minWidth: 96, top: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <button onClick={() => { onAddToGroup(); setOpen(false); }} className="w-full text-left px-4 hover:bg-[#f5f5f5] transition-colors" style={{ height: 36, fontSize: 14, color: "rgba(0,0,0,0.85)" }}>添加到组</button>
          <button onClick={() => { onToggleDisable(); setOpen(false); }} className="w-full text-left px-4 hover:bg-[#f5f5f5] transition-colors" style={{ height: 36, fontSize: 14, color: "rgba(0,0,0,0.85)" }}>
            {isDisabled ? "启用" : "禁用"}
          </button>
        </div>
      )}
    </div>
  );
}

function UserListPage({
  users, setUsers,
  onAddSubAccount, onImportData, onAddToGroup, onViewUser, onDeleteUser,
}: {
  users: User[]; setUsers: (u: User[]) => void;
  onAddSubAccount: () => void; onImportData: () => void;
  onAddToGroup: () => void; onViewUser: (u: User) => void;
  onDeleteUser: (u: User) => void;
}) {
  const [filters, setFilters] = useState({ account: "", email: "", phone: "", uass: "", employee: "" });
  const [applied, setApplied] = useState({ account: "", email: "", phone: "", uass: "", employee: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = users.filter(u => {
    const q = applied;
    if (q.account && !u.name.includes(q.account) && !u.id.includes(q.account) && !u.nickname.includes(q.account)) return false;
    if (q.email && !u.email.includes(q.email)) return false;
    if (q.phone && !u.phone.includes(q.phone)) return false;
    if (q.uass && !u.uass.includes(q.uass)) return false;
    if (q.employee && !u.employee.includes(q.employee)) return false;
    return true;
  });

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allChecked = paged.length > 0 && paged.every(u => selectedIds.has(u.id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allChecked) paged.forEach(u => next.delete(u.id));
    else paged.forEach(u => next.add(u.id));
    setSelectedIds(next);
  };

  const handleDelete = () => {
    if (!selectedIds.size) return;
    if (!window.confirm(`确认删除选中的 ${selectedIds.size} 条记录？`)) return;
    setUsers(users.filter(u => !selectedIds.has(u.id)));
    setSelectedIds(new Set());
    setPage(1);
  };

  const toggleDisable = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "已启用" ? "已禁用" : "已启用" } : u));
  };

  const FIELDS: [keyof typeof filters, string, string][] = [
    ["account", "账号", "请输入账号名称/账号ID/昵称"],
    ["email", "安全邮箱", "请输入安全邮箱"],
    ["phone", "手机号码", "请输入手机号码"],
    ["uass", "UASS账号", "请输入UASS账号"],
    ["employee", "8位员工号", "请输入8位员工号"],
  ];

  const thStyle: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "13px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "0 16px", fontSize: 14, color: "rgba(0,0,0,0.85)", verticalAlign: "middle" };

  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 16, color: "rgba(0,0,0,0.85)" }}>用户管理</div>

      {/* Search card */}
      <div className="bg-white rounded-[8px] border border-[#e8e8e8] px-6 py-5" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {FIELDS.map(([key, label, ph]) => (
            <div key={key} className="flex items-center">
              <span style={{ fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap", paddingRight: 10, minWidth: 76, flexShrink: 0 }}>{label}</span>
              <FieldInput value={filters[key]} onChange={v => setFilters(f => ({ ...f, [key]: v }))} placeholder={ph} />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-5">
          <BtnPrimary onClick={() => { setApplied({ ...filters }); setPage(1); }}>
            <IC.search /><span>查询</span>
          </BtnPrimary>
          <BtnDefault onClick={() => { const z = { account: "", email: "", phone: "", uass: "", employee: "" }; setFilters(z); setApplied(z); setPage(1); }}>
            重置
          </BtnDefault>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center">
        <div className="flex items-center gap-2 flex-1">
          <BtnPrimary onClick={onAddSubAccount}><IC.plus /><span>添加子账号</span></BtnPrimary>
          <BtnDefault onClick={handleDelete}><IC.trash /><span>删除</span></BtnDefault>
        </div>
        <div className="flex items-center gap-2">
          <BtnDefault onClick={onImportData}><IC.upload /><span>导入</span></BtnDefault>
          <BtnDefault><IC.download /><span>导出</span></BtnDefault>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[8px] border border-[#e8e8e8] flex flex-col" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1100 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 48, paddingLeft: 24 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="cursor-pointer" />
                </th>
                <th style={thStyle}>账号ID</th>
                <th style={thStyle}>账号名称</th>
                <th style={thStyle}>昵称</th>
                <th style={thStyle}>账号类型</th>
                <th style={thStyle}>安全邮箱</th>
                <th style={thStyle}>手机号码</th>
                <th style={thStyle}>UASS账号</th>
                <th style={thStyle}>8位员工号</th>
                <th style={thStyle}>注册时间</th>
                <th style={thStyle}>账号状态</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={12} style={{ ...tdStyle, textAlign: "center", padding: "48px 0", color: "rgba(0,0,0,0.45)" }}>暂无数据</td></tr>
              ) : paged.map(u => (
                <tr key={u.id} style={{ height: 83 }} className="hover:bg-[#fafafa] transition-colors">
                  <td style={{ ...tdStyle, paddingLeft: 24 }}>
                    <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => {
                      const next = new Set(selectedIds);
                      next.has(u.id) ? next.delete(u.id) : next.add(u.id);
                      setSelectedIds(next);
                    }} className="cursor-pointer" />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ lineHeight: "22px" }}>{u.id.slice(0, 5)}</div>
                    <div style={{ lineHeight: "22px" }}>{u.id.slice(5, 10)}</div>
                    <div style={{ lineHeight: "22px" }}>{u.id.slice(10)}</div>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 160 }}><div className="overflow-hidden text-ellipsis whitespace-nowrap">{u.name}</div></td>
                  <td style={{ ...tdStyle, maxWidth: 160 }}><div className="overflow-hidden text-ellipsis whitespace-nowrap">{u.nickname}</div></td>
                  <td style={tdStyle}>{u.type}</td>
                  <td style={{ ...tdStyle, maxWidth: 120 }}><div className="overflow-hidden text-ellipsis whitespace-nowrap">{u.email}</div></td>
                  <td style={tdStyle}>{u.phone}</td>
                  <td style={{ ...tdStyle, maxWidth: 110 }}><div className="overflow-hidden text-ellipsis whitespace-nowrap">{u.uass}</div></td>
                  <td style={tdStyle}>{u.employee}</td>
                  <td style={tdStyle}>{u.created}</td>
                  <td style={tdStyle}><StatusTag status={u.status} /></td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <button onClick={() => onViewUser(u)} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>编辑</button>
                    <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                    <button onClick={() => onDeleteUser(u)} className="font-medium hover:text-[#ff7875] transition-colors" style={{ fontSize: 14, color: "#ff4d4f" }}>删除</button>
                    <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                    <MoreMenu isDisabled={u.status === "已禁用"} onAddToGroup={onAddToGroup} onToggleDisable={() => toggleDisable(u.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}

// ─── User Edit Page ───────────────────────────────────────────────────────────

function UserEditPage({ user, onBack, onAddToGroup }: { user: User; onBack: () => void; onAddToGroup: () => void }) {
  const [form, setForm] = useState({ name: user.name, nickname: user.nickname, uass: user.uass, email: user.email, phone: user.phone, employee: user.employee });
  const [groupSearch, setGroupSearch] = useState("");
  const [userGroups] = useState<string[]>([]);

  const f = (key: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));
  const lbl: React.CSSProperties = { fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap", paddingRight: 12, minWidth: 90 };
  const thStyle: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "8px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left" };
  const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "12px 16px", fontSize: 14, color: "rgba(0,0,0,0.85)" };

  const Row2 = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center">
      <span style={lbl}>{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 16, color: "rgba(0,0,0,0.85)" }}>用户管理</div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8] p-6" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="font-medium mb-5" style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>用户信息</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <Row2 label="账号名称"><FieldInput value={form.name} onChange={f("name")} /></Row2>
          <Row2 label="昵称"><FieldInput value={form.nickname} onChange={f("nickname")} /></Row2>
          <Row2 label="手机号码"><FieldInput value={form.phone} onChange={f("phone")} /></Row2>
          <Row2 label="安全邮箱"><FieldInput value={form.email} onChange={f("email")} /></Row2>
          <Row2 label="UASS账号"><FieldInput value={form.uass} onChange={f("uass")} /></Row2>
          <Row2 label="8位员工号"><FieldInput value={form.employee} onChange={f("employee")} /></Row2>
          <Row2 label="控制台密码">
            <button style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>【重置密码】</button>
          </Row2>
          <Row2 label="账号状态"><StatusTag status={user.status} /></Row2>
        </div>
        <div className="flex justify-center gap-2 mt-6">
          <BtnPrimary onClick={onBack}>确定</BtnPrimary>
          <BtnDefault onClick={onBack}>取消</BtnDefault>
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8] p-6" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="font-medium mb-4" style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>添加到组</div>
        <div className="flex items-center gap-2 mb-4">
          <FieldInput value={groupSearch} onChange={setGroupSearch} placeholder="搜索用户组名称" style={{ width: 200 }} />
          <BtnPrimary onClick={onAddToGroup}><IC.plus /><span>添加到组</span></BtnPrimary>
          <BtnDefault><IC.trash /><span>删除</span></BtnDefault>
        </div>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={thStyle}>用户组名称</th>
              <th style={thStyle}>备注</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {userGroups.length === 0
              ? <tr><td colSpan={3} style={{ ...tdStyle, textAlign: "center", color: "rgba(0,0,0,0.45)", padding: "40px 0" }}>暂无数据</td></tr>
              : userGroups.map(g => (
                <tr key={g}>
                  <td style={tdStyle}>{g}</td>
                  <td style={tdStyle}>—</td>
                  <td style={tdStyle}><button style={{ color: "#ff4d4f", fontSize: 14 }}>删除</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function EditAccountModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ secretId: "", secretKey: "", desc: "" });
  const f = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  const row = (label: string, value: string) => (
    <div className="flex items-center" style={{ marginBottom: 24 }}>
      <span style={{ width: 80, fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>{value}</span>
    </div>
  );
  const reqRow = (label: string, node: React.ReactNode) => (
    <div className="flex items-start" style={{ marginBottom: 24 }}>
      <div className="flex items-center" style={{ width: 80, paddingTop: 5, flexShrink: 0 }}>
        <span style={{ color: "#ff4d4f", marginRight: 2, fontSize: 14 }}>*</span>
        <span style={{ fontSize: 14, color: "rgba(0,0,0,0.65)" }}>{label}</span>
      </div>
      <div className="flex-1 min-w-0">{node}</div>
    </div>
  );
  return (
    <Modal title="编辑账号" onClose={onClose} footer={<><BtnDefault onClick={onClose}>取消</BtnDefault><BtnPrimary onClick={onClose}>确定</BtnPrimary></>}>
      {row("功能区", "测试区")}
      {row("实例", "平台测试信创内蒙云实例")}
      {row("地域", "内蒙")}
      {row("账号", "uopsub.zh1")}
      {row("账号类型", "子账号")}
      {reqRow("SecretId", <FieldInput value={form.secretId} onChange={f("secretId")} placeholder="请输入SecretId" />)}
      {reqRow("SecretKey", <FieldInput value={form.secretKey} onChange={f("secretKey")} placeholder="请输入SecretKey" />)}
      <div className="flex items-start">
        <span style={{ width: 80, fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, paddingTop: 5, flexShrink: 0 }}>描述</span>
        <textarea value={form.desc} onChange={e => f("desc")(e.target.value)}
          className="flex-1 rounded-[4px] border border-[#d9d9d9] bg-white outline-none resize-none focus:border-[#40a9ff] focus:shadow-[0_0_0_2px_rgba(24,144,255,0.2)] transition-all"
          style={{ height: 84, padding: "5px 11px", fontSize: 14, color: "rgba(0,0,0,0.85)" }}
        />
      </div>
    </Modal>
  );
}

function AddSubAccountModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", nickname: "", phone: "", email: "", uass: "", employee: "", pwdType: "auto", password: "" });
  const f = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const lbl: React.CSSProperties = { fontSize: 14, color: "rgba(0,0,0,0.85)", fontWeight: 500, whiteSpace: "nowrap", paddingRight: 12, minWidth: 96, flexShrink: 0 };
  const req = (label: string, node: React.ReactNode) => (
    <div className="flex items-center" style={{ marginBottom: 20 }}>
      <div className="flex items-center" style={{ ...lbl }}>
        <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>
        <span>{label}</span>
      </div>
      <div className="flex-1 min-w-0">{node}</div>
    </div>
  );
  const opt = (label: string, node: React.ReactNode) => (
    <div className="flex items-center" style={{ marginBottom: 20 }}>
      <span style={lbl}>{label}</span>
      <div className="flex-1 min-w-0">{node}</div>
    </div>
  );

  return (
    <Modal title="添加子账号" onClose={onClose} width={580}
      footer={<><BtnDefault onClick={onClose}>取消</BtnDefault><BtnPrimary onClick={onClose}>确定</BtnPrimary></>}
    >
      {req("账号名称", <FieldInput value={form.name} onChange={f("name")} />)}
      {opt("昵称", <FieldInput value={form.nickname} onChange={f("nickname")} />)}
      {req("手机号码", <FieldInput value={form.phone} onChange={f("phone")} />)}
      {req("安全邮箱", <FieldInput value={form.email} onChange={f("email")} />)}
      {req("UASS账号", <FieldInput value={form.uass} onChange={f("uass")} placeholder="请输入UASS账号" />)}
      {req("8位员工号", <FieldInput value={form.employee} onChange={f("employee")} />)}
      {opt("用户组",
        <button className="w-full flex items-center justify-between rounded-[4px] border border-[#d9d9d9] bg-white hover:border-[#40a9ff] transition-colors" style={{ height: 32, padding: "0 11px", fontSize: 14, color: "rgba(0,0,0,0.45)" }}>
          <span>请选择</span><IC.chevDown />
        </button>
      )}
      <div className="flex items-start" style={{ marginBottom: 20 }}>
        <span style={lbl}>控制台密码</span>
        <div className="flex-1">
          <label className="flex items-start gap-2 cursor-pointer mb-3" onClick={() => f("pwdType")("auto")}>
            <div className="relative mt-[2px] flex-shrink-0" style={{ width: 16, height: 16 }}>
              <div className="rounded-[8px]" style={{ width: 16, height: 16, background: form.pwdType === "auto" ? "#1890ff" : "white", border: `1px solid ${form.pwdType === "auto" ? "#1890ff" : "#d9d9d9"}` }} />
              {form.pwdType === "auto" && <div className="absolute rounded-[3px] bg-white" style={{ width: 6, height: 6, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />}
            </div>
            <div>
              <div style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>自动生成密码</div>
              {form.pwdType === "auto" && (
                <div className="flex items-center gap-2 mt-1">
                  <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>请点击按钮生成随机密码</span>
                  <button style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>生成</button>
                </div>
              )}
            </div>
          </label>
          <label className="flex items-center gap-2 cursor-pointer" onClick={() => f("pwdType")("custom")}>
            <div className="flex-shrink-0 rounded-[8px]" style={{ width: 16, height: 16, background: "white", border: `1px solid ${form.pwdType === "custom" ? "#1890ff" : "#d9d9d9"}` }} />
            <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>自定义密码</span>
          </label>
          {form.pwdType === "custom" && (
            <div style={{ marginTop: 12 }}>
              <FieldInput value={form.password} onChange={f("password")} placeholder="请输入密码" />
              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", marginTop: 6 }}>
                新密码要10-32位，至少包含大写字母、数字、特殊字符(不含空格)
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ImportDataModal({ onClose }: { onClose: () => void }) {
  const [fileName, setFileName] = useState("");
  return (
    <Modal title="导入用户数据" onClose={onClose} width={480}
      footer={<><BtnDefault onClick={onClose}>取消</BtnDefault><BtnPrimary onClick={onClose}>确定</BtnPrimary></>}
    >
      <div className="flex items-start gap-2 mb-6">
        <span className="flex-shrink-0 mt-[3px]"><IC.alert /></span>
        <span style={{ fontSize: 14, color: "#ff4d4f", fontWeight: 500 }}>严禁引入国家秘密、商业秘密及敏感程度较高的工作秘密文件</span>
      </div>
      <div className="mb-5">
        <BtnPrimary><IC.download /><span>下载模板</span></BtnPrimary>
      </div>
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input type="file" accept=".xls,.xlsx" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name || "")} />
          <BtnDefault style={{ pointerEvents: "none" }}><IC.upload /><span>选择文件</span></BtnDefault>
        </label>
        {fileName && <span style={{ fontSize: 13, color: "rgba(0,0,0,0.65)" }}>{fileName}</span>}
      </div>
      <p style={{ fontSize: 14, color: "rgba(0,0,0,0.45)", marginTop: 8 }}>提示：仅允许导入xls或xlsx格式文件</p>
    </Modal>
  );
}

function AddToGroupModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [leftPage, setLeftPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<string[]>([]);
  const PAGE = 8;
  const filtered = GROUP_DATA.filter(g => !search || g.includes(search));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const paged = filtered.slice((leftPage - 1) * PAGE, leftPage * PAGE);
  const toggleLeft = (name: string) => { const next = new Set(selected); next.has(name) ? next.delete(name) : next.add(name); setSelected(next); };
  const thS: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "9px 12px", fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left" };
  const tdS: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "6px 12px", fontSize: 12, color: "rgba(0,0,0,0.85)", height: 35 };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[8px] flex flex-col" style={{ width: 800, height: 647, boxShadow: "0 4px 6px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between px-6 border-b border-[#e8e8e8]" style={{ height: 57, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>添加到组</span>
          <button onClick={onClose} className="opacity-45 hover:opacity-85 transition-opacity"><IC.close /></button>
        </div>
        <div className="flex flex-1 min-h-0 p-4 gap-0">
          <div className="flex flex-col border border-[#e8e8e8] rounded-[4px]" style={{ width: 360, flexShrink: 0 }}>
            <div className="flex items-center border-b border-[#e8e8e8] px-3" style={{ height: 38, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>用户组列表</span>
            </div>
            <div className="flex items-center gap-2 border-b border-[#e8e8e8] px-3" style={{ height: 53, flexShrink: 0 }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setLeftPage(1); }} placeholder="请输入用户组名"
                className="flex-1 rounded-[4px] border border-[#d9d9d9] bg-white outline-none focus:border-[#40a9ff] transition-all"
                style={{ height: 28, padding: "0 8px", fontSize: 12 }}
              />
              <button onClick={() => setLeftPage(1)} className="flex items-center justify-center rounded-[4px] text-white font-medium text-[12px]" style={{ background: "#1890ff", height: 28, padding: "0 12px", flexShrink: 0 }}>查询</button>
              <button onClick={() => { setSearch(""); setLeftPage(1); }} style={{ fontSize: 12, color: "#1890ff", fontWeight: 500, flexShrink: 0 }}>重置</button>
            </div>
            <table style={{ borderCollapse: "collapse", flexShrink: 0 }}>
              <thead><tr><th style={thS}>用户组名称</th><th style={{ ...thS, width: 88 }}>备注</th></tr></thead>
            </table>
            <div className="flex-1 overflow-auto">
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <tbody>
                  {paged.map(g => (
                    <tr key={g} onClick={() => toggleLeft(g)} className="cursor-pointer transition-colors"
                      style={{ background: selected.has(g) ? "rgba(24,144,255,0.08)" : "white", height: 35 }}>
                      <td style={{ ...tdS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{g}</td>
                      <td style={{ ...tdS, width: 88 }}>—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[#e8e8e8] px-3" style={{ height: 73, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>共 {filtered.length} 条</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setLeftPage(p)} className="flex items-center justify-center rounded-[4px]"
                    style={{ width: 24, height: 24, fontSize: 12, background: leftPage === p ? "#1890ff" : "white", color: leftPage === p ? "white" : "rgba(0,0,0,0.85)", border: `1px solid ${leftPage === p ? "#1890ff" : "#d9d9d9"}` }}
                  >{p}</button>
                ))}
              </div>
              <div className="flex items-center rounded-[4px] border border-[#d9d9d9] bg-white" style={{ height: 24, padding: "0 6px", fontSize: 12 }}>
                <span>20条/页</span><IC.chevDown />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 px-2" style={{ width: 48, flexShrink: 0 }}>
            <button onClick={() => { const toAdd = [...selected].filter(n => !added.includes(n)); setAdded(prev => [...prev, ...toAdd]); setSelected(new Set()); }}
              className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9] hover:border-[#40a9ff] transition-colors"
              style={{ width: 32, height: 32 }}><IC.chevRight /></button>
            <button onClick={() => setAdded([])}
              className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9] hover:border-[#40a9ff] transition-colors"
              style={{ width: 32, height: 32 }}><IC.chevLeft /></button>
          </div>
          <div className="flex flex-col flex-1 border border-[#e8e8e8] rounded-[4px]">
            <div className="flex items-center border-b border-[#e8e8e8] px-3" style={{ height: 38, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>已选择用户组</span>
            </div>
            <div className="border-b border-[#e8e8e8] px-3 flex items-center" style={{ height: 35, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>用户组</span>
            </div>
            <div className="flex-1 overflow-auto">
              {added.length === 0
                ? <div className="flex items-center justify-center h-full" style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }}>暂无数据</div>
                : added.map(name => (
                  <div key={name} className="flex items-center border-b border-[#f0f0f0] px-3" style={{ height: 35 }}>
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 12, color: "rgba(0,0,0,0.85)" }}>{name}</span>
                    <button onClick={() => setAdded(prev => prev.filter(n => n !== name))} className="hover:text-[#ff7875] transition-colors" style={{ fontSize: 12, color: "#ff4d4f", flexShrink: 0 }}>删除</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 border-t border-[#e8e8e8]" style={{ height: 65, flexShrink: 0 }}>
          <BtnDefault onClick={onClose}>取消</BtnDefault>
          <BtnPrimary onClick={onClose}>确定</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
      <span style={{ fontSize: 14, color: "rgba(0,0,0,0.35)" }}>「{label}」功能暂未开放</span>
    </div>
  );
}

// ─── User Group List Page ─────────────────────────────────────────────────────

function UserGroupListPage({ groups, setGroups, onNewGroup, onEditGroup, onAddUserDirect, onAssocPolicy }: {
  groups: UserGroup[]; setGroups: (g: UserGroup[]) => void;
  onNewGroup: () => void; onEditGroup: (g: UserGroup) => void;
  onAddUserDirect: () => void; onAssocPolicy: () => void;
}) {
  const [filters, setFilters] = useState({ name: "", remark: "" });
  const [applied, setApplied] = useState({ name: "", remark: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const PAGE_SIZE = 10;

  const filtered = groups.filter(g => {
    if (applied.name && !g.name.includes(applied.name)) return false;
    if (applied.remark && !g.remark.includes(applied.remark)) return false;
    return true;
  });
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allChecked = paged.length > 0 && paged.every(g => selectedIds.has(g.id));

  const handleDelete = () => {
    if (!selectedIds.size) return;
    if (!window.confirm(`确认删除选中的 ${selectedIds.size} 条记录？`)) return;
    setGroups(groups.filter(g => !selectedIds.has(g.id)));
    setSelectedIds(new Set());
    setPage(1);
  };
  const handleDeleteRow = (id: string) => {
    if (!window.confirm("确认删除该用户组？")) return;
    setGroups(groups.filter(g => g.id !== id));
  };

  const thStyle: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #e8e8e8", padding: "16px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "0 16px", fontSize: 14, color: "rgba(0,0,0,0.85)", height: 55, verticalAlign: "middle" };
  const lbl: React.CSSProperties = { fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap", paddingRight: 12 };

  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 20, color: "rgba(0,0,0,0.85)" }}>用户组管理</div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8] px-6 py-5" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
          <div className="flex items-center">
            <span style={lbl}>用户组名</span>
            <FieldInput value={filters.name} onChange={v => setFilters(f => ({ ...f, name: v }))} placeholder="请输入用户组名" />
          </div>
          <div className="flex items-center">
            <span style={lbl}>备注</span>
            <FieldInput value={filters.remark} onChange={v => setFilters(f => ({ ...f, remark: v }))} placeholder="请输入备注" />
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <BtnPrimary onClick={() => { setApplied({ ...filters }); setPage(1); }}>
            <IC.search /><span>查询</span>
          </BtnPrimary>
          <BtnDefault onClick={() => { const z = { name: "", remark: "" }; setFilters(z); setApplied(z); setPage(1); }}>重置</BtnDefault>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <BtnPrimary onClick={() => setShowTooltip(v => !v)}>
            <IC.group /><span>同步用户组</span>
          </BtnPrimary>
          {showTooltip && (
            <div className="absolute z-10 bg-[rgba(0,0,0,0.75)] text-white rounded-[4px] p-2 text-[12px] leading-[22px] whitespace-nowrap" style={{ top: 40, left: 0 }}>
              可同步存量基础运营平台上的用<br/>户组到统一运营平台，统一管理<br/>用户权限
            </div>
          )}
        </div>
        <BtnPrimary onClick={onNewGroup}><IC.plus /><span>新建</span></BtnPrimary>
        <BtnDefault onClick={handleDelete}><IC.trash /><span>删除</span></BtnDefault>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8] flex flex-col" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 48, paddingLeft: 24 }}>
                  <input type="checkbox" checked={allChecked} onChange={() => {
                    const next = new Set(selectedIds);
                    if (allChecked) paged.forEach(g => next.delete(g.id));
                    else paged.forEach(g => next.add(g.id));
                    setSelectedIds(next);
                  }} className="cursor-pointer" />
                </th>
                <th style={thStyle}>用户组名</th>
                <th style={thStyle}>备注</th>
                <th style={thStyle}>用户数</th>
                <th style={thStyle}>创建时间</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>暂无数据</td></tr>
                : paged.map(g => (
                  <tr key={g.id} className="hover:bg-[#fafafa] transition-colors">
                    <td style={{ ...tdStyle, paddingLeft: 24 }}>
                      <input type="checkbox" checked={selectedIds.has(g.id)} onChange={() => {
                        const next = new Set(selectedIds);
                        next.has(g.id) ? next.delete(g.id) : next.add(g.id);
                        setSelectedIds(next);
                      }} className="cursor-pointer" />
                    </td>
                    <td style={tdStyle}>{g.name}</td>
                    <td style={tdStyle}>{g.remark || "—"}</td>
                    <td style={tdStyle}>{g.userCount}</td>
                    <td style={tdStyle}>{g.created}</td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <button onClick={() => onEditGroup(g)} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>编辑</button>
                      <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                      <button onClick={() => handleDeleteRow(g.id)} className="font-medium hover:text-[#ff7875] transition-colors" style={{ fontSize: 14, color: "#ff4d4f" }}>删除</button>
                      <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                      <button onClick={onAddUserDirect} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>添加用户</button>
                      <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                      <button onClick={onAssocPolicy} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>关联策略</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}

// ─── User Group Edit Page ─────────────────────────────────────────────────────

function UserGroupEditPage({ group, onBack, onAddUser }: { group: UserGroup; onBack: () => void; onAddUser: () => void }) {
  const [name, setName] = useState(group.name);
  const [remark, setRemark] = useState(group.remark);
  const [activeTab, setActiveTab] = useState<"users" | "policy">("users");
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState<{ name: string; nickname: string; remark: string }[]>([
    { name: "test001", nickname: "测试用户01", remark: "" },
  ]);
  const [assocPolicies, setAssocPolicies] = useState<{ name: string; remark: string; time: string }[]>([
    { name: "policygrm-20200510234617-zhangfan", remark: "", time: "2020-05-16 14:01:22" },
  ]);

  const thStyle: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #e8e8e8", padding: "16px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left" };
  const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "0 16px", fontSize: 14, color: "rgba(0,0,0,0.85)", height: 54, verticalAlign: "middle" };
  const lbl: React.CSSProperties = { fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap", paddingRight: 12, minWidth: 80 };

  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 20, color: "rgba(0,0,0,0.85)" }}>编辑用户组</div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
          <div className="flex items-center">
            <span style={lbl}>用户组名称</span>
            <FieldInput value={name} onChange={setName} />
          </div>
          <div className="flex items-center">
            <span style={lbl}>备注</span>
            <FieldInput value={remark} onChange={setRemark} />
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <BtnDefault onClick={onBack}>取消</BtnDefault>
          <BtnPrimary onClick={onBack}>确定</BtnPrimary>
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-stretch border-b border-[#e8e8e8]" style={{ height: 39 }}>
          {([["users", "已添加用户"], ["policy", "关联策略"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="relative flex items-center px-4 font-medium transition-colors"
              style={{ fontSize: 14, color: activeTab === key ? "#1890ff" : "rgba(0,0,0,0.65)" }}
            >
              {label}
              {activeTab === key && <span className="absolute bottom-0 left-0 right-0 bg-[#1890ff]" style={{ height: 2 }} />}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div>
            <div className="flex items-center gap-3 p-4">
              <FieldInput value={memberSearch} onChange={setMemberSearch} placeholder="搜索登录账户" style={{ width: 200 }} />
              <BtnPrimary onClick={onAddUser}><IC.plus /><span>添加用户</span></BtnPrimary>
              <button style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>移出</button>
            </div>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={thStyle}>登录账号</th>
                  <th style={thStyle}>昵称</th>
                  <th style={thStyle}>备注</th>
                  <th style={thStyle}>操作</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0
                  ? <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>暂无数据</td></tr>
                  : members.map((m, i) => (
                    <tr key={i} className="hover:bg-[#fafafa]">
                      <td style={tdStyle}>{m.name}</td>
                      <td style={tdStyle}>{m.nickname || "—"}</td>
                      <td style={tdStyle}>{m.remark || "—"}</td>
                      <td style={tdStyle}>
                        <button onClick={() => setMembers(prev => prev.filter((_, j) => j !== i))} className="hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>移出</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0]">
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.85)" }}>共 {members.length} 条</span>
              <div className="flex items-center gap-1">
                <button className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9]" style={{ width: 28, height: 28 }}><IC.chevLeft /></button>
                <button className="flex items-center justify-center rounded-[4px] bg-[#1890ff] border border-[#1890ff] text-white" style={{ width: 28, height: 28, fontSize: 12 }}>1</button>
                <button className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9]" style={{ width: 28, height: 28 }}><IC.chevRight /></button>
              </div>
              <div className="flex items-center rounded-[4px] border border-[#d9d9d9] bg-white" style={{ height: 28, padding: "0 8px", fontSize: 12 }}>
                <span>100条/页</span><IC.chevDown />
              </div>
            </div>
          </div>
        )}
        {activeTab === "policy" && (
          <div>
            <div className="flex items-center gap-3 p-4">
              <BtnPrimary onClick={() => {}}><IC.group /><span>关联策略</span></BtnPrimary>
              <button style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>移除关联</button>
            </div>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={thStyle}>策略名</th>
                  <th style={thStyle}>备注</th>
                  <th style={thStyle}>关联时间</th>
                  <th style={thStyle}>操作</th>
                </tr>
              </thead>
              <tbody>
                {assocPolicies.length === 0
                  ? <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>暂无数据</td></tr>
                  : assocPolicies.map((p, i) => (
                    <tr key={i} className="hover:bg-[#fafafa]">
                      <td style={tdStyle}>{p.name}</td>
                      <td style={tdStyle}>{p.remark || "—"}</td>
                      <td style={tdStyle}>{p.time}</td>
                      <td style={tdStyle}>
                        <button onClick={() => setAssocPolicies(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }} className="hover:text-[#40a9ff] transition-colors">移除关联</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0]">
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.85)" }}>第 {assocPolicies.length} 条</span>
              <div className="flex items-center gap-1">
                <button className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9]" style={{ width: 28, height: 28 }}><IC.chevLeft /></button>
                <button className="flex items-center justify-center rounded-[4px] bg-[#1890ff] border border-[#1890ff] text-white" style={{ width: 28, height: 28, fontSize: 12 }}>1</button>
                <button className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9]" style={{ width: 28, height: 28 }}><IC.chevRight /></button>
              </div>
              <div className="flex items-center rounded-[4px] border border-[#d9d9d9] bg-white" style={{ height: 28, padding: "0 8px", fontSize: 12 }}>
                <span>100条/页</span><IC.chevDown />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New Group Modal ──────────────────────────────────────────────────────────

function NewGroupModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (name: string, remark: string) => void }) {
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const lbl: React.CSSProperties = { fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap", paddingRight: 12, minWidth: 72 };
  return (
    <Modal title="新建用户组" onClose={onClose} width={420}
      footer={<><BtnDefault onClick={onClose}>取消</BtnDefault><BtnPrimary onClick={() => { if (name.trim()) onConfirm(name.trim(), remark.trim()); }}>确定</BtnPrimary></>}
    >
      <div className="flex items-center mb-5">
        <div className="flex items-center flex-shrink-0" style={lbl}>
          <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>
          <span>用户组名</span>
        </div>
        <FieldInput value={name} onChange={setName} placeholder="请输入用户组名" />
      </div>
      <div className="flex items-center">
        <span style={lbl}>备注</span>
        <FieldInput value={remark} onChange={setRemark} placeholder="请输入备注" />
      </div>
    </Modal>
  );
}

// ─── Add User Modal ───────────────────────────────────────────────────────────

function AddUserModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<{ name: string; nickname: string }[]>([]);
  const PAGE = 8;

  const filtered = AVAILABLE_USERS_LIST.filter(u =>
    !search || u.name.includes(search) || u.nickname.includes(search)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  const thL: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #e8e8e8", padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left" };
  const tdL: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "0 16px", fontSize: 14, color: "rgba(0,0,0,0.85)", height: 47, verticalAlign: "middle" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[8px] flex flex-col" style={{ width: 760, height: 720, boxShadow: "0 4px 6px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between px-6 border-b border-[#e8e8e8]" style={{ height: 57, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>添加用户</span>
          <button onClick={onClose} className="opacity-45 hover:opacity-85 transition-opacity"><IC.close /></button>
        </div>
        <div className="flex-1 flex min-h-0 p-4 gap-0">
          {/* Left: 用户列表 */}
          <div className="flex flex-col border border-[#e8e8e8] rounded-[4px]" style={{ width: 376, flexShrink: 0 }}>
            <div className="flex items-center border-b border-[#e8e8e8] px-3" style={{ height: 38, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>用户列表</span>
            </div>
            <div className="flex items-center gap-2 p-3 border-b border-[#e8e8e8]" style={{ flexShrink: 0 }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="搜索账号/昵称"
                className="flex-1 rounded-[4px] border border-[#d9d9d9] bg-white outline-none focus:border-[#40a9ff] transition-all"
                style={{ height: 32, padding: "0 8px", fontSize: 14 }}
              />
              <BtnPrimary style={{ height: 32, fontSize: 14, padding: "0 14px" }} onClick={() => setPage(1)}>查询</BtnPrimary>
              <button onClick={() => { setSearch(""); setPage(1); }} style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>重置</button>
            </div>
            <div className="flex-1 overflow-auto">
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={thL}>登录账号</th>
                    <th style={{ ...thL, width: 140 }}>昵称</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(u => (
                    <tr key={u.name} onClick={() => {
                      const next = new Set(selected);
                      next.has(u.name) ? next.delete(u.name) : next.add(u.name);
                      setSelected(next);
                    }} className="cursor-pointer transition-colors" style={{ background: selected.has(u.name) ? "rgba(24,144,255,0.08)" : "white" }}>
                      <td style={tdL}>{u.name}</td>
                      <td style={tdL}>{u.nickname || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[#e8e8e8] px-3" style={{ height: 53, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.85)" }}>共 {filtered.length} 条</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className="flex items-center justify-center rounded-[4px]"
                    style={{ width: 28, height: 28, fontSize: 12, background: page === p ? "#1890ff" : "white", color: page === p ? "white" : "rgba(0,0,0,0.85)", border: `1px solid ${page === p ? "#1890ff" : "#d9d9d9"}` }}
                  >{p}</button>
                ))}
              </div>
              <div className="flex items-center rounded-[4px] border border-[#d9d9d9] bg-white" style={{ height: 28, padding: "0 6px", fontSize: 12 }}>
                <span>100条/页</span><IC.chevDown />
              </div>
            </div>
          </div>

          {/* Center arrows */}
          <div className="flex flex-col items-center justify-center gap-3" style={{ width: 59, flexShrink: 0 }}>
            <button onClick={() => {
              const toAdd = paged.filter(u => selected.has(u.name) && !added.find(a => a.name === u.name));
              setAdded(prev => [...prev, ...toAdd]); setSelected(new Set());
            }} className="flex items-center justify-center rounded-[16px] bg-white border border-[#1890ff] hover:bg-[rgba(24,144,255,0.08)] transition-colors" style={{ width: 32, height: 32 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/></svg>
            </button>
            <button onClick={() => setAdded([])}
              className="flex items-center justify-center rounded-[16px] bg-white border border-[#1890ff] hover:bg-[rgba(24,144,255,0.08)] transition-colors" style={{ width: 32, height: 32 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/></svg>
            </button>
          </div>

          {/* Right: 已选用户 */}
          <div className="flex flex-col flex-1 border border-[#e8e8e8] rounded-[4px]">
            <div className="flex items-center border-b border-[#e8e8e8] px-4" style={{ height: 38, flexShrink: 0, background: "#fafafa" }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>已选用户</span>
            </div>
            <table style={{ borderCollapse: "collapse", flexShrink: 0 }}>
              <thead>
                <tr>
                  <th style={thL}>登录账号</th>
                  <th style={{ ...thL, width: 100 }}>昵称</th>
                </tr>
              </thead>
            </table>
            <div className="flex-1 overflow-auto">
              {added.length === 0
                ? <div className="flex items-center justify-center h-full" style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }}>暂无数据</div>
                : added.map((u, i) => (
                  <div key={i} className="flex items-center border-b border-[#f0f0f0] px-4" style={{ height: 47 }}>
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>{u.name}</span>
                    <span style={{ width: 100, fontSize: 14, color: "rgba(0,0,0,0.85)" }}>{u.nickname || "—"}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 border-t border-[#e8e8e8]" style={{ height: 65, flexShrink: 0 }}>
          <BtnDefault onClick={onClose}>取消</BtnDefault>
          <BtnPrimary onClick={onClose}>确定</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ─── Cloud API Key Page ───────────────────────────────────────────────────────

function CloudApiPage({ apiKeys, setApiKeys, onNewKey, onDeleteKey }: {
  apiKeys: ApiKey[]; setApiKeys: (k: ApiKey[]) => void; onNewKey: () => void; onDeleteKey: (id: string) => void;
}) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const toggleReveal = (id: string) => {
    const next = new Set(revealed);
    next.has(id) ? next.delete(id) : next.add(id);
    setRevealed(next);
  };
  const handleDisable = (id: string) => setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: k.status === "正常" ? "已禁用" : "正常" } : k));
  const handleDeleteRow = (id: string) => onDeleteKey(id);
  const thStyle: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #e8e8e8", padding: "16px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "0 16px", fontSize: 14, color: "rgba(0,0,0,0.85)", height: 57, verticalAlign: "middle" };
  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 20, color: "rgba(0,0,0,0.85)" }}>云API密钥</div>
      <div><BtnPrimary onClick={onNewKey}><IC.plus /><span>新建密钥</span></BtnPrimary></div>
      <div className="bg-white rounded-[8px] border border-[#e8e8e8]" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={thStyle}>账号</th>
                <th style={thStyle}>密钥</th>
                <th style={thStyle}>创建时间</th>
                <th style={thStyle}>状态</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.length === 0
                ? <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>暂无数据</td></tr>
                : apiKeys.map(k => (
                  <tr key={k.id} className="hover:bg-[#fafafa] transition-colors">
                    <td style={tdStyle}>{k.account}</td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "Liberation Mono, monospace", letterSpacing: "0.3px" }}>
                          {revealed.has(k.id) ? k.keyFull : k.key}
                        </span>
                        <button onClick={() => toggleReveal(k.id)} className="text-[rgba(0,0,0,0.45)] hover:text-[rgba(0,0,0,0.85)] transition-colors">
                          {revealed.has(k.id) ? <IC.eyeOff /> : <IC.eye />}
                        </button>
                      </div>
                    </td>
                    <td style={tdStyle}>{k.created}</td>
                    <td style={tdStyle}>
                      <span className="inline-flex items-center gap-1" style={{ fontSize: 14, color: k.status === "正常" ? "#52c41a" : "rgba(0,0,0,0.45)" }}>
                        <span className="inline-block rounded-[3px]" style={{ width: 6, height: 6, background: k.status === "正常" ? "#52c41a" : "#d9d9d9" }} />
                        {k.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <button onClick={() => handleDisable(k.id)} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>
                        {k.status === "正常" ? "禁用" : "启用"}
                      </button>
                      <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                      <button onClick={() => handleDeleteRow(k.id)} className="font-medium hover:text-[#ff7875] transition-colors" style={{ fontSize: 14, color: "#ff4d4f" }}>删除</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── UASS Auth Page ───────────────────────────────────────────────────────────

function UassAuthPage({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 20, color: "rgba(0,0,0,0.85)" }}>UASS认证管理</div>
      <div className="bg-white rounded-[8px] border border-[#e8e8e8] p-6" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="font-medium mb-6" style={{ fontSize: 16, color: "rgba(0,0,0,0.85)" }}>开启流程</div>
        {/* Step 1 */}
        <div className="relative flex gap-4" style={{ paddingBottom: 32 }}>
          <div className="relative flex flex-col items-center flex-shrink-0">
            <div className="flex items-center justify-center rounded-[14px] text-white font-medium" style={{ width: 28, height: 28, background: "#1890ff", fontSize: 14, zIndex: 1 }}>1</div>
            <div className="absolute top-[28px] bottom-0 bg-[#d9d9d9]" style={{ width: 2, left: 13 }} />
          </div>
          <div>
            <div className="font-medium" style={{ fontSize: 14, color: "rgba(0,0,0,0.85)", lineHeight: "28px" }}>配置UASS认证登录参数</div>
            <button className="flex items-center gap-1 mt-1" style={{ fontSize: 14, color: "#1890ff", fontWeight: 500 }}>
              前往查看配置
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8.75 1.75H12.25V5.25" stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
                <path d="M5.83333 8.16667L12.25 1.75" stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex items-start justify-center flex-shrink-0" style={{ width: 28, paddingTop: 3 }}>
            <div className="flex items-center justify-center rounded-[14px] text-white font-medium" style={{ width: 28, height: 28, background: "#1890ff", fontSize: 14 }}>2</div>
          </div>
          <div>
            <div className="font-medium mb-2" style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>开启UASS认证登录功能</div>
            <div className="mb-3">
              <button onClick={onToggle} className="relative rounded-[12px] transition-colors"
                style={{ width: 44, height: 22, background: enabled ? "#1890ff" : "rgba(0,0,0,0.25)" }}>
                <span className="absolute top-[2px] rounded-[9px] bg-white transition-all"
                  style={{ width: 18, height: 18, left: enabled ? 24 : 2, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
            <div style={{ fontSize: 14, color: "rgba(0,0,0,0.85)", marginBottom: 6 }}>开启后,UASS认证将作为子账号登录控制台的唯一方式</div>
            <div style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }}>注意:若UASS认证服务不可达时您将无法登录,请谨慎开启。</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New API Key Modal ────────────────────────────────────────────────────────

function NewApiKeyModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="新建密钥" onClose={onClose} width={420}
      footer={<><BtnDefault onClick={onClose}>取消</BtnDefault><BtnPrimary onClick={onConfirm}>确定</BtnPrimary></>}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center rounded-[11px] flex-shrink-0" style={{ width: 22, height: 22, background: "#faad14" }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.16667L12.8333 11.0833H1.16667L7 1.16667Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
            <path d="M7 5.83333V7.58333M7 9.33333H7.00583" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667"/>
          </svg>
        </div>
        <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>您正在为 [admin] 创建密钥</span>
      </div>
    </Modal>
  );
}

function EnableUassModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="开启UASS认证登录功能" onClose={onClose} width={420}
      footer={<><BtnDefault onClick={onClose}>取消</BtnDefault><BtnPrimary onClick={onConfirm}>确定</BtnPrimary></>}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center rounded-[11px] flex-shrink-0 font-bold text-white" style={{ width: 22, height: 22, background: "#faad14", fontSize: 14 }}>!</div>
        <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>开启后,UASS认证将作为非控制台登录控制的唯一方式</span>
      </div>
    </Modal>
  );
}

// ─── Policy List Page ─────────────────────────────────────────────────────────

function PolicyListPage({ policies, setPolicies, onNewPolicy, onViewPolicy, onDeletePolicy }: {
  policies: Policy[]; setPolicies: (p: Policy[]) => void;
  onNewPolicy: () => void; onViewPolicy: (p: Policy) => void;
  onDeletePolicy: (p: Policy) => void;
}) {
  const [filters, setFilters] = useState({ name: "", remark: "" });
  const [applied, setApplied] = useState({ name: "", remark: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = policies.filter(p => {
    if (applied.name && !p.name.includes(applied.name)) return false;
    if (applied.remark && !p.remark.includes(applied.remark)) return false;
    return true;
  });
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allChecked = paged.length > 0 && paged.every(p => selectedIds.has(p.id));

  const handleDeleteSelected = () => {
    if (!selectedIds.size) return;
    if (!window.confirm(`确认删除选中的 ${selectedIds.size} 条记录？`)) return;
    setPolicies(policies.filter(p => !selectedIds.has(p.id)));
    setSelectedIds(new Set()); setPage(1);
  };

  const lbl: React.CSSProperties = { fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap", paddingRight: 12 };
  const thStyle: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #e8e8e8", padding: "16px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "0 16px", fontSize: 14, color: "rgba(0,0,0,0.85)", height: 58, verticalAlign: "middle" };

  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 20, color: "rgba(0,0,0,0.85)" }}>策略管理</div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8] px-6 py-5" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
          <div className="flex items-center">
            <span style={lbl}>策略名</span>
            <FieldInput value={filters.name} onChange={v => setFilters(f => ({ ...f, name: v }))} placeholder="请输入策略名" />
          </div>
          <div className="flex items-center">
            <span style={lbl}>备注</span>
            <FieldInput value={filters.remark} onChange={v => setFilters(f => ({ ...f, remark: v }))} placeholder="请输入备注" />
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <BtnPrimary onClick={() => { setApplied({ ...filters }); setPage(1); }}>
            <IC.search /><span>查询</span>
          </BtnPrimary>
          <BtnDefault onClick={() => { const z = { name: "", remark: "" }; setFilters(z); setApplied(z); setPage(1); }}>重置</BtnDefault>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <BtnPrimary onClick={onNewPolicy}><IC.plus /><span>新建</span></BtnPrimary>
        <BtnDefault onClick={handleDeleteSelected}><IC.trash /><span>删除</span></BtnDefault>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8] flex flex-col" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 48, paddingLeft: 24 }}>
                  <input type="checkbox" checked={allChecked} onChange={() => {
                    const next = new Set(selectedIds);
                    if (allChecked) paged.forEach(p => next.delete(p.id));
                    else paged.forEach(p => next.add(p.id));
                    setSelectedIds(next);
                  }} className="cursor-pointer" />
                </th>
                <th style={thStyle}>策略名</th>
                <th style={thStyle}>备注</th>
                <th style={thStyle}>策略类型</th>
                <th style={thStyle}>创建时间</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>暂无数据</td></tr>
              ) : paged.map(p => (
                <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                  <td style={{ ...tdStyle, paddingLeft: 24 }}>
                    <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => {
                      const next = new Set(selectedIds);
                      next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                      setSelectedIds(next);
                    }} className="cursor-pointer" />
                  </td>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={{ ...tdStyle, maxWidth: 220 }}><div className="overflow-hidden text-ellipsis whitespace-nowrap">{p.remark || "—"}</div></td>
                  <td style={tdStyle}>{p.type}</td>
                  <td style={tdStyle}>{p.created}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <button onClick={() => onViewPolicy(p)} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>编辑</button>
                    <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                    <button onClick={() => onDeletePolicy(p)} className="font-medium hover:text-[#ff7875] transition-colors" style={{ fontSize: 14, color: "#ff4d4f" }}>删除</button>
                    <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                    <button onClick={() => onViewPolicy(p)} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>关联用户组</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}

// ─── Policy Detail Page ───────────────────────────────────────────────────────

function PolicyDetailPage({ policy, onBack, onAssociateGroup }: { policy: Policy; onBack: () => void; onAssociateGroup: () => void }) {
  const [activeTab, setActiveTab] = useState<"config" | "assoc">("config");
  const [selectedProduct, setSelectedProduct] = useState(POLICY_PRODUCTS[0]);
  const [assocGroups, setAssocGroups] = useState<{ name: string; remark: string; time: string }[]>([
    { name: "平台管理员用户组", remark: "平台管理员", time: "2025-06-01 10:00:00" },
  ]);
  const [showTooltip, setShowTooltip] = useState(false);

  const thStyle: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #e8e8e8", padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left" };
  const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "0 16px", fontSize: 14, color: "rgba(0,0,0,0.85)", height: 54, verticalAlign: "middle" };

  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      {/* Title row: title on left, back on right */}
      <div className="flex items-center justify-between">
        <div className="font-medium" style={{ fontSize: 16, color: "rgba(0,0,0,0.85)" }}>编辑策略</div>
        <button onClick={onBack} className="flex items-center gap-1" style={{ fontSize: 14, color: "rgba(0,0,0,0.65)" }}>
          <IC.chevLeft />
          <span>返回</span>
        </button>
      </div>

      {/* Policy info card */}
      <div className="bg-white rounded-[8px] border border-[#e8e8e8] p-6" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-16 flex-wrap">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap" }}>策略名：</span>
            <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)", fontWeight: 500 }}>{policy.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap" }}>备注：</span>
            <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>{policy.remark || "—"}</span>
          </div>
        </div>
      </div>

      {/* Tabs card */}
      <div className="bg-white rounded-[8px] border border-[#e8e8e8] flex flex-col" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="flex items-stretch border-b border-[#e8e8e8]" style={{ height: 44 }}>
          {([["config", "策略配置"], ["assoc", "策略关联"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="relative flex items-center px-5 font-medium transition-colors"
              style={{ fontSize: 14, color: activeTab === key ? "#1890ff" : "rgba(0,0,0,0.65)" }}
            >
              {label}
              {activeTab === key && <span className="absolute bottom-0 left-0 right-0 bg-[#1890ff]" style={{ height: 2 }} />}
            </button>
          ))}
        </div>

        {activeTab === "config" && (
          <div className="flex" style={{ minHeight: 400 }}>
            {/* Left product tree */}
            <div className="border-r border-[#e8e8e8]" style={{ width: 220, flexShrink: 0 }}>
              <div className="p-3 border-b border-[#e8e8e8]">
                <input placeholder="搜索产品" className="w-full rounded-[4px] border border-[#d9d9d9] bg-white outline-none focus:border-[#40a9ff] transition-all"
                  style={{ height: 32, padding: "0 8px", fontSize: 14 }} />
              </div>
              <div className="py-2">
                <div className="px-4 py-1" style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", fontWeight: 500 }}>产品</div>
                {POLICY_PRODUCTS.map(prod => (
                  <button key={prod} onClick={() => setSelectedProduct(prod)}
                    className="w-full text-left px-4 py-2 transition-colors hover:bg-[#f5f5f5]"
                    style={{ fontSize: 14, color: selectedProduct === prod ? "#1890ff" : "rgba(0,0,0,0.85)", background: selectedProduct === prod ? "rgba(24,144,255,0.06)" : "transparent" }}
                  >{prod}</button>
                ))}
              </div>
            </div>
            {/* Right API table */}
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3 border-b border-[#e8e8e8]" style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>接口列表</div>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>接口名称</th>
                    <th style={thStyle}>接口地址</th>
                    <th style={thStyle}>接口描述</th>
                    <th style={thStyle}>版本号</th>
                  </tr>
                </thead>
                <tbody>
                  {POLICY_APIS.map((api, i) => (
                    <tr key={i} className="hover:bg-[#fafafa]">
                      <td style={tdStyle}>{api.name}</td>
                      <td style={tdStyle}>{api.url}</td>
                      <td style={tdStyle}>{api.desc}</td>
                      <td style={tdStyle}>{api.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "assoc" && (
          <div>
            <div className="flex items-center gap-2 p-4">
              <div className="relative">
                <BtnPrimary onClick={onAssociateGroup}><IC.group /><span>关联用户组</span></BtnPrimary>
              </div>
              <div className="relative inline-flex items-center ml-1"
                onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                <IC.info />
                {showTooltip && (
                  <div className="absolute z-20 bg-[rgba(0,0,0,0.75)] text-white rounded-[4px] px-3 py-2 text-[12px] leading-[20px] whitespace-nowrap pointer-events-none"
                    style={{ left: 20, top: -8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    用户组与策略关联后，即可获得策略所配置的操作权限
                  </div>
                )}
              </div>
            </div>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={thStyle}>用户组</th>
                  <th style={thStyle}>备注</th>
                  <th style={thStyle}>关联时间</th>
                  <th style={thStyle}>操作</th>
                </tr>
              </thead>
              <tbody>
                {assocGroups.length === 0
                  ? <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>暂无数据</td></tr>
                  : assocGroups.map((g, i) => (
                    <tr key={i} className="hover:bg-[#fafafa]">
                      <td style={tdStyle}>{g.name}</td>
                      <td style={tdStyle}>{g.remark || "—"}</td>
                      <td style={tdStyle}>{g.time}</td>
                      <td style={tdStyle}>
                        <button onClick={() => setAssocGroups(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 14, color: "#ff4d4f", fontWeight: 500 }} className="hover:text-[#ff7875] transition-colors">移除</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New Policy Modal ─────────────────────────────────────────────────────────

function NewPolicyModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (name: string, remark: string) => void }) {
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const lbl: React.CSSProperties = { fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, whiteSpace: "nowrap", paddingRight: 12, minWidth: 72 };
  return (
    <Modal title="新建策略" onClose={onClose} width={420}
      footer={<><BtnDefault onClick={onClose}>取消</BtnDefault><BtnPrimary onClick={() => { if (name.trim()) onConfirm(name.trim(), remark.trim()); }}>确定</BtnPrimary></>}
    >
      <div className="flex items-center mb-5">
        <div className="flex items-center flex-shrink-0" style={lbl}>
          <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>
          <span>策略名</span>
        </div>
        <FieldInput value={name} onChange={setName} placeholder="请输入策略名" />
      </div>
      <div className="flex items-center">
        <span style={lbl}>备注</span>
        <FieldInput value={remark} onChange={setRemark} placeholder="请输入备注" />
      </div>
    </Modal>
  );
}

// ─── Associate User Group Modal ───────────────────────────────────────────────

function AssociateUserGroupModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [leftPage, setLeftPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<{ name: string; remark: string }[]>([]);
  const PAGE = 8;
  const filtered = AVAILABLE_GROUPS_LIST.filter(g => !search || g.name.includes(search));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const paged = filtered.slice((leftPage - 1) * PAGE, leftPage * PAGE);
  const toggleLeft = (name: string) => { const next = new Set(selected); next.has(name) ? next.delete(name) : next.add(name); setSelected(next); };
  const moveRight = () => {
    const toAdd = [...selected].filter(n => !added.find(a => a.name === n));
    const items = toAdd.map(n => AVAILABLE_GROUPS_LIST.find(g => g.name === n)!).filter(Boolean);
    setAdded(prev => [...prev, ...items]); setSelected(new Set());
  };
  const thS: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "9px 12px", fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left" };
  const tdS: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "6px 12px", fontSize: 12, color: "rgba(0,0,0,0.85)", height: 35 };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[8px] flex flex-col" style={{ width: 760, height: 602, boxShadow: "0 4px 6px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between px-6 border-b border-[#e8e8e8]" style={{ height: 57, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>关联用户组</span>
          <button onClick={onClose} className="opacity-45 hover:opacity-85 transition-opacity"><IC.close /></button>
        </div>
        <div className="flex flex-1 min-h-0 p-4 gap-0">
          <div className="flex flex-col border border-[#e8e8e8] rounded-[4px]" style={{ width: 360, flexShrink: 0 }}>
            <div className="flex items-center border-b border-[#e8e8e8] px-3" style={{ height: 38, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>用户组列表</span>
            </div>
            <div className="flex items-center gap-2 border-b border-[#e8e8e8] px-3" style={{ height: 53, flexShrink: 0 }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setLeftPage(1); }} placeholder="请输入用户组名"
                className="flex-1 rounded-[4px] border border-[#d9d9d9] bg-white outline-none focus:border-[#40a9ff] transition-all"
                style={{ height: 28, padding: "0 8px", fontSize: 12 }}
              />
              <button onClick={() => setLeftPage(1)} className="flex items-center justify-center rounded-[4px] text-white font-medium text-[12px]" style={{ background: "#1890ff", height: 28, padding: "0 12px", flexShrink: 0 }}>查询</button>
              <button onClick={() => { setSearch(""); setLeftPage(1); }} style={{ fontSize: 12, color: "#1890ff", fontWeight: 500, flexShrink: 0 }}>重置</button>
            </div>
            <table style={{ borderCollapse: "collapse", flexShrink: 0 }}>
              <thead><tr><th style={thS}>用户组</th><th style={{ ...thS, width: 120 }}>备注</th></tr></thead>
            </table>
            <div className="flex-1 overflow-auto">
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <tbody>
                  {paged.map(g => (
                    <tr key={g.name} onClick={() => toggleLeft(g.name)} className="cursor-pointer transition-colors"
                      style={{ background: selected.has(g.name) ? "rgba(24,144,255,0.08)" : "white", height: 35 }}>
                      <td style={{ ...tdS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 230 }}>{g.name}</td>
                      <td style={{ ...tdS, width: 120 }}>{g.remark || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[#e8e8e8] px-3" style={{ height: 73, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>共 {filtered.length} 条</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setLeftPage(p)} className="flex items-center justify-center rounded-[4px]"
                    style={{ width: 24, height: 24, fontSize: 12, background: leftPage === p ? "#1890ff" : "white", color: leftPage === p ? "white" : "rgba(0,0,0,0.85)", border: `1px solid ${leftPage === p ? "#1890ff" : "#d9d9d9"}` }}
                  >{p}</button>
                ))}
              </div>
              <div className="flex items-center rounded-[4px] border border-[#d9d9d9] bg-white" style={{ height: 24, padding: "0 6px", fontSize: 12 }}>
                <span>25条/页</span><IC.chevDown />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 px-2" style={{ width: 48, flexShrink: 0 }}>
            <button onClick={moveRight}
              className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9] hover:border-[#40a9ff] transition-colors"
              style={{ width: 32, height: 32 }}><IC.chevRight /></button>
            <button onClick={() => setAdded([])}
              className="flex items-center justify-center rounded-[4px] bg-white border border-[#d9d9d9] hover:border-[#40a9ff] transition-colors"
              style={{ width: 32, height: 32 }}><IC.chevLeft /></button>
          </div>
          <div className="flex flex-col flex-1 border border-[#e8e8e8] rounded-[4px]">
            <div className="flex items-center border-b border-[#e8e8e8] px-3" style={{ height: 38, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)" }}>已选用户组</span>
            </div>
            <div className="border-b border-[#e8e8e8] px-3 flex items-center" style={{ height: 35, flexShrink: 0, background: "#fafafa" }}>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>用户组</span>
            </div>
            <div className="flex-1 overflow-auto">
              {added.length === 0
                ? <div className="flex items-center justify-center h-full" style={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }}>暂无数据</div>
                : added.map(g => (
                  <div key={g.name} className="flex items-center border-b border-[#f0f0f0] px-3" style={{ height: 35 }}>
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: 12, color: "rgba(0,0,0,0.85)" }}>{g.name}</span>
                    <button onClick={() => setAdded(prev => prev.filter(a => a.name !== g.name))} className="hover:text-[#ff7875] transition-colors" style={{ fontSize: 12, color: "#ff4d4f", flexShrink: 0 }}>删除</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 border-t border-[#e8e8e8]" style={{ height: 65, flexShrink: 0 }}>
          <BtnDefault onClick={onClose}>取消</BtnDefault>
          <BtnPrimary onClick={onClose}>确定</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ─── Account Custody Page ─────────────────────────────────────────────────────

interface CustodyAccount {
  id: string;
  area: string;
  instance: string;
  account: string;
  accountType: "主账号" | "子账号";
  masterId: string;
  alias: string;
  region: string;
  email: string;
  description: string;
  secretId: string;
  secretKey: string;
}

const INITIAL_CUSTODY: CustodyAccount[] = [
  { id: "c001", area: "测试区", instance: "平台集团总部内蒙云实例", account: "uopsub.zh1", accountType: "子账号", masterId: "100004610003", alias: "uopmaster.zh1", region: "内蒙", email: "uopsub.zh1@cpic.com", description: "", secretId: "", secretKey: "" },
  { id: "c002", area: "测试区", instance: "平台集团总部大云实例企业云2", account: "uopsub.zh1", accountType: "子账号", masterId: "100004610004", alias: "", region: "上海", email: "uopsub2.zh1@cpic.com", description: "测试描述", secretId: "", secretKey: "" },
];

function CustodyEditPage({ account, isNew, onBack }: { account: CustodyAccount | null; isNew: boolean; onBack: () => void }) {
  const [secretId, setSecretId] = useState(account?.secretId ?? "");
  const [secretKey, setSecretKey] = useState(account?.secretKey ?? "");
  const [desc, setDesc] = useState(account?.description ?? "");
  // For new account, all fields are editable
  const [newForm, setNewForm] = useState({ area: "", instance: "", region: "", account: "", accountType: "子账号" as "主账号" | "子账号" });

  const readRow = (label: string, value: string) => (
    <div className="flex items-center" style={{ marginBottom: 20 }}>
      <span style={{ fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500, minWidth: 88, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>{value}</span>
    </div>
  );
  const editRow = (label: string, required: boolean, node: React.ReactNode) => (
    <div className="flex items-center" style={{ marginBottom: 20 }}>
      <div className="flex items-center" style={{ minWidth: 88, flexShrink: 0 }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 2, fontSize: 14 }}>*</span>}
        <span style={{ fontSize: 14, color: "rgba(0,0,0,0.65)", fontWeight: 500 }}>{label}</span>
      </div>
      <div className="flex-1 min-w-0" style={{ maxWidth: 320 }}>{node}</div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 16, color: "rgba(0,0,0,0.85)" }}>{isNew ? "新增账号" : "编辑账号"}</div>
      <div className="bg-white rounded-[8px] border border-[#e8e8e8] p-6" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)", maxWidth: 600 }}>
        {isNew ? (
          <>
            {editRow("功能区", true,
              <button className="w-full flex items-center justify-between rounded-[4px] border border-[#d9d9d9] bg-white hover:border-[#40a9ff] transition-colors px-3" style={{ height: 32, fontSize: 14, color: newForm.area ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.35)" }}>
                <span>{newForm.area || "请选择功能区"}</span><IC.chevDown />
              </button>
            )}
            {editRow("实例", true, <FieldInput value={newForm.instance} onChange={v => setNewForm(f => ({ ...f, instance: v }))} placeholder="请输入实例" />)}
            {editRow("地域", true, <FieldInput value={newForm.region} onChange={v => setNewForm(f => ({ ...f, region: v }))} placeholder="请输入地域" />)}
            {editRow("账号", true, <FieldInput value={newForm.account} onChange={v => setNewForm(f => ({ ...f, account: v }))} placeholder="请输入账号" />)}
            {editRow("账号类型", true,
              <div className="flex items-center gap-6">
                {(["主账号", "子账号"] as const).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer" onClick={() => setNewForm(f => ({ ...f, accountType: t }))}>
                    <div className="relative flex-shrink-0" style={{ width: 16, height: 16 }}>
                      <div className="rounded-[8px]" style={{ width: 16, height: 16, background: newForm.accountType === t ? "#1890ff" : "white", border: `1px solid ${newForm.accountType === t ? "#1890ff" : "#d9d9d9"}` }} />
                      {newForm.accountType === t && <div className="absolute rounded-[2px] bg-white" style={{ width: 6, height: 6, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />}
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(0,0,0,0.85)" }}>{t}</span>
                  </label>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {readRow("功能区", account?.area ?? "")}
            {readRow("实例", account?.instance ?? "")}
            {readRow("地域", account?.region ?? "")}
            {readRow("账号", account?.account ?? "")}
            {readRow("账号类型", account?.accountType ?? "")}
          </>
        )}
        {(!isNew || newForm.accountType === "子账号") && editRow("SecretId", true, <FieldInput value={secretId} onChange={setSecretId} placeholder="请输入SecretId" />)}
        {(!isNew || newForm.accountType === "子账号") && editRow("SecretKey", false, <FieldInput value={secretKey} onChange={setSecretKey} placeholder="请输入SecretKey" />)}
        {editRow("描述", false,
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="请输入描述"
            className="w-full rounded-[4px] border border-[#d9d9d9] bg-white outline-none resize-none focus:border-[#40a9ff] focus:shadow-[0_0_0_2px_rgba(24,144,255,0.2)] transition-all"
            style={{ height: 80, padding: "6px 11px", fontSize: 14, color: "rgba(0,0,0,0.85)" }}
          />
        )}
        <div className="flex items-center gap-2 justify-end mt-2">
          <BtnDefault onClick={onBack}>取消</BtnDefault>
          <BtnPrimary onClick={onBack}>确定</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

function AccountCustodyPage({ onEdit, onNew }: { onEdit: (a: CustodyAccount) => void; onNew: () => void }) {
  const [accounts, setAccounts] = useState<CustodyAccount[]>(INITIAL_CUSTODY);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CustodyAccount | null>(null);
  const PAGE_SIZE = 10;

  const filtered = accounts.filter(a => !applied || a.account.includes(applied) || a.alias.includes(applied));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const thStyle: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #e8e8e8", padding: "13px 16px", fontSize: 14, fontWeight: 500, color: "rgba(0,0,0,0.85)", textAlign: "left", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", padding: "0 16px", fontSize: 14, color: "rgba(0,0,0,0.85)", height: 58, verticalAlign: "middle" };

  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5] p-6 flex flex-col gap-4">
      <div className="font-medium" style={{ fontSize: 16, color: "rgba(0,0,0,0.85)" }}>账号纳管</div>

      {/* Search + actions row */}
      <div className="flex items-center gap-2">
        <FieldInput value={search} onChange={setSearch} placeholder="请输入账号" style={{ width: 240 }} />
        <BtnPrimary onClick={() => { setApplied(search); setPage(1); }}>
          <IC.search /><span>查询</span>
        </BtnPrimary>
        <BtnPrimary onClick={onNew}><IC.plus /><span>新增账号纳管</span></BtnPrimary>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e8e8e8] flex flex-col" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1200 }}>
            <thead>
              <tr>
                <th style={thStyle}>功能区</th>
                <th style={thStyle}>云实例</th>
                <th style={thStyle}>账号</th>
                <th style={thStyle}>账号类型（主/子）</th>
                <th style={thStyle}>主账号ID</th>
                <th style={thStyle}>别名</th>
                <th style={thStyle}>地域</th>
                <th style={thStyle}>邮箱</th>
                <th style={thStyle}>描述</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={10} style={{ ...tdStyle, textAlign: "center", color: "rgba(0,0,0,0.45)", padding: "48px 0" }}>暂无数据</td></tr>
              ) : paged.map(a => (
                <tr key={a.id} className="hover:bg-[#fafafa] transition-colors">
                  <td style={tdStyle}>{a.area}</td>
                  <td style={{ ...tdStyle, maxWidth: 180 }}><div className="overflow-hidden text-ellipsis whitespace-nowrap">{a.instance}</div></td>
                  <td style={tdStyle}>{a.account}</td>
                  <td style={tdStyle}>{a.accountType}</td>
                  <td style={tdStyle}>{a.masterId}</td>
                  <td style={tdStyle}>{a.alias || "—"}</td>
                  <td style={tdStyle}>{a.region}</td>
                  <td style={{ ...tdStyle, maxWidth: 140 }}><div className="overflow-hidden text-ellipsis whitespace-nowrap">{a.email}</div></td>
                  <td style={{ ...tdStyle, maxWidth: 120 }}><div className="overflow-hidden text-ellipsis whitespace-nowrap">{a.description || "—"}</div></td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <button className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>登录</button>
                    <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                    <button onClick={() => onEdit(a)} className="font-medium hover:text-[#40a9ff] transition-colors" style={{ fontSize: 14, color: "#1890ff" }}>编辑</button>
                    <span style={{ color: "#d9d9d9", margin: "0 8px" }}>|</span>
                    <button onClick={() => setDeleteTarget(a)} className="font-medium hover:text-[#ff7875] transition-colors" style={{ fontSize: 14, color: "#ff4d4f" }}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="删除账号"
          content={<>确认删除账号 <strong>{deleteTarget.account}</strong>？</>}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => { setAccounts(prev => prev.filter(a => a.id !== deleteTarget.id)); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState("用户权限");
  const [sideKey, setSideKey] = useState("user-management");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editGroup, setEditGroup] = useState<UserGroup | null>(null);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);
  const [custodyMode, setCustodyMode] = useState<null | { isNew: boolean; account: CustodyAccount | null }>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "user" | "policy" | "api-key"; item: User | Policy | ApiKey } | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [groups, setGroups] = useState<UserGroup[]>(INITIAL_GROUPS);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [uassEnabled, setUassEnabled] = useState(false);

  const isPersonal = activeNav === "个人";

  const handleNav = (nav: string) => {
    setActiveNav(nav);
    setEditUser(null); setEditGroup(null); setEditPolicy(null);
    setSideKey(nav === "用户权限" ? "user-management" : "personal-center");
  };

  const handlePersonal = () => {
    setActiveNav("个人");
    setSideKey("personal-center");
    setEditUser(null); setEditGroup(null); setEditPolicy(null);
  };

  const handleSide = (key: string) => {
    setSideKey(key);
    setEditUser(null); setEditGroup(null); setEditPolicy(null); setCustodyMode(null);
  };

  const renderContent = () => {
    if (isPersonal) {
      if (sideKey === "personal-center")
        return <PersonalCenterPage onEditAccount={() => setModal("edit-account")} />;
      if (sideKey === "account-custody") {
        if (custodyMode)
          return <CustodyEditPage account={custodyMode.account} isNew={custodyMode.isNew} onBack={() => setCustodyMode(null)} />;
        return <AccountCustodyPage onEdit={a => setCustodyMode({ isNew: false, account: a })} onNew={() => setCustodyMode({ isNew: true, account: null })} />;
      }
      return <Placeholder label={sideKey} />;
    }
    if (sideKey === "user-management") {
      if (editUser)
        return <UserEditPage user={editUser} onBack={() => setEditUser(null)} onAddToGroup={() => setModal("add-to-group")} />;
      return (
        <UserListPage
          users={users} setUsers={setUsers}
          onAddSubAccount={() => setModal("add-sub-account")}
          onImportData={() => setModal("import-data")}
          onAddToGroup={() => setModal("add-to-group")}
          onViewUser={u => setEditUser(u)}
          onDeleteUser={u => { setDeleteTarget({ type: "user", item: u }); setModal("delete-user"); }}
        />
      );
    }
    if (sideKey === "user-group-management") {
      if (editGroup)
        return <UserGroupEditPage group={editGroup} onBack={() => setEditGroup(null)} onAddUser={() => setModal("add-user")} />;
      return (
        <UserGroupListPage
          groups={groups} setGroups={setGroups}
          onNewGroup={() => setModal("new-group")}
          onEditGroup={g => setEditGroup(g)}
          onAddUserDirect={() => setModal("add-user")}
          onAssocPolicy={() => setModal("assoc-policy")}
        />
      );
    }
    if (sideKey === "policy-management") {
      if (editPolicy)
        return <PolicyDetailPage policy={editPolicy} onBack={() => setEditPolicy(null)} onAssociateGroup={() => setModal("associate-user-group")} />;
      return (
        <PolicyListPage
          policies={policies} setPolicies={setPolicies}
          onNewPolicy={() => setModal("new-policy")}
          onViewPolicy={p => setEditPolicy(p)}
          onDeletePolicy={p => { setDeleteTarget({ type: "policy", item: p }); setModal("delete-policy"); }}
        />
      );
    }
    if (sideKey === "cloud-api")
      return <CloudApiPage apiKeys={apiKeys} setApiKeys={setApiKeys} onNewKey={() => setModal("new-api-key")} onDeleteKey={k => { setDeleteTarget({ type: "api-key", item: apiKeys.find(a => a.id === k)! }); setModal("delete-api-key"); }} />;
    if (sideKey === "uass-auth")
      return <UassAuthPage enabled={uassEnabled} onToggle={() => { if (!uassEnabled) setModal("enable-uass"); else setUassEnabled(false); }} />;
    return <Placeholder label={sideKey} />;
  };

  const closeModal = () => { setModal(null); setDeleteTarget(null); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", minWidth: 1200, overflow: "hidden" }}>
      <TopHeader activeNav={activeNav} onNav={handleNav} onPersonal={handlePersonal} />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {isPersonal
          ? <PersonalSidebar active={sideKey} onSelect={handleSide} />
          : <UserMgmtSidebar active={sideKey} onSelect={handleSide} />
        }
        {renderContent()}
      </div>

      {modal === "edit-account"    && <EditAccountModal   onClose={closeModal} />}
      {modal === "add-sub-account" && <AddSubAccountModal onClose={closeModal} />}
      {modal === "import-data"     && <ImportDataModal    onClose={closeModal} />}
      {modal === "add-to-group"    && <AddToGroupModal    onClose={closeModal} />}
      {modal === "new-group"       && <NewGroupModal      onClose={closeModal} onConfirm={(name, remark) => { setGroups(prev => [...prev, { id: `g${Date.now()}`, name, remark, userCount: 0, created: new Date().toLocaleString("zh-CN") }]); closeModal(); }} />}
      {modal === "add-user"        && <AddUserModal       onClose={closeModal} />}
      {modal === "new-policy"      && <NewPolicyModal     onClose={closeModal} onConfirm={(name, remark) => { setPolicies(prev => [...prev, { id: `p${Date.now()}`, name, remark, type: "自定义策略", created: new Date().toLocaleString("zh-CN") }]); closeModal(); }} />}
      {modal === "associate-user-group" && <AssociateUserGroupModal onClose={closeModal} />}
      {modal === "new-api-key"     && <NewApiKeyModal     onClose={closeModal} onConfirm={() => { setApiKeys(prev => [...prev, { id: `k${Date.now()}`, account: "admin", key: `************${Math.random().toString(36).slice(-4)}`, keyFull: `AKIDnew${Math.random().toString(36).slice(-16)}`, created: new Date().toLocaleString("zh-CN"), status: "正常" }]); closeModal(); }} />}
      {modal === "enable-uass"     && <EnableUassModal    onClose={closeModal} onConfirm={() => { setUassEnabled(true); closeModal(); }} />}
      {modal === "assoc-policy"    && (
        <ConfirmModal title="关联策略" content="请在策略管理页面操作关联用户组功能。" onClose={closeModal} onConfirm={closeModal} />
      )}
      {modal === "delete-user"     && deleteTarget?.type === "user" && (
        <ConfirmModal
          title="删除子账号"
          content={<>确认删除子账号 <strong>{(deleteTarget.item as User).name}</strong>？</>}
          onClose={closeModal}
          onConfirm={() => { setUsers(prev => prev.filter(u => u.id !== (deleteTarget.item as User).id)); closeModal(); }}
        />
      )}
      {modal === "delete-api-key"  && deleteTarget?.type === "api-key" && (
        <ConfirmModal
          title="删除云API密钥"
          content={<>确认删除账号 <strong>{(deleteTarget.item as ApiKey).account}</strong> 的云API密钥？</>}
          onClose={closeModal}
          onConfirm={() => { setApiKeys(prev => prev.filter(k => k.id !== (deleteTarget.item as ApiKey).id)); closeModal(); }}
        />
      )}
      {modal === "delete-policy"   && deleteTarget?.type === "policy" && (
        <ConfirmModal
          title="删除策略"
          content={<>确认删除策略 <strong>{(deleteTarget.item as Policy).name}</strong>？</>}
          onClose={closeModal}
          onConfirm={() => { setPolicies(prev => prev.filter(p => p.id !== (deleteTarget.item as Policy).id)); closeModal(); }}
        />
      )}
    </div>
  );
}

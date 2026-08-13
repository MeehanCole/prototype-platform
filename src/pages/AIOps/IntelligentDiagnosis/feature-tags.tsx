import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import prdRaw from "./prd.md?raw";

// ─── 功能点标注系统（对应 PRD FR-1~FR-6 + 本轮变更 F-Copilot/F-Perm）─────────────────
// Host 的 PageView 顶部「显示新增功能点」开关 → 通过 __showFeat 传入本应用 → DocContext 下发给各页面
// 页面在标题/关键位置放置 <NewTag code="FR-x" />，开关开启时显示蓝色「说明」胶囊，点击打开 DocPanel 看 PRD
//
// ⚠️ FEATURE_DOCS 内容由 PRD 原文通过 extractSection 抽取（单一事实源），不手抄，确保 DocPanel 显示完整 PRD 段落（含验收标准 AC）

export type FeatureType = "A" | "B" | "M" | "R";

// 从 PRD 原文抽取功能点段落（**FR-X 起始，到下一个 **FR-/## 之前结束）
function extractSection(raw: string, startFr: string, endFr?: string): string {
  const lines = raw.split("\n");
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`**${startFr}`)) start = i;
    if (endFr && lines[i].includes(`**${endFr}`)) {
      end = i;
      break;
    }
  }
  // 未指定 endFr 时，自动在下一个「**功能点」或「## 章节」处截断（用于最后一个段落）
  if (start !== -1 && end === lines.length) {
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i].startsWith("**") || lines[i].startsWith("## ")) {
        end = i;
        break;
      }
    }
  }
  if (start === -1) return `<!-- Section ${startFr} not found in PRD -->`;
  return lines.slice(start, end).join("\n");
}

export const FEATURE_LABELS: Record<
  string,
  { type: FeatureType; title: string; desc: string }
> = {
  "FR-1": {
    type: "M",
    title: "模型管理",
    desc: "模型注册、启停控制、默认模型设置；支持 LLM / 视觉模型，仅 LLM 可设为默认。",
  },
  "FR-2": {
    type: "M",
    title: "工具管理 (MCP)",
    desc: "MCP 工具服务注册与管理：协议（SSE/Streamable HTTP）、自定义请求头、连通性测试、函数查看与调试。",
  },
  "FR-3": {
    type: "M",
    title: "技能管理",
    desc: "SKILL.md 技能导入/导出/删除；技能即文件，文件存在即生效，由开发侧维护，原型不提供创建/编辑。",
  },
  "FR-4": {
    type: "M",
    title: "智能诊断（应用面统一入口）",
    desc: "Copilot AI 智能助手：常驻对话 + 告警行内联动，五阶段诊断流程，诊断历史还原与导出。",
  },
  "FR-5": {
    type: "M",
    title: "告警中心",
    desc: "告警消息中心（概览/指标/日志/事件/历史 5 Tab），行内「智能诊断」联动发起诊断。",
  },
  "FR-6": {
    type: "M",
    title: "配置管理（Agent 运行参数）",
    desc: "本轮新增：Agent 迭代次数、上下文压缩上限、诊断超时、并发 Subagent 数、最大回溯步数；参数为前端原型，实际生效依赖后端。",
  },
  "F-Copilot": {
    type: "M",
    title: "对话助手统一命名 Copilot AI 智能助手",
    desc: "本轮变更：对话框顶部标题、欢迎语、导出报告统一命名为「Copilot AI 智能助手」，替代原「智能诊断助手」。",
  },
  "F-Perm": {
    type: "M",
    title: "工具权限统一 OIDC + RBAC 管控",
    desc: "本轮变更：移除工具级「所需权限域」声明与前端预检 UI，权限判定完全落在后端资源侧 RBAC 与项目域过滤。",
  },
};

// FEATURE_DOCS 全部来自 PRD 原文抽取（含验收标准 AC），单一事实源
export const FEATURE_DOCS: Record<string, string> = {
  "FR-1": extractSection(prdRaw, "FR-1", "FR-2"),
  "FR-2": extractSection(prdRaw, "FR-2", "FR-3"),
  "FR-3": extractSection(prdRaw, "FR-3", "FR-4"),
  "FR-4": extractSection(prdRaw, "FR-4", "FR-5"),
  "FR-5": extractSection(prdRaw, "FR-5", "FR-6"),
  "FR-6": extractSection(prdRaw, "FR-6", "F-Copilot"),
  "F-Copilot": extractSection(prdRaw, "F-Copilot", "F-Perm"),
  "F-Perm": extractSection(prdRaw, "F-Perm"),
};

// ─── Context：把 showFeat 与 openDoc 下发给所有子页面 ───────────────────────────────

interface DocContextValue {
  showFeat: boolean;
  openDoc: (code: string) => void;
}

const DocContext = createContext<DocContextValue>({
  showFeat: false,
  openDoc: () => {},
});

export function useDocContext() {
  return useContext(DocContext);
}

export function DocProvider({
  showFeat,
  onOpenDoc,
  children,
}: {
  showFeat: boolean;
  onOpenDoc: (code: string) => void;
  children: ReactNode;
}) {
  return (
    <DocContext.Provider value={{ showFeat, openDoc: onOpenDoc }}>
      {children}
    </DocContext.Provider>
  );
}

// ─── NewTag：蓝色「说明」胶囊（仅 showFeat 时显示）─────────────────────────────────

export function NewTag({ code }: { code: string }) {
  const hostRef = useRef<HTMLButtonElement | null>(null);
  const { openDoc, showFeat } = useContext(DocContext);
  const [tip, setTip] = useState<{ top: number; left: number; above: boolean; show: boolean }>({
    top: 0,
    left: 0,
    above: true,
    show: false,
  });
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
        className={`inline-flex items-center gap-0.5 h-4 px-1 rounded-full bg-background/95 ring-1 text-[9px] transition-colors z-10 whitespace-nowrap font-medium shadow-sm ${
          hasDoc
            ? "ring-primary/40 text-primary hover:bg-primary/10 hover:ring-primary/60 cursor-pointer"
            : "ring-border text-muted-foreground hover:bg-accent cursor-help"
        }`}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
        说明
      </button>
      {tip.show &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: tip.top,
              left: tip.left,
              zIndex: 99999,
              transform: tip.above ? "translateY(-100%)" : "translateY(0)",
            }}
            className="w-52 rounded-md bg-foreground px-3 py-2 text-[11px] text-background shadow-xl ring-1 ring-black/10 pointer-events-none leading-snug"
          >
            <span className="font-semibold block mb-0.5">
              {code} {f.title}
            </span>
            <span className="text-background/85">{f.desc}</span>
            {hasDoc && <span className="block mt-1 text-background/60 text-[10px]">点击查看完整 PRD</span>}
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── DocPanel：右侧抽屉（点击说明查看完整 PRD）──────────────────────────────────────

export function DocPanel({ code, onClose }: { code: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!code) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [code, onClose]);
  if (!code) return null;
  const f = FEATURE_LABELS[code];
  const doc = FEATURE_DOCS[code] || "暂无该功能点的 PRD 详细描述";
  return createPortal(
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div
        className="absolute right-0 top-0 h-full w-[560px] max-w-[92vw] bg-background border-l border-border shadow-2xl flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 px-5 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">
                {code}
              </span>
              <span className="text-[11px] text-muted-foreground">新增</span>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-foreground">{f?.title || "功能点详情"}</h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
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

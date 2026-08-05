# 代码生成规范 (Page Generator Rules)

本规则定义原型平台的代码生成契约。任何 AI 工具（Trae / Cursor / v0 / Copilot 等）生成的代码必须遵守以下规范。

---

## 1. 目录约定（强约束）

```
src/pages/<业务域>/<页面>/
  ├── index.tsx          # 默认入口（必须 default export）
  ├── prd.md             # PRD 文档（单版本）
  ├── meta.json          # 页面元数据
  └── _versions/         # 多版本目录（可选）
      ├── v1.tsx
      └── v2.tsx
```

多版本页面必须拆分 PRD：
```
src/pages/<Module>/<Page>/
  ├── index.tsx          # 重导出默认版本
  ├── meta.json          # versions: ["v1","v2"], defaultVersion: "v2"
  ├── prd_v1.md          # V1 PRD
  ├── prd_v2.md          # V2 PRD
  └── _versions/
      ├── v1.tsx
      └── v2.tsx
```

## 2. 默认导出（强约束）

入口文件必须 `export default function XxxPage()`，基座通过 `React.lazy(() => import(...))` 加载。

```tsx
// 正确
export default function LoginPage() {
  return <div>...</div>
}

// 错误
export function LoginPage() { ... }
const LoginPage = () => <div>...</div>
export default LoginPage
```

多版本页面 index.tsx 应重导出：
```tsx
export { default } from './_versions/v2'
```

## 3. meta.json 元数据（强约束）

```json
{
  "title": "登录页",
  "module": "CRM",
  "defaultVersion": "v2",
  "versions": ["v1", "v2"],
  "tags": ["登录", "鉴权"]
}
```

必填字段：`title`、`module`
可选字段：`defaultVersion`、`versions`、`tags`

## 4. 样式系统（强约束）

- 必须使用 Tailwind CSS + Shadcn UI 风格组件
- 禁止 antd、inline-style、CSS Modules
- 必须使用平台设计 token：`bg-background`、`text-foreground`、`bg-primary`、`text-primary-foreground`、`bg-muted`、`text-muted-foreground`、`border-border`

## 4.1 Figma 代码转换布局适配（强约束）

Figma 导出的代码通常自带全屏布局（`h-screen` + Header + Sidebar），直接放入平台会导致高度冲突、侧边栏底部与内容区不对齐等问题。

### 转换规则

| Figma 原始写法 | 平台正确写法 | 原因 |
|---------------|-------------|------|
| `h-screen` | `h-full` 或 `min-h-screen` | 平台内容区已有固定高度，`h-screen` 会溢出 |
| `overflow-hidden`（外层） | 移除 | 平台内容区管理滚动，页面不应锁高度 |
| `h-full overflow-hidden`（Sidebar） | 移除 `h-full` 和 `overflow-hidden` | 侧边栏需跟随内容高度自适应 |
| `overflow-y-auto`（main） | 移除 | 由平台内容区统一管理滚动 |

### 布局结构要求

Figma 代码通常有两种布局，转换时必须采用「Sidebar 通顶」结构：

```
正确（Sidebar 通顶）：
┌──────┬──────────────────────┐
│      │       TopNav          │
│ Side ├──────────────────────┤
│ bar  │       main            │
│      │                       │
└──────┴──────────────────────┘

错误（TopNav 全宽压顶）：
┌─────────────────────────────┐
│         TopNav (全宽)         │
├──────┬──────────────────────┤
│ Side │       main            │  ← Sidebar 底部与 main 不对齐
│ bar  │                       │
└──────┴──────────────────────┘
```

正确代码模板：
```tsx
return (
  <div className="flex min-h-screen bg-[#f0f2f5] overflow-hidden">
    <Sidebar />
    <div className="flex flex-1 flex-col min-w-0">
      <TopNav />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">{renderPage()}</main>
    </div>
  </div>
)
```

### 宽表格横向滚动（强约束）

云API管理、运营平台等后台页面常有 10+ 列宽表格（`min-w-[2400px]`），如果 flex 容器不加 `min-w-0`，表格会把整个页面撑开导致布局崩溃，而不是在表格内部出现横向滚动条。

**根因**：flex item 默认 `min-width: auto`，不会被压缩到小于内容宽度，导致 `overflow-x-auto` 失效，压力传导到外层撑开整页。

**正确写法**（三层 `min-w-0` 逐层传递约束）：
```tsx
<div className="flex min-h-screen overflow-hidden">          {/* 外层锁死 */}
  <Sidebar />
  <div className="flex flex-1 flex-col min-w-0">             {/* 第1层 min-w-0 */}
    <TopNav />
    <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">  {/* 第2层 min-w-0 */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">                    {/* 表格滚动容器 */}
          <table className="min-w-[2400px] w-full">...</table>
        </div>
      </div>
    </main>
  </div>
</div>
```

**关键规则**：
- 外层 `overflow-hidden` 防止表格撑开平台容器
- content div 和 main 都加 `min-w-0`，破除 flex item 默认 `min-width: auto`
- main 用 `overflow-x-hidden` 让表格内部的 `overflow-x-auto` 接管横向滚动
- 表格用 `min-w-[Npx]` 设定最小宽度，不要用固定 `w-[Npx]`

**错误示例**（表格会撑开整页）：
```tsx
// 缺少 min-w-0 和 overflow-hidden
<div className="flex min-h-screen">
  <Sidebar />
  <div className="flex flex-1 flex-col">
    <TopNav />
    <main className="flex-1">
      <div className="overflow-x-auto">
        <table className="min-w-[2400px]">...</table>
      </div>
    </main>
  </div>
</div>
```

### Checklist
- [ ] 外层容器用 `min-h-screen`，不用 `h-screen`
- [ ] 外层容器加 `overflow-hidden` 防止表格撑开整页
- [ ] Sidebar 不含 `h-full` / `overflow-hidden`
- [ ] content div 和 main 都加 `min-w-0`（破除 flex item 默认 min-width: auto）
- [ ] main 用 `overflow-x-hidden`，不用 `overflow-y-auto`（垂直滚动由平台管理）
- [ ] 宽表格用 `overflow-x-auto` 容器包裹 + `min-w-[Npx]`，不用固定 `w-[Npx]`
- [ ] Sidebar 通顶，TopNav 在右侧内容区上方
- [ ] 页面内容多时 Sidebar 底部与 main 底部对齐

## 5. 设计系统感知（强约束）

平台内置 5 套设计系统预设，生成代码时必须匹配目标产品的设计系统：

| 预设 | 主色 | 圆角 | 适用产品 |
|------|------|------|---------|
| default | indigo | 6px | Prototype Default |
| element-plus | #409eff | 4px | Vue3 + Element Plus |
| ant-design | #1677ff | 6px | React + Ant Design |
| arco-design | #165dff | 4px | Arco Design |
| naive-ui | #18a058 | 4px | Naive UI |

生成规则：
1. 询问用户目标产品的设计系统（或从上下文推断）
2. 按钮圆角、字重、表格样式匹配对应 preset
3. 使用 `bg-primary` / `text-primary` token，不硬编码颜色
4. 如目标产品使用自定义设计系统，提取关键 token 并记录在 PRD

## 6. PRD 段落标记（Mode C 多版本必做）

PRD 中每个功能需求必须用 `**FR-X` 标记段落起始：

```markdown
## 2. 功能需求详单

**FR-1 视角切换（Restructure, 顶层 Tab 必做）**
| 项目 | 说明 |
|---|---|
| 描述 | 页面最顶部显示「个人视角」/「团队视角」切换 Tab |
| 业务规则 | 1) 普通员工=只显示个人视角 |

**FR-2 团队视角：部门/成员筛选（Modify）**
...
```

标记规则：
- `**FR-X` 必须唯一，每个功能段落一个
- 编号必须连续（FR-1, FR-2, FR-3...），不能跳号
- `**FR-X` 必须在行首
- 下一个 `**FR-Y` 出现时，前一个 FR 段落结束

## 7. PRD 内嵌代码（Mode C 多版本必做）

版本文件必须包含以下代码结构：

### 7.1 头部导入
```tsx
import { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeMermaid from 'rehype-mermaid'
import prdV2Raw from '../prd_v2.md?raw'
```

### 7.2 extractSection 工具函数
```tsx
/** Extract a PRD section between **startFr and **endFr (exclusive) */
function extractSection(raw: string, startFr: string, endFr?: string): string {
  const lines = raw.split('\n')
  let start = -1, end = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`**${startFr}`)) start = i
    if (endFr && lines[i].includes(`**${endFr}`)) { end = i; break }
  }
  return lines.slice(start, end).join('\n').replace(/^#{1,6} /gm, (m) => m + ' ')
}
```

### 7.3 FEATURE_DOCS 映射表
```tsx
const FEATURE_DOCS: Record<string, string> = {
  'A.01': extractSection(prdV2Raw, 'FR-1'),
  'M.01': extractSection(prdV2Raw, 'FR-2'),
  'B.01': extractSection(prdV2Raw, 'FR-3'),
  // ... key 必须与 FEATURE_LABELS 1:1 对应
}
```

### 7.4 DocContext 定义
```tsx
const DocContext = createContext<(code: string) => void>(() => {})
```

### 7.5 DocPanel 组件
```tsx
function DocPanel({ code, onClose }: { code: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!code) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [code, onClose])

  if (!code) return null
  const f = FEATURE_LABELS[code]
  const doc = FEATURE_DOCS[code] || '暂无该功能点的 PRD 详细描述'
  const typeShort = f ? { A: '重构', B: '新增', M: '修改', R: '删除' }[f.type] : ''

  // 必须用 createPortal 渲染到 document.body
  // 原型容器有 transform: scale()（zoom 控件），会破坏 fixed inset-0 定位
  return createPortal(
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div
        className="absolute right-0 top-0 h-full w-[400px] max-w-[90vw] bg-background border-l border-border shadow-2xl flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 px-5 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">{code}</span>
              {f && <span className="text-[11px] text-muted-foreground">{typeShort}</span>}
            </div>
            <h3 className="mt-1 text-sm font-semibold text-foreground">{f?.title || '功能点详情'}</h3>
          </div>
          <button onClick={onClose} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-foreground/90 prose-li:text-foreground/90 prose-th:text-foreground prose-td:text-foreground/80 prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeMermaid, { strategy: 'img-svg' }]]}>{doc}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
```

### 7.6 NewTag 组件（胶囊形「说明」按钮）
```tsx
function NewTag({ code }: { code: string }) {
  const hostRef = useRef<HTMLButtonElement | null>(null)
  const openDoc = useContext(DocContext)
  const [tip, setTip] = useState<{ top: number; left: number; above: boolean; show: boolean }>({ top: 0, left: 0, above: true, show: false })

  const f = FEATURE_LABELS[code]
  if (!f) return null
  const typeShort = { A: '重构', B: '新增', M: '修改', R: '删除' }[f.type]
  const hasDoc = !!FEATURE_DOCS[code]

  const showTip = () => {
    const el = hostRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const TIP_W = 208
    const above = r.top > 120
    let left = r.left + r.width / 2 - TIP_W / 2
    if (left < 8) left = 8
    const vw = window.innerWidth
    if (left + TIP_W > vw - 8) left = vw - 8 - TIP_W
    setTip({ top: above ? r.top - 6 : r.bottom + 6, left, above, show: true })
  }
  const hideTip = () => setTip(p => ({ ...p, show: false }))

  return (
    <>
      <button
        ref={hostRef}
        type="button"
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
        onClick={hasDoc ? (e) => { e.stopPropagation(); openDoc(code) } : undefined}
        title={hasDoc ? '查看 PRD 详细说明' : `${typeShort}：${f.title}`}
        aria-label={`${code} ${typeShort}`}
        tabIndex={0}
        className={`absolute -top-1.5 right-0 inline-flex items-center gap-0.5 h-4 px-1 rounded-full bg-background/95 ring-1 text-[9px] transition-colors z-10 whitespace-nowrap font-medium shadow-sm ${
          hasDoc
            ? 'ring-primary/40 text-primary hover:bg-primary/10 hover:ring-primary/60 cursor-pointer'
            : 'ring-border text-muted-foreground hover:bg-accent cursor-help'
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
      {tip.show && createPortal(
        <div
          style={{ position: 'fixed', top: tip.top, left: tip.left, zIndex: 99999, transform: tip.above ? 'translateY(-100%)' : 'translateY(0)' }}
          className="w-52 rounded-md bg-foreground px-3 py-2 text-[11px] text-background shadow-xl ring-1 ring-black/10 pointer-events-none leading-snug"
        >
          <span className="font-semibold block mb-0.5">{code} {f.title}</span>
          <span className="text-background/85">{f.desc}</span>
          {hasDoc && <span className="block mt-1 text-background/60 text-[10px]">点击查看完整 PRD</span>}
        </div>,
        document.body,
      )}
    </>
  )
}
```

### 7.7 顶层 Provider + DocPanel 渲染
```tsx
export default function V2Page() {
  const [docCode, setDocCode] = useState<string | null>(null)
  const openDoc = useCallback((code: string) => setDocCode(code), [])
  const closeDoc = useCallback(() => setDocCode(null), [])

  return (
    <DocContext.Provider value={openDoc}>
      {/* 页面内容，含 <NewTag code="A.01" /> 等 */}
      <DocPanel code={docCode} onClose={closeDoc} />
    </DocContext.Provider>
  )
}
```

## 8. 功能点标注规范

### 8.1 FEATURE_LABELS 定义
```tsx
const FEATURE_LABELS: Record<string, { type: 'A'|'B'|'M'|'R'; title: string; desc: string }> = {
  'A.01': { type: 'A', title: '顶层双视角 Tab', desc: '页面最顶部显示个人视角/团队视角切换 Tab' },
  'B.01': { type: 'B', title: '团队统计卡', desc: '团队视角聚合统计：待办/超时/平均时长/本周通过' },
  'M.01': { type: 'M', title: '部门/成员筛选', desc: '团队视角新增部门下拉+成员下拉筛选' },
  // ...
}
```

### 8.2 标注类型
| 类型 | 代码 | 说明 |
|------|------|------|
| A 重构 | A.01, A.02... | 信息架构调整 |
| B 新增 | B.01, B.02... | 新增功能 |
| M 修改 | M.01, M.02... | 现有功能修改 |
| R 删除 | R.01, R.02... | 移除功能 |

### 8.3 交互规则
- Header 右侧「显示新增功能点」checkbox 开关，按「路由+版本」存 localStorage
- 打开开关 → 功能点旁出现胶囊形「说明」按钮
- 蓝色按钮 = 有 PRD 详情 → 可点击 → DocPanel 展示完整 PRD
- 灰色按钮 = 无 PRD 详情 → 仅 hover 显示简短 tooltip
- 关闭开关 → 所有按钮瞬间消失，零占位零位移

## 9. 禁止事项

| 反模式 | 原因 | 正确做法 |
|--------|------|---------|
| 硬编码 PRD 文本在 JSX | 重复内容，维护困难 | `?raw` 导入 + `extractSection` |
| DocPanel 内联渲染（不用 portal） | `transform: scale()` 破坏 fixed 定位 | `createPortal` 到 `document.body` |
| FEATURE_DOCS 与 FEATURE_LABELS key 不匹配 | 点击显示错误文档 | key 必须 1:1 对应 |
| PRD 跳过 `**FR-X` 标记 | `extractSection` 找不到边界 | 每个需求段落加标记 |
| 用 `innerHTML` / `dangerouslySetInnerHTML` | 安全风险 | `ReactMarkdown` + `remarkGfm` |
| 渲染多个 DocPanel 实例 | z-index 冲突、堆叠 | 单例模式（单个 `code` state） |
| 中文标点（、（））在代码注释 | oxc 解析器可能 PARSE_ERROR | 用 ASCII 标点 |
| 注释中含 `**/` glob 模式 | Vite 8 oxc 误判为注释结束 | 用文字描述代替 |
| Figma 转换后保留 `h-screen` | 平台内容区已有固定高度，溢出/底部不对齐 | 用 `min-h-screen`，详见 §4.1 |
| TopNav 全宽压顶（Sidebar 在下方） | Sidebar 底部与 main 不对齐 | Sidebar 通顶，详见 §4.1 |
| flex 容器下宽表格不加 `min-w-0` | flex item 默认 `min-width: auto`，表格撑开整页，`overflow-x-auto` 失效 | 每层 flex 容器加 `min-w-0` + 外层 `overflow-hidden`，详见 §4.1 |
| 表格用固定 `w-[2400px]` | 宽度被锁死无法自适应窄容器 | 用 `min-w-[2400px] w-full`，让 `overflow-x-auto` 接管滚动 |
| PRD 交互流程只有文字无流程图 | 复杂流程难理解、易歧义 | Mermaid 流程图 + 文字流程双轨制，详见 §6 |
| DocPanel 缺少 rehype-mermaid | PRD 中 Mermaid 代码块不渲染为流程图 | 配置 `rehypePlugins={[[rehypeMermaid, { strategy: 'img-svg' }]]}` |

## 10. 输出 Checklist

生成代码后必须检查：

- [ ] `meta.json` 存在，含 `title` 和 `module`
- [ ] `index.tsx` 有 `export default`
- [ ] 代码注释用 ASCII 标点，无 `**/` glob 模式
- [ ] 使用 Tailwind 工具类，无 inline-style、无 antd
- [ ] 无禁止依赖（MUI、Ant Design、Emotion、styled-components）
- [ ] 硬编码颜色映射到设计 token
- [ ] flex 容器链路加 `min-w-0` + 外层 `overflow-hidden`，宽表格在内部 `overflow-x-auto` 滚动（详见 §4.1）
- [ ] 多版本页面拆分 `prd_v1.md` / `prd_v2.md`
- [ ] 多版本 `index.tsx` 重导出默认版本
- [ ] PRD 文件存在，含 Business Context
- [ ] 设计系统预设已选择并应用
- [ ] Mode C：PRD 有 `**FR-X` 标记
- [ ] Mode C：版本文件含 `?raw` 导入 + `extractSection` + `FEATURE_DOCS`
- [ ] Mode C：DocPanel 用 `createPortal` 到 `document.body`
- [ ] Mode C：DocPanel 支持 Esc + 遮罩关闭
- [ ] Mode C：功能点按钮蓝色可点击 / 灰色仅 tooltip
- [ ] Mode C：`FEATURE_DOCS` 与 `FEATURE_LABELS` key 1:1
- [ ] Mode C：DocPanel 配置 `rehypeMermaid`（strategy: 'img-svg'），PRD 中 Mermaid 流程图可渲染

## 11. PRD 标准结构

PRD 采用「分层渐进式」结构：简单页面可只填前 4 节，复杂页面填全部 11 节。
强制必填：§1 业务背景、§3 用户故事、§4 功能需求详单、§8 验收标准。

### 11.1 完整模板

```markdown
# <页面标题> PRD

## 0. 文档信息
| 版本 | 日期 | 修改内容 | 作者 |
|------|------|---------|------|
| v1.0 | YYYY-MM-DD | 初稿 | <作者> |

## 1. 业务背景
- **产品定位**: <产品名>
- **目标用户**: <角色，如运营人员 / 租户管理员>
- **业务背景**: <为什么做，解决什么问题>
- **商业价值**: <预期收益，如效率提升 X% / 错误率降低 Y%>
- **成功指标**: <可量化的衡量标准，如转化率提升 X%>
- **目标产品技术栈**: <待业务方确定，建议与现有产品线一致，如 Vue3 + Element Plus / React + Ant Design>
- **设计系统**: <目标产品设计系统，如 Ant Design / Element Plus / Arco / Naive UI>
- **入口位置**: <在产品中的位置，如 云API管理 > 接口管理>

## 2. 功能概览
<2-3 句话说明核心功能与用户价值>

| 模块 | 功能点 | 优先级 | 类型 |
|------|--------|--------|------|
| <模块> | <功能> | Must / Should / Could | 新增 / 修改 / 重构 |

优先级采用 MoSCoW：Must（必做）/ Should（应做）/ Could（可做）/ Won't（不做）

## 3. 用户故事
- US-1: 作为 <角色>，我想要 <动作>，以便于 <价值>
- US-2: 作为 <角色>，我想要 <动作>，以便于 <价值>

## 4. 功能需求详单

**FR-1 <功能名>**
| 项目 | 说明 |
|------|------|
| 用户故事 | US-1 |
| 优先级 | Must / Should / Could / Won't |
| 描述 | <用户能做什么> |
| 输入 | <字段名 / 类型 / 格式 / 校验规则> |
| 输出 | <结果 / 数据格式 / 提示> |
| 业务规则 | 1) 触发条件: <...> 2) 校验逻辑: <...> 3) 冲突处理: <...> 4) 旧数据兼容: <...> |
| 权限控制 | <角色 / 可见性 / 操作权限> |
| 状态流转 | <状态A → 状态B，触发条件> |

**验收标准 (Acceptance Criteria)**
- AC-1: Given <前置条件>, When <操作>, Then <预期结果>
- AC-2: Given <前置条件>, When <操作>, Then <预期结果>
- AC-3: Given <前置条件>, When <操作>, Then <预期结果>

**FR-2 <功能名>**
...

## 5. 数据要求
| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|---------|------|
| code | string | 是 | 唯一，字母+数字 | 接口编码 |
| name | string | 是 | 1-50 字符 | 接口名称 |

## 6. 交互流程

流程图（Mermaid）+ 文字流程双轨制，复杂流程必须两者都有，简单流程可只有文字。

### 6.1 页面导航主流程
```mermaid
flowchart TD
    A[入口] --> B[默认页]
    B --> C{切换}
    C -->|分支1| D1[页面1]
    C -->|分支2| D2[页面2]
```
文字流程：入口 → 默认页 → 通过导航切换到各分支页面

### 6.2 核心操作流程
```mermaid
flowchart LR
    A[列表页] -->|点击「操作」| B[详情/编辑页]
    B --> C{校验}
    C -->|失败| D[提示错误]
    D --> C
    C -->|通过| E[保存成功]
    E --> F[返回列表页]
```
文字流程：列表页 → 操作 → 校验 → 保存 → 返回

### 6.3 状态机（有状态流转的实体必填）
```mermaid
stateDiagram-v2
    [*] --> 草稿: 新增
    草稿 --> 已发布: 发布
    已发布 --> 已下线: 下线
    已下线 --> [*]: 删除
```

## 7. 非功能性需求
- **性能**: 页面加载 ≤ 2s，列表查询 ≤ 500ms
- **安全**: 敏感字段脱敏显示，操作日志记录
- **兼容性**: Chrome 90+ / Firefox 88+ / Edge 90+
- **可访问性**: 键盘导航、ARIA 标签、对比度 AA

## 8. 边界情况
- 空状态: <无数据时显示什么>
- 加载状态: <skeleton / spinner>
- 错误状态: <网络异常 / 权限不足 / 数据冲突>
- 数据边界: <最大层级 / 最大数量 / 字符长度上限>

## 9. 待办问题
- [ ] Q1: <问题> @<负责人>
- [ ] Q2: <问题> @<负责人>

## 10. 组件映射

> 目标产品开发时的组件库建议映射，实际以目标产品选定的技术栈为准。

| UI 元素 | Ant Design | Element Plus | 关键属性 |
|---------|-----------|--------------|---------|
| 按钮 | Button | ElButton | type="primary" / "default" |
| 数据表格 | Table | ElTable | columns, dataSource, pagination, scroll |
| 文本输入 | Input | ElInput | placeholder, allowClear |
| 下拉选择 | Select | ElSelect | options, placeholder, allowClear |
| 树形控件 | Tree | ElTree | treeData, onSelect |
| 表单项 | Form.Item | ElFormItem | label, rules |
| 弹窗 | Modal | ElDialog | title, open, onOk, onCancel |
| 分页 | Pagination | ElPagination | total, current, pageSize |
| 标签 | Tag | ElTag | color |
```

### 11.2 渐进式采用规则

| 页面复杂度 | 必填章节 | 可选章节 |
|-----------|---------|---------|
| 简单（单一列表 / 静态展示） | §0 §1 §2 §3 §4 | §5 §6 §7 §8 §9 §10 |
| 中等（表单 / 筛选 / 弹窗） | §0 §1 §2 §3 §4 §6 §8 | §5 §7 §9 §10 |
| 复杂（多版本 / 状态机 / 权限矩阵） | 全部 §0-§10 | - |

### 11.3 关键字段约束

| 字段 | 约束 | 示例 |
|------|------|------|
| `**FR-X` | 必须行首，编号连续不跳号，每个功能段落唯一 | `**FR-1 接口管理` |
| 优先级 | 枚举：Must / Should / Could / Won't | `Must` |
| AC 编号 | 同一 FR 内连续编号 | `AC-1 AC-2 AC-3` |
| US 编号 | 全文连续编号 | `US-1 US-2 US-3` |
| 验收标准格式 | 必须 Given-When-Then 三段式 | `Given 已登录，When 点击，Then 弹出` |

### 11.4 DocPanel 兼容性

`extractSection` 仍按 `**FR-X` 标记拆分 PRD，新增章节（§0 §3 §5 §7 §9）不影响 DocPanel 提取逻辑。DocPanel 展示的是 §4 中对应 FR-X 的完整段落（含验收标准 AC-X），便于测试对照验收。

### 11.5 禁止事项

| 反模式 | 原因 | 正确做法 |
|--------|------|---------|
| 跳过 §3 用户故事 | 缺失用户视角，难以验收 | 每个 FR 必须关联至少一个 US |
| 验收标准用文字描述 | 歧义、不可测 | Given-When-Then 三段式 |
| 业务规则一行带过 | 边界不清，开发自由发挥 | 拆 4 项：触发/校验/冲突/兼容 |
| 无优先级 | 资源冲突时无法取舍 | MoSCoW 标注每个 FR |
| 状态流转缺触发条件 | 状态机不完整 | 每条流转标注「事件 + 条件」 |

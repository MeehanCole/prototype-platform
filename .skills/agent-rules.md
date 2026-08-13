# Agent Rules（项目级 Agent 行为规范）

> **本文件是 Agent 执行任何项目任务时的最高优先级行为约束。**
> 当本文件与其他规则冲突时，以本文件为准。
> 详细规范见同目录下的 [page-generator.md](./page-generator.md) 和 [design-workflow.md](./design-workflow.md)。

---

## R1. 原型协作台外壳边界（红线）

**禁止修改 `src/host/` 下的任何文件**，包括但不限于：
- `src/host/layout/`（AppLayout、Sidebar、PageView）
- `src/host/router/`（pageRegistry）
- `src/host/components/`（DesignSystemSwitcher、SearchPanel、ui/）
- `src/host/design-systems/`、`src/host/hooks/`
- `src/App.tsx`、`src/main.tsx`

**所有"全局 Header"、"平台导航栏"、"面包屑"、"用户菜单"都是原型页面内部的一部分**，必须在 `src/pages/<Module>/<Page>/_shared.tsx` 中定义为 `PlatformShell` 等共享组件，由各页面 `index.tsx` 自行包裹。

| 触发词 | 正确动作 |
|--------|---------|
| "添加全局 Header" | 在 `_shared.tsx` 定义 `PlatformHeader`，页面内包裹 |
| "添加平台导航" | 在 `_shared.tsx` 定义 `PlatformSidebar`，页面内包裹 |
| "修改平台搜索" | 停下，告知用户这是外壳修改，需单独处理 |

误改恢复：`git checkout -- src/host/ src/App.tsx src/main.tsx`

详见 [page-generator.md §3.5](./page-generator.md#35-原型协作台外壳边界强约束)

---

## R2. 项目隔离（红线）

**不同原型项目之间代码、设计、数据严格隔离，禁止跨项目参考。**

- ❌ 禁止读取 `src/pages-imports/01-raw/租户门户/`、`src/pages-imports/01-raw/云API管理/` 等其他项目代码
- ❌ 禁止复制其他项目的 CSS 变量、颜色值、组件结构、交互模式
- ❌ 禁止以"参考一下其他项目"为由浏览跨项目代码
- ✅ 每个项目的需求分析、方案设计、代码生成必须基于**本项目**的输入源（截图/Figma/PRD/口头描述）
- ✅ 仅当用户**明确要求**复用某项目组件时，才可在用户指定范围内参考

设计风格来源优先级：
1. 用户提供的输入源（截图/Figma/现有代码）→ 还原该风格
2. 用户明确选择的预设 → 按预设生成
3. 禁止 AI 自行参考项目其他页面推断设计方向

详见 [design-workflow.md 顶层规则](./design-workflow.md)

---

## R3. JSX 标签闭合校验（强约束）

**批量修改页面 `return` 结构时，必须精确统计标签开闭数量，确保替换前后配对。**

校验流程：
1. 替换前统计原 `return` 块的 `<div>` 开闭数量
2. 设计新结构，明确最外层包裹标签
3. 替换后逐一核对开闭数量
4. 保存后检查 Vite 是否报 `PARSE_ERROR` 或 `Adjacent JSX elements`

批量重构规范：
- 先在一个页面试跑 + 编译验证通过，再推广
- 仅在最外层添加包裹组件，不改动内部 `div` 层级
- 每改完一个页面立即验证，不要等全部改完
- 优先用 `Edit` 工具精确替换，不用正则批量替换

详见 [page-generator.md §9.1](./page-generator.md#91-jsx-标签闭合校验强约束)

---

## R4. Vision MCP 服务检查（强约束）

**调用 `vision-mcp` 工具前，必须先检查本地 llama.cpp 视觉服务是否运行。**

检查命令：`lsof -i :8080` 或 `curl -s http://localhost:8080/v1/models`

服务未运行时：
1. **不得反复重试** MCP 工具调用（会持续超时浪费资源）
2. 告知用户视觉服务未启动，基于现有文档、代码结构、文字描述继续工作
3. 若用户需要视觉识别，提示启动命令：
   `./llama-server -m qwen3-vl-8b-q8_0.gguf --mmproj qwen3-vl-8b-mmproj-f16.gguf --port 8080`

适用工具：`analyze_ui_structure`、`match_design_system`、`infer_prd_from_screenshot`、`cluster_screenshots`、`locate_annotations`、`diff_versions`

详见 [design-workflow.md Vision MCP 服务检查规则](./design-workflow.md)

---

## R5. 经验召回前置（强约束）

**修改布局相关代码前，必须先执行经验召回，检查是否有相似任务的失败经验。**

适用场景：
- 平台 Header 集成
- 导航栏重构
- 页面布局整体调整
- 批量包裹共享组件（如 `PlatformShell`）
- 任何涉及 `src/host/` 边界的操作

召回要点：
1. 调用 ExperienceRecall 检索失败经验（"误改外壳"、"布局崩溃"、"标签闭合错误"）
2. 若存在失败经验，必须规避已知错误路径，不得重蹈覆辙
3. 经验召回是编码前的**前置动作**，不可省略或后置

---

## R5.5 方案纪要前置（有分量的方案）

**实施前先落方案纪要，再动手改代码。**

适用判定（满足任一即落纪要）：
- 经过调研 / 候选对比选型的方案（如技能生命周期模式选型）
- 方向性 / 信息架构级改动（影响多个页面）
- 需要用户确认后才实施的方案
- 影响验收的功能性变更

**不落纪要**：样式 / 文案微调、单点 bug 修复、用户口头拍板立即改的小事（Mode D 直接实施）。

### 归档模式（汇总 + 复杂方案单独成文）

1. **方案纪要.md 汇总**：所有方案决策留痕统一追加到 `docs/<项目名>/方案纪要.md`，每条按 `## <日期> <方案主题>` 分段（极简结构见下）
2. **复杂方案另立详细文档**：需要完整调研 / 实施说明的方案（如信息架构还原、多方案对比实施），单独生成 `docs/<项目名>/<主题>方案.md`（如 `平台导航面板还原方案.md`），并在 `方案纪要.md` 中登记一行索引（标题 + 文档链接 + 结论状态）
3. **简单方案**：直接在 `方案纪要.md` 追加极简条目，不另立文档
4. 调研结论另行沉淀到 `.skills/` 规则，方案纪要只做决策留痕

方案纪要每条极简结构：

```markdown
## <日期> <方案主题>
- 背景：为什么改（1-2 句）
- 候选方案：A / B / C（各一句）
- 选定方案：X + 理由（关键依据）
- 影响范围：涉及页面/文件
- 结论状态：已实施 / 待确认 / 已放弃
- 详细文档：（复杂方案时填写链接）
```

---

## R6. 代码生成基础规范（摘要）

完整规范见 [page-generator.md](./page-generator.md)，以下为高频要点：
### 目录约定（强约束）
```
src/pages/<业务域>/<应用>/          # 必须是两级目录！平台路由机制是 :module/:page
  ├── index.tsx          # 默认导出 function XxxPage()
  ├── prd.md             # 单版本 PRD
  ├── meta.json          # { title, module, versions?, defaultVersion? }
  └── _versions/         # 多版本（可选）
```

> ⚠️ **一级目录必踩坑**：`src/pages/IntelligentDiagnosis/meta.json`（一级）→ 路由 `/intelligentdiagnosis`（一级），无法匹配平台 `:module/:page` 路由 → **找不到路由**。必须放在两级目录 `src/pages/AIOps/IntelligentDiagnosis/` → 路由 `/aiops/intelligentdiagnosis` ✓

### 完整应用单入口（强约束）
**1 个完整应用 = 1 个 `index.tsx` + 1 个 `meta.json` + 1 个 `prd.md`。**
- **必须放在 `src/pages/<Module>/<Page>/` 两级目录下**（一级目录会导致路由匹配失败）
- 多模块共享平台 Header/导航/用户上下文 → 单入口，内部 `useState` 切换
- 子模块用具名导出（`export function XxxPage()`），**不带 `meta.json`**，**不包裹 `PlatformShell`**
- 禁止把完整应用拆成多个带 `meta.json` 的独立路由（破坏导航/交互流/信息架构）
- 详见 [page-generator.md §1.1](./page-generator.md#11-完整应用单入口强约束)

### 样式系统
- 使用 Tailwind CSS + Shadcn UI 风格，禁止 antd / inline-style / CSS Modules
- AI 生成代码用平台 token（`bg-background` 等）；Figma 转换代码保留原始 inline style

### 布局适配（Figma 转换）
- `h-screen` → `min-h-screen`
- 外层加 `overflow-hidden` 防表格撑开
- flex 容器链路加 `min-w-0`
- Sidebar 通顶，TopNav 在右侧内容区上方

### 完整应用内部布局（高度链）
- `PlatformShell` 根用 `h-[calc(100vh-68px)]`，**禁止 `flex-1`**（父级非 flex 容器高度不确定，页面会按内容撑开整页滚动，见 page-generator §3.5 高度说明）
- 页面顶栏 `shrink-0`，内容区 `flex-1 overflow-y-auto`（内部滚动）
- 卡片网格加响应式断点（如 `grid-cols-1 lg:grid-cols-2`），不固定列数

### AI Agent 平台分层（领域约束）
- **技能（Skill）不绑定模型**，智能体（Agent）才绑定模型 + 工具 + 技能
- 技能管理页创建流程禁止"绑定模型"步骤；智能体管理页必须有"选择模型"
- **技能无"触发方式"分类**（对话/定时/事件都不属于技能定义）：调度是外部系统（Agent/编排层）的职责，技能只是 SKILL.md 能力文件
- **技能无"来源/状态"标签**（新建/导入、启用/禁用都不要）：SKILL.md 文件模式下文件存在即生效，卡片只展示 版本 + 更新时间
- 详见 [page-generator.md §1.2](./page-generator.md#12-ai-agent-平台分层架构领域强约束)

### PRD 标记（Mode C 必做）
- 每个功能需求用 `**FR-X` 标记段落起始
- 版本文件含 `?raw` 导入 + `extractSection` + `FEATURE_DOCS`
- DocPanel 用 `createPortal` 到 `document.body`

---

## R7. 工作流模式选择决策树

**Agent 收到任何需求的第一动作：判定走哪种模式，不要默认进入 Mode A 完整流程！**

```
收到用户需求
  │
  ├─→【已有原型页面？】──否──→ Mode A（正向设计）从零开始
  │       │
  │       是
  │       │
  │       ▼
  │   【小修改判定？】
  │       │
  │       ├─ 是（样式/文案/≤2个功能点/局部布局调整）→ Mode D（增量修改）★ 日常 80% 默认走这里
  │       │
  │       └─ 否（≥3功能点 / 架构调整 / 导航路由变更）→ Mode C（混合模式）大版本改造
  │
  └─→【输入是截图/Figma/现有产品URL？】──是──→ Mode B（逆向设计）还原
```

### 四种模式速查表

| 模式 | 起点 | 适用场景 | 人工确认 | 版本处理 |
|------|------|---------|---------|---------|
| **D 增量修改** ★默认 | 已有原型 + 小改需求 | 日常 80% 小步迭代：改按钮/调布局/加1-2功能/改文案 | **0 次**（直接改完交付 | 直接改当前版本，不强制建新版本 |
| C 混合模式 | 已有原型 + 大改需求 | 大版本改造：≥3功能点/导航/架构调整 | 2 次（改造方案 + PRD） | 新建 v3/v4，A/B 对比 |
| B 逆向设计 | 截图/Figma/URL | 竞品分析、现有产品还原 | 1 次（PRD） | 单版本 |
| A 正向设计 | 文字需求从零 | 全新页面/全新模块 | 4 次（需求/方案/风格/PRD | 单版本 |

### Mode D（增量修改）行为规范

**核心原则：快速响应，最小改动，不触发完整工作流，不生成冗余文档。**

#### D1 快速修改流程（4 步直达）

1. **理解改点**：读用户描述 + 读当前页面代码 + 读 PRD（如有），明确改什么/改成什么样/影响范围
   - ❌ 不写需求清单.md
   - ❌ 不做竞品分析
   - ❌ 不做 2-3 个候选方案
   - ❌ 不强制需求确认（除非描述模糊才问清
2. **精确定位改代码**：用 `Edit` 工具精确替换，禁止 `Write` 全文件覆盖
   - ❌ 不重构周边未涉及代码
   - ❌ 不擅自更改变量命名/组件拆分/数据结构
3. **编译验证**：保存后立即检查 Vite 编译输出，确保无 PARSE_ERROR / 类型错误
4. **功能变更时同步 PRD**（纯样式/文案/Mock 跳过）：
   - 单版本：更新 `prd.md` §4 对应 FR-X 段落
   - 多版本：更新 `prd_v2.md`（当前版本
   - 需要标注时：FEATURE_LABELS → FEATURE_DOCS → `<NewTag />` inline 紧贴标题
   - ❌ 不强制创建新版本（v3.tsx），直接改当前版本

#### Mode D 小修改判定标准（满足任意一条走 D）

| 类型 | 示例 | Mode D |
|------|------|--------|
| 样式微调 | 改颜色/间距/字体/圆角/对齐 | ✅ |
| 文案修改 | 改按钮文字/标题/placeholder/提示 | ✅ |
| 单个功能点 | 新增 1-2 个小功能（筛选条件/操作列） | ✅ |
| 交互细节 | 改弹窗结构/表单字段顺序/表格列顺序 | ✅ |
| 布局局部重排 | 页面内区块上下左右移动，不改层级 | ✅ |
| Mock 数据 | 增删 Mock 条目/改字段值 | ✅ |
| 信息架构调整 | 改导航/页面拆分/路由变更 | ❌ 走 C |
| ≥3 功能点 + ≥2 修改 | 大版本改造 | ❌ 走 C |
| 从零新建页面 | 全新功能模块 | ❌ 走 A |

#### Mode D → C 切换条件

修改过程中发现实际超出小修改范围，**立即停下并告知用户**：
> "当前修改已超出小修改范围，涉及 XX 个功能点 + XX 修改，建议切换到 Mode C（混合模式）：创建新版本 + 完整 PRD 更新 + Changelog，是否继续？"

#### Mode D 高频反模式（严禁）

- ❌ 已有原型，一上来就写 需求清单.md / 需求分析.md / 方案设计.md（直接改代码）
- ❌ 已有原型，每次都做 2-3 个候选方案让用户选（用户要的是快速改完）
- ❌ 改一个按钮颜色也强制创建新版本 v3.tsx（直接改 v2 当前版本）
- ❌ 小修改也强制走 A1-A5 全流程确认（直接改完交付）
- ❌ 修改过程中擅自重构周边代码（最小改动原则）

详见 [design-workflow.md Mode D](./design-workflow.md#模式-d增量修改日常小步迭代)

---

### R7.1 Mode A/B/C 补充规范

Mode A/B/C 是完整工作流（非日常高频），关键节点都有**人工确认**环节，AI 不得跳过：
- A1 需求清单 → 人工确认
- A3 方案设计 → 人工选择候选方案
- A4 设计风格 → 人工确认
- A5/B5 PRD → 人工确认
- C3 改造方案 → 人工确认
- C5 PRD → 人工确认

详见 [design-workflow.md](./design-workflow.md)

---

## 执行 Checklist

### 模式判定（任何任务第一步必做）

- [ ] **R7 第一动作**：已判定走 Mode A/B/C/D 哪一种，未默认进入 Mode A
- [ ] 走 Mode D（增量修改）→ 跳过 需求清单/需求分析/方案设计 等完整流程
- [ ] 走 Mode A/B/C → 按对应流程执行人工确认环节

### Mode D 增量修改自检（走 D 时必做）

- [ ] 已确认页面已存在（index.tsx / v2.tsx）
- [ ] 符合小修改判定标准（样式/文案/≤2功能点/局部布局）
- [ ] 代码修改最小化，未重构周边未涉及代码
- [ ] Vite 编译通过（无 PARSE_ERROR / 类型错误）
- [ ] 功能变更时 PRD 对应段落已更新（纯样式/文案跳过）
- [ ] 功能变更时 FEATURE_LABELS / FEATURE_DOCS / NewTag 1:1 对应
- [ ] 未强制创建新版本 v3.tsx（直接改当前版本）

### 通用红线自检（所有模式必做）

- [ ] **R1**：未修改 `src/host/` 下任何文件
- [ ] **R1**：平台级 UI 定义在原型页面 `_shared.tsx` 中
- [ ] **R2**：未跨项目参考其他原型代码
- [ ] **R3**：JSX 标签开闭配对，Vite 编译无 `PARSE_ERROR`
- [ ] **R4**：调用 vision-mcp 前已检查服务状态
- [ ] **R5**：布局相关修改前已执行经验召回
- [ ] **R5.5**：有分量的方案（调研选型/方向性改动）已先落 `docs/<项目>/方案纪要.md` 再实施
- [ ] **R6**：页面目录是两级 `src/pages/<Module>/<Page>/`（一级目录会导致路由匹配失败）
- [ ] **R6**：完整应用只有1个 `meta.json`（子模块不带 `meta.json`，用内部状态切换）
- [ ] **R6**：代码符合目录约定、样式系统、布局适配规范
- [ ] **R6**：PlatformShell 根用 `h-[calc(100vh-68px)]`，顶栏 `shrink-0`、内容区内部滚动（高度链）
- [ ] **R6**：AI Agent 类应用遵循分层（Skill 不绑模型，Agent 绑模型）
- [ ] 所有模式：未触及 R1-R5 任何一条红线

---

## 规则文件索引

| 文件 | 用途 |
|------|------|
| **`agent-rules.md`**（本文件） | Agent 行为红线，最高优先级 |
| [`page-generator.md`](./page-generator.md) | 代码生成规范（目录、导出、样式、PRD 内嵌） |
| [`design-workflow.md`](./design-workflow.md) | 设计工作流（正向/逆向/混合三种模式） |
| [`templates.md`](./templates.md) | 代码模板（extractSection、DocPanel、NewTag） |
| [`vision-bridge.md`](./vision-bridge.md) | 视觉桥接 Skill 详细说明 |

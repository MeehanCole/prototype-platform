# 设计工作流 (Design Workflow Rules)

本规则定义三种 AI 设计工作流的完整流程，供任何 AI 工具参考。

> **顶层定位：平台是唯一输出基线，Figma / Axure / 截图 / PRD 只是输入源。**
> 输入源（Figma 设计稿、Axure 导出、截图、PRD 文档、口头描述）经三种模式统一转换为平台原生 React 代码 + PRD + Git 版本后交付。iframe 嵌入仅用于快速预览，不作为交付基线。

---

## 模式 A：正向设计（从需求到原型）

**起点**：文字需求 / 功能描述
**终点**：可交互原型 + PRD 文档
**AI 价值**：创意生成 + 规范对齐 + 文档自动化

### 流程

#### A1 需求输入
- 从用户的文字描述中提取：业务目标、核心功能、用户角色、技术约束
- 追问缺失信息（引导式）：
  - 目标用户是谁？
  - 关键场景有哪些？
  - 与现有产品的关系？
  - 技术栈和设计系统？
- **产物**：`_workflow/requirement.md`（需求清单）

#### A2 需求分析
- 竞品分析（如适用）
- 功能拆解（按模块/页面/组件分层）
- 信息架构初步设计
- **产物**：`_workflow/analysis.md`（分析报告）

#### A3 方案设计
- 输出交互方案和视觉方案
- 标注设计系统预设
- 方案对比（如有多个方向）
- **产物**：`_workflow/solutions.md`（方案对比）、`_workflow/decision.md`（决策记录）

#### A4 原型生成
- 选择或匹配设计系统预设
- 按 [page-generator.md](./page-generator.md) 生成规范代码
- 注册到平台路由
- **产物**：`src/pages/<Module>/<Page>/index.tsx`

#### A5 PRD 文档
- 整合需求 + 方案 + 原型，输出完整 PRD
- 包含 Business Context、FR 段落、交互流程、边界情况
- **产物**：`prd.md`

---

## 模式 B：逆向设计（从现有产品到原型）

**起点**：截图 / 录屏 / 现有产品 URL
**终点**：可交互原型 + PRD 文档
**AI 价值**：视觉还原 + 交互推断 + 文档反向生成

### 流程

#### B1 输入采集
- 用户提供截图、Figma 链接、或 Figma 代码工程
- Figma 链接：通过 MCP 工具（`get_figma_data` + `download_figma_images`）读取设计稿节点数据 + 下载页面截图
- Figma 代码工程：插件导出的 zip/目录，放入 `01-raw/` 走适配管线
- 截图：AI 视觉识别 UI 结构、组件、颜色、字体、间距
- 输出结构化 UI 描述（组件树 + 样式 token）
- **可仅生成 PRD 不生成代码**（Figma 链接 → MCP 读取 → 直接输出标准 PRD）

> **Vision Bridge（视觉桥接降级方案）**
>
> 当当前模型**不支持多模态**（如 DeepSeek）时，通过 `vision-bridge` Skill + `vision-mcp` MCP Server 自动降级处理图片：
> - **触发条件**：Skill 检测到用户提供了图片路径（文本形式如 `src/assets/screenshot.png`）或关键词（"截图"、"设计稿"、"图片"），且当前模型不支持多模态
> - **工作原理**：图片以文件路径形式传递 → Skill 调用 `vision-mcp` 工具 → MCP Server 内部转发给多模态 API（默认 OpenAI GPT-4o，密钥通过环境变量 `OPENAI_API_KEY` 配置）→ 返回结构化 JSON → 当前模型基于 JSON 继续工作
> - **透明性**：若当前模型已支持多模态（如 GPT-4o / Claude Vision），Skill 自动跳过桥接，直接由模型处理图片，不额外消耗 API 调用
> - **适用场景**：B1 截图结构识别、B2 设计系统匹配、B5 反向 PRD 推断、C5 标注点定位等所有涉及图片视觉识别的环节
> - **工具列表**（详见 `mcp-servers/vision-mcp/`）：
>   - `analyze_ui_structure`：截图 → 组件树 + 布局结构 JSON
>   - `match_design_system`：截图 → 匹配预设 + token 值 JSON
>   - `infer_prd_from_screenshot`：截图 → 功能需求 + 实体 + 边界 JSON
>   - `cluster_screenshots`：多截图 → 页面分组 + 精度分级 JSON
>   - `locate_annotations`：原型截图 → 标注点坐标 + 选择器 JSON
>   - `diff_versions`：V1/V2 截图 → 差异区域 + 变更类型 JSON

#### B2 视觉还原
- 匹配设计系统预设（用户提供或 AI 推断）
- 按规范生成可交互原型代码
- 还原视觉（85%+ 像素精度）和基本交互

#### B3 规范适配
- 将 AI 生成的代码适配到原型平台规范
- 修正组件映射、设计 token、命名约定
- 确保符合 [page-generator.md](./page-generator.md) 所有规则

> **Figma 代码工程的适配策略（与 AI 生成代码不同）**
>
> 当输入源是 **Figma 插件导出的代码工程**（非 AI 生成），B3 的适配策略为**最小改动**，保留 Figma 原始设计风格：
> - **参考源是 Figma 原始代码**，不是平台 CSS 变量。不要查看平台项目的 CSS/颜色后去映射
> - **保留**：inline style、原始颜色值（`#1890ff` 等）、内联 SVG 图标、Tailwind 类名、组件结构
> - **仅改**：`React.ReactNode` → `ReactNode`（type-only import）、`React.useState` → `useState`、`height: "100vh"` → `minHeight: "100vh"`
> - **禁止**：颜色映射为 token、SVG 替换为 lucide-react、引入 cn()/clsx、重构组件逻辑
> - 详见 [page-generator.md](./page-generator.md) § 4.0 Figma 代码转换的样式保留原则
>
> 对比：**AI 生成代码**（模式 A）必须使用平台 token、禁止 inline style；**Figma 转换代码**（模式 B）保留原始设计，仅做技术适配

#### B4 平台接入
- 自动注册路由、导航、标题
- 确保版本切换、缩放、Mock 数据正常

#### B5 反向 PRD
- 基于还原的原型，反向推断产品需求
- 补充：业务规则、权限、交互细节、边界情况
- 生成完整 PRD

---

## 模式 C：混合模式（改造现有产品）

**起点**：已有产品（截图/代码）+ 新需求
**终点**：改造后的原型 + 完整 PRD + 功能点内嵌文档
**AI 价值**：上下文还原 + 需求叠加 + 改造生成

### 流程

#### C1 现有产品还原（= B1-B4）
按模式 B 还原现有界面，建立"上下文基线"。
**产物**：现有界面原型（作为改造基准，存为 `_versions/v1.tsx`）

#### C2 新需求分析（= A1-A2）
按模式 A 分析新需求，明确改造目标。
**产物**：`_workflow/requirement.md` + `_workflow/analysis.md`

#### C3 改造方案设计
**输入物**：现有原型 + 新需求分析
**AI 任务**：设计改造方案，标注"改哪里、为什么改、改完什么样"
**产物**：`_workflow/solutions.md`（改造方案）

改造类型：
- **重构 (A)**：信息架构/交互逻辑的结构性调整，标注 `A.01`、`A.02`...
- **新增 (B)**：在现有界面增加新模块/功能，标注 `B.01`、`B.02`...
- **修改 (M)**：调整现有功能的交互/视觉/逻辑，标注 `M.01`、`M.02`...
- **删除 (R)**：移除不再需要的功能，标注 `R.01`、`R.02`...

⚠️ **人工决策点**：改造方案需确认，尤其是"删除"和"重构"类型。

#### C4 原型改造
**输入物**：现有原型代码 + 改造方案
**AI 任务**：基于现有代码生成改造后的新版本，保留原版作对比
**产物**：
- `_versions/v1.tsx`（保留旧版本，可 A/B 对比）
- `_versions/v2.tsx`（改造后的新版本）

#### C5 完整 PRD + 功能点内嵌（Mode C 核心步骤）

**5.1 生成 PRD**
- 输出 `prd_v1.md`（旧版简要描述）
- 输出 `prd_v2.md`（新版完整 PRD）
- PRD 结构：
  - Business Context（目标产品、技术栈、设计系统）
  - Feature Overview（功能概览）
  - 功能需求详单（FR-X 标记，每个功能需求一个 `**FR-X`）
  - Interaction Flow（交互流程）
  - Edge Cases（边界情况）

**5.2 PRD 段落标记**（硬约束）
在 `prd_v2.md` 中为每个功能需求加 `**FR-X` 标记：
```markdown
**FR-1 视角切换（Restructure, 顶层 Tab 必做）**
| 项目 | 说明 |
|---|---|
| 描述 | 页面最顶部显示「个人视角」/「团队视角」切换 Tab |
| 业务规则 | 1) 普通员工=只显示个人视角 |

**FR-2 团队视角：部门/成员筛选（Modify）**
...
```

**5.3 代码内嵌**（硬约束）
在 `v2.tsx` 中：
- `import prdV2Raw from '../prd_v2.md?raw'`
- `extractSection` 函数按 FR 段落提取
- `FEATURE_DOCS` 映射表（key 与 `FEATURE_LABELS` 1:1）
- `DocPanel` 组件（用 `createPortal` 渲染到 `document.body`）
- 功能点标注为胶囊形「说明」按钮
  - 蓝色可点击 → 弹出 DocPanel 展示完整 PRD
  - 灰色仅 tooltip → 无 PRD 详情

**5.4 测试验收 Changelog**
生成 `_workflow/c5_v1_vs_v2_changelog.md`，结构：
1. 对比概览（改动统计、重点说明、测试范围）
2. 重构项 (A)
3. 新增项 (B)
4. 修改项 (M)
5. 删除项 (R)
6. 测试 checklist（逐项验收）

编号规则：Changelog 编号 = FEATURE_LABELS key = 原型按钮编号

**测试流程**：
1. 打开「显示新增功能点」开关（Header 右侧）
2. 逐个点击「说明」按钮
3. 对照 Changelog 文档验收
4. 点击文档图标 📄 查看完整 PRD 描述

---

## 版本管理规范

### 版本创建时机

| 场景 | 是否创建新版本 |
|------|--------------|
| 视觉微调（颜色、间距、字体） | 否，直接修改当前版本 |
| 文案修改 | 否，直接修改当前版本 |
| 新增单个功能点 | 否，累积到当前版本 |
| 新增 ≥3 个功能点 + 修改 ≥2 个 | 考虑创建新版本 |
| 信息架构调整（Tab、导航、布局） | 是，创建新版本 |
| 业务规则重大变更 | 是，创建新版本 |
| 跨模块改造 | 是，创建新版本 |

### 版本命名

- 版本标识符必须用整数递增：`v1`、`v2`、`v3`...
- 禁止 `v2.1`、`v2-lite` 等命名
- 每个版本对应一个 `prd_vX.md` 和 `_versions/vX.tsx`

### 版本对比

- 保留所有历史版本
- Header 左下角版本切换器支持 A/B 对比
- 切换版本时强制 remount，状态按「路由+版本」隔离
- localStorage key 格式：`<route>__v<X>_show`

---

## 产物目录结构

```
src/pages/<Module>/<Page>/
  ├── index.tsx              # 原型代码（重导出默认版本）
  ├── meta.json              # 页面元数据
  ├── prd.md                 # 最终 PRD（单版本模式）
  ├── prd_v1.md              # 多版本 PRD
  ├── prd_v2.md              # 多版本 PRD（含 **FR-X 标记）
  ├── _versions/             # 多版本原型
  │   ├── v1.tsx             # 含完整页面代码
  │   └── v2.tsx             # 含 ?raw 导入 + FEATURE_DOCS + DocPanel
  └── _workflow/             # 工作流产物（可选，不参与路由）
      ├── requirement.md     # A1 需求清单
      ├── analysis.md        # A2 分析报告
      ├── solutions.md       # A3 方案对比 / C3 改造方案
      ├── decision.md        # 方案决策记录
      └── c5_v1_vs_v2_changelog.md  # C5 测试验收 Changelog
```

---

## 三种模式对比

| 维度 | 模式 A（正向） | 模式 B（逆向） | 模式 C（混合） |
|------|---------------|---------------|---------------|
| 起点 | 文字需求 | 截图/URL | 现有产品+需求 |
| AI 角色 | 设计师 | 还原师 | 改造师 |
| 核心价值 | 创意生成 | 视觉还原 | 上下文+迭代 |
| 适用场景 | 全新产品 | 竞品分析 | 版本迭代 |
| 产物 | 原型+PRD | 原型+PRD | 原型×N+PRD×N+内嵌 |
| 版本管理 | 单版本 | 单版本 | 多版本 A/B 对比 |
| 功能点内嵌 | 可选 | 可选 | 必选 |

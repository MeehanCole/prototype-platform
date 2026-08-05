# Vision Bridge Skill

## Description

视觉桥接降级方案：当当前模型不支持多模态（如 DeepSeek）时，自动通过 vision-mcp MCP Server 转发图片给多模态 API（默认 OpenAI GPT-4o），返回结构化 JSON 供当前模型继续工作。若当前模型已支持多模态，则自动跳过桥接。

## When To Use

- 用户提供了图片路径（文本形式如 `src/assets/screenshot.png`、`/Users/.../screenshot.png`）
- 用户提到"截图"、"设计稿"、"图片"、"界面"、"原型截图"等关键词，且需要视觉分析
- 当前模型不支持多模态图片输入（如 DeepSeek 系列模型）
- 以下工作流阶段需要图片视觉识别：
  - B1 输入采集：截图 → UI 结构识别
  - B2 视觉还原：截图 → 设计系统匹配
  - B5 反向 PRD：截图 → 功能需求推断
  - B1 批量处理：多截图 → 聚类分组
  - C3-C4 改造方案：V1/V2 截图 → 差异对比
  - C5 验收交付：原型截图 → 标注点定位

## Rules

### 1. 模型能力检测（第一步）

在处理任何图片相关请求前，先判断当前模型是否支持多模态：

- **支持多模态**（GPT-4o / Claude Vision / Gemini 等）：直接处理图片，跳过 vision-mcp 桥接，不额外消耗 API 调用
- **不支持多模态**（DeepSeek / 纯文本模型）：走 vision-mcp 桥接流程

### 2. 场景路由规则

根据当前工作流阶段，自动选择对应的 vision-mcp 工具：

| 工作流阶段 | 触发条件 | 调用工具 |
|-----------|---------|---------|
| B1 单张截图 | 用户提供 1 张截图路径 | `analyze_ui_structure` |
| B1 多截图(≥5张) | 用户提供 ≥5 张截图路径 | `cluster_screenshots` |
| B2 视觉还原 | 需要匹配设计系统预设 | `match_design_system` |
| B5 反向 PRD | 需要从截图推断功能需求 | `infer_prd_from_screenshot` |
| C3-C4 改造 | 需要对比 V1/V2 版本差异 | `diff_versions` |
| C5 验收 | 需要定位功能点标注位置 | `locate_annotations` |

### 3. 图片路径处理

- 图片必须以**文件路径**形式提供（非粘贴到对话框）
- 支持的格式：PNG、JPG、JPEG、GIF、WebP、BMP
- 多张截图用逗号分隔或数组形式提供
- 路径可以是绝对路径或相对项目根目录的路径

### 4. 返回数据处理

- vision-mcp 返回的是结构化 JSON
- 当前模型（如 DeepSeek）基于 JSON 结果继续生成代码 / PRD / Changelog
- 如果返回结果不完整或有误，可以追加提示让 vision-mcp 重新分析

### 5. 透明性原则

- 对用户透明：用户不需要关心是直接处理还是通过桥接
- 若模型支持多模态，不要调用 vision-mcp（避免不必要的 API 消耗）
- 若模型不支持多模态，在调用 vision-mcp 前简要告知用户"正在通过视觉桥接分析截图..."

### 6. 前置条件

使用本 Skill 需要：
1. 已安装 vision-mcp MCP Server（位于 `mcp-servers/vision-mcp/`）
2. 已配置环境变量 `OPENAI_API_KEY`
3. 可选配置 `OPENAI_BASE_URL`（自定义 API 端点）、`VISION_MODEL`（默认 gpt-4o）

### 7. 错误处理

- 如果 `OPENAI_API_KEY` 未配置：提示用户在 MCP 配置中添加密钥
- 如果图片路径不存在：提示用户检查路径
- 如果 API 调用失败：显示错误信息，建议检查密钥/网络/额度

## Workflow

```
用户请求（含图片路径/关键词）
    ↓
Step 1: 检测当前模型是否支持多模态
    ├─ 支持 → 直接处理图片，结束
    └─ 不支持 → 继续 Step 2
    ↓
Step 2: 根据工作流上下文判断场景
    ↓
Step 3: 调用对应 vision-mcp 工具
    ↓
Step 4: 获取结构化 JSON 结果
    ↓
Step 5: 基于 JSON 继续生成代码/PRD/Changelog
```

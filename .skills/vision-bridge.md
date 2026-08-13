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
2. 已配置环境变量 `OPENAI_API_KEY`（**本地 llama.cpp 场景可填任意非空值**，代码有空值检查）
3. 可选配置 `OPENAI_BASE_URL`（自定义 API 端点）、`VISION_MODEL`（默认 gpt-4o）
4. 部署方式见下方「8. MCP 部署与配置（本地 llama.cpp）」

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

## 8. MCP 部署与配置（本地 llama.cpp）

vision-mcp 通过 OpenAI 兼容的 `/v1/chat/completions` 接口转发图片（base64 `image_url`）。因此可对接**任何 OpenAI 兼容端点**：云端 API（OpenAI / 魔搭 / 硅基流动）或**本地 llama.cpp**。

### 8.1 MCP 服务器配置（.mcp.json）

```json
{
  "mcpServers": {
    "vision-mcp-llamacpp": {
      "command": "node",
      "args": ["<绝对路径>/mcp-servers/vision-mcp/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-local",
        "OPENAI_BASE_URL": "http://localhost:8080/v1",
        "VISION_MODEL": "Qwen3-VL-8B-Instruct"
      }
    }
  }
}
```

**要点**：
- `OPENAI_API_KEY` 本地场景**不能留空**（代码有空值检查），llama.cpp 不校验，填任意非空值
- `OPENAI_BASE_URL` 指向 llama-server 地址（默认端口 8080，改端口需同步）
- `VISION_MODEL` 填实际模型名（llama.cpp 不校验，仅用于日志）

### 8.2 模型选型（基于 2080 Ti 22GB 实测）

| 模型 | 定位 | 评价 |
|------|------|------|
| **Qwen3-VL-8B** ⭐ | 首选（2025-09） | 新一代视觉标杆，OCR/UI/文档理解大幅超越 2.5 代，8B Q8_0 仅 ~8GB |
| Gemma 4 12B | 备选（2026 初） | **原生多模态**（encoder-free，无需 mmproj），16GB 显存可跑，测试通过但小字识别略弱 |

**⚠️ 不要用**：Qwen2.5-VL（已过时，密集小字/表格串列明显）、Gemma 4 纯文本误判（Gemma 4 12B 实际是原生多模态，可放心用于视觉）。

**魔搭下载**：
```bash
pip install modelscope
modelscope download --model Qwen/Qwen3-VL-8B-Instruct-GGUF --local_dir ./Qwen3-VL-8B-GGUF
```

### 8.3 llama.cpp 版本要求

Qwen3-VL 需要 **llama.cpp ≥ b6907**（官方明确要求最新版）。旧版本不识别 mmproj 或报错。升级：

```bash
git clone https://github.com/ggml-org/llama.cpp && cd llama.cpp
cmake -B build -DGGML_CUDA=ON && cmake --build build --config Release -j
```

### 8.4 精度组合与启动命令

**推荐组合：主模型 Q8_0 + mmproj F16**（质量≈FP16，体积一半，速度比 FP16 快）：

```bash
llama-server \
  -m Qwen3-VL-8B-Instruct-Q8_0.gguf \
  --mmproj mmproj-Qwen3-VL-8B-Instruct-F16.gguf \
  --port 8080 \
  -c 16384
```

### 8.5 硬件注意事项（2080 Ti / Turing）

- **FP16**：✅ 支持（Turing Tensor Core）
- **BF16**：❌ 不支持（需 Ampere 30 系+）→ 不要选 BF16 量化/精度文件
- **FP16 主模型不推荐**：Turing FP16 是 1:1 速率（非 2 倍），8B FP16 ≈ 16GB 挤占 KV cache，速度慢
- 显存预算（22GB）：Q8_0 主模型 8GB + mmproj 2GB + 16K KV cache 8GB ≈ 18GB，余量充足

### 8.6 各工具输出质量评估

> 以下结论基于 **Qwen3-VL-8B（Q8_0+F16）本地实测**。旧模型（Qwen2.5-VL / Gemma 4 12B）表格小字串列问题明显，换 Qwen3-VL 后已解决。

| 工具 | 可信度 | 使用方式 |
|------|--------|---------|
| `analyze_ui_structure` | ✅ 直接可用 | 布局/组件树准确；**表格四列对应正确、长 URL 完整提取**，重点字段核对即可 |
| `diff_versions` | ✅ 直接可用 | 区域级对比最可靠（A/B/M/R 分类+坐标） |
| `locate_annotations` | ✅ 定位语义可用 | **selector 是猜测类名，需人工映射到真实组件** |
| `infer_prd_from_screenshot` | ✅ 半自动 | 8 个功能点/字段/边界提取完整，可作初稿，**以图为准、提示词仅辅助** |
| `match_design_system` | ⚠️ 仅参考预设名 | **色值 token 不可信**（可能是模型背的预设值） |
| `cluster_screenshots` | ⚠️ 需复核 | 分组思路正确，但计数可能错误（如 6 张报 7），需核对编号 |

**通用结论**：结构类任务（布局/对比/定位）可信任；文本提取类任务（表格/字段）重点字段核对；色值类结果仅参考。截图建议高分屏截图（deviceScaleFactor 2x）提升小字识别率。

### 8.7 常见问题与排查

**1. 输出 JSON 被截断（max_tokens=4096 限制）**
- vision-mcp 硬编码 `max_tokens: 4096`（`index.js` callVisionAPI）。`cluster_screenshots`（6+ 图）、`infer_prd_from_screenshot`（多 FR）等大输出场景可能被截断 → `extractJSON` 解析失败报错
- 处理：分页分析或换更精简 prompt；必要时修改 `index.js` 的 max_tokens 并重启 MCP

**2. 服务健康检查**
```bash
curl http://localhost:8080/v1/models   # 确认 llama-server 活着且模型正确
curl -X POST http://localhost:8080/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"Qwen3-VL-8B-Instruct","messages":[{"role":"user","content":"hi"}]}'  # 冒烟测试
```

**3. 切换模型后的重启流程**
1. 停掉旧 llama-server（换 `-m`/`--mmproj` 后重启）
2. 确认 `/v1/models` 返回新模型
3. **重启 vision-mcp**（MCP 配置里的 `VISION_MODEL` 如未变可不改，llama.cpp 不校验）
4. 重跑一次 `analyze_ui_structure` 冒烟验证

**4. 多图 token 预算（22GB 显存）**
- `cluster_screenshots` 一次传 6 张图，每张 ~1000-2000 tokens（detail=high）+ 上下文 KV
- 22GB 下 `-c 16384` 足够 6 图 + 输出；超过 8 图建议分两批调用
- 显存告急时降 `-c 8192` 或主模型降回 Q4_K_M

**5. 图片路径不存在**
- vision-mcp 用 `readFileSync` 读取，路径错误会抛异常，返回 `错误：...`。传参前先用工具确认路径存在

**6. 首次调用超时**
- 本地 llama-server 首次请求需加载/预处理，可能较慢。工具调用超时可重试一次；`cluster_screenshots` 大图多时耗时可到分钟级

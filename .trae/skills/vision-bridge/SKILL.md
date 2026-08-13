---
name: "vision-bridge"
description: "视觉桥接降级方案：当当前模型不支持多模态（如 DeepSeek）时，自动通过 vision-mcp MCP Server 转发图片给多模态 API，返回结构化 JSON。若当前模型已支持多模态，则自动跳过。Invoke when user provides image paths or mentions screenshots/designs that need visual analysis, and the current model does not support multimodal image input."
---

# Vision Bridge Skill

## Canonical Rules

**This skill's canonical rules live in the project-level `.skills/` directory.** Read this file first:

1. **`.skills/vision-bridge.md`** — Full vision bridge workflow rules (model capability detection, scene routing, image path handling, transparency principle, error handling)

## When to Invoke

- 用户提供了图片路径（文本形式如 `src/assets/screenshot.png`）且当前模型不支持多模态
- 用户提到"截图"、"设计稿"、"图片"、"界面"等关键词，需要视觉分析
- 模式 B1/B2/B5 中截图视觉识别环节
- 模式 C3-C4/C5 中版本差异对比或标注点定位环节

## Prerequisites

- vision-mcp MCP Server 已安装并注册（位于 `mcp-servers/vision-mcp/`）
- 环境变量 `OPENAI_API_KEY` 已配置（本地 llama.cpp 场景填任意非空值）
- 本地部署方式、模型选型（Qwen3-VL-8B 推荐）、llama.cpp 版本要求（≥ b6907）与工具质量评估，详见 `.skills/vision-bridge.md` §8「MCP 部署与配置（本地 llama.cpp）」

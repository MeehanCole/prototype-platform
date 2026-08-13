#!/usr/bin/env node

/**
 * Vision Bridge MCP Server
 *
 * 为不支持多模态的模型（如 DeepSeek）提供视觉识别降级方案。
 * 当当前模型无法处理图片时，通过本 MCP Server 转发给多模态 API（默认 OpenAI GPT-4o），
 * 返回结构化 JSON 供当前模型继续工作。
 *
 * 环境变量：
 *   OPENAI_API_KEY  - OpenAI API 密钥（必需）
 *   OPENAI_BASE_URL - 自定义 API 端点（可选，默认 https://api.openai.com/v1）
 *   VISION_MODEL    - 使用的多模态模型（可选，默认 gpt-4o）
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { extname, resolve } from "path";

const API_KEY = process.env.OPENAI_API_KEY || "";
const BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const MODEL = process.env.VISION_MODEL || "gpt-4o";
// 不同模型 max_tokens 上限不同（如智谱 glm-4v-flash 上限 1024），可通过环境变量覆盖
const MAX_TOKENS = Number(process.env.MAX_TOKENS) || 4096;

// 6 个场景的 system prompt 定义
const SCENE_PROMPTS = {
  analyze_ui_structure: `你是一个专业的 UI 结构分析专家。请分析截图中的页面结构，返回严格的 JSON 格式。
要求：
1. 识别整体布局类型（sidebar-layout / top-nav-layout / fullscreen 等）
2. 提取 header / sidebar / content 的尺寸和背景色
3. 识别所有组件，构建 componentTree（组件树）
4. 每个组件包含 type、props、children
5. 识别表格列、表单字段、按钮、模态框等关键交互元素
6. 颜色使用十六进制，尺寸使用 px

返回 JSON 格式：
{
  "layout": { "type": "string", "header": {}, "sidebar": {}, "content": {} },
  "componentTree": [{ "type": "string", "props": {}, "children": [] }]
}`,

  match_design_system: `你是一个设计系统匹配专家。请分析截图，匹配以下 5 个预设之一：
- Prototype Default: 简洁现代，中性灰 + 蓝色强调
- Element Plus: #409EFF 主色, 4px 圆角, 14px 基准字号
- Ant Design 5.x: #1677FF 主色, 6px 圆角, 14px 基准字号
- Arco Design: #165DFF 主色, 4px 圆角, 14px 基准字号
- Naive UI: #18a058 主色, 3px 圆角, 14px 基准字号

返回 JSON 格式：
{
  "matchedPreset": "string",
  "confidence": 0.0-1.0,
  "tokens": {
    "primaryColor": "#hex",
    "successColor": "#hex",
    "warningColor": "#hex",
    "dangerColor": "#hex",
    "borderRadius": { "base": "string", "small": "string", "large": "string" },
    "fontSize": { "base": "string", "small": "string", "large": "string", "title": "string" },
    "spacing": { "base": "string", "compact": "string", "loose": "string" },
    "borderColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": { "primary": "#hex", "regular": "#hex", "placeholder": "#hex" }
  },
  "deviations": [{ "token": "string", "value": "string", "reason": "string" }]
}`,

  infer_prd_from_screenshot: `你是一个产品需求分析专家。请从截图中反向推断产品需求，返回严格的 JSON 格式。
要求：
1. 识别页面名称和所属模块
2. 提取所有功能点（FR-X 编号），包含类型（filter/list/form/modal/action）
3. 识别数据实体和关键字段
4. 推断交互流程和边界情况
5. 每个功能点包含 title、type、fields、interaction、validation（如适用）

返回 JSON 格式：
{
  "pageName": "string",
  "module": "string",
  "featurePoints": [
    { "frId": "FR-01", "title": "string", "type": "filter|list|form|modal|action", "fields": [], "interaction": "string", "validation": "string" }
  ],
  "entities": [{ "name": "string", "fields": [] }],
  "edgeCases": ["string"],
  "interactions": ["string"]
}`,

  cluster_screenshots: `你是一个截图分组专家。请分析提供的多张截图，将它们按页面归属进行分组。
要求：
1. 弹窗/筛选/空态合并到对应的主页面
2. 每个页面标注精度等级（P0=必须高保真, P1=中等保真, P2=简单示意）
3. 输出页面间的导航关系
4. 合并理由需说明

返回 JSON 格式：
{
  "totalScreenshots": number,
  "pages": [
    { "pageId": "string", "pageName": "string", "precision": "P0|P1|P2", "screenshots": [], "mergeReason": "string", "components": [] }
  ],
  "navigationFlow": { "entry": "string", "relations": [{ "from": "string", "to": "string", "trigger": "string" }] },
  "precisionSummary": { "P0": [], "P1": [], "P2": [] }
}`,

  locate_annotations: `你是一个原型标注专家。请分析原型截图，识别需要添加功能点角标的位置。
要求：
1. 每个标注点包含 labelId（如 B.01）、title、type（new/modify/restructure/delete）
2. 提供 CSS 选择器用于定位父容器
3. 角标定位在父容器的右上角
4. 描述每个功能点的变更说明

返回 JSON 格式：
{
  "annotations": [
    { "labelId": "string", "title": "string", "type": "new|modify|restructure|delete", "selector": "string", "position": { "anchor": "top-right", "parent": "string" }, "description": "string" }
  ]
}`,

  diff_versions: `你是一个版本对比专家。请对比 V1 和 V2 两张截图，识别所有差异区域。
要求：
1. 每个差异标注区域坐标（x, y, w, h）和标签
2. 变更类型：A(重构) / B(新增) / M(修改) / R(删除)
3. 分别描述 V1 和 V2 的状态
4. 说明影响范围
5. 统计各类型变更数量

返回 JSON 格式：
{
  "diffs": [
    { "area": { "x": 0, "y": 0, "w": 0, "h": 0, "label": "string" }, "changeType": "A|B|M|R", "labelId": "string", "title": "string", "v1Description": "string", "v2Description": "string", "impact": "string" }
  ],
  "statistics": { "A": 0, "B": 0, "M": 0, "R": 0, "total": 0 }
}`,
};

/**
 * 将图片文件转为 base64 data URL
 */
function imageToBase64(filePath) {
  const absPath = resolve(filePath);
  const ext = extname(absPath).toLowerCase();
  const mimeMap = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
  };
  const mime = mimeMap[ext] || "image/png";
  const data = readFileSync(absPath, { encoding: "base64" });
  return `data:${mime};base64,${data}`;
}

/**
 * 调用多模态 API
 */
async function callVisionAPI(images, systemPrompt, userPrompt) {
  if (!API_KEY) {
    throw new Error(
      "OPENAI_API_KEY 环境变量未设置。请在 MCP 配置中添加该环境变量。"
    );
  }

  const content = [
    { type: "text", text: userPrompt || "请分析以下截图。" },
    ...images.map((img) => ({
      type: "image_url",
      image_url: { url: img, detail: "high" },
    })),
  ];

  // 兼容 BASE_URL 两种写法：已含 /chat/completions（完整端点）或仅根地址（如 https://xxx/v1）
  const url = BASE_URL.endsWith("/chat/completions")
    ? BASE_URL
    : `${BASE_URL.replace(/\/$/, "")}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 调用失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 从模型返回中提取 JSON（鲁棒版）
 */
function extractJSON(text) {
  // 1. 匹配 ```json ... ``` 或 ``` ... ``` 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // 落到兜底逻辑
    }
  }
  // 2. 兜底：截取第一个 { 到最后一个 } 之间的内容（兼容前后带说明文字/多余代码块）
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      // 落到直接解析
    }
  }
  // 3. 直接解析
  return JSON.parse(text.trim());
}

// 工具定义
const TOOLS = [
  {
    name: "analyze_ui_structure",
    description:
      "S1: 截图→UI结构识别。分析单张页面截图，提取组件树 + 布局结构 + 样式 token，返回结构化 JSON。适用于模式 B1 输入采集阶段。",
    inputSchema: {
      type: "object",
      properties: {
        imagePath: {
          type: "string",
          description: "截图文件的本地路径（绝对路径或相对路径）",
        },
        hint: {
          type: "string",
          description: "可选的分析提示，如页面名称或关注点",
        },
      },
      required: ["imagePath"],
    },
  },
  {
    name: "match_design_system",
    description:
      "S2: 截图→设计系统匹配。分析截图，匹配 5 个内置预设之一，输出精确 token 值。适用于模式 B2 视觉还原阶段。",
    inputSchema: {
      type: "object",
      properties: {
        imagePath: {
          type: "string",
          description: "截图文件的本地路径",
        },
        preferredPreset: {
          type: "string",
          description: "可选：用户指定的偏好预设名称",
        },
      },
      required: ["imagePath"],
    },
  },
  {
    name: "infer_prd_from_screenshot",
    description:
      "S3: 截图→反向PRD推断。从截图反向推断功能需求、数据实体、交互流程和边界情况，返回结构化 JSON。适用于模式 B5 反向 PRD 阶段。",
    inputSchema: {
      type: "object",
      properties: {
        imagePath: {
          type: "string",
          description: "截图文件路径（支持多张，用逗号分隔）",
        },
        pageName: {
          type: "string",
          description: "可选：已知的页面名称",
        },
        module: {
          type: "string",
          description: "可选：所属模块名称",
        },
      },
      required: ["imagePath"],
    },
  },
  {
    name: "cluster_screenshots",
    description:
      "S4: 多截图聚类分组。当截图数量≥5张时，将截图按页面归属分组，标注精度等级（P0/P1/P2）和导航关系。适用于模式 B1 批量截图处理。",
    inputSchema: {
      type: "object",
      properties: {
        imagePaths: {
          type: "array",
          items: { type: "string" },
          description: "截图文件路径数组",
        },
        projectContext: {
          type: "string",
          description: "可选：项目上下文描述",
        },
      },
      required: ["imagePaths"],
    },
  },
  {
    name: "locate_annotations",
    description:
      "S5: 原型→标注点定位。分析原型页面截图，定位需要添加功能点角标的位置，返回选择器和坐标。适用于模式 C5 验收阶段。",
    inputSchema: {
      type: "object",
      properties: {
        imagePath: {
          type: "string",
          description: "原型页面截图路径",
        },
        featureList: {
          type: "string",
          description: "功能点列表（文本描述），用于辅助识别标注位置",
        },
      },
      required: ["imagePath"],
    },
  },
  {
    name: "diff_versions",
    description:
      "S6: 版本差异对比。对比 V1 和 V2 两张截图，识别差异区域和变更类型（A/B/M/R），生成变更清单。适用于模式 C3-C4 改造方案设计。",
    inputSchema: {
      type: "object",
      properties: {
        v1ImagePath: {
          type: "string",
          description: "V1 版本截图路径",
        },
        v2ImagePath: {
          type: "string",
          description: "V2 版本截图路径",
        },
      },
      required: ["v1ImagePath", "v2ImagePath"],
    },
  },
];

// 创建 MCP Server
const server = new Server(
  {
    name: "vision-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 注册工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// 注册工具调用处理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "analyze_ui_structure": {
        const imageData = imageToBase64(args.imagePath);
        const raw = await callVisionAPI(
          [imageData],
          SCENE_PROMPTS.analyze_ui_structure,
          args.hint
            ? `请分析这张截图的 UI 结构。额外关注：${args.hint}`
            : "请分析这张截图的 UI 结构。"
        );
        result = extractJSON(raw);
        break;
      }

      case "match_design_system": {
        const imageData = imageToBase64(args.imagePath);
        const raw = await callVisionAPI(
          [imageData],
          SCENE_PROMPTS.match_design_system,
          args.preferredPreset
            ? `用户偏好预设：${args.preferredPreset}，请优先匹配但需如实判断。`
            : "请分析这张截图并匹配最接近的设计系统预设。"
        );
        result = extractJSON(raw);
        break;
      }

      case "infer_prd_from_screenshot": {
        const paths = args.imagePath.split(",").map((s) => s.trim());
        const images = paths.map((p) => imageToBase64(p));
        const raw = await callVisionAPI(
          images,
          SCENE_PROMPTS.infer_prd_from_screenshot,
          args.pageName || args.module
            ? `页面名称：${args.pageName || "未知"}，模块：${args.module || "未知"}。请反向推断完整产品需求。`
            : "请从截图中反向推断产品需求。"
        );
        result = extractJSON(raw);
        break;
      }

      case "cluster_screenshots": {
        const images = args.imagePaths.map((p) => imageToBase64(p));
        const raw = await callVisionAPI(
          images,
          SCENE_PROMPTS.cluster_screenshots,
          args.projectContext
            ? `项目上下文：${args.projectContext}。请将截图按页面分组。`
            : `请将这 ${images.length} 张截图按页面分组。`
        );
        result = extractJSON(raw);
        break;
      }

      case "locate_annotations": {
        const imageData = imageToBase64(args.imagePath);
        const raw = await callVisionAPI(
          [imageData],
          SCENE_PROMPTS.locate_annotations,
          args.featureList
            ? `已知功能点列表：${args.featureList}。请定位每个功能点在页面中的标注位置。`
            : "请分析截图，识别需要添加功能点角标的位置。"
        );
        result = extractJSON(raw);
        break;
      }

      case "diff_versions": {
        const v1Image = imageToBase64(args.v1ImagePath);
        const v2Image = imageToBase64(args.v2ImagePath);
        const raw = await callVisionAPI(
          [v1Image, v2Image],
          SCENE_PROMPTS.diff_versions,
          "第一张图是 V1 版本，第二张图是 V2 版本。请对比差异。"
        );
        result = extractJSON(raw);
        break;
      }

      default:
        throw new Error(`未知工具：${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `错误：${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动 Server
const transport = new StdioServerTransport();
await server.connect(transport);

# Prototype Platform Rules

项目级 AI 代码生成规则，任何 IDE / Agent 均可读取。

## 规则文件索引

| 文件 | 用途 | 适用场景 |
|------|------|---------|
| [`page-generator.md`](./page-generator.md) | 代码生成规范（目录约定、默认导出、样式系统、PRD 内嵌） | 生成新页面、Figma 转码、截图还原 |
| [`design-workflow.md`](./design-workflow.md) | 设计工作流（正向/逆向/混合三种模式完整流程） | 需求分析、方案设计、版本迭代 |
| [`templates.md`](./templates.md) | 代码模板（extractSection、DocPanel、NewTag、Changelog） | Mode C 多版本改造的代码脚手架 |

## 跨 IDE / Agent 使用方式

### Trae IDE
Skill 已注册在 `.trae/skills/` 下，AI 会自动加载。

### Cursor / VS Code + Copilot / 其他 Agent
在项目根目录的对话中，引用 `.skills/` 下的规则文件：
```
请先阅读 .skills/page-generator.md 中的代码生成规范，
然后按规范为我生成一个 OA 审批中心页面。
```

### 纯手动参考
打开 `.skills/` 下对应的 `.md` 文件，按规范手工编写代码。

## 核心原则

1. **AI 来源无关**：规则只认产物规范，不关心代码由哪个 AI 工具生成
2. **生成时强制**：所有规范都是硬性约束，不是建议
3. **单一数据源**：`.skills/` 是规则唯一来源，`.trae/skills/` 只是 Trae 适配器

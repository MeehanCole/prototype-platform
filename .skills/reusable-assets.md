# 可复用素材 (Reusable Assets)

> 当某块 UI 已经"还原度很高、后面还要反复用"时，把它抽成素材，而不是在页面之间复制代码。
> 参考实现：[`src/lib/platform-shell/`](../src/lib/platform-shell/)（顶栏 + 侧栏），说明书 [`docs/PlatformShell/平台外壳素材.md`](../docs/PlatformShell/平台外壳素材.md)；[`src/lib/product-nav/`](../src/lib/product-nav/)（9 宫格产品导航面板），说明书 [`docs/ProductNav/产品导航面板.md`](../docs/ProductNav/产品导航面板.md)。

---

## 1. 什么时候该抽

满足**任意两条**再动手，避免为一次性页面造抽象：

- 同一块 UI 已在 **≥ 2 个页面**出现（或即将出现）；
- 该页面**还原度高、已定稿**，视觉不会再大改；
- 后续多个产品/需求要基于它做变体（换菜单、换品牌色、换文案）；
- 现在不抽，下一次一定会靠"复制粘贴 + 手改"来复用。

**不要抽**：还在改的交互、只出现一次的活动页、强耦合业务数据的模块。

## 2. 放哪里

| 素材类型 | 位置 | 说明 |
| --- | --- | --- |
| 跨产品/跨页面通用 UI | `src/lib/<name>/` | 唯一正确位置，页面直接 import |
| 某产品的完整外壳预设 | `src/lib/<name>/presets/<product>.tsx` | 只放配置，不放视觉实现 |
| 只在单页内部复用 | 该页 `_shared.tsx` | 不升级为公共素材 |
| 平台协作台自身 UI | `src/host/` | ❌ 禁止改动，见 page-generator §3.5 |

`src/lib/` 已有先例：`src/lib/feature-tags/`（功能点标注）、`src/lib/platform-shell/`（产品外壳：顶栏/侧栏）、`src/lib/product-nav/`（9 宫格产品导航面板）。
新增素材目录必须自带 `index.ts` 桶文件（barrel），页面只从 `@/lib/<name>` 导入。

## 3. 抽取步骤

1. **先定稿一页**：选还原度最高、最稳定的那一页作为唯一来源，截图/量好尺寸（高度、宽度、字号、间距、颜色）。
2. **拆结构与数据**：视觉留在组件里，业务数据（菜单、文案、品牌、租户、用户名、路径）全部提成 props 或 preset。
3. **切断框架耦合**：不 import `react-router`、不读全局 store；跳转用 `onNavigate(path)` 之类回调，由页面注入。
4. **主题走变量**：颜色统一取 CSS 变量（如 `--shell-accent`），在 `src/index.css` 定义默认值；不要在组件里散落品牌色。
5. **图标集中**：图标放单独文件（`icons.tsx` / `navIcons.tsx`），同一套风格，不混搭；用一个 key 表（如 `NAV_ICONS`）让 preset 只写图标名。
6. **写 thin adapter**：原页面 `_shared.tsx` 改成薄适配层，保持原有导出名与 props 不变，`_versions/*.tsx` 零改动。
7. **写说明书**：`docs/<Name>/<素材名>.md`，含组成、视觉规格表、最小接入示例、换肤方法、注意事项。
8. **验收**：`npx tsc -b --force` + `npx vite build` + `node scripts/validate-all.js`，并在浏览器里点一遍关键跳转、量一遍关键尺寸。

## 4. 硬约束

- ❌ 素材里不出现具体产品的菜单/文案/接口数据；
- ❌ 不为了"通用"而改视觉：抽取前后尺寸、字号、间距必须逐像素一致，改样式一律另开变更；
- ❌ 页面之间禁止整段复制同一组件（复制即视为 Tech Debt，下次改动必漏）；
- ❌ 不在 `src/host/` 下新增"公共组件"；
- ✅ props 命名用业务中性词（`rows` / `items` / `activeKey`），不用某产品的领域词；
- ✅ 每个素材至少有一个真实使用方（先落地，再宣称"素材"）。

## 5. 自检 Checklist

- [ ] 素材目录在 `src/lib/`，且有 `index.ts` 导出？
- [ ] 组件内没有产品名、菜单项、路由字符串？
- [ ] 不依赖 react-router / 全局状态？
- [ ] 颜色只来自 CSS 变量或 Tailwind token？
- [ ] 原有使用方 import 路径与 props 未变（薄适配层）？
- [ ] `docs/` 下有对应说明书，含可复制的接入示例？
- [ ] tsc / build / validate 全绿，浏览器实测过跳转与尺寸？

## 6. 回答"这个能做成素材吗"

先判断，再动手，回答里给出三件事：

1. **能不能抽**：是否有第二个使用方、视觉是否已定稿；
2. **抽完长什么样**：目录、props 清单、preset 形态；
3. **怎么用**：一段最小接入代码 + 换肤方式。

如果只是"以后可能用得上"，先记录在案，不建目录。
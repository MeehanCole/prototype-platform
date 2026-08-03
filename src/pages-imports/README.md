# src/pages-imports — Figma / AI 生成代码的「转化接入管线」

> ⚠️ **这里不是正式页面目录**。正式接入 Host 基座（左侧导航可点开、带 PRD、带版本切换）的页面，全部放在 `../pages/`。
>
> 这里是「**先上车后补票**」的三层转化区，承接任何 AI 直接吐出的原始代码（Figma 转码 / v0 / Trae / Cursor / Claude / 截图还原），先确保代码能预览，再逐步改造成 `../pages/` 的合规模板。

---

## 三层结构（不要跨层放文件）

```
pages-imports/
├── 01-raw/          ✅ 不可变原始快照（永远不要在这里改代码）
├── 02-adapters/     ✅ 薄适配器：对 raw 做最小包装，能被 Host 预览
├── 03-converters/   ✅ 转化工程脚本 & 设计 token 映射表
└── scripts/         ✅ 辅助 shell 脚本（import-new / convert）
```

### 01-raw — 原始快照层
**原则：原样 copy，永不修改，必有 source.md**

每一批导入一个子目录，命名 `<来源>-<业务>-<YYYYMMDD>`，例如：
```
01-raw/
└── figma-cloudapi-20260801/
    ├── source.md                      ← 谁、什么时候、从哪里导入的（脚本自动生成）
    ├── 同步记录管理/index.tsx         ← 原始代码 1:1 copy，一个字都别改
    └── svg-xxx.ts
```
> 为什么「永不修改」：如果以后写了更强大的 converter，只要 raw 还在，就能一键重跑生成全新 adapter，而不必手工翻之前被手改过的中间态。

### 02-adapters — 薄适配层
**原则：让原始代码能在 Host 里预览，不做设计 token 对齐**

由 `03-converters/figma-to-platform.mjs` 自动生成，每一批对应一个子目录：
```
02-adapters/
└── figma-cloudapi-20260801/
    ├── meta.json                       ← 由 converter 自动写（status / 来源 / 时间）
    ├── 同步记录管理/index.tsx          ← raw 的拷贝，后续手工加 default export
    └── ...
```

**适配器工作流（建议一次只迁一个页面）：**
1. 先选 1 个 adapter 里的子目录（比如「同步记录管理」）
2. 加 `export default function XxxPage()` 包装函数
3. 在 `../../host/router/pageRegistry.ts` 临时注册一个 entry，能在左侧导航点开看
4. 看完效果决定：「这个能直接进 pages/ 吗？」→ 是 → 下一步；否 → 退回到 raw 再升级 converter 重新生成

### 03-converters — 转化工程层
**原则：所有批量自动化放这里；遇到 case-by-case 手改再落到 02-adapters/**

```
03-converters/
├── figma-to-platform.mjs    ← 主脚本：跑 01-raw → 02-adapters
├── style-mapping.json       ← 颜色/组件 → 设计 token 映射表（扩展映射只改这里）
└── prompts/                 ← 给 AI Skill 用的转化 prompt 模板
```

扩展 converter 建议顺序：
1. **先扩 `style-mapping.json`**（发现新颜色/组件就往表里加，不写代码）
2. **再扩 `figma-to-platform.mjs`**（AST 批量替换、正则扫硬编码颜色等）
3. **最后才人工改 adapter**（case-by-case，尽量少）

---

## 30 秒快速操作

### ① 导入一批 Figma / AI 导出代码
```bash
cd prototype-platform

# 从外部目录整批导入（推荐）
./src/pages-imports/scripts/import-new.sh figma-cloudapi-20260801 \
    --source "../Create Interactive Page/src/imports" \
    --url "https://www.figma.com/file/xxxx/..." \
    --note "7 张运营后台页面"

# 单文件导入
./src/pages-imports/scripts/import-new.sh trae-login-20260801 \
    --single-path ~/Downloads/login-page.tsx \
    --note "AI 从 PRD 直接生成的登录页草稿"
```

### ② 生成适配器（01-raw → 02-adapters）
```bash
# 全批次
./src/pages-imports/scripts/convert.sh --dry-run   # 先空跑看看计划
./src/pages-imports/scripts/convert.sh             # 真正执行

# 单批次
./src/pages-imports/scripts/convert.sh figma-cloudapi-20260801
```

### ③ 接入正式目录（`src/pages/`）
```bash
# 1) 按 Skill 契约骨架创建 pages/<业务>/<页面>/
#    index.tsx + prd.md + meta.json + _workflow/ + _versions/
#
# 2) 把 02-adapters/ 里跑过一遍的页面 TSX 拆到骨架里：
#    - 手写 Btn→<Button variant="default"> 等组件替换
#    - 用 design-workflow-guide Skill 跑 Mode C Hybrid：V1（adapter版）→ V2（对齐 token 版）
#    - 跑 validate-page 检查，0 error 就合并进正式
```

---

## 脚本列表

| 脚本 | 说明 |
|---|---|
| [`scripts/import-new.sh`](./scripts/import-new.sh) | 导入原始代码到 01-raw，自动写 source.md 元信息 |
| [`scripts/convert.sh`](./scripts/convert.sh) | 调用 figma-to-platform.mjs 的薄包装，支持全批次 / 单批次 / --dry-run |
| [`03-converters/figma-to-platform.mjs`](./03-converters/figma-to-platform.mjs) | 主转化脚本（Node.js 18+ 直接跑） |
| [`03-converters/style-mapping.json`](./03-converters/style-mapping.json) | 颜色 / 组件硬编码 → Tailwind / Shadcn token 映射表 |

---

## FAQ

**Q: 直接把 Figma 代码粘到 pages/ 里行不行？**
A: 技术上可以，但会造成一堆硬编码 `#1890ff` 蓝、手写 `Badge/Pagination/Table` 组件和 pages/ 里其他用 Shadcn 的页面风格割裂，后续难维护。建议走 01-raw → 02-adapters → pages/，只多 2 步，但管线清晰、资产可追溯。

**Q: converter 还没覆盖到的颜色/组件怎么办？**
A: 两步：① 先在 `style-mapping.json` 加映射项（不写代码就能贡献）；② 手动改 adapter 做临时兜底，等 converter 升级后重跑批量替换。

**Q: 01-raw 里有 source.md，能不能删？**
A: 不行。source.md 是「这个代码从哪来的」唯一留档，万一以后出版权/溯源问题、或者 converter 重跑需要定位原始版本，就是靠它。永远别删。

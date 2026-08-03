---
name: "prototype-page-generator"
description: "Generates prototype page code that conforms to the prototype-platform access contract. Invoke when user asks to create a new prototype page, generate UI from Figma/PRD/screenshot, or add a new page to src/pages/."
---

# Prototype Page Generator

## Canonical Rules

**This skill's canonical rules live in the project-level `.skills/` directory.** Read these files first before generating any code:

1. **`.skills/page-generator.md`** — Full code generation contract (directory convention, default export, style system, PRD embedding, DocPanel, NewTag, anti-patterns, output checklist)
2. **`.skills/templates.md`** — Copy-paste ready templates (meta.json, PRD, Changelog, extractSection, FEATURE_LABELS, DocPanel, NewTag, complete v2.tsx skeleton)

## When to Invoke

- User asks to create a new prototype page
- User wants to generate UI code from Figma link / PRD document / screenshot / verbal description
- User asks to add a new page to `src/pages/`
- User wants to create an A/B version comparison page
- The `design-workflow-guide` skill calls this skill during A4/B3/C4 stages

## Relationship with `design-workflow-guide`

This skill is a **code generation executor**, called by `design-workflow-guide` during specific workflow stages:
- **Mode A stage A4**: Generate prototype from confirmed solution
- **Mode B stage B3**: Adapt Figma/screenshot code to platform spec
- **Mode C stage C4**: Modify existing prototype based on confirmed plan

If the user's request lacks prior workflow context (no requirement analysis, no solution design), suggest invoking `design-workflow-guide` first. But if the user explicitly wants direct code generation, proceed with this skill.

## Quick Reference (Summary Only)

For detailed rules, read `.skills/page-generator.md`. Key points:

1. **Directory**: `src/pages/<Module>/<Page>/` with `index.tsx`, `meta.json`, optional `_versions/`
2. **Export**: `export default function XxxPage()` (no named export)
3. **Style**: Tailwind + Shadcn, no antd/inline-style, use design tokens
4. **Design system**: 5 presets (default/element-plus/ant-design/arco-design/naive-ui), ask user
5. **Mode C mandatory**: PRD `**FR-X` markers, `?raw` import, `extractSection`, `FEATURE_DOCS`, DocPanel with `createPortal`
6. **Anti-patterns**: No `**/` in comments, no CJK punctuation, no inline DocPanel, keys must match 1:1

## Validation

After generation, run:
```bash
node scripts/validate-page.js src/pages/<Module>/<Page>
```

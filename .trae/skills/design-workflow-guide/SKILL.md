---
name: "design-workflow-guide"
description: "Guides users through AI design workflows (forward design, reverse design, hybrid). Invoke when user starts a new design task, has a requirement to analyze, has a screenshot to restore, or wants to iterate on an existing product."
---

# Design Workflow Guide

## Canonical Rules

**This skill's canonical rules live in the project-level `.skills/` directory.** Read these files first before starting any workflow:

1. **`.skills/design-workflow.md`** — Complete workflow definitions (Mode A/B/C stages, version management, change types, artifact structure)
2. **`.skills/page-generator.md`** — Code generation contract (called during A4/B3/C4 stages)
3. **`.skills/templates.md`** — Copy-paste ready templates for all artifacts

## When to Invoke

- User starts a new design task from a requirement
- User has a screenshot/product to reverse-engineer
- User wants to iterate on an existing product (Mode C)
- User asks about design workflow or process

## Three Modes

| Mode | Start Point | Best For |
|------|------------|----------|
| **A** Forward | Text requirement | New product from scratch |
| **B** Reverse | Screenshot/URL | Restore existing product to prototype |
| **C** Hybrid | Existing product + new requirement | Version iteration, A/B comparison |

## Stage Mapping

| Stage | What Happens | Who Executes |
|-------|-------------|-------------|
| A1/B1/C2 | Requirement capture & analysis | This skill |
| A2/B2/C2 | Analysis & research | This skill |
| A3/C3 | Solution design & comparison | This skill |
| A4/B3/C4 | Code generation | → `prototype-page-generator` skill |
| A5/C5 | PRD documentation | This skill + `prototype-page-generator` (for embedding) |
| B4 | Platform integration | `prototype-page-generator` skill |
| B5 | Reverse PRD | This skill |

## Mode C Special Requirements

Mode C (hybrid/modification) has mandatory requirements beyond Mode A/B:

1. **PRD paragraph markers**: Every requirement in `prd_v2.md` must have `**FR-X` at paragraph start
2. **PRD embedding**: Version file must import PRD via `?raw`, include `extractSection`, `FEATURE_DOCS`
3. **DocPanel**: Right-side panel rendered via `createPortal` to `document.body`
4. **Feature labels**: Capsule-shaped "说明" buttons (blue = clickable, gray = tooltip only)
5. **Changelog**: Generate `_workflow/c5_v1_vs_v2_changelog.md` with 6 sections
6. **Test flow**: Toggle "显示新增功能点" → click each "说明" button → verify PRD content

Read `.skills/design-workflow.md` for complete Mode C details.

## Output Artifacts

All workflow artifacts go into `_workflow/` directory (not part of routes):
- `requirement.md` — A1/C2 requirements
- `analysis.md` — A2/C2 analysis
- `solutions.md` — A3/C3 solution comparison
- `decision.md` — Final decision record
- `c5_v1_vs_v2_changelog.md` — C5 test acceptance checklist

## Version Management

- Version creation: only for significant changes (info architecture, 3+ features, business rules)
- Naming: `v1`, `v2`, `v3` (integers only, no `v2.1`)
- Each version: `prd_vX.md` + `_versions/vX.tsx`
- State isolation: localStorage keyed by `route + version`

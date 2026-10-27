#!/usr/bin/env bash
# new-page.sh — 生成符合页面契约的新页面骨架
#
# 用法: ./scripts/new-page.sh <模块>/<页面> "<页面标题>" ["模块名"]
# 示例: ./scripts/new-page.sh GTCB/ModelSquare "模型广场" "算力加速平台-弹性扩缩容"
set -euo pipefail
cd "$(dirname "$0")/.." || exit 1

REL="${1:?用法: ./scripts/new-page.sh <模块>/<页面> \"<标题>\" [模块名]}"
TITLE="${2:?缺少页面标题}"
MODULE="${3:-$REL}"
DIR="src/pages/$REL"

if [[ -e "$DIR" ]]; then
  echo "目录已存在: $DIR"; exit 1
fi
mkdir -p "$DIR"

# meta.json ----------------------------------------------------------------
cat > "$DIR/meta.json" <<JSON
{
  "title": "$TITLE",
  "module": "$MODULE",
  "source": "ai",
  "status": "draft",
  "updatedAt": "$(date +%Y-%m-%d)",
  "tags": []
}
JSON

# prd.md -------------------------------------------------------------------
cat > "$DIR/prd.md" <<MD
# $TITLE PRD

| 项 | 内容 |
|---|---|
| 模块 | $MODULE |
| 页面 | $TITLE |
| 版本 | V1.0 |
| 状态 | draft |

---

## 1. 背景与目标

（一句话说清要解决什么问题）

## 2. 功能需求

| 项目 | 说明 |
|---|---|
|  |  |

## 3. 业务规则与校验

| # | 场景 | 规则 | 提示 |
|---|---|---|---|
| 1 |  |  | 「」 |

## 4. 验收标准

- [ ] 
MD

# feature-tags.tsx --------------------------------------------------------
cat > "$DIR/feature-tags.tsx" <<'TSX'
/**
 * 功能点批注配置
 *
 * 通用件来自 @/lib/feature-tags/core；本文件只写「本次改了什么」。
 * 规范：.skills/agent-rules.md D3　模板：.skills/templates.md §10
 */
import prdRaw from './prd.md?raw'
import { pick, type FeatureDoc } from '@/lib/feature-tags/core'

export { DocPanel, DocProvider, NewTag } from '@/lib/feature-tags/core'

export const FEATURES: Record<string, FeatureDoc> = {
  'F-01': {
    type: '新增',
    title: '（一句话说清改了什么）',
    changes: ['（改了 A）', '（改了 B）'],
    prdRef: 'PRD 2',
    doc: pick(prdRaw, '## 2. 功能需求', '## 3.'),
  },
}
TSX

# index.tsx ----------------------------------------------------------------
cat > "$DIR/index.tsx" <<'TSX'
import { useState } from 'react'
import { DocPanel, DocProvider, FEATURES, NewTag } from './feature-tags'

export default function Page({ __showFeat = false }: { __showFeat?: boolean }) {
  const [docCode, setDocCode] = useState<string | null>(null)
  return (
    <DocProvider showFeat={__showFeat} features={FEATURES} onOpenDoc={setDocCode}>
      <div className="h-[calc(100vh-68px)] flex flex-col overflow-hidden bg-white text-[#1f2329]">
        <header className="shrink-0 h-9 px-6 flex items-center gap-2 border-b border-[#e5e6eb]">
          <h1 className="text-[14px] font-medium">页面标题</h1>
          <NewTag code="F-01" />
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto p-6 text-[12px] text-[#646a73]">
          内容区
        </div>
      </div>
      <DocPanel code={docCode} onClose={() => setDocCode(null)} />
    </DocProvider>
  )
}
TSX

echo "已生成: $DIR"
echo "下一步:"
echo "  1) 改 prd.md / index.tsx"
echo "  2) ./scripts/check.sh $DIR"
ROUTE=$(printf "%s" "$REL" | tr "[:upper:]" "[:lower:]")
echo "  3) 访问 /$ROUTE   # 路由为目录名小写"

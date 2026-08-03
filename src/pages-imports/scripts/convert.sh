#!/usr/bin/env bash
#
# convert.sh — figma-to-platform.mjs 的薄包装。
# 作用: 比直接 node 执行多做 3 件事:
#   1) 先校验 node 版本
#   2) 自动 cd 到正确目录,避免执行路径错
#   3) 所有批次 / 单个批次 两种模式都支持
#
# 用法:
#   ./scripts/convert.sh                     # 转换 01-raw/ 下所有批次
#   ./scripts/convert.sh <批次名>            # 只转换一个批次,例: figma-cloudapi-20260801
#   ./scripts/convert.sh <批次名> --dry-run  # 只打印计划,不落盘

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'
info()  { echo -e "${GREEN}[convert]${NC} $1"; }
warn()  { echo -e "${YELLOW}[convert]${NC} $1"; }
error() { echo -e "${RED}[convert]${NC}  $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGES_IMPORTS="$(cd "$SCRIPT_DIR/.." && pwd)"
RAW_DIR="$PAGES_IMPORTS/01-raw"
ADAPTER_DIR="$PAGES_IMPORTS/02-adapters"
CONVERTER="$PAGES_IMPORTS/03-converters/figma-to-platform.mjs"
PROJECT_ROOT="$(cd "$PAGES_IMPORTS/../.." && pwd)"

# === 解析参数: 支持 "convert.sh" "convert.sh <批次名>" "convert.sh <批次名> --dry-run" "convert.sh --dry-run" ===
BATCH=""
DRY_RUN=0
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help)
      sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      if [ -z "$BATCH" ]; then BATCH="$1"; else warn "忽略未知参数: $1"; fi
      shift
      ;;
  esac
done

# === 环境检查 ===
if ! command -v node >/dev/null 2>&1; then
  error "需要先装 Node.js 18+"
  exit 1
fi
if [ ! -f "$CONVERTER" ]; then
  error "找不到 converter 脚本: $CONVERTER"
  exit 1
fi

# === 收集要转换的批次 ===
if [ -n "$BATCH" ]; then
  if [ ! -d "$RAW_DIR/$BATCH" ]; then
    error "01-raw 下找不到批次: $BATCH"
    exit 1
  fi
  BATCHES=("$BATCH")
else
  shopt -s nullglob
  BATCH_DIRS=("$RAW_DIR"/*/)
  if [ "${#BATCH_DIRS[@]}" -eq 0 ]; then
    warn "01-raw 目前空,先用 import-new.sh 导入一批再转换"
    exit 0
  fi
  BATCHES=()
  for d in "${BATCH_DIRS[@]}"; do BATCHES+=("$(basename "$d")"); done
fi

# === 转换 ===
cd "$PROJECT_ROOT"  # 保证 figma-to-platform.mjs 里的相对路径正确
for b in "${BATCHES[@]}"; do
  if [ $DRY_RUN -eq 1 ]; then
    info "[dry-run] 将执行: node src/pages-imports/03-converters/figma-to-platform.mjs $b"
  else
    info "转换批次: $b"
    node src/pages-imports/03-converters/figma-to-platform.mjs "$b"
  fi
done

echo ""
if [ $DRY_RUN -eq 1 ]; then
  info "[dry-run] 计划执行 ${#BATCHES[@]} 个批次的转换,去掉 --dry-run 即可真正执行"
else
  info "✅ 完成,共处理 ${#BATCHES[@]} 个批次。输出目录:"
  echo "  ${CYAN}$ADAPTER_DIR${NC}"
  echo ""
  echo "下一步建议:"
  echo "  在 adapter 中挑 1 个页面做人工接入: 添加 meta.json + default export → 注册进 pageRegistry.ts"
  echo "  → 在 pages/ 新页面里参考 adapter 代码,对齐 shadcn/token → 验收完成后移除 adapter 临时文件"
fi

#!/usr/bin/env bash
#
# import-new.sh — 把 Figma / v0 / Trae / Claude / Cursor / 任何 AI 导出的代码
# 放入 src/pages-imports/01-raw/<批次名>/，作为不可变的原始快照存档。
#
# ⚠️  01-raw 里的代码"永远不改"——任何修改都在 02-adapters / 03-converters 里做。
#
# 用法(两种):
#   1) 从已有的外部目录整批导入(推荐，例如 Figma 导出的 "Create Interactive Page" src/imports/xxx):
#      ./scripts/import-new.sh figma-cloudapi-20260801 \
#          --source "../Create Interactive Page/src/imports" \
#          --url "https://www.figma.com/file/xxxx/Create-Interactive-Page" \
#          --note "7 张运营后台页面"
#
#   2) 从单文件 / 单个目录导入:
#      ./scripts/import-new.sh trae-login-20260801 \
#          --single-path ~/Downloads/login-page.tsx \
#          --note "AI 从 PRD 直接生成的登录页草稿"

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'
info()  { echo -e "${GREEN}[import]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[import]${NC}  $1"; }
error() { echo -e "${RED}[import]${NC} $1"; }

# === 解析参数 ===
BATCH_NAME="${1:-}"
shift || true
if [ -z "$BATCH_NAME" ]; then
  cat <<EOF
用法:
  $(basename "$0") <批次名> --source <源目录> [--url <来源URL>] [--note <备注>]
  $(basename "$0") <批次名> --single-path <单文件/目录路径> [--note <备注>]

批次名建议: <来源>-<业务>-<YYYYMMDD>，例: figma-cloudapi-20260801
EOF
  exit 1
fi

SOURCE_DIR=""
SINGLE_PATH=""
SOURCE_URL=""
NOTE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --source)      SOURCE_DIR="$2";    shift 2 ;;
    --single-path) SINGLE_PATH="$2";   shift 2 ;;
    --url)         SOURCE_URL="$2";    shift 2 ;;
    --note)        NOTE="$2";          shift 2 ;;
    *) warn "忽略未知参数: $1"; shift ;;
  esac
done

# === 自检执行权限 ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGES_IMPORTS="$(cd "$SCRIPT_DIR/.." && pwd)"
RAW_DIR="$PAGES_IMPORTS/01-raw/$BATCH_NAME"

if [ -e "$RAW_DIR" ]; then
  error "批次已存在: $RAW_DIR"
  error "如果想覆盖请先手动删除,避免误覆盖原始快照"
  exit 1
fi

mkdir -p "$RAW_DIR"

# === 导入逻辑 ===
if [ -n "$SINGLE_PATH" ]; then
  if [ ! -e "$SINGLE_PATH" ]; then error "找不到源文件/目录: $SINGLE_PATH"; exit 1; fi
  TARGET="$RAW_DIR/$(basename "$SINGLE_PATH")"
  if [ -d "$SINGLE_PATH" ]; then
    info "拷贝目录 $SINGLE_PATH → $TARGET"
    cp -R "$SINGLE_PATH" "$TARGET"
  else
    info "拷贝文件 $SINGLE_PATH → $TARGET"
    cp  "$SINGLE_PATH" "$TARGET"
  fi
elif [ -n "$SOURCE_DIR" ]; then
  if [ ! -d "$SOURCE_DIR" ]; then error "找不到源目录: $SOURCE_DIR"; exit 1; fi
  info "批量拷贝目录 $SOURCE_DIR/* → $RAW_DIR/"
  # 用 tar 代替 cp -R，兼容源目录是相对路径 & 包含中文空格等情况
  (cd "$SOURCE_DIR" && tar cf - .) | (cd "$RAW_DIR" && tar xf -)
else
  error "必须传入 --source 或 --single-path"
  exit 1
fi

# === 生成 source.md 来源元信息(不可变,留档) ===
cat > "$RAW_DIR/source.md" <<EOF
# 原始代码快照: $BATCH_NAME

> ⚠️ 本目录是 01-raw 不可变快照层，**任何情况下都不要直接修改这里的文件**。
> 需要转化请走: 03-converters/figma-to-platform.mjs → 02-adapters/ → 最终接入 src/pages/

- 导入时间: $(date '+%Y-%m-%d %H:%M:%S')
- 导入机器: $(whoami) @ $(hostname)
EOF

if [ -n "$SOURCE_URL" ]; then
  echo "- 来源链接: $SOURCE_URL" >> "$RAW_DIR/source.md"
fi
if [ -n "$SINGLE_PATH" ]; then
  echo "- 原始路径: $SINGLE_PATH"      >> "$RAW_DIR/source.md"
elif [ -n "$SOURCE_DIR" ]; then
  echo "- 原始目录: $SOURCE_DIR"        >> "$RAW_DIR/source.md"
fi
if [ -n "$NOTE" ]; then
  echo ""                       >> "$RAW_DIR/source.md"
  echo "## 备注"                >> "$RAW_DIR/source.md"
  echo ""                       >> "$RAW_DIR/source.md"
  echo "$NOTE"                  >> "$RAW_DIR/source.md"
fi

FILE_COUNT=$(find "$RAW_DIR" -type f | wc -l | tr -d ' ')
info "✅ 完成: $RAW_DIR  (共 $FILE_COUNT 个文件,含 source.md)"
echo ""
echo "下一步建议:"
echo "  ${CYAN}cd $(dirname "$SCRIPT_DIR")/..${NC}"
echo "  ${YELLOW}node src/pages-imports/03-converters/figma-to-platform.mjs $BATCH_NAME${NC}"
echo "    ↳ 把原始快照转成 02-adapters 里可 preview 的薄适配器"

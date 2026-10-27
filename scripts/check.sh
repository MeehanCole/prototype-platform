#!/usr/bin/env bash
# check.sh — 一条命令跑完「类型检查 + 构建 + 页面契约校验 (+ 可选截图)」
#
# 用法:
#   ./scripts/check.sh                                  # 全量
#   ./scripts/check.sh src/pages/GTCB/InferenceService  # 指定页面
#   ./scripts/check.sh src/pages/X --shot "gtcb/inferenceservice?view=create" shot.png
#
# 说明: 截图依赖本地 dev server（默认 http://localhost:5192）
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

PAGES=()
SHOT_ROUTE=""
SHOT_OUT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --shot) SHOT_ROUTE="$2"; SHOT_OUT="${3:-.tmp/shot.png}"; shift 3 ;;
    *) PAGES+=("$1"); shift ;;
  esac
done

fail=0
step() { printf '\n\033[36m▸ %s\033[0m\n' "$1"; }

step "类型检查 (tsc -b)"
if npx tsc -b 2>&1 | tail -20 | grep -q .; then
  npx tsc -b
  fail=1
else
  echo "  ✓ 通过"
fi

step "构建 (vite build)"
if npx vite build >/tmp/check-build.log 2>&1; then
  echo "  ✓ 通过"
else
  tail -20 /tmp/check-build.log
  fail=1
fi

step "页面契约校验"
if [[ ${#PAGES[@]} -eq 0 ]]; then
  node scripts/validate-all.js || fail=1
else
  for p in "${PAGES[@]}"; do
    echo "  · $p"
    node "scripts/validate-page.js" "$p" | tail -2 || fail=1
  done
fi

if [[ -n "$SHOT_ROUTE" ]]; then
  step "截图 $SHOT_ROUTE"
  mkdir -p "$(dirname "$SHOT_OUT")"
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  [[ -x "$CHROME" ]] || CHROME="$(command -v google-chrome || command -v chromium || true)"
  if [[ -z "${CHROME:-}" ]]; then
    echo "  ! 未找到 Chrome，跳过截图"
  else
    "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
      --user-data-dir=/tmp/dsh-chrome-profile --window-size=1900,2400 \
      --virtual-time-budget=6000 --screenshot="$SHOT_OUT" \
      "http://localhost:5192/$SHOT_ROUTE" >/dev/null 2>&1
    [[ -f "$SHOT_OUT" ]] && echo "  ✓ 已保存 $SHOT_OUT" || { echo "  ! 截图失败（dev server 是否在跑？）"; fail=1; }
  fi
fi

printf '\n'
if [[ $fail -eq 0 ]]; then echo -e "\033[32m全部通过\033[0m"; else echo -e "\033[31m有失败项，见上方输出\033[0m"; fi
exit $fail

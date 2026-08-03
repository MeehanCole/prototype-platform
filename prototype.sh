#!/usr/bin/env bash
# prototype.sh - 一键启动脚本（纯前端架构）
# 用法: ./prototype.sh [start|stop|status|restart]
#   start    (默认) 安装依赖(首次) + 启动前端 Vite + 自动打开浏览器
#   stop     停止服务
#   status   查看运行状态
#   restart  先 stop 再 start
#
# 首次运行如果提示权限问题: chmod +x prototype.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录(脚本所在目录)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/.prototype.pid"
LOG_DIR="$ROOT_DIR/.prototype-logs"
FRONTEND_PORT=5192
AUTO_OPEN_BROWSER="${AUTO_OPEN_BROWSER:-1}"  # 1=自动打开, 0=不自动打开

# 工具函数
info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 自检: 执行权限是否丢失(脚本被 copy 过来时偶尔会丢)
check_perms() {
  if [ ! -x "$0" ]; then
    warn "脚本缺少可执行权限,正在自动修复: chmod +x $0"
    chmod +x "$0" || true
  fi
}

# 等待端口就绪(最多 15s,探测 30 次,避免单纯 sleep 造成启动太慢或还没起来)
wait_for_port() {
  local port="$1" name="$2"
  local max=30 i=0
  while [ $i -lt $max ]; do
    if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      info "$name 已就绪 (端口 $port)"
      return 0
    fi
    sleep 0.5
    i=$((i + 1))
  done
  warn "$name 端口 $port 等待超时,请查看日志 $LOG_DIR 排查"
  return 1
}

# 自动打开浏览器(macOS=open,Linux=xdg-open,Windows=cmd /c start)
open_browser() {
  local url="http://localhost:${FRONTEND_PORT}"
  if [ "$AUTO_OPEN_BROWSER" != "1" ]; then
    info "已通过 AUTO_OPEN_BROWSER=0 禁用自动打开浏览器,手动访问: $url"
    return 0
  fi
  case "$(uname -s)" in
    Darwin) info "正在打开浏览器 → $url" ; open "$url" 2>/dev/null || true ;;
    Linux)  command -v xdg-open >/dev/null 2>&1 && xdg-open "$url" 2>/dev/null || true ;;
    MINGW*|MSYS*|CYGWIN*) cmd.exe /c start "" "$url" 2>/dev/null || true ;;
    *) ;;
  esac
}

# 检查 Node 环境
check_node() {
  if ! command -v node &> /dev/null; then
    error "未检测到 Node.js,请先安装 Node.js 18+ (https://nodejs.org)"
    exit 1
  fi
  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 版本过低(当前 v$NODE_VERSION),需要 18+"
    exit 1
  fi
  info "Node.js $(node -v) 检测通过"
}

# 安装依赖(首次运行或依赖缺失时)
install_deps() {
  if [ ! -d "$ROOT_DIR/node_modules" ]; then
    info "首次运行,正在安装依赖(可能需要 1-2 分钟)..."
    cd "$ROOT_DIR"
    npm install
    info "依赖安装完成"
  else
    info "依赖已就绪"
  fi
}

# 启动服务
start() {
  # 检查是否已在运行
  if [ -f "$PID_FILE" ]; then
    warn "服务可能已在运行(存在 PID 文件)。如需重启请先执行 ./prototype.sh stop"
    exit 1
  fi

  check_perms
  check_node
  install_deps

  mkdir -p "$LOG_DIR"

  # 清理可能残留的端口占用进程
  lsof -ti :$FRONTEND_PORT | xargs kill -9 2>/dev/null || true

  info "正在启动服务..."

  # 启动前端 Vite 开发服务器
  cd "$ROOT_DIR"
  npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
  FRONTEND_PID=$!
  echo "$FRONTEND_PID" > "$PID_FILE"

  # 等待前端就绪
  wait_for_port "$FRONTEND_PORT" "前端 Vite" || true

  # 自动打开浏览器
  open_browser

  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  原型协作平台已启动${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "  访问地址:  ${CYAN}http://localhost:${FRONTEND_PORT}${NC}"
  echo ""
  echo -e "  日志目录:  $LOG_DIR"
  echo -e "  停止服务:  ${YELLOW}./prototype.sh stop${NC}"
  echo ""
  echo -e "  按 ${YELLOW}Ctrl+C${NC} 也可停止服务"
  echo ""

  # 捕获退出信号,清理子进程
  trap 'stop' INT TERM EXIT

  # 等待子进程(前台保持运行)
  wait
}

# 停止服务
stop() {
  if [ ! -f "$PID_FILE" ]; then
    info "没有运行中的服务"
    return 0
  fi

  info "正在停止服务..."
  while read -r pid; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done < "$PID_FILE"

  # 同时清理可能的残留 Vite 进程(按端口)
  lsof -ti :$FRONTEND_PORT | xargs kill 2>/dev/null || true

  rm -f "$PID_FILE"
  info "服务已停止"
}

# 查看状态
status() {
  if [ -f "$PID_FILE" ]; then
    info "服务运行中"
    echo -e "  PID 文件: $PID_FILE"
    cat "$PID_FILE" | while read -r pid; do
      if kill -0 "$pid" 2>/dev/null; then
        echo -e "  PID $pid: ${GREEN}运行中${NC}"
      else
        echo -e "  PID $pid: ${RED}已退出${NC}"
      fi
    done
  else
    info "服务未运行"
  fi
}

# 主入口
case "${1:-start}" in
  start)   start ;;
  stop)    stop ;;
  status)  status ;;
  restart) stop ; sleep 1 ; start ;;
  *)
    echo "用法: $0 [start|stop|status|restart]"
    echo ""
    echo "  start    (默认) 安装依赖 + 启动服务 + 自动开浏览器"
    echo "  stop     停止服务"
    echo "  status   查看服务运行状态"
    echo "  restart  先停止再启动(方便 hot reload 失败时快速重启)"
    echo ""
    echo "环境变量:"
    echo "  AUTO_OPEN_BROWSER=0  ./prototype.sh start   # 禁用自动打开浏览器"
    exit 1
    ;;
esac

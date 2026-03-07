#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
if ! REPO_ROOT=$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null); then
  if [ -d "$SCRIPT_DIR/.." ]; then
    REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
  else
    echo "无法定位仓库根目录，请从项目内部执行此脚本"
    exit 1
  fi
fi
cd "$REPO_ROOT"

if [ $# -lt 1 ]; then
  echo "用法: $0 \"commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"
BRANCH=${DEPLOY_BRANCH:-master}
REMOTE_SSH=${REMOTE_SSH_BIN:-$HOME/bin/toAwsGlb}
REMOTE_REPO_DIR=${REMOTE_REPO_DIR:-/home/ubuntu/meetinginbeijing}
REMOTE_SERVICE_NAME=${REMOTE_SERVICE_NAME:-meetinginbeijing-web}
REMOTE_DOMAIN=${REMOTE_DOMAIN:-jane.ydd-club.com}
REMOTE_PORT=${REMOTE_PORT:-3003}
REMOTE_USER=${REMOTE_APP_USER:-ubuntu}
REMOTE_GROUP=${REMOTE_APP_GROUP:-ubuntu}
REMOTE_GIT_URL=${REMOTE_GIT_URL:-https://gitee.com/foxprince/meetinginbeijing.git}
DEPLOY_GIT_USERNAME=${DEPLOY_GIT_USERNAME:-}
DEPLOY_GIT_PASSWORD=${DEPLOY_GIT_PASSWORD:-}

if [ ! -x "$REMOTE_SSH" ]; then
  echo "找不到远程登录脚本 $REMOTE_SSH (或不可执行)"
  exit 1
fi

echo "将要提交以下改动："
git status --short

git add -A
if git diff --cached --quiet; then
  echo "没有需要提交的改动，直接推送..."
else
  git commit -m "$COMMIT_MESSAGE"
fi
git push origin "$BRANCH"

echo "开始远程部署..."
$REMOTE_SSH "bash -s" \
  "$BRANCH" \
  "$REMOTE_SERVICE_NAME" \
  "$REMOTE_PORT" \
  "$REMOTE_DOMAIN" \
  "$REMOTE_REPO_DIR" \
  "$REMOTE_USER" \
  "$REMOTE_GROUP" \
  "$REMOTE_GIT_URL" \
  "$DEPLOY_GIT_USERNAME" \
  "$DEPLOY_GIT_PASSWORD" <<'EOF'

set -euo pipefail

BRANCH="$1"
SERVICE_NAME="$2"
PORT="$3"
DOMAIN="$4"
APP_DIR="$5"
APP_USER="$6"
APP_GROUP="$7"
REMOTE_URL="$8"
GIT_USERNAME="${9:-}"
GIT_PASSWORD="${10:-}"
NODE_ENV=production
PNPM_HOME="${HOME}/.local/share/pnpm"
export PNPM_HOME
export PATH="$PNPM_HOME:$PATH"

ensure_node_toolchain() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    node_major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo "")
    if [ -n "$node_major" ] && [ "$node_major" -ge 20 ]; then
      return 0
    fi
  fi

  if ! command -v curl >/dev/null 2>&1; then
    echo "缺少 curl，无法安装 node/npm" >&2
    exit 1
  fi

  echo "安装/升级 Node.js 20.x 与 npm"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get update
  sudo apt-get install -y nodejs
}

ensure_node_toolchain

ensure_swap() {
  if sudo swapon --show | grep -q '^/'; then
    return 0
  fi

  if [ -f /swapfile ]; then
    sudo rm -f /swapfile || true
  fi

  if ! command -v free >/dev/null 2>&1; then
    return 0
  fi

  mem_mb=$(free -m | awk '/^Mem:/ {print $2}')
  if [ -z "$mem_mb" ]; then
    return 0
  fi

  if [ "$mem_mb" -ge 3500 ]; then
    return 0
  fi

  echo "检测到内存较小(${mem_mb}MB)，尝试创建 swap 避免 OOM"

  if command -v df >/dev/null 2>&1; then
    avail_mb=$(df -Pm / | awk 'NR==2 {print $4}')
  else
    avail_mb=""
  fi

  echo "清理可再生缓存与依赖，释放磁盘空间"
  sudo rm -rf "$APP_DIR/web/.next" "$APP_DIR/web/.turbo" \
    "$APP_DIR/web/node_modules/.cache" >/dev/null 2>&1 || true
  sudo rm -rf "$APP_DIR/web/node_modules" >/dev/null 2>&1 || true

  if command -v df >/dev/null 2>&1; then
    avail_mb=$(df -Pm / | awk 'NR==2 {print $4}')
  fi

  swap_mb=2048
  if [ -n "$avail_mb" ] && [ "$avail_mb" -lt 3000 ]; then
    swap_mb=1024
  fi

  if [ -n "$avail_mb" ] && [ "$avail_mb" -lt $((swap_mb + 600)) ]; then
    echo "磁盘空间不足：可用 ${avail_mb}MB，无法创建 ${swap_mb}MB swap。请先扩容磁盘或手动清理。" >&2
    exit 1
  fi

  if [ ! -f /swapfile ]; then
    sudo fallocate -l "${swap_mb}M" /swapfile || sudo dd if=/dev/zero \
      of=/swapfile bs=1M count="$swap_mb"
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
  fi

  sudo swapon /swapfile || true
}

ensure_swap

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm 不存在，将尝试使用 corepack 安装"
  if command -v corepack >/dev/null 2>&1; then
    corepack enable pnpm
  elif command -v curl >/dev/null 2>&1; then
    echo "使用官方安装脚本安装 pnpm"
    curl -fsSL https://get.pnpm.io/install.sh | env PNPM_HOME="$PNPM_HOME" SHELL="$(command -v bash)" sh -
    export PATH="$PNPM_HOME:$PATH"
  else
    echo "无法安装 pnpm：缺少 corepack/curl" >&2
    exit 1
  fi
fi

cd "$APP_DIR"
git remote set-url origin "$REMOTE_URL"

if [ -n "$GIT_USERNAME" ] && [ -n "$GIT_PASSWORD" ]; then
  if ! command -v python3 >/dev/null 2>&1; then
    echo "缺少 python3，无法对凭据进行 URL 编码" >&2
    exit 1
  fi

  urlencode() {
    python3 - <<'PY' "$1"
import sys
from urllib.parse import quote
print(quote(sys.argv[1], safe=''))
PY
  }

  ENCODED_USER=$(urlencode "$GIT_USERNAME")
  ENCODED_PASS=$(urlencode "$GIT_PASSWORD")
  AUTH_URL="https://${ENCODED_USER}:${ENCODED_PASS}@${REMOTE_URL#https://}"

  git config credential.helper store
  printf '%s\n' "$AUTH_URL" > "$HOME/.git-credentials"
  chmod 600 "$HOME/.git-credentials"
fi

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard origin/"$BRANCH"

if [ -n "$GIT_USERNAME" ] && [ -n "$GIT_PASSWORD" ]; then
  rm -f "$HOME/.git-credentials" || true
  git config --unset credential.helper >/dev/null 2>&1 || true
fi

cd "$APP_DIR/web"
pnpm config set registry https://registry.npmmirror.com
pnpm install --no-frozen-lockfile

# Force remove old use-language.ts file if it exists
rm -f src/hooks/use-language.ts

# Clean build cache
rm -rf .next .turbo node_modules/.cache

# Build with real environment variables from .env
pnpm build

SERVICE_FILE=/etc/systemd/system/${SERVICE_NAME}.service
if [ ! -f "$SERVICE_FILE" ]; then
  sudo tee "$SERVICE_FILE" >/dev/null <<SERVICE
[Unit]
Description=MeetingInBeijing Next.js (${SERVICE_NAME})
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${APP_DIR}/web
Environment=NODE_ENV=${NODE_ENV}
Environment=PORT=${PORT}
ExecStart=/usr/bin/env pnpm start --port ${PORT}
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICE
else
  echo "systemd service 已存在，跳过写入 $SERVICE_FILE"
fi

sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}.service
sudo systemctl restart ${SERVICE_NAME}.service

NGINX_CONF=/etc/nginx/sites-available/meetinginbeijing.conf
if [ ! -f "$NGINX_CONF" ]; then
  # Check if SSL certificate exists
  if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    # SSL certificate exists, use full HTTPS config
    sudo tee "$NGINX_CONF" >/dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
NGINX
  else
    # SSL certificate doesn't exist, use HTTP only config
    sudo tee "$NGINX_CONF" >/dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
NGINX
  fi
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/meetinginbeijing.conf
else
  echo "Nginx 配置已存在，跳过写入 $NGINX_CONF"
fi

sudo nginx -t && sudo systemctl reload nginx || echo "Nginx 配置测试失败，请检查证书是否存在"
echo "远程部署完成。"
EOF

echo "部署流程结束。"

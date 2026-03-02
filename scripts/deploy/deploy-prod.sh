#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/../.." && pwd)
cd "$REPO_ROOT"

if [ $# -lt 1 ]; then
  echo "用法: $0 \"commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"
BRANCH=${DEPLOY_BRANCH:-master}
REMOTE_SSH=${REMOTE_SSH_BIN:-$HOME/bin/toYDDECS}
REMOTE_REPO_DIR=${REMOTE_REPO_DIR:-/home/app/git/meetinginbeijing}
REMOTE_SERVICE_NAME=${REMOTE_SERVICE_NAME:-meetinginbeijing-web}
REMOTE_DOMAIN=${REMOTE_DOMAIN:-jane.ydd-club.com}
REMOTE_PORT=${REMOTE_PORT:-3003}
REMOTE_USER=${REMOTE_APP_USER:-app}
REMOTE_GROUP=${REMOTE_APP_GROUP:-app}

if [ ! -x "$REMOTE_SSH" ]; then
  echo "找不到远程登录脚本 $REMOTE_SSH (或不可执行)"
  exit 1
fi

echo "将要提交以下改动："
git status --short
read -r -p "以上改动将以 '$COMMIT_MESSAGE' 提交并推送到 $BRANCH，确定继续？[y/N] " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
  echo "已取消。"
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "没有需要提交的改动，直接推送..."
else
  git commit -m "$COMMIT_MESSAGE"
fi
git push origin "$BRANCH"

echo "开始远程部署..."
$REMOTE_SSH "bash -s" "$BRANCH" "$REMOTE_SERVICE_NAME" "$REMOTE_PORT" "$REMOTE_DOMAIN" "$REMOTE_REPO_DIR" "$REMOTE_USER" "$REMOTE_GROUP" <<'EOF'

set -euo pipefail

BRANCH="$1"
SERVICE_NAME="$2"
PORT="$3"
DOMAIN="$4"
APP_DIR="$5"
APP_USER="$6"
APP_GROUP="$7"
NODE_ENV=production
PNPM_HOME=/home/app/.local/share/pnpm
export PNPM_HOME
export PATH="$PNPM_HOME:$PATH"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm 不存在，将尝试使用 corepack 安装"
  if command -v corepack >/dev/null 2>&1; then
    corepack enable pnpm
  else
    npm install -g pnpm
  fi
fi

cd "$APP_DIR"
git remote set-url origin git@gitee.com:foxprince/meetinginbeijing.git 2>/dev/null || true
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard origin/"$BRANCH"

cd "$APP_DIR/web"
pnpm config set registry https://registry.npmmirror.com
pnpm install --no-frozen-lockfile

# Create .env.local with dummy values for build
cat > .env.local <<ENVFILE
POSTGRES_URL=postgresql://localhost/dummy
ADMIN_SESSION_TOKEN=dummy-token
S3_BUCKET_NAME=dummy-bucket
S3_PUBLIC_BASE_URL=https://dummy.example.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=dummy-key
S3_SECRET_ACCESS_KEY=dummy-secret
ENVFILE

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
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/meetinginbeijing.conf
else
  echo "Nginx 配置已存在，跳过写入 $NGINX_CONF"
fi

sudo nginx -t
sudo systemctl reload nginx
echo "远程部署完成。"
EOF

echo "部署流程结束。"

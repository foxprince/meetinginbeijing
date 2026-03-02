#!/bin/bash
set -a
source /home/app/git/meetinginbeijing/web/.env
set +a
exec pnpm start --port 3003

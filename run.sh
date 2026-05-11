#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "▶ Installing Python dependencies..."
pip3 install -q -r "$ROOT/backend/requirements.txt"

echo "▶ Installing frontend dependencies..."
cd "$ROOT/frontend" && npm install --silent

echo "▶ Building React frontend..."
npm run build --silent
cd "$ROOT"

echo "▶ Starting Tulu server at http://localhost:8000"
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --app-dir "$ROOT"

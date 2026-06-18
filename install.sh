#!/usr/bin/env bash
set -e

echo "=============================================="
echo -e "\033[36m  塔罗牌阵练习记录 - 一键安装脚本 (macOS/Linux)\033[0m"
echo "=============================================="
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
VENV_DIR="${BACKEND_DIR}/venv"

echo -e "\033[33m[1/2] 安装后端依赖...\033[0m"
echo "----------------------------------------------"

if [ ! -d "${BACKEND_DIR}" ]; then
    echo -e "\033[31m错误: 后端目录不存在: ${BACKEND_DIR}\033[0m"
    exit 1
fi

cd "${BACKEND_DIR}"

if [ ! -d "${VENV_DIR}" ]; then
    echo -e "\033[35m创建 Python 虚拟环境...\033[0m"
    python3 -m venv venv
else
    echo -e "\033[32m虚拟环境已存在，跳过创建\033[0m"
fi

echo -e "\033[35m激活虚拟环境并安装依赖...\033[0m"
source "${VENV_DIR}/bin/activate"

pip install --upgrade pip

if [ -f "${BACKEND_DIR}/requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo -e "\033[33m警告: requirements.txt 不存在，跳过依赖安装\033[0m"
fi

deactivate

echo -e "\033[32m后端依赖安装完成\033[0m"
echo ""

echo -e "\033[33m[2/2] 安装前端依赖...\033[0m"
echo "----------------------------------------------"

if [ ! -d "${FRONTEND_DIR}" ]; then
    echo -e "\033[31m错误: 前端目录不存在: ${FRONTEND_DIR}\033[0m"
    exit 1
fi

cd "${FRONTEND_DIR}"

if [ ! -f "${FRONTEND_DIR}/package.json" ]; then
    echo -e "\033[31m错误: package.json 不存在\033[0m"
    exit 1
fi

echo -e "\033[35m执行 npm install...\033[0m"
npm install

echo -e "\033[32m前端依赖安装完成\033[0m"
echo ""

cd "${ROOT_DIR}"

echo "=============================================="
echo -e "\033[32m  全部依赖安装完成!\033[0m"
echo "=============================================="
echo ""
echo "启动方式:"
echo -e "  \033[90m后端 (Bash): cd backend && source venv/bin/activate && python app.py\033[0m"
echo -e "  \033[90m前端 (Bash): cd frontend && npm run dev\033[0m"
echo ""

$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  塔罗牌阵练习记录 - 一键安装脚本 (Windows)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend"
$VENV_DIR = Join-Path $BACKEND_DIR "venv"

Write-Host "[1/2] 安装后端依赖..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Gray

if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "错误: 后端目录不存在: $BACKEND_DIR" -ForegroundColor Red
    exit 1
}

Set-Location $BACKEND_DIR

if (-not (Test-Path $VENV_DIR)) {
    Write-Host "创建 Python 虚拟环境..." -ForegroundColor Magenta
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 创建虚拟环境失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "虚拟环境已存在，跳过创建" -ForegroundColor Green
}

Write-Host "激活虚拟环境并安装依赖..." -ForegroundColor Magenta
$VENV_PYTHON = Join-Path $VENV_DIR "Scripts\python.exe"
$VENV_PIP = Join-Path $VENV_DIR "Scripts\pip.exe"

& $VENV_PIP install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 升级 pip 失败" -ForegroundColor Red
    exit 1
}

if (Test-Path (Join-Path $BACKEND_DIR "requirements.txt")) {
    & $VENV_PIP install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 安装后端依赖失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "警告: requirements.txt 不存在，跳过依赖安装" -ForegroundColor Yellow
}

Write-Host "后端依赖安装完成" -ForegroundColor Green
Write-Host ""

Write-Host "[2/2] 安装前端依赖..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Gray

if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "错误: 前端目录不存在: $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}

Set-Location $FRONTEND_DIR

if (-not (Test-Path (Join-Path $FRONTEND_DIR "package.json"))) {
    Write-Host "错误: package.json 不存在" -ForegroundColor Red
    exit 1
}

Write-Host "执行 npm install..." -ForegroundColor Magenta
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 安装前端依赖失败" -ForegroundColor Red
    exit 1
}

Write-Host "前端依赖安装完成" -ForegroundColor Green
Write-Host ""

Set-Location $ROOT_DIR

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  全部依赖安装完成!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "启动方式:" -ForegroundColor White
Write-Host "  后端 (PowerShell): cd backend; .\venv\Scripts\Activate.ps1; python app.py" -ForegroundColor Gray
Write-Host "  前端 (PowerShell): cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""

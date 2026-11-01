@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set PYTHONUTF8=1
title 紫微 13 维解读服务器

echo ============================================
echo   紫微 13 维解读服务器（测试用）
echo ============================================
echo.

rem ---- 找 Python ----
set "PY="
py -3 --version >nul 2>nul && set "PY=py -3"
if not defined PY python --version >nul 2>nul && set "PY=python"
if not defined PY (
  echo 这台电脑还没有安装 Python。
  echo 会帮你打开下载页：安装时请勾选 "Add python.exe to PATH"，装好后再双击这个文件。
  start https://www.python.org/downloads/
  pause
  exit /b 1
)
echo [1/4] 已找到 Python
%PY% -m pip install --quiet --disable-pip-version-check zstandard
if errorlevel 1 (
  echo 安装 zstandard 失败，请检查网络后重试。
  pause
  exit /b 1
)

rem ---- 第一次：下载资料并建库 ----
if not exist ziwei13.db (
  echo [2/4] 第一次使用：下载资料（161 MB）并建数据库（约 728 MB），需要 10-20 分钟，请不要关闭窗口...
  %PY% build_db.py --out ziwei13.db
  if errorlevel 1 (
    echo 建库失败，请把这个窗口截图给 Claude。
    pause
    exit /b 1
  )
) else (
  echo [2/4] 数据库已存在，跳过建库
)

rem ---- Cloudflare 临时通道 ----
if not exist cloudflared.exe (
  echo [3/4] 下载 Cloudflare 通道程序...
  curl -L -s -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
)
if not exist cloudflared.exe (
  echo 下载 cloudflared 失败，请检查网络后重试。
  pause
  exit /b 1
)

rem ---- 密码 ----
if exist token.txt (
  set /p API_TOKEN=<token.txt
) else (
  set /p API_TOKEN=请设一个密码（随便打几个英文或数字，按 Enter）： 
)
if not exist token.txt (>token.txt echo %API_TOKEN%)

rem ---- 启动 ----
set HOST=127.0.0.1
set PORT=8787
set ALLOW_ORIGIN=https://ziwei-app.pages.dev
set QUIET=1
echo [4/4] 启动服务器...
start "13 维解读服务器（不要关）" /min cmd /k "%PY% server.py"
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo  等一下会出现一行  https://xxxx-xxxx.trycloudflare.com
echo  把那个网址复制到 App 的「服务器网址」，密码填：%API_TOKEN%
echo  这个窗口和最小化的服务器窗口都不要关；关掉就停止。
echo  每次重新启动，网址都会变。
echo ============================================
echo.
cloudflared.exe tunnel --no-autoupdate --url http://127.0.0.1:8787
pause

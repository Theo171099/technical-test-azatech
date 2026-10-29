@echo off
title Menjalankan Azatech Order Management System
echo ========================================================
echo   Menjalankan Azatech Order Management System
echo ========================================================
echo.

echo [1/3] Memulai Backend API (Port 5000)...
start "Azatech Backend (Port 5000)" cmd /k "cd /d C:\Users\theos\.gemini\antigravity\scratch\azatech-order-system\backend && npx tsx src/server.ts"

timeout /t 3 /nobreak >nul

echo [2/3] Memulai Frontend Web (Port 3000)...
start "Azatech Frontend (Port 3000)" cmd /k "cd /d C:\Users\theos\.gemini\antigravity\scratch\azatech-order-system\frontend && npm run start"

timeout /t 3 /nobreak >nul

echo [3/3] Membuka Browser ke http://localhost:3000...
start http://localhost:3000

echo.
echo ========================================================
echo   Aplikasi berhasil dijalankan!
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:5000/api
echo   Akun Login: admin@azatech.id / password123
echo ========================================================
pause

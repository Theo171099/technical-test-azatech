Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Menjalankan Azatech Order Management System" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Memulai Backend API di jendela baru (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\theos\.gemini\antigravity\scratch\azatech-order-system\backend'; npx tsx src/server.ts"

Start-Sleep -Seconds 3

Write-Host "[2/3] Memulai Frontend Web di jendela baru (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\theos\.gemini\antigravity\scratch\azatech-order-system\frontend'; npm run start"

Start-Sleep -Seconds 3

Write-Host "[3/3] Membuka Browser http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Aplikasi telah berjalan aktif di jendela terminal terpisah!" -ForegroundColor Green
Write-Host "Akun Login: admin@azatech.id / password123" -ForegroundColor White

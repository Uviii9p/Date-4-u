# Restart Date2W Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Restarting Date2W Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop current server
Write-Host "Step 1: Stopping current server..." -ForegroundColor Yellow
$processes = Get-Process -Name node -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "✓ Server stopped successfully" -ForegroundColor Green
}
else {
    Write-Host "ℹ No running server found" -ForegroundColor Gray
}
Write-Host ""

# Step 2: Wait for port to be released
Write-Host "Step 2: Waiting for port to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "✓ Ready" -ForegroundColor Green
Write-Host ""

# Step 3: Start server
Write-Host "Step 3: Starting server..." -ForegroundColor Yellow
Set-Location -Path "server"
Write-Host "Starting in: $($ExecutionContext.SessionState.Path.CurrentLocation)" -ForegroundColor Gray
Write-Host ""
npm run dev

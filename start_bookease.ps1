param(
    [switch]$SkipInstall,
    [switch]$SkipSeed
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"
$envDevPath = Join-Path $projectRoot ".env.dev"
$envPath = Join-Path $projectRoot ".env"

Write-Host "Starting BookEase local environment..." -ForegroundColor Cyan

if (-not (Test-Path $envPath) -and (Test-Path $envDevPath)) {
    Copy-Item $envDevPath $envPath
    Write-Host "Created .env from .env.dev" -ForegroundColor Yellow
}

if (-not $SkipInstall) {
    if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        Push-Location $frontendPath
        npm.cmd install
        Pop-Location
    }
}

$backendScript = @"
Set-Location '$backendPath'
python manage.py migrate
if ('$SkipSeed' -ne 'True') { python manage.py seed_demo }
python manage.py runserver
"@

$frontendScript = @"
Set-Location '$frontendPath'
npm.cmd run dev
"@

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $backendScript
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $frontendScript
)

Write-Host "BookEase backend and frontend were launched in separate windows." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:5173" -ForegroundColor Green

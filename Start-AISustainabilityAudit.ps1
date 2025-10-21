# === Start-AISustainabilityAudit.ps1 ===
# Minimal launcher using 'conda run' (no activate), ASCII only

$ProjectRoot = "D:\Code\AI_SustainabilityAudit"
$ClientDir   = Join-Path $ProjectRoot "client"
$ComposeFile = Join-Path $ProjectRoot "docker-compose-sdmarag.yaml"
$DockerDesktopExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
$AppEnv = "local"
$OllamaPort = 11434

# 0) Start Docker Desktop if not running
try {
  if (-not (Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $DockerDesktopExe | Out-Null
    Start-Sleep -Seconds 3
  }
} catch {}

# wait for docker engine
$ready = $false
for ($i=0; $i -lt 60; $i+=3) {
  try { docker info *>$null; if ($LASTEXITCODE -eq 0) { $ready = $true; break } } catch {}
  Write-Host "Waiting for Docker engine..." -ForegroundColor Yellow
  Start-Sleep -Seconds 3
}
if (-not $ready) { throw "Docker engine not ready. Open Docker Desktop and rerun." }

# 1) docker compose up -d
Push-Location $ProjectRoot
try { docker compose -f "$ComposeFile" up -d } catch { docker-compose -f "$ComposeFile" up -d }
Pop-Location

# 2) start/reuse Ollama on 11434
$ollamaBusy = (Get-NetTCPConnection -LocalPort $OllamaPort -ErrorAction SilentlyContinue) -ne $null
if ($ollamaBusy) {
  Write-Host "Ollama already on $OllamaPort, skip starting."
} else {
  Start-Process powershell -ArgumentList "-NoExit","-Command","ollama serve"
  Start-Sleep -Seconds 2
}

# 3) backend API window
$apiCmd = "cd `"$ProjectRoot`"; `$env:APP_ENV='$AppEnv'; conda run -n smarag poetry run uvicorn server.src.main:app --host 0.0.0.0 --port 9092 --workers 1 --timeout-keep-alive 1000000"
Start-Process powershell -WorkingDirectory $ProjectRoot -ArgumentList "-NoExit","-Command",$apiCmd

# 4) celery worker window
$celeryCmd = "cd `"$ProjectRoot`"; `$env:APP_ENV='$AppEnv'; conda run -n smarag poetry run celery -A server.src.main.celery_app worker -l info --pool=threads"
Start-Process powershell -WorkingDirectory $ProjectRoot -ArgumentList "-NoExit","-Command",$celeryCmd

# 5) frontend window
$feCmd = "cd `"$ClientDir`"; npm run dev"
Start-Process powershell -WorkingDirectory $ClientDir -ArgumentList "-NoExit","-Command",$feCmd

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173/"
Start-Process "http://localhost:9092/docs"
Start-Process "http://localhost:8000/"

Write-Host "All started." -ForegroundColor Green

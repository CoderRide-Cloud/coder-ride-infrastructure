# push-all.ps1
# A single command to add, commit, and push changes across all microservices and the parent repo.

param (
    [string]$message = "Update microservices"
)

$services = @(
    "api-gateway", "discovery-server", "auth-service", "member-service", 
    "role-service", "project-service", "skill-service", "event-service", 
    "notification-service", "common-lib"
)

Write-Host "🚀 Starting Global Push..." -ForegroundColor Cyan

# 1. Update each microservice
foreach ($svc in $services) {
    if (Test-Path $svc) {
        Write-Host "`n📦 Pushing $svc..." -ForegroundColor Yellow
        Set-Location $svc
        
        # Check if there are any changes to commit
        $status = git status --porcelain
        if ($status) {
            git add .
            git commit -m $message
            git push origin main
            Write-Host "  -> ✅ Pushed changes." -ForegroundColor Green
        } else {
            Write-Host "  -> ⏩ No changes detected. Skipping." -ForegroundColor DarkGray
        }
        
        Set-Location ..
    }
}

# 2. Update the parent repository (to save the new submodule commit hashes)
Write-Host "`n🌐 Pushing Parent Infrastructure Repository..." -ForegroundColor Yellow
$parentStatus = git status --porcelain
if ($parentStatus) {
    git add .
    git commit -m "chore: Update submodules -> $message"
    git push origin main
    Write-Host "  -> ✅ Pushed parent changes." -ForegroundColor Green
} else {
    Write-Host "  -> ⏩ No changes in parent repo. Skipping." -ForegroundColor DarkGray
}

Write-Host "`n🎉 All changes successfully pushed to GitHub!" -ForegroundColor Green

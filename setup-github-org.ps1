# setup-github-org.ps1
# This script creates GitHub repositories for each microservice in the CoderRide-Cloud org,
# sets up git tracking, and links them as submodules in a parent repository.

$orgName = "CoderRide-Cloud"
$services = @(
    "api-gateway", "discovery-server", "auth-service", "member-service", 
    "role-service", "project-service", "skill-service", "event-service", 
    "notification-service", "common-lib"
)

# 1. Create a standard Spring Boot .gitignore template
$gitignoreContent = @"
HELP.md
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/

### VS Code ###
.vscode/

### Environment ###
.env
.env.local
"@

# 2. Process each microservice
foreach ($svc in $services) {
    Write-Host "Processing $svc..." -ForegroundColor Cyan
    
    if (Test-Path $svc) {
        Set-Location $svc

        # Create .gitignore if it doesn't exist
        if (-Not (Test-Path ".gitignore")) {
            Set-Content ".gitignore" $gitignoreContent
            Write-Host "  -> Created .gitignore"
        }

        # Initialize Git and Commit
        if (-Not (Test-Path ".git")) {
            git init
            git checkout -b main
            git add .
            git commit -m "Initial Spring Boot setup for $svc"
            Write-Host "  -> Initialized Git and committed files"
        }

        # Create GitHub Repository and Push
        # We suppress errors in case the repo already exists
        Write-Host "  -> Pushing to GitHub org: $orgName..."
        gh repo create "$orgName/$svc" --public --source=. --remote=origin --push

        Set-Location ..
    } else {
        Write-Host "Directory $svc not found. Skipping..." -ForegroundColor Yellow
    }
}

# 3. Setup the Parent Repository (Infrastructure & Submodules)
Write-Host "Setting up parent repository..." -ForegroundColor Cyan
if (-Not (Test-Path ".git")) {
    git init
    git checkout -b main
}

# Create root .gitignore
$rootGitignore = @"
.env
.idea/
.vscode/
*.log
"@
Set-Content ".gitignore" $rootGitignore

# Add submodules
foreach ($svc in $services) {
    if (Test-Path $svc) {
        Write-Host "  -> Adding $svc as submodule..."
        git submodule add "https://github.com/$orgName/$svc.git" $svc
    }
}

# Commit and Push Parent Repository
git add .
git commit -m "Initial setup with microservice submodules"
Write-Host "  -> Pushing parent infrastructure repository..."
gh repo create "$orgName/coder-ride-infrastructure" --public --source=. --remote=origin --push

Write-Host "🎉 Setup Complete! All repositories uploaded to https://github.com/$orgName" -ForegroundColor Green

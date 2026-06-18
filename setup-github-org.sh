#!/bin/bash
# setup-github-org.sh
# This script creates GitHub repositories for each microservice in the CoderRide-Cloud org,
# sets up git tracking, and links them as submodules in a parent repository.

ORG_NAME="CoderRide-Cloud"
SERVICES=(
    "api-gateway" "discovery-server" "auth-service" "member-service" 
    "role-service" "project-service" "skill-service" "event-service" 
    "notification-service" "common-lib"
)

# 1. Create a standard Spring Boot .gitignore template
GITIGNORE_CONTENT="HELP.md
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
.env.local"

# 2. Process each microservice
for SVC in "${SERVICES[@]}"; do
    echo -e "\033[0;36mProcessing $SVC...\033[0m"
    
    if [ -d "$SVC" ]; then
        cd "$SVC" || exit

        # Create .gitignore if it doesn't exist
        if [ ! -f ".gitignore" ]; then
            echo "$GITIGNORE_CONTENT" > .gitignore
            echo "  -> Created .gitignore"
        fi

        # Initialize Git and Commit
        if [ ! -d ".git" ]; then
            git init
            git checkout -b main
            git add .
            git commit -m "Initial Spring Boot setup for $SVC"
            echo "  -> Initialized Git and committed files"
        fi

        # Create GitHub Repository and Push
        echo "  -> Pushing to GitHub org: $ORG_NAME..."
        gh repo create "$ORG_NAME/$SVC" --public --source=. --remote=origin --push

        cd ..
    else
        echo -e "\033[0;33mDirectory $SVC not found. Skipping...\033[0m"
    fi
done

# 3. Setup the Parent Repository (Infrastructure & Submodules)
echo -e "\033[0;36mSetting up parent repository...\033[0m"
if [ ! -d ".git" ]; then
    git init
    git checkout -b main
fi

# Create root .gitignore
ROOT_GITIGNORE=".env
.idea/
.vscode/
*.log"
echo "$ROOT_GITIGNORE" > .gitignore

# Add submodules
for SVC in "${SERVICES[@]}"; do
    if [ -d "$SVC" ]; then
        echo "  -> Adding $SVC as submodule..."
        git submodule add "git@github.com-work:$ORG_NAME/$SVC.git" "$SVC"
    fi
done

# Commit and Push Parent Repository
git add .
git commit -m "Initial setup with microservice submodules"
echo "  -> Pushing parent infrastructure repository..."
gh repo create "$ORG_NAME/coder-ride-infrastructure" --public --source=. --remote=origin --push

echo -e "\033[0;32m🎉 Setup Complete! All repositories uploaded to https://github.com/$ORG_NAME\033[0m"

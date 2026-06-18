#!/bin/bash
# pull-all.sh
# A single command to pull changes across all microservices and the parent repo.

SERVICES=(
    "api-gateway" "discovery-server" "auth-service" "member-service" 
    "role-service" "project-service" "skill-service" "event-service" 
    "notification-service" "common-lib"
)

echo -e "\033[0;36m🚀 Starting Global Pull...\033[0m"

echo -e "\n\033[0;33m🌐 Pulling Parent Infrastructure Repository...\033[0m"
# Set upstream if not set
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
if [ -z "$UPSTREAM" ]; then
    git branch --set-upstream-to=origin/main main
fi
git pull origin main
git submodule update --init --recursive

# 1. Update each microservice
for SVC in "${SERVICES[@]}"; do
    if [ -d "$SVC" ]; then
        echo -e "\n\033[0;33m📦 Pulling $SVC...\033[0m"
        cd "$SVC" || exit
        
        # Set upstream if not set
        SVC_UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
        if [ -z "$SVC_UPSTREAM" ]; then
            git branch --set-upstream-to=origin/main main
        fi
        
        git pull origin main
        cd ..
    fi
done

echo -e "\n\033[0;32m🎉 All repositories successfully pulled!\033[0m"

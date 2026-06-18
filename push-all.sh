#!/bin/bash
# push-all.sh
# A single command to add, commit, and push changes across all microservices and the parent repo.

MESSAGE="${1:-Update microservices}"

SERVICES=(
    "api-gateway" "discovery-server" "auth-service" "member-service" 
    "role-service" "project-service" "skill-service" "event-service" 
    "notification-service" "common-lib"
)

echo -e "\033[0;36m🚀 Starting Global Push...\033[0m"

# 1. Update each microservice
for SVC in "${SERVICES[@]}"; do
    if [ -d "$SVC" ]; then
        echo -e "\n\033[0;33m📦 Pushing $SVC...\033[0m"
        cd "$SVC" || exit
        
        # Check if there are any changes to commit
        if [[ -n $(git status --porcelain) ]]; then
            git add .
            git commit -m "$MESSAGE"
            git push origin main
            echo -e "  -> \033[0;32m✅ Pushed changes.\033[0m"
        else
            echo -e "  -> \033[1;30m⏩ No changes detected. Skipping.\033[0m"
        fi
        
        cd ..
    fi
done

# 2. Update the parent repository (to save the new submodule commit hashes)
echo -e "\n\033[0;33m🌐 Pushing Parent Infrastructure Repository...\033[0m"
if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "chore: Update submodules -> $MESSAGE"
    git push origin main
    echo -e "  -> \033[0;32m✅ Pushed parent changes.\033[0m"
else
    echo -e "  -> \033[1;30m⏩ No changes in parent repo. Skipping.\033[0m"
fi

echo -e "\n\033[0;32m🎉 All changes successfully pushed to GitHub!\033[0m"

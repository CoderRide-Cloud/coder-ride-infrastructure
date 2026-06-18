#!/bin/bash
# fix-ssh.sh
# Updates all git remotes to use the custom SSH profile (git@github.com-work)

ORG_NAME="CoderRide-Cloud"
SERVICES=(
    "api-gateway" "discovery-server" "auth-service" "member-service" 
    "role-service" "project-service" "skill-service" "event-service" 
    "notification-service" "common-lib"
)

echo -e "\033[0;36mUpdating Git remotes to use SSH profile '-work'...\033[0m"

# 1. Update subdirectories
for SVC in "${SERVICES[@]}"; do
    if [ -d "$SVC/.git" ]; then
        echo -e "  -> Updating remote for \033[0;33m$SVC\033[0m"
        cd "$SVC" || exit
        git remote set-url origin "git@github.com-work:$ORG_NAME/$SVC.git"
        cd ..
    fi
done

# 2. Update .gitmodules in parent
if [ -f ".gitmodules" ]; then
    echo "  -> Updating .gitmodules..."
    sed -i 's|https://github.com/CoderRide-Cloud/|git@github.com-work:CoderRide-Cloud/|g' .gitmodules
    sed -i 's|git@github.com:CoderRide-Cloud/|git@github.com-work:CoderRide-Cloud/|g' .gitmodules
    git submodule sync
fi

# 3. Update parent remote
if [ -d ".git" ]; then
    echo "  -> Updating remote for parent repository..."
    git remote set-url origin "git@github.com-work:$ORG_NAME/coder-ride-infrastructure.git"
fi

echo -e "\033[0;32mDone! All repositories are now using git@github.com-work\033[0m"
echo "You can now run ./push-all.sh to push your code!"

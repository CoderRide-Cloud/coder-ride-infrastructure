#!/bin/bash
# clone-setup.sh
# Script for new developers to easily clone the CoderRide Cloud architecture

REPO_URL="https://github.com/CoderRide-Cloud/coder-ride-infrastructure.git"

echo -e "\033[0;36m🚀 Cloning CoderRide Cloud Infrastructure...\033[0m"

# Clone the parent repository
git clone $REPO_URL
cd coder-ride-infrastructure || exit

echo -e "\n\033[0;33m📦 Initializing and fetching microservice submodules...\033[0m"
# Initialize and update submodules recursively
git submodule update --init --recursive

echo -e "\n\033[0;32m🎉 Successfully cloned entire architecture!\033[0m"
echo "You can now run:"
echo "  cd coder-ride-infrastructure"
echo "  docker-compose up -d"

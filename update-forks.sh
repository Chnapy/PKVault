#!/bin/bash

# # --- PKHeX Core ---
# cd external/PKHeX || { echo "Sub-repo not found"; exit 1; }
# git remote | grep -q upstream || git remote add upstream https://github.com/kwsch/PKHeX
# git fetch upstream
# git checkout main

# if git rebase upstream/main; then
  # git push --force
# else
#   echo "Rebase PKHeX.Core failed, resolve local conflicts."
# fi

# cd ../..

# --- PKHeX.Everywhere ---
cd external/PKHeX.Everywhere || { echo "Sub-repo not found"; exit 1; }
git remote | grep -q upstream || git remote add upstream https://github.com/arleypadua/PKHeX.Everywhere
git fetch upstream
git checkout main

# if git rebase upstream/main; then
#   # git push --force
# else
#   echo "Rebase PKHeX.Everywhere failed, resolve local conflicts."
# fi

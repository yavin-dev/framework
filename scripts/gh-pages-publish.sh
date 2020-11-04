#!/usr/bin/env bash
set -e # Exit with nonzero exit code if anything fails

cd packages/app
export BUILD_NAVI_DEMO=true

echo 'Initiating connection to GitHub'
git remote add ssh-origin git@github.com:yahoo/navi.git
git fetch ssh-origin gh-pages
git branch gh-pages ssh-origin/gh-pages # Force it to track from ssh-origin if master has gh-pages as well

echo 'Building demo app'
npx ember github-pages:commit --message "Deploy gh-pages from $SD_BUILD_SHA" --destination ../../

echo 'Publishing demo app'
git push ssh-origin gh-pages:gh-pages
unset GIT_SSH_COMMAND

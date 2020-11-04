#!/usr/bin/env bash
set -e # Exit with nonzero exit code if anything fails

# Decrypt travis secrets for gh-pages commit
openssl aes-256-cbc -K $encrypted_3709885499a2_key -iv $encrypted_3709885499a2_iv -in .travis-secrets.tar.gz.enc -out /tmp/.travis-secrets.tar.gz -d
tar xvf /tmp/.travis-secrets.tar.gz -C /tmp/
echo 'Successfully decrypted travis secrets'

cd packages/app
export BUILD_NAVI_DEMO=true
COMMIT=$(git rev-parse --short HEAD)

# Set up git config
git config --global user.email 'travis@travis-ci.org'
git config --global user.name 'Travis CI'

export GIT_SSH_COMMAND='ssh -i /tmp/.travis-secrets/deploy_rsa -v -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'
echo 'Initiating connection to GitHub'
git remote add ssh-origin git@github.com:yahoo/navi.git
git fetch ssh-origin gh-pages
git branch gh-pages ssh-origin/gh-pages # Force it to track from ssh-origin if master has gh-pages as well

echo 'Building demo app'
npx ember github-pages:commit --message "Deploy gh-pages from $COMMIT" --destination ../../

echo 'Publishing demo app'
git push ssh-origin gh-pages:gh-pages
unset GIT_SSH_COMMAND

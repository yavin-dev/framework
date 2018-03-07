#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

###############################################################################
# Verify Conditions
###############################################################################

# If there are no changes then exit.
if [ -z `git diff --exit-code` ]; then
    echo "No changes to the spec on this push; exiting."
    exit 0
fi

###############################################################################
# Config Github
###############################################################################

echo "Configure Github..."

readonly GIT_SOURCE_BRANCH="master"
readonly GIT_REPO=`git config remote.origin.url`
readonly GIT_SSH_REPO=${GIT_REPO/https:\/\/github.com\//git@github.com:}
readonly GIT_USER="Travis CI"
readonly GIT_EMAIL="kilroy@oath.com"

# Get the deploy key by using Travis's stored variables to decrypt enc file
openssl aes-256-cbc \
    -K $encrypted_3709885499a2_key \
    -iv $encrypted_3709885499a2_iv \
    -in github-deploy-key.enc \
    -out github-deploy-key \
    -d
chmod 600 github-deploy-key
eval `ssh-agent -s`
ssh-add github-deploy-key

git config user.name "Travis CI"
git config user.email "kilroy@oath.com"
#git push $GIT_SSH_REPO $GIT_SOURCE_BRANCH

###############################################################################
# Config NPM
###############################################################################

echo "Configure NPM..."

# Login in to NPM
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

###############################################################################
# Lerna Publish
###############################################################################

echo "Running lerna publish..."

npm run-script lerna-publish

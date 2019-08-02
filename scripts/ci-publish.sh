#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

echo "Publishing dev build..."

# Login to NPM
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

# Publish dev build via lerna
npm run-script lerna-ci-publish

echo Publishing demo app
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
cd packages/app
export BUILD_NAVI_DEMO=true
COMMIT=$(git rev-parse --short HEAD)
git remote add ssh-origin git@github.com:yahoo/navi.git
git fetch ssh-origin gh-pages
npx ember github-pages:commit --message "Deploy gh-pages from $COMMIT}" --destination ../../
ssh-agent sh -c "ssh-add $TRAVIS_BUILD_DIR/travis-secrets/deploy_rsa;
  git push ssh-origin gh-pages:gh-pages || echo Failed to push gh-pages update"

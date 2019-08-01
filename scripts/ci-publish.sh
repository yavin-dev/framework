#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

echo "Publishing dev build..."

# Login to NPM
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

# Publish dev build via lerna
npm run-script lerna-ci-publish

echo Publishing demo app
cd packages/app
export BUILD_NAVI_DEMO=true
npx ember github-pages:commit --message 'travis update gh-pages' --destination ../../
ssh-agent sh -c 'ssh-add $TRAVIS_BUILD_DIR/travis-secrets/deploy_rsa; git push origin gh-pages:gh-pages || echo Failed to push gh-pages update'
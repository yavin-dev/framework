#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

echo "Publishing dev build..."

# Login to NPM
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

# Publish dev build via lerna
npm run-script lerna-ci-publish

# Decrypt travis secrets for gh-pages commit
openssl aes-256-cbc -K $encrypted_3709885499a2_key -iv $encrypted_3709885499a2_iv -in travis-secrets.tar.gz.enc -out travis-secrets.tar.gz -d;
tar xvf travis-secrets.tar.gz;
echo "Successfully decrypted travis secrets";

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"

cd packages/app
export BUILD_NAVI_DEMO=true
COMMIT=$(git rev-parse --short HEAD)

# Fetch gh-pages branch and build demo
ssh-agent sh -c "ssh-add $TRAVIS_BUILD_DIR/travis-secrets/deploy_rsa;
  git remote add ssh-origin git@github.com:yahoo/navi.git;
  git fetch ssh-origin gh-pages"
npx ember github-pages:commit --message "Deploy gh-pages from $COMMIT" --destination ../../

echo 'Publishing demo app'
ssh-agent sh -c "ssh-add $TRAVIS_BUILD_DIR/travis-secrets/deploy_rsa;
  git push ssh-origin gh-pages:gh-pages || echo 'Failed to push gh-pages update'"

#!/usr/bin/env bash
set -e # Exit with nonzero exit code if anything fails

# Login to NPM
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

# Fix pre/post publish warnings
npm config set unsafe-perm true

BRANCH=$(git rev-parse --abbrev-ref HEAD);

echo "Deploying yavin npm packages for branch $BRANCH"

if [ $BRANCH = 'main' ]
then
    echo 'Publishing beta build...'
    npm run-script lerna-ci-publish-beta
elif [ $BRANCH = '0.2.x-alpha' ]
then
    echo 'Publishing alpha build...'
    npm run-script lerna-ci-publish
else
    echo 'Not a publishable branch'
fi


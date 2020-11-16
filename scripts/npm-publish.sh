#!/usr/bin/env bash
set -e # Exit with nonzero exit code if anything fails

echo 'Publishing build...'

# Login to NPM
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

branch=`git branch --show-current`;

echo $branch

if [ $branch = 'master' ]
then
    echo 'Publishing beta build...'
    npm run-script lerna-ci-publish-beta
elif [ $branch = '0.2.x-alpha' ]
then
    echo 'Publishing alpha build...'
    npm run-script lerna-ci-publish
else
    echo 'Not a publishable branch'
fi


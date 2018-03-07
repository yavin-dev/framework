#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

echo "Publishing dev build..."

# Login to NPM
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

# Publish dev build via lerna
npm run-script lerna-ci-publish

#!/usr/bin/env bash
set -e # Exit with nonzero exit code if anything fails

echo 'Deploying navi webservice models to artifactory'

cd packages/webservice

BRANCH=$(git branch --show-current);

echo "Deploying navi webservice models to artifactory for branch $BRANCH"

if [ $BRANCH = 'master' ]
then
    echo 'Publishing beta build...'
    ./gradlew -PpublishTag=beta -p models artifactoryPublish
elif [ $BRANCH = '0.2.x-alpha' ]
then
    echo 'Publishing alpha build...'
    ./gradlew -p models artifactoryPublish
else
    echo 'Not a publishable branch'
fi
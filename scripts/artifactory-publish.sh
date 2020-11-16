#!/usr/bin/env bash
set -e # Exit with nonzero exit code if anything fails

echo 'Deploying navi webservice models to artifactory'

cd packages/webservice

branch=`git branch --show-current`;

echo $branch

if [ $branch = 'master' ]
then
    # Publish dev build via lerna
    echo 'Publishing beta build...'
    ./gradlew -PpublishTag=beta -p models artifactoryPublish
elif [ $branch = '0.2.x-alpha' ]
then
    echo 'Publishing alpha build...'
    ./gradlew -p models artifactoryPublish
else
    echo 'Not a publishable branch'
fi
#!/usr/bin/env bash
set -e # Exit with nonzero exit code if anything fails

echo 'Deploying navi webservice models to artifactory'

cd packages/webservice

./gradlew -PpublishTag=beta -p models artifactoryPublish

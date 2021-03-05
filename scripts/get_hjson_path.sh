#!/bin/bash

# This script will extract the path on local machine where
# we can add hjson/db files to get access to more data sources
set -e

# Look for yavin_demo based container only
ct_id=$(docker ps -f ancestor=yavin_demo --format "{{.ID}}")
if [ ! -z $ct_id ]
 then
  # extract mount info which should show a json output.
  pth=$(docker container inspect ${ct_id} -f "{{json .Mounts}}")
  echo $pth
  echo "Look for \"Source\" key in above json and use its value to find hjson location"
else
  echo "No container found matching our filter" && exit
fi

#!/bin/sh

CHROME_DESTINATION=/usr/bin/chrome

if [ -e "$CHROME_DESTINATION" ]; then
  echo "$CHROME_DESTINATION exists. Skipping download."
else 
  echo "$CHROME_DESTINATION does not exist. Starting download."
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
  sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
  apt-get update -qy
  apt-get install -qy google-chrome-stable
  ln -s /usr/bin/google-chrome ${CHROME_DESTINATION}
fi

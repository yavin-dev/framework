#!/bin/sh

CHROME_DESTINATION=/usr/bin/chrome

echo "Test: start";
test -f "$CHROME_DESTINATION"; echo $?
test -e "$CHROME_DESTINATION"; echo $?
test -x "$CHROME_DESTINATION"; echo $?
test -L "$CHROME_DESTINATION"; echo $?

ls -l "$CHROME_DESTINATION"
echo "Test: end";

if [ -e "$CHROME_DESTINATION" ]; then
  echo "$CHROME_DESTINATION exists. Skipping download."
else 
  echo "$CHROME_DESTINATION does not exist. Starting download."
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
  sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
  apt-get update -qy
  apt-get install -qy google-chrome-stable
  ln -f -s /usr/bin/google-chrome ${CHROME_DESTINATION}
fi

#!/bin/bash

## Run tests against a local browser on OSX.

PORT=8000
DOWNLOADS=~/Downloads

function usage {
  echo $1
  echo "Usage: $0 browser-name" >&2
  exit 1
}

if [[ $# -eq 0 ]]; then
  usage "Please specify a browser."
fi

TARGET="${DOWNLOADS}/${1}.json"
rm -f "${TARGET}"

URL="http://localhost:${PORT}/test-browser.html?auto=1&download=$1"

case $1 in
  safari)
    BROWSER_CMD="/Applications/Safari.app"
    ;;
  firefox)
    BROWSER_CMD="/Applications/Firefox.app"
    ;;
  chrome)
    BROWSER_CMD="/Applications/Google Chrome.app"
    ;;
  *)
    usage "Browser not recognised."
    ;;
esac

# start test server
npm run --silent server --port=$PORT & echo $! > server.PID
sleep 2

# run tests
open -a "$BROWSER_CMD" $URL

# stop test server
i=0
while [ ! -f "${TARGET}" ]
do
  sleep 1
  i=$((i+1))
  if [ "$i" -gt "60" ] ; then
    echo "Timeout." >&2
    break
  fi
done

if [ -f "${TARGET}" ] ; then
  mv "${TARGET}" results/
fi

kill `cat server.PID` && rm server.PID

#!/bin/bash

## Run tests against a local browser on OSX.

PORT=8000
DOWNLOADS=~/Downloads
PIDFILE=/tmp/http-cache-test-server.pid

function run {
  BROWSERS=( "$@" )

  # start test server
  npm run --silent server --port=$PORT --pidfile=$PIDFILE
  trap cleanup EXIT
  sleep 2

  for browser in "${BROWSERS[@]}"
  do
    test_browser "${browser}"
  done
}

function cleanup {
  # stop test server
  kill "$(cat $PIDFILE)" > /dev/null 2>&1
  rm $PIDFILE
}

function test_browser {
  BROWSER=${1}
  URL="http://localhost:${PORT}/test-browser.html?auto=1&download=${BROWSER}"

  case ${BROWSER} in
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
      usage "Browser ${BROWSER} not recognised."
      return
      ;;
  esac

  # remove target file
  TARGET="${DOWNLOADS}/${BROWSER}.json"
  rm -f "${TARGET}"

  # run tests
  open -j -a "${BROWSER_CMD}" "${URL}"

  # wait for the target to be created
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

  sleep 1
  if [ -f "${TARGET}" ] ; then
    mv "${TARGET}" results/
  fi

}

function usage {
  echo "${1}"
  echo "Usage: $0 [ browser-name ... ]" >&2
}

if [[ $# -eq 0 ]]; then
  run safari firefox chrome
else
  run "$@"
fi

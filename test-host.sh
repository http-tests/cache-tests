#!/bin/bash

## Run tests against a host/port combination.


function usage {
  echo $1
  echo "Usage: $0 host[:port] [ test-id ]" >&2
  exit 1
}

if [[ $# -eq 0 ]]; then
  usage "Please specify a host:port."
fi

# run tests
if [[ -z $2 ]]; then
  npm run --silent cli --base=http://$1
else
  npm run --silent cli --base=http://$1 --id=$2
fi

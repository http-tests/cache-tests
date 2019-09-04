#!/bin/bash

## Run tests against a local docker image with common proxy/caches.

SERVER_HOST=host.docker.internal


function usage {
  echo $1
  echo "Usage: $0 proxy-name [ test-id ]" >&2
  exit 1
}

if [[ $# -eq 0 ]]; then
  usage "Please specify a proxy."
fi

case $1 in
  squid)
    PROXY_PORT=8001
    ;;
  nginx)
    PROXY_PORT=8002
    ;;
  trafficserver)
    PROXY_PORT=8003
    ;;
  apache)
    PROXY_PORT=8004
    ;;
  varnish)
    PROXY_PORT=8005
    ;;
  *)
    usage "Proxy not recognised."
    ;;
esac

# start test server
npm run --silent server --port=8000 & echo $! > server.PID

# run proxies
docker run --name=tmp_proxies -p $PROXY_PORT:$PROXY_PORT -dt mnot/proxy-cache-tests ${SERVER_HOST} \
  > /dev/null
sleep 7

# run tests
if [[ -z $2 ]]; then
  npm run --silent cli --base=http://localhost:$PROXY_PORT
else
  npm run --silent cli --base=http://localhost:$PROXY_PORT --id=$2
fi

# stop proxies
docker kill tmp_proxies > /dev/null
docker rm tmp_proxies > /dev/null

# stop test server
kill `cat server.PID` && rm server.PID

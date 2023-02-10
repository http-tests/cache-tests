#!/bin/bash

## Run tests against a local docker image with common proxy/caches.

PIDFILE=/tmp/http-cache-test-server.pid


ALL_PROXIES=(squid nginx apache trafficserver varnish nuster)
DOCKER_PORTS=""
for PORT in {8001..8006}; do
  DOCKER_PORTS+="-p ${PORT}:${PORT} "
done

function run {
  TEST_ID="$1"
  shift
  PROXIES=( "$@" )
  # start test server
  npm run --silent server --port=8000 --pidfile=$PIDFILE &

  # run proxies container
  docker run --platform linux/amd64 --name=tmp_proxies ${DOCKER_PORTS} -dt mnot/proxy-cache-tests host.docker.internal \
    > /dev/null

  # run nuster container
  docker run --platform linux/amd64 --name=tmp_nuster -p 9001:9001 \
    -v "${PWD}/docker/nuster/nuster.cfg:/etc/nuster/nuster.cfg:ro" -dt nuster/nuster:latest \
    > /dev/null

  trap cleanup EXIT

  # give docker enough time to start
  sleep 10

  for proxy in "${PROXIES[@]}"
  do
    test_proxy "${proxy}" "${TEST_ID}"
  done
}

function cleanup {
  # stop docker containers
  docker kill tmp_proxies > /dev/null
  docker rm tmp_proxies > /dev/null
  docker kill tmp_nuster > /dev/null
  docker rm tmp_nuster > /dev/null

  # stop test server
  kill "$(cat $PIDFILE)" > /dev/null 2>&1
  rm $PIDFILE
}

function test_proxy {
  PROXY=$1
  PKG=$1
  TEST_ID=$2
  case ${PKG} in
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
      PKG=apache2
      ;;
    varnish)
      PROXY_PORT=8005
      ;;
    caddy)
      PROXY_PORT=8006
      ;;
    nuster)
      PROXY_PORT=9001
      ;;
    *)
      echo "Proxy ${PKG} not recognised."
      exit 1
      ;;
  esac

  ## caddy is not installed with apt
  if [ ${PKG} != "caddy" ]; then
    echo "* ${PKG} $(docker container exec tmp_proxies /usr/bin/apt-cache show $PKG | grep Version)"
  fi

  if [[ -z "${TEST_ID}" ]]; then
    npm run --silent cli --base=http://localhost:${PROXY_PORT} > "results/${PROXY}.json"
  else
    npm run --silent cli --base=http://localhost:${PROXY_PORT} --id="${TEST_ID}"
  fi
}

function usage {
  echo "> $0 [ -i test_id ] [ proxy... ]"
}

TEST_ID=""
while getopts "h?i:" opt; do
  case "${opt}" in
    h)
      usage
      exit 0
      ;;
    i)
      TEST_ID=$OPTARG
      ;;
    *)
      usage
      exit 1
      ;;
  esac
done
shift $((OPTIND-1))

if [[ $# -eq 0 ]]; then
  run "" "${ALL_PROXIES[@]}"
else
  run "${TEST_ID}" "${@}"
fi

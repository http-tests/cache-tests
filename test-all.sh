#!/bin/bash

./test-browser.sh safari
./test-browser.sh firefox
./test-browser.sh chrome
./test-docker.sh apache
./test-docker.sh nginx
./test-docker.sh squid
./test-docker.sh trafficserver
./test-docker.sh varnish

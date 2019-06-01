#!/bin/bash

apt-cache show nginx
echo

/usr/sbin/nginx -g "daemon off;"

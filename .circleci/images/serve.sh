#!/bin/bash

# squid
squid -f /etc/squid/squid.conf -N &

# nginx
/usr/sbin/nginx -g "daemon off;" &

# trafficserver
/usr/bin/traffic_manager &

# apache
source /etc/apache2/envvars
/usr/sbin/apache2 -X &


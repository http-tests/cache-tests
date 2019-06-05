#!/bin/bash

# If an argument is passed, make it the hostname for the origin server in proxy configs.
if [[ ! -z $1 ]] ; then

    # squid
    sed -i s/localhost/$1/g /etc/squid/conf.d/cache-test.conf

    # nginx
    sed -i s/localhost/$1/g /etc/nginx/sites-enabled/cache-test.conf

    # trafficserver
    sed -i s/localhost:8000/$1:8000/g /etc/trafficserver/remap.config

    # apache
    sed -i s/localhost/$1/g /etc/apache2/sites-enabled/cache-test.conf

fi

/bin/bash

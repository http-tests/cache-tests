#!/bin/bash

apt-cache show apache2
echo

source /etc/apache2/envvars
/usr/sbin/apache2 -X

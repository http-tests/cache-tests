#!/bin/bash

apt-cache show apache2
echo

mkdir /var/run/apache2
mkdir /var/cache/apache
chown -R www-data /var/cache/apache

source /etc/apache2/envvars
/usr/sbin/apache2 -X

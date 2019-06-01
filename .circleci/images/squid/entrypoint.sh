#!/bin/bash


# Create log dir
mkdir -p ${SQUID_LOG_DIR}
chmod -R 755 ${SQUID_LOG_DIR}
chown -R ${SQUID_USER}:${SQUID_USER} ${SQUID_LOG_DIR}

# Create cache dir
mkdir -p ${SQUID_CACHE_DIR}
chown -R ${SQUID_USER}:${SQUID_USER} ${SQUID_CACHE_DIR}

if [[ ! -d ${SQUID_CACHE_DIR}/00 ]]; then
echo "Initializing cache..."
$(which squid) -N -f /etc/squid/squid.conf -z
fi

apt-cache show squid
echo

echo "Starting squid..."
exec $(which squid) -f /etc/squid/squid.conf -NCd 1

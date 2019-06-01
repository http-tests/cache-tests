#!/bin/bash


# Create log dir
mkdir -p ${TS_LOG_DIR}
chmod -R 755 ${TS_LOG_DIR}
chown -R ${TS_USER}:${TS_USER} ${TS_LOG_DIR}

# Create cache dir
mkdir -p ${TS_CACHE_DIR}
chown -R ${TS_USER}:${TS_USER} ${TS_CACHE_DIR}

apt-cache show trafficserver
echo

echo "Starting traffic server..."
exec $(which traffic_manager)

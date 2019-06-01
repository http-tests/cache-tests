FROM ubuntu:19.04
LABEL maintainer="Mark Nottingham <mnot@mnot.net>"

# trafficserver
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends trafficserver \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

COPY ip_allow.config /etc/trafficserver/ip_allow.config
COPY records.config /etc/trafficserver/records.config
COPY remap.config /etc/trafficserver/remap.config

ENV TS_CACHE_DIR=/var/run/trafficserver
ENV TS_LOG_DIR=/var/log/trafficserver
ENV TS_USER=trafficserver

EXPOSE 8003/tcp

COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh
ENTRYPOINT ["/sbin/entrypoint.sh"]

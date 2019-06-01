FROM ubuntu:19.04
LABEL maintainer="Mark Nottingham <mnot@mnot.net>"

# squid
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends squid \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

COPY squid.conf /etc/squid/conf.d/cache-test.conf

ENV SQUID_CACHE_DIR=/var/spool/squid
ENV SQUID_LOG_DIR=/var/log/squid
ENV SQUID_USER=proxy

EXPOSE 8001/tcp

COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh
ENTRYPOINT ["/sbin/entrypoint.sh"]

FROM ubuntu:19.04
LABEL maintainer="Mark Nottingham <mnot@mnot.net>"


# package installs
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    nodejs npm git openssh-client \
    squid nginx apache2 trafficserver \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean


# squid

COPY squid/squid.conf /etc/squid/conf.d/cache-test.conf

ENV SQUID_CACHE_DIR=/var/spool/squid
ENV SQUID_LOG_DIR=/var/log/squid
ENV SQUID_USER=proxy


# nginx

RUN mkdir /var/cache/nginx
COPY nginx/nginx.conf /etc/nginx/sites-enabled/cache-test.conf


# apache

RUN a2enmod cache_socache
RUN a2enmod cache_disk
RUN a2enmod proxy_http

COPY apache/ports.conf /etc/apache2/ports.conf
COPY apache/apache.conf /etc/apache2/sites-enabled/cache-test.conf


# trafficserver

COPY trafficserver/ip_allow.config /etc/trafficserver/ip_allow.config
COPY trafficserver/records.config /etc/trafficserver/records.config
COPY trafficserver/remap.config /etc/trafficserver/remap.config

ENV TS_CACHE_DIR=/var/run/trafficserver
ENV TS_LOG_DIR=/var/log/trafficserver
ENV TS_USER=trafficserver


# entrypoint
COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh
RUN /sbin/entrypoint.sh
CMD []

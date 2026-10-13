FROM ubuntu:rolling AS trafficserver-build

# Rolling Ubuntu no longer packages ATS. Build a verified upstream release in a
# separate stage so its compiler and development dependencies stay out of the image.
ARG ATS_VERSION=10.2.0
ARG ATS_SHA512=afdd02ea6b37dc344e24e985727add89e26d0bbce4ac7f91f2c51134c8219484d6739d9b5c7c4c177f913cd0a9f756cbc0c89bcb06ee21bc159c32046e38379e
ARG ATS_BUILD_JOBS=4

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential ca-certificates cmake curl ninja-build pkg-config \
    libcap-dev libpcre2-dev libssl-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/trafficserver
RUN curl -fL --retry 3 "https://archive.apache.org/dist/trafficserver/trafficserver-${ATS_VERSION}.tar.bz2" -o ats.tar.bz2 \
    && echo "${ATS_SHA512}  ats.tar.bz2" | sha512sum -c - \
    && tar -xjf ats.tar.bz2 --strip-components=1 \
    && cmake -S . -B build -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/opt/trafficserver \
    -DWITH_USER=trafficserver -DWITH_GROUP=trafficserver \
    -DBUILD_REGRESSION_TESTING=OFF -DBUILD_TESTING=OFF \
    && cmake --build build --parallel "${ATS_BUILD_JOBS}" \
    && DESTDIR=/opt/ats-install cmake --install build

FROM ubuntu:rolling
LABEL maintainer="Mark Nottingham <mnot@mnot.net>"


# package installs

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    nodejs npm git openssh-client telnet \
    squid \
    nginx \
    libcap2 libpcre2-8-0 libssl3t64 zlib1g \
    apache2 \
    varnish \
    golang \
    haproxy \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean


# squid

# Use the test configuration directly. Ubuntu's default access rules run before
# conf.d and reject the link-local origin address used by rootless Podman.
COPY squid/squid.conf /etc/squid/squid.conf

ENV SQUID_CACHE_DIR=/var/spool/squid
ENV SQUID_LOG_DIR=/var/log/squid
ENV SQUID_USER=proxy
EXPOSE 8001


# nginx

RUN mkdir /var/cache/nginx
COPY nginx/nginx.conf /etc/nginx/sites-enabled/cache-test.conf
EXPOSE 8002


# trafficserver

COPY --from=trafficserver-build /opt/ats-install/opt/trafficserver/ /opt/trafficserver/
RUN groupadd --system trafficserver \
    && useradd --system --gid trafficserver --home-dir /opt/trafficserver/var/trafficserver \
    --shell /usr/sbin/nologin trafficserver
COPY trafficserver/ip_allow.yaml /opt/trafficserver/etc/trafficserver/ip_allow.yaml
COPY trafficserver/records.yaml /opt/trafficserver/etc/trafficserver/records.yaml
COPY trafficserver/remap.config /opt/trafficserver/etc/trafficserver/remap.config

ENV TS_CACHE_DIR=/opt/trafficserver/var/trafficserver
ENV TS_LOG_DIR=/opt/trafficserver/var/log/trafficserver
ENV TS_USER=trafficserver
EXPOSE 8003


# apache

RUN a2enmod cache_socache
RUN a2enmod cache_disk
RUN a2enmod proxy_http

COPY apache/ports.conf /etc/apache2/ports.conf
COPY apache/apache.conf /etc/apache2/sites-enabled/cache-test.conf
EXPOSE 8004


# varnish

EXPOSE 8005


# caddy

RUN go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
RUN ~/go/bin/xcaddy build --with github.com/caddyserver/cache-handler
COPY caddy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 8006


# haproxy

COPY haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg
EXPOSE 8007


# setup

COPY setup.sh /sbin/setup.sh
RUN chmod 755 /sbin/setup.sh
RUN /sbin/setup.sh

# serve

COPY serve.sh /sbin/serve.sh
RUN chmod 755 /sbin/serve.sh


# entrypoint

COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh
ENTRYPOINT ["/sbin/entrypoint.sh"]
CMD []

FROM ubuntu:19.04
LABEL maintainer="Mark Nottingham <mnot@mnot.net>"


# apache
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends apache2 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

RUN a2enmod cache_socache
RUN a2enmod cache_disk
RUN a2enmod proxy_http

COPY ports.conf /etc/apache2/ports.conf
COPY apache.conf /etc/apache2/sites-enabled/cache-test.conf

EXPOSE 8004/tcp

COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh
ENTRYPOINT ["/sbin/entrypoint.sh"]

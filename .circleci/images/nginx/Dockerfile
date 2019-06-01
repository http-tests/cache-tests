FROM ubuntu:19.04
LABEL maintainer="Mark Nottingham <mnot@mnot.net>"

# nginx
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

RUN mkdir /var/cache/nginx
COPY nginx.conf /etc/nginx/sites-enabled/cache-test.conf

EXPOSE 8002/tcp

COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh
ENTRYPOINT ["/sbin/entrypoint.sh"]

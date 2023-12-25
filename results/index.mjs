
export default [
  {
    file: 'chrome.json',
    name: 'Chrome',
    type: 'browser',
    version: '120.0.6099.109'
  },
  {
    file: 'firefox.json',
    name: 'Firefox',
    type: 'browser',
    version: '121.0',
    link: 'https://github.com/http-tests/cache-tests/wiki/Firefox'
  },
  {
    file: 'safari.json',
    name: 'Safari',
    type: 'browser',
    version: '17.2 (19617.1.17.11.9)'
  },
  {
    file: 'nginx.json',
    name: 'nginx',
    type: 'rev-proxy',
    version: '1.24.0-2ubuntu3',
    link: 'https://github.com/http-tests/cache-tests/wiki/nginx'
  },
  {
    file: 'squid.json',
    name: 'Squid',
    type: 'rev-proxy',
    version: '6.5-1ubuntu1',
    link: 'https://github.com/http-tests/cache-tests/wiki/Squid'
  },
  {
    file: 'trafficserver.json',
    name: 'ATS',
    type: 'rev-proxy',
    version: '9.2.3+ds-1+deb12u1',
    link: 'https://github.com/http-tests/cache-tests/wiki/Traffic-Server'
  },
  {
    file: 'apache.json',
    name: 'httpd',
    type: 'rev-proxy',
    version: '2.4.58-1ubuntu1',
    link: 'https://github.com/http-tests/cache-tests/wiki/Apache-httpd'
  },
  {
    file: 'varnish.json',
    name: 'Varnish',
    type: 'rev-proxy',
    version: '7.1.1-1.1ubuntu1',
    link: 'https://github.com/http-tests/cache-tests/wiki/Varnish'
  },
  {
    file: 'nuster.json',
    name: 'nuster',
    type: 'rev-proxy',
    version: 'master',
    link: 'https://github.com/http-tests/cache-tests/wiki/nuster'
  },
  {
    file: 'caddy.json',
    name: 'caddy',
    type: 'rev-proxy',
    version: '0.7.0',
    link: 'https://github.com/http-tests/cache-tests/wiki/Caddy'
  },
  {
    file: 'fastly.json',
    name: 'Fastly',
    type: 'cdn',
    version: '11-12-2023',
    link: 'https://github.com/http-tests/cache-tests/wiki/Fastly'
  }
]

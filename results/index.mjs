
export default [
  {
    file: 'chrome.json',
    name: 'Chrome',
    type: 'browser',
    version: '114.0.5735.198'
  },
  {
    file: 'firefox.json',
    name: 'Firefox',
    type: 'browser',
    version: '115.0.1',
    link: 'https://github.com/http-tests/cache-tests/wiki/Firefox'
  },
  {
    file: 'safari.json',
    name: 'Safari',
    type: 'browser',
    version: '16.5.1 (18615.2.9.11.7)'
  },
  {
    file: 'nginx.json',
    name: 'nginx',
    type: 'rev-proxy',
    version: '1.22.1-9ubuntu5',
    link: 'https://github.com/http-tests/cache-tests/wiki/nginx'
  },
  {
    file: 'squid.json',
    name: 'Squid',
    type: 'rev-proxy',
    version: '5.7-1ubuntu3',
    link: 'https://github.com/http-tests/cache-tests/wiki/Squid'
  },
  {
    file: 'trafficserver.json',
    name: 'ATS',
    type: 'rev-proxy',
    version: '9.2.1+ds-1',
    link: 'https://github.com/http-tests/cache-tests/wiki/Traffic-Server'
  },
  {
    file: 'apache.json',
    name: 'httpd',
    type: 'rev-proxy',
    version: '2.4.57-2ubuntu1',
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
    link: 'https://github.com/caddyserver/cache-handler'
  },
  {
    file: 'fastly.json',
    name: 'Fastly',
    type: 'cdn',
    version: '18-10-2021',
    link: 'https://github.com/http-tests/cache-tests/wiki/Fastly'
  }
]

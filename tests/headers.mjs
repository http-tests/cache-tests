import * as utils from '../utils.mjs';

const tests = [];

function defaultResponseHeaders (validatorType, validatorValue, additionalHeaders) {
  return [
    ['Cache-Control', `max-age=3600`],
    ['Date', 0],
    [validatorType, validatorValue]
  ].concat(additionalHeaders);
}

function checkCached ({name, id, kind='required', configuredHeaders, expectedHeaders, unexpectedHeaders=[]}) {
  const etag = utils.httpContent(`${id}-etag-1`);
  const etag1 = `"${etag}"`;
  const lm1 = utils.httpDate(Date.now(), -24 * 60 * 60);
  tests.push({
    name: `${name} with a Last-Modified validator`,
    id: `headers-lm-${id}`,
    kind,
    requests: [
      {
        response_headers: defaultResponseHeaders('Last-Modified', lm1, configuredHeaders),
        setup: true,
        pause_after: true,
      },
      {
        expected_type: 'cached',
        expected_response_headers: expectedHeaders,
        expected_response_headers_missing: unexpectedHeaders,
        setup_tests: ['expected_type']
      }
    ]
  });
  tests.push({
    name: `${name} with an ETag validator`,
    id: `headers-etag-${id}`,
    kind,
    requests: [
      {
        response_headers: defaultResponseHeaders('ETag', etag1, configuredHeaders),
        setup: true,
        pause_after: true,
      },
      {
        expected_type: 'cached',
        expected_response_headers: expectedHeaders,
        expected_response_headers_missing: unexpectedHeaders,
        setup_tests: ['expected_type']
      }
    ]
  });
}

[
  ['Test-Header'],
  ['X-Test-Header'],
  ['Content-Type', 'text/plain'],
  ['X-Frame-Options', 'deny'],
  ['X-XSS-Protection', '1'],
  ['Clear-Site-Data', 'cookies'],
  ['Connection'],
  ['Proxy-Authenticate'],
  ['Proxy-Connection'],
  ['Public-Key-Pins'],
  ['Set-Cookie', 'a=b'],
  ['Set-Cookie2', 'a=b'],
  ['Strict-Transport-Security'],
  ['Strict-Transport-Security2'],
  ['Trailer'],
  ['Transfer-Encoding'],
  ['Upgrade'],
  ['WWW-Authenticate'],
].forEach(function ([header, value=null]) {
  if (value === null) value = utils.httpContent(`${header}-value`);
  checkCached({
    name: `HTTP cache must store ${header}`,
    id: `store-${header}`,
    kind: 'check',
    configuredHeaders: [[header, value]],
    expectedHeaders: [[header, value]],
  });
});

checkCached({
  name: `Connection header inhibits caching other headers`,
  id: `omit-headers-listed-in-Connection`,
  kind: 'check',
  configuredHeaders: [
    ['Connection', 'a, b'],
    ['a', '1'],
    ['b', '2'],
    ['c', '3'],
  ],
  expectedHeaders: [['c', '3']],
  unexpectedHeaders: ['Connection', 'a', 'b']
});

checkCached({
  name: `Cache-Control:no-cache directive inhibits caching other headers`,
  id: `omit-headers-listed-in-Cache-Control-no-cache`,
  configuredHeaders: [
    ['Cache-Control', 'no-cache="a, b"'],
    ['a', '1'],
    ['b', '2'],
    ['c', '3'],
  ],
  expectedHeaders: [['c', '3']],
  unexpectedHeaders: ['a', 'b']
});

export default {
  name: 'Omit Headers From Cache',
  id: 'headers',
  description: 'These tests examine how caches omit headers from stored responses and check whether they conform to the existing requirements to omit headers, for example around [no-cache](https://httpwg.org/specs/rfc7234.html#cache-response-directive.no-cache).',
  tests
};

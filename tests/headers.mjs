import * as utils from '../utils.mjs'

const tests = []

function checkCached ({name, id, kind = 'required', configuredHeaders, expectedHeaders, unexpectedHeaders = []}) {
  tests.push({
    name: name,
    id: `headers-${id}`,
    kind,
    requests: [
      {
        response_headers: configuredHeaders.concat([
          ['Cache-Control', `max-age=3600`],
          ['Date', 0]
        ]),
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached',
        expected_response_headers: expectedHeaders,
        expected_response_headers_missing: unexpectedHeaders,
        setup_tests: ['expected_type']
      }
    ]
  })
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
  //  ['Trailer'],   // nodejs server can't send Trailer on a 304
  ['Transfer-Encoding'],
  ['Upgrade'],
  ['WWW-Authenticate']
].forEach(function ([header, value = null]) {
  if (value === null) value = utils.httpContent(`${header}-store-value`)
  checkCached({
    name: `Does HTTP cache store \`${header}\`?`,
    id: `store-${header}`,
    kind: 'check',
    // defer checking the header value until the second request
    configuredHeaders: [[header, value, false]],
    expectedHeaders: [[header, value]]
  })
})

checkCached({
  name: 'Does `Connection` header inhibit storing listed headers?',
  id: `omit-headers-listed-in-Connection`,
  configuredHeaders: [
    ['Connection', 'a, b', false],
    ['a', '1', false],
    ['b', '2', false],
    ['c', '3', false]
  ],
  expectedHeaders: [['c', '3']],
  unexpectedHeaders: ['a', 'b']
})

checkCached({
  name: 'Does `Cache-Control: no-cache` inhibit storing a listed header?',
  id: `omit-headers-listed-in-Cache-Control-no-cache-single`,
  configuredHeaders: [
    ['Cache-Control', 'no-cache="a"'],
    ['a', '1'],
    ['b', '2']
  ],
  expectedHeaders: [['b', '2']],
  unexpectedHeaders: ['a']
})

checkCached({
  name: 'Does `Cache-Control: no-cache` inhibit storing multiple listed headers?',
  id: `omit-headers-listed-in-Cache-Control-no-cache`,
  configuredHeaders: [
    ['Cache-Control', 'no-cache="a, b"'],
    ['a', '1'],
    ['b', '2'],
    ['c', '3']
  ],
  expectedHeaders: [['c', '3']],
  unexpectedHeaders: ['a', 'b']
})

export default {
  name: 'Storing Headers',
  id: 'headers',
  description: 'These tests examine how caches store headers in responses and check whether they conform to the existing requirements to omit headers, for example around [no-cache](https://httpwg.org/specs/rfc7234.html#cache-response-directive.no-cache). See [this issue](https://github.com/httpwg/http-core/issues/165) for relevant discussion.',
  tests
}

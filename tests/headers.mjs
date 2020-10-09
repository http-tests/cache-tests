import * as utils from '../lib/utils.mjs'
import headerList from './header-list.mjs'

const tests = []

function checkStoreHeader (config) {
  const id = `store-${config.name}`
  const value = 'valB' in config ? config.valB : utils.httpContent(`${config.name}-store-value`)
  const storeHeader = 'noStore' in config ? !config.noStore : true
  const requirement = storeHeader ? 'must' : 'must not'
  const expectedHeaders = storeHeader ? [[config.name, value]] : []
  const unexpectedHeaders = storeHeader ? [] : [[config.name, value]]

  var respHeaders = [
    ['Date', 0],
    [config.name, value, storeHeader]
  ]
  if (config.name !== 'Cache-Control') {
    respHeaders.push(['Cache-Control', 'max-age=3600'])
  }

  tests.push({
    name: `HTTP cache ${requirement} store \`${config.name}\` header field`,
    id: `headers-${id}`,
    kind: 'required',
    requests: [
      {
        response_headers: respHeaders,
        setup: true,
        pause_after: true,
        check_body: 'checkBody' in config ? config.checkBody : true
      },
      {
        expected_type: 'cached',
        expected_response_headers: expectedHeaders,
        expected_response_headers_missing: unexpectedHeaders,
        setup_tests: ['expected_type'],
        check_body: 'checkBody' in config ? config.checkBody : true
      }
    ]
  })
}

headerList.forEach(checkStoreHeader)

tests.push({
  name: '`Connection` header must inhibit a HTTP cache from storing listed headers',
  id: 'headers-omit-headers-listed-in-Connection',
  kind: 'required',
  requests: [
    {
      response_headers: [
        ['Connection', 'a, b', false],
        ['a', '1', false],
        ['b', '2', false],
        ['c', '3', false],
        ['Cache-Control', 'max-age=3600'],
        ['Date', 0]
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'cached',
      expected_response_headers: [['c', '3']],
      expected_response_headers_missing: ['a', 'b'],
      setup_tests: ['expected_type']
    }
  ]
})

tests.push({
  name: 'Does `Cache-Control: no-cache` inhibit storing a listed header?',
  id: 'headers-omit-headers-listed-in-Cache-Control-no-cache-single',
  kind: 'required',
  requests: [
    {
      response_headers: [
        ['Cache-Control', 'no-cache="a"'],
        ['a', '1'],
        ['b', '2'],
        ['Cache-Control', 'max-age=3600'],
        ['Date', 0]
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'cached',
      expected_response_headers: [['b', '2']],
      expected_response_headers_missing: ['a'],
      setup_tests: ['expected_type']
    }
  ]
})

tests.push({
  name: 'Does `Cache-Control: no-cache` inhibit storing multiple listed headers?',
  id: 'headers-omit-headers-listed-in-Cache-Control-no-cache',
  kind: 'required',
  requests: [
    {
      response_headers: [
        ['Cache-Control', 'no-cache="a, b"'],
        ['a', '1'],
        ['b', '2'],
        ['c', '3'],
        ['Cache-Control', 'max-age=3600'],
        ['Date', 0]
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'cached',
      expected_response_headers: [['c', '3']],
      expected_response_headers_missing: ['a', 'b'],
      setup_tests: ['expected_type']
    }
  ]
})

export default {
  name: 'Storing Headers',
  id: 'headers',
  description: 'These tests examine how caches store headers in responses and check whether they conform to the existing requirements to omit headers, for example around [no-cache](https://httpwg.org/specs/rfc7234.html#cache-response-directive.no-cache). See [this issue](https://github.com/httpwg/http-core/issues/165) for relevant discussion.',
  tests
}

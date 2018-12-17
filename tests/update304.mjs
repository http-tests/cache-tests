import * as utils from '../utils.mjs'

var tests = []

var header = 'Test-Header'
var valueA = utils.httpContent(`${header}-value-A`)
var lm1 = utils.httpDate(Date.now(), -24 * 60 * 60)
tests.push({
  name: `HTTP cache must return stored ${header} from a 304 that omits it`,
  id: `304-lm-use-stored-${header}`,
  requests: [
    {
      response_headers: [
        ['Cache-Control', 'max-age=1'],
        ['Last-Modified', lm1],
        ['Date', 0],
        [header, valueA]
      ],
      setup: true,
      pause_after: true
    },
    {
      response_headers: [
        ['Cache-Control', 'max-age=3600'],
        ['Last-Modified', lm1],
        ['Date', 0]
      ],
      expected_type: 'lm_validated',
      expected_response_headers: [
        [header, valueA]
      ],
      setup_tests: ['expected_type']
    }
  ]
})

function check304 (args) {
  var header = args[0]
  var valueA = args[1] || utils.httpContent(`${header}-value-A`)
  var valueB = args[2] || utils.httpContent(`${header}-value-B`)
  var etag = utils.httpContent(`${header}-etag-1`)
  var etag1 = `"${etag}"`
  var lm1 = utils.httpDate(Date.now(), -24 * 60 * 60)

  tests.push({
    name: `HTTP cache must update returned ${header} from a Last-Modified 304`,
    id: `304-lm-update-response-${header}`,
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=1'],
          ['Last-Modified', lm1],
          ['Date', 0],
          [header, valueA]
        ],
        setup: true,
        pause_after: true
      },
      {
        response_headers: [
          ['Cache-Control', 'max-age=3600'],
          ['Last-Modified', lm1],
          ['Date', 0],
          [header, valueB]
        ],
        expected_type: 'lm_validated',
        expected_response_headers: [
          [header, valueB]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
  tests.push({
    name: `HTTP cache must update stored ${header} from a Last-Modified 304`,
    id: `304-lm-update-stored-${header}`,
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=1'],
          ['Last-Modified', lm1],
          ['Date', 0],
          [header, valueA]
        ],
        setup: true,
        pause_after: true
      },
      {
        response_headers: [
          ['Cache-Control', 'max-age=3600'],
          ['Last-Modified', lm1],
          ['Date', 0],
          [header, valueB]
        ],
        expected_type: 'lm_validated',
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached',
        expected_response_headers: [
          [header, valueB]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
  tests.push({
    name: `HTTP cache must update returned ${header} from a ETag 304`,
    id: `304-etag-update-response-${header}`,
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=1'],
          //          ['Expires', 1],
          ['Date', 0],
          ['ETag', etag1],
          [header, valueA]
        ],
        setup: true,
        pause_after: true
      },
      {
        response_headers: [
          ['Cache-Control', 'max-age=3600'],
          //          ['Expires', 3600],
          ['Date', 0],
          ['ETag', etag1],
          [header, valueB]
        ],
        expected_type: 'etag_validated',
        expected_response_headers: [
          [header, valueB]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
  tests.push({
    name: `HTTP cache must update stored ${header} from a ETag 304`,
    id: `304-etag-update-stored-${header}`,
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=1'],
          //          ['Expires', 1],
          ['Date', 0],
          ['ETag', etag1],
          [header, valueA]
        ],
        setup: true,
        pause_after: true
      },
      {
        response_headers: [
          ['Cache-Control', 'max-age=3600'],
          //          ['Expires', 3600],
          ['Date', 0],
          ['ETag', etag1],
          [header, valueB]
        ],
        setup: true,
        pause_after: true,
        expected_type: 'etag_validated'
      },
      {
        expected_type: 'cached',
        expected_response_headers: [
          [header, valueB]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
}

[
  ['Test-Header'],
  ['X-Test-Header'],
  ['Content-Foo'],
  ['X-Content-Foo'],
  ['Content-Type', 'text/plain', 'text/plain;charset=utf-8'],
  ['Content-MD5'],
  ['Content-Location'],
  ['Content-Security-Policy'],
  ['X-Frame-Options'],
  ['X-XSS-Protection']
].forEach(check304)

export default {
  name: 'Update Headers Upon a 304',
  id: 'update304',
  tests: tests
}

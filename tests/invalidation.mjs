
import * as templates from '../lib/templates.mjs'

var tests = []

function checkInvalidation (method) {
  tests.push({
    name: `HTTP cache must invalidate the URL after a successful response to a \`${method}\` request`,
    id: `invalidate-${method}`,
    requests: [
      templates.fresh({
        setup: true
      }), {
        request_method: method,
        request_body: 'abc',
        setup: true
      }, {
        expected_type: 'not_cached'
      }
    ]
  })
  tests.push({
    name: `An optimal HTTP cache does not invalidate the URL after a failed response to a \`${method}\` request`,
    id: `invalidate-${method}-failed`,
    kind: 'optimal',
    depends_on: [`invalidate-${method}`],
    requests: [
      templates.fresh({
        setup: true
      }), {
        request_method: method,
        request_body: 'abc',
        response_status: [500, 'Internal Server Error'],
        setup: true
      }, {
        expected_type: 'cached'
      }
    ]
  })
}

function checkLocationInvalidation (method) {
  tests.push({
    name: `HTTP cache must invalidate \`Location\` URL after a successful response to a \`${method}\` request`,
    id: `invalidate-${method}-location`,
    requests: [
      templates.location({
        setup: true
      }), templates.lclResponse({
        request_method: 'POST',
        request_body: 'abc',
        setup: true
      }), templates.location({
        expected_type: 'not_cached'
      })
    ]
  })
}

function checkClInvalidation (method) {
  tests.push({
    name: `HTTP cache must invalidate \`Content-Location\` URL after a successful response to a \`${method}\` request`,
    id: `invalidate-${method}-cl`,
    requests: [
      templates.contentLocation({
        setup: true
      }), templates.lclResponse({
        request_method: method,
        request_body: 'abc',
        setup: true
      }), templates.contentLocation({
        expected_type: 'not_cached'
      })
    ]
  })
}

var methods = [
  'POST',
  'PUT',
  'DELETE',
  'M-SEARCH'
]

methods.forEach(checkInvalidation)
methods.forEach(checkLocationInvalidation)
methods.forEach(checkClInvalidation)

export default {
  name: 'Cache Invalidation',
  id: 'invalidation',
  description: 'These tests check conformance regarding [invalidation](https://httpwg.org/specs/rfc7234.html#invalidation), including when it is triggered by the `Location` and `Content-Location` response headers. Some also check for optimal behaviour, since a cache is only required to invalidate when the response is successful.',
  spec_anchors: ['invalidation'],
  tests: tests
}

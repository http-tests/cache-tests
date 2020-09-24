
import * as templates from '../lib/templates.mjs'
import * as utils from '../lib/utils.mjs'

var tests = []

function checkStatus (status) {
  var code = status[0]
  var phrase = status[1]
  var body = status[2]
  if (body === undefined) {
    body = utils.httpContent(code)
  }
  var is3xx = code > 299 && code < 400
  tests.push({
    name: 'HTTP cache must not reuse a stale `' + code + '` response with explicit freshness',
    id: `status-${code}-stale`,
    depends_on: [`status-${code}-fresh`],
    browser_skip: is3xx,
    requests: [
      templates.stale({
        response_status: [code, phrase],
        response_body: body,
        redirect: 'manual',
        setup: true
      }), {
        expected_type: 'not_cached',
        redirect: 'manual',
        response_body: body
      }
    ]
  })
  tests.push({
    name: 'An optimal HTTP cache reuses a fresh `' + code + '` response with explict freshness',
    id: `status-${code}-fresh`,
    kind: 'optimal',
    browser_skip: is3xx,
    requests: [
      templates.fresh({
        response_status: [code, phrase],
        response_body: body,
        redirect: 'manual',
        setup: true
      }), {
        expected_type: 'cached',
        response_status: [code, phrase],
        redirect: 'manual',
        response_body: body
      }
    ]
  })
}
[
  [200, 'OK'],
  [203, 'Non-Authoritative Information'],
  [204, 'No Content', null],
  [299, 'Whatever'],
  [301, 'Moved Permanently'],
  [302, 'Found'],
  [303, 'See Other'],
  [307, 'Temporary Redirect'],
  [308, 'Permanent Redirect'],
  [400, 'Bad Request'],
  [404, 'Not Found'],
  [410, 'Gone'],
  [499, 'Whatever'],
  [500, 'Internal Server Error'],
  [502, 'Bad Gateway'],
  [503, 'Service Unavailable'],
  [504, 'Gateway Timeout'],
  [599, 'Whatever']
].forEach(checkStatus)

export default {
  name: 'Status Code Cacheability',
  id: 'status',
  description: 'These tests check to see if a cache will store and reuse various status codes when they have explicit freshness information associated with them. See [this issue](https://github.com/httpwg/http-core/issues/120) for related discussion.',
  tests: tests
}

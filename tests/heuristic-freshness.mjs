import * as utils from '../lib/utils.mjs'

var tests = []

function checkStatus (status) {
  var succeed = status[0]
  var code = status[1]
  var phrase = status[2]
  var body = status[3]
  if (body === undefined) {
    body = utils.httpContent(code)
  }
  var extra = status[4] || ''
  var extraHdr = status[5]
  var expectedType = 'not_cached'
  var desired = 'HTTP cache must not reuse'
  if (succeed === true) {
    expectedType = 'cached'
    desired = 'An optimal HTTP cache should reuse'
  }
  var responseHeaders = [
    ['Last-Modified', -24 * 60 * 60],
    ['Date', 0]
  ]
  if (extraHdr) {
    responseHeaders.push(extraHdr)
  }
  tests.push({
    name: `${desired} a \`${code} ${phrase}\` response with \`Last-Modified\` based upon heuristic freshness ${extra}`,
    id: `heuristic-${code}-${expectedType}`,
    kind: succeed ? 'optimal' : 'required',
    requests: [{
      response_status: [code, phrase],
      response_headers: responseHeaders,
      response_body: body,
      setup: true
    }, {
      expected_type: expectedType,
      response_status: [code, phrase],
      response_body: body
    }]
  })
}

[
  [true, 200, 'OK'],
  [false, 201, 'Created'],
  [false, 202, 'Accepted'],
  [true, 203, 'Non-Authoritative Information'],
  [true, 204, 'No Content', null],
  [false, 403, 'Forbidden'],
  [true, 404, 'Not Found'],
  [true, 405, 'Method Not Allowed'],
  [true, 410, 'Gone'],
  [true, 414, 'URI Too Long'],
  [true, 501, 'Not Implemented'],
  [false, 502, 'Bad Gateway'],
  [false, 503, 'Service Unavailable'],
  [false, 504, 'Gateway Timeout'],
  [false, 599, 'Unknown', undefined, 'when `Cache-Control: public` is not present'],
  [true, 599, 'Unknown', undefined, 'when `Cache-Control: public` is present', ['Cache-Control', 'public']]
].forEach(checkStatus)

function checkHeuristic (delta) {
  tests.push({
    name: `Does HTTP cache reuse a response with a \`Last-Modified\` ${delta} seconds ago?`,
    id: `heuristic-delta-${delta}`,
    kind: 'check',
    requests: [{
      response_headers: [
        ['Last-Modified', -delta],
        ['Date', 0]
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'cached'
    }]
  })
}

[
  5, 10, 30, 60, 300, 600, 1200, 1800, 3600, 3600 * 12, 3600 * 24
].forEach(checkHeuristic)

export default {
  name: 'Heuristic Freshness',
  id: 'heuristic',
  description: 'These tests check whether caches are conformant and optimal in handling [heuristic freshness](https://httpwg.org/specs/rfc7234.html#heuristic.freshness). Certain status codes can be stored and reused even if they do not have an explicit freshness lifetime associated with them; these tests check to see if caches are taking advantage of that, and also make sure that other status codes are NOT cached in this way.',
  tests: tests
}

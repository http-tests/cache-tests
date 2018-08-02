import * as utils from '../utils.js'

var tests = []

function checkStatus (status) {
  var code = status[0]
  var phrase = status[1]
  var body = status[2]
  if (body === undefined) {
    body = utils.httpContent(code)
  }
  tests.push({
    name: 'HTTP cache MUST NOT reuse a stale ' + code + ' response with explicit freshness',
    requests: [
      {
        template: 'stale',
        response_status: [code, phrase],
        response_body: body
      }, {
        expected_type: 'not_cached',
        response_body: body
      }
    ]
  })
  tests.push({
    name: 'HTTP cache SHOULD reuse a fresh ' + code + ' response with explict freshness',
    requests: [
      {
        template: 'fresh',
        response_status: [code, phrase],
        response_body: body
      }, {
        expected_type: 'cached',
        response_status: [code, phrase],
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
  tests: tests
}

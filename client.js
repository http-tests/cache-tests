/* global fetch mocha it describe */

import './node_modules/mocha/mocha.js'
import templates from './templates.js'
import * as utils from './utils.js'

const noBodyStatus = new Set([204, 304])
const assert = utils.assert

var useBrowserCache = false
export function runTests (tests, browserCache) {
  if (browserCache !== undefined) useBrowserCache = browserCache
  browserSetup()
  mocha.setup({
    'ui': 'bdd'
  })
  tests.forEach(testSet => {
    describe(testSet.name, function () {
      this.timeout(10000)
      testSet.tests.forEach(function (test) {
        if (test.browser_only === true && !useBrowserCache === true) return
        if (test.browser_skip === true && useBrowserCache === true) return
        it(test.name, makeCacheTest(test))
      })
    })
  })
  mocha.run()
}

function browserSetup () {
  var head = document.getElementsByTagName('head')[0]
  var mochaLink = document.createElement('link')
  mochaLink.rel = 'stylesheet'
  mochaLink.type = 'text/css'
  mochaLink.href = '/node_modules/mocha/mocha.css'
  head.appendChild(mochaLink)
  var body = document.getElementsByTagName('body')[0]
  var target = document.createElement('div')
  target.id = 'mocha'
  body.appendChild(target)
}

function makeCacheTest (test) {
  return function () {
    var uuid = utils.token()
    var requests = expandTemplates(test)
    var fetchFunctions = []
    for (let i = 0; i < requests.length; ++i) {
      fetchFunctions.push({
        code: function (idx) {
          var config = requests[idx]
          var url = makeTestUrl(uuid, config)
          var init = fetchInit(config)
          return fetch(url, init)
            .then(makeCheckResponse(idx, config))
            .then(makeCheckResponseBody(config, uuid), function (reason) {
              if ('expected_type' in config && config.expected_type === 'error') {
                assert.throws(new TypeError(), function () { throw reason })
              } else {
                throw reason
              }
            })
        },
        pauseAfter: 'pause_after' in requests[i]
      })
    }
    var idx = 0
    function runNextStep () {
      if (fetchFunctions.length) {
        var nextFetchFunction = fetchFunctions.shift()
        if (nextFetchFunction.pauseAfter === true) {
          return nextFetchFunction.code(idx++)
            .then(pause)
            .then(runNextStep)
        } else {
          return nextFetchFunction.code(idx++)
            .then(runNextStep)
        }
      } else {
        return Promise.resolve()
      }
    }
    return putTestConfig(uuid, requests)
      .then(runNextStep)
      .then(function () {
        return getServerState(uuid)
      }).then(function (testState) {
        checkRequests(requests, testState)
        return Promise.resolve()
      })
  }
}

function expandTemplates (test) {
  var rawRequests = test.requests
  var requests = []
  for (let i = 0; i < rawRequests.length; i++) {
    var request = rawRequests[i]
    request.name = test.name
    if ('template' in request) {
      var template = templates[request['template']]
      for (let member in template) {
        if (!request.hasOwnProperty(member)) {
          request[member] = template[member]
        }
      }
    }
    requests.push(request)
  }
  return requests
}

function fetchInit (config) {
  var init = {
    'headers': []
  }
  if (!useBrowserCache) {
    init.cache = 'no-store'
    init.headers.push(['Pragma', 'foo']) // dirty hack for Fetch
    init.headers.push(['Cache-Control', 'nothing-to-see-here'])
  }
  if ('request_method' in config) init.method = config['request_method']
  if ('request_headers' in config) init.headers = config['request_headers']
  if ('name' in config) init.headers.push(['Test-Name', config.name])
  if ('request_body' in config) init.body = config['request_body']
  if ('mode' in config) init.mode = config['mode']
  if ('credentials' in config) init.mode = config['credentials']
  if ('cache' in config) init.cache = config['cache']
  return init
}

function makeCheckResponse (idx, config) {
  return function checkResponse (response) {
    var reqNum = idx + 1
    var resNum = parseInt(response.headers.get('Server-Request-Count'))
    if ('expected_type' in config) {
      if (config.expected_type === 'error') {
        assert(false, `Request ${reqNum} doesn't throw an error`)
        return response.text()
      }
      if (config.expected_type === 'cached') {
        assert(resNum < reqNum, `Response ${reqNum} does not come from cache`)
      }
      if (config.expected_type === 'not_cached') {
        assert(resNum === reqNum, `Response ${reqNum} comes from cache`)
      }
    }
    //  browsers seem to squelch 304 even in no-store mode.
    //    if (!useBrowserCache && 'expected_type' in config && config.expected_type.endsWith('validated')) {
    //      config.expected_status = 304
    //    }
    if ('expected_status' in config) {
      assert(response.status === config.expected_status,
        `Response ${reqNum} status is ${response.status}, not ${config.expected_status}`)
    } else if ('response_status' in config) {
      assert(response.status === config.response_status[0],
        `Response ${reqNum} status is ${response.status}, not ${config.response_status[0]}`)
    } else {
      assert(response.status === 200, `Response ${reqNum} status is ${response.status}, not 200`)
    }
    if ('response_headers' in config) {
      config.response_headers.forEach(function (header) {
        if (header.len < 3 || header[2] === true) {
          assert(response.headers.get(header[0]) === header[1],
            `Response ${reqNum} header ${header[0]} is "${response.headers.get(header[0])}", not "${header[1]}"`)
        }
      })
    }
    if ('expected_response_headers' in config) {
      config.expected_response_headers.forEach(function (header) {
        if (typeof header[1] === 'function') {
          var prefix = `Response ${reqNum} header ${header[0]}`
          header[1](assert, prefix, response.headers.get(header[0]), response)
        } else {
          assert(response.headers.get(header[0]) === header[1],
            `Response ${reqNum} header ${header[0]} is "${response.headers.get(header[0])}", not "${header[1]}"`)
        }
      })
    }
    return response.text()
  }
}

function makeCheckResponseBody (config, uuid) {
  return function checkResponseBody (resBody) {
    var statusCode = 200
    if ('response_status' in config) {
      statusCode = config.response_status[0]
    }
    if ('expected_response_text' in config) {
      if (config.expected_response_text !== null) {
        assert(resBody === config.expected_response_text,
          `Response body is "${resBody}", not "${config.expected_response_text}"`)
      }
    } else if ('response_body' in config && config.response_body !== null) {
      assert(resBody === config.response_body,
        `Response body is "${resBody}", not "${config.response_body}"`)
    } else if (!noBodyStatus.has(statusCode)) {
      assert(resBody === uuid, `Response body is "${resBody}", not "${uuid}"`)
    }
  }
}

function checkRequests (requests, testState) {
  var testIdx = 0
  for (let i = 0; i < requests.length; ++i) {
    var expectedValidatingHeaders = []
    var config = requests[i]
    var serverRequest = testState[testIdx]
    var reqNum = i + 1
    if ('expected_type' in config) {
      if (config.expected_type === 'cached') continue // the server will not see the request
      if (config.expected_type === 'etag_validated') {
        expectedValidatingHeaders.push('if-none-match')
      }
      if (config.expected_type === 'lm_validated') {
        expectedValidatingHeaders.push('if-modified-since')
      }
    }
    testIdx++
    expectedValidatingHeaders.forEach(vhdr => {
      assert(typeof (serverRequest) !== 'undefined', `request ${reqNum} wasn't sent to server`)
      assert(serverRequest.request_headers.hasOwnProperty(vhdr),
        `request ${reqNum} doesn't have ${vhdr} header`)
    })
    if ('expected_request_headers' in config) {
      config.expected_request_headers.forEach(expectedHdr => {
        assert(serverRequest.request_headers[expectedHdr[0].toLowerCase()] === expectedHdr[1],
          `request ${reqNum} header ${expectedHdr[0]} value is "${serverRequest.request_headers[expectedHdr[0].toLowerCase()]}", not "${expectedHdr[1]}"`)
      })
    }
  }
}

function pause () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      return resolve()
    }, 3000)
  })
}

function makeTestUrl (uuid, config) {
  var extra = ''
  if ('filename' in config) {
    extra += `/${config.filename}`
  }
  if ('query_arg' in config) {
    extra += `?${config.query_arg}`
  }
  return `/test/${uuid}${extra}`
}

function putTestConfig (uuid, requests) {
  var init = {
    'method': 'PUT',
    'headers': [['content-type', 'application/json']],
    'body': JSON.stringify(requests)
  }
  return fetch(`/config/${uuid}`, init)
    .then(function (response) {
      if (response.status !== 201) {
        console.log(`Warning: ${response.status} response when creating config for ${uuid}`)
      }
    })
}

function getServerState (uuid) {
  return fetch(`/state/${uuid}`)
    .then(function (response) {
      if (response.status === 200) {
        return response.text()
      }
    }).then(function (text) {
      if (text === undefined) return []
      return JSON.parse(text)
    })
}

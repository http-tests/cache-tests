
/*
  This is JavaScript that needs to be run in both browsers and NodeJS.
*/

import * as utils from '../utils.mjs'
import { assert } from '../utils.mjs'
import * as defines from './defines.mjs'

var theFetch = null
var useBrowserCache = false
var testArray = []
var baseUrl = ''
var testResults = {}

export var testUUIDs = {}

export function runTests (tests, myFetch, browserCache, base, chunkSize = 100) {
  theFetch = myFetch
  if (base !== undefined) baseUrl = base
  if (browserCache !== undefined) useBrowserCache = browserCache
  tests.forEach(testSet => {
    testSet.tests.forEach(test => {
      if (test.id === undefined) throw new Error('Missing test id')
      if (test.browser_only === true && !useBrowserCache === true) return
      if (test.browser_skip === true && useBrowserCache === true) return
      testArray.push(test)
    })
  })
  return runSome(testArray, chunkSize)
}

export function getResults () {
  const ordered = {}
  Object.keys(testResults).sort().forEach(key => {
    ordered[key] = testResults[key]
  })
  return ordered
}

function runSome (tests, chunkSize) {
  return new Promise((resolve, reject) => {
    var index = 0
    function next () {
      if (index < tests.length) {
        var these = tests.slice(index, index + chunkSize).map(makeCacheTest)
        index += chunkSize
        Promise.all(these).then(next)
      } else {
        resolve()
      }
    }
    next()
  })
}

function makeCacheTest (test) {
  return new Promise((resolve, reject) => {
    var uuid = utils.token()
    testUUIDs[test.id] = uuid
    var requests = inflateRequests(test)
    var responses = []
    var fetchFunctions = []
    for (let i = 0; i < requests.length; ++i) {
      fetchFunctions.push({
        code: idx => {
          var reqConfig = requests[idx]
          var reqNum = idx + 1
          var url = makeTestUrl(uuid, reqConfig)
          var init = fetchInit(idx, reqConfig)
          if (test.dump === true) {
            console.log(`${utils.GREEN}=== Client request ${reqNum}${utils.NC}`)
            if ('method' in init) {
              console.log(`    ${init.method} ${url}`)
            } else {
              console.log(`    GET ${url}`)
            }
            init.headers.forEach(header => {
              console.log(`    ${header[0]}: ${header[1]}`)
            })
            console.log('')
          }
          const checkResponse = makeCheckResponse(idx, reqConfig, uuid, test.dump)
          return theFetch(url, init)
            .then(response => {
              responses.push(response)
              return checkResponse(response)
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
      }
    }

    return putTestConfig(uuid, requests)
      .then(runNextStep)
      .then(() => {
        return getServerState(uuid)
      })
      .then(testState => {
        checkRequests(requests, responses, testState)
      })
      .then(() => { // pass
        if (test.id in testResults) throw new Error(`Duplicate test ${test.id}`)
        testResults[test.id] = true
        resolve()
      })
      .catch(err => { // fail
        if (test.id in testResults) throw new Error(`Duplicate test ${test.id}`)
        testResults[test.id] = [(err.name || 'unknown'), err.message]
        resolve()
      })
  })
}

const magicHeaderProperties = ['request_headers', 'response_headers', 'expected_request_headers', 'expected_response_headers']
function inflateRequests (test) {
  var rawRequests = test.requests
  var requests = []
  for (let i = 0; i < rawRequests.length; i++) {
    var reqConfig = rawRequests[i]
    reqConfig.name = test.name
    reqConfig.id = test.id
    reqConfig.dump = test.dump
    reqConfig.now = Date.now()
    magicHeaderProperties.forEach(magicProperty => {
      if (magicProperty in reqConfig) {
        var tmpProperty = []
        reqConfig[magicProperty].forEach(header => {
          tmpProperty.push(magicHeader(header, reqConfig))
        })
        reqConfig[magicProperty] = tmpProperty
      }
    })
    requests.push(reqConfig)
  }
  return requests
}

function magicHeader (header, reqConfig) {
  if (typeof header === 'string') return header
  var headerName = header[0].toLowerCase()
  var headerValue = header[1]
  if (defines.dateHeaders.has(headerName) && Number.isInteger(header[1])) {
    headerValue = utils.httpDate(reqConfig.now, header[1])
  }
  header[1] = headerValue
  return header
}

function fetchInit (idx, reqConfig) {
  var init = {
    headers: []
  }
  if (!useBrowserCache) {
    init.cache = 'no-store'
    init.headers.push(['Pragma', 'foo']) // dirty hack for Fetch
    init.headers.push(['Cache-Control', 'nothing-to-see-here']) // ditto
  }
  if ('request_method' in reqConfig) init.method = reqConfig.request_method
  if ('request_headers' in reqConfig) init.headers = reqConfig.request_headers
  if ('name' in reqConfig) init.headers.push(['Test-Name', reqConfig.name])
  if ('request_body' in reqConfig) init.body = reqConfig.request_body
  if ('mode' in reqConfig) init.mode = reqConfig.mode
  if ('credentials' in reqConfig) init.mode = reqConfig.credentials
  if ('cache' in reqConfig) init.cache = reqConfig.cache
  if ('redirect' in reqConfig) init.redirect = reqConfig.redirect
  init.headers.push(['Test-ID', reqConfig.id])
  init.headers.push(['Req-Num', (idx + 1).toString()])
  return init
}

function makeCheckResponse (idx, reqConfig, uuid, dump) {
  return function checkResponse (response) {
    var reqNum = idx + 1
    var resNum = parseInt(response.headers.get('Server-Request-Count'))
    if (dump === true) {
      console.log(`${utils.GREEN}=== Client response ${reqNum}${utils.NC}`)
      console.log(`    HTTP ${response.status} ${response.statusText}`)
      response.headers.forEach((hvalue, hname) => { // for some reason, node-fetch reverses these
        console.log(`    ${hname}: ${hvalue}`)
      })
      console.log('')
    }
    if ('expected_type' in reqConfig) {
      var typeSetup = setupCheck(reqConfig, 'expected_type')
      if (reqConfig.expected_type === 'cached') {
        if (response.status === 304 && isNaN(resNum)) { // some caches will not include the hdr
          // pass
        } else {
          assert(typeSetup, resNum < reqNum, `Response ${reqNum} does not come from cache`)
        }
      }
      if (reqConfig.expected_type === 'not_cached') {
        assert(typeSetup, resNum === reqNum, `Response ${reqNum} comes from cache`)
      }
    }
    //  browsers seem to squelch 304 even in no-store mode.
    //    if (!useBrowserCache && 'expected_type' in reqConfig && reqConfig.expected_type.endsWith('validated')) {
    //      reqConfig.expected_status = 304
    //    }
    if ('expected_status' in reqConfig) {
      assert(setupCheck(reqConfig, 'expected_status'),
        response.status === reqConfig.expected_status,
        `Response ${reqNum} status is ${response.status}, not ${reqConfig.expected_status}`)
    } else if ('response_status' in reqConfig) {
      assert(true, // response status is always setup
        response.status === reqConfig.response_status[0],
        `Response ${reqNum} status is ${response.status}, not ${reqConfig.response_status[0]}`)
    } else if (response.status === 999) {
      // special condition; the server thought it should have received a conditional request.
      assert(setupCheck(reqConfig, 'expected_type'), false,
        `Request ${reqNum} should have been conditional, but it was not.`)
    } else {
      assert(true, // default status is always setup
        response.status === 200,
        `Response ${reqNum} status is ${response.status}, not 200`)
    }
    if ('expected_response_headers' in reqConfig) {
      var respPresentSetup = setupCheck(reqConfig, 'expected_response_headers')
      reqConfig.expected_response_headers.forEach(header => {
        if (typeof header === 'string') {
          assert(respPresentSetup, response.headers.has(header),
            `Response ${reqNum} ${header} header not present.`)
        } else if (header.length > 2) {
          assert(respPresentSetup, response.headers.has(header[0]),
            `Response ${reqNum} ${header[0]} header not present.`)

          const value = response.headers.get(header[0])
          let msg, condition
          if (header[1] === '=') {
            const expected = response.headers.get(header[2])
            condition = value === expected
            msg = `match ${header[2]} (${expected})`
          } else if (header[1] === '>') {
            const expected = header[2]
            condition = parseInt(value) > expected
            msg = `be bigger than ${expected}`
          } else {
            throw new Error(`Unknown expected-header operator '${header[1]}'`)
          }

          assert(respPresentSetup, condition,
            `Response ${reqNum} header ${header[0]} is ${value}, should ${msg}`)
        } else {
          assert(respPresentSetup, response.headers.get(header[0]) === header[1],
            `Response ${reqNum} header ${header[0]} is "${response.headers.get(header[0])}", not "${header[1]}"`)
        }
      })
    }
    if ('expected_response_headers_missing' in reqConfig) {
      var respMissingSetup = setupCheck(reqConfig, 'expected_response_headers_missing')
      reqConfig.expected_response_headers_missing.forEach(header => {
        assert(respMissingSetup, !response.headers.has(header),
          `Response ${reqNum} includes unexpected header ${header}: "${response.headers.get(header)}"`)
      })
    }
    return response.text().then(makeCheckResponseBody(reqConfig, uuid, response.status))
  }
}

function makeCheckResponseBody (reqConfig, uuid, statusCode) {
  return function checkResponseBody (resBody) {
    if ('check_body' in reqConfig && reqConfig.check_body === false) {

    } else if ('expected_response_text' in reqConfig) {
      if (reqConfig.expected_response_text !== null) {
        assert(setupCheck(reqConfig, 'expected_response_text'),
          resBody === reqConfig.expected_response_text,
          `Response body is "${resBody}", not "${reqConfig.expected_response_text}"`)
      }
    } else if ('response_body' in reqConfig && reqConfig.response_body !== null) {
      assert(true, // response_body is always setup
        resBody === reqConfig.response_body,
        `Response body is "${resBody}", not "${reqConfig.response_body}"`)
    } else if (!defines.noBodyStatus.has(statusCode) && reqConfig.request_method !== 'HEAD') {
      assert(true, // no_body is always setup
        resBody === uuid,
        `Response body is "${resBody}", not "${uuid}"`)
    }
  }
}

function checkRequests (requests, responses, testState) {
  // compare a test's requests array against the server-side testState
  var testIdx = 0
  for (let i = 0; i < requests.length; ++i) {
    var expectedValidatingHeaders = []
    var reqConfig = requests[i]
    var response = responses[i]
    var serverRequest = testState[testIdx]
    var reqNum = i + 1
    if ('expected_type' in reqConfig) {
      var typeSetup = setupCheck(reqConfig, 'expected_type')
      if (reqConfig.expected_type === 'cached') continue // the server will not see the request
      if (reqConfig.expected_type === 'not_cached') {
        assert(typeSetup, serverRequest.request_num === reqNum, `Response ${reqNum} comes from cache (${serverRequest.request_num} on server)`)
      }
      if (reqConfig.expected_type === 'etag_validated') {
        expectedValidatingHeaders.push('if-none-match')
      }
      if (reqConfig.expected_type === 'lm_validated') {
        expectedValidatingHeaders.push('if-modified-since')
      }
    }
    testIdx++ // only increment for requests the server sees
    expectedValidatingHeaders.forEach(vhdr => {
      assert(typeSetup, typeof (serverRequest) !== 'undefined', `request ${reqNum} wasn't sent to server`)
      assert(typeSetup, Object.prototype.hasOwnProperty.call(serverRequest.request_headers, vhdr),
        `request ${reqNum} doesn't have ${vhdr} header`)
    })
    if ('expected_request_headers' in reqConfig) {
      var reqPresentSetup = setupCheck(reqConfig, 'expected_request_headers')
      reqConfig.expected_request_headers.forEach(header => {
        if (typeof header === 'string') {
          var headerName = header.toLowerCase()
          assert(reqPresentSetup, Object.prototype.hasOwnProperty.call(serverRequest.request_headers, headerName),
            `Request ${reqNum} ${header} header not present.`)
        } else {
          var reqValue = serverRequest.request_headers[header[0].toLowerCase()]
          assert(reqPresentSetup, reqValue === header[1],
            `Request ${reqNum} header ${header[0]} is "${reqValue}", not "${header[1]}"`)
        }
      })
    }
    if (typeof serverRequest !== 'undefined' && 'response_headers' in serverRequest) {
      serverRequest.response_headers.forEach(header => {
        if (useBrowserCache && defines.forbiddenResponseHeaders.has(header[0].toLowerCase())) {
          // browsers prevent reading these headers through the Fetch API so we can't verify them
          return
        }
        if (defines.skipResponseHeaders.has(header[0].toLowerCase())) {
          // these just cause spurious failures
          return
        }
        let received = response.headers.get(header[0])
        // XXX: assumes that if a proxy joins headers, it'll separate them with a comma and exactly one space
        if (Array.isArray(received)) {
          received = received.join(', ')
        }
        if (Array.isArray(header[1])) {
          header[1] = header[1].join(', ')
        }
        assert(true, // default headers is always setup
          received === header[1],
          `Response ${reqNum} header ${header[0]} is "${received}", not "${header[1]}"`)
      })
    }
  }
}

function pause () {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      return resolve()
    }, 3000)
  })
}

function makeTestUrl (uuid, reqConfig) {
  var extra = ''
  if ('filename' in reqConfig) {
    extra += `/${reqConfig.filename}`
  }
  if ('query_arg' in reqConfig) {
    extra += `?${reqConfig.query_arg}`
  }
  return `${baseUrl}/test/${uuid}${extra}`
}

const uninterestingHeaders = new Set(['date', 'expires', 'last-modified', 'content-length', 'content-type', 'connection', 'content-language', 'vary', 'mime-version'])

function putTestConfig (uuid, requests) {
  var init = {
    method: 'PUT',
    headers: [['content-type', 'application/json']],
    body: JSON.stringify(requests)
  }
  return theFetch(`${baseUrl}/config/${uuid}`, init)
    .then(response => {
      if (response.status !== 201) {
        var headers = ''
        response.headers.forEach((hvalue, hname) => { // for some reason, node-fetch reverses these
          if (!uninterestingHeaders.has(hname.toLowerCase())) {
            headers += `${hname}: ${hvalue}    `
          }
        })
        throw new utils.SetupError({ message: `PUT config resulted in ${response.status} ${response.statusText} - ${headers}` })
      }
    })
}

function getServerState (uuid) {
  return theFetch(`${baseUrl}/state/${uuid}`)
    .then(response => {
      if (response.status === 200) {
        return response.text()
      }
    }).then(text => {
      if (text === undefined) return []
      return JSON.parse(text)
    })
}

function setupCheck (reqConfig, memberName) {
  return reqConfig.setup === true || ('setup_tests' in reqConfig && reqConfig.setup_tests.indexOf(memberName) > -1)
}

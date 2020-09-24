
import * as config from './config.mjs'
import * as utils from '../utils.mjs'
import * as defines from '../lib/defines.mjs'

export function init (idx, reqConfig) {
  var init = {
    headers: []
  }
  if (!config.useBrowserCache) {
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

const magicHeaderProperties = ['request_headers', 'response_headers', 'expected_request_headers', 'expected_response_headers']

export function inflateRequests (test) {
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

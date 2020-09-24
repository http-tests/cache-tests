
import { sendResponse, getHeader, configs, stash, setStash, logRequest, logResponse } from './utils.mjs'
import { noBodyStatus, locationHeaders } from '../lib/defines.mjs'

export default function handleTest (pathSegs, request, response) {
  // identify the desired configuration for this request
  var uuid = pathSegs[0]
  if (!uuid) {
    sendResponse(response, 404, `Config Not Found for ${uuid}`)
    return
  }
  var requests = configs.get(uuid)
  if (!requests) {
    sendResponse(response, 409, `Requests not found for ${uuid}`)
    return
  }

  var serverState = stash.get(uuid) || []
  var srvReqNum = serverState.length + 1
  var cliReqNum = parseInt(request.headers['req-num']) || srvReqNum
  var reqConfig = requests[cliReqNum - 1]
  var previousConfig = requests[cliReqNum - 2]
  if (!reqConfig) {
    sendResponse(response, 409, `${requests[0].id} config not found for request ${srvReqNum} (anticipating ${requests.length})`)
    return
  }
  if (reqConfig.dump) logRequest(request, srvReqNum)

  // Determine what the response status should be
  var httpStatus = reqConfig.response_status || [200, 'OK']
  if ('expected_type' in reqConfig && reqConfig.expected_type.endsWith('validated')) {
    const previousLm = getHeader(previousConfig.response_headers, 'Last-Modified')
    if (previousLm && request.headers['if-modified-since'] === previousLm) {
      httpStatus = [304, 'Not Modified']
    }
    const previousEtag = getHeader(previousConfig.response_headers, 'ETag')
    if (previousEtag && request.headers['if-none-match'] === previousEtag) {
      httpStatus = [304, 'Not Modified']
    }
    if (httpStatus[0] !== 304) {
      httpStatus = [999, '304 Not Generated']
    }
  }
  response.statusCode = httpStatus[0]
  response.statusPhrase = httpStatus[1]

  const now = Date.now()

  // header manipulation
  var responseHeaders = reqConfig.response_headers || []
  const savedHeaders = new Map()
  responseHeaders.forEach(header => {
    var headerName = header[0].toLowerCase()
    if (locationHeaders.has(headerName) && reqConfig.magic_locations === true) { // magic!
      header[1] = `http://${request.headers.host}${request.url}/${header[1]}` // FIXME
    }
    if (headerName === 'surrogate-control' && request.headers['surrogate-capability']) {
      // right now we assume just one
      var capabilityTarget = request.headers['surrogate-capability'].split('=')[0]
      if (!capabilityTarget) {
        console.error('WARN: Capability target is empty')
      }
      header[1] = header[1].replace('CAPABILITY_TARGET', capabilityTarget)
    }
    if (response.hasHeader(header[0])) {
      var currentVal = response.getHeader(header[0])
      if (typeof currentVal === 'string') {
        response.setHeader(header[0], [currentVal, header[1]])
      } else if (Array.isArray(currentVal)) {
        response.setHeader(header[0], currentVal.concat(header[1]))
      } else {
        console.log(`ERROR: Unanticipated header type of ${typeof currentVal} for ${header[0]}`)
      }
    } else {
      response.setHeader(header[0], header[1])
    }
    if (header.length < 3 || header[2] === true) {
      savedHeaders.set(header[0], response.getHeader(header[0]))
    }
  })

  if (!response.hasHeader('content-type')) {
    response.setHeader('Content-Type', 'text/plain')
  }

  serverState.push({
    request_num: parseInt(request.headers['req-num']),
    request_method: request.method,
    request_headers: request.headers,
    response_headers: Array.from(savedHeaders.entries())
  })
  setStash(uuid, serverState)

  response.setHeader('Server-Request-Count', srvReqNum)
  response.setHeader('Server-Now', now, 0)

  if (reqConfig.dump) logResponse(response, srvReqNum)

  // Response body generation
  var content = reqConfig.response_body || uuid
  if (noBodyStatus.has(response.statusCode)) {
    response.end()
  } else {
    response.end(content)
  }
}

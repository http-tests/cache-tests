/* global URL */


import http from 'http'
import https from 'https'
import path from 'path'
import fs from 'fs'
import process from 'process'

import { BLUE, NC } from '../lib/defines.mjs'

const protocol = process.env.npm_config_protocol || process.env.npm_package_config_protocol
const port = process.env.npm_config_port || process.env.npm_package_config_port
const baseUrl = `${protocol}://localhost:${port}/`

const mimeTypes = {
  html: 'text/html',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  js: 'application/javascript',
  mjs: 'application/javascript',
  css: 'text/css'
}
const noBodyStatus = new Set([204, 304])
const locationHeaders = new Set(['location', 'content-location'])

function handleMain (request, response) {
  var url = new URL(request.url, baseUrl)
  var pathSegs = url.pathname.split('/')
  pathSegs.shift()
  var dispatch = pathSegs.shift()
  if (dispatch === 'config') {
    handleConfig(pathSegs, request, response)
  } else if (dispatch === 'test') {
    handleTest(pathSegs, request, response)
  } else if (dispatch === 'state') {
    handleState(pathSegs, request, response)
  } else {
    handleFile(url, request, response)
  }
}

function handleFile (url, request, response) {
  var urlPath = path.normalize(url.pathname)
  if (urlPath === '/') urlPath = '/index.html'
  var filename = path.join(process.cwd(), urlPath)
  if (!fs.existsSync(filename)) {
    sendResponse(response, 404, `${urlPath} Not Found`)
    return
  }
  var mimeType = mimeTypes[path.extname(filename).split('.')[1]] || 'application/octet-stream'
  response.writeHead(200, { 'Content-Type': mimeType })
  var fileStream = fs.createReadStream(filename)
  fileStream.pipe(response)
}

var configs = new Map()
function handleConfig (pathSegs, request, response) {
  var uuid = pathSegs[0]
  if (request.method !== 'PUT') {
    sendResponse(response, 405, `${request.method} request to config for ${uuid}`)
    return
  }
  if (configs.has(uuid)) {
    sendResponse(response, 409, `Config already exists for ${uuid}`)
    return
  }
  var body = ''
  request.on('data', chunk => {
    body += chunk
  })
  request.on('end', () => {
    configs.set(uuid, JSON.parse(body))
    response.statusCode = 201
    response.end('OK')
  })
}

var stash = new Map()
function handleState (pathSegs, request, response) {
  var uuid = pathSegs[0]
  var state = stash.get(uuid)
  if (state === undefined) {
    sendResponse(response, 404, `State not found for ${uuid}`)
    return
  }
  response.setHeader('Content-Type', 'text/plain')
  response.end(JSON.stringify(state))
}

function handleTest (pathSegs, request, response) {
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
  if (reqConfig.dump) {
    console.log(`${BLUE}=== Server request ${srvReqNum}${NC}`)
    console.log(`    ${request.method} /test/${pathSegs.join('/')}`)
    for (const [key, value] of Object.entries(request.headers)) {
      console.log(`    ${key}: ${value}`)
    }
    console.log('')
  }

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
  stash.set(uuid, serverState)

  response.setHeader('Server-Request-Count', srvReqNum)
  response.setHeader('Server-Now', now, 0)

  if (reqConfig.dump) {
    console.log(`${BLUE}=== Server response ${srvReqNum}${NC}`)
    console.log(`    HTTP ${response.statusCode} ${response.statusPhrase}`)
    for (const [key, value] of Object.entries(response.getHeaders())) {
      console.log(`    ${key}: ${value}`)
    }
    console.log('')
  }

  // Response body generation
  var content = reqConfig.response_body || uuid
  if (noBodyStatus.has(response.statusCode)) {
    response.end()
  } else {
    response.end(content)
  }
}

function sendResponse (response, statusCode, message) {
  console.log(`SERVER WARNING: ${message}`)
  response.writeHead(statusCode, { 'Content-Type': 'text/plain' })
  response.write(`${message}\n`)
  response.end()
}

function getHeader (headers, headerName) {
  var result
  headers.forEach(header => {
    if (header[0].toLowerCase() === headerName.toLowerCase()) {
      result = header[1]
    }
  })
  return result
}

var server
if (protocol.toLowerCase() === 'https') {
  const options = {
    key: fs.readFileSync(process.env.npm_config_keyfile),
    cert: fs.readFileSync(process.env.npm_config_certfile)
  }
  server = https.createServer(options, handleMain)
} else {
  server = http.createServer(handleMain)
}
server.on('listening', () => {
  const host = (server.address().family === 'IPv6')
    ? `[${server.address().address}]` : server.address().address
  console.log(`Listening on ${protocol.toLowerCase()}://${host}:${server.address().port}/`)
})
server.listen(port)

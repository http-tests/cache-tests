/* global URL */

const http = require('http')
const https = require('https')
const path = require('path')
const fs = require('fs')
const process = require('process')

const protocol = process.env.npm_config_protocol || process.env.npm_package_config_protocol
const port = process.env.npm_config_port || process.env.npm_package_config_port
const baseUrl = `${protocol}://localhost:${port}/`

const mimeTypes = {
  'html': 'text/html',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'js': 'application/javascript',
  'mjs': 'application/javascript',
  'css': 'text/css'
}
const noteHeaders = new Set(['content-type', 'access-control-allow-origin', 'last-modified', 'etag'])
const noBodyStatus = new Set([204, 304])
const locationHeaders = new Set(['location', 'content-location'])
const dateHeaders = new Set(['date', 'expires', 'last-modified'])

function handleMain (request, response) {
  var url = new URL(request.url, baseUrl)
  var pathSegs = url.pathname.split('/')
  pathSegs.shift()
  var dispatch = pathSegs.shift()
  if (dispatch === 'config') {
    handleConfig(pathSegs, request, response)
  } else if (dispatch === 'test') {
    handleXhr(pathSegs, request, response)
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
  response.writeHead(200, {'Content-Type': mimeType})
  console.log(`${urlPath} 200 ${mimeType}`)
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
  request.on('data', function (chunk) {
    body += chunk
  })
  request.on('end', function () {
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

function handleXhr (pathSegs, request, response) {
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
  var config = requests[serverState.length]
  var previousConfig = requests[serverState.length - 1]
  if (!config) {
    sendResponse(response, 409, `WARN: config not found for request ${serverState.length + 1} of ${requests.length} for ${requests[0].name}`)
    return
  } else {
    console.log(`      request ${serverState.length + 1} of ${requests.length} for ${config.name}`)
  }
  if (config.expected_type === 'cached') {
    console.log(`INFO: cached response not used for request ${requests.length} of ${config.name}`)
  }
  var state = {
    'now': Date.now(),
    'request_method': request.method,
    'request_headers': request.headers,
    'request_num': parseInt(request.headers['req-num'])
  }
  serverState.push(state)
  stash.set(uuid, serverState)
  var notedHeaders = new Map()
  var responseHeaders = config.response_headers || []
  responseHeaders.forEach(header => {
    if (locationHeaders.has(header[0].toLowerCase())) { // magic!
      header[1] = `http://${request.headers['host']}${request.url}/${header[1]}` // FIXME
    }
    if (dateHeaders.has(header[0].toLowerCase()) && Number.isInteger(header[1])) { // magic!
      header[1] = httpDate(state.now, header[1])
    }
    response.setHeader(header[0], header[1])
    if (noteHeaders.has(header[0].toLowerCase())) {
      notedHeaders.set(header[0].toLowerCase(), header[1])
    }
  })

  if (!notedHeaders.has('content-type')) {
    response.setHeader('Content-Type', 'text/plain')
  }
  response.setHeader('Server-Request-Count', serverState.length)
  response.setHeader('Server-Now', httpDate(state.now, 0))

  var httpStatus = config['response_status'] || [200, 'OK']
  if ('expected_type' in config && config.expected_type.endsWith('validated')) {
    let previousLm = getHeader(previousConfig.response_headers, 'Last-Modified')
    if (previousLm && request.headers['if-modified-since'] === previousLm) {
      httpStatus = [304, 'Not Modified']
    }
    let previousEtag = getHeader(previousConfig.response_headers, 'ETag')
    if (previousEtag && request.headers['if-none-match'] === previousEtag) {
      httpStatus = [304, 'Not Modified']
    }
    if (httpStatus[0] !== 304) {
      console.log(`WARN: request ${serverState.length + 1} of ${requests.length} for ${requests[0].name} should have been a 304`)
      httpStatus = [999, '304 Not Generated']
    }
  }
  response.statusCode = httpStatus[0]
  response.statusPhrase = httpStatus[1]

  var content = config['response_body'] || uuid
  if (noBodyStatus.has(response.statusCode)) {
    response.end()
  } else {
    response.end(content)
  }
}

function sendResponse (response, statusCode, message) {
  console.log(message)
  response.writeHead(statusCode, {'Content-Type': 'text/plain'})
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

function httpDate (now, deltaSecs) {
  return new Date(now + (deltaSecs * 1000)).toGMTString()
}

if (protocol.toLowerCase() === 'https') {
  const options = {
    key: process.env.npm_config_keyfile,
    cert: process.env.npm_config_certfile
  }
  https.createServer(options, handleMain).listen(port)
} else {
  http.createServer(handleMain).listen(port)
}

console.log(`Serving ${protocol} on port ${port}`)


export function sendResponse (response, statusCode, message) {
  console.log(`SERVER WARNING: ${message}`)
  response.writeHead(statusCode, { 'Content-Type': 'text/plain' })
  response.write(`${message}\n`)
  response.end()
}

export function getHeader (headers, headerName) {
  var result
  headers.forEach(header => {
    if (header[0].toLowerCase() === headerName.toLowerCase()) {
      result = header[1]
    }
  })
  return result
}

// stash for server state
export var stash = new Map()

export function setStash (key, value) {
  stash.set(key, value)
}

// configurations
export var configs = new Map()

export function setConfig (key, value) {
  configs.set(key, value)
}

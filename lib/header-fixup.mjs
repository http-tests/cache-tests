
import { locationHeaders, dateHeaders } from './defines.mjs'
import { httpDate } from './utils.mjs'

export function fixupResponseHeader (header, respHeaders, reqConfig) {
  var headerName = header[0].toLowerCase()

  // Date headers
  var serverNow = parseInt(respHeaders['server-now'])
  if (dateHeaders.has(headerName) && Number.isInteger(header[1])) {
    header[1] = httpDate(serverNow, header[1])
  }

  // Location headers
  var baseUrl = respHeaders['server-base-url']
  if (locationHeaders.has(headerName) && reqConfig.magic_locations) {
    if (header[1]) {
      header[1] = `${baseUrl}/${header[1]}`
    } else {
      header[1] = `${baseUrl}`
    }
  }

  // Surrogate-Control
  var capabilitySeen = respHeaders['capability-seen']
  if (headerName === 'surrogate-control' && capabilitySeen) {
    // right now we assume just one
    var capabilityTarget = capabilitySeen.split('=')[0]
    if (!capabilityTarget) {
      console.error('WARN: Capability target is empty')
    }
    header[1] = header[1].replace('CAPABILITY_TARGET', capabilityTarget)
  }

  return header
}


import * as config from './config.mjs'
import * as utils from '../utils.mjs'

export function pause () {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      return resolve()
    }, 3000)
  })
}

export function makeTestUrl (uuid, reqConfig) {
  var extra = ''
  if ('filename' in reqConfig) {
    extra += `/${reqConfig.filename}`
  }
  if ('query_arg' in reqConfig) {
    extra += `?${reqConfig.query_arg}`
  }
  return `${config.baseUrl}/test/${uuid}${extra}`
}

const uninterestingHeaders = new Set(['date', 'expires', 'last-modified', 'content-length', 'content-type', 'connection', 'content-language', 'vary', 'mime-version'])

export function putTestConfig (uuid, requests) {
  var init = {
    method: 'PUT',
    headers: [['content-type', 'application/json']],
    body: JSON.stringify(requests)
  }
  return config.fetch(`${config.baseUrl}/config/${uuid}`, init)
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

export function getServerState (uuid) {
  return config.fetch(`${config.baseUrl}/state/${uuid}`)
    .then(response => {
      if (response.status === 200) {
        return response.text()
      }
    }).then(text => {
      if (text === undefined) return []
      return JSON.parse(text)
    })
}

export function setupCheck (reqConfig, memberName) {
  return reqConfig.setup === true || ('setup_tests' in reqConfig && reqConfig.setup_tests.indexOf(memberName) > -1)
}

export function logRequest (url, init, reqNum) {
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

export function logResponse (response, reqNum) {
  console.log(`${utils.GREEN}=== Client response ${reqNum}${utils.NC}`)
  console.log(`    HTTP ${response.status} ${response.statusText}`)
  response.headers.forEach((hvalue, hname) => { // for some reason, node-fetch reverses these
    console.log(`    ${hname}: ${hvalue}`)
  })
  console.log('')
}

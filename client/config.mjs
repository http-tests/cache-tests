
export var fetch = null
export var useBrowserCache = false
export var baseUrl = ''

export function setFetch (call) {
  if (call !== undefined) {
    if ('bind' in call) {
      fetch = call.bind(fetch)
    } else {
      fetch = call
    }
  }
}

export function setUseBrowserCache (bool) {
  if (bool !== undefined) useBrowserCache = bool
}

export function setBaseUrl (url) {
  if (url !== undefined) baseUrl = url
}

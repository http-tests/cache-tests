
export const RED = '\x1b[31m'
export const GREEN = '\x1b[32m'
export const BLUE = '\x1b[34m'
export const NC = '\x1b[0m'

export function AssertionError (options) {
  this.name = 'Assertion'
  this.message = options.message
}

export function SetupError (options) {
  this.name = 'Setup'
  this.message = options.message
}

export function assert (isSetup, expr, message) {
  if (expr) return
  if (isSetup) {
    throw new SetupError({ message: message })
  } else {
    throw new AssertionError({ message: message })
  }
}

const contentSeed = 1
var contentStore = {}
export function httpContent (csKey, contentLength = 15) {
  if (csKey in contentStore) {
    return contentStore[csKey]
  } else {
    var keySeed = 0
    for (let i = 0; i < csKey.length; i++) {
      keySeed += csKey.charCodeAt(i)
    }
    var contents = []
    for (let i = 0; i < contentLength; ++i) {
      var idx = ((i * keySeed * contentSeed) % 26) + 65
      contents.push(String.fromCharCode(idx))
    }
    var content = contents.join('')
    contentStore[csKey] = content
    return content
  }
}

export function token () {
  var uuid = [toHex(randInt(32), 8),
    toHex(randInt(16), 4),
    toHex(0x4000 | randInt(12), 4),
    toHex(0x8000 | randInt(14), 4),
    toHex(randInt(48), 12)].join('-')
  return uuid
}

function randInt (bits) {
  if (bits < 1 || bits > 53) {
    throw new TypeError()
  } else {
    if (bits >= 1 && bits <= 30) {
      return 0 | ((1 << bits) * Math.random())
    } else {
      var high = (0 | ((1 << (bits - 30)) * Math.random())) * (1 << 30)
      var low = 0 | ((1 << 30) * Math.random())
      return high + low
    }
  }
}

function toHex (x, length) {
  var rv = x.toString(16)
  while (rv.length < length) {
    rv = '0' + rv
  }
  return rv
}

export function httpDate (now, deltaSecs) {
  return new Date(now + (deltaSecs * 1000)).toGMTString()
}

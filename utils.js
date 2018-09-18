/* global btoa */

function AssertionError (options) {
  this.name = 'Assertion'
  this.message = options.message
  this.htmlMessage = options.message
}

export function assert (expr, message) {
  if (expr) return
  throw new AssertionError({message: message})
}

var contentStore = {}
export function httpContent (csKey) {
  if (csKey in contentStore) {
    return contentStore[csKey]
  } else {
    var content = btoa(Math.random() * Date.now())
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

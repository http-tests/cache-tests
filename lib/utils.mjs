
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

var rfc850day = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
}

var rfc850month = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
}

export function httpDate (now, deltaSecs, format) {
  var instant = new Date(now + (deltaSecs * 1000))
  if (format && format === 'rfc850') {
    var day = rfc850day[instant.getUTCDay()]
    var date = instant.getUTCDate().toString().padStart(2, '0')
    var month = rfc850month[instant.getUTCMonth()]
    var year = instant.getUTCFullYear().toString().slice(2)
    var hours = instant.getUTCHours().toString().padStart(2, '0')
    var mins = instant.getUTCMinutes().toString().padStart(2, '0')
    var secs = instant.getUTCSeconds().toString().padStart(2, '0')
    // Sunday, 06-Nov-94 08:49:37 GMT
    return `${day}, ${date}-${month}-${year} ${hours}:${mins}:${secs} GMT`
  }
  return instant.toGMTString()
}

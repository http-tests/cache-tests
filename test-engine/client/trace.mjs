import * as defines from '../lib/defines.mjs'

// Traces end up in public results files, and in git. These rules keep them stable between runs
// (dates, UUIDs, per-request identifiers) and free of details of the machines and networks the
// tests ran on (hosts, addresses, cookies). The device under test isn't a secret, so its
// User-Agent and the like are kept. The elision rules are a denylist, so they can't catch
// everything a proxy or CDN decides to add.

// Tests use offsets of at most a month or so; anything further out is a literal date.
const MAX_OFFSET = 365 * 24 * 3600

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const imfDate = /^[A-Z][a-z]{2}, (\d\d) ([A-Z][a-z]{2}) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/
const rfc850Date = /^[A-Z][a-z]+day, (\d\d)-([A-Z][a-z]{2})-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/

const ipv4 = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g
const ipv6 = /(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{0,4}::(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{0,4}/gi

// carry a client's address; every element becomes [ip], so the hop count survives
const addressHeaders = new Set(['x-forwarded-for', 'x-real-ip', 'x-client-ip', 'x-cluster-client-ip', 'true-client-ip', 'cf-connecting-ip', 'fastly-client-ip', 'client-ip'])
const hostHeaders = new Set(['host', 'x-forwarded-host'])
// differ on every request
const idHeaders = new Set(['x-request-id', 'x-correlation-id', 'x-trace-id', 'x-amzn-trace-id', 'x-amz-cf-id', 'x-amz-request-id', 'x-cloud-trace-context', 'x-b3-traceid', 'x-b3-spanid', 'traceparent', 'tracestate', 'cf-ray', 'x-varnish', 'x-served-by', 'x-akamai-request-id', 'x-edge-request-id'])
const timingHeaders = new Set(['server-timing', 'x-response-time', 'x-runtime', 'x-timer', 'x-envoy-upstream-service-time'])
// may carry identifiers from the test environment
const redactedHeaders = new Set(['cookie'])

// the test's identity is in the page already; see fetching.init() for the Pragma and Cache-Control
// values, which defeat browser caching and may be joined to the test's own by the time they arrive
const cacheDefeaters = { pragma: 'foo', 'cache-control': 'nothing-to-see-here' }

function hiddenRequestHeader (key) {
  return key === 'test-id' || key === 'test-name'
}

function withoutCacheDefeater (key, value) {
  const defeater = cacheDefeaters[key]
  if (defeater === undefined) return value
  return value === defeater ? '' : value.replace(new RegExp(`^${defeater}, `), '')
}

function parseHttpDate (value) {
  let match = imfDate.exec(value)
  if (match) {
    const month = months.indexOf(match[2])
    if (month > -1) return { ms: Date.UTC(+match[3], month, +match[1], +match[4], +match[5], +match[6]), format: '' }
  }
  match = rfc850Date.exec(value)
  if (match) {
    const month = months.indexOf(match[2])
    if (month > -1) return { ms: Date.UTC(2000 + +match[3], month, +match[1], +match[4], +match[5], +match[6]), format: ' rfc850' }
  }
  return null
}

// Dates are relative to the server's clock when it generated the response (the Server-Now
// header), which is how the tests specify them: `[now - 60]` is a minute in the past.
function normaliseDate (name, value, now) {
  const date = parseHttpDate(value)
  if (!date) return value
  if (name === 'date') return '[now]'
  if (!Number.isFinite(now)) return value
  const offset = Math.round(date.ms / 1000) - Math.floor(now / 1000)
  if (Math.abs(offset) > MAX_OFFSET) return value
  return `[now ${offset < 0 ? '-' : '+'} ${Math.abs(offset)}${date.format}]`
}

function elideVia (value) {
  return value.split(',').map(hop => {
    const match = /^\s*(\S+)\s+\S+/.exec(hop)
    return match ? `${match[1]} [proxy]` : '[proxy]'
  }).join(', ')
}

function elide (name, value) {
  if (addressHeaders.has(name)) return value.split(',').map(() => '[ip]').join(', ')
  if (hostHeaders.has(name)) return '[host]'
  if (name === 'via') return elideVia(value)
  if (name === 'forwarded') {
    return value
      .replace(/\b(for|by)=("[^"]*"|[^;,\s]*)/gi, '$1=[ip]')
      .replace(/\bhost=("[^"]*"|[^;,\s]*)/gi, 'host=[host]')
  }
  if (idHeaders.has(name)) return '[id]'
  if (timingHeaders.has(name)) return '[time]'
  if (redactedHeaders.has(name)) return '[redacted]'
  return value.replace(ipv4, '[ip]').replace(ipv6, '[ip]')
}

// Bodies are usually the UUID (not recorded), but may be a truncated copy of it.
export function traceBody (body, uuid) {
  if (uuid.startsWith(body)) return `[test UUID, first ${body.length} characters]`
  return body.replaceAll(uuid, '[test UUID]').slice(0, 1000)
}

// Flattens headers (pairs, Headers or a plain object) into a lowercase-keyed object for traces.
//   uuid: the test's UUID, so URLs to it can be elided
//   now:  the server's clock (ms) that dates are relative to
//   sent: headers the test itself sent; those are its own data, so aren't elided
//   elide: false for headers that are all the test's own, like its request
//   request: true for a request, where only the headers identifying the test are hidden (the
//            rest, like Req-Num, are sent to the origin); otherwise the server's harness headers are
export function traceHeaders (headers, { uuid, now, sent = {}, elide: doElide = true, request = false } = {}) {
  const entries = Array.isArray(headers)
    ? headers
    : (typeof headers.entries === 'function' ? Array.from(headers.entries()) : Object.entries(headers))
  const testUrl = uuid && new RegExp(`(?:https?://[^/\\s]+)?/test/${uuid}`, 'g')
  const out = {}
  for (const [name, rawValue] of entries) {
    const key = name.toLowerCase()
    let value = Array.isArray(rawValue) ? rawValue.join(', ') : String(rawValue)
    if (request) value = withoutCacheDefeater(key, value)
    if (request ? hiddenRequestHeader(key) || value === '' : defines.harnessHeaders.has(key)) continue
    if (defines.dateHeaders.has(key)) value = normaliseDate(key, value, now)
    if (testUrl) value = value.replace(testUrl, '[test URL]')
    if (doElide && !(key in sent)) value = elide(key, value)
    out[key] = key in out ? `${out[key]}, ${value}` : value
  }
  return out
}

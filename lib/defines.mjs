
export const noBodyStatus = new Set([204, 304])

export const dateHeaders = new Set(['date', 'expires', 'last-modified', 'if-modified-since', 'if-unmodified-since'])

// https://fetch.spec.whatwg.org/#forbidden-response-header-name
export const forbiddenResponseHeaders = new Set(['set-cookie', 'set-cookie2'])

// headers to skip when checking response_headers (not expected)
export const skipResponseHeaders = new Set(['date'])

function makeTemplate (template) {
  return function (request) {
    return Object.assign({}, template, request)
  }
}

export const fresh = makeTemplate({
  response_headers: [
    ['Expires', 100000],
    ['Last-Modified', 0],
    ['Date', 0]
  ]
})

export const stale = makeTemplate({
  response_headers: [
    ['Expires', -5000],
    ['Last-Modified', -100000],
    ['Date', 0]
  ]
})

export const becomeStale = makeTemplate({
  response_headers: [
    ['Cache-Control', 'max-age=2'],
    ['Template-A', '1']
  ],
  setup: true,
  pause_after: true
})

export const lclResponse = makeTemplate({
  response_headers: [
    ['Location', 'location_target'],
    ['Content-Location', 'content_location_target']
  ],
  magic_locations: true
})

export const location = makeTemplate({
  filename: 'location_target',
  response_headers: [
    ['Expires', 100000],
    ['Last-Modified', 0],
    ['Date', 0]
  ]
})

export const contentLocation = makeTemplate({
  filename: 'content_location_target',
  response_headers: [
    ['Expires', 100000],
    ['Last-Modified', 0],
    ['Date', 0]
  ]
})

export const varySetup = makeTemplate({
  request_headers: [
    ['Foo', '1']
  ],
  response_headers: [
    ['Expires', 5000],
    ['Last-Modified', -3000],
    ['Date', 0],
    ['Vary', 'Foo']
  ],
  setup: true
})

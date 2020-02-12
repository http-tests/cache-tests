function make_template (template) {
  return function (request) {
    return Object.assign({}, template, request)
  }
}

export const fresh = make_template({
  'response_headers': [
    ['Expires', 100000],
    ['Last-Modified', 0],
    ['Date', 0]
  ]
})

export const stale = make_template({
  'response_headers': [
    ['Expires', -5000],
    ['Last-Modified', -100000],
    ['Date', 0]
  ]
})

export const lcl_response = make_template({
  'response_headers': [
    ['Location', 'location_target'],
    ['Content-Location', 'content_location_target']
  ],
  magic_locations: true
})

export const location = make_template({
  'filename': 'location_target',
  'response_headers': [
    ['Expires', 100000],
    ['Last-Modified', 0],
    ['Date', 0]
  ]
})

export const content_location = make_template({
  'filename': 'content_location_target',
  'response_headers': [
    ['Expires', 100000],
    ['Last-Modified', 0],
    ['Date', 0]
  ]
})

export const vary_setup = make_template({
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

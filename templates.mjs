
export default {
  'fresh': {
    'response_headers': [
      ['Expires', 100000],
      ['Last-Modified', 0],
      ['Date', 0]
    ]
  },
  'stale': {
    'response_headers': [
      ['Expires', -5000],
      ['Last-Modified', -100000],
      ['Date', 0]
    ]
  },
  'lcl_response': {
    'response_headers': [
      ['Location', 'location_target'],
      ['Content-Location', 'content_location_target']
    ],
    magic_locations: true
  },
  'location': {
    'filename': 'location_target',
    'response_headers': [
      ['Expires', 100000],
      ['Last-Modified', 0],
      ['Date', 0]
    ]
  },
  'content_location': {
    'filename': 'content_location_target',
    'response_headers': [
      ['Expires', 100000],
      ['Last-Modified', 0],
      ['Date', 0]
    ]
  }
}

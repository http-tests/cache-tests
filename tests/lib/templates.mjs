export function makeTemplate (template) {
  return function (request) {
    return Object.assign({}, template, request)
  }
}

/*
 Templates below are shared between multiple suites;
 suite-specific tests should go in that file.
*/

export const fresh = makeTemplate({
  response_headers: [
    ['Expires', 100000],
    ['Cache-Control', 'max-age=100000'],
    ['Last-Modified', 0],
    ['Date', 0]
  ],
  setup: true,
  pause_after: true
})

export const stale = makeTemplate({
  response_headers: [
    ['Expires', -5000],
    ['Last-Modified', -100000],
    ['Date', 0]
  ],
  setup: true,
  pause_after: true
})

export const becomeStale = makeTemplate({
  response_headers: [
    ['Cache-Control', 'max-age=2'],
    ['Template-A', '1']
  ],
  setup: true,
  pause_after: true
})

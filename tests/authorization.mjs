
export default

{
  name: 'Storing Respones to Authenticated Requests',
  id: 'auth',
  description: 'These tests check for conformance to other requirements that apply to HTTP caches. ',
  spec_anchors: ['caching.authenticated.responses'],
  tests: [
    {
      name: 'HTTP shared cache must not reuse a response to a request that contained `Authorization`, even with explicit freshness',
      id: 'other-authorization',
      browser_skip: true,
      requests: [
        {
          request_headers: [
            ['Authorization', 'FOO']
          ],
          expected_request_headers: [
            ['Authorization', 'FOO']
          ],
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
            ['Date', 0]
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP shared cache reuses a response to a request that contained `Authorization`, if it has `Cache-Control: public`',
      id: 'other-authorization-public',
      kind: 'optimal',
      browser_skip: true,
      depends_on: ['other-authorization'],
      requests: [
        {
          request_headers: [
            ['Authorization', 'FOO']
          ],
          expected_request_headers: [
            ['Authorization', 'FOO']
          ],
          response_headers: [
            ['Cache-Control', 'max-age=3600, public'],
            ['Date', 0]
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    }
  ]
}

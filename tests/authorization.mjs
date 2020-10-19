
export default

{
  name: 'Storing Respones to Authenticated Requests',
  id: 'auth',
  description: 'These tests check for conformance to other requirements that apply to HTTP caches. Note that some proxies might fail the first test because they consider themselves the origin (i.e., they\'re \'reverse proxies\')',
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
    },
    {
      name: 'An optimal HTTP shared cache reuses a response to a request that contained `Authorization`, if it has `Cache-Control: must-revalidate`',
      id: 'other-authorization-must-revalidate',
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
            ['Cache-Control', 'max-age=3600, must-revalidate'],
            ['Date', 0]
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP shared cache reuses a response to a request that contained `Authorization`, if it has `Cache-Control: s-maxage`',
      id: 'other-authorization-smaxage',
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
            ['Cache-Control', 's-maxage=3600'],
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

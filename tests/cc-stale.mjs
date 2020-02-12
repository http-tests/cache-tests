
export default {
  name: 'Cache-Control Extensions for Stale Content',
  id: 'cc-stale',
  description: '[RFC5861](https://httpwg.org/specs/rfc5861.html) defines two independent HTTP Cache-Control extensions that allow control over the use of stale responses by caches. These tests gather information about whether implementations honor them by default.',
  tests: [
    {
      name: 'An optimal cache serves cached `stale-while-revalidate` responses while revalidating in the background',
      id: 'stale-while-revalidate',
      kind: 'optimal',
      requests: [
        {
          setup: true,
          response_headers: [
            ['Cache-Control', 'max-age=0, stale-while-revalidate=3600'],
            ['ETag', '"abc"']
          ]
        },
        {
          pause_after: true,
          expected_response_headers: [
            ['Cache-Control', 'max-age=0, stale-while-revalidate=3600'],
            ['ETag', '"abc"']
          ],
          response_headers: [
            ['Cache-Control', 'max-age=3600', false],
            ['ETag', '"def"', false]
          ]
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['ETag', '"def"']
          ]
        }
      ]
    },
    {
      name: 'Does cache serve a stale cached `stale-if-error` response when revalidating returns an error?',
      id: 'stale-if-error-cc-response',
      kind: 'check',
      requests: [
        {
          setup: true,
          response_headers: [
            ['Cache-Control', 'max-age=0, stale-if-error=3600']
          ]
        },
        {
          response_status: [500, 'Internal Server Error'],
          expected_status: 200
        }
      ]
    },
    {
      name: 'HTTP cache must not serve a stale cached `stale-if-error` response after elapsed time',
      id: 'stale-if-error-cc-response-expired',
      requests: [
        {
          setup: true,
          response_headers: [
            ['Cache-Control', 'max-age=0, stale-if-error=1']
          ],
          pause_after: true
        },
        {
          response_status: [500, 'Internal Server Error']
        }
      ]
    },
    {
      name: 'Does cache serve a stale cached response when request has `stale-if-error` and revalidating returns an error?',
      id: 'stale-if-error-cc-request',
      kind: 'check',
      requests: [
        {
          setup: true,
          response_headers: [
            ['Cache-Control', 'max-age=0']
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'stale-if-error=3600']
          ],
          response_status: [500, 'Internal Server Error'],
          expected_status: 200
        }
      ]
    },
    {
      name: 'HTTP cache must not serve a stale cached response after request\'s `stale-if-error` elapsed time',
      id: 'stale-if-error-cc-request-expired',
      requests: [
        {
          setup: true,
          response_headers: [
            ['Cache-Control', 'max-age=0']
          ],
          pause_after: true
        },
        {
          request_headers: [
            ['Cache-Control', 'stale-if-error=1']
          ],
          response_status: [500, 'Internal Server Error']
        }
      ]
    }
  ]
}

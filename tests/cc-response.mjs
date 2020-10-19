
export default

{
  name: 'Cache-Control Response Directives',
  id: 'cc-response',
  description: 'These tests check whether caches are conformant and optimal in handling response `Cache-Control` directives other than those related to freshness, like `no-cache` and `no-store`. See the [relevant specification text](https://httpwg.org/specs/rfc7234.html#cache-response-directive).',
  spec_anchors: ['cache-response-directive'],
  tests: [
    {
      name: 'Shared HTTP cache must not store a response with `Cache-Control: private`',
      id: 'cc-resp-private-shared',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'private, max-age=3600']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal private HTTP cache reuses a fresh response with `Cache-Control: private`',
      id: 'cc-resp-private-private',
      browser_only: true,
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'private, max-age=3600']
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not store a response with `Cache-Control: no-store`',
      id: 'cc-resp-no-store',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'no-store']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not store a response with `Cache-Control: nO-StOrE`',
      id: 'cc-resp-no-store-case-insensitive',
      depends_on: ['cc-resp-no-store'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'No-StOrE']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not store a response with `Cache-Control: no-store`, even with `max-age` and `Expires`',
      id: 'cc-resp-no-store-fresh',
      depends_on: ['cc-resp-no-store'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000, no-store'],
            ['Expires', 10000],
            ['Date', 0]
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not use a cached response with `Cache-Control: no-cache`, even with `max-age` and `Expires`',
      id: 'cc-resp-no-cache',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000, no-cache'],
            ['Expires', 10000],
            ['Date', 0]
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not use a cached response with `Cache-Control: No-CaChE`, even with `max-age` and `Expires`',
      id: 'cc-resp-no-cache-case-insensitive',
      depends_on: ['cc-resp-no-cache'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000, No-CaChE'],
            ['Expires', 10000],
            ['Date', 0]
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache stores a response with `Cache-Control: no-cache`, but revalidates it upon use',
      id: 'cc-resp-no-cache-revalidate',
      kind: 'optimal',
      depends_on: ['cc-resp-no-cache'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'no-cache'],
            ['ETag', '"abcd"']
          ],
          setup: true
        },
        {
          expected_type: 'etag_validated'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache stores a response with `Cache-Control: no-cache`, but revalidates it upon use, even with `max-age` and `Expires`',
      id: 'cc-resp-no-cache-revalidate-fresh',
      kind: 'optimal',
      depends_on: ['cc-resp-no-cache'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000, no-cache'],
            ['Expires', 10000],
            ['Date', 0],
            ['ETag', '"abcd"']
          ],
          setup: true
        },
        {
          expected_type: 'etag_validated'
        }
      ]
    },
    {
      name: 'Does `Cache-Control: no-cache` inhibit storing a listed header?',
      id: 'headers-omit-headers-listed-in-Cache-Control-no-cache-single',
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'no-cache="a"'],
            ['a', '1'],
            ['b', '2'],
            ['Cache-Control', 'max-age=3600'],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [['b', '2']],
          expected_response_headers_missing: ['a'],
          setup_tests: ['expected_type']
        }
      ]
    },
    {
      name: 'Does `Cache-Control: no-cache` inhibit storing multiple listed headers?',
      id: 'headers-omit-headers-listed-in-Cache-Control-no-cache',
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'no-cache="a, b"'],
            ['a', '1'],
            ['b', '2'],
            ['c', '3'],
            ['Cache-Control', 'max-age=3600'],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [['c', '3']],
          expected_response_headers_missing: ['a', 'b'],
          setup_tests: ['expected_type']
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a response with positive `Cache-Control: max-age, must-revalidate`',
      id: 'cc-resp-must-revalidate-fresh',
      kind: 'optimal',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000, must-revalidate'],
            ['ETag', '"abcd"']
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must revalidate a stale response with positive `Cache-Control: max-age, must-revalidate`',
      id: 'cc-resp-must-revalidate-stale',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=2, must-revalidate'],
            ['ETag', '"abcd"']
          ],
          setup: true
        },
        {
          expected_type: 'cached',
          setup: true,
          pause_after: true,
          response_headers: [
            ['Cache-Control', 'max-age=2, must-revalidate'],
            ['ETag', '"abcd"']
          ]
        },
        {
          expected_type: 'etag_validated'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a fresh response with `Cache-Control: immutable` without revalidation.',
      id: 'cc-resp-immutable-fresh',
      kind: 'optimal',
      browser_only: true,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000, immutable'],
            ['ETag', '"abcd"']
          ],
          setup: true,
          pause_after: true
        },
        {
          cache: 'no-cache',
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'A HTTP cache MUST revalidate a stale response with `Cache-Control: immutable`.',
      id: 'cc-resp-immutable-stale',
      browser_only: true,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=2, immutable'],
            ['ETag', '"abcd"']
          ],
          setup: true,
          pause_after: true
        },
        {
          cache: 'no-cache',
          expected_type: 'etag_validated',
          expected_request_headers: [['cache-control', 'max-age=0']]
        }
      ]
    }
  ]
}

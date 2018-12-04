
export default

{
  name: 'Cache-Control Response Directives',
  tests: [
    {
      name: 'Shared HTTP cache must not store a response with Cache-Control: private',
      id: 'cc-resp-private-shared',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'private, max-age=3600']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'Private HTTP cache should reuses a fresh response with Cache-Control: private',
      id: 'cc-resp-private-private',
      browser_only: true,
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'private, max-age=3600']
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not store a response with Cache-Control: no-store',
      id: 'cc-resp-no-store',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'no-store']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not store a response with Cache-Control: no-store, even with max-age and Expires',
      id: 'cc-resp-no-store-fresh',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000, no-store'],
            ['Expires', 10000],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache should store a response with Cache-Control: no-cache, but revalidates upon use',
      id: 'cc-resp-no-cache-revalidate',
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'no-cache'],
            ['ETag', 'abcd']
          ]
        },
        {
          expected_type: 'etag_validated'
        }
      ]
    },
    {
      name: 'HTTP cache should store a response with Cache-Control: no-cache, but revalidates upon use, even with max-age and Expires',
      id: 'cc-resp-no-cache-revalidate-fresh',
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000, no-cache'],
            ['Expires', 10000],
            ['Date', 0],
            ['ETag', 'abcd']
          ]
        },
        {
          expected_type: 'etag_validated'
        }
      ]
    }
  ]
}

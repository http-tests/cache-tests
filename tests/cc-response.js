
export default

{
  name: 'Cache-Control Response Directives',
  tests: [
    {
      name: 'Shared HTTP cache does not store a response with Cache-Control: private',
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
      name: 'Private HTTP cache reuses a fresh response with Cache-Control: private',
      browser_only: true,
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
      name: 'HTTP cache does not store a response with Cache-Control: no-store',
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
      name: 'HTTP cache does not store a response with Cache-Control: no-store, even with max-age and Expires',
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
      name: 'HTTP cache stores a response with Cache-Control: no-cache, but revalidates upon use',
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
      name: 'HTTP cache stores a response with Cache-Control: no-cache, but revalidates upon use, even with max-age and Expires',
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

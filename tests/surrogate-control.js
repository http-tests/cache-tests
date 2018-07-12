
export default

{
  name: 'Surrogate-Control',
  tests: [
    // response directives
    {
      name: 'HTTP cache reuses a response with positive Surrogate-Control: max-age',
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600']
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not reuse a response with Surrogate-Control: max-age=0',
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=0']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache reuses a response with positive Surrogate-Control: max-age and a past Expires',
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600'],
            ['Expires', -10000],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache reuses a response with positive Surrogate-Control: max-age and an invalid Expires',
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600'],
            ['Expires', '0'],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not reuse a response with Surrogate-Control: max-age=0 and a future Expires',
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=0'],
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
      name: 'HTTP cache prefers long Surrogate-Control: max-age over short Cache-Control: max-age',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1'],
            ['Surrogate-Control', 'max-age=3600']
          ],
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache prefers short Surrogate-Control: max-age over long Cache-Control: max-age',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Surrogate-Control', 'max-age=1']
          ],
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not reuse a response when the Age header is greater than its Surrogate-Control lifetime',
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600'],
            ['Age', '12000']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not store a response with Surrogate-Control: no-store',
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'no-store']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not store a response with Surrogate-Control: no-store, even with CC max-age and Expires',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000'],
            ['Surrogate-Control', 'no-store'],
            ['Expires', 10000],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    }
  ]
}

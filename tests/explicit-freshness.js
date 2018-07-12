
export default

{
  name: 'Explicit Freshness',
  tests: [
    // response directives
    {
      name: 'HTTP cache reuses a response with a future Expires',
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not reuse a response with a past Expires',
      requests: [
        {
          response_headers: [
            ['Expires', -30 * 24 * 60 * 60],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not reuse a response with a present Expires',
      requests: [
        {
          response_headers: [
            ['Expires', 0],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not reuse a response with an Expires older than Date',
      requests: [
        {
          response_headers: [
            ['Expires', 60],
            ['Date', 120]
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not reuse a response with an invalid Expires',
      requests: [
        {
          response_headers: [
            ['Expires', '0'],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache reuses a response with positive Cache-Control: max-age',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache does not reuse a response with Cache-Control: max-age=0',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=0']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache reuses a response with positive Cache-Control: max-age and a past Expires',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
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
      name: 'HTTP cache reuses a response with positive Cache-Control: max-age and an invalid Expires',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
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
      name: 'HTTP cache does not reuse a response with Cache-Control: max-age=0 and a future Expires',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=0'],
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
      name: 'HTTP cache does not prefer Cache-Control: s-maxage over Cache-Control: max-age',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1, s-maxage=3600']
          ],
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_only: true
    },
    {
      name: 'HTTP cache prefers Cache-Control: s-maxage over Cache-Control: max-age',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600, s-maxage=1']
          ],
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'HTTP cache does not reuse a response when the Age header is greater than its freshness lifetime',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Age', '12000']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    }
  ]
}

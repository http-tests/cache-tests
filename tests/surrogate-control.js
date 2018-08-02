
export default

{
  name: 'Surrogate-Control',
  tests: [
    // response directives
    {
      name: 'HTTP cache SHOULD reuse a response with positive Surrogate-Control: max-age',
      browser_skip: true,
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
      name: 'HTTP cache MUST NOT reuse a response with Surrogate-Control: max-age=0',
      browser_skip: true,
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
      name: 'HTTP cache SHOULD reuse a response with positive Surrogate-Control: max-age with an extension',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'foobar, max-age=3600']
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache SHOULD reuse a response with positive Surrogate-Control: MaX-aGe',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'MaX-aGe=3600']
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },

    {
      name: 'HTTP cache SHOULD reuse a response with positive Surrogate-Control: max-age and a past Expires',
      browser_skip: true,
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
      name: 'HTTP cache SHOULD reuse a response with positive Surrogate-Control: max-age and an invalid Expires',
      browser_skip: true,
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
      name: 'HTTP cache MUST NOT reuse a response with Surrogate-Control: max-age=0 and a future Expires',
      browser_skip: true,
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
      name: 'HTTP cache SHOULD prefer long Surrogate-Control: max-age over short Cache-Control: max-age',
      browser_skip: true,
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
      name: 'HTTP cache MUST prefer short Surrogate-Control: max-age over long Cache-Control: max-age',
      browser_skip: true,
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
      name: 'HTTP cache MUST NOT reuse a response when the Age header is greater than its Surrogate-Control lifetime',
      browser_skip: true,
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
      name: 'HTTP cache MUST NOT store a response with Surrogate-Control: no-store',
      browser_skip: true,
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
      name: 'HTTP cache MUST NOT store a response with Surrogate-Control: no-store, even with CC max-age and Expires',
      browser_skip: true,
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


export default

{
  name: 'Explicit Freshness',
  tests: [
    // response directives
    {
      name: 'HTTP cache should reuse a response with a future Expires',
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
      name: 'HTTP cache must not reuse a response with a past Expires',
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
      name: 'HTTP cache must not reuse a response with a present Expires',
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
      name: 'HTTP cache must not reuse a response with an Expires older than Date, both fast',
      requests: [
        {
          response_headers: [
            ['Expires', 300],
            ['Date', 400]
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with an invalid Expires',
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
      name: 'HTTP cache should reuse a response with Expires, even if Date is invalid',
      requests: [
        {
          response_headers: [
            ['Date', 'foo'],
            ['Expires', 10]
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response when the Age header is greater than its Expires minus Date',
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Expires', 10],
            ['Age', '15']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response when the Age header is greater than its Expires minus Date, and Date is fast',
      requests: [
        {
          response_headers: [
            ['Date', 5],
            ['Expires', 10],
            ['Age', '8']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age',
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
      name: 'HTTP cache must not reuse a response with Cache-Control: max-age=0',
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
      name: 'HTTP cache must not reuse a response when the Age header is greater than its Cache-Control: max-age freshness lifetime',
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=10'],
            ['Age', '15']
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age and a past Expires',
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
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age and an invalid Expires',
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
      name: 'HTTP cache must not reuse a response with Cache-Control: max-age=0 and a future Expires',
      requests: [
        {
          response_headers: [
            ['Expires', 10000],
            ['Cache-Control', 'max-age=0'],
            ['Date', 0]
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age and a CC extension present',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'foobar, max-age=3600']
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with positive Cache-Control: MaX-AgE',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'MaX-aGe=3600']
          ]
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Private HTTP cache must not prefer Cache-Control: s-maxage over Cache-Control: max-age',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=3600, max-age=1']
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
      name: 'Private HTTP cache must not prefer Cache-Control: s-maxage over Cache-Control: max-age (multiple headers)',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=3600'],
            ['Cache-Control', 'max-age=1']
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
      name: 'Shared HTTP cache must prefer Cache-Control: s-maxage over Cache-Control: max-age',
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
    }
  ]
}

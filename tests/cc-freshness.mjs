
export default

{
  name: 'Cache-Control Freshness',
  tests: [
    // response directives
    {
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age',
      id: 'freshness-max-age',
      required: false,
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
      id: 'freshness-max-age-0',
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
      id: 'freshness-max-age-age',
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
      id: 'freshness-max-age-expires',
      required: false,
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
      id: 'freshness-max-age-expires-invalid',
      required: false,
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
      id: 'freshness-max-age-0-expires',
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
      id: 'freshness-max-age-extension',
      required: false,
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
      id: 'freshness-max-age-case-insenstive',
      required: false,
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
      id: 'freshness-max-age-s-maxage-private',
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
      id: 'freshness-max-age-s-maxage-private-multiple',
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
      name: 'Shared HTTP cache should prefer Cache-Control: s-maxage over Cache-Control: max-age',
      id: 'freshness-max-age-s-maxage-shared',
      required: false,
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

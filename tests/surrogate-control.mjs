
export default

{
  name: 'Surrogate-Control',
  id: 'surrogate-control',
  tests: [
    // response directives
    {
      name: 'HTTP cache should reuse a response with positive Surrogate-Control: max-age',
      id: 'surrogate-max-age',
      browser_skip: true,
      required: false,
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600']
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must ignore Surrogate-Control: max-age with space before the =',
      id: 'surrogate-max-age-space-before-equals',
      browser_skip: true,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1'],
            ['Surrogate-Control', 'max-age =100']
          ],
          setup: true,
          pause: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must ignore Surrogate-Control: max-age with space after the =',
      id: 'surrogate-max-age-space-after-equals',
      browser_skip: true,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1'],
            ['Surrogate-Control', 'max-age= 100']
          ],
          setup: true,
          pause: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with Surrogate-Control: max-age=0',
      id: 'surrogate-max-age-0',
      browser_skip: true,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=0']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with positive Surrogate-Control: max-age with an extension',
      id: 'surrogate-max-age-extension',
      browser_skip: true,
      required: false,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'foobar, max-age=3600']
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with positive Surrogate-Control: MaX-aGe',
      id: 'surrogate-max-age-case-insensitive',
      browser_skip: true,
      required: false,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'MaX-aGe=3600']
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },

    {
      name: 'HTTP cache should reuse a response with positive Surrogate-Control: max-age and a past Expires',
      id: 'surrogate-max-age-expires',
      browser_skip: true,
      required: false,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600'],
            ['Expires', -10000],
            ['Date', 0]
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with positive Surrogate-Control: max-age and an invalid Expires',
      id: 'surrogate-max-age-cc-max-age-invalid-expires',
      browser_skip: true,
      required: false,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600'],
            ['Expires', '0'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with Surrogate-Control: max-age=0 and a future Expires',
      id: 'surrogate-max-age-0-expires',
      browser_skip: true,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=0'],
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
      name: 'HTTP cache should prefer long Surrogate-Control: max-age over short Cache-Control: max-age',
      id: 'surrogate-max-age-short-cc-max-age',
      browser_skip: true,
      required: false,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1'],
            ['Surrogate-Control', 'max-age=3600']
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
      name: 'HTTP cache must prefer short Surrogate-Control: max-age over long Cache-Control: max-age',
      id: 'surrogate-max-age-long-cc-max-age',
      browser_skip: true,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Surrogate-Control', 'max-age=1']
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
      name: 'HTTP cache must not reuse a response when the Age header is greater than its Surrogate-Control lifetime',
      id: 'surrogate-max-age-age',
      browser_skip: true,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600'],
            ['Age', '12000']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not store a response with Surrogate-Control: no-store',
      id: 'surrogate-no-store',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'no-store']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not store a response with Surrogate-Control: no-store, even with CC max-age and Expires',
      id: 'surrogate-no-store-cc-fresh',
      browser_skip: true,
      depends_on: ['surrogate-no-store'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000'],
            ['Surrogate-Control', 'no-store'],
            ['Expires', 10000],
            ['Date', 0]
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    }
  ]
}

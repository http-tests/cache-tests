
export default

{
  name: 'Surrogate-Control',
  id: 'surrogate-control',
  description: 'These tests check non-browser caches for behaviours around the `Surrogate-Control` response header. It was [specified in a W3C Note](https://www.w3.org/TR/edge-arch/) a long time ago, but interoperability around it is not clear.',
  tests: [
    {
      name: 'An optimal surrogate cache reuses a response with positive `Surrogate-Control: max-age`',
      id: 'surrogate-max-age',
      browser_skip: true,
      depends_on: ['freshness-none'],
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal surrogate cache reuses a response with `Surrogate-Control: max-age: 2147483648`',
      id: 'surrogate-max-age-max',
      kind: 'optimal',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=2147483648']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal surrogate cache reuses a response with `Surrogate-Control: max-age: 99999999999`',
      id: 'surrogate-max-age-max-plus',
      kind: 'optimal',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=99999999999']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Surrogate cache must not reuse a response when the `Age` header is greater than its `Surrogate-Control: max-age` freshness lifetime',
      id: 'surrogate-max-age-age',
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Surrogate-Control', 'max-age=3600'],
            ['Age', '7200']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'Does surrogate cache ignore `Surrogate-Control: max-age` with space before the `=`?',
      id: 'surrogate-max-age-space-before-equals',
      browser_skip: true,
      kind: 'check',
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1'],
            ['Surrogate-Control', 'max-age =100']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'Does surrogate cache ignore `Surrogate-Control: max-age` with space after the `=`?',
      id: 'surrogate-max-age-space-after-equals',
      browser_skip: true,
      kind: 'check',
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1'],
            ['Surrogate-Control', 'max-age= 100']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'Surrogate cache must not reuse a response with `Surrogate-Control: max-age=0`',
      id: 'surrogate-max-age-0',
      browser_skip: true,
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=0']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal surrogate cache reuses a response with a positive `Surrogate-Control: max-age` with an extension',
      id: 'surrogate-max-age-extension',
      browser_skip: true,
      kind: 'optimal',
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'foobar, max-age=3600']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal surogate cache reuses a response with a positive `Surrogate-Control: MaX-aGe`',
      id: 'surrogate-max-age-case-insensitive',
      browser_skip: true,
      kind: 'optimal',
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'MaX-aGe=3600']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },

    {
      name: 'An optimal surrogate cache reuses a response with a positive `Surrogate-Control: max-age` and a past `Expires`',
      id: 'surrogate-max-age-expires',
      browser_skip: true,
      kind: 'optimal',
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600'],
            ['Expires', -10000],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal surrogate cache reuses a response with a positive `Surrogate-Control: max-age` and an invalid `Expires`',
      id: 'surrogate-max-age-cc-max-age-invalid-expires',
      browser_skip: true,
      kind: 'optimal',
      depends_on: ['surrogate-max-age'],
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'max-age=3600'],
            ['Expires', '0'],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Surrogate cache must not reuse a response with a `Surrogate-Control: max-age=0` and a future `Expires`',
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
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal surrogate cache prefers a long `Surrogate-Control: max-age` over a short `Cache-Control: max-age`',
      id: 'surrogate-max-age-short-cc-max-age',
      browser_skip: true,
      kind: 'optimal',
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
      name: 'Surrogate cache must prefer a short `Surrogate-Control: max-age` over a long `Cache-Control: max-age`',
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
      name: 'Surrogate cache must not store a response with `Surrogate-Control: no-store`',
      id: 'surrogate-no-store',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Surrogate-Control', 'no-store']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'Surrogate cache must not store a response with `Surrogate-Control: no-store`, even with `Cache-Control: max-age` and `Expires`',
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
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'Does the surrogate forward the `Surrogate-Control` response header?',
      id: 'surrogate-remove-header',
      browser_skip: true,
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=10000'],
            ['Surrogate-Control', 'foo'],
            ['Expires', 10000],
            ['Date', 0]
          ],
          expected_response_headers: [
            ['Surrogate-Control', 'foo']
          ]
        }
      ]
    }
  ]
}

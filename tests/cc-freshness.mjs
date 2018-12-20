
export default

{
  name: 'Cache-Control Freshness',
  id: 'cc-freshness',
  tests: [
    {
      name: 'HTTP cache may reuse a response without explict freshness information or a validator (but doing that messes up the tests)',
      id: 'freshness-none',
      required: false,
      requests: [
        {
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age',
      id: 'freshness-max-age',
      required: false,
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
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
      name: 'HTTP cache should reuse a response with quoted Cache-Control: max-age',
      id: 'freshness-max-age-quoted',
      required: false,
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age="3600"']
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
      name: 'HTTP cache should not reuse a response with single-quoted Cache-Control: max-age',
      id: 'freshness-max-age-single-quoted',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=\'3600\'']
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
      name: 'HTTP cache must ignore the phrase "max-age" in a quoted string',
      id: 'freshness-max-age-ignore-quoted',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'extension="max-age=100", max-age=1']
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
      name: 'HTTP cache must ignore the phrase "max-age" in a quoted string (after "real" max-age)',
      id: 'freshness-max-age-ignore-quoted-rev',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1, extension="max-age=100"']
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
      name: 'HTTP cache must ignore the phrase "max-age" in a quoted string, even when max-age has a quoted value too',
      id: 'freshness-max-age-ignore-quoted-all',
      depends_on: ['freshness-max-age-quoted'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'extension="max-age=100", max-age="1"']
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
      name: 'HTTP cache must ignore the phrase "max-age" in a quoted string, even when previous max-age has a quoted value too',
      id: 'freshness-max-age-ignore-quoted-all-rev',
      depends_on: ['freshness-max-age-quoted'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age="1", extension="max-age=100"']
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
      name: 'HTTP cache must ignore max-age with space before the =',
      id: 'freshness-max-age-space-before-equals',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age =100']
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
      name: 'HTTP cache must ignore max-age with space after the =',
      id: 'freshness-max-age-space-after-equals',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age= 100']
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
      name: 'HTTP cache must not reuse a response with Cache-Control: max-age=0',
      id: 'freshness-max-age-0',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=0']
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
      name: 'HTTP cache must not reuse a response with an invalid Cache-Control: max-age (leading alpha)',
      id: 'freshness-max-age-a100',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=a100']
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
      name: 'HTTP cache must not reuse a response with an invalid Cache-Control: max-age (trailing alpha)',
      id: 'freshness-max-age-100a',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=100a']
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
      name: 'HTTP cache must not reuse a response with negative Cache-Control: max-age',
      id: 'freshness-max-age-negative',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=-100']
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
      name: 'HTTP cache should reuse a response with Cache-Control: max-age: 2147483648',
      id: 'freshness-max-age-max',
      required: false,
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=2147483648']
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
      name: 'HTTP cache should reuse a response with Cache-Control: max-age: 99999999999',
      id: 'freshness-max-age-max-plus',
      required: false,
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=99999999999']
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
      name: 'HTTP cache must not reuse a response when the Age header is greater than its Cache-Control: max-age freshness lifetime',
      id: 'freshness-max-age-age',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=10'],
            ['Age', '15']
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
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age and a past Expires',
      id: 'freshness-max-age-expires',
      depends_on: ['freshness-max-age'],
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
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
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age and an invalid Expires',
      id: 'freshness-max-age-expires-invalid',
      depends_on: ['freshness-max-age'],
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
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
      name: 'HTTP cache must not reuse a response with Cache-Control: max-age=0 and a future Expires',
      id: 'freshness-max-age-0-expires',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Expires', 10000],
            ['Cache-Control', 'max-age=0'],
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
      name: 'HTTP cache should reuse a response with positive Cache-Control: max-age and a CC extension present',
      id: 'freshness-max-age-extension',
      required: false,
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'foobar, max-age=3600']
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
      name: 'HTTP cache should reuse a response with positive Cache-Control: MaX-AgE',
      id: 'freshness-max-age-case-insenstive',
      required: false,
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'MaX-aGe=3600']
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
      name: 'Private HTTP cache must not prefer Cache-Control: s-maxage over shorter Cache-Control: max-age',
      id: 'freshness-max-age-s-maxage-private',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=3600, max-age=1']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_only: true
    },
    {
      name: 'Private HTTP cache must not prefer Cache-Control: s-maxage over shorter Cache-Control: max-age (multiple headers)',
      id: 'freshness-max-age-s-maxage-private-multiple',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=3600'],
            ['Cache-Control', 'max-age=1']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_only: true
    },
    {
      name: 'Shared HTTP cache should reuse a response with positive Cache-Control: s-maxage',
      id: 'freshness-s-maxage-shared',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=3600']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'Shared HTTP cache must prefer Cache-Control: s-maxage over longer Cache-Control: max-age',
      id: 'freshness-max-age-s-maxage-shared-longer',
      depends_on: ['freshness-s-maxage-shared'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600, s-maxage=1']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'Shared HTTP cache must prefer Cache-Control: s-maxage over longer Cache-Control: max-age (reversed)',
      id: 'freshness-max-age-s-maxage-shared-longer-reversed',
      depends_on: ['freshness-s-maxage-shared'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 's-maxage=1, max-age=3600']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'Shared HTTP cache must prefer Cache-Control: s-maxage over longer Cache-Control: max-age (multiple headers)',
      id: 'freshness-max-age-s-maxage-shared-longer-multiple',
      depends_on: ['freshness-s-maxage-shared'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Cache-Control', 's-maxage=1']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ],
      browser_skip: true
    },
    {
      name: 'Shared HTTP cache should prefer Cache-Control: s-maxage over shorter Cache-Control: max-age',
      id: 'freshness-max-age-s-maxage-shared-shorter',
      depends_on: ['freshness-s-maxage-shared'],
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1, s-maxage=3600']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ],
      browser_skip: true
    }
  ]
}

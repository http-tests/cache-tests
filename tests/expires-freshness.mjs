
export default

{
  name: 'Expires Freshness',
  id: 'expires',
  tests: [
    {
      name: 'HTTP caches can reuse a response without explict freshness information or a validator (but doing that messes up the tests)',
      id: 'freshness-expires-none',
      kind: 'optimal',
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
      name: 'An optimal HTTP cache reuses a response with a future Expires',
      id: 'freshness-expires-future',
      kind: 'optimal',
      depends_on: ['freshness-expires-none'],
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
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
      name: 'HTTP cache must not reuse a response with a past Expires',
      id: 'freshness-expires-past',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', -30 * 24 * 60 * 60],
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
      name: 'HTTP cache must not reuse a response with a present Expires',
      id: 'freshness-expires-present',
      depends_on: ['freshness-expires-none'],
      requests: [
        {
          response_headers: [
            ['Expires', 0],
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
      name: 'HTTP cache must not reuse a response with an Expires older than Date, both fast',
      id: 'freshness-expires-old-date',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 300],
            ['Date', 400]
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
      name: 'HTTP cache must not reuse a response with an invalid Expires (0)',
      id: 'freshness-expires-invalid',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', '0'],
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
      name: 'An optimal HTTP cache reuses a response with Expires, even if Date is invalid',
      id: 'freshness-expires-invalid-date',
      depends_on: ['freshness-expires-future'],
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Date', 'foo'],
            ['Expires', 10]
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response when the Age header is greater than its Expires minus Date, and Date is slow',
      id: 'freshness-expires-age-slow-date',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Date', -10],
            ['Expires', 10],
            ['Age', '25']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response when the Age header is greater than its Expires minus Date, and Date is fast',
      id: 'freshness-expires-age-fast-date',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Date', 10],
            ['Expires', 20],
            ['Age', '15']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache reuse a response with an Expires using wrong case (weekday)?',
      id: 'freshness-expires-wrong-case-weekday',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'THU, 18 Aug 2050 02:01:18 GMT'],
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
      name: 'Does HTTP cache reuse a response with an Expires using wrong case (month)?',
      id: 'freshness-expires-wrong-case-month',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu, 18 AUG 2050 02:01:18 GMT'],
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
      name: 'Does HTTP cache reuse a response with an Expires using wrong case (tz)?',
      id: 'freshness-expires-wrong-case-tz',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu, 18 Aug 2050 02:01:18 gMT'],
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
      name: 'Does HTTP cache reuse a response with an invalid Expires (UTC)?',
      id: 'freshness-expires-invalid-utc',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu, 18 Aug 2050 02:01:18 UTC'],
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
      name: 'Does HTTP cache reuse a response with an invalid Expires (two-digit year)?',
      id: 'freshness-expires-invalid-2-digit-year',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu, 18 Aug 50 02:01:18 GMT'],
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
      name: 'Does HTTP cache reuse a response with an invalid Expires (missing comma)?',
      id: 'freshness-expires-invalid-no-comma',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu 18 Aug 2050 02:01:18 GMT'],
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
      name: 'Does HTTP cache reuse a response with an invalid Expires (multiple spaces)?',
      id: 'freshness-expires-invalid-multiple-spaces',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu, 18  Aug  2050 02:01:18 GMT'],
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
      name: 'Does HTTP cache reuse a response with an invalid Expires (date dashes)?',
      id: 'freshness-expires-invalid-date-dashes',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu, 18-Aug-2050 02:01:18 GMT'],
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
      name: 'Does HTTP cache reuse a response with an invalid Expires (time periods)?',
      id: 'freshness-expires-invalid-time-periods',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu, 18 Aug 2050 02.01.18 GMT'],
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
      name: 'Does HTTP cache reuse a response with an invalid Expires (1-digit hour)?',
      id: 'freshness-expires-invalid-1-digit-hour',
      kind: 'check',
      depends_on: ['freshness-expires-future'],
      requests: [
        {
          response_headers: [
            ['Expires', 'Thu, 18 Aug 2050 2:01:18 GMT'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    }
  ]
}

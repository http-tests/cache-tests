
export default

{
  name: 'Expires Freshness',
  id: 'expires',
  tests: [
    {
      name: 'HTTP cache may reuse a response without explict freshness information or a validator (but doing that messes up the tests)',
      id: 'freshness-expires-none',
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
      name: 'HTTP cache should reuse a response with a future Expires',
      id: 'freshness-expires-future',
      required: false,
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
      name: 'HTTP cache should reuse a response with an Expires using wrong case (weekday)',
      id: 'freshness-expires-wrong-case-weekday',
      required: false,
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
      name: 'HTTP cache should reuse a response with an Expires using wrong case (month)',
      id: 'freshness-expires-wrong-case-month',
      required: false,
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
      name: 'HTTP cache should reuse a response with an Expires using wrong case (tz)',
      id: 'freshness-expires-wrong-case-tz',
      required: false,
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
      name: 'HTTP cache must not reuse a response with an invalid Expires (UTC)',
      id: 'freshness-expires-invalid-utc',
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
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with an invalid Expires (two-digit year)',
      id: 'freshness-expires-invalid-2-digit-year',
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
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with an invalid Expires (missing comma)',
      id: 'freshness-expires-invalid-no-comma',
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
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with an invalid Expires (multiple spaces)',
      id: 'freshness-expires-invalid-multiple-spaces',
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
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with an invalid Expires (date dashes)',
      id: 'freshness-expires-invalid-date-dashes',
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
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with an invalid Expires (time periods)',
      id: 'freshness-expires-invalid-time-periods',
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
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with an invalid Expires (1-digit hour)',
      id: 'freshness-expires-invalid-1-digit-hour',
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
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse a response with Expires, even if Date is invalid',
      id: 'freshness-expires-invalid-date',
      depends_on: ['freshness-expires-future'],
      required: false,
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
    }
  ]
}

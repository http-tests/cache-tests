
export default

{
  name: 'Expires Freshness',
  tests: [
    // response directives
    {
      name: 'HTTP cache should reuse a response with a future Expires',
      id: 'freshness-expires-future',
      required: false,
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
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
      name: 'HTTP cache must not reuse a response with a past Expires',
      id: 'freshness-expires-past',
      requests: [
        {
          response_headers: [
            ['Expires', -30 * 24 * 60 * 60],
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
      name: 'HTTP cache must not reuse a response with a present Expires',
      id: 'freshness-expires-present',
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
      requests: [
        {
          response_headers: [
            ['Expires', 300],
            ['Date', 400]
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse a response with an invalid Expires',
      id: 'freshness-expires-invalid',
      requests: [
        {
          response_headers: [
            ['Expires', '0'],
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

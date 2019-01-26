
export default

{
  name: 'Expires Parsing',
  id: 'expires-parse',
  tests: [
    {
      name: 'Does HTTP cache reuse a response with an `Expires` using wrong case (weekday)?',
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
      name: 'Does HTTP cache reuse a response with an `Expires` using wrong case (month)?',
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
      name: 'Does HTTP cache reuse a response with an `Expires` using wrong case (tz)?',
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
      name: 'Does HTTP cache reuse a response with an invalid `Expires` (UTC)?',
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
      name: 'Does HTTP cache reuse a response with an invalid `Expires` (two-digit year)?',
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
      name: 'Does HTTP cache reuse a response with an invalid `Expires` (missing comma)?',
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
      name: 'Does HTTP cache reuse a response with an invalid `Expires` (multiple spaces)?',
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
      name: 'Does HTTP cache reuse a response with an invalid `Expires` (date dashes)?',
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
      name: 'Does HTTP cache reuse a response with an invalid `Expires` (time periods)?',
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
      name: 'Does HTTP cache reuse a response with an invalid `Expires` (1-digit hour)?',
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

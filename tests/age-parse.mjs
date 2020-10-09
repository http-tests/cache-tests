export default

{
  name: 'Age Parsing',
  id: 'age-parse',
  description: 'These tests check how implementations parse the [`Age` response header](https://httpwg.org/http-core/draft-ietf-httpbis-cache-latest.html#field.age). They are not conformance tests because error handling is not clearly specified; rather, they are being used to gather information as input to spec revisions.',
  tests: [
    {
      name: 'HTTP cache should consider a response with a non-numeric `Age` header to be stale',
      id: 'age-parse-nonnumeric',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', 'abc', false]
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
      name: 'HTTP cache should consider a response with a negative `Age` header to be stale',
      id: 'age-parse-negative',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '-7200', false]
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
      name: 'HTTP cache should consider a response with a float `Age` header to be stale',
      id: 'age-parse-float',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200.0', false]
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
      name: 'HTTP cache should consider a response with a `Age` header with ",0" appended to be stale',
      id: 'age-parse-suffix',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200,0', false]
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
      name: 'HTTP cache should consider a response with a `Age` header with "0," prepended to be stale',
      id: 'age-parse-prefix',
      kind: 'check',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '0,7200', false]
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
      name: 'HTTP cache should consider a response with two `Age` header lines to be stale',
      id: 'age-parse-suffix-twoline',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200', false],
            ['Age', '0', false]
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
      name: 'HTTP cache should consider a response with two `Age` header lines to be stale (reversed)',
      id: 'age-parse-prefix-twoline',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '0', false],
            ['Age', '7200', false]
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
      name: 'HTTP cache should consider a response with `Age: 0,0` to be stale',
      id: 'age-parse-dup-0',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '0, 0', false]
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
      name: 'HTTP cache should consider a response with two `Age: 0` header lines to be stale',
      id: 'age-parse-dup-0-twoline',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '0', false],
            ['Age', '0', false]
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
      name: 'HTTP cache should consider a response with two `Age: 3600` header lines to be stale',
      id: 'age-parse-dup-old',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=10000'],
            ['Age', '3600, 3600', false]
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
      name: 'HTTP cache should consider a response with parameter on `Age` header to be stale',
      id: 'age-parse-parameter',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200;foo=bar', false]
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
      name: 'HTTP cache should consider a response with numeric parameter on `Age` header to be stale',
      id: 'age-parse-numeric-parameter',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200;foo=111', false]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    }
  ]
}

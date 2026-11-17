export default

{
  name: 'Age Parsing',
  id: 'age-parse',
  description: 'These tests check how caches parse the `Age` response header.',
  spec_anchors: ['field.age', 'expiration.model'],
  tests: [
    {
      name: 'HTTP cache should ignore an `Age` header with a non-numeric value',
      id: 'age-parse-nonnumeric',
      spec_anchors: ['field.age'],
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
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should ignore an `Age` header with a negative value',
      id: 'age-parse-negative',
      spec_anchors: ['field.age'],
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
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should ignore an `Age` header with a float value',
      id: 'age-parse-float',
      spec_anchors: ['field.age'],
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
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should consider a response with an `Age` value of `99999999999` to be stale',
      id: 'age-parse-99999999999',
      spec_anchors: ['field.age', 'delta-seconds'],
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '99999999999', false]
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
      name: 'HTTP cache should consider a response with an `Age` value of `9223372036854775807` to be stale',
      id: 'age-parse-9223372036854775807',
      spec_anchors: ['field.age', 'delta-seconds'],
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '9223372036854775807', false]
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
      name: 'HTTP cache should consider a response with an `Age` value of `18446744073709551616` to be stale',
      id: 'age-parse-18446744073709551616',
      spec_anchors: ['field.age', 'delta-seconds'],
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '18446744073709551616', false]
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
      name: 'HTTP cache should consider a response with an `Age` value of a 100-digit number to be stale',
      id: 'age-parse-100-digits',
      spec_anchors: ['field.age', 'delta-seconds'],
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999', false]
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
      name: 'HTTP cache should consider a response with a single `Age` header line `old, 0` to be stale',
      id: 'age-parse-suffix',
      spec_anchors: ['field.age'],
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200, 0', false]
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
      name: 'HTTP cache should consider a response with a single `Age` header line `0, old` to be fresh',
      id: 'age-parse-prefix',
      spec_anchors: ['field.age'],
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '0, 7200', false]
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
      name: 'HTTP cache should use the first line in a response with multiple `Age` header lines: `old`, `0`',
      id: 'age-parse-suffix-twoline',
      spec_anchors: ['field.age'],
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
      name: 'HTTP cache should use the first line in a response with multiple `Age` header lines: `0`, `old`',
      id: 'age-parse-prefix-twoline',
      spec_anchors: ['field.age'],
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
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should consider a response with a single line `Age: 0, 0` to be fresh',
      id: 'age-parse-dup-0',
      spec_anchors: ['field.age'],
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
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should consider a response with two `Age: 0` header lines to be fresh',
      id: 'age-parse-dup-0-twoline',
      spec_anchors: ['field.age'],
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
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should consider a response with two `Age: not_old` header lines to be fresh',
      id: 'age-parse-dup-old',
      spec_anchors: ['field.age'],
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=10000'],
            ['Age', '3600', false],
            ['Age', '3600', false]
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
      name: 'Does HTTP cache consider an alphabetic parameter on `Age` header to be valid?',
      id: 'age-parse-parameter',
      depends_on: ['freshness-max-age-age'],
      kind: 'check',
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
      name: 'Does HTTP cache should consider a numeric parameter on `Age` header to be valid?',
      id: 'age-parse-numeric-parameter',
      depends_on: ['freshness-max-age-age'],
      kind: 'check',
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

export default

{
  name: 'Age Parsing',
  id: 'age-parse',
  description: 'These tests check how implementations parse the `Age` response header. They are not conformance tests because error handling is not clearly specified; rather, they are being used to gather information as input to spec revisions.',
  tests: [
    {
      name: 'Does HTTP cache reuse a response when the `Age` header is non-numeric?',
      id: 'age-parse-nonnumeric',
      kind: 'check',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', 'abc']
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
      name: 'Does HTTP cache reuse a response when the `Age` header is negative?',
      id: 'age-parse-negative',
      kind: 'check',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '-7200']
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
      name: 'Does HTTP cache reuse a response when the `Age` header is a float?',
      id: 'age-parse-float',
      kind: 'check',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200.0']
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
      name: 'Does HTTP cache reuse an aged response when the `Age` header has ",0" appended?',
      id: 'age-parse-suffix',
      kind: 'check',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200,0']
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
      name: 'Does HTTP cache reuse an aged response when the `Age` header has "0" in a header following?',
      id: 'age-parse-suffix-twoline',
      kind: 'check',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '7200'],
            ['Age', '0']
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
      name: 'Does HTTP cache reuse an aged response when the `Age` header has "0," prepended?',
      id: 'age-parse-prefix',
      kind: 'check',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '0,7200']
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
      name: 'Does HTTP cache reuse an aged response when the `Age` header has "0" in a header preceding?',
      id: 'age-parse-prefix-twoline',
      kind: 'check',
      depends_on: ['freshness-max-age-age'],
      requests: [
        {
          response_headers: [
            ['Date', 0],
            ['Cache-Control', 'max-age=3600'],
            ['Age', '0'],
            ['Age','7200']
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_type: 'cached'
        }
      ]
    }
  ]
}

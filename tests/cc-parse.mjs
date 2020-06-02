
export default

{
  name: 'Cache-Control Parsing',
  id: 'cc-parse',
  description: 'These tests check how implementations parse the `Cache-Control` response header. They are not conformance tests because error handling is not clearly specified; rather, they are being used to gather information as input to spec revisions. See also the [specification for Cache-Control](https://httpwg.org/specs/rfc7234.html#header.cache-control), and [this issue](https://github.com/httpwg/http-core/issues/128) for relevant discussion.',
  tests: [
    {
      name: 'Does HTTP cache reuse a response with a quoted `Cache-Control: max-age`?',
      id: 'freshness-max-age-quoted',
      kind: 'check',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age="3600"', false]
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
      name: 'Does HTTP cache reuse a response with a single-quoted `Cache-Control: max-age`?',
      id: 'freshness-max-age-single-quoted',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=\'3600\'', false]
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
      name: 'Does HTTP cache ignore the phrase `max-age` in a quoted string (before the "real" `max-age`)?',
      id: 'freshness-max-age-ignore-quoted',
      kind: 'check',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'extension="max-age=3600", max-age=1', false]
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
      name: 'Does HTTP cache ignore the phrase `max-age` in a quoted string (after the "real" `max-age`)?',
      id: 'freshness-max-age-ignore-quoted-rev',
      kind: 'check',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1, extension="max-age=3600"', false]
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
      name: 'Does HTTP cache ignore the phrase `max-age` in a quoted string, even when max-age has a quoted value too?',
      id: 'freshness-max-age-ignore-quoted-all',
      kind: 'check',
      depends_on: ['freshness-max-age-quoted'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'extension="max-age=3600", max-age="1"', false]
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
      name: 'Does HTTP cache ignore the phrase `max-age` in a quoted string, even when previous max-age has a quoted value too?',
      id: 'freshness-max-age-ignore-quoted-all-rev',
      kind: 'check',
      depends_on: ['freshness-max-age-quoted'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age="1", extension="max-age=3600"', false]
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
      name: 'Does HTTP cache reuse max-age with `003600` value?',
      id: 'freshness-max-age-leading-zero',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=003600', false]
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
      name: 'Does HTTP cache reuse max-age with `3600.0` value?',
      id: 'freshness-max-age-decimal-zero',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600.0', false]
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
      name: 'Does HTTP cache reuse max-age with `3600.5` value?',
      id: 'freshness-max-age-decimal-five',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600.5', false]
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
      name: 'Does HTTP cache ignore max-age with space before the `=`?',
      id: 'freshness-max-age-space-before-equals',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age =3600', false]
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
      name: 'Does HTTP cache ignore max-age with space after the `=`?',
      id: 'freshness-max-age-space-after-equals',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age= 3600', false]
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
      name: 'Does HTTP cache reuse a response with an invalid `Cache-Control: max-age` (leading alpha)?',
      id: 'freshness-max-age-a100',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=a3600', false]
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
      name: 'Does HTTP cache reuse a response with an invalid `Cache-Control: max-age` (trailing alpha)',
      id: 'freshness-max-age-100a',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600a', false]
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

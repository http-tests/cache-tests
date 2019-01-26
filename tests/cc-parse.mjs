
export default

{
  name: 'Cache-Control Parsing',
  id: 'cc-parse',
  tests: [
    {
      name: 'An optimal HTTP cache reuses a response with quoted `Cache-Control: max-age`',
      id: 'freshness-max-age-quoted',
      kind: 'optimal',
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
      name: 'Does HTTP cache reuse a response with single-quoted `Cache-Control: max-age`?',
      id: 'freshness-max-age-single-quoted',
      kind: 'check',
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
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache must ignore the phrase `max-age` in a quoted string',
      id: 'freshness-max-age-ignore-quoted',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'extension="max-age=3600", max-age=1']
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
      name: 'HTTP cache must ignore the phrase `max-age` in a quoted string (after "real" max-age)',
      id: 'freshness-max-age-ignore-quoted-rev',
      depends_on: ['freshness-max-age'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1, extension="max-age=3600"']
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
      name: 'HTTP cache must ignore the phrase `max-age` in a quoted string, even when max-age has a quoted value too',
      id: 'freshness-max-age-ignore-quoted-all',
      depends_on: ['freshness-max-age-quoted'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'extension="max-age=3600", max-age="1"']
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
      name: 'HTTP cache must ignore the phrase `max-age` in a quoted string, even when previous max-age has a quoted value too',
      id: 'freshness-max-age-ignore-quoted-all-rev',
      depends_on: ['freshness-max-age-quoted'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age="1", extension="max-age=3600"']
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
      name: 'Does HTTP cache ignore max-age with space before the `=`?',
      id: 'freshness-max-age-space-before-equals',
      kind: 'check',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age =3600']
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
            ['Cache-Control', 'max-age= 3600']
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
      name: 'HTTP cache must not reuse a response with an invalid `Cache-Control: max-age` (leading alpha)',
      id: 'freshness-max-age-a100',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=a3600']
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
      name: 'HTTP cache must not reuse a response with an invalid `Cache-Control: max-age` (trailing alpha)',
      id: 'freshness-max-age-100a',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600a']
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
      name: 'HTTP cache must not reuse a response with negative `Cache-Control: max-age`',
      id: 'freshness-max-age-negative',
      depends_on: ['freshness-none'],
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=-3600']
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

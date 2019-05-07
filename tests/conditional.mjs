
export default {
  name: 'Conditional Requests',
  id: 'conditional',
  description: 'Testing of HTTP [conditional requests](https://httpwg.org/specs/rfc7232.html); currently covering `If-None-Match` and `If-Modified-Since` for `ETag`s and `Last-Modified` respectively.',
  tests: [
    {
      name: 'An optimal HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching strong `ETag`.',
      id: 'conditional-etag-strong-respond',
      kind: 'optimal',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', '"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', '"abcdef"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'HTTP cache includes the `ETag` in a `304`.',
      id: 'conditional-304-etag',
      depends_on: ['conditional-etag-strong-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', '"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', '"abcdef"']
          ],
          expected_type: 'cached',
          expected_status: 304,
          expected_response_headers: [
            ['ETag', '"abcdef"']
          ]
        }
      ]
    },
    {
      name: 'An optimal HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching strong `ETag` containing obs-text.',
      id: 'conditional-etag-strong-respond-obs-text',
      kind: 'optimal',
      depends_on: ['conditional-etag-strong-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', '"abcdefü"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', '"abcdefü"']
          ],
          expected_type: 'cached',
          expected_status: 304,
          expected_response_headers: [
            ['ETag', '"abcdefü"']
          ]
        }
      ]
    },
    {
      name: 'HTTP cache responds to unquoted `If-None-Match` with a `304` when holding a fresh response with a matching strong `ETag` that is quoted.',
      id: 'conditional-etag-quoted-respond-unquoted',
      kind: 'check',
      depends_on: ['conditional-etag-strong-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', '"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', 'abcdef']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'HTTP cache responds to unquoted `If-None-Match` with a `304` when holding a fresh response with a matching strong `ETag` that is unquoted.',
      id: 'conditional-etag-unquoted-respond-unquoted',
      kind: 'check',
      depends_on: ['conditional-etag-strong-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', 'abcdef'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', 'abcdef']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'HTTP cache responds to quoted `If-None-Match` with a `304` when holding a fresh response with a matching strong `ETag` that is unquoted.',
      id: 'conditional-etag-unquoted-respond-quoted',
      kind: 'check',
      depends_on: ['conditional-etag-strong-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', 'abcdef'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', '"abcdef"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'An optimal HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching weak `ETag`.',
      id: 'conditional-etag-weak-respond',
      kind: 'optimal',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', 'W/"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', 'W/"abcdef"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching weak `ETag`, and the entity-tag weakness flag is lowercase.',
      id: 'conditional-etag-weak-respond-lowercase',
      kind: 'check',
      depends_on: ['conditional-etag-weak-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', 'w/"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', 'w/"abcdef"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching weak `ETag`, and the entity-tag weakness flag uses `\\` instead of `/`.',
      id: 'conditional-etag-weak-respond-backslash',
      kind: 'check',
      depends_on: ['conditional-etag-weak-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', 'W\\"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', 'W\\"abcdef"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching weak `ETag`, and the entity-tag weakness flag omits `/`.',
      id: 'conditional-etag-weak-respond-omit-slash',
      depends_on: ['conditional-etag-weak-respond'],
      kind: 'check',
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', 'W"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', 'W"abcdef"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'An optimal HTTP cache responds to `If-None-Match` with a `304` when it contains multiple entity-tags (first one).',
      id: 'conditional-etag-strong-respond-multiple-first',
      kind: 'optimal',
      depends_on: ['conditional-etag-strong-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', '"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', '"abcdef", "1234", "5678"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'An optimal HTTP cache responds to `If-None-Match` with a `304` when it contains multiple entity-tags (middle one).',
      id: 'conditional-etag-strong-respond-multiple-second',
      kind: 'optimal',
      depends_on: ['conditional-etag-strong-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', '"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', '"1234", "abcdef", "5678"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'An optimal HTTP cache responds to `If-None-Match` with a `304` when it contains multiple entity-tags (last one).',
      id: 'conditional-etag-strong-respond-multiple-last',
      kind: 'optimal',
      depends_on: ['conditional-etag-strong-respond'],
      browser_skip: true,
      requests: [
        {
          response_headers: [
            ['Expires', 100000],
            ['ETag', '"abcdef"'],
            ['Date', 0]
          ],
          setup: true
        },
        {
          request_headers: [
            ['If-None-Match', '"1234", "5678", "abcdef"']
          ],
          expected_type: 'cached',
          expected_status: 304
        }
      ]
    },
    {
      name: 'An optimal HTTP cache generates a `If-None-Match` request when holding a stale response with a matching strong `ETag`.',
      id: 'conditional-etag-strong-generate',
      kind: 'optimal',
      requests: [
        {
          'response_headers': [
            ['Expires', 1],
            ['ETag', '"abcdef"'],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_request_headers: [
            ['If-None-Match', '"abcdef"']
          ],
          expected_type: 'etag_validated'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache generates a `If-None-Match` request when holding a stale response with a matching weak `ETag`.',
      id: 'conditional-etag-weak-generate-weak',
      kind: 'optimal',
      requests: [
        {
          'response_headers': [
            ['Expires', 1],
            ['ETag', 'W/"abcdef"'],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_request_headers: [
            ['If-None-Match', 'W/"abcdef"']
          ],
          expected_type: 'etag_validated'
        }
      ]
    },
    {
      name: 'HTTP cache generates a quoted `If-None-Match` request when holding a stale response with a matching, unquoted strong `ETag`.',
      id: 'conditional-etag-strong-generate-unquoted',
      kind: 'check',
      depends_on: ['conditional-etag-strong-generate'],
      requests: [
        {
          response_headers: [
            ['Expires', 1],
            ['ETag', 'abcdef'],
            ['Date', 0]
          ],
          setup: true,
          pause_after: true
        },
        {
          expected_request_headers: [
            ['If-None-Match', '"abcdef"']
          ],
          expected_type: 'etag_validated'
        }
      ]
    }
  ]
}

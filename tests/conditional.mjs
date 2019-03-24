
export default {
  name: 'Conditional Requests',
  id: 'conditional',
  description: 'Testing of HTTP [conditional requests](https://httpwg.org/specs/rfc7232.html); currently covering `If-None-Match` and `If-Modified-Since` for `ETag`s and `Last-Modified` respectively.',
  tests: [
    {
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching strong ETag.',
      id: 'conditional-etag-strong-respond',
      kind: 'optimal',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching strong ETag containing obs-text.',
      id: 'conditional-etag-strong-respond-obs-text',
      kind: 'optimal',
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
          expected_status: 304
        }
      ]
    },
    {
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching strong ETag that is unquoted.',
      id: 'conditional-etag-strong-respond-unquote',
      kind: 'optimal',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching weak ETag.',
      id: 'conditional-etag-weak-respond',
      kind: 'optimal',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching weak ETag, and the entity-tag weakness flag is lowercase.',
      id: 'conditional-etag-weak-respond-lowercase',
      kind: 'check',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching weak ETag, and the entity-tag weakness flag uses `\\` instead of `/`.',
      id: 'conditional-etag-weak-respond-backslash',
      kind: 'check',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when holding a fresh response with a matching weak ETag, and the entity-tag weakness flag omits `/`.',
      id: 'conditional-etag-weak-respond-omit-slash',
      kind: 'check',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when request entity-tag is unquoted.',
      id: 'conditional-etag-strong-quote-mismatch',
      kind: 'check',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when it contains multiple entity-tags (first one).',
      id: 'conditional-etag-strong-respond-multiple-first',
      kind: 'optimal',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when it contains multiple entity-tags (middle one).',
      id: 'conditional-etag-strong-respond-multiple-second',
      kind: 'optimal',
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
      name: 'HTTP cache responds to `If-None-Match` with a `304` when it contains multiple entity-tags (last one).',
      id: 'conditional-etag-strong-respond-multiple-last',
      kind: 'optimal',
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
      name: 'HTTP cache generates a `If-None-Match` request when holding a stale response with a matching strong ETag.',
      id: 'conditional-etag-strong-generate',
      kind: 'optimal',
      requests: [
        {
          'response_headers': [
            ['Expires', 0],
            ['ETag', '"abcdef"'],
            ['Date', 0]
          ],
          setup: true
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
      name: 'HTTP cache generates a `If-None-Match` request when holding a stale response with a matching weak ETag.',
      id: 'conditional-etag-weak-generate-weak',
      kind: 'optimal',
      requests: [
        {
          'response_headers': [
            ['Expires', 0],
            ['ETag', 'W/"abcdef"'],
            ['Date', 0]
          ],
          setup: true
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
      name: 'HTTP cache generates a quoted `If-None-Match` request when holding a stale response with a matching, unquoted strong ETag.',
      id: 'conditional-etag-strong-generate-unquoted',
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Expires', 0],
            ['ETag', 'abcdef'],
            ['Date', 0]
          ],
          setup: true
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

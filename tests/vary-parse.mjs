
export default {
  name: 'Vary Parsing',
  id: 'vary-parse',
  description: 'These tests check how implementations parse the `Vary` response header. They are not conformance tests because error handling is not clearly specified; rather, they are being used to gather information as input to spec revisions. See also the [specification for Vary](https://httpwg.org/specs/rfc7231.html#header.vary), and [this issue](https://github.com/httpwg/http-core/issues/286) for relevant discussion.',
  tests: [
    {
      name: 'Does HTTP cache reuse `Vary` response with a value of `*`?',
      id: 'vary-syntax-star',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', '*', false]
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache reuse `Vary` response with a value of `*, *`?',
      id: 'vary-syntax-star-star',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', '*, *', false]
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache reuse `Vary` response with a value of `*, *` on different lines?',
      id: 'vary-syntax-star-star-lines',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', '*', false],
            ['Vary', '*', false]
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache reuse `Vary` response with a value of `, *`?',
      id: 'vary-syntax-empty-star',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', ', *', false]
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache reuse `Vary` response with a value of `, *` on different lines?',
      id: 'vary-syntax-empty-star-lines',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', '', false],
            ['Vary', '*', false]
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache reuse `Vary` response with a value of `*, Foo`?',
      id: 'vary-syntax-star-foo',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', '*, Foo', false]
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache reuse `Vary` response with a value of `Foo, *`?',
      id: 'vary-syntax-foo-star',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo, *', false]
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'cached'
        }
      ]
    }
  ]
}

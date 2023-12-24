import * as templates from './lib/templates.mjs'

export default {
  name: 'Vary Parsing',
  id: 'vary-parse',
  description: 'These tests check how caches parse the `Vary` response header.',
  spec_anchors: ['caching.negotiated.responses'],
  tests: [
    {
      name: 'HTTP cache must not reuse `Vary` response with a value of `*`',
      id: 'vary-syntax-star',
      requests: [
        templates.varyParseSetup({
          response_headers: [
            ['Vary', '*', false]
          ]
        }),
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse `Vary` response with a value of `*, *`',
      id: 'vary-syntax-star-star',
      requests: [
        templates.varyParseSetup({
          response_headers: [
            ['Vary', '*, *', false]
          ]
        }),
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse `Vary` response with a value of `*, *` on different lines',
      id: 'vary-syntax-star-star-lines',
      requests: [
        templates.varyParseSetup({
          response_headers: [
            ['Vary', '*', false],
            ['Vary', '*', false]
          ]
        }),
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse `Vary` response with a value of `, *`',
      id: 'vary-syntax-empty-star',
      requests: [
        templates.varyParseSetup({
          response_headers: [
            ['Vary', ', *', false]
          ]
        }),
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse `Vary` response with a value of `, *` on different lines',
      id: 'vary-syntax-empty-star-lines',
      requests: [
        templates.varyParseSetup({
          response_headers: [
            ['Vary', '', false],
            ['Vary', '*', false]
          ]
        }),
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse `Vary` response with a value of `*, Foo`',
      id: 'vary-syntax-star-foo',
      requests: [
        templates.varyParseSetup({
          response_headers: [
            ['Vary', '*, Foo', false]
          ]
        }),
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse `Vary` response with a value of `Foo, *`',
      id: 'vary-syntax-foo-star',
      requests: [
        templates.varyParseSetup({
          response_headers: [
            ['Vary', 'Foo, *', false]
          ]
        }),
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    }
  ]
}

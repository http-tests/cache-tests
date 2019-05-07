import * as utils from '../utils.mjs'

export default {
  name: 'Vary and Secondary Cache Keys',
  id: 'vary',
  description: 'These tests check for conformance and optimal behaviour when calculating a [secondary cache key] in HTTP; also known as `Vary` handling.',
  tests: [
    {
      name: 'An optimal HTTP cache reuses a `Vary` response when the request matches',
      id: 'vary-match',
      kind: 'optimal',
      requests: [
        {
          template: 'vary-setup'
        },
        {
          request_headers: [
            ['Foo', '1']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: "HTTP cache must not reuse `Vary` response when request doesn't match",
      id: 'vary-no-match',
      requests: [
        {
          template: 'vary-setup'
        },
        {
          request_headers: [
            ['Foo', '2']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse `Vary` response when request omits variant request header',
      id: 'vary-omit',
      requests: [
        {
          template: 'vary-setup'
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache can store two different variants',
      id: 'vary-invalidate',
      kind: 'optimal',
      requests: [
        {
          template: 'vary-setup',
          response_body: utils.httpContent('foo_1')
        },
        {
          request_headers: [
            ['Foo', '2']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo']
          ],
          expected_type: 'not_cached',
          response_body: utils.httpContent('foo_2'),
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1']
          ],
          response_body: utils.httpContent('foo_1'),
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache should not include headers not listed in `Vary` in the cache key',
      id: 'vary-cache-key',
      kind: 'optimal',
      requests: [
        {
          template: 'vary-setup',
          request_headers: [
            ['Foo', '1'],
            ['Other', '2']
          ]
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Other', '3']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a two-way `Vary` response when request matches',
      id: 'vary-2-match',
      kind: 'optimal',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Bar', 'abc']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo, Bar']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Bar', 'abc']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: "HTTP cache must not reuse two-way `Vary` response when request doesn't match",
      id: 'vary-2-no-match',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Bar', 'abc']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo, Bar']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '2'],
            ['Bar', 'abc']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse two-way `Vary` response when request omits variant request header',
      id: 'vary-2-match-omit',
      requests: [
        {
          request_headers: [
            ['Foo', '1']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo, Bar']
          ],
          setup: true
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a three-way `Vary` response when request matches',
      id: 'vary-3-match',
      kind: 'optimal',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Bar', 'abc'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo, Bar, Baz']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Bar', 'abc'],
            ['Baz', '789']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: "HTTP cache must not reuse three-way `Vary` response when request doesn't match",
      id: 'vary-3-no-match',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Bar', 'abc'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo, Bar, Baz']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '2'],
            ['Bar', 'abc'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: "HTTP cache must not reuse three-way `Vary` response when request doesn't match, regardless of header order",
      id: 'vary-3-order',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Bar', 'abc4'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo, Bar, Baz']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Bar', 'abc'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a three-way `Vary` response when both request and the original request omited a variant header',
      id: 'vary-3-omit',
      kind: 'optimal',
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Baz', '789']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Date', 0],
            ['Last-Modified', -3000],
            ['Vary', 'Foo, Bar, Baz']
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
      name: 'HTTP cache must not reuse `Vary` response with a value of `*`',
      id: 'vary-star',
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
            ['Vary', '*']
          ],
          setup: true
        },
        {
          request_headers: [
            ['*', '1'],
            ['Baz', '789']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache normalises unknown selecting headers by combining fields',
      id: 'vary-normalise-combine',
      kind: 'optimal',
      requests: [
        {
          request_headers: [
            ['Foo', '1, 2']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', '1'],
            ['Foo', '2']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache normalises `Accept-Language` by ignoring language order',
      id: 'vary-normalise-lang-order',
      kind: 'optimal',
      requests: [
        {
          request_headers: [
            ['Accept-Language', 'en, de']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Accept-Language']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Accept-Language', 'de, en']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache normalises `Accept-Language` by ignoring language case',
      id: 'vary-normalise-lang-case',
      kind: 'optimal',
      requests: [
        {
          request_headers: [
            ['Accept-Language', 'en, de']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Accept-Language']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Accept-Language', 'eN, De']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache normalises `Accept-Language` by ignoring whitespace',
      id: 'vary-normalise-lang-space',
      kind: 'optimal',
      requests: [
        {
          request_headers: [
            ['Accept-Language', 'en, de']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Accept-Language']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Accept-Language', ' en ,   de']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache select `Content-Language` by using the qvalue on `Accept-Language`?',
      id: 'vary-normalise-lang-select',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Accept-Language', 'en, de']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Accept-Language'],
            ['Content-Language', 'de']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Accept-Language', 'fr;q=0.5, de;q=1.0']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache normalise unknown selecting headers by removing whitespace?',
      id: 'vary-normalise-space',
      kind: 'check',
      requests: [
        {
          request_headers: [
            ['Foo', '1,2']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Foo', ' 1, 2 ']
          ],
          expected_type: 'cached'
        }
      ]
    }
  ]
}

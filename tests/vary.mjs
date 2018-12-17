import * as utils from '../utils.mjs'

export default {
  name: 'Vary and Secondary Cache Keys',
  id: 'vary',
  tests: [
    {
      name: 'HTTP cache should reuse Vary response when request matches',
      id: 'vary-match',
      required: false,
      requests: [
        {
          request_headers: [
            ['Foo', '1']
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
            ['Foo', '1']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: "HTTP cache must not reuse Vary response when request doesn't match",
      id: 'vary-no-match',
      required: false,
      requests: [
        {
          request_headers: [
            ['Foo', '1']
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
            ['Foo', '2']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache must not reuse Vary response when request omits variant header',
      id: 'vary-omit',
      requests: [
        {
          request_headers: [
            ['Foo', '1']
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
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache should not invalidate existing Vary response',
      id: 'vary-invalidate',
      required: false,
      requests: [
        {
          request_headers: [
            ['Foo', '1']
          ],
          response_headers: [
            ['Expires', 5000],
            ['Last-Modified', -3000],
            ['Date', 0],
            ['Vary', 'Foo']
          ],
          response_body: utils.httpContent('foo_1'),
          setup: true
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
      name: 'HTTP cache should not include headers not listed in Vary in the cache key',
      id: 'vary-cache-key',
      required: false,
      requests: [
        {
          request_headers: [
            ['Foo', '1'],
            ['Other', '2']
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
            ['Other', '3']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache should reuse two-way Vary response when request matches',
      id: 'vary-2-match',
      required: false,
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
      name: "HTTP cache must not reuse two-way Vary response when request doesn't match",
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
      name: 'HTTP cache must not reuse two-way Vary response when request omits variant header',
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
      name: 'HTTP cache should reuse three-way Vary response when request matches',
      id: 'vary-3-match',
      required: false,
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
      name: "HTTP cache must not reuse three-way Vary response when request doesn't match",
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
      name: "HTTP cache must not reuse three-way Vary response when request doesn't match, regardless of header order",
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
      name: 'HTTP cache should reuse three-way Vary response when both request and the original request omited a variant header',
      id: 'vary-3-omit',
      required: false,
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
      name: "HTTP cache must not reuse Vary response with a field value of '*'",
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
    }
  ]
}

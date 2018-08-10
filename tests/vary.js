import * as utils from '../utils.js'

export default {
  name: 'Vary and Secondary Cache Keys',
  tests: [
    {
      name: 'HTTP cache SHOULD reuse Vary response when request matches',
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
          ]
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
      name: "HTTP cache MUST NOT reuse Vary response when request doesn't match",
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
          ]
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
      name: 'HTTP cache MUST NOT reuse Vary response when request omits variant header',
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
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache SHOULD NOT invalidate existing Vary response',
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
          response_body: utils.httpContent('foo_2')
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
      name: 'HTTP cache SHOULD NOT include headers not listed in Vary in the cache key',
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
      name: 'HTTP cache SHOULD reuse two-way Vary response when request matches',
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
          ]
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
      name: "HTTP cache MUST NOT reuse two-way Vary response when request doesn't match",
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
          ]
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
      name: 'HTTP cache MUST NOT reuse two-way Vary response when request omits variant header',
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
          ]
        },
        {
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache SHOULD reuse three-way Vary response when request matches',
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
          ]
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
      name: "HTTP cache MUST NOT reuse three-way Vary response when request doesn't match",
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
          ]
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
      name: "HTTP cache MUST NOT reuse three-way Vary response when request doesn't match, regardless of header order",
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
          ]
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
      name: 'HTTP cache SHOULD reuse three-way Vary response when both request and the original request omited a variant header',
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
          ]
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
      name: "HTTP cache MUST NOT reuse Vary response with a field value of '*'",
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
          ]
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

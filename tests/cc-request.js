import * as utils from '../utils.js'

export default {
  name: 'Cache-Control Request Directives',
  tests: [
    {
      name: "HTTP cache MUST NOT reuse aged but fresh response when request contains Cache-Control: max-age=0",
      requests: [
        {
          template: 'fresh',
          pause_after: true
        },
        {
          request_headers: [
            ['Cache-Control', 'max-age=0']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: "HTTP cache MUST NOT reuse aged but fresh response when request contains Cache-Control: max-age=1",
      requests: [
        {
          template: 'fresh',
          pause_after: true
        },
        {
          request_headers: [
            ['Cache-Control', 'max-age=1']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: "HTTP cache MUST NOT reuse fresh response with Age header when request contains Cache-Control: max-age that is greater than remaining freshness",
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Age', '1800']
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'max-age=600']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache SHOULD reuse aged stale response when request contains Cache-Control: max-stale that permits its use',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1']
          ],
          pause_after: true
        },
        {
          request_headers: [
            ['Cache-Control', 'max-stale=1000']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'HTTP cache SHOULD reuse stale response with Age header when request contains Cache-Control: max-stale that permits its use',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1500'],
            ['Age', '2000']
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'max-stale=1000']
          ],
          expected_type: 'cached'
        }
      ]
    },
    {
      name: "HTTP cache MUST NOT reuse fresh response when request contains Cache-Control: min-fresh that wants it fresher",
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1500']
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'min-fresh=2000']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: "HTTP cache MUST NOT reuse fresh response with Age header when request contains Cache-Control: min-fresh that wants it fresher",
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1500'],
            ['Age', '1000']
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'min-fresh=1000']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: "HTTP cache MUST NOT reuse fresh response when request contains Cache-Control: no-cache",
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'no-cache']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache SHOULD validate fresh response with Last-Modified when request contains Cache-Control: no-cache',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Last-Modified', -10000],
            ['Date', 0]
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'no-cache']
          ],
          expected_type: 'lm_validate'
        }
      ]
    },
    {
      name: 'HTTP cache SHOULD validate fresh response with ETag when request contains Cache-Control: no-cache',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['ETag', utils.httpContent('abc')]
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'no-cache']
          ],
          expected_type: 'etag_validate'
        }
      ]
    },
    {
      name: "HTTP cache MUST NOT reuse fresh response when request contains Cache-Control: no-store",
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ]
        },
        {
          request_headers: [
            ['Cache-Control', 'no-store']
          ],
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'HTTP cache MUST generate 504 status code when nothing is in cache and request contains Cache-Control: only-if-cached',
      requests: [
        {
          request_headers: [
            ['Cache-Control', 'only-if-cached']
          ],
          expected_status: 504,
          expected_response_text: null
        }
      ]
    }
  ]
}

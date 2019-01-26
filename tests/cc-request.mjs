import * as utils from '../utils.mjs'

export default {
  name: 'Cache-Control Request Directives',
  id: 'cc-request',
  tests: [
    {
      name: 'HTTP cache should not reuse aged but fresh response when request contains Cache-Control: max-age=0',
      id: 'ccreq-ma0',
      kind: 'optimal',
      requests: [
        {
          template: 'fresh',
          pause_after: true,
          setup: true
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
      name: 'HTTP cache should not reuse aged but fresh response when request contains Cache-Control: max-age=1',
      id: 'ccreq-ma1',
      kind: 'optimal',
      requests: [
        {
          template: 'fresh',
          pause_after: true,
          setup: true
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
      name: 'HTTP cache should not reuse fresh response with Age header when request contains Cache-Control: max-age that is greater than remaining freshness',
      id: 'ccreq-magreaterage',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Age', '1800']
          ],
          setup: true
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
      name: 'HTTP cache should reuse aged stale response when request contains Cache-Control: max-stale that permits its use',
      id: 'ccreq-max-stale',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1']
          ],
          pause_after: true,
          setup: true
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
      name: 'HTTP cache should reuse stale response with Age header when request contains Cache-Control: max-stale that permits its use',
      id: 'ccreq-max-stale-age',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1500'],
            ['Age', '2000']
          ],
          setup: true
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
      name: 'HTTP cache should not reuse fresh response when request contains Cache-Control: min-fresh that wants it fresher',
      id: 'ccreq-min-fresh',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1500']
          ],
          setup: true
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
      name: 'HTTP cache should not reuse fresh response with Age header when request contains Cache-Control: min-fresh that wants it fresher',
      id: 'ccreq-min-fresh-age',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=1500'],
            ['Age', '1000']
          ],
          setup: true
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
      name: 'HTTP cache should not reuse fresh response when request contains Cache-Control: no-cache',
      id: 'ccreq-no-cache',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ],
          setup: true
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
      name: 'HTTP cache should validate fresh response with Last-Modified when request contains Cache-Control: no-cache',
      id: 'ccreq-no-cache-lm',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Last-Modified', -10000],
            ['Date', 0]
          ],
          setup: true
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
      name: 'HTTP cache should validate fresh response with ETag when request contains Cache-Control: no-cache',
      id: 'ccreq-no-cache-etag',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['ETag', utils.httpContent('abc')]
          ],
          setup: true
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
      name: 'HTTP cache should not reuse fresh response when request contains Cache-Control: no-store',
      id: 'ccreq-no-store',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ],
          setup: true
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
      name: 'HTTP cache should generate 504 status code when nothing is in cache and request contains Cache-Control: only-if-cached',
      id: 'ccreq-oic',
      kind: 'optimal',
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

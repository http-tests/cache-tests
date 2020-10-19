
import * as templates from '../lib/templates.mjs'
import * as utils from '../lib/utils.mjs'

export default

{
  name: 'Other Caching Requirements',
  id: 'other',
  description: 'These tests check for conformance to other requirements that apply to HTTP caches. ',
  tests: [
    {
      name: 'HTTP cache [must generate](https://httpwg.org/specs/rfc7234.html#constructing.responses.from.caches) an [`Age` header](https://httpwg.org/specs/rfc7234.html#header.age) when using a stored response.',
      id: 'other-age-gen',
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
            ['Date', 0]
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Age', '>', 2]
          ]
        }
      ]
    },
    {
      name: 'HTTP cache [must update](https://httpwg.org/specs/rfc7234.html#constructing.responses.from.caches) the [`Age` header](https://httpwg.org/specs/rfc7234.html#header.age) when freshness is based upon `Expires`',
      id: 'other-age-update-expires',
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
            ['Date', 0],
            ['Age', '30']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Age', '>', 32]
          ]
        }
      ]
    },
    {
      name: 'HTTP cache [must update](https://httpwg.org/specs/rfc7234.html#constructing.responses.from.caches) the [`Age` header](https://httpwg.org/specs/rfc7234.html#header.age) when freshness is based upon `CC: max-age`',
      id: 'other-age-update-max-age',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=600'],
            ['Date', 0],
            ['Age', '30']
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Age', '>', 32]
          ]
        }
      ]
    },
    {
      name: 'HTTP cache must not update the [`Date` header](https://httpwg.org/specs/rfc7231.html#header.date)',
      id: 'other-date-update',
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
            ['Date', 0]
          ],
          pause_after: true,
          setup: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Date', 0]
          ]
        }
      ]
    },
    {
      name: 'Different query arguments must be different cache keys',
      id: 'query-args-different',
      requests: [
        templates.fresh({
          query_arg: 'test=' + utils.httpContent('query-args-different-1')
        }),
        {
          query_arg: 'test=' + utils.httpContent('query-args-different-2'),
          expected_type: 'not_cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache should not be affected by the presence of a URL query',
      id: 'query-args-same',
      kind: 'optimal',
      requests: [
        templates.fresh({
          query_arg: 'test=' + utils.httpContent('query-args-same')
        }),
        {
          query_arg: 'test=' + utils.httpContent('query-args-same'),
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP heuristically cache a response with a `Content-Disposition: attachment` header?',
      id: 'other-heuristic-content-disposition-attachment',
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Last-Modified', -100000],
            ['Date', 0],
            ['Content-Disposition', 'attachment; filename=example.txt']
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP reuse a fresh response with a `Content-Disposition: attachment` header?',
      id: 'other-fresh-content-disposition-attachment',
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Content-Disposition', 'attachment; filename=example.txt']
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a fresh response with a `Set-Cookie` header',
      id: 'other-set-cookie',
      kind: 'optimal',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Set-Cookie', 'a=b']
          ],
          setup: true
        },
        {
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'An optimal HTTP cache reuses a fresh response when the request has a `Cookie` header',
      id: 'other-cookie',
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
            ['Cookie', 'a=b']
          ],
          expected_type: 'cached'
        }
      ]
    }
  ]
}

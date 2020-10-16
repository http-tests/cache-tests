
import * as templates from '../lib/templates.mjs'

export default

{
  name: 'Stale Serving Requirements',
  id: 'stale',
  description: 'These tests check for conformance to stale serving requirements that apply to HTTP caches. ',
  tests: [
    {
      name: 'Does HTTP cache serve stale stored response when server closes the connection?',
      id: 'stale-close',
      kind: 'check',
      requests: [
        templates.becomeStale({}),
        {
          disconnect: true,
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache serve stale stored response when server sends a `503 Service Unavailable`?',
      id: 'stale-503',
      kind: 'check',
      requests: [
        templates.becomeStale({}),
        {
          response_status: [503, 'Service Unavailable'],
          expected_status: 200,
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache generate a `Warning` header when using a response that was stored already stale?',
      id: 'stale-warning-stored',
      kind: 'check',
      requests: [
        templates.stale({}),
        {
          disconnect: true,
          expected_type: 'cached',
          expected_response_headers: ['warning'],
          setup_tests: ['expected_type']
        }
      ]
    },
    {
      name: 'Does HTTP cache generate a `Warning` header when using a stored response that became stale?',
      id: 'stale-warning-become',
      kind: 'check',
      depends_on: ['stale-close'],
      requests: [
        templates.becomeStale({}),
        {
          disconnect: true,
          expected_type: 'cached',
          expected_response_headers: ['warning'],
          setup_tests: ['expected_type']
        }
      ]
    }
  ]
}

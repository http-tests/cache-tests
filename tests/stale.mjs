import * as templates from './lib/templates.mjs'

function makeStaleCheckCC (cc, value) {
  return {
    name: `HTTP cache must not serve stale stored response when prohibited by \`Cache-Control: ${cc}\`?`,
    id: `stale-close-${cc}${value || ''}`,
    depends_on: ['stale-close'],
    spec_anchors: [`cache-response-directive.${cc}`],
    requests: [
      {
        response_headers: [
          ['Cache-Control', `max-age=2, ${cc}${value || ''}`]
        ],
        setup: true,
        pause_after: true
      },
      {
        disconnect: true,
        expected_type: 'not_cached'
      }
    ]
  }
}

export default {
  name: 'Serving Stale',
  id: 'stale',
  description: 'These tests check how caches serve stale content.',
  spec_anchors: ['serving.stale.responses'],
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
      name: 'Does HTTP cache serve stale stored response when server sends `Cache-Control: stale-if-error` and subsequently closes the connection?',
      id: 'stale-sie-close',
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=2, stale-if-error=60']
          ],
          setup: true,
          pause_after: true
        },
        {
          disconnect: true,
          expected_type: 'cached'
        }
      ]
    },
    {
      name: 'Does HTTP cache serve stale stored response when server sends `Cache-Control: stale-if-error` and subsequently a `503 Service Unavailable`?',
      id: 'stale-sie-503',
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=2, stale-if-error=60']
          ],
          setup: true,
          pause_after: true
        },
        {
          disconnect: true,
          expected_type: 'cached'
        }
      ]
    },
    makeStaleCheckCC('must-revalidate'),
    makeStaleCheckCC('proxy-revalidate'),
    makeStaleCheckCC('no-cache'),
    makeStaleCheckCC('s-maxage', '=2'),
    {
      name: 'Does HTTP cache generate a `Warning` header when using a response that was stored already stale?',
      id: 'stale-warning-stored',
      kind: 'check',
      depends_on: ['stale-close'],
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

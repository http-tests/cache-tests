
export default

{
  name: 'Stale Serving Requirements',
  id: 'stale',
  description: 'These tests check for conformance to stale serving requirements that apply to HTTP caches. ',
  tests: [
    {
      name: 'Does HTTP cache serve stale content when server closes the connection?',
      id: 'stale-close',
      kind: 'check',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=2']
          ],
          setup: true,
          pause_after: true
        },
        {
          disconnect: true,
          expected_type: 'cached'
        }
      ]
    }
  ]
}

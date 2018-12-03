
export default

{
  name: 'Other Caching Requirements',
  tests: [
    {
      name: 'HTTP cache must generate an Age header',
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
            ['Date', 0]
          ],
          pause_after: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Age', function (assert, p, a) {
              assert(a !== undefined, `${p} isn't present`)
              assert(parseInt(a) > 2, `${p} is ${a}, should be bigger`)
            }]
          ]
        }
      ]
    },
    {
      name: 'HTTP cache must update the Age header (Expires)',
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
            ['Date', 0],
            ['Age', '30']
          ],
          pause_after: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Age', function (assert, p, a) {
              assert(a !== undefined, `${p} isn't present`)
              assert(parseInt(a) > 32, `${p} is ${a}, should be bigger`)
            }]
          ]
        }
      ]
    },
    {
      name: 'HTTP cache must update the Age header (CC: max-age)',
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=600'],
            ['Date', 0],
            ['Age', '30']
          ],
          pause_after: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Age', function (assert, p, a) {
              assert(a !== undefined, `${p} isn't present`)
              assert(parseInt(a) > 32, `${p} is ${a}, should be bigger`)
            }]
          ]
        }
      ]
    },
    {
      name: 'HTTP cache must not update the Date header',
      requests: [
        {
          response_headers: [
            ['Expires', 30 * 24 * 60 * 60],
            ['Date', 0]
          ],
          pause_after: true
        },
        {
          expected_type: 'cached',
          expected_response_headers: [
            ['Date', function (assert, p, a, r) {
              assert.isTrue(a === r.headers.get('Server-Now'), `${p} is ${a}, should be ${r.headers.get('Server-Now')}`)
            }]
          ]
        }
      ]
    }
  ]
}

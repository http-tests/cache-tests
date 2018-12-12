export default {
  name: 'Partial Content',
  tests: [
    {
      name: 'HTTP cache should store partial content and reuse it',
      id: 'partial-store-partial-reuse-partial',
      required: false,
      requests: [
        {
          request_headers: [
            ['Range', 'bytes=-5']
          ],
          response_status: [206, 'Partial Content'],
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Content-Range', 'bytes 4-9/10']
          ],
          response_body: '01234',
          expected_request_headers: [
            ['Range', 'bytes=-5']
          ],
          setup: true
        },
        {
          request_headers: [
            ['Range', 'bytes=-5']
          ],
          expected_type: 'cached',
          expected_status: 206,
          expected_response_text: '01234'
        }
      ]
    },
    {
      name: 'HTTP cache should store complete response and serve smaller ranges from it (byte-range-spec)',
      id: 'partial-store-complete-reuse-partial',
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ],
          response_body: '01234567890',
          setup: true
        },
        {
          request_headers: [
            ['Range', 'bytes=0-1']
          ],
          expected_type: 'cached',
          expected_status: 206,
          expected_response_text: '01'
        }
      ]
    },
    {
      name: 'HTTP cache should store complete response and serve smaller ranges from it (absent last-byte-pos)',
      id: 'partial-store-complete-reuse-partial-no-last',
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ],
          response_body: '01234567890',
          setup: true
        },
        {
          request_headers: [
            ['Range', 'bytes=1-']
          ],
          expected_type: 'cached',
          expected_status: 206,
          expected_response_text: '1234567890'
        }
      ]
    },
    {
      name: 'HTTP cache should store complete response and serve smaller ranges from it (suffix-byte-range-spec)',
      id: 'partial-store-complete-reuse-partial-suffix',
      required: false,
      requests: [
        {
          response_headers: [
            ['Cache-Control', 'max-age=3600']
          ],
          response_body: '0123456789A',
          setup: true
        },
        {
          request_headers: [
            ['Range', 'bytes=-1']
          ],
          expected_type: 'cached',
          expected_status: 206,
          expected_response_text: 'A'
        }
      ]
    },
    {
      name: 'HTTP cache should store partial response and serve smaller ranges from it (byte-range-spec)',
      id: 'partial-store-partial-reuse-partial-byterange',
      required: false,
      requests: [
        {
          request_headers: [
            ['Range', 'bytes=-5']
          ],
          response_status: [206, 'Partial Content'],
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Content-Range', 'bytes 4-9/10']
          ],
          response_body: '01234',
          setup: true
        },
        {
          request_headers: [
            ['Range', 'bytes=6-8']
          ],
          expected_type: 'cached',
          expected_status: 206,
          expected_response_text: '234'
        }
      ]
    },
    {
      name: 'HTTP cache should store partial response and serve smaller ranges from it (absent last-byte-pos)',
      id: 'partial-store-partial-reuse-partial-absent',
      required: false,
      requests: [
        {
          request_headers: [
            ['Range', 'bytes=-5']
          ],
          response_status: [206, 'Partial Content'],
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Content-Range', 'bytes 4-9/10']
          ],
          response_body: '01234',
          setup: true
        },
        {
          request_headers: [
            ['Range', 'bytes=6-']
          ],
          expected_type: 'cached',
          expected_status: 206,
          expected_response_text: '234'
        }
      ]
    },
    {
      name: 'HTTP cache should store partial response and serve smaller ranges from it (suffix-byte-range-spec)',
      id: 'partial-store-partial-reuse-partial-suffix',
      required: false,
      requests: [
        {
          request_headers: [
            ['Range', 'bytes=-5']
          ],
          response_status: [206, 'Partial Content'],
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Content-Range', 'bytes 4-9/10']
          ],
          response_body: '01234',
          setup: true
        },
        {
          request_headers: [
            ['Range', 'bytes=-1']
          ],
          expected_type: 'cached',
          expected_status: 206,
          expected_response_text: '4'
        }
      ]
    },
    {
      name: 'HTTP cache should store partial content and complete it',
      id: 'partial-store-partial-complete',
      required: false,
      requests: [
        {
          request_headers: [
            ['Range', 'bytes=-5']
          ],
          response_status: [206, 'Partial Content'],
          response_headers: [
            ['Cache-Control', 'max-age=3600'],
            ['Content-Range', 'bytes 0-4/10']
          ],
          response_body: '01234',
          setup: true
        },
        {
          expected_request_headers: [
            ['range', 'bytes=5-']
          ]
        }
      ]
    }
  ]
}

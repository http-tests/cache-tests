import * as templates from './lib/templates.mjs'

const tests = []

// Boundary times, in seconds since the epoch. Strings are computed from these, so the
// weekday always matches the date.
const boundaries = {
  'int32-min': { secs: -2147483648, label: 'minimum 32-bit signed time' },
  'minus-1': { secs: -1, label: 'one second before the epoch' },
  epoch: { secs: 0, label: 'the epoch' },
  'nginx-max': { secs: 2145916555, label: 'nginx `expires max`' },
  'int32-max': { secs: 2147483647, label: 'maximum 32-bit signed time' },
  'int32-max-plus-1': { secs: 2147483648, label: 'one second after maximum 32-bit signed time' },
  'next-day': { secs: 2147558400, label: 'the day after maximum 32-bit signed time' },
  'round-year': { secs: 2208988800, label: 'the start of 2040' },
  'uint32-max': { secs: 4294967295, label: 'maximum 32-bit unsigned time' },
  'uint32-max-plus-1': { secs: 4294967296, label: 'one second after maximum 32-bit unsigned time' }
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function imf (secs) {
  return new Date(secs * 1000).toUTCString()
}

function asctime (secs) {
  const d = new Date(secs * 1000)
  const pad = n => String(n).padStart(2, '0')
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, ' ')} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} ${d.getUTCFullYear()}`
}

function yearsFromNow (years) {
  return Math.round(years * 365.25 * 24 * 60 * 60)
}

// a number as it appears in a test name
function num (n) {
  return `\`${n}\``
}

// a boundary as it appears in a test name
function when (name) {
  const { secs, label } = boundaries[name]
  return `${imf(secs)} (${label})`
}

const lm2020 = 'Wed, 01 Jan 2020 00:00:00 GMT'

// ---- Group 1: delta-seconds that overflow 32-bit (and wider) arithmetic

function maxAge (n) {
  tests.push({
    name: `An optimal HTTP cache reuses a response with a \`Cache-Control: max-age\` of ${num(n)}`,
    id: `y2038-max-age-${n}`,
    kind: 'optimal',
    depends_on: ['freshness-max-age'],
    spec_anchors: ['cache-response-directive.max-age', 'delta-seconds'],
    requests: [
      {
        response_headers: [
          ['Cache-Control', `max-age=${n}`]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached'
      }
    ]
  })
}

function sMaxAge (n) {
  tests.push({
    name: `An optimal shared HTTP cache reuses a response with a \`Cache-Control: s-maxage\` of ${num(n)}`,
    id: `y2038-s-maxage-${n}`,
    kind: 'optimal',
    depends_on: ['freshness-s-maxage-shared'],
    spec_anchors: ['cache-response-directive.s-maxage', 'delta-seconds'],
    browser_skip: true,
    requests: [
      {
        response_headers: [
          ['Cache-Control', `s-maxage=${n}`]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached'
      }
    ]
  })
}

function staleWhileRevalidate (n) {
  tests.push({
    name: `An optimal cache serves stale stored response with \`Cache-Control: stale-while-revalidate\` of ${num(n)}`,
    id: `y2038-stale-while-revalidate-${n}`,
    kind: 'optimal',
    depends_on: ['stale-while-revalidate'],
    spec_anchors: ['https://www.rfc-editor.org/rfc/rfc5861.html#section-3', 'delta-seconds'],
    requests: [
      {
        response_headers: [
          ['Cache-Control', `max-age=1, stale-while-revalidate=${n}`],
          ['ETag', '"abc"']
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached'
      }
    ]
  })
}

function staleIfError (n) {
  tests.push({
    name: `Does HTTP cache serve stale stored response when server sends \`Cache-Control: stale-if-error\` of ${num(n)} and subsequently a \`503 Service Unavailable\`?`,
    id: `y2038-stale-if-error-${n}`,
    kind: 'check',
    depends_on: ['stale-sie-503'],
    spec_anchors: ['delta-seconds'],
    requests: [
      {
        response_headers: [
          ['Cache-Control', `max-age=2, stale-if-error=${n}`]
        ],
        setup: true,
        pause_after: true
      },
      {
        response_status: [503, 'Service Unavailable'],
        expected_status: 200,
        expected_type: 'cached'
      }
    ]
  })
}

function ageOverflow (n) {
  tests.push({
    name: `HTTP cache should consider a response with an \`Age\` value of ${num(n)} to be stale`,
    id: `y2038-age-${n}`,
    spec_anchors: ['field.age', 'delta-seconds'],
    depends_on: ['freshness-max-age-age'],
    requests: [
      {
        response_headers: [
          ['Date', 0],
          ['Cache-Control', 'max-age=3600'],
          ['Age', n, false]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'not_cached'
      }
    ]
  })
}

// A stored Age near 2^31 must not shrink or go negative once the cache adds its own residence time
function ageGenerated (storedAge, maxAgeValue, id) {
  tests.push({
    name: `HTTP cache must not reduce an \`Age\` of ${storedAge} when it generates one (with \`Cache-Control: max-age=${maxAgeValue}\`)`,
    id: `y2038-age-generated-${id}`,
    spec_anchors: ['field.age', 'constructing.responses.from.caches'],
    depends_on: ['other-age-update-max-age'],
    requests: [
      {
        response_headers: [
          ['Date', 0],
          ['Cache-Control', `max-age=${maxAgeValue}`],
          ['Age', String(storedAge), false]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached',
        expected_response_headers: [
          ['Age', '>', storedAge]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
}

tests.push({
  name: 'An optimal HTTP cache reuses a response with `Cache-Control: max-age: 2147483647`',
  id: 'freshness-max-age-max-minus-1',
  kind: 'optimal',
  depends_on: ['freshness-none'],
  spec_anchors: ['cache-response-directive.max-age'],
  requests: [
    {
      response_headers: [
        ['Cache-Control', 'max-age=2147483647']
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'cached'
    }
  ]
})
tests.push({
  name: 'An optimal HTTP cache reuses a response with `Cache-Control: max-age: 2147483648`',
  id: 'freshness-max-age-max',
  kind: 'optimal',
  depends_on: ['freshness-none'],
  spec_anchors: ['cache-response-directive.max-age'],
  requests: [
    {
      response_headers: [
        ['Cache-Control', 'max-age=2147483648']
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'cached'
    }
  ]
})
tests.push({
  name: 'An optimal HTTP cache reuses a response with `Cache-Control: max-age: 2147483649`',
  id: 'freshness-max-age-max-plus-1',
  kind: 'optimal',
  depends_on: ['freshness-none'],
  spec_anchors: ['cache-response-directive.max-age'],
  requests: [
    {
      response_headers: [
        ['Cache-Control', 'max-age=2147483649']
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'cached'
    }
  ]
})
maxAge('4294967295')
maxAge('4294967296')

for (const n of ['2147483647', '2147483648', '4294967295', '4294967296']) sMaxAge(n)

for (const n of ['2147483648', '4294967296']) staleWhileRevalidate(n)
for (const n of ['2147483648', '4294967296']) staleIfError(n)

tests.push({
  name: 'HTTP cache should consider a response with a `Age` value of 2147483647 to be stale',
  id: 'age-parse-large-minus-one',
  spec_anchors: ['field.age'],
  depends_on: ['freshness-max-age-age'],
  requests: [
    {
      response_headers: [
        ['Date', 0],
        ['Cache-Control', 'max-age=3600'],
        ['Age', '2147483647', false]
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'not_cached'
    }
  ]
})
tests.push({
  name: 'HTTP cache should consider a response with a `Age` value of 2147483648 to be stale',
  id: 'age-parse-large',
  spec_anchors: ['delta-seconds'],
  depends_on: ['freshness-max-age-age'],
  requests: [
    {
      response_headers: [
        ['Date', 0],
        ['Cache-Control', 'max-age=3600'],
        ['Age', '2147483648', false]
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'not_cached'
    }
  ]
})
tests.push({
  name: 'HTTP cache should consider a response with a `Age` value of 2147483649 to be stale',
  id: 'age-parse-larger',
  spec_anchors: ['delta-seconds'],
  depends_on: ['freshness-max-age-age'],
  requests: [
    {
      response_headers: [
        ['Date', 0],
        ['Cache-Control', 'max-age=3600'],
        ['Age', '2147483649', false]
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'not_cached'
    }
  ]
})
ageOverflow('4294967295')
ageOverflow('4294967296')

ageGenerated(2147483640, 2147483647, 'near-int32-max')
ageGenerated(2147483646, 4294967295, 'across-int32-max')

// ---- Group 2: far-future and past Expires and Date

function expiresFuture (name) {
  tests.push({
    name: `An optimal HTTP cache reuses a response with an \`Expires\` of ${when(name)}`,
    id: `y2038-expires-${name}`,
    kind: 'optimal',
    depends_on: ['freshness-expires-future'],
    spec_anchors: ['field.expires'],
    requests: [
      {
        response_headers: [
          ['Expires', imf(boundaries[name].secs), false],
          ['Date', 0]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached'
      }
    ]
  })
}

function expiresPast (name) {
  tests.push({
    name: `HTTP cache must not reuse a response with an \`Expires\` of ${when(name)}`,
    id: `y2038-expires-past-${name}`,
    depends_on: ['freshness-expires-past'],
    spec_anchors: ['field.expires'],
    requests: [
      {
        response_headers: [
          ['Expires', imf(boundaries[name].secs), false],
          ['Date', 0]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'not_cached'
      }
    ]
  })
}

function maxAgeBeatsPastExpires (name) {
  tests.push({
    name: `An optimal HTTP cache reuses a response with positive \`Cache-Control: max-age\` and an \`Expires\` of ${when(name)}`,
    id: `y2038-max-age-expires-${name}`,
    kind: 'optimal',
    depends_on: ['freshness-max-age-expires'],
    spec_anchors: ['cache-response-directive.max-age', 'field.expires'],
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=3600'],
          ['Expires', imf(boundaries[name].secs), false],
          ['Date', 0]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached'
      }
    ]
  })
}

function futureDateExpiresLater (name) {
  const { secs } = boundaries[name]
  tests.push({
    name: `An optimal HTTP cache reuses a response with a \`Date\` of ${when(name)} and an \`Expires\` one hour later`,
    id: `y2038-date-expires-${name}`,
    kind: 'optimal',
    depends_on: ['freshness-expires-future'],
    spec_anchors: ['field.expires', 'field.date'],
    requests: [
      {
        response_headers: [
          ['Date', imf(secs), false],
          ['Expires', imf(secs + 3600), false]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached'
      }
    ]
  })
}

function futureDateBecomesStale (name) {
  tests.push({
    name: `HTTP cache must not reuse a response with a \`Date\` of ${when(name)} and \`Cache-Control: max-age=2\` after it becomes stale`,
    id: `y2038-date-max-age-stale-${name}`,
    depends_on: ['freshness-max-age-stale'],
    spec_anchors: ['cache-response-directive.max-age', 'field.date'],
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=2'],
          ['Date', imf(boundaries[name].secs), false]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'not_cached'
      }
    ]
  })
}

function pastDate (name) {
  tests.push({
    name: `Does HTTP cache consider a \`Date\` of ${when(name)} when applying \`Cache-Control: max-age\` (is the response stale)?`,
    id: `y2038-date-past-${name}`,
    kind: 'check',
    depends_on: ['freshness-max-age-date'],
    spec_anchors: ['cache-response-directive.max-age', 'field.date'],
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=3600'],
          ['Date', imf(boundaries[name].secs), false]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'not_cached'
      }
    ]
  })
}

for (const name of ['int32-min', 'minus-1', 'epoch']) expiresPast(name)
for (const name of ['int32-min', 'minus-1', 'epoch']) maxAgeBeatsPastExpires(name)

expiresFuture('nginx-max')
expiresFuture('int32-max')
tests.push({
  name: 'An optimal HTTP cache reuses a response with an `Expires` that is exactly 32 bits',
  id: 'freshness-expires-32bit',
  kind: 'optimal',
  depends_on: ['freshness-expires-future'],
  requests: [
    {
      response_headers: [
        ['Expires', 'Tue, 19 Jan 2038 03:14:08 GMT', false],
        ['Date', 0]
      ],
      setup: true,
      pause_after: true
    },
    {
      expected_type: 'cached'
    }
  ]
})
expiresFuture('next-day')
expiresFuture('round-year')
expiresFuture('uint32-max')
expiresFuture('uint32-max-plus-1')

for (const name of ['int32-max', 'round-year', 'uint32-max']) futureDateExpiresLater(name)
for (const name of ['int32-max', 'round-year', 'uint32-max']) futureDateBecomesStale(name)
for (const name of ['int32-min', 'minus-1', 'epoch']) pastDate(name)

// ---- Group 3: Last-Modified and heuristic freshness

function heuristicFutureLastModified (name) {
  tests.push({
    name: `An optimal HTTP cache does not reuse a response with a \`Last-Modified\` of ${when(name)}, after its \`Date\`, based upon heuristic freshness`,
    id: `y2038-heuristic-future-${name}`,
    kind: 'optimal',
    depends_on: ['heuristic-200-cached'],
    spec_anchors: ['heuristic.freshness'],
    requests: [
      {
        response_headers: [
          ['Last-Modified', imf(boundaries[name].secs), false],
          ['Date', 0]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'not_cached'
      }
    ]
  })
}

function heuristicOldLastModified (name) {
  tests.push({
    name: `Does HTTP cache consider a \`Last-Modified\` of ${when(name)} heuristically fresh?`,
    id: `y2038-heuristic-past-${name}`,
    kind: 'check',
    depends_on: ['heuristic-200-cached'],
    spec_anchors: ['heuristic.freshness'],
    requests: [
      {
        response_headers: [
          ['Last-Modified', imf(boundaries[name].secs), false],
          ['Date', 0]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached'
      }
    ]
  })
}

for (const name of ['next-day', 'round-year', 'uint32-max-plus-1']) heuristicFutureLastModified(name)
for (const name of ['int32-min', 'minus-1', 'epoch']) heuristicOldLastModified(name)

// ---- Group 4: validators in either direction

function revalidateWithLastModified (name) {
  const date = imf(boundaries[name].secs)
  tests.push({
    name: `Does HTTP cache send \`If-Modified-Since\` exactly as the stored \`Last-Modified\` of ${when(name)} when validating?`,
    id: `y2038-validate-lm-${name}`,
    kind: 'check',
    depends_on: ['304-lm-use-stored-Test-Header'],
    spec_anchors: ['freshening.responses'],
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=2'],
          ['Last-Modified', date, false],
          ['Date', 0]
        ],
        setup: true,
        pause_after: true
      },
      {
        response_headers: [
          ['Last-Modified', date, false],
          ['Date', 0]
        ],
        expected_type: 'lm_validated'
      }
    ]
  })
}

function imsInTheFuture (name) {
  tests.push({
    name: `Does HTTP cache respond to \`If-Modified-Since\` of ${when(name)} with a \`304\` when holding a fresh response with an earlier \`Last-Modified\`?`,
    id: `y2038-ims-future-${name}`,
    kind: 'check',
    depends_on: ['conditional-lm-fresh-earlier'],
    browser_skip: true,
    requests: [
      templates.fresh({
        response_headers: [
          ['Last-Modified', lm2020, false]
        ]
      }),
      {
        request_headers: [
          ['If-Modified-Since', imf(boundaries[name].secs)]
        ],
        expected_type: 'cached',
        expected_status: 304,
        setup_tests: ['expected_type']
      }
    ]
  })
}

function imsInThePast (name) {
  tests.push({
    name: `HTTP cache must not respond to \`If-Modified-Since\` of ${when(name)} with a \`304\` when holding a response with a later \`Last-Modified\``,
    id: `y2038-ims-past-${name}`,
    depends_on: ['conditional-lm-fresh-earlier'],
    browser_skip: true,
    requests: [
      templates.fresh({
        response_headers: [
          ['Last-Modified', lm2020, false]
        ]
      }),
      {
        request_headers: [
          ['If-Modified-Since', imf(boundaries[name].secs)]
        ],
        expected_status: 200
      }
    ]
  })
}

// A cache may ignore these conditionals, but if it forwards them it mustn't rewrite the date.
// No earlier test forwards either header, so each has its own ordinary-date control.
function forwardConditional (header, extraHeaders, controlId, name) {
  const control = name === undefined
  const value = control ? lm2020 : imf(boundaries[name].secs)
  const description = control ? `\`${header}\`` : `\`${header}\` of ${when(name)}`
  const test = {
    name: `Does HTTP cache forward ${description} unchanged?`,
    id: control ? controlId : `${controlId.replace(/-control$/, '')}-${name}`,
    kind: 'check',
    browser_skip: true,
    requests: [
      {
        request_headers: [[header, value]].concat(extraHeaders),
        expected_request_headers: [[header, value]]
      }
    ]
  }
  if (!control) test.depends_on = [controlId]
  tests.push(test)
}

for (const name of Object.keys(boundaries)) revalidateWithLastModified(name)
for (const name of ['int32-max-plus-1', 'round-year', 'uint32-max-plus-1']) imsInTheFuture(name)
for (const name of ['int32-min', 'minus-1', 'epoch']) imsInThePast(name)

forwardConditional('If-Unmodified-Since', [], 'y2038-if-unmodified-since-control')
forwardConditional('If-Range', [['Range', 'bytes=0-5']], 'y2038-if-range-control')
for (const name of ['int32-min', 'int32-max-plus-1', 'uint32-max-plus-1']) {
  forwardConditional('If-Unmodified-Since', [], 'y2038-if-unmodified-since-control', name)
  forwardConditional('If-Range', [['Range', 'bytes=0-5']], 'y2038-if-range-control', name)
}

// ---- Group 5: dates the cache forwards

function preserveDates (name) {
  const date = imf(boundaries[name].secs)
  tests.push({
    name: `Does HTTP cache preserve \`Expires\` and \`Last-Modified\` of ${when(name)} when using a stored response?`,
    id: `y2038-preserve-${name}`,
    kind: 'check',
    depends_on: ['freshness-max-age'],
    requests: [
      {
        response_headers: [
          ['Cache-Control', 'max-age=3600'],
          ['Expires', date, false],
          ['Last-Modified', date, false],
          ['Date', 0]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached',
        expected_response_headers: [
          ['Expires', date],
          ['Last-Modified', date]
        ],
        setup_tests: ['expected_type']
      }
    ]
  })
}

for (const name of Object.keys(boundaries)) preserveDates(name)

// ---- Group 6: date formats

function expiresAsctime (name) {
  tests.push({
    name: `An optimal HTTP cache reuses a response with a future \`Expires\` of ${asctime(boundaries[name].secs)} (${boundaries[name].label}) in ANSI C's asctime() format`,
    id: `y2038-expires-asctime-${name}`,
    kind: 'optimal',
    depends_on: ['freshness-expires-ansi-c'],
    spec_anchors: ['field.expires'],
    requests: [
      {
        response_headers: [
          ['Expires', asctime(boundaries[name].secs), false],
          ['Date', 0]
        ],
        setup: true,
        pause_after: true
      },
      {
        expected_type: 'cached'
      }
    ]
  })
}

// RFC 9110 section 5.6.7: an RFC 850 date more than 50 years ahead is read as the most recent
// past year with the same last two digits. These are relative to now, so they stay on the
// right side of the window as time passes.
function expiresRfc850 (years, name, expectedType, kind) {
  const test = {
    name,
    id: `y2038-expires-rfc850-${years}-years`,
    depends_on: ['freshness-expires-rfc850'],
    spec_anchors: ['field.expires'],
    requests: [
      {
        response_headers: [
          ['Expires', yearsFromNow(years), false],
          ['Date', 0]
        ],
        rfc850date: ['expires'],
        setup: true,
        pause_after: true
      },
      {
        expected_type: expectedType
      }
    ]
  }
  if (kind) test.kind = kind
  tests.push(test)
}

for (const name of [
  'nginx-max', 'int32-max', 'int32-max-plus-1', 'next-day', 'round-year', 'uint32-max',
  'uint32-max-plus-1'
]) expiresAsctime(name)

expiresRfc850(44, 'An optimal HTTP cache reuses a response with an RFC 850 `Expires` 44 years in the future (a fixed pivot year reads its two-digit year as the past)', 'cached', 'optimal')
expiresRfc850(48, 'An optimal HTTP cache reuses a response with an RFC 850 `Expires` 48 years in the future (just inside the 50-year window)', 'cached', 'optimal')
expiresRfc850(60, 'HTTP cache must not reuse a response with an RFC 850 `Expires` 60 years in the future (more than 50 years ahead is read as the past)', 'not_cached')

export default {
  name: 'Large Time Values (Y2038)',
  id: 'y2038',
  description: 'These tests check how caches cope with the Year 2038 problem: a time held in a signed 32-bit integer overflows at 03:14:07 UTC on 19 January 2038.',
  spec_anchors: ['expiration.model', 'delta-seconds'],
  tests
}

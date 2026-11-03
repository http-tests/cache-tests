import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'

import { locateFailure } from './locate-failure.mjs'

const cases = [
  ['Response 2 does not come from cache', { block: 'res', n: 2, header: 'server-request-count' }],
  ['Response 1 comes from cache', { block: 'res', n: 1, header: 'server-request-count' }],
  ['Response 2 comes from cache (1 on server)', { block: 'res', n: 2, header: 'server-request-count' }],
  ['Response 1 status is 200, not 504', { block: 'res', n: 1, status: true }],
  ['Request 2 should have been conditional, but it was not.', { block: 'res', n: 2, status: true }],
  ['Response 1 Age header not present.', { block: 'res', n: 1, header: 'age' }],
  ['Response 2 header Expires is "null", not "Tue, 03 Nov 2026 01:00:38 GMT"', { block: 'res', n: 2, header: 'expires' }],
  ['Response 2 header Foo is 1, should match Bar (2)', { block: 'res', n: 2, header: 'foo' }],
  ['Response 2 includes unexpected header Cache-Control: "no-store"', { block: 'res', n: 2, header: 'cache-control' }],
  ['Response body is "x", not "y"', { block: 'res', n: null, body: true }],
  ['Interim response 1 not received', { block: 'res', n: null, interim: true }],
  ['Received 0 interim response(s), expected 1', { block: 'res', n: null, interim: true }],
  ['Request 2 If-None-Match header not present.', { block: 'origin', n: 2, header: 'if-none-match' }],
  ['Request 2 Range header present.', { block: 'origin', n: 2, header: 'range' }],
  ['Request 2 header If-None-Match is "undefined", not "abc"', { block: 'origin', n: 2, header: 'if-none-match' }],
  ['Request 2 had method GET, not HEAD', { block: 'origin', n: 2, method: true }],
  ["request 2 doesn't have if-none-match header", { block: 'origin', n: 2, header: 'if-none-match' }],
  ["request 2 wasn't sent to server", { block: 'origin', n: 2, notSent: true }]
]

for (const [message, expected] of cases) {
  test(`locates: ${message}`, () => {
    assert.deepEqual(locateFailure(message), expected)
  })
}

test('gives up on messages it doesn\'t know', () => {
  assert.equal(locateFailure('fetch failed'), null)
  assert.equal(locateFailure('retry'), null)
})

// Failure messages are free text in client/test.mjs. Take the ones that look like they describe
// a request or response (as the assertion messages do) and check that each can be located, so
// that rewording one fails here rather than silently losing its highlight.
test('every assertion message in client/test.mjs can be located', () => {
  const source = fs.readFileSync(new URL('../client/test.mjs', import.meta.url), 'utf8')
  const messages = [...source.matchAll(/`((?:[^`\\]|\\.)*)`/g)]
    .map(match => match[1].replace(/\$\{([^}]*)\}/g, (_, expr) => /Num|idx|length/.test(expr) ? '2' : 'Foo'))
    .filter(message => /^(?:Response|Request|request|Interim|Received) /.test(message))
  assert.ok(messages.length >= 15, `only found ${messages.length} messages; has client/test.mjs changed shape?`)
  const unlocated = messages.filter(message => locateFailure(message) === null)
  assert.deepEqual(unlocated, [])
})

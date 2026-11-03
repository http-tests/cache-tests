// Failure messages are free text (see client/test.mjs); work out which part of the trace one is
// about, so that it can be highlighted. `n` is the 1-based request number, or null when the
// message doesn't say.
export function locateFailure (message) {
  const patterns = [
    [/^Response (\d+) (\S+) header not present/, m => ({ block: 'res', n: +m[1], header: m[2] })],
    [/^Response (\d+) header (\S+) /, m => ({ block: 'res', n: +m[1], header: m[2] })],
    [/^Response (\d+) includes unexpected header (\S+):/, m => ({ block: 'res', n: +m[1], header: m[2] })],
    [/^Response (\d+) status is /, m => ({ block: 'res', n: +m[1], status: true })],
    [/^Request (\d+) should have been conditional/, m => ({ block: 'res', n: +m[1], status: true })],
    [/^Response (\d+) (?:does not come from|comes from) cache/, m => ({ block: 'res', n: +m[1], header: 'Server-Request-Count' })],
    [/^Response body is /, m => ({ block: 'res', n: null, body: true })],
    [/^(?:Interim response|Received \d+ interim)/, m => ({ block: 'res', n: null, interim: true })],
    [/^Request (\d+) (\S+) header (not present|present)/, m => ({ block: 'origin', n: +m[1], header: m[2] })],
    [/^Request (\d+) header (\S+) /, m => ({ block: 'origin', n: +m[1], header: m[2] })],
    [/^Request (\d+) had method /, m => ({ block: 'origin', n: +m[1], method: true })],
    [/^request (\d+) doesn't have (\S+) header/, m => ({ block: 'origin', n: +m[1], header: m[2] })],
    [/^request (\d+) wasn't sent to server/, m => ({ block: 'origin', n: +m[1], notSent: true })]
  ]
  for (const [pattern, locate] of patterns) {
    const match = pattern.exec(message)
    if (match) {
      const where = locate(match)
      if (where.header) where.header = where.header.toLowerCase()
      return where
    }
  }
  return null
}

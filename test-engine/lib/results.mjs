export const resultTypes = {
  untested: ['-', '', '-', 'not tested'],
  pass: ['\uf058', '#1aa123', '✅', 'passed'],
  fail: ['\uf057', '#c33131', '⛔️', 'conformance test failed'],
  optional_fail: ['\uf05a', '#bbbd15', '⚠️', 'optional test failed'],
  yes: ['\uf055', '#999696', 'Y', 'behaviour check: yes'],
  no: ['\uf056', '#999696', 'N', 'behaviour check: no'],
  setup_fail: ['\uf059', '#4c61ae', '🔹', 'test failed during setup'],
  harness_fail: ['\uf06a', '#4c61ae', '⁉️', 'test harness failure'],
  dependency_fail: ['\uf192', '#b4b2b2', '⚪️', 'test dependency failed'],
  retry: ['\uf01e', '#4c61ae', '↻', 'cache retried a request']
}
const passTypes = [resultTypes.pass, resultTypes.yes]

// Traces live in the results file under this key, beside the test results. It can't collide
// with a test ID.
const tracesKey = '_traces'

// Test results are pretty-printed; traces get one compact line per test to keep the file
// diffable without ballooning it.
export function serializeResults (results, traces) {
  const body = JSON.stringify(results, null, 2)
  if (!traces || Object.keys(traces).length === 0) return body
  const lines = Object.entries(traces).map(([id, trace]) => `    ${JSON.stringify(id)}: ${JSON.stringify(trace)}`)
  const section = `  "${tracesKey}": {\n${lines.join(',\n')}\n  }`
  // a function replacement, as the section can contain '$' sequences that a string would interpret
  return body === '{}' ? `{\n${section}\n}` : body.replace(/\n}$/, () => `,\n${section}\n}`)
}

export function parseResults (json) {
  const { [tracesKey]: traces, ...results } = json
  return { results, traces }
}

export function determineTestResult (testSuites, testId, testResults, honorDependencies = true) {
  const test = testLookup(testSuites, testId)
  const result = testResults[testId]
  if (result === undefined) {
    return resultTypes.untested
  }
  if (honorDependencies && test.depends_on !== undefined) {
    for (const dependencyId of test.depends_on) {
      if (!passTypes.includes(determineTestResult(testSuites, dependencyId, testResults))) {
        return resultTypes.dependency_fail
      }
    }
  }
  if (result[0] === 'Setup') {
    if (result[1] === 'retry') {
      return resultTypes.retry
    } else {
      return resultTypes.setup_fail
    }
  }
  if (result === false && result[0] !== 'Assertion') {
    return resultTypes.harness_fail
  }
  if (result[0] === 'AbortError') {
    return resultTypes.harness_fail
  }
  if (test.kind === 'required' || test.kind === undefined) {
    if (result === true) {
      return resultTypes.pass
    } else {
      return resultTypes.fail
    }
  } else if (test.kind === 'optimal') {
    if (result === true) {
      return resultTypes.pass
    } else {
      return resultTypes.optional_fail
    }
  } else if (test.kind === 'check') {
    if (result === true) {
      return resultTypes.yes
    } else {
      return resultTypes.no
    }
  } else {
    throw new Error(`Unrecognised test kind ${test.kind}`)
  }
}

export function testLookup (testSuites, testId) {
  for (const testSuite of testSuites) {
    for (const test of testSuite.tests) {
      if (test.id === testId) {
        return test
      }
    }
  }
  throw new Error(`Cannot find test ${testId}`)
}

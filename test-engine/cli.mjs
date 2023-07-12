import { runTests, getResults } from './client/runner.mjs'
import * as display from './lib/display.mjs'
import { GREEN, NC } from './lib/defines.mjs'
import fetch from 'node-fetch-with-proxy'
import tests from '../tests/index.mjs'

const baseUrl = process.env.npm_config_base || process.env.npm_package_config_base
const testId = process.env.npm_config_id || process.env.npm_package_config_id

let testsToRun
if (testId !== '') {
  console.log(`Running ${testId}`)
  tests.forEach(suite => {
    suite.tests.forEach(test => {
      if (test.id === testId) {
        test.dump = true
        testsToRun = [{
          name: suite.name,
          id: suite.id,
          description: suite.description,
          tests: [test]
        }]
      }
    })
  })
} else {
  testsToRun = tests
}

runTests(testsToRun, fetch, false, baseUrl)
  .then(() => {
    if (testId !== '') {
      console.log(`${GREEN}==== Results${NC}`)
      const result = getResults()
      const resultSymbol = display.determineTestResult(tests, testId, result, false)
      const resultDetails = result[testId][1] || ''
      console.log(`${resultSymbol[2]} - ${resultDetails}`)
    } else {
      console.log(JSON.stringify(getResults(), null, 2))
    }
  })
  .catch(err => {
    console.error(err)
  })

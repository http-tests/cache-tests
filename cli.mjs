import * as client from './client.mjs'
import fetch from 'node-fetch'
import tests from './tests/index.mjs'
import surrogate from './tests/surrogate-control.mjs'

tests.push(surrogate)
const baseUrl = process.env.npm_config_base || process.env.npm_package_config_base
const testId = process.env.npm_config_id || process.env.npm_package_config_id

var testsToRun
if (testId !== '') {
  console.log(`Running ${testId}`)
  tests.forEach(suite => {
    suite.tests.forEach(test => {
      if (test.id === testId) {
        test.dump = true
        testsToRun = [{
          name: suite.name,
          id: suite.id,
          tests: [test]
        }]
      }
    })
  })
} else {
  testsToRun = tests
}

client.runTests(testsToRun, fetch, false, baseUrl)
  .then(() => { console.log(JSON.stringify(client.getResults(), null, 2)) })

import * as client from './client.mjs'
import { GREEN, NC } from './utils.mjs'
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
          description: suite.description,
          tests: [test]
        }]
      }
    })
  })
} else {
  testsToRun = tests
}

client.runTests(testsToRun, fetch, false, baseUrl)
  .then(() => {
    if (testId !== '') {
      console.log(`${GREEN}==== Results${NC}`)
      console.log(client.getResults())
    }
    console.log(JSON.stringify(client.getResults(), null, 2))
  })
  .catch(err => {
    console.error(err)
  })

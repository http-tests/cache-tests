
import * as config from './config.mjs'
import { makeCacheTest, testResults } from './test.mjs'

var testArray = []

export function runTests (tests, myFetch, browserCache, base, chunkSize = 100) {
  config.setFetch(myFetch)
  config.setBaseUrl(base)
  config.setUseBrowserCache(browserCache)
  tests.forEach(testSet => {
    testSet.tests.forEach(test => {
      if (test.id === undefined) throw new Error('Missing test id')
      if (test.browser_only === true && !config.useBrowserCache === true) return
      if (test.browser_skip === true && config.useBrowserCache === true) return
      testArray.push(test)
    })
  })
  return runSome(testArray, chunkSize)
}

export function getResults () {
  const ordered = {}
  Object.keys(testResults).sort().forEach(key => {
    ordered[key] = testResults[key]
  })
  return ordered
}

function runSome (tests, chunkSize) {
  return new Promise((resolve, reject) => {
    var index = 0
    function next () {
      if (index < tests.length) {
        var these = tests.slice(index, index + chunkSize).map(makeCacheTest)
        index += chunkSize
        Promise.all(these).then(next)
      } else {
        resolve()
      }
    }
    next()
  })
}


export function renderTestResults (tests, testResults, target, useBrowserCache) {
  tests.forEach(testSuite => {
    var headerElement = document.createElement('h3')
    target.appendChild(headerElement)
    var headerText = document.createTextNode(testSuite.name)
    headerElement.appendChild(headerText)
    var listElement = document.createElement('ul')
    var resultList = target.appendChild(listElement)
    testSuite.tests.forEach(function (test) {
      if (test.browser_only === true && !useBrowserCache === true) return
      if (test.browser_skip === true && useBrowserCache === true) return
      test.suiteName = testSuite.name
      var testElement = resultList.appendChild(document.createElement('li'))
      var testName = document.createTextNode(test.name)
      testElement.appendChild(testName)
      testElement.appendChild(showTestResult(test, testResults))
    })
  })
}

function showTestResult(test, testResults) {
  var result = testResults[test.suiteName][test.name]
  if (result === true) {
    return document.createTextNode(" ✅")
  } else {
    var span = document.createElement('span')
    span.title = result
    span.appendChild(document.createTextNode(" ⛔️"))
    return span
  }
}

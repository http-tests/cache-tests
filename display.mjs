
export function downloadTestResults (target, fileName, data) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  target.setAttribute("href", dataStr)
  target.setAttribute("download", fileName)
  target.style.display = "inherit"
}

export function renderTestResults (tests, testResults, target, useBrowserCache) {
  var total_tests = 0
  var total_passed = 0
  tests.forEach(testSuite => {
    var headerElement = document.createElement('h3')
    target.appendChild(headerElement)
    var headerText = document.createTextNode(testSuite.name)
    headerElement.appendChild(headerText)
    var listElement = document.createElement('ul')
    var resultList = target.appendChild(listElement)
    var tests = 0
    var passed = 0
    testSuite.tests.forEach(function (test) {
      if (test.browser_only === true && !useBrowserCache === true) return
      if (test.browser_skip === true && useBrowserCache === true) return
      test.suiteName = testSuite.name
      var testElement = resultList.appendChild(document.createElement('li'))
      var testName = document.createTextNode(test.name)
      testElement.appendChild(showTestResult(test, testResults))
      testElement.appendChild(testName)
      tests++
      if (testResults[test.id] === true) {
        passed++
      }
    })
    var summaryElement = document.createElement('p')
    var suiteSummary = target.appendChild(summaryElement)
    suiteSummary.appendChild(document.createTextNode(tests + " tests, " + passed + " passed."))
    total_tests += tests
    total_passed += passed
  })
    var totalElement = document.createElement('p')
    var totalSummary = target.appendChild(totalElement)
    var totalText = document.createTextNode("Total " + total_tests + " tests, " + total_passed + " passed.")
    totalSummary.appendChild(totalText)
}

function showTestResult (test, testResults) {
  var result = testResults[test.id]
  if (result === true) {
    return document.createTextNode(' ✅ ')
  } else {
    var span = document.createElement('span')
    span.title = result
    if (test.required === false) {
      span.appendChild(document.createTextNode(' ⚠️ '))
    } else {
      span.appendChild(document.createTextNode(' ⛔️ '))
    }
    return span
  }
}

/* global Blob */

export function downloadTestResults (target, fileName, data) {
  var dataBlob = new Blob([JSON.stringify(data, null, 2)], {type: 'text/json'})
  target.setAttribute('href', window.URL.createObjectURL(dataBlob))
  target.setAttribute('download', fileName)
  target.style.display = 'inherit'
}

export function renderTestResults (tests, testResults, testUUIDs, target, useBrowserCache) {
  var totalTests = 0
  var totalPassed = 0
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
      testElement.addEventListener('click', function (event) {
        copyTextToClipboard(testUUIDs[test.id])
      })
      tests++
      if (testResults[test.id] === true) {
        passed++
      }
    })
    var summaryElement = document.createElement('p')
    var suiteSummary = target.appendChild(summaryElement)
    suiteSummary.appendChild(document.createTextNode(tests + ' tests, ' + passed + ' passed.'))
    totalTests += tests
    totalPassed += passed
  })
  var totalElement = document.createElement('p')
  var totalSummary = target.appendChild(totalElement)
  var totalText = document.createTextNode('Total ' + totalTests + ' tests, ' + totalPassed + ' passed.')
  totalSummary.appendChild(totalText)
}

function showTestResult (test, testResults) {
  var result = testResults[test.id]
  if (result === true) {
    return document.createTextNode(' ✅ ')
  } else {
    var span = document.createElement('span')
    span.title = result[1]
    if (result[0] !== 'Assertion') {
      span.appendChild(document.createTextNode(' ⁉️ '))
    }
    else if (test.required === false) {
      span.appendChild(document.createTextNode(' ⚠️ '))
    } else {
      span.appendChild(document.createTextNode(' ⛔️ '))
    }
    return span
  }
}

function copyTextToClipboard (text) {
  var textArea = document.createElement('textarea')
  textArea.style.position = 'fixed'
  textArea.style.top = 0
  textArea.style.left = 0
  textArea.style.width = '2em'
  textArea.style.height = '2em'
  textArea.style.padding = 0
  textArea.style.border = 'none'
  textArea.style.outline = 'none'
  textArea.style.boxShadow = 'none'
  textArea.style.background = 'transparent'
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    console.log('Copying text command was ' + msg)
  } catch (err) {
    console.log('Unable to copy')
  }
  document.body.removeChild(textArea)
}

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
      testElement.appendChild(showTestResult(testSuite.tests, testResults, test.id))
      testElement.appendChild(showTestName(test, testUUIDs[test.id]))
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

export function showTestName (test, uuid) {
  var span = document.createElement('span')
  span.title = JSON.stringify(test.requests, null, 2)
  span.appendChild(document.createTextNode(test.name + ' '))

  var idLinkElement = document.createElement('a')
  idLinkElement.appendChild(document.createTextNode('⌾'))
  idLinkElement.addEventListener('click', function (event) {
    copyTextToClipboard(test.id)
  })
  idLinkElement.id = test.id
  idLinkElement.title = 'Test ID (click to copy)'
  idLinkElement.setAttribute('class', 'clickhint')
  span.appendChild(idLinkElement)

  if (uuid) {
    var uuidLinkElement = document.createElement('a')
    uuidLinkElement.appendChild(document.createTextNode('⚙︎'))
    uuidLinkElement.setAttribute('class', 'clickhint')
    uuidLinkElement.addEventListener('click', function (event) {
      copyTextToClipboard(uuid)
    })
    uuidLinkElement.title = 'Test UUID (click to copy)'
    span.appendChild(uuidLinkElement)
  }
  return span
}

export function showTestResult (tests, results, testId) {
  var result = results[testId]
  var resultValue = determineTestResult(tests, results, testId)
  var resultNode = document.createTextNode(` ${resultValue} `)
  if (result && typeof (result[1]) === 'string') {
    var span = document.createElement('span')
    span.title = result[1]
    span.appendChild(resultNode)
    return span
  }
  return resultNode
}

const resultTypes = {
  untested: '-',
  pass: '✅',
  fail: '⛔️',
  optional_fail: '⚠️',
  yes: 'Y',
  no: 'N',
  setup_fail: '🔹',
  harness_fail: '⁉️',
  dependency_fail: '⚪️'
}

function determineTestResult (tests, results, testId) {
  var test = testLookup(tests, testId)
  var result = results[testId]
  if (result === undefined) {
    return resultTypes.untested
  }
  if (test.depends_on !== undefined) {
    for (var dependencyId of test.depends_on) {
      if (determineTestResult(tests, results, dependencyId) !== resultTypes.pass) {
        return resultTypes.dependency_fail
      }
    }
  }
  if (result[0] === 'Setup') {
    return resultTypes.setup_fail
  }
  if (result === false && result[0] !== 'Assertion') {
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

export function testLookup (tests, testId) {
  for (var test of tests) {
    if (test.id === testId) {
      return test
    }
  }
  throw new Error(`Cannot find test ${testId}`)
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

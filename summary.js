/* global fetch */

export function loadResults (index) {
  return Promise.all(index.map(item =>
    fetch(`results/${item.file}`)
      .then(response => {
        return response.json()
      })
      .then(results => {
        item.results = results
        return item
      }
      ))
  )
}

export function showResults (target, tests, results) {
  tests.forEach(testSuite => {
    target.appendChild(showHeader(testSuite.name, results))
    testSuite.tests.forEach(test => {
      target.appendChild(showTest(testSuite.name, test, results))
    })
  })
}

function showHeader (headerName, results) {
  var headerRow = tableRow()
  var firstHeader = tableCell('th', headerName, 'name category')
  headerRow.appendChild(firstHeader)
  results.forEach(implementation => {
    headerRow.appendChild(tableCell('th', implementation.name, 'category', implementation.version, implementation.link))
  })
  return headerRow
}

function showTest (suiteName, test, results) {
  var testRow = tableRow()
  testRow.appendChild(tableCell('th', test.name, 'name'))
  results.forEach(implementation => {
    var result = implementation.results[test.id]
    var signal
    var hint
    if (result === undefined) {
      signal = '-'
    } else if (result === true) {
      signal = '✅'
      hint = false
    } else if (result[0] !== 'Assertion') {
      signal = '⁉️'
      hint = result[0]
    } else if (test.required === false) {
      signal = '⚠️'
      hint = result[0]
    } else {
      signal = '⛔️'
      hint = result[0]
    }
    testRow.appendChild(tableCell('th', signal, false, hint))
  })
  return testRow
}

function tableRow () {
  var rowElement = document.createElement('tr')
  return rowElement
}

function tableCell (cellType, content, CssClass, hint, link) {
  var cellElement = document.createElement(cellType)
  if (CssClass) {
    cellElement.setAttribute('class', CssClass)
  }
  var cellText = document.createTextNode(content)
  if (link) {
    var linkElement = document.createElement('a')
    linkElement.setAttribute('href', link)
    linkElement.appendChild(cellText)
    cellElement.appendChild(linkElement)
  } else {
    cellElement.appendChild(cellText)
  }
  if (hint) {
    cellElement.title = hint
  }
  return cellElement
}

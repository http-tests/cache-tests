/* global fetch */

import * as display from './display.mjs'

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
    target.appendChild(showHeader(testSuite, results))
    testSuite.tests.forEach(test => {
      target.appendChild(showTest(testSuite.tests, results, test.id))
    })
  })
}

function showHeader (testSuite, results) {
  var headerRow = tableRow()
  var firstHeader = tableCell('th', testSuite.name, 'name category')
  firstHeader.id = testSuite.id
  headerRow.appendChild(firstHeader)
  results.forEach(implementation => {
    headerRow.appendChild(tableCell('th', implementation.name, 'category', implementation.version, implementation.link))
  })
  return headerRow
}

function showTest (tests, results, testId) {
  var test = display.testLookup(tests, testId)
  var testRow = tableRow()
  testRow.appendChild(tableCell('th', display.showTestName(test), 'name'))
  results.forEach(implementation => {
    testRow.appendChild(
      tableCell('th', display.showTestResult(tests, implementation.results, test.id)))
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
  var contentNode
  if (typeof (content) === 'string') {
    contentNode = document.createTextNode(content)
  } else {
    contentNode = content
  }
  if (link) {
    var linkElement = document.createElement('a')
    linkElement.setAttribute('href', link)
    linkElement.appendChild(contentNode)
    cellElement.appendChild(linkElement)
  } else {
    cellElement.appendChild(contentNode)
  }
  if (hint) {
    cellElement.title = hint
  }
  return cellElement
}

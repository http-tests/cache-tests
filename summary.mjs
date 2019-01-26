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

export function showResults (target, testSuites, results) {
  testSuites.forEach(testSuite => {
    showHeader(testSuite, results).forEach(row => {
      target.appendChild(row)
    })
    testSuite.tests.forEach(test => {
      target.appendChild(showTest(testSuites, test.id, results))
    })
  })
}

function showHeader (testSuite, results) {
  var rows = []
  var blankRow = tableRow()
  blankRow.appendChild(tableCell('td', '\xa0', undefined, undefined, undefined, results.length + 1))
  rows.push(blankRow)
  var headerRow = tableRow()
  var headerLink = document.createElement('a')
  headerLink.href = '#' + testSuite.id
  headerLink.appendChild(document.createTextNode(testSuite.name))
  var firstHeader = tableCell('th', headerLink, 'name category')
  firstHeader.id = testSuite.id
  headerRow.appendChild(firstHeader)
  results.forEach(implementation => {
    headerRow.appendChild(tableCell('th', implementation.name, 'category', implementation.version, implementation.link))
  })
  rows.push(headerRow)
  return rows
}

function showTest (testSuites, testId, results) {
  var test = display.testLookup(testSuites, testId)
  var testRow = tableRow()
  testRow.appendChild(tableCell('th', display.showTestName(test), 'name'))
  results.forEach(implementation => {
    testRow.appendChild(
      tableCell('th', display.showTestResult(testSuites, test.id, implementation.results)))
  })
  return testRow
}

function tableRow (CssClass) {
  var rowElement = document.createElement('tr')
  if (CssClass) {
    rowElement.setAttribute('class', CssClass)
  }
  return rowElement
}

function tableCell (cellType, content, CssClass, hint, link, colspan) {
  var cellElement = document.createElement(cellType)
  if (CssClass) {
    cellElement.setAttribute('class', CssClass)
  }
  if (colspan) {
    cellElement.colSpan = colspan
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

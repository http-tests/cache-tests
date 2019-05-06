/* global fetch marked */

import './marked.min.js'
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

export function showResults (target, testSuites, results, selected) {
  testSuites.forEach(testSuite => {
    var selectedTests = []
    testSuite.tests.forEach(test => {
      if (selected.length === 0 || selected.includes(test.id)) {
        selectedTests.push(test)
      }
    })
    if (selectedTests.length) {
      showHeader(testSuite, results).forEach(row => {
        target.appendChild(row)
      })
      selectedTests.forEach(test => {
        var result = showTest(testSuites, test.id, results)
        if (target.childElementCount % 2) {
          result.setAttribute('class', 'shade')
        }
        target.appendChild(result)
      })
    }
  })
}

export function showToC (target, testSuites) {
  testSuites.forEach(testSuite => {
    var suiteLink = document.createElement('a')
    suiteLink.href = '#' + testSuite.id
    suiteLink.appendChild(document.createTextNode(testSuite.name))
    var suiteLi = document.createElement('li')
    suiteLi.appendChild(suiteLink)
    target.appendChild(suiteLi)
  })
}

function showHeader (testSuite, results) {
  var rows = []
  var numCols = results.length + 1
  var blankRow = tableRow()
  blankRow.appendChild(tableCell('td', '\xa0', undefined, undefined, undefined, numCols))
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
  if (testSuite.description !== undefined) {
    var descriptionRow = tableRow()
    var drCells = tableCell('td', '', 'description', undefined, undefined, numCols)
    drCells.innerHTML = marked.parse(testSuite.description).slice(3, -5)
    descriptionRow.appendChild(drCells)
    rows.push(descriptionRow)
  }
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

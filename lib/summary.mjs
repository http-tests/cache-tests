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
  var numCols = results.length + 2
  var blankRow = tableRow()
  blankRow.appendChild(emptyCell(numCols))
  rows.push(blankRow)
  var headerRow = tableRow()
  headerRow.appendChild(tableCell('th', '\xa0', 'name category'))
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
    var drCells = emptyCell(numCols)
    drCells.innerHTML = marked.parse(testSuite.description).slice(3, -5)
    descriptionRow.appendChild(drCells)
    rows.push(descriptionRow)
  }
  return rows
}

function showTest (testSuites, testId, results) {
  var test = display.testLookup(testSuites, testId)
  var testRow = tableRow()
  testRow.appendChild(tableCell('td', testSelector(test.id)))
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

function testSelector (testId) {
  var checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.name = 'id'
  checkbox.value = testId
  checkbox.style.display = 'none'
  checkbox.setAttribute('class', 'select')
  return checkbox
}

export function selectClickListen () {
  var select = document.getElementById('select')
  select.addEventListener('click', selectClick, {
    once: true
  })
}

function selectClick () {
  var selectBoxes = document.getElementsByClassName('select')
  for (const selectBox of selectBoxes) {
    selectBox.style.display = 'inherit'
  }
  var submit = document.createElement('input')
  submit.type = 'submit'
  submit.value = 'Show only selected tests'
  var select = document.getElementById('select')
  select.replaceWith(submit)
}

export function selectClearShow () {
  var clear = document.createElement('a')
  clear.href = '?'
  clear.appendChild(document.createTextNode('Clear selections'))
  var select = document.getElementById('select')
  select.replaceWith(clear)
}

function emptyCell (numCols = 1) {
  return tableCell('td', '\xa0', undefined, undefined, undefined, numCols)
}

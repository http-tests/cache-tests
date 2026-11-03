/* global Blob marked */

import '../../asset/marked.min.js'
import { Liquid } from '../../asset/liquid.browser.esm.mjs'
import { modalOpen } from './modal.mjs'

import { locateFailure } from './locate-failure.mjs'
import { determineTestResult, resultTypes, serializeResults, testLookup } from './results.mjs'

const templateEngine = new Liquid({ root: 'test-engine/lib/tpl', extname: '.liquid', cache: true })
templateEngine.registerFilter('typeof', v => typeof (v))
templateEngine.registerFilter('toLocaleString', v => v.toLocaleString())
templateEngine.registerFilter('skipHeaders', v => {
  if (v) {
    return v.filter(hdr => hdr.length < 3 || hdr[2] !== false)
  } else {
    return []
  }
})

export function downloadTestResults (target, fileName, results, traces, auto) {
  const dataBlob = new Blob([serializeResults(results, traces)], { type: 'text/json' })
  target.setAttribute('href', window.URL.createObjectURL(dataBlob))
  target.setAttribute('download', fileName)
  target.style.display = 'inherit'
  if (auto) {
    target.click()
  }
}

export function renderTestResults (testSuites, testResults, testUUIDs, target, useBrowserCache, testTraces) {
  let totalTests = 0
  let totalPassed = 0
  testSuites.forEach(testSuite => {
    const headerElement = document.createElement('h3')
    target.appendChild(headerElement)
    const headerText = document.createTextNode(testSuite.name)
    headerElement.appendChild(headerText)
    const listElement = document.createElement('ul')
    const resultList = target.appendChild(listElement)
    let tests = 0
    let passed = 0
    testSuite.tests.forEach(test => {
      if (test.browser_only === true && !useBrowserCache === true) return
      if (test.cdn_only === true && useBrowserCache === true) return
      if (test.browser_skip === true && useBrowserCache === true) return
      test.suiteName = testSuite.name
      const testElement = resultList.appendChild(document.createElement('li'))
      testElement.appendChild(showTestResult(testSuites, test.id, testResults, testTraces))
      testElement.appendChild(showTestName(test, testUUIDs[test.id]))
      tests++
      if (testResults[test.id] === true) {
        passed++
      }
    })
    const summaryElement = document.createElement('p')
    const suiteSummary = target.appendChild(summaryElement)
    suiteSummary.appendChild(document.createTextNode(tests + ' tests, ' + passed + ' passed.'))
    totalTests += tests
    totalPassed += passed
  })
  const totalElement = document.createElement('p')
  const totalSummary = target.appendChild(totalElement)
  const totalText = document.createTextNode('Total ' + totalTests + ' tests, ' + totalPassed + ' passed.')
  totalSummary.appendChild(totalText)
}

export function showTestName (test, uuid) {
  const wrapper = document.createElement('span')
  const span = document.createElement('span')
  span.setAttribute('class', 'clickhint')
  span.innerHTML = marked.parse(test.name).slice(3, -5)
  span.addEventListener('click', event => {
    copyTextToClipboard(test.id)
    showTestDetails(test)
  })
  wrapper.appendChild(span)

  if (uuid) {
    const uuidLinkElement = document.createElement('a')
    uuidLinkElement.appendChild(document.createTextNode('⚙︎'))
    uuidLinkElement.setAttribute('class', 'uuid')
    uuidLinkElement.addEventListener('click', event => {
      copyTextToClipboard(uuid)
    })
    uuidLinkElement.title = 'Test UUID (click to copy)'
    wrapper.appendChild(uuidLinkElement)
  }
  return wrapper
}

export function showKey (element) {
  const spans = element.getElementsByClassName('fa')
  for (const span of spans) {
    const kind = span.getAttribute('data-kind')
    const styling = resultTypes[kind]
    const contentNode = document.createTextNode(styling[0])
    span.style.color = styling[1]
    span.appendChild(contentNode)
  }
}

export function showTestResult (testSuites, testId, testResults, traces, subject) {
  const result = testResults[testId]
  const resultValue = determineTestResult(testSuites, testId, testResults)
  const resultNode = document.createTextNode(` ${resultValue[0]} `)
  const span = document.createElement('span')
  span.className = 'fa'
  span.style.color = resultValue[1]
  span.appendChild(resultNode)
  if (result && typeof (result[1]) === 'string') {
    span.title = result[1]
  }
  const trace = traces && traces[testId]
  if (trace) {
    span.classList.add('clickhint')
    span.addEventListener('click', event => {
      showTestTrace(testLookup(testSuites, testId), subject, result, resultValue, trace)
    })
  }
  return span
}

function escapeHtml (text) {
  return String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function traceLine (text, className = '') {
  return `<span class="line ${className}">${escapeHtml(text)}</span>`
}

function traceHeaderLines (headers, failure, matchesBlock) {
  const lines = Object.entries(headers).map(([name, value]) =>
    traceLine(`${name}: ${value}`, matchesBlock && failure.header === name ? 'hl' : ''))
  if (matchesBlock && failure.header && !(failure.header in headers)) {
    lines.push(traceLine(`${failure.header}: (not present)`, 'hl muted'))
  }
  return lines
}

function originSentLines (item) {
  const lines = []
  for (const [interimStatus, interimHeaders] of item.interim || []) {
    lines.push(traceLine(`HTTP ${interimStatus}`), ...traceHeaderLines(interimHeaders, null, false))
  }
  lines.push(traceLine(`HTTP ${item.res[0]}`), ...traceHeaderLines(item.res[1], null, false))
  if (item.body !== undefined) lines.push(traceLine(`body: ${JSON.stringify(item.body)}`))
  if (item.disconnect) lines.push(traceLine('(closed the connection)', 'muted'))
  return lines
}

function traceNote (text) {
  return `<div class="trace-note">${escapeHtml(text)}</div>`
}

function traceBlock (label, lines) {
  return `<div class="trace-label">${label}</div><pre>${lines.join('')}</pre>`
}

export function showTestTrace (test, subject, result, resultValue, trace) {
  const [glyph, colour, , label] = resultValue
  const message = result && typeof (result[1]) === 'string' ? result[1] : ''
  const failure = message ? locateFailure(message) : null
  if (failure && failure.n === null) {
    // the failing request is the one the test stopped at, or the one with interim responses
    const interimIdx = trace.client.findIndex(entry => entry.interim)
    failure.n = failure.interim && interimIdx > -1 ? interimIdx + 1 : trace.client.length
  }
  const failN = failure ? failure.n : 0

  let html = `<div class="trace" style="--hl: ${colour || '#c33131'}">`
  html += `<h2>${marked.parse(test.name).slice(3, -5)}</h2>`
  if (subject) html += `<p class="trace-subject">${escapeHtml(subject)}</p>`
  html += `<p><span class="fa" style="color: ${colour}">${glyph}</span> ${escapeHtml(label)}</p>`
  if (message) html += `<p class="trace-message">${escapeHtml(message)}</p>`

  trace.client.forEach((entry, i) => {
    const n = i + 1
    const resFailure = failN === n && failure.block === 'res'
    const originFailure = failN === n && failure.block === 'origin'
    html += `<h3>Request ${n}</h3>`

    const [method, suffix, reqHeaders] = entry.req
    const sentLines = [traceLine(`${method} [test URL]${suffix}`), ...traceHeaderLines(reqHeaders, null, false)]
    if (entry.reqBody !== undefined) sentLines.push(traceLine(`body: ${JSON.stringify(entry.reqBody)}`))
    if (entry.reqOptions) sentLines.push(traceLine(`fetch options: ${JSON.stringify(entry.reqOptions)}`, 'muted'))
    html += traceBlock('Client sent', sentLines)

    if (trace.origin) {
      const seen = trace.origin.filter(item => item.n === n)
      const lines = []
      if (seen.length === 0) {
        lines.push(traceLine('(not seen by origin)', originFailure && failure.notSent ? 'hl muted' : 'muted'))
      }
      seen.forEach(item => {
        lines.push(traceLine(item.method, originFailure && failure.method ? 'hl' : ''))
        lines.push(...traceHeaderLines(item.headers, failure, originFailure))
      })
      html += traceBlock('Origin received', lines)
      if (entry.delay) html += traceNote(`Origin waited ${entry.delay} seconds before responding`)
      seen.filter(item => item.res).forEach(item => {
        html += traceBlock('Origin sent', originSentLines(item))
      })
    } else if (entry.delay) {
      html += traceNote(`Origin waited ${entry.delay} seconds before responding`)
    }

    if (entry.res) {
      const [status, resHeaders] = entry.res
      const lines = []
      for (const [interimStatus, interimHeaders] of entry.interim || []) {
        lines.push(traceLine(`HTTP ${interimStatus}`, resFailure && failure.interim ? 'hl' : ''))
        lines.push(...traceHeaderLines(interimHeaders, null, false))
      }
      lines.push(traceLine(`HTTP ${status}`, resFailure && failure.status ? 'hl' : ''))
      lines.push(...traceHeaderLines(resHeaders, failure, resFailure))
      if (entry.body !== undefined || (resFailure && failure.body)) {
        lines.push(traceLine(`body: ${JSON.stringify(entry.body ?? '')}`, resFailure && failure.body ? 'hl' : ''))
      }
      html += traceBlock('Client received', lines)
    } else {
      const stoppedHere = message && !failure && n === trace.client.length
      html += traceBlock('Client received', [traceLine('(no response)', stoppedHere ? 'hl muted' : 'muted')])
    }
    if (entry.pause) html += traceNote(`Client waited ${entry.pause} seconds before the next request`)
  })

  const unmatched = (trace.origin || []).filter(item => !(item.n >= 1 && item.n <= trace.client.length))
  if (unmatched.length) {
    html += '<h3>Other requests seen by origin</h3>'
    unmatched.forEach(item => {
      html += traceBlock('Origin received', [traceLine(item.method), ...traceHeaderLines(item.headers, null, false)])
    })
  }
  html += '</div>'
  modalOpen(html)
}

export function showTestDetails (test) {
  templateEngine
    .renderFile('explain-test', { test })
    .then(result => {
      console.log(result)
      const html = marked.parse(result)
      modalOpen(html)
    })
    .catch(err => {
      console.log(`Template error: ${err}`)
    })
}

function copyTextToClipboard (text) {
  const textArea = document.createElement('textarea')
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
    const successful = document.execCommand('copy')
    const msg = successful ? 'successful' : 'unsuccessful'
    console.log(`Copying text "${text}" was ${msg}`)
  } catch (err) {
    console.log('Unable to copy')
  }
  document.body.removeChild(textArea)
}

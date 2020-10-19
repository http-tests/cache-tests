import results from '../results/index.mjs'
import * as display from '../lib/display.mjs'
import { modalOpen } from '../lib/modal.mjs'
import baseTests from '../tests/index.mjs'


function populateLinks() {
  baseTests.forEach(suite => {
    if (suite.spec_anchors) {
      suite.spec_anchors.forEach(anchor => {
        adornSpecSection(anchor, suite.id, suite.name)
      })
    }
  })
}

function adornSpecSection(anchor, suite_id, suite_name) {
  var anchorNode = document.getElementById(anchor)
  if (! anchorNode) {
    console.log(`Anchor ${anchor} not found.`)
    return
  }
  var headerNode = anchorNode.children[0]
  var wrapper = document.createElement('span')
  wrapper.classList.add('adornment')
  wrapper.title = suite_name
  var adornment = document.createTextNode('ℹ️')
  wrapper.appendChild(adornment)
  wrapper.addEventListener('click', function (event) {
    event.preventDefault()
    showSuite(suite_id)
  })
  headerNode.appendChild(wrapper)

}

function showSuite(suite_id) {
  var iframeNode = document.createElement('iframe')
  iframeNode.id = 'resultsFrame'
  iframeNode.setAttribute("src", `/index.html?suite=${suite_id}`)
  document.body.appendChild(iframeNode)
}

populateLinks()

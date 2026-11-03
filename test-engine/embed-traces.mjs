import fs from 'fs'
import path from 'path'

// Embeds a traces file (see `npm run cli --traces`) for one results file into the traces
// <script> block of index.html, keyed by the results file's name.

const [resultsPath, tracesPath, htmlPath = 'index.html'] = process.argv.slice(2)
if (!resultsPath || !tracesPath) {
  console.error('Usage: npm run embed-traces results/NAME.json traces.json [index.html]')
  process.exit(1)
}

const blockRe = /(<script type="application\/json" id="traces">\n)([\s\S]*?)(\n<\/script>)/
const html = fs.readFileSync(htmlPath, 'utf8')
if (!blockRe.test(html)) {
  console.error(`No traces <script> block found in ${htmlPath}`)
  process.exit(1)
}

const embedded = JSON.parse(html.match(blockRe)[2])
embedded[path.basename(resultsPath)] = JSON.parse(fs.readFileSync(tracesPath, 'utf8'))

// one implementation per line, so that diffs stay readable
const lines = Object.keys(embedded).sort().map(file => `${JSON.stringify(file)}:${JSON.stringify(embedded[file])}`)
const body = lines.length ? `{\n${lines.join(',\n')}\n}` : '{}'
// '<' only appears inside strings, so escaping it keeps the JSON valid and the script block intact
const safeBody = body.replace(/</g, '\\u003c')

fs.writeFileSync(htmlPath, html.replace(blockRe, (_, open, __, close) => open + safeBody + close))

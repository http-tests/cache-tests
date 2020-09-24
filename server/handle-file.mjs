
import fs from 'fs'
import path from 'path'
import process from 'process'

import { sendResponse } from './utils.mjs'
import { mimeTypes } from '../lib/defines.mjs'

export default function handleFile (url, request, response) {
  var urlPath = path.normalize(url.pathname)
  if (urlPath === '/') urlPath = '/index.html'
  var filename = path.join(process.cwd(), urlPath)
  if (!fs.existsSync(filename)) {
    sendResponse(response, 404, `${urlPath} Not Found`)
    return
  }
  var mimeType = mimeTypes[path.extname(filename).split('.')[1]] || 'application/octet-stream'
  response.writeHead(200, { 'Content-Type': mimeType })
  var fileStream = fs.createReadStream(filename)
  fileStream.pipe(response)
}

import * as client from './client.mjs'
import fetch from 'node-fetch'
import tests from './tests/index.mjs'
import surrogate from './tests/surrogate-control.mjs'

tests.push(surrogate)
const baseUrl = process.env.npm_config_base || process.env.npm_package_config_base

client.runTests(tests, fetch, false, baseUrl)
  .then(function () { console.log(JSON.stringify(client.getResults(), null, 2)) })

import * as client from './client.mjs'
import fetch from 'node-fetch'
import ccRequest from './tests/cc-request.mjs'
import ccResponse from './tests/cc-response.mjs'
import freshness from './tests/explicit-freshness.mjs'
import heuristic from './tests/heuristic-freshness.mjs'
import surrogate from './tests/surrogate-control.mjs'
import statuses from './tests/status.mjs'
import vary from './tests/vary.mjs'
import other from './tests/other.mjs'

var tests = [ccResponse, ccRequest, freshness, heuristic, surrogate, statuses, vary, other]
const baseUrl = process.env.npm_config_base || process.env.npm_package_config_base

client.runTests(tests, fetch, false, baseUrl)
  .then(function () { console.log(JSON.stringify(client.testResults, null, 2)) })

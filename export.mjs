import tests from './tests/index.mjs'
import surrogate from './tests/surrogate-control.mjs'

tests.push(surrogate)

console.log(JSON.stringify(tests, null, 2))

# Tests for HTTP Caches

This is a test suite for the protocol behaviours of [HTTP caches](http://httpwg.org/specs/rfc7234.html). The initial tests were derived from contributions to the [WPT tests for caching](https://github.com/web-platform-tests/wpt/tree/master/fetch/http-cache).


## Goals

Overall, the goal of these tests is to identify variances in the behaviour, both from the normative specifications and between implementations. This in turn can help avoid situations where they act in surprising ways.

The underlying aim is to provide a basis for discussion about how HTTP caches -- especially in CDNs and reverse proxies -- should behave, so that over time we can adapt the tests and align implementations to behave more consistently.

In other words, **passing all of the tests currently means nothing** -- this is not a conformance test suite, it's just the start of a conversation, and a **tool to assess how a cache behaves**.

Therefore, if you believe a test should change (based upon common behaviour or your interpretation of the specifications), or have additional tests, please [contribute](CONTRIBUTING.md).


## Installation

The tests require a recent version of [NodeJS](https://nodejs.org/), which includes the `npm` package manager.

To install them:

> npm i --production --legacy-bundling http-cache-tests

If you'd also like to run the tests from the command line, use this instead:

> npm i --legacy-bundling http-cache-tests

Then, change directory into `node_modules/http-cache-tests`.


## Running the Test Server

First, start the server-side by running:

> npm run server

inside the `http-cache-tests` directory. By default, the server runs on port 8000; to choose a different port, use the `--port` argument; e.g.,

> npm run server --port=8080

If you want to run an HTTPS origin, you'll need to specify the `protocol`, `keyfile` and `certfile`:

> npm run server --protocol=https --keyfile=/path/to/key.pem --certfile=/path-to-cert.pem

Note that the default port for HTTPS is still 8000.

Make sure that the browser is not configured to use a proxy cache, and that the network being tested upon does not use an intercepting proxy cache.

## Testing Reverse Proxies and CDNs

To test an reverse proxy or CDN, configure it to use the server as the origin and point a browser to `https://{hostname}/test-cdn.html`.

Note that they only work reliably on Chrome for the time being; see [this bug](https://github.com/whatwg/fetch/issues/722).


### Testing from the Command Line

To test a reverse proxy or CDN from the command line::

> npm run --silent cli --base=http://server-url.example.org:8000/

... using the URL of the server you want to test. This will output the test results in JSON to STDOUT.


## Testing Browser Caches

To test a browser, just point it at `https://{hostname:port}/test-browser.html` after setting up the server.


## Interpreting the Results

HTTP caching by its nature is an optimisation; implementations aren't required to cache everything. However, when they do cache, their behaviour is constrained by [the specification](https://httpwg.org/specs/rfc7234.html).

To reflect this, the test descriptions use "must" and "should" to indicate whether the behaviour is based in interoperability requirements, or just an optimisation.

"Should" tests are testing whether caching is happening (because the point of a cache is caching!), whereas the "must"-level tests indicate a spec violation (and usually it maps directly to a MUST in the RFC).

This is explicitly flagged in the tests with the `required` member.


## Test Format

Each test run gets its own URL, randomized content, and operates independently.

Tests are kept in JavaScript files in `tests/`, each file representing a suite.

A suite is an object with a `name` member and a `tests` member; e.g.,

```javascript
export default {
  name: 'Example Tests',
  tests: [ ... ]
}
```

The `tests` member is an array of objects, with the following members:

- `name` - The name of the test.
- `requests` - a list of request objects (see below).
- `browser_only` - if `true`, will not run on non-browser caches. Default `false`.
- `browser_skip` - if `true, will not run on browser caches. Default `false`.
- `required` - if `false`, test is advisory; e.g., testing cache efficiency. Default `true`.

Possible members of a request object:

- `template` - A template object for the request, by name -- see `templates.js`.
- `request_method` - A string containing the HTTP method to be used.
- `request_headers` - An array of `[header_name_string, header_value_string]` arrays to
                    emit in the request.
- `request_body` - A string to use as the request body.
- `query_arg` - query arguments to add.
- `filename` - filename to use.
- `mode` - The mode string to pass to `fetch()`.
- `credentials` - The credentials string to pass to `fetch()`.
- `cache` - The cache string to pass to `fetch()`.
- `pause_after` - Boolean controlling a 3-second pause after the request completes.
- `response_status` - A `[number, string]` array containing the HTTP status code
                    and phrase to return.
- `response_headers` - An array of `[header_name_string, header_value_string]` arrays to
                     emit in the response. These values will also be checked like
                     expected_response_headers, unless there is a third value that is
                     `false`.
- `response_body` - String to send as the response body. If not set, it will contain
                  the test identifier.
- `expected_type` - One of `["cached", "not_cached", "lm_validate", "etag_validate", "error"]`
- `expected_status` - A number representing a HTTP status code to check the response for.
                    If not set, the value of `response_status[0]` will be used; if that
                    is not set, 200 will be used.
- `expected_request_headers` - An array of `[header_name_string, header_value_string]` representing
                              headers to check the request for.
- `expected_response_headers` - An array of `[header_name_string, header_value_string]` representing
                              headers to check the response for. See also response_headers.
- `expected_response_text` - A string to check the response body against.

`server.js` stashes an entry containing observed headers for each request it receives. When the
test fetches have run, this state is retrieved and the expected_* lists are checked, including
their length.


# Tests for HTTP Caches

This is a test suite for the protocol behaviours of [HTTP caches](http://httpwg.org/specs/rfc7234.html). The initial tests were derived from contributions to the [WPT tests for caching](https://github.com/web-platform-tests/wpt/tree/master/fetch/http-cache).


## Goals

Overall, the goal of these tests is to identify variances in the behaviour, both from the normative specifications and between implementations. This in turn can help avoid situations where they act in surprising ways.

The underlying aim is to provide a basis for discussion about how HTTP caches -- especially in CDNs and reverse proxies -- should behave, so that over time we can adapt the tests and align implementations to behave more consistently.

In other words, **passing all of the tests currently means nothing** -- this is not a conformance test suite, it's just the start of a conversation, and a **tool to assess how a cache behaves**.

Therefore, if you believe a test should change (based upon common behaviour or your interpretation of the specifications), or have additional tests, please [contribute](CONTRIBUTING.md).


## Installation

The tests require a recent version of [NodeJS](https://nodejs.org/) (10.8.0 or greater), which includes the `npm` package manager.

To install the most recent source from GitHub (*recommended; things are moving fast*):

> git clone https://github.com/http-tests/cache-tests.git

and then install dependencies:

> cd cache-tests; npm i

### Installing from NPM

Alternatively, for the most recent release:

> npm i --legacy-bundling http-cache-tests


## Running the Test Server

First, start the server-side by running:

> npm run server

inside the directory (the repository's directory if you cloned from git, or `node_modules/http-cache-tests` if you installed from npm).

By default, the server runs on port 8000; to choose a different port, use the `--port` argument; e.g.,

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

... using the URL of the server you want to test. This will output the test results in JSON to STDOUT. See `summary.mjs` for details of how to interpret that.

To run a single test, use:

> npm run cli --base=http://server-url.example.org:8000/ --id=test-id

... where `test-id` is the identifier for the test.


## Testing Browser Caches

To test a browser, just point it at `https://{hostname:port}/test-browser.html` after setting up the server.


## Interpreting the Results

HTTP caching by its nature is an optimisation; implementations aren't required to cache everything. However, when they do cache, their behaviour is constrained by [the specification](https://httpwg.org/specs/rfc7234.html).

As a result, there are a few different kinds of test results:

* ✅ - The test was successful.
* ⛔️ - The test failed, and likely indicates a specification conformance problem.
* ⚠️ - The cache didn't behave in an optimal fashion (usually, it didn't use a stored response when it could have), but this is not a conformance problem.
* `Y` / `N` - These are tests to see how deployed caches behave; we use them to gather information for future specification work.

Some additional results might pop up from time to time:

* ⁉️ - The test harness failed; this is an internal error, please [file a bug if one doesn't exist](https://github.com/http-tests/cache-tests/issues/).
* 🔹 - The test failed during setup; something interfered with the harness's communication between the client and server. See below.
* ⚪️ - Another test that this test depends on has failed; we use dependencies to help assure that we're actually testing the behaviour in question.
* `-` - Not tested; usually because the test isn't applicable to this cache.

Each test has an `id` that is a short name for the test; you can click on ⌾ next to the test name to copy it to the clipboard, and use that as a way to find the test in the `tests/` directory, as well as link directly to it; for example, the test ID `foo` can be linked to as `#foo` on the index and test pages.

Each test also has a `uuid` that identifies that specific test run; this can be used to find its requests in the browser developer tools or proxy logs. Click ⚙︎ to copy it to the clipboard.

Finally, you can hover over test names to get the raw JSON of the requests used to run the test. See below for details of that format.


### Test Results FAQ

If you see a lot of failures, it might be one of a few different issues:

* If you see lots of grey circles at the top (dependency failures), it's probably because the cache will store and reuse a response without explicit freshness or a validator. While this is technically legal in HTTP, it interferes with the tests. Disabling "default caching" or similar usually fixes this.

* If you see lots of blue diamonds (setup failures), it's likely that the cache is refusing `PUT` requests. Enable them to clear this; the tests use PUT to synchronise state between the client and the server.


## Test Format

Each test run gets its own URL, randomized content, and operates independently.

Tests are kept in JavaScript files in `tests/`, each file representing a suite.

A suite is an object with a `name` member, `id` member, a `tests` member, and an optional `description` member that can contain Markdown; e.g.,

```javascript
export default {
  name: 'Example Tests',
  id: 'example',
  description: 'These are the `Foo` tests!'
  tests: [ ... ]
}
```

The `tests` member is an array of objects, with the following members:

- `name` - A concise description of the test. Can contain Markdown. Required.
- `id` - A short, stable identifier for the test. Required.
- `description` - Longer details of the test. Optional.
- `kind` - One of:
  - `required` - This is a conformance test for a requirement in the standard. Default.
  - `optimal` - This test is to see if the cache behaves optimally.
  - `check` - This test is gathering information about cache behaviour.
- `requests` - a list of request objects (see below).
- `browser_only` - if `true`, will not run on non-browser caches. Default `false`.
- `browser_skip` - if `true, will not run on browser caches. Default `false`.
- `depends_on` - a list of test IDs that, when one fails, indicates that this test's results are not useful. Currently limited to test IDs in the same suite. Optional.

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
- `magic_locations` - Boolean; if `true`, the `Location` and `Content-Location` headers will be rewritten to full URLs.
- `response_status` - A `[number, string]` array containing the HTTP status code
                    and phrase to return.
- `response_headers` - An array of `[header_name_string, header_value_string]` arrays to
                     emit in the response. These values will also be checked like
                     expected_response_headers, unless there is a third value that is
                     `false`.
- `response_body` - String to send as the response body. If not set, it will contain
                  the test identifier.
- `expected_type` - One of:
  - `cached`: The response is served from cache
  - `not_cached`: The response is not served from cache; it comes from the origin
  - `lm_validate`: The response comes from cache, but was validated on the origin with Last-Modified
  - `etag_validate`: The response comes from cache, but was validated on the origin with an ETag
- `expected_status` - A number representing a HTTP status code to check the response for.
                    If not set, the value of `response_status[0]` will be used; if that
                    is not set, 200 will be used.
- `expected_request_headers` - An array of `[header_name_string, header_value_string]` representing
                              headers to check the request for.
- `expected_response_headers` - An array of `[header_name_string, header_value_string]` representing
                              headers to check the response for. See also response_headers.
- `expected_response_text` - A string to check the response body against.
- `setup` - Boolean to indicate whether this is a setup request; failures don't mean the actual test failed.
- `setup_tests` - Array of values that indicate whether the specified check is part of setup;
  failures don't mean the actual test failed. One of: `["expected_type", "expected_status",
  "expected_response_headers", "expected_response_text", "expected_type",
  "expected_request_headers"]`

`server.js` stashes an entry containing observed headers for each request it receives. When the
test fetches have run, this state is retrieved and the expected_* lists are checked, including
their length.


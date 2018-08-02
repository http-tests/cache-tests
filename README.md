# HTTP Cache Tests

These tests cover HTTP-specified behaviours for caches, primarily from
[RFC7234](http://httpwg.org/specs/rfc7234.html).

They were extracted from the [WPT tests for caching]() and generalised so that they can be used to test the browser cache or intermediary caches upstream.

A few notes:

* By its nature, caching is optional; some tests expecting a response to be cached might fail
  because the client chose not to cache it, or chose to race the cache with a network request.

* Likewise, some tests might fail because there is a separate document-level cache in browsers that's ill-defined; see [this issue](https://github.com/whatwg/fetch/issues/354).

* Some browser caches will behave differently when reloading / shift-reloading, despite the `cache
  mode` staying the same.


## Running the Tests

First, start the server-side:

> node server.js


### Testing Browser Caches

To test a browser, just point it at `https://{hostname}:8000/` and click "Browser Tests".


### Testing CDNs, Reverse Proxies and other Intermediary Caches

To test a forward proxy, configure your browser to use it, then point it at `https://{hostname}:8000/` and click "Intermediary Tests".

To test an reverse proxy or CDN, configure it to use port `8000` on the server as the origin. Then point a browser* to the CDN host/port and click "Intermediary Tests".

* They only work reliably on Chrome for the time being; see [this bug](https://github.com/whatwg/fetch/issues/722).


## Interpreting the Results

HTTP caching by its nature is an optimisation; implementations aren't required to cache everything. However, when they do cache, their behaviour is constrained by [the specification](https://httpwg.org/specs/rfc7234.html).

To reflect this, the test descriptions use SHOULD and MUST to indicate whether the behaviour is required or not; SHOULD tests are testing whether caching is happening (they're SHOULD because the point of a cache is caching!), whereas the MUST-level tests indicate a spec violation.


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
- `browser_only` - if `true`, will not run on non-browser caches.
- `browser_skip` - if `true, will not run on browser caches.

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


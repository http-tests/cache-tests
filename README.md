# Tests for HTTP Caches

This is a test suite for the behaviours of [HTTP caches](https://httpwg.org/specs/rfc9111.html),
including browsers, proxy caches and CDNs. Its public results are available at
[cache-tests.fyi](https://cache-tests.fyi).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Goals](#goals)
- [Installation](#installation)
  - [Installing from NPM](#installing-from-npm)
- [Running the Test Server](#running-the-test-server)
- [Testing Reverse Proxies and CDNs](#testing-reverse-proxies-and-cdns)
  - [Testing from the Command Line](#testing-from-the-command-line)
  - [Testing with Docker](#testing-with-docker)
- [Testing Browser Caches](#testing-browser-caches)
- [Interpreting the Results](#interpreting-the-results)
  - [Test Results FAQ](#test-results-faq)
- [Getting your results onto cache-tests.fyi](#getting-your-results-onto-cache-testsfyi)
- [Creating new tests](#creating-new-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Goals

Overall, the goal of these tests is to identify variances in the behaviour, both from the normative specifications and between implementations. This in turn can help avoid situations where they act in surprising ways.

The underlying aim is to provide a basis for discussion about how HTTP caches -- especially in CDNs and reverse proxies -- should behave, so that over time we can adapt the tests and align implementations to behave more consistently.

In other words, **passing all of the tests currently means nothing** -- this is not a conformance test suite, it's just the start of a conversation, and a **tool to assess how a cache behaves**.

Therefore, if you believe a test should change (based upon common behaviour or your interpretation of the specifications), or have additional tests, please [contribute](.github/CONTRIBUTING.md).


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

### Testing from the Command Line

To test a reverse proxy or CDN from the command line::

> npm run --silent cli --base=http://server-url.example.org:8000/

... using the URL of the server you want to test. This will output the test results in JSON to STDOUT, suitable for inclusion in the `results` directory. See `lib/summary.mjs` for details of how to interpret that.

To run a single test, use:

> npm run cli --base=http://server-url.example.org:8000/ --id=test-id

... where `test-id` is the identifier for the test. This will output the request and response headers as seen by the client and server, along with the results. This is useful for debugging a particular failure.


### Testing with Docker

There's also a docker image, `mnot/proxy-cache-tests`, that can be used to test reverse proxy caches. Once you have docker running, you can run the CLI tests against a given proxy like this:

> ./test-docker.sh squid

To run an individual test case, try:

> ./test-docker.sh -i freshness-none nginx


## Testing Browser Caches

To test a browser, just point it at `https://{hostname:port}/test-browser.html` after setting up the server.

On OSX, you can use `test-browser.sh` to automate this.

## Testing Forward Proxies
To test a forward proxy which listens on 127.0.0.1:8082, start the server:

> npm run server

and then run:

> HTTP_PROXY=http://127.0.0.1:8082 npm run --silent cli --base=http://127.0.0.1:8000

## Interpreting the Results

HTTP caching by its nature is an optimisation; implementations aren't required to cache everything. However, when they do cache, their behaviour is constrained by [the specification](https://httpwg.org/specs/rfc9111.html).

As a result, there are a few different kinds of test results (note that the HTML results use similar but slightly different symbols):

* ✅ - The test was successful.
* ⛔️ - The test failed, and likely indicates a specification conformance problem.
* ⚠️ - The cache didn't behave in an optimal fashion (usually, it didn't use a stored response when it could have), but this is not a conformance problem.
* ● / ○ - These are tests to see how deployed caches behave; we use them to gather information for future specification work. "yes" and "no" respectively.

Some additional results might pop up from time to time:

* ⁉️ - The test harness failed; this is an internal error, please [file a bug if one doesn't exist](https://github.com/http-tests/cache-tests/issues/).
* 🔹 - The test failed during setup; something interfered with the harness's communication between the client and server. See below.
* ↻ - The cache retried a request; this means the test result needs to be interpreted manually, as it may or may not have behaved correctly.
* ⚪️ - Another test that this test depends on has failed; we use dependencies to help assure that we're actually testing the behaviour in question.
* `-` - Not tested; usually because the test isn't applicable to this cache.

When you're testing with a browser, each test has a `uuid` that identifies that specific test run; this can be used to find its requests in the browser developer tools or proxy logs. Click ⚙︎ to copy it to the clipboard.


### Test Results FAQ

If you see a lot of failures, it might be one of a few different issues:

* If you see lots of grey circles at the top (dependency failures), it's probably because the cache will store and reuse a response without explicit freshness or a validator. While this is technically legal in HTTP, it interferes with the tests. Disabling "default caching" or similar usually fixes this.

* If you see lots of blue diamonds (setup failures), it's likely that the cache is refusing `PUT` requests. Enable them to clear this; the tests use PUT to synchronise state between the client and the server.


## Getting your results onto cache-tests.fyi

[cache-tests.fyi](https://cache-tests.fyi) collects results from caches in browsers, reverse proxies, and CDNs. Its purpose is to gather information about how HTTP caching works "in the wild", to help the [HTTP Working Group](https://httpwg.org) make decisions about how to evolve the specification.

If your implementation isn't listed and you want it to be, please file an issue, or contact [Mark Nottingham](mailto:mnot@mnot.net). Both open source and proprietary implementations are welcome; if there are commercial concerns about disclosing your results, your identity can be anonymised (e.g., "CDN A"), and will not be disclosed to anyone.

Right now, all of the reverse proxy and CDN implementations are run by a script on a server, using the command-line client; to keep results up-to-date as the tests evolve, it's most helpful if you can provide an endpoint to test (for reverse proxies and CDNs).


## Creating new tests

See [CONTRIBUTING.md](.github/CONTRIBUTING.md)

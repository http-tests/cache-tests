# {{ test.name }}

Test ID: `{{ test.id }}`

{% case test.kind %}
{%- when "optimal" -%}This is an optional test for cache efficiency
{%- when "check" -%}This is an informational check
{%- else -%}This is a conformance test
{%- endcase -%}
{%- if test.browser_only %} run on browsers only{% endif -%}
{%- if test.browser_skip %} not run on browsers{% endif -%}
.

{% if test.depends_on %}It depends on the following test IDs:
{% for dependant in test.depends_on %}
- `{{ dependant }}`
{% endfor %}{% endif %}

{% for request in test.requests -%}
## Request {{ forloop.index }}

{%- if request.setup == true %}

_This is a setup request; if it fails, we can't perform the test._
{%- endif -%}

{%- if request.mode or request.credentials or request.cache or request.redirect %}

### Fetch [init](https://fetch.spec.whatwg.org/#requestinit):
{% if request.mode %}- Mode: {{ request.mode }}{% endif %}
{% if request.credentials %}- Credentials: {{ request.credentials }}{% endif %}
{% if request.cache %}- Cache: {{ request.cache }}{% endif %}
{% if request.redirect %}- Redirect: {{ request.redirect }}{% endif %}
{% endif -%}

{%- if request.method or request.filename or request.query_arg or request.headers or request.body %}

### The client sends a request containing:
~~~
{{ request.method | default: 'GET' }} {{ request.filename }}?{{ request.query_arg }} {{ magic_locations }}
{% for header in request.headers %}{{ header[0] }}: {{ header[1] }}
{% endfor %}
{{ request.body }}
~~~
{% endif -%}

{%- if request.response_status or request.response_headers or request.response_body %}

### The server sends a response containing:
~~~
HTTP/1.1 {{ request.response_status[0] | default: 200 }} {{ request.response_status[1] | default: "OK" }}
{% for header in request.response_headers %}{{ header[0] }}: {{ header[1] }}
{% endfor %}
{{ response_body | default: '[unique response body]' }}
~~~{% endif -%}

{%- if request.expected_type or request.expected_request_headers or request.expected_status or request.expected_response_headers or request.expected response_headers_missing or request.expected_response_text %}

{%- assign setup_prop = ' _(Failure will be considered a test setup issue, rather than a test failure)_' %}
### The following checks will be performed:

{%- if request.expected_type %}
- The client will check that this response {% case request.expected_type %}{% when "cached" %}is cached{% when "not_cached" %}is not cached{% when "lm_validated" %}is validated using `Last-Modified`{% when "etag_validated" %}is validated using `ETag`{% endcase %} {% if test.setup_tests contains "expected_type" %}{{ setup_prop }}{% endif %}{% endif -%}

{%- if request.expected_request_headers.size > 0 %}
- The server will check that the following request headers (and values, when specified) are present{% if test.setup_tests contains "expected_request_headers" %}{{ setup_prop }}{% endif %}:
{%- for header in request.expected_request_headers %}
  - {{ header }}
{% endfor %}{% endif -%}

{%- if request.expected_expected_status %}
- Expected status: {{ request.expected_status }} {% if test.setup_tests contains "expected_status" %}{{ setup_prop }}{% endif %}{% endif -%}

{%- if request.expected_response_headers.size > 0 %}
- The server will check that the following response headers (and values, when specified) are present{% if test.setup_tests contains "expected_response_headers" %}{{ setup_prop }}{% endif %}:
{%- for header in request.expected_response_headers %}
  - `{% if header.first %}{{ header[0]}}: {{header[1] }}{% else %}{{ header }}{% endif %}`
{% endfor %}{% endif -%}

{%- if request.expected_response_headers_missing.size > 0 %}
- The server will check that the following response headers (and values, when specified) are missing:
{%- for header in request.expected_response_headers_missing %}
  - {{ header }}
{% endfor %}{% endif -%}

{%- if request.check_body == true %}
- Check body? {{ request.check_body }}{% endif -%}

{%- if request.expected_response text %}
- Expected response text: {{ request.expected_response_text }} {% if test.setup_tests contains "expected_response_text" %}{{ setup_prop }}{% endif %}{% endif -%}
{% endif -%}

{%- if request.pause_after == true %}
The client will pause for three seconds after this request.{% endif %}

{% endfor %}

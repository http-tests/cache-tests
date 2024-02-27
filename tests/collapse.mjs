import * as templates from './lib/templates.mjs'
import * as utils from './lib/utils.mjs'

export default

{
  name: 'Collapsed Requests',
  id: 'collapse',
  description: 'These tests check how caches [collapse requests](https://httpwg.org/specs/rfc9111.html#constructing.responses.from.caches).',
  tests: [
    {
      name: 'Does HTTP cache collapse two requests?',
      id: 'collapse-basic',
      depends_on: ['freshness-max-age'],
      requests: [
        templates.fresh({
          response_pause: true,
          async: true,
          expected_type: 'collapsed'
        }),
        {
          expected_type: 'collapsed'
        }
      ]
    }
  ]
}

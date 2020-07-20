import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import GraphQLScenario from 'dummy/mirage/scenarios/graphql';

const TestRequest = {
  logicalTable: {
    table: 'table1',
    timeGrain: 'grain1'
  },
  metrics: [{ metric: 'metric1' }, { metric: 'metric2' }],
  dimensions: [{ dimension: 'dimension1' }, { dimension: 'dimension2' }],
  filters: [
    { dimension: 'dimension3', operator: 'in', values: ['v1', 'v2'] },
    {
      dimension: 'dimension4',
      operator: 'in',
      values: ['v3', 'v4']
    }
  ],
  having: [
    {
      metric: 'metric1',
      operator: 'gt',
      values: [0] // TODO switch to `values: [0]` after `value` backwards compatibility has been removed
    }
  ],
  intervals: [
    {
      start: '2015-01-03',
      end: '2015-01-04'
    }
  ]
};

module('Unit | Service | Navi Facts - Elide', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.service = this.owner.lookup('service:navi-facts');
    GraphQLScenario(this.server);
  });

  test('fetch', async function(assert) {
    assert.expect(2);

    const response = await this.service.fetch(TestRequest, { dataSourceName: 'dummy-gql' });
    const columns = [...TestRequest.metrics.map(m => m.metric), ...TestRequest.dimensions.map(d => d.dimension)];
    assert.deepEqual(Object.keys(response.response), ['rows', 'meta'], 'Response has the rows and meta keys');
    assert.ok(
      response.response.rows.every(row => Object.keys(row).every(key => columns.includes(key))),
      'Every row has a value for each column'
    );
  });

  // TODO: Normalize error handling between elide and fili
  skip('fetch and catch error', function(assert) {
    assert.expect(2);

    // Return an error
    return this.service.fetch(Object.assign({}, TestRequest, { metrics: [], dimensions: [] })).catch(response => {
      assert.ok(true, 'A request error falls into the promise catch block');

      assert.equal(response.payload.reason, 'Invalid query sent with AsyncQuery', 'error is passed to catch block');
    });
  });
});

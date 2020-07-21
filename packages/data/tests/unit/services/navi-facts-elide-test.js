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
      values: [0]
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
    assert.expect(1);

    const response = await this.service.fetch(TestRequest, { dataSourceName: 'dummy-gql' });
    assert.deepEqual(
      response.response,
      {
        meta: {},
        rows: [
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Ergonomic Metal Car',
            metric1: '954.49',
            metric2: '555.07'
          },
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Awesome Rubber Chair',
            metric1: '445.76',
            metric2: '428.91'
          },
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Generic Soft Ball',
            metric1: '669.73',
            metric2: '139.69'
          },
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Fantastic Wooden Bacon',
            metric1: '82.50',
            metric2: '230.24'
          },
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Small Concrete Shoes',
            metric1: '897.10',
            metric2: '197.14'
          },
          { dimension1: 'Rustic Wooden Bike', dimension2: 'Tasty Fresh Towels', metric1: '298.00', metric2: '798.50' },
          {
            dimension1: 'Rustic Wooden Bike',
            dimension2: 'Intelligent Metal Shirt',
            metric1: '262.30',
            metric2: '332.33'
          },
          { dimension1: 'Rustic Wooden Bike', dimension2: 'Awesome Plastic Mouse', metric1: '5.12', metric2: '421.10' },
          {
            dimension1: 'Rustic Plastic Bacon',
            dimension2: 'Practical Fresh Tuna',
            metric1: '543.20',
            metric2: '444.82'
          },
          {
            dimension1: 'Rustic Plastic Bacon',
            dimension2: 'Refined Rubber Chips',
            metric1: '475.60',
            metric2: '824.77'
          },
          {
            dimension1: 'Rustic Plastic Bacon',
            dimension2: 'Fantastic Cotton Pizza',
            metric1: '636.38',
            metric2: '162.65'
          }
        ]
      },
      'Response rows are correctly formatted for request'
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

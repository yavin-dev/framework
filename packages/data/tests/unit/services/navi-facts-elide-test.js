import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import GraphQLScenario from 'dummy/mirage/scenarios/elide-one';
import moment from 'moment';

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

const TestRequestV2 = {
  table: 'table1',
  columns: [
    { field: 'eventTimeDay', parameters: {}, type: 'timeDimension' },
    { field: 'eventTimeMonth', parameters: {}, type: 'timeDimension' },
    { field: 'orderTimeDay', parameters: {}, type: 'timeDimension' },
    { field: 'metric1', parameters: {}, type: 'metric' },
    { field: 'metric2', parameters: {}, type: 'metric' },
    { field: 'dimension1', parameters: {}, type: 'dimension' },
    { field: 'dimension2', parameters: {}, type: 'dimension' }
  ],
  filters: [
    { field: 'dimension1', operator: 'eq', values: ['Small Metal Hat'], parameters: {}, type: 'dimension' },
    {
      field: 'dimension2',
      operator: 'notin',
      values: ['Gorgeous Frozen Table', 'Refined Soft Sausages'],
      parameters: {},
      type: 'dimension'
    },
    { field: 'dimension3', operator: 'in', values: ['v1', 'v2'], parameters: {}, type: 'dimension' },
    { field: 'dimension4', operator: 'in', values: ['v3', 'v4'], parameters: {}, type: 'dimension' },
    { field: 'metric1', operator: 'gt', values: ['0'], parameters: {}, type: 'metric' },
    {
      field: 'eventTimeDay',
      operator: 'ge',
      values: ['2015-01-29'],
      parameters: {},
      type: 'timeDimension'
    },
    {
      field: 'eventTimeDay',
      operator: 'lt',
      values: ['2015-02-04'],
      parameters: {},
      type: 'timeDimension'
    },
    {
      field: 'orderTimeDay',
      operator: 'ge',
      values: ['2014-01-05'],
      parameters: {},
      type: 'timeDimension'
    },
    {
      field: 'orderTimeDay',
      operator: 'lt',
      values: ['2014-01-07'],
      parameters: {},
      type: 'timeDimension'
    }
  ],
  sorts: [
    { field: 'eventTimeDay', parameters: {}, type: 'timeDimension', direction: 'asc' },
    { field: 'dimension2', parameters: {}, type: 'dimension', direction: 'desc' }
  ],
  limit: 15,
  requestVersion: '2.0',
  dataSource: 'dummy-gql'
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

    const response = await this.service.fetch(TestRequest, { dataSourceName: 'elideOne' });
    assert.deepEqual(
      response.response,
      {
        rows: [
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Ergonomic Metal Car',
            metric1: '56.88',
            metric2: '954.75'
          },
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Awesome Rubber Chair',
            metric1: '866.65',
            metric2: '555.78'
          },
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Generic Soft Ball',
            metric1: '221.03',
            metric2: '649.72'
          },
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Fantastic Wooden Bacon',
            metric1: '404.99',
            metric2: '580.88'
          },
          {
            dimension1: 'Sleek Rubber Computer',
            dimension2: 'Small Concrete Shoes',
            metric1: '316.09',
            metric2: '168.88'
          },
          { dimension1: 'Rustic Wooden Bike', dimension2: 'Ergonomic Metal Car', metric1: '76.66', metric2: '415.87' },
          {
            dimension1: 'Rustic Wooden Bike',
            dimension2: 'Awesome Rubber Chair',
            metric1: '843.23',
            metric2: '653.01'
          },
          { dimension1: 'Rustic Wooden Bike', dimension2: 'Generic Soft Ball', metric1: '848.94', metric2: '620.57' },
          {
            dimension1: 'Rustic Wooden Bike',
            dimension2: 'Fantastic Wooden Bacon',
            metric1: '971.47',
            metric2: '403.77'
          },
          {
            dimension1: 'Rustic Wooden Bike',
            dimension2: 'Small Concrete Shoes',
            metric1: '385.38',
            metric2: '873.77'
          },
          {
            dimension1: 'Rustic Plastic Bacon',
            dimension2: 'Ergonomic Metal Car',
            metric1: '954.49',
            metric2: '555.07'
          },
          {
            dimension1: 'Rustic Plastic Bacon',
            dimension2: 'Awesome Rubber Chair',
            metric1: '445.76',
            metric2: '428.91'
          },
          { dimension1: 'Rustic Plastic Bacon', dimension2: 'Generic Soft Ball', metric1: '669.73', metric2: '139.69' },
          {
            dimension1: 'Rustic Plastic Bacon',
            dimension2: 'Fantastic Wooden Bacon',
            metric1: '82.50',
            metric2: '230.24'
          },
          {
            dimension1: 'Rustic Plastic Bacon',
            dimension2: 'Small Concrete Shoes',
            metric1: '897.10',
            metric2: '197.14'
          }
        ],
        meta: {}
      },
      'Response rows are correctly formatted for request'
    );
  });

  test('fetch RequestV2', async function(assert) {
    assert.expect(1);

    const response = await this.service.fetch(TestRequestV2, { dataSourceName: TestRequestV2.dataSource });
    assert.deepEqual(
      response.response,
      {
        rows: [
          {
            eventTimeDay: '2015-01-29',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-05',
            dimension1: 'Small Metal Hat',
            dimension2: 'Unbranded Concrete Fish',
            metric1: '785.60',
            metric2: '590.23'
          },
          {
            eventTimeDay: '2015-01-29',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-06',
            dimension1: 'Small Metal Hat',
            dimension2: 'Unbranded Concrete Fish',
            metric1: '603.55',
            metric2: '977.92'
          },
          {
            eventTimeDay: '2015-01-29',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-05',
            dimension1: 'Small Metal Hat',
            dimension2: 'Refined Concrete Chair',
            metric1: '83.56',
            metric2: '774.72'
          },
          {
            eventTimeDay: '2015-01-29',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-06',
            dimension1: 'Small Metal Hat',
            dimension2: 'Refined Concrete Chair',
            metric1: '685.31',
            metric2: '432.90'
          },
          {
            eventTimeDay: '2015-01-29',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-05',
            dimension1: 'Small Metal Hat',
            dimension2: 'Licensed Concrete Salad',
            metric1: '965.49',
            metric2: '534.25'
          },
          {
            eventTimeDay: '2015-01-29',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-06',
            dimension1: 'Small Metal Hat',
            dimension2: 'Licensed Concrete Salad',
            metric1: '729.00',
            metric2: '611.60'
          },
          {
            eventTimeDay: '2015-01-29',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-05',
            dimension1: 'Small Metal Hat',
            dimension2: 'Awesome Steel Pants',
            metric1: '232.35',
            metric2: '581.26'
          },
          {
            eventTimeDay: '2015-01-29',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-06',
            dimension1: 'Small Metal Hat',
            dimension2: 'Awesome Steel Pants',
            metric1: '276.24',
            metric2: '946.29'
          },
          {
            eventTimeDay: '2015-01-30',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-05',
            dimension1: 'Small Metal Hat',
            dimension2: 'Unbranded Concrete Fish',
            metric1: '517.87',
            metric2: '791.83'
          },
          {
            eventTimeDay: '2015-01-30',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-06',
            dimension1: 'Small Metal Hat',
            dimension2: 'Unbranded Concrete Fish',
            metric1: '994.32',
            metric2: '602.63'
          },
          {
            eventTimeDay: '2015-01-30',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-05',
            dimension1: 'Small Metal Hat',
            dimension2: 'Refined Concrete Chair',
            metric1: '186.96',
            metric2: '146.24'
          },
          {
            eventTimeDay: '2015-01-30',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-05',
            dimension1: 'Small Metal Hat',
            dimension2: 'Licensed Concrete Salad',
            metric1: '48.48',
            metric2: '456.50'
          },
          {
            eventTimeDay: '2015-01-30',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-06',
            dimension1: 'Small Metal Hat',
            dimension2: 'Licensed Concrete Salad',
            metric1: '520.67',
            metric2: '591.28'
          },
          {
            eventTimeDay: '2015-01-30',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-05',
            dimension1: 'Small Metal Hat',
            dimension2: 'Awesome Steel Pants',
            metric1: '137.87',
            metric2: '826.68'
          },
          {
            eventTimeDay: '2015-01-30',
            eventTimeMonth: '2015 Jan',
            orderTimeDay: '2014-01-06',
            dimension1: 'Small Metal Hat',
            dimension2: 'Awesome Steel Pants',
            metric1: '578.79',
            metric2: '441.69'
          }
        ],
        meta: {}
      },
      'Request V2 query is properly sent with all necessary arguments supplied'
    );
  });

  test('fetch RequestV2 - only metrics', async function(assert) {
    assert.expect(1);

    const response = await this.service.fetch(
      {
        table: 'table1',
        columns: [
          { field: 'metric1', parameters: {}, type: 'metric' },
          { field: 'metric2', parameters: {}, type: 'metric' }
        ],
        filters: [{ field: 'metric1', operator: 'gt', values: ['100'], parameters: {}, type: 'metric' }],
        sorts: [{ field: 'metric2', parameters: {}, type: 'metric', direction: 'asc' }],
        limit: 15,
        requestVersion: '2.0',
        dataSource: 'dummy-gql'
      },
      { dataSourceName: 'dummy-gql' }
    );

    assert.deepEqual(
      response.response,
      { rows: [{ metric1: '384.77', metric2: '897.01' }], meta: {} },
      'Request with only metrics is formatted correctly'
    );
  });

  test('fetch RequestV2 - invalid date filter', async function(assert) {
    assert.expect(2);

    const filters = [
      {
        field: 'eventTimeDay',
        operator: 'ge',
        values: ['2015-01-29'],
        parameters: {},
        type: 'timeDimension'
      },
      {
        field: 'eventTimeDay',
        operator: 'lt',
        values: ['2015-02-04'],
        parameters: {},
        type: 'timeDimension'
      },
      {
        field: 'eventTimeDay',
        operator: 'ge',
        values: ['2015-02-05'],
        parameters: {},
        type: 'timeDimension'
      },
      {
        field: 'eventTimeDay',
        operator: 'lt',
        values: ['2015-02-06'],
        parameters: {},
        type: 'timeDimension'
      }
    ];

    const response = await this.service.fetch(
      {
        table: 'table1',
        columns: [
          { field: 'metric1', parameters: {}, type: 'metric' },
          { field: 'eventTimeDay', parameters: {}, type: 'timeDimension' }
        ],
        filters,
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'dummy-gql'
      },
      { dataSourceName: 'dummy-gql' }
    );

    assert.deepEqual(
      response.response,
      {
        rows: [],
        meta: {}
      },
      'An invalid filter on a requested field returns an empty response'
    );

    const noTimeDimResponse = await this.service.fetch(
      {
        table: 'table1',
        columns: [{ field: 'metric1', parameters: {}, type: 'metric' }],
        filters,
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'dummy-gql'
      },
      { dataSourceName: 'dummy-gql' }
    );
    assert.deepEqual(
      noTimeDimResponse.response,
      {
        rows: [{ metric1: '97.53' }],
        meta: {}
      },
      'An invalid filter on a non-requested field does not affect the response'
    );
  });

  test('fetch RequestV2 - incomplete date filters', async function(assert) {
    assert.expect(3);

    const response = await this.service.fetch(
      {
        table: 'table1',
        columns: [
          { field: 'metric1', parameters: {}, type: 'metric' },
          { field: 'eventTimeMonth', parameters: {}, type: 'timeDimension' }
        ],
        filters: [
          {
            field: 'eventTimeMonth',
            operator: 'ge',
            values: ['2015-01-01'],
            parameters: {},
            type: 'timeDimension'
          }
        ],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'dummy-gql'
      },
      { dataSourceName: 'dummy-gql' }
    );

    assert.deepEqual(
      response.response,
      {
        rows: [
          { eventTimeMonth: '2015 Jan', metric1: '38.56' },
          { eventTimeMonth: '2015 Feb', metric1: '195.76' }
        ],
        meta: {}
      },
      'A date filter with no end date defaults to a one month date interval'
    );

    const noStartDateResponse = await this.service.fetch(
      {
        table: 'table1',
        columns: [
          { field: 'metric1', parameters: {}, type: 'metric' },
          { field: 'eventTimeMonth', parameters: {}, type: 'timeDimension' }
        ],
        filters: [
          {
            field: 'eventTimeMonth',
            operator: 'lt',
            values: ['2015-01-01'],
            parameters: {},
            type: 'timeDimension'
          }
        ],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'dummy-gql'
      },
      { dataSourceName: 'dummy-gql' }
    );
    assert.deepEqual(
      noStartDateResponse.response,
      {
        rows: [
          { eventTimeMonth: '2014 Nov', metric1: '38.56' },
          { eventTimeMonth: '2014 Dec', metric1: '195.76' }
        ],
        meta: {}
      },
      'A date filter with no end date defaults to a one month date interval'
    );

    const DAY_FORMAT = 'YYYY-MM-DD';
    const dateToCurrentResponse = await this.service.fetch(
      {
        table: 'table1',
        columns: [{ field: 'eventTimeDay', parameters: {}, type: 'timeDimension' }],
        filters: [
          {
            field: 'eventTimeDay',
            operator: 'ge',
            values: [
              moment()
                .subtract(2, 'days')
                .format(DAY_FORMAT)
            ],
            parameters: {},
            type: 'timeDimension'
          }
        ],
        sorts: [],
        requestVersion: '2.0',
        dataSource: 'dummy-gql'
      },
      { dataSourceName: 'dummy-gql' }
    );

    assert.deepEqual(
      dateToCurrentResponse.response,
      {
        rows: [
          {
            eventTimeDay: moment()
              .subtract(2, 'days')
              .format(DAY_FORMAT)
          },
          {
            eventTimeDay: moment()
              .subtract(1, 'days')
              .format(DAY_FORMAT)
          },
          {
            eventTimeDay: moment().format(DAY_FORMAT)
          }
        ],
        meta: {}
      },
      'A date filter with no end date ends at current if start is not more than a month before current'
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

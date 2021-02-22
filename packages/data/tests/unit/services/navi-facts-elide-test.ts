import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import GraphQLScenario from 'navi-data/mirage/scenarios/elide-two';
import moment from 'moment';
import { TestContext as Context } from 'ember-test-helpers';
import { Server } from 'miragejs';
import NaviFactsService from 'navi-data/services/navi-facts';
import { Filter, RequestV2 } from 'navi-data/adapters/facts/interface';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import NaviMetadataService from 'navi-data/services/navi-metadata';

interface TestContext extends Context {
  service: NaviFactsService;
  server: Server;
}

const TestRequest: RequestV2 = {
  table: 'table1',
  columns: [
    { field: 'table1.eventTimeDay', parameters: {}, type: 'timeDimension' },
    { field: 'table1.eventTimeMonth', parameters: {}, type: 'timeDimension' },
    { field: 'table1.orderTimeDay', parameters: {}, type: 'timeDimension' },
    { field: 'table1.metric1', parameters: {}, type: 'metric' },
    { field: 'table1.metric2', parameters: {}, type: 'metric' },
    { field: 'table1.dimension2', parameters: {}, type: 'dimension' },
    { field: 'table1.dimension3', parameters: {}, type: 'dimension' },
  ],
  filters: [
    {
      field: 'table1.dimension2',
      operator: 'eq',
      values: ['Incredible Metal Towels'],
      parameters: {},
      type: 'dimension',
    },
    {
      field: 'table1.dimension3',
      operator: 'notin',
      values: ['Unbranded Soft Sausage', 'Ergonomic Plastic Tuna'],
      parameters: {},
      type: 'dimension',
    },
    { field: 'table1.dimension4', operator: 'in', values: ['v1', 'v2'], parameters: {}, type: 'dimension' },
    { field: 'table1.dimension5', operator: 'in', values: ['v3', 'v4'], parameters: {}, type: 'dimension' },
    { field: 'table1.metric1', operator: 'gt', values: ['0'], parameters: {}, type: 'metric' },
    {
      field: 'table1.eventTimeDay',
      operator: 'gte',
      values: ['2015-01-29'],
      parameters: {},
      type: 'timeDimension',
    },
    {
      field: 'table1.eventTimeDay',
      operator: 'lt',
      values: ['2015-02-04'],
      parameters: {},
      type: 'timeDimension',
    },
    {
      field: 'table1.orderTimeDay',
      operator: 'gte',
      values: ['2014-01-05'],
      parameters: {},
      type: 'timeDimension',
    },
    {
      field: 'table1.orderTimeDay',
      operator: 'lt',
      values: ['2014-01-07'],
      parameters: {},
      type: 'timeDimension',
    },
  ],
  sorts: [
    { field: 'table1.eventTimeDay', parameters: {}, type: 'timeDimension', direction: 'asc' },
    { field: 'table1.dimension3', parameters: {}, type: 'dimension', direction: 'desc' },
  ],
  limit: 15,
  requestVersion: '2.0',
  dataSource: 'elideTwo',
};

module('Unit | Service | Navi Facts - Elide', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.service = this.owner.lookup('service:navi-facts');
    GraphQLScenario(this.server);
    const metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await metadataService.loadMetadata({ dataSourceName: 'elideOne' });
  });

  test('fetch', async function (this: TestContext, assert) {
    const model = await this.service.fetch(TestRequest, { dataSourceName: TestRequest.dataSource });
    const { rows, meta } = model.response as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      {
        meta: {},
        rows: [
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Unbranded Soft Sausages',
            'table1.eventTimeDay': '2015-01-29',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '231.96',
            'table1.metric2': '969.93',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Unbranded Soft Sausages',
            'table1.eventTimeDay': '2015-01-29',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '236.73',
            'table1.metric2': '730.45',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Ergonomic Steel Sausages',
            'table1.eventTimeDay': '2015-01-29',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '385.95',
            'table1.metric2': '463.94',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Ergonomic Steel Sausages',
            'table1.eventTimeDay': '2015-01-29',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '998.39',
            'table1.metric2': '433.80',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Unbranded Soft Sausages',
            'table1.eventTimeDay': '2015-01-30',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '389.34',
            'table1.metric2': '661.33',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Unbranded Soft Sausages',
            'table1.eventTimeDay': '2015-01-30',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '451.75',
            'table1.metric2': '355.84',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Ergonomic Steel Sausages',
            'table1.eventTimeDay': '2015-01-30',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '723.84',
            'table1.metric2': '196.83',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Ergonomic Steel Sausages',
            'table1.eventTimeDay': '2015-01-30',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '476.87',
            'table1.metric2': '676.99',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Unbranded Soft Sausages',
            'table1.eventTimeDay': '2015-01-31',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '545.26',
            'table1.metric2': '114.62',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Unbranded Soft Sausages',
            'table1.eventTimeDay': '2015-01-31',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '589.71',
            'table1.metric2': '496.48',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Ergonomic Steel Sausages',
            'table1.eventTimeDay': '2015-01-31',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '432.79',
            'table1.metric2': '246.23',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Ergonomic Steel Sausages',
            'table1.eventTimeDay': '2015-01-31',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '104.97',
            'table1.metric2': '682.74',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Unbranded Soft Sausages',
            'table1.eventTimeDay': '2015-02-01',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '861.11',
            'table1.metric2': '824.58',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Unbranded Soft Sausages',
            'table1.eventTimeDay': '2015-02-01',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '486.71',
            'table1.metric2': '482.62',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Incredible Metal Towels',
            'table1.dimension3': 'Ergonomic Steel Sausages',
            'table1.eventTimeDay': '2015-02-01',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '308.03',
            'table1.metric2': '227.94',
            'table1.orderTimeDay': '2014-01-05',
          },
        ],
      },
      'Request V2 query is properly sent with all necessary arguments supplied'
    );
  });

  test('fetch - only metrics', async function (this: TestContext, assert) {
    const model = await this.service.fetch(
      {
        table: 'table1',
        columns: [
          { field: 'table1.metric1', parameters: {}, type: 'metric' },
          { field: 'table1.metric2', parameters: {}, type: 'metric' },
        ],
        filters: [{ field: 'table1.metric1', operator: 'gt', values: ['100'], parameters: {}, type: 'metric' }],
        sorts: [{ field: 'table1.metric2', parameters: {}, type: 'metric', direction: 'asc' }],
        limit: 15,
        requestVersion: '2.0',
        dataSource: 'elideTwo',
      },
      { dataSourceName: 'elideTwo' }
    );

    const { rows, meta } = model.response as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      { rows: [{ 'table1.metric1': '823.11', 'table1.metric2': '823.38' }], meta: {} },
      'Request with only metrics is formatted correctly'
    );
  });

  test('fetch - invalid date filter', async function (this: TestContext, assert) {
    const filters: Filter[] = [
      {
        field: 'table1.eventTimeDay',
        operator: 'gte',
        values: ['2015-01-29'],
        parameters: {},
        type: 'timeDimension',
      },
      {
        field: 'table1.eventTimeDay',
        operator: 'lt',
        values: ['2015-02-04'],
        parameters: {},
        type: 'timeDimension',
      },
      {
        field: 'table1.eventTimeDay',
        operator: 'gte',
        values: ['2015-02-05'],
        parameters: {},
        type: 'timeDimension',
      },
      {
        field: 'table1.eventTimeDay',
        operator: 'lt',
        values: ['2015-02-06'],
        parameters: {},
        type: 'timeDimension',
      },
    ];

    const model = await this.service.fetch(
      {
        table: 'table1',
        columns: [
          { field: 'table1.metric1', parameters: {}, type: 'metric' },
          { field: 'table1.eventTimeDay', parameters: {}, type: 'timeDimension' },
        ],
        filters,
        sorts: [],
        limit: null,
        requestVersion: '2.0',
        dataSource: 'elideTwo',
      },
      { dataSourceName: 'elideTwo' }
    );

    const { rows, meta } = model.response as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      {
        rows: [],
        meta: {},
      },
      'An invalid filter on a requested field returns an empty response'
    );

    const noTimeDimResponse = (
      await this.service.fetch(
        {
          table: 'table1',
          columns: [{ field: 'table1.metric1', parameters: {}, type: 'metric' }],
          filters,
          sorts: [],
          limit: null,
          requestVersion: '2.0',
          dataSource: 'elideTwo',
        },
        { dataSourceName: 'elideTwo' }
      )
    ).response;

    assert.deepEqual(
      {
        rows: noTimeDimResponse?.rows,
        meta: noTimeDimResponse?.meta,
      },
      {
        rows: [{ 'table1.metric1': '307.93' }],
        meta: {},
      },
      'An invalid filter on a non-requested field does not affect the response'
    );
  });

  test('fetch - incomplete date filters', async function (this: TestContext, assert) {
    const model = await this.service.fetch(
      {
        table: 'table1',
        columns: [
          { field: 'table1.metric1', parameters: {}, type: 'metric' },
          { field: 'table1.eventTimeMonth', parameters: {}, type: 'timeDimension' },
        ],
        filters: [
          {
            field: 'table1.eventTimeMonth',
            operator: 'gte',
            values: ['2015-01-01'],
            parameters: {},
            type: 'timeDimension',
          },
        ],
        sorts: [],
        limit: null,
        requestVersion: '2.0',
        dataSource: 'elideTwo',
      },
      { dataSourceName: 'elideTwo' }
    );

    const { rows, meta } = model.response as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      {
        rows: [
          { 'table1.eventTimeMonth': '2015 Jan', 'table1.metric1': '17.49' },
          { 'table1.eventTimeMonth': '2015 Feb', 'table1.metric1': '426.48' },
        ],
        meta: {},
      },
      'A date filter with no end date defaults to a one month date interval'
    );

    const noStartDateResponse = (
      await this.service.fetch(
        {
          table: 'table1',
          columns: [
            { field: 'table1.metric1', parameters: {}, type: 'metric' },
            { field: 'table1.eventTimeMonth', parameters: {}, type: 'timeDimension' },
          ],
          filters: [
            {
              field: 'table1.eventTimeMonth',
              operator: 'lt',
              values: ['2015-01-01'],
              parameters: {},
              type: 'timeDimension',
            },
          ],
          sorts: [],
          limit: null,
          requestVersion: '2.0',
          dataSource: 'elideTwo',
        },
        { dataSourceName: 'elideTwo' }
      )
    ).response;
    assert.deepEqual(
      {
        rows: noStartDateResponse?.rows,
        meta: noStartDateResponse?.meta,
      },
      {
        rows: [
          { 'table1.eventTimeMonth': '2014 Nov', 'table1.metric1': '17.49' },
          { 'table1.eventTimeMonth': '2014 Dec', 'table1.metric1': '426.48' },
        ],
        meta: {},
      },
      'A date filter with no end date defaults to a one month date interval'
    );

    const DAY_FORMAT = 'YYYY-MM-DD';
    const dateToCurrentResponse = (
      await this.service.fetch(
        {
          table: 'table1',
          columns: [{ field: 'table1.eventTimeDay', parameters: {}, type: 'timeDimension' }],
          filters: [
            {
              field: 'table1.eventTimeDay',
              operator: 'gte',
              values: [moment.utc().subtract(2, 'days').format(DAY_FORMAT)],
              parameters: {},
              type: 'timeDimension',
            },
          ],
          sorts: [],
          limit: null,
          requestVersion: '2.0',
          dataSource: 'elideTwo',
        },
        { dataSourceName: 'elideTwo' }
      )
    ).response;

    assert.deepEqual(
      {
        rows: dateToCurrentResponse?.rows,
        meta: dateToCurrentResponse?.meta,
      },
      {
        rows: [
          {
            'table1.eventTimeDay': moment().utc().subtract(2, 'days').format(DAY_FORMAT),
          },
          {
            'table1.eventTimeDay': moment().utc().subtract(1, 'days').format(DAY_FORMAT),
          },
          {
            'table1.eventTimeDay': moment().utc().format(DAY_FORMAT),
          },
        ],
        meta: {},
      },
      'A date filter with no end date ends at current if start is not more than a month before current'
    );
  });

  test('fetch - sorts', async function (this: TestContext, assert) {
    const model = await this.service.fetch(
      {
        table: 'table1',
        columns: [
          { field: 'table1.metric1', parameters: {}, type: 'metric' },
          { field: 'table1.eventTimeDay', parameters: {}, type: 'timeDimension' },
        ],
        filters: [
          {
            field: 'table1.eventTimeDay',
            operator: 'gte',
            values: ['2015-01-01'],
            parameters: {},
            type: 'timeDimension',
          },
          {
            field: 'table1.eventTimeDay',
            operator: 'lt',
            values: ['2015-01-04'],
            parameters: {},
            type: 'timeDimension',
          },
        ],
        sorts: [{ field: 'table1.metric1', parameters: {}, type: 'metric', direction: 'asc' }],
        limit: null,
        requestVersion: '2.0',
        dataSource: 'elideTwo',
      },
      { dataSourceName: 'elideTwo' }
    );

    const { rows, meta } = model.response as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      {
        meta: {},
        rows: [
          {
            'table1.eventTimeDay': '2015-01-03',
            'table1.metric1': '44.71',
          },
          {
            'table1.eventTimeDay': '2015-01-02',
            'table1.metric1': '327.11',
          },
          {
            'table1.eventTimeDay': '2015-01-01',
            'table1.metric1': '675.73',
          },
        ],
      },
      'Response is sorted as specified by the request'
    );

    const multiSortResponse = (
      await this.service.fetch(
        {
          table: 'table1',
          columns: [
            { field: 'table1.dimension2', parameters: {}, type: 'dimension' },
            { field: 'table1.dimension3', parameters: {}, type: 'dimension' },
            { field: 'table1.metric1', parameters: {}, type: 'metric' },
          ],
          filters: [],
          sorts: [
            { field: 'table1.dimension2', parameters: {}, type: 'metric', direction: 'asc' },
            { field: 'table1.dimension3', parameters: {}, type: 'metric', direction: 'asc' },
          ],
          limit: null,
          requestVersion: '2.0',
          dataSource: 'elideTwo',
        },
        { dataSourceName: 'elideTwo' }
      )
    ).response;

    assert.deepEqual(
      {
        rows: multiSortResponse?.rows,
        meta: multiSortResponse?.meta,
      },
      {
        meta: {},
        rows: [
          {
            'table1.dimension2': 'Handmade Rubber Fish',
            'table1.dimension3': 'Awesome Cotton Sausages',
            'table1.metric1': '913.34',
          },
          {
            'table1.dimension2': 'Handmade Rubber Fish',
            'table1.dimension3': 'Handcrafted Concrete Pizza',
            'table1.metric1': '220.58',
          },
          {
            'table1.dimension2': 'Handmade Rubber Fish',
            'table1.dimension3': 'Small Metal Mouse',
            'table1.metric1': '286.62',
          },
          {
            'table1.dimension2': 'Handmade Rubber Fish',
            'table1.dimension3': 'Unbranded Wooden Pizza',
            'table1.metric1': '188.92',
          },
          {
            'table1.dimension2': 'Incredible Rubber Tuna',
            'table1.dimension3': 'Awesome Cotton Sausages',
            'table1.metric1': '403.35',
          },
          {
            'table1.dimension2': 'Incredible Rubber Tuna',
            'table1.dimension3': 'Handcrafted Concrete Pizza',
            'table1.metric1': '500.33',
          },
          {
            'table1.dimension2': 'Incredible Rubber Tuna',
            'table1.dimension3': 'Small Metal Mouse',
            'table1.metric1': '131.54',
          },
          {
            'table1.dimension2': 'Incredible Rubber Tuna',
            'table1.dimension3': 'Unbranded Wooden Pizza',
            'table1.metric1': '441.55',
          },
          {
            'table1.dimension2': 'Licensed Concrete Fish',
            'table1.dimension3': 'Awesome Cotton Sausages',
            'table1.metric1': '528.84',
          },
          {
            'table1.dimension2': 'Licensed Concrete Fish',
            'table1.dimension3': 'Handcrafted Concrete Pizza',
            'table1.metric1': '992.46',
          },
          {
            'table1.dimension2': 'Licensed Concrete Fish',
            'table1.dimension3': 'Small Metal Mouse',
            'table1.metric1': '337.40',
          },
          {
            'table1.dimension2': 'Licensed Concrete Fish',
            'table1.dimension3': 'Unbranded Wooden Pizza',
            'table1.metric1': '974.83',
          },
        ],
      },
      'Multiple sorts are handled properly in order'
    );
  });

  test('fetch - limit', async function (this: TestContext, assert) {
    const limit = (
      await this.service.fetch(
        {
          table: 'table1',
          columns: [
            { field: 'table1.metric1', parameters: {}, type: 'metric' },
            { field: 'table1.eventTimeDay', parameters: {}, type: 'timeDimension' },
          ],
          filters: [
            {
              field: 'table1.eventTimeDay',
              operator: 'gte',
              values: ['2015-01-01'],
              parameters: {},
              type: 'timeDimension',
            },
            {
              field: 'table1.eventTimeDay',
              operator: 'lt',
              values: ['2015-01-10'],
              parameters: {},
              type: 'timeDimension',
            },
          ],
          sorts: [],
          limit: 3,
          requestVersion: '2.0',
          dataSource: 'elideTwo',
        },
        { dataSourceName: 'elideTwo' }
      )
    ).response;

    assert.deepEqual(
      {
        rows: limit?.rows,
        meta: limit?.meta,
      },
      {
        meta: {},
        rows: [
          {
            'table1.eventTimeDay': '2015-01-01',
            'table1.metric1': '823.11',
          },
          {
            'table1.eventTimeDay': '2015-01-02',
            'table1.metric1': '823.38',
          },
          {
            'table1.eventTimeDay': '2015-01-03',
            'table1.metric1': '26.11',
          },
        ],
      },
      'Limit in the request determines the max number of rows returned'
    );

    const limitless = (
      await this.service.fetch(
        {
          table: 'table1',
          columns: [
            { field: 'table1.metric1', parameters: {}, type: 'metric' },
            { field: 'table1.eventTimeDay', parameters: {}, type: 'timeDimension' },
          ],
          filters: [
            {
              field: 'table1.eventTimeDay',
              operator: 'gte',
              values: ['2015-01-01'],
              parameters: {},
              type: 'timeDimension',
            },
            {
              field: 'table1.eventTimeDay',
              operator: 'lt',
              values: ['2015-01-10'],
              parameters: {},
              type: 'timeDimension',
            },
          ],
          sorts: [],
          limit: null,
          requestVersion: '2.0',
          dataSource: 'elideTwo',
        },
        { dataSourceName: 'elideTwo' }
      )
    ).response;

    assert.deepEqual(
      {
        rows: limitless?.rows,
        meta: limitless?.meta,
      },
      {
        meta: {},
        rows: [
          {
            'table1.eventTimeDay': '2015-01-01',
            'table1.metric1': '783.84',
          },
          {
            'table1.eventTimeDay': '2015-01-02',
            'table1.metric1': '258.04',
          },
          {
            'table1.eventTimeDay': '2015-01-03',
            'table1.metric1': '634.84',
          },
          {
            'table1.eventTimeDay': '2015-01-04',
            'table1.metric1': '684.22',
          },
          {
            'table1.eventTimeDay': '2015-01-05',
            'table1.metric1': '249.04',
          },
          {
            'table1.eventTimeDay': '2015-01-06',
            'table1.metric1': '917.34',
          },
          {
            'table1.eventTimeDay': '2015-01-07',
            'table1.metric1': '758.08',
          },
          {
            'table1.eventTimeDay': '2015-01-08',
            'table1.metric1': '204.93',
          },
          {
            'table1.eventTimeDay': '2015-01-09',
            'table1.metric1': '313.08',
          },
        ],
      },
      'A null limit in the request results in no row limit'
    );
  });

  test('fetch and catch error', async function (this: TestContext, assert) {
    assert.expect(2);

    // Return an error
    await this.service
      .fetch(
        {
          table: 'badTable',
          columns: [{ field: 'badTable.badMetric', parameters: {}, type: 'metric' }],
          filters: [],
          sorts: [],
          limit: null,
          requestVersion: '2.0',
          dataSource: 'elideTwo',
        },
        { dataSourceName: 'elideTwo' }
      )
      .catch((response) => {
        assert.ok(true, 'A request error falls into the promise catch block');
        assert.equal(response.details[0], 'Invalid query sent with AsyncQuery', 'error is passed to catch block');
      });
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import GraphQLScenario from 'navi-data/mirage/scenarios/elide-two';
import moment from 'moment';
import { TestContext as Context } from 'ember-test-helpers';
import { Server } from 'miragejs';
import NaviFactsService from '@yavin/client/services/interfaces/fact';
import type { Filter, RequestV2 } from '@yavin/client/request';
import NaviFactResponse from '@yavin/client/models/navi-fact-response';
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
      values: ['Intelligent Soft Keyboard'],
      parameters: {},
      type: 'dimension',
    },
    {
      field: 'table1.dimension3',
      operator: 'notin',
      values: ['Gorgeous Plastic Mouse', 'Unbranded Wooden Chair'],
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 12,
            rowsPerPage: 12,
          },
        },
        rows: [
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-01-29',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '968.62',
            'table1.metric2': '550.28',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-01-29',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '890.81',
            'table1.metric2': '182.06',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-01-30',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '362.00',
            'table1.metric2': '2.19',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-01-30',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '272.86',
            'table1.metric2': '169.29',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-01-31',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '774.54',
            'table1.metric2': '146.85',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-01-31',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '317.51',
            'table1.metric2': '943.86',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-02-01',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '987.85',
            'table1.metric2': '583.42',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-02-01',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '708.99',
            'table1.metric2': '417.93',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-02-02',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '498.34',
            'table1.metric2': '971.55',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-02-02',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '145.24',
            'table1.metric2': '335.43',
            'table1.orderTimeDay': '2014-01-06',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-02-03',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '508.71',
            'table1.metric2': '510.03',
            'table1.orderTimeDay': '2014-01-05',
          },
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-02-03',
            'table1.eventTimeMonth': '2015 Feb',
            'table1.metric1': '316.59',
            'table1.metric2': '437.07',
            'table1.orderTimeDay': '2014-01-06',
          },
        ],
      },
      'Request V2 query is properly sent with all necessary arguments supplied'
    );
  });

  test('fetch - pagination', async function (this: TestContext, assert) {
    const limitless = { ...TestRequest, limit: null };
    const model = await this.service.fetch(limitless, {
      dataSourceName: limitless.dataSource,
      page: 1,
      perPage: 1,
    });
    const { rows, meta } = model.response as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      {
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 12,
            rowsPerPage: 1,
          },
        },
        rows: [
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-01-29',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '968.62',
            'table1.metric2': '550.28',
            'table1.orderTimeDay': '2014-01-05',
          },
        ],
      },
      'The pagination options limit the response to 1 row and gets the first page'
    );

    const modelPage2 = await this.service.fetch(limitless, {
      dataSourceName: limitless.dataSource,
      page: 2,
      perPage: 1,
    });
    const { rows: rows2, meta: meta2 } = modelPage2.response as NaviFactResponse;
    assert.deepEqual(
      { rows: rows2, meta: meta2 },
      {
        meta: {
          pagination: {
            currentPage: 2,
            numberOfResults: 12,
            rowsPerPage: 1,
          },
        },
        rows: [
          {
            'table1.dimension2': 'Intelligent Soft Keyboard',
            'table1.dimension3': 'Ergonomic Plastic Shirt',
            'table1.eventTimeDay': '2015-01-29',
            'table1.eventTimeMonth': '2015 Jan',
            'table1.metric1': '890.81',
            'table1.metric2': '182.06',
            'table1.orderTimeDay': '2014-01-06',
          },
        ],
      },
      'The pagination options limit the response to 1 row and gets the second page'
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
      {
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 1,
            rowsPerPage: 1,
          },
        },
        rows: [{ 'table1.metric1': '250.92', 'table1.metric2': '680.57' }],
      },
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 0,
            rowsPerPage: 0,
          },
        },
        rows: [],
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 1,
            rowsPerPage: 1,
          },
        },
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 2,
            rowsPerPage: 2,
          },
        },
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 2,
            rowsPerPage: 2,
          },
        },
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 3,
            rowsPerPage: 3,
          },
        },
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 3,
            rowsPerPage: 3,
          },
        },
        rows: [
          {
            'table1.eventTimeDay': '2015-01-02',
            'table1.metric1': '258.04',
          },
          {
            'table1.eventTimeDay': '2015-01-03',
            'table1.metric1': '634.84',
          },
          {
            'table1.eventTimeDay': '2015-01-01',
            'table1.metric1': '783.84',
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
            { type: 'dimension', field: 'table1.dimension2', parameters: {}, direction: 'asc' },
            { type: 'dimension', field: 'table1.dimension3', parameters: {}, direction: 'asc' },
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 25,
            rowsPerPage: 25,
          },
        },
        rows: [
          {
            'table1.dimension2': 'Ergonomic Plastic Bacon',
            'table1.dimension3': 'Awesome Cotton Bacon',
            'table1.metric1': '849.74',
          },
          {
            'table1.dimension2': 'Ergonomic Plastic Bacon',
            'table1.dimension3': 'Ergonomic Steel Tuna',
            'table1.metric1': '651.12',
          },
          {
            'table1.dimension2': 'Ergonomic Plastic Bacon',
            'table1.dimension3': 'Handcrafted Rubber Pizza',
            'table1.metric1': '440.87',
          },
          {
            'table1.dimension2': 'Ergonomic Plastic Bacon',
            'table1.dimension3': 'Incredible Metal Computer',
            'table1.metric1': '922.05',
          },
          {
            'table1.dimension2': 'Ergonomic Plastic Bacon',
            'table1.dimension3': 'Small Fresh Car',
            'table1.metric1': '265.31',
          },
          {
            'table1.dimension2': 'Generic Plastic Mouse',
            'table1.dimension3': 'Awesome Cotton Bacon',
            'table1.metric1': '712.64',
          },
          {
            'table1.dimension2': 'Generic Plastic Mouse',
            'table1.dimension3': 'Ergonomic Steel Tuna',
            'table1.metric1': '624.14',
          },
          {
            'table1.dimension2': 'Generic Plastic Mouse',
            'table1.dimension3': 'Handcrafted Rubber Pizza',
            'table1.metric1': '19.73',
          },
          {
            'table1.dimension2': 'Generic Plastic Mouse',
            'table1.dimension3': 'Incredible Metal Computer',
            'table1.metric1': '701.89',
          },
          {
            'table1.dimension2': 'Generic Plastic Mouse',
            'table1.dimension3': 'Small Fresh Car',
            'table1.metric1': '35.67',
          },
          {
            'table1.dimension2': 'Handcrafted Cotton Mouse',
            'table1.dimension3': 'Awesome Cotton Bacon',
            'table1.metric1': '391.73',
          },
          {
            'table1.dimension2': 'Handcrafted Cotton Mouse',
            'table1.dimension3': 'Ergonomic Steel Tuna',
            'table1.metric1': '736.36',
          },
          {
            'table1.dimension2': 'Handcrafted Cotton Mouse',
            'table1.dimension3': 'Handcrafted Rubber Pizza',
            'table1.metric1': '154.11',
          },
          {
            'table1.dimension2': 'Handcrafted Cotton Mouse',
            'table1.dimension3': 'Incredible Metal Computer',
            'table1.metric1': '880.89',
          },
          {
            'table1.dimension2': 'Handcrafted Cotton Mouse',
            'table1.dimension3': 'Small Fresh Car',
            'table1.metric1': '666.88',
          },
          {
            'table1.dimension2': 'Licensed Concrete Bike',
            'table1.dimension3': 'Awesome Cotton Bacon',
            'table1.metric1': '719.31',
          },
          {
            'table1.dimension2': 'Licensed Concrete Bike',
            'table1.dimension3': 'Ergonomic Steel Tuna',
            'table1.metric1': '563.02',
          },
          {
            'table1.dimension2': 'Licensed Concrete Bike',
            'table1.dimension3': 'Handcrafted Rubber Pizza',
            'table1.metric1': '356.45',
          },
          {
            'table1.dimension2': 'Licensed Concrete Bike',
            'table1.dimension3': 'Incredible Metal Computer',
            'table1.metric1': '327.80',
          },
          {
            'table1.dimension2': 'Licensed Concrete Bike',
            'table1.dimension3': 'Small Fresh Car',
            'table1.metric1': '303.88',
          },
          {
            'table1.dimension2': 'Tasty Granite Computer',
            'table1.dimension3': 'Awesome Cotton Bacon',
            'table1.metric1': '745.72',
          },
          {
            'table1.dimension2': 'Tasty Granite Computer',
            'table1.dimension3': 'Ergonomic Steel Tuna',
            'table1.metric1': '324.94',
          },
          {
            'table1.dimension2': 'Tasty Granite Computer',
            'table1.dimension3': 'Handcrafted Rubber Pizza',
            'table1.metric1': '990.20',
          },
          {
            'table1.dimension2': 'Tasty Granite Computer',
            'table1.dimension3': 'Incredible Metal Computer',
            'table1.metric1': '796.04',
          },
          {
            'table1.dimension2': 'Tasty Granite Computer',
            'table1.dimension3': 'Small Fresh Car',
            'table1.metric1': '729.57',
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 9,
            rowsPerPage: 3,
          },
        },
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
        meta: {
          pagination: {
            currentPage: 1,
            numberOfResults: 9,
            rowsPerPage: 9,
          },
        },
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

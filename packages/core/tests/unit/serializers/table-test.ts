import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { normalizeTableV2, TableVisMetadataPayloadV1, TableVisualizationMetadata } from 'navi-core/serializers/table';
import { RequestV2 } from '@yavin/client/request';
import { normalizeV1toV2, RequestV1 } from 'navi-core/utils/request';
import type NaviMetadataService from 'navi-data/services/navi-metadata';

const defaultAttributes = {};
const expected: TableVisualizationMetadata = {
  metadata: {
    columnAttributes: {
      c0: defaultAttributes,
      c1: defaultAttributes,
      c2: {
        ...defaultAttributes,
        canAggregateSubtotal: false,
      },
      c3: defaultAttributes,
      c4: defaultAttributes,
      c5: {
        ...defaultAttributes,
      },
      c6: {
        ...defaultAttributes,
        format: '0.00',
      },
      c7: defaultAttributes,
    },
    showTotals: {
      grandTotal: true,
      subtotal: 'c0',
    },
  },
  type: 'table',
  version: 2,
};
let naviMetadata: NaviMetadataService;

module('Unit | Serializer | table', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    naviMetadata = this.owner.lookup('service:navi-metadata');
    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('normalizeTableV2', function (assert) {
    assert.expect(4);

    const initialMetadata: TableVisMetadataPayloadV1 = {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          { field: 'clicks', type: 'metric', hasCustomDisplayName: true, displayName: 'My clicks' },
          {
            field: { metric: 'pageViews', parameters: {} },
            type: 'metric',
            displayName: 'Page Views',
            format: '0.00',
            //@ts-expect-error
            foo: 'bar',
          },
          {
            attributes: { name: 'revenue', parameters: { currency: 'EUR' }, canAggregateSubtotal: false },
            type: 'metric',
            displayName: 'Revenue (EUR)',
          },
          { field: 'revenue(currency=USD)', type: 'metric', displayName: 'Revenue (USD)', format: '' },
          { field: 'gender', type: 'dimension', displayName: 'Gender' },
          { field: { dimension: 'age' }, type: 'dimension', displayName: 'Age' },
          {
            attributes: { name: 'platform' },
            type: 'dimension',
            displayName: 'Platform',
            //@ts-expect-error
            foo: 'bar',
          },
          { field: 'dateTime', type: 'dateTime', displayName: 'Date' },
        ],
        showTotals: {
          subtotal: 'dateTime',
          grandTotal: true,
        },
      },
    };

    const TestRequest: RequestV2 = {
      table: 'table1',
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0',
      filters: [],
      columns: [
        {
          cid: 'c0',
          field: 'table1.dateTime',
          parameters: {
            grain: 'grain1',
          },
          type: 'timeDimension',
        },
        {
          cid: 'c1',
          type: 'dimension',
          field: 'platform',
          parameters: {
            field: 'id',
          },
        },
        {
          cid: 'c2',
          type: 'metric',
          field: 'revenue',
          parameters: { currency: 'EUR' },
        },
        {
          cid: 'c3',
          type: 'dimension',
          field: 'age',
          parameters: {
            field: 'id',
          },
        },
        {
          cid: 'c4',
          type: 'dimension',
          field: 'gender',
          parameters: {
            field: 'id',
          },
        },
        {
          cid: 'c5',
          type: 'metric',
          field: 'revenue',
          parameters: { currency: 'USD' },
        },
        {
          cid: 'c6',
          type: 'metric',
          field: 'pageViews',
          parameters: {},
        },
        {
          cid: 'c7',
          type: 'metric',
          field: 'clicks',
          parameters: {},
        },
      ],
      sorts: [],
    };

    const v2 = { version: 2, foo: 'ok' };
    assert.deepEqual(
      //@ts-expect-error
      normalizeTableV2({}, v2),
      //@ts-expect-error
      v2,
      'When version 2 is passed in, it does nothing'
    );

    const newMetadata = normalizeTableV2(TestRequest, initialMetadata, naviMetadata);

    assert.deepEqual(
      TestRequest.columns.map((c) => c.field),
      ['clicks', 'pageViews', 'revenue', 'revenue', 'gender', 'age', 'platform', 'table1.dateTime'],
      'The request columns are reordered based on the table ordering'
    );

    assert.deepEqual(
      TestRequest.columns.map((c) => c.alias),
      ['My clicks', undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      'The alias is moved over if it is marked as a custom display name'
    );

    assert.deepEqual(newMetadata, expected, 'The metadata maps column ids to their attributes');
  });

  test('v1 report and visualization', async function (assert) {
    const requestV1: RequestV1<string> = {
      intervals: [{ start: '2021-06-13 00:00:00.000', end: '2021-08-12 00:00:00.000' }],
      filters: [],
      dimensions: [{ dimension: 'dim' }],
      metrics: [
        { metric: 'valuables', parameters: { aggregation: 'total', trend: 'none', as: 'm1' } },
        { metric: 'valuables2', parameters: { aggregation: 'total' } },
      ],
      logicalTable: { table: 'tableName', timeGrain: 'all' },
      sort: [],
      having: [],
      dataSource: 'facts',
      requestVersion: 'v1',
    };
    const visualization: TableVisMetadataPayloadV1 = {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            attributes: {
              name: 'valuables2',
              parameters: { aggregation: 'total' },
              canAggregateSubtotal: true,
            },
            type: 'metric',
            displayName: 'Valuables2',
          },
          {
            attributes: {
              name: 'metricName',
              parameters: { aggregation: 'total' },
              canAggregateSubtotal: false,
            },
            type: 'metric',
            displayName: 'The Name',
          },
          {
            attributes: {
              name: 'valuables',
              parameters: { aggregation: 'total', trend: 'none', as: 'm1' },
              canAggregateSubtotal: true,
              format: '',
            },
            type: 'metric',
            displayName: 'Valuables',
          },
          {
            attributes: {
              name: 'metricName2',
              parameters: { aggregation: 'total' },
              canAggregateSubtotal: false,
            },
            type: 'metric',
            displayName: 'The Name2',
          },
        ],
      },
    };

    const request = normalizeV1toV2(requestV1, 'facts', naviMetadata);
    const result = normalizeTableV2(request, visualization, naviMetadata);

    const [cid1, cid2] = Object.keys(result.metadata.columnAttributes);
    assert.deepEqual(
      result,
      {
        metadata: {
          columnAttributes: {
            [cid1]: { canAggregateSubtotal: true },
            [cid2]: { canAggregateSubtotal: true },
          },
          showTotals: {},
        },
        type: 'table',
        version: 2,
      },
      'the table metadata is properly generated'
    );

    request.columns.forEach((c) => (c.cid = ''));
    assert.deepEqual(
      request,
      {
        columns: [
          { cid: '', field: 'valuables2', parameters: { aggregation: 'total' }, type: 'metric' },
          { cid: '', field: 'valuables', parameters: { aggregation: 'total', trend: 'none' }, type: 'metric' },
          { cid: '', field: 'dim', parameters: { field: 'desc' }, type: 'dimension' },
        ],
        dataSource: 'facts',
        filters: [
          {
            field: 'tableName.dateTime',
            operator: 'bet',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
            values: ['2021-06-13T00:00:00.000Z', '2021-08-11T00:00:00.000Z'],
          },
        ],
        limit: null,
        requestVersion: '2.0',
        sorts: [],
        table: 'tableName',
      },
      'the v1 request is normalized with the all grain and missing request columns'
    );
  });

  test('v1 report and visualization - injects show fields', async function (assert) {
    const requestV1: RequestV1<string> = {
      logicalTable: { table: 'tableA', timeGrain: 'day' },
      dataSource: 'bardOne',
      metrics: [
        { metric: 'revenue', parameters: { currency: 'USD' } },
        { metric: 'revenue', parameters: { currency: 'EUR' } },
      ],
      dimensions: [{ dimension: 'multiSystemId' }, { dimension: 'userSignupDate' }],
      filters: [],
      intervals: [{ end: '2018-02-16 00:00:00.000', start: '2018-02-09 00:00:00.000' }],
      having: [],
      sort: [],
      requestVersion: 'v1',
    };
    const visualization: TableVisMetadataPayloadV1 = {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          { field: 'dateTime', type: 'dateTime', displayName: 'Date' },
          {
            type: 'dimension',
            attributes: { name: 'multiSystemId', field: 'desc' },
            displayName: 'Multi System Id (desc)',
          },
          {
            type: 'dimension',
            attributes: { name: 'multiSystemId', field: 'other' },
            displayName: 'Multi System Id (other)',
          },
          { field: 'revenue(currency=USD)', type: 'metric', displayName: 'Revenue (USD)' },
          {
            type: 'dimension',
            attributes: { name: 'userSignupDate' },
            displayName: 'User Signup Date',
          },
          { field: 'revenue(currency=EUR)', type: 'metric', displayName: 'Revenue (EUR)' },
        ],
        showTotals: {
          subtotal: 'multiSystemId',
          grandTotal: true,
        },
      },
    };

    const request = normalizeV1toV2(requestV1, 'bardOne', naviMetadata);
    const result = normalizeTableV2(request, visualization, naviMetadata);

    assert.deepEqual(
      result,
      {
        metadata: {
          columnAttributes: {
            ...Object.fromEntries(Object.keys(result.metadata.columnAttributes).map((k) => [k, {}])),
          },
          showTotals: {
            grandTotal: true,
            subtotal: request.columns.find((c) => c.field === 'multiSystemId')?.cid,
          },
        },
        type: 'table',
        version: 2,
      },
      'the table metadata is properly generated when show fields are injected as columns'
    );

    request.columns.forEach((c) => {
      delete c.cid;
    });
    assert.deepEqual(
      request,
      {
        columns: [
          { type: 'timeDimension', field: 'tableA.dateTime', parameters: { grain: 'day' } },
          { type: 'dimension', field: 'multiSystemId', parameters: { field: 'desc' } },
          { type: 'dimension', field: 'multiSystemId', parameters: { field: 'other' } },
          { type: 'metric', field: 'revenue', parameters: { currency: 'USD' } },
          { type: 'timeDimension', field: 'userSignupDate', parameters: { field: 'id', grain: 'second' } },
          { type: 'metric', field: 'revenue', parameters: { currency: 'EUR' } },
        ],
        filters: [
          {
            field: 'tableA.dateTime',
            operator: 'bet',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
            values: ['2018-02-09T00:00:00.000Z', '2018-02-15T00:00:00.000Z'],
          },
        ],
        limit: null,
        requestVersion: '2.0',
        sorts: [],
        table: 'tableA',
        dataSource: 'bardOne',
      },
      'the v2 request contains show fields enumerated as separate columns'
    );
  });
});

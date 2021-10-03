import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { toggleAlias, normalizeV1, normalizeV1toV2, RequestV1 } from 'navi-core/utils/request';
import { unset } from 'lodash-es';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type NaviMetadataService from 'navi-data/services/navi-metadata';

let request: RequestV1<string>;
let naviMetadata: NaviMetadataService;

module('Unit | Utils | Request', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    naviMetadata = this.owner.lookup('service:navi-metadata');
    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });

    request = {
      requestVersion: 'v1',
      logicalTable: { table: 'network', timeGrain: 'day' },
      intervals: [{ end: 'current', start: 'P7D' }],
      dimensions: [{ dimension: 'age' }, { dimension: 'platform' }],
      filters: [
        {
          dimension: 'age',
          field: 'id',
          operator: 'in',
          values: ['2'],
        },
        {
          dimension: 'platform',
          field: 'desc',
          operator: 'contains',
          values: ['win'],
        },
        {
          dimension: 'platform',
          field: 'id',
          operator: 'notnull',
          values: [],
        },
        {
          dimension: 'gender',
          field: 'id',
          operator: 'null',
          values: [],
        },
      ],
      metrics: [
        { metric: 'revenue', parameters: { currency: 'USD', as: 'm1' } },
        { metric: 'revenue', parameters: { currency: 'CAD', as: 'm2' } },
        { metric: 'adClicks' },
      ],
      having: [
        { metric: 'm1', operator: 'lt', values: ['24'] },
        { metric: 'm2', operator: 'gt', values: ['3'] },
        { metric: 'adClicks', operator: 'gt', values: ['11'] },
      ],
      sort: [
        { metric: 'dateTime', direction: 'desc' },
        { metric: 'm2', direction: 'asc' },
      ],
    };
  });

  test('toggleAlias', function (assert) {
    assert.expect(2);

    //@ts-expect-error
    assert.deepEqual(toggleAlias(), [], 'returns an empty array when field is empty');

    let result = toggleAlias(
      request.having,
      {
        m1: 'revenue(currency=USD)',
        m2: 'revenue(currency=CAD)',
      },
      {
        'revenue(currency=USD)': request.metrics[0],
        'revenue(currency=CAD)': request.metrics[1],
        adClicks: request.metrics[2],
        dateTime: { metric: 'dateTime' },
      }
    );

    assert.deepEqual(
      result,
      [
        {
          metric: {
            metric: 'revenue',
            parameters: {
              as: 'm1',
              currency: 'USD',
            },
          },
          operator: 'lt',
          values: ['24'],
        },
        {
          metric: {
            metric: 'revenue',
            parameters: {
              as: 'm2',
              currency: 'CAD',
            },
          },
          operator: 'gt',
          values: ['3'],
        },
        {
          metric: {
            metric: 'adClicks',
          },
          operator: 'gt',
          values: ['11'],
        },
      ],
      'normalizes aliased metrics correctly'
    );
  });

  test('normalizeV1', function (assert) {
    assert.expect(7);

    const normalized = normalizeV1(request, 'bardOne');

    assert.equal(normalized.dataSource, 'bardOne', 'dataSource is set correctly');

    assert.equal(normalized.logicalTable.table, 'network', 'table is normalized correctly');

    assert.deepEqual(
      normalized.metrics,
      [
        {
          metric: 'revenue',
          parameters: {
            currency: 'USD',
          },
        },
        {
          metric: 'revenue',
          parameters: {
            currency: 'CAD',
          },
        },
        {
          metric: 'adClicks',
        },
      ],
      'metrics are normalized correctly'
    );

    assert.deepEqual(
      normalized.having,
      [
        {
          metric: {
            metric: 'revenue',
            parameters: {
              currency: 'USD',
            },
          },
          operator: 'lt',
          values: ['24'],
        },
        {
          metric: {
            metric: 'revenue',
            parameters: {
              currency: 'CAD',
            },
          },
          operator: 'gt',
          values: ['3'],
        },
        {
          metric: {
            metric: 'adClicks',
          },
          operator: 'gt',
          values: ['11'],
        },
      ],
      'having is normalized correctly'
    );

    assert.deepEqual(
      normalized.sort,
      [
        {
          direction: 'desc',
          metric: {
            metric: 'dateTime',
          },
        },
        {
          direction: 'asc',
          metric: {
            metric: 'revenue',
            parameters: {
              currency: 'CAD',
            },
          },
        },
      ],
      'sorts are normalized correctly'
    );

    assert.deepEqual(
      normalized.dimensions,
      [
        {
          dimension: 'age',
        },
        {
          dimension: 'platform',
        },
      ],
      'dimensions are normalized correctly'
    );

    assert.deepEqual(
      normalized.filters,
      [
        {
          dimension: 'age',
          field: 'id',
          operator: 'in',
          values: ['2'],
        },
        {
          dimension: 'platform',
          field: 'desc',
          operator: 'contains',
          values: ['win'],
        },
        {
          dimension: 'platform',
          field: 'id',
          operator: 'notnull',
          values: [],
        },
        {
          dimension: 'gender',
          field: 'id',
          operator: 'null',
          values: [],
        },
      ],
      'filters are normalized correctly'
    );
  });

  test('normalize v1 to v2', function (assert) {
    assert.expect(12);

    const normalized = normalizeV1toV2(request, 'bardOne');

    assert.equal(normalized.requestVersion, '2.0', 'requestVersion is set correctly');

    assert.equal(normalized.dataSource, 'bardOne', 'dataSource is set correctly');

    assert.equal(normalized.table, 'network', 'table is normalized correctly');

    const cids = normalized.columns.map((c) => c.cid);
    cids.forEach((cid, idx) => {
      assert.equal(cid?.length, 10, 'column cid has proper value');
      //remove from validation since cid value is non deterministic
      unset(normalized, `columns[${idx}].cid`);
    });

    assert.deepEqual(
      normalized.columns,
      [
        {
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          field: 'age',
          type: 'dimension',
          parameters: {
            field: 'id',
          },
        },
        {
          field: 'platform',
          type: 'dimension',
          parameters: {
            field: 'id',
          },
        },
        {
          field: 'revenue',
          parameters: {
            currency: 'USD',
          },
          type: 'metric',
        },
        {
          field: 'revenue',
          parameters: {
            currency: 'CAD',
          },
          type: 'metric',
        },
        {
          field: 'adClicks',
          type: 'metric',
          parameters: {},
        },
      ],
      'columns are normalized correctly'
    );

    assert.deepEqual(
      normalized.filters,
      [
        {
          field: 'network.dateTime',
          operator: 'bet',
          type: 'timeDimension',
          values: ['P7D', 'current'],
          parameters: {
            grain: 'day',
          },
        },
        {
          field: 'age',
          operator: 'in',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
          values: ['2'],
        },
        {
          field: 'platform',
          operator: 'contains',
          parameters: {
            field: 'desc',
          },
          type: 'dimension',
          values: ['win'],
        },
        {
          field: 'platform',
          operator: 'isnull',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
          values: [false],
        },
        {
          field: 'gender',
          operator: 'isnull',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
          values: [true],
        },
        {
          field: 'revenue',
          operator: 'lt',
          parameters: {
            currency: 'USD',
          },
          type: 'metric',
          values: ['24'],
        },
        {
          field: 'revenue',
          operator: 'gt',
          parameters: {
            currency: 'CAD',
          },
          type: 'metric',
          values: ['3'],
        },
        {
          field: 'adClicks',
          operator: 'gt',
          type: 'metric',
          values: ['11'],
          parameters: {},
        },
      ],
      'filters are normalized correctly'
    );

    assert.deepEqual(
      normalized.sorts,
      [
        {
          direction: 'desc',
          field: 'network.dateTime',
          type: 'timeDimension',
          parameters: {
            grain: 'day',
          },
        },
        {
          direction: 'asc',
          field: 'revenue',
          parameters: {
            currency: 'CAD',
          },
          type: 'metric',
        },
      ],
      'sorts are normalized correctly'
    );
  });

  test('normalize v1 to v2 - inclusive end date', function (assert) {
    assert.expect(5);

    request.logicalTable.timeGrain = 'day';
    request.intervals[0] = { start: '2021-01-01', end: '2021-01-03' };

    assert.deepEqual(
      normalizeV1toV2(request, 'bardOne').filters[0],
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        operator: 'bet',
        values: ['2021-01-01T00:00:00.000Z', '2021-01-02T00:00:00.000Z'],
        parameters: {
          grain: 'day',
        },
      },
      'day timegrain filters are moved to inclusive end date'
    );

    request.logicalTable.timeGrain = 'week';
    request.intervals[0] = { start: '2021-02-01', end: '2021-02-08' };

    assert.deepEqual(
      normalizeV1toV2(request, 'bardOne').filters[0],
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        operator: 'bet',
        values: ['2021-02-01T00:00:00.000Z', '2021-02-01T00:00:00.000Z'],
        parameters: {
          grain: 'isoWeek',
        },
      },
      'week (isoWeek) timegrain filters are moved to inclusive end date'
    );

    request.logicalTable.timeGrain = 'month';
    request.intervals[0] = { start: '2021-01-01', end: '2021-03-01' };

    assert.deepEqual(
      normalizeV1toV2(request, 'bardOne').filters[0],
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        operator: 'bet',
        values: ['2021-01-01T00:00:00.000Z', '2021-02-01T00:00:00.000Z'],
        parameters: {
          grain: 'month',
        },
      },
      'month timegrain filters are moved to inclusive end date'
    );

    request.logicalTable.timeGrain = 'quarter';
    request.intervals[0] = { start: '2021-01-01', end: '2021-04-01' };

    assert.deepEqual(
      normalizeV1toV2(request, 'bardOne').filters[0],
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        operator: 'bet',
        values: ['2021-01-01T00:00:00.000Z', '2021-01-01T00:00:00.000Z'],
        parameters: {
          grain: 'quarter',
        },
      },
      'quarter timegrain filters are moved to inclusive end date'
    );

    request.logicalTable.timeGrain = 'year';
    request.intervals[0] = { start: '2021-01-01', end: '2022-01-01' };

    assert.deepEqual(
      normalizeV1toV2(request, 'bardOne').filters[0],
      {
        type: 'timeDimension',
        field: 'network.dateTime',
        operator: 'bet',
        values: ['2021-01-01T00:00:00.000Z', '2021-01-01T00:00:00.000Z'],
        parameters: {
          grain: 'year',
        },
      },
      'year timegrain filters are moved to inclusive end date'
    );
  });

  test('normalize v1 to v2 - all grain', function (assert) {
    assert.expect(1);

    const request: RequestV1<string> = {
      intervals: [{ start: '2021-06-13 00:00:00.000', end: '2021-08-12 00:00:00.000' }],
      filters: [],
      dimensions: [],
      metrics: [],
      logicalTable: { table: 'tableName', timeGrain: 'all' },
      sort: [],
      having: [],
      dataSource: 'facts',
      requestVersion: 'v1',
    };

    assert.deepEqual(
      normalizeV1toV2(request, 'bardOne'),
      {
        columns: [],
        dataSource: 'bardOne',
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
      'all timeGrain is converted to filter as day grain with inclusive end date with no column'
    );
  });

  test('normalize v1 to v2 - show fields', function (assert) {
    assert.expect(2);

    const request: RequestV1<string> = {
      intervals: [],
      filters: [],
      dimensions: [{ dimension: 'multiSystemId' }],
      metrics: [],
      logicalTable: { table: 'tableName', timeGrain: 'all' },
      sort: [],
      having: [],
      dataSource: 'bardOne',
      requestVersion: 'v1',
    };

    const normalized = normalizeV1toV2(request, 'bardOne');

    const cids = normalized.columns.map((c) => c.cid);
    cids.forEach((cid, idx) => {
      assert.equal(cid?.length, 10, 'column cid has proper value');
      //remove from validation since cid value is non deterministic
      unset(normalized, `columns[${idx}].cid`);
    });

    assert.deepEqual(
      normalized,
      {
        columns: [{ type: 'dimension', field: 'multiSystemId', parameters: { field: 'id' } }],
        dataSource: 'bardOne',
        filters: [],
        limit: null,
        requestVersion: '2.0',
        sorts: [],
        table: 'tableName',
      },
      'Dimension with show tag on fields are added to the request'
    );
  });

  test('normalize v1 to v2 - default fields', function (assert) {
    assert.expect(3);

    const dimension = 'contextId';

    const request: RequestV1<string> = {
      intervals: [],
      filters: [],
      dimensions: [{ dimension }],
      metrics: [],
      logicalTable: { table: 'tableName', timeGrain: 'all' },
      sort: [],
      having: [],
      dataSource: 'bardOne',
      requestVersion: 'v1',
    };

    const normalized = normalizeV1toV2(request, 'bardOne');

    const cids = normalized.columns.map((c) => c.cid);
    cids.forEach((cid, idx) => {
      assert.equal(cid?.length, 10, 'column cid has proper value');
      //remove from validation since cid value is non deterministic
      unset(normalized, `columns[${idx}].cid`);
    });

    assert.deepEqual(
      naviMetadata.getById('dimension', dimension, 'bardOne')?.fields?.map((f) => f.name),
      ['id', 'desc', 'skip'],
      `Three dimension fields exist for ${dimension}`
    );

    assert.deepEqual(
      normalized,
      {
        columns: [{ type: 'dimension', field: dimension, parameters: { field: 'id' } }],
        dataSource: 'bardOne',
        filters: [],
        limit: null,
        requestVersion: '2.0',
        sorts: [],
        table: 'tableName',
      },
      'Dimension with multiple fields only shows id,desc by default'
    );
  });
});

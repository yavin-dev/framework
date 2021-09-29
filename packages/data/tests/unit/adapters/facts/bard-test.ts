import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender, { Server as PretenderServer, ResponseData } from 'pretender';
import config from 'ember-get-config';
import { taskFor } from 'ember-concurrency-ts';
import moment from 'moment';
import { cloneDeep } from 'lodash-es';
import type { Filter, RequestV2 } from 'navi-data/adapters/facts/interface';
import type BardFactsAdapter from 'navi-data/adapters/facts/bard';
import type { TestContext } from 'ember-test-helpers';
import type MetadataModelRegistry from 'navi-data/models/metadata/registry';
import { Grain } from 'navi-data/utils/date';

const HOST = config.navi.dataSources[0].uri;
const HOST2 = config.navi.dataSources[1].uri;

const EmptyRequest: RequestV2 = {
  table: '',
  dataSource: '',
  requestVersion: '2.0',
  limit: null,
  columns: [],
  filters: [],
  sorts: [],
};

const TestRequest: RequestV2 = {
    table: 'table1',
    dataSource: 'test',
    limit: null,
    requestVersion: '2.0',
    filters: [
      {
        field: 'table1.dateTime',
        parameters: { grain: 'grain1' },
        type: 'timeDimension',
        operator: 'bet',
        values: ['2015-01-03', '2015-01-04'],
      },
      {
        field: 'd3',
        parameters: { field: 'id' },
        type: 'dimension',
        operator: 'in',
        values: ['v1', 'v2'],
      },
      {
        field: 'd4',
        parameters: { field: 'id' },
        type: 'dimension',
        operator: 'in',
        values: ['v3', 'v4'],
      },
      {
        field: 'd5',
        parameters: { field: 'id' },
        type: 'dimension',
        operator: 'isnull',
        values: [false],
      },
      {
        field: 'm1',
        parameters: {},
        type: 'metric',
        operator: 'gt',
        values: [0],
      },
    ],
    columns: [
      {
        field: 'table1.dateTime',
        parameters: {
          grain: 'grain1',
        },
        cid: 'dt1',
        type: 'timeDimension',
      },
      {
        field: 'm1',
        parameters: {},
        cid: 'kjlasdf',
        type: 'metric',
      },
      {
        field: 'm2',
        parameters: {},
        cid: 'lkasdjf',
        type: 'metric',
      },
      {
        field: 'r',
        parameters: { p: '123', as: 'a' },
        cid: 'puioqwer',
        type: 'metric',
      },
      {
        field: 'd1',
        parameters: { field: 'id' },
        cid: 'znmxcv',
        type: 'dimension',
      },
      {
        field: 'd2',
        parameters: { field: 'desc' },
        cid: 'ipuhozxvc',
        type: 'dimension',
      },
    ],
    sorts: [],
    rollup: {
      columnCids: [],
      grandTotal: false,
    },
  },
  Response = {
    rows: [
      {
        table: 'table1',
        grain: 'grain1',
      },
    ],
    meta: {
      test: true,
    },
  },
  TestRequestWithRollup: RequestV2 = Object.assign(cloneDeep(TestRequest), {
    rollup: { columnCids: ['znmxcv', 'ipuhozxvc', 'dt1'], grandTotal: true },
  }),
  MockBardResponse: ResponseData = [200, { 'Content-Type': 'application/json' }, JSON.stringify(Response)];

let Adapter: BardFactsAdapter, Server: PretenderServer;

module('Unit | Adapter | facts/bard', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    Adapter = this.owner.lookup('adapter:facts/bard');

    //setup Pretender
    Server = new Pretender(function () {
      this.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/`, function (request) {
        if (request.queryParams.page && request.queryParams.perPage) {
          let paginatedResponse = {
            ...Response,
            meta: {
              ...Response.meta,
              pagination: {
                page: request.queryParams.page,
                perPage: request.queryParams.perPage,
              },
            },
          };
          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(paginatedResponse)];
        }

        return MockBardResponse;
      });
    });
  });

  hooks.afterEach(function () {
    //shutdown pretender
    Server.shutdown();
  });

  test('_buildDimensionsPath', function (assert) {
    assert.expect(6);

    let singleDim: RequestV2 = {
      ...EmptyRequest,
      columns: [{ field: 'd1', type: 'dimension', parameters: { field: 'id' } }],
    };
    assert.equal(
      Adapter._buildDimensionsPath(singleDim),
      '/d1;show=id',
      '_buildDimensionsPath built the correct string for a single dimension'
    );

    let manyDims: RequestV2 = {
      ...EmptyRequest,
      columns: [
        { field: 'd1', type: 'dimension', parameters: { field: 'id' } },
        { field: 'd2', type: 'dimension', parameters: { field: 'id' } },
      ],
    };
    assert.equal(
      Adapter._buildDimensionsPath(manyDims),
      '/d1;show=id/d2;show=id',
      '_buildDimensionsPath built the correct string for many dimensions'
    );

    let duplicateDims: RequestV2 = {
      ...EmptyRequest,
      columns: [
        { field: 'd1', type: 'dimension', parameters: { field: 'id' } },
        { field: 'd2', type: 'dimension', parameters: { field: 'id' } },
        { field: 'd1', type: 'dimension', parameters: { field: 'id' } },
      ],
    };
    assert.equal(
      Adapter._buildDimensionsPath(duplicateDims),
      '/d1;show=id/d2;show=id',
      '_buildDimensionsPath built the correct string for duplicate dimensions'
    );

    let multipleFields: RequestV2 = {
      ...EmptyRequest,
      columns: [
        { field: 'd1', type: 'dimension', parameters: { field: 'id' } },
        { field: 'd2', type: 'dimension', parameters: { field: 'id' } },
        { field: 'd2', type: 'dimension', parameters: { field: 'id' } },
        { field: 'd2', type: 'dimension', parameters: { field: 'key' } },
        { field: 'd1', type: 'dimension', parameters: { field: 'desc' } },
      ],
    };
    assert.equal(
      Adapter._buildDimensionsPath(multipleFields),
      '/d1;show=desc,id/d2;show=id,key',
      '_buildDimensionsPath built the correct string for duplicate dimension with different and same fields'
    );

    let noFields: RequestV2 = {
      ...EmptyRequest,
      columns: [
        { field: 'd1', type: 'dimension', parameters: {} },
        { field: 'd2', type: 'dimension', parameters: {} },
        { field: 'd2', type: 'dimension', parameters: {} },
      ],
    };
    assert.equal(
      Adapter._buildDimensionsPath(noFields),
      '/d1/d2',
      '_buildDimensionsPath built the correct string for dimensions with no field specified'
    );

    let noDims: RequestV2 = { ...EmptyRequest };
    assert.equal(
      Adapter._buildDimensionsPath(noDims),
      '',
      '_buildDimensionsPath built the correct string for no dimensions'
    );
  });

  test('_buildDateTimeParam', function (assert) {
    assert.expect(9);

    let singleInterval: RequestV2 = {
      ...EmptyRequest,
      table: 'tableName',
      filters: [
        {
          field: 'tableName.dateTime',
          type: 'timeDimension',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['2021-02-13', '2021-04-12'],
        },
      ],
    };
    assert.equal(
      Adapter._buildDateTimeParam(singleInterval),
      '2021-02-13T00:00:00.000/2021-04-13T00:00:00.000',
      '_buildDateTimeParam built the correct string for a single interval'
    );

    let differentColumnAndFilterGrain: RequestV2 = {
      ...EmptyRequest,
      columns: [
        {
          type: 'timeDimension',
          field: '.dateTime',
          parameters: { grain: 'day' },
        },
      ],
      filters: [
        {
          type: 'timeDimension',
          field: '.dateTime',
          parameters: { grain: 'week' },
          operator: 'bet',
          values: [],
        },
      ],
    };
    assert.throws(
      () => {
        Adapter._buildDateTimeParam(differentColumnAndFilterGrain);
      },
      /The requested filter timeGrain 'week', must match the column timeGrain 'day'/,
      '_buildDateTimeParam throws an error for different timeGrains requested'
    );

    let noIntervals: RequestV2 = { ...EmptyRequest };
    assert.throws(
      () => {
        Adapter._buildDateTimeParam(noIntervals);
      },
      /Exactly one '.dateTime' filter is required, you have 0/,
      '_buildDateTimeParam throws an error for missing dateTime filter'
    );

    let manyIntervals: RequestV2 = {
      ...EmptyRequest,
      table: 'tableName',
      filters: [
        {
          field: 'tableName.dateTime',
          type: 'timeDimension',
          parameters: {},
          operator: 'bet',
          values: ['start1', 'end1'],
        },
        {
          field: 'tableName.dateTime',
          type: 'timeDimension',
          parameters: {},
          operator: 'bet',
          values: ['start2', 'end2'],
        },
      ],
    };
    assert.throws(
      () => {
        Adapter._buildDateTimeParam(manyIntervals);
      },
      /Exactly one 'tableName.dateTime' filter is required, you have 2/,
      '_buildDateTimeParam throws an error for multiple datetime filters'
    );

    const singleValue = (date: string, operator: Filter['operator']): RequestV2 => ({
      ...EmptyRequest,
      table: 'tableName',
      filters: [
        {
          field: 'tableName.dateTime',
          type: 'timeDimension',
          parameters: { grain: 'isoWeek' },
          operator: operator,
          values: [date],
        },
      ],
    });

    const startDate = '2021-02-01';
    const since = singleValue(startDate, 'gte');
    assert.deepEqual(
      Adapter._buildDateTimeParam(since),
      `${startDate}/9999-12-27T00:00:00.000`,
      '_buildDateTimeParam uses far future aligned to grain for since operator'
    );

    const sinceBadDate = singleValue('fakeDate', 'gte');
    assert.throws(
      () => Adapter._buildDateTimeParam(sinceBadDate),
      /FactAdapterError: Since operator only supports datetimes, 'fakeDate' is invalid/,
      '_buildDateTimeParam throws error if start date is not a valid datetime'
    );

    const endDate = '2021-03-01';
    const before = singleValue(endDate, 'lte');
    let originalDataEpoch = config.navi.dataEpoch;
    // TODO: Remove once dataEpoch is not required
    //@ts-expect-error
    config.navi.dataEpoch = undefined;
    assert.deepEqual(
      Adapter._buildDateTimeParam(before),
      `0001-01-01T00:00:00.000/${endDate}`,
      '_buildDateTimeParam uses year 0001 aligned to grain when no dataEpoch is defined'
    );

    config.navi.dataEpoch = '1999-02-03';
    assert.deepEqual(
      Adapter._buildDateTimeParam(before),
      `1999-02-01T00:00:00.000/${endDate}`,
      '_buildDateTimeParam uses dataEpoch aligned to grain if it is defined'
    );

    const beforeBadDate = singleValue('fakeDate', 'lte');
    assert.throws(
      () => Adapter._buildDateTimeParam(beforeBadDate),
      /FactAdapterError: Before operator only supports datetimes, 'fakeDate' is invalid/,
      '_buildDateTimeParam throws error if end date is not a valid datetime'
    );
    config.navi.dataEpoch = originalDataEpoch;
  });

  test('_buildDateTimeParam all grain with macros', function (assert) {
    assert.expect(3);

    const allWithFilterGrain = (grain: Grain, values: string[]): RequestV2 => ({
      ...EmptyRequest,
      filters: [
        {
          type: 'timeDimension',
          field: '.dateTime',
          parameters: { grain },
          operator: 'bet',
          values,
        },
      ],
    });

    const request1 = allWithFilterGrain('day', ['P1D', 'current']);
    assert.strictEqual(
      Adapter._buildDateTimeParam(request1),
      `P1D/${moment.utc().startOf('day').toISOString().replace('Z', '')}`,
      '_buildDateTimeParam forces the "current" macro to a real date if the all grain is used'
    );

    const request2 = allWithFilterGrain('isoWeek', ['2020-04-20', 'next']);
    assert.strictEqual(
      Adapter._buildDateTimeParam(request2),
      `2020-04-20T00:00:00.000/${moment.utc().startOf('isoWeek').add(1, 'week').toISOString().replace('Z', '')}`,
      '_buildDateTimeParam forces the "next" macro to a real date if the all grain is used'
    );

    const request3 = allWithFilterGrain('month', ['current', 'next']);
    const currentMonth = moment.utc().startOf('month');
    assert.strictEqual(
      Adapter._buildDateTimeParam(request3),
      `${currentMonth.toISOString().replace('Z', '')}/${currentMonth.add(1, 'month').toISOString().replace('Z', '')}`,
      '_buildDateTimeParam forces the "current" and "next" macro to a real date if the all grain is used'
    );
  });

  test('_buildMetricsParam', function (assert) {
    assert.expect(5);

    let singleMetric: RequestV2 = {
      ...EmptyRequest,
      columns: [
        {
          field: 'm1',
          parameters: {},
          type: 'metric',
        },
      ],
    };
    assert.equal(
      Adapter._buildMetricsParam(singleMetric),
      'm1',
      '_buildMetricsParam built the correct string for a single metric'
    );

    let manyMetrics: RequestV2 = {
      ...EmptyRequest,
      columns: [
        {
          field: 'm1',
          parameters: {},
          type: 'metric',
        },
        {
          field: 'm2',
          parameters: {},
          type: 'metric',
        },
      ],
    };
    assert.equal(
      Adapter._buildMetricsParam(manyMetrics),
      'm1,m2',
      '_buildMetricsParam built the correct string for many metrics'
    );

    let differentParams: RequestV2 = {
      ...EmptyRequest,
      columns: [
        { field: 'm1', parameters: {}, type: 'metric' },
        { field: 'm2', parameters: {}, type: 'metric' },
        { field: 'r', parameters: { p: '123', as: 'm1' }, type: 'metric' },
        { field: 'r', parameters: { p: 'xyz', as: 'm2' }, type: 'metric' },
      ],
    };
    assert.equal(
      Adapter._buildMetricsParam(differentParams),
      'm1,m2,r(p=123),r(p=xyz)',
      '_buildMetricsParam built the correct string for different parameters'
    );

    let duplicateMetrics: RequestV2 = {
      ...EmptyRequest,
      columns: [
        { field: 'm1', parameters: {}, type: 'metric' },
        { field: 'm2', parameters: {}, type: 'metric' },
        { field: 'm1', parameters: {}, type: 'metric' },
        { field: 'r', parameters: { p: '123', as: 'm1' }, type: 'metric' },
        { field: 'r', parameters: { p: '123', as: 'm2' }, type: 'metric' },
      ],
    };
    assert.equal(
      Adapter._buildMetricsParam(duplicateMetrics),
      'm1,m2,r(p=123)',
      '_buildMetricsParam built the correct string for duplicate metrics'
    );

    let nullParams: RequestV2 = {
      ...EmptyRequest,
      columns: [
        { field: 'm1', parameters: {}, type: 'metric' },
        { field: 'm2', parameters: {}, type: 'metric' },
        { field: 'r', parameters: { p: '123', q: 'bar' }, type: 'metric' },
        //@ts-expect-error
        { field: 'r', parameters: { p: 'xyz', q: null }, type: 'metric' },
        //@ts-expect-error
        { field: 'r', parameters: { p: 'tuv', q: undefined }, type: 'metric' },
      ],
    };
    assert.equal(
      Adapter._buildMetricsParam(nullParams),
      'm1,m2,r(p=123,q=bar),r(p=xyz),r(p=tuv)',
      '_buildMetricsParam built correctly with null parameter values'
    );
  });

  test('_buildFiltersParam', function (assert) {
    assert.expect(9);

    let singleFilter: RequestV2 = {
      ...EmptyRequest,
      filters: [
        { field: 'd1', parameters: { field: 'desc' }, type: 'dimension', operator: 'in', values: ['v1', 'v2'] },
      ],
    };
    assert.equal(
      Adapter._buildFiltersParam(singleFilter),
      'd1|desc-in["v1","v2"]',
      '_buildFiltersParam built the correct string for a single filter'
    );

    let manyFilters: RequestV2 = {
      ...EmptyRequest,
      filters: [
        { field: 'd1', parameters: { field: 'desc' }, type: 'dimension', operator: 'in', values: ['v1', 'v2'] },
        { field: 'd2', parameters: { field: 'id' }, type: 'dimension', operator: 'notin', values: ['v3', 'v4'] },
      ],
    };
    assert.equal(
      Adapter._buildFiltersParam(manyFilters),
      'd1|desc-in["v1","v2"],d2|id-notin["v3","v4"]',
      '_buildFiltersParam built the correct string for many filters'
    );

    let emptyFilters = { ...EmptyRequest };
    assert.equal(
      Adapter._buildFiltersParam(emptyFilters),
      undefined,
      '_buildFiltersParam returns undefined with empty filters'
    );

    const emptyFilterValues: RequestV2 = {
      ...EmptyRequest,
      filters: [
        { field: 'd1', parameters: { field: 'desc' }, type: 'dimension', operator: 'in', values: ['v1', 'v2'] },
        { field: 'd2', parameters: { field: 'id' }, type: 'dimension', operator: 'in', values: [] },
        { field: 'd2', parameters: { field: 'id' }, type: 'dimension', operator: 'notin', values: ['v3', 'v4'] },
      ],
    };
    assert.equal(
      Adapter._buildFiltersParam(emptyFilterValues),
      'd1|desc-in["v1","v2"],d2|id-notin["v3","v4"]',
      '_buildFiltersParam skips over empty filter values'
    );

    const allEmptyFilterValues: RequestV2 = {
      ...EmptyRequest,
      filters: [
        { field: 'd1', parameters: { field: 'desc' }, type: 'dimension', operator: 'in', values: [] },
        { field: 'd2', parameters: { field: 'id' }, type: 'dimension', operator: 'in', values: [] },
        { field: 'd2', parameters: { field: 'id' }, type: 'dimension', operator: 'notin', values: [] },
      ],
    };
    assert.equal(
      Adapter._buildFiltersParam(allEmptyFilterValues),
      undefined,
      '_buildFiltersParam removes all empty filters'
    );

    let noDimensionFilters: RequestV2 = {
      ...EmptyRequest,
      filters: [{ type: 'metric', field: 'm1', parameters: {}, operator: 'in', values: [] }],
    };
    assert.equal(
      Adapter._buildFiltersParam(noDimensionFilters),
      undefined,
      '_buildFiltersParam returns undefined with only filters of non-dimension types'
    );

    let commaFilters: RequestV2 = {
      ...EmptyRequest,
      filters: [
        {
          field: 'd3',
          parameters: { field: 'id' },
          type: 'dimension',
          operator: 'in',
          values: ['with, comma', 'no comma'],
        },
      ],
    };
    assert.equal(
      Adapter._buildFiltersParam(commaFilters),
      'd3|id-in["with, comma","no comma"]',
      '_buildFiltersParam quotes values correctly with commas'
    );

    let noIdFilters: RequestV2 = {
      ...EmptyRequest,
      filters: [
        {
          field: 'd3',
          parameters: { field: 'id' },
          type: 'dimension',
          operator: 'in',
          values: ['with, comma', 'no comma'],
        },
      ],
    };
    assert.equal(
      Adapter._buildFiltersParam(noIdFilters),
      'd3|id-in["with, comma","no comma"]',
      '_buildFiltersParam defaults to "id" field'
    );

    let quoteFilters: RequestV2 = {
      ...EmptyRequest,
      filters: [
        {
          field: 'd3',
          parameters: { field: 'id' },
          type: 'dimension',
          operator: 'in',
          values: ['with "quote"', 'but why'],
        },
      ],
    };
    assert.equal(
      Adapter._buildFiltersParam(quoteFilters),
      'd3|id-in["with ""quote""","but why"]',
      '_buildFiltersParam correctly escapes " in filters'
    );
  });

  test('_buildSortParam', function (assert) {
    assert.expect(5);

    let singleSort: RequestV2 = {
      ...EmptyRequest,
      sorts: [{ type: 'metric', field: 'm1', parameters: {}, direction: 'asc' }],
    };
    assert.equal(
      Adapter._buildSortParam(singleSort),
      'm1|asc',
      '_buildSortParam built the correct string for a single sort'
    );

    let sortNoDirection: RequestV2 = {
      ...EmptyRequest,
      sorts: [
        //@ts-expect-error
        { type: 'metric', field: 'm1' },
      ],
    };
    assert.equal(
      Adapter._buildSortParam(sortNoDirection),
      'm1|desc',
      '_buildSortParam uses desc as default sort direction'
    );

    let manySorts: RequestV2 = {
      ...EmptyRequest,
      sorts: [
        { type: 'metric', parameters: {}, field: 'm1', direction: 'asc' },
        { type: 'metric', parameters: {}, field: 'm2', direction: 'asc' },
      ],
    };
    assert.equal(
      Adapter._buildSortParam(manySorts),
      'm1|asc,m2|asc',
      '_buildSortParam built the correct string for multiple sorts'
    );

    let emptySorts = { ...EmptyRequest };
    assert.equal(Adapter._buildSortParam(emptySorts), undefined, '_buildSortParam returns undefined with empty sort');

    let invalidSort: RequestV2 = {
      ...EmptyRequest,
      sorts: [
        //@ts-expect-error
        { type: 'metric', field: 'valid1', parameters: {} },
        { type: 'metric', field: 'valid2', parameters: {}, direction: 'asc' },
        { type: 'metric', field: 'valid3', parameters: {}, direction: 'desc' },
        //@ts-expect-error
        { type: 'metric', field: 'invalid', parameters: {}, direction: 'foo' },
      ],
    };
    assert.throws(
      () => {
        Adapter._buildSortParam(invalidSort);
      },
      /'foo' must be a valid sort direction \(desc,asc\)/,
      '_buildSortParam throws error when invalid sort is given'
    );
  });

  test('_buildRollupParam', function (assert) {
    assert.expect(3);

    assert.equal(Adapter._buildRollupParam(EmptyRequest), '', 'Returns empty string with no rollup property');

    assert.equal(Adapter._buildRollupParam(TestRequest), '', 'Returns empty string with empty columns');

    assert.equal(
      Adapter._buildRollupParam(TestRequestWithRollup),
      'dateTime,d1,d2',
      'Returns dimension name in correct order comma separated'
    );
  });

  test('_buildHavingParam', function (assert) {
    let singleHaving: RequestV2 = {
      ...EmptyRequest,
      filters: [{ field: 'm1', type: 'metric', parameters: {}, operator: 'gt', values: [0] }],
    };
    assert.equal(
      Adapter._buildHavingParam(singleHaving),
      'm1-gt[0]',
      '_buildHavingParam built the correct string for a single having'
    );

    let manyHavings: RequestV2 = {
      ...EmptyRequest,
      filters: [
        { field: 'm1', type: 'metric', parameters: {}, operator: 'gt', values: [0] },
        { field: 'm2', type: 'metric', parameters: {}, operator: 'lte', values: [10] },
      ],
    };
    assert.equal(
      Adapter._buildHavingParam(manyHavings),
      'm1-gt[0],m2-lte[10]',
      '_buildHavingParam built the correct string for multiple having'
    );

    let emptyHavings = { ...EmptyRequest };
    assert.equal(
      Adapter._buildHavingParam(emptyHavings),
      undefined,
      '_buildHavingParam returns undefined with empty having'
    );

    const emptyFilterValues: RequestV2 = {
      ...EmptyRequest,
      filters: [
        { field: 'm1', type: 'metric', parameters: {}, operator: 'gt', values: [0] },
        { field: 'm2', type: 'metric', parameters: {}, operator: 'gt', values: [] },
        { field: 'm3', type: 'metric', parameters: {}, operator: 'lte', values: [10] },
      ],
    };
    assert.equal(
      Adapter._buildHavingParam(emptyFilterValues),
      'm1-gt[0],m3-lte[10]',
      '_buildHavingParam skips empty filter values'
    );

    const allEmptyFilterValues: RequestV2 = {
      ...EmptyRequest,
      filters: [
        { field: 'm1', type: 'metric', parameters: {}, operator: 'gt', values: [] },
        { field: 'm2', type: 'metric', parameters: {}, operator: 'gt', values: [] },
        { field: 'm3', type: 'metric', parameters: {}, operator: 'lte', values: [] },
      ],
    };
    assert.equal(
      Adapter._buildHavingParam(allEmptyFilterValues),
      undefined,
      '_buildHavingParam skips all empty filter values'
    );

    let onlyDimFilters: RequestV2 = {
      ...EmptyRequest,
      filters: [{ field: 'foo', type: 'dimension', parameters: { field: 'id' }, operator: 'gt', values: [0] }],
    };
    assert.equal(
      Adapter._buildHavingParam(onlyDimFilters),
      undefined,
      '_buildHavingParam returns undefined with only dimension filters in request'
    );

    let havingValueArray: RequestV2 = {
      ...EmptyRequest,
      filters: [{ field: 'm1', type: 'metric', parameters: {}, operator: 'gt', values: [1, 2, 3] }],
    };
    assert.equal(
      Adapter._buildHavingParam(havingValueArray),
      'm1-gt[1,2,3]',
      '_buildHavingParam built the correct string when having a `values` array'
    );

    const havingMetricWithSingleParam: RequestV2 = {
      ...EmptyRequest,
      filters: [
        {
          field: 'm1',
          type: 'metric',
          parameters: { param: 'val' },
          operator: 'gt',
          values: [1, 2, 3],
        },
      ],
    };
    assert.equal(
      Adapter._buildHavingParam(havingMetricWithSingleParam),
      'm1(param=val)-gt[1,2,3]',
      '_buildHavingParam built the correct string when having a `values` array'
    );

    const havingMetricWithMultipleParams: RequestV2 = {
      ...EmptyRequest,
      filters: [
        {
          field: 'm1',
          type: 'metric',
          parameters: { trend: 'none', aggregation: 'dayAvg' },
          operator: 'gt',
          values: [1, 2, 3],
        },
      ],
    };
    assert.equal(
      Adapter._buildHavingParam(havingMetricWithMultipleParams),
      'm1(aggregation=dayAvg,trend=none)-gt[1,2,3]',
      '_buildHavingParam built the correct string when having a `values` array'
    );

    const havingMetricsWithMultipleParams: RequestV2 = {
      ...EmptyRequest,
      filters: [
        {
          field: 'm1',
          type: 'metric',
          parameters: { trend: 'none', aggregation: 'dayAvg' },
          operator: 'gt',
          values: [100],
        },
        {
          field: 'm1',
          type: 'metric',
          parameters: { trend: 'DoD', aggregation: 'dayAvg' },
          operator: 'gt',
          values: [0.1],
        },
      ],
    };
    assert.equal(
      Adapter._buildHavingParam(havingMetricsWithMultipleParams),
      'm1(aggregation=dayAvg,trend=none)-gt[100],m1(aggregation=dayAvg,trend=DoD)-gt[0.1]',
      '_buildHavingParam built the correct string when having a `values` array'
    );
  });

  test('_buildURLPath', function (assert) {
    assert.expect(7);

    assert.equal(
      Adapter._buildURLPath({ ...EmptyRequest, table: 'tableName', dataSource: 'bardOne' }),
      'https://data.naviapp.io/v1/data/tableName/all/',
      '_buildURLPath assumes the all timeGrain exists if table metadata is not loaded'
    );

    const originalNaviMetadata = Adapter.naviMetadata;
    //@ts-ignore
    Adapter.naviMetadata = {
      getById<K extends keyof MetadataModelRegistry>(
        _type: K,
        _id: string,
        _dataSourceName: string
      ): MetadataModelRegistry[K] {
        return ({ hasAllGrain: false } as unknown) as MetadataModelRegistry[K];
      },
    };
    assert.throws(
      () => {
        Adapter._buildURLPath({ ...EmptyRequest, table: 'tableName', dataSource: 'bardOne' });
      },
      /FactAdapterError: Table 'tableName' requires requesting 'Date Time' column exactly once./,
      '_buildURLPath throws an error for missing dateTime column for table without all grain'
    );

    assert.equal(
      Adapter._buildURLPath({
        ...EmptyRequest,
        table: 'tableName',
        dataSource: 'bardOne',
        columns: [{ type: 'timeDimension', field: 'tableName.dateTime', parameters: { grain: 'grain' } }],
      }),
      'https://data.naviapp.io/v1/data/tableName/grain/',
      '_buildURLPath does not throw error for table without all grain that specifies a grain to use'
    );
    Adapter.naviMetadata = originalNaviMetadata;

    const twoDateTime: RequestV2 = {
      ...EmptyRequest,
      columns: [
        { field: '.dateTime', type: 'timeDimension', parameters: { grain: 'day' } },
        { field: '.dateTime', type: 'timeDimension', parameters: { grain: 'week' } },
      ],
      dataSource: 'bardOne',
    };

    assert.throws(
      () => {
        Adapter._buildURLPath(twoDateTime);
      },
      /FactAdapterError: Requesting multiple 'Date Time' grains is not supported. You requested \[day,week\]/,
      '_buildURLPath throws an error when more than one grain is requested'
    );

    assert.equal(
      Adapter._buildURLPath(TestRequest),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/`,
      '_buildURLPath correctly built the URL path for the provided request when a host is not configured'
    );

    assert.equal(
      Adapter._buildURLPath(TestRequest, { dataSourceName: 'bardTwo' }),
      `${HOST2}/v1/data/table1/grain1/d1;show=id/d2;show=desc/`,
      '_buildURLPath correctly built the URL path for the provided request when a host is configured'
    );

    assert.equal(
      Adapter._buildURLPath(TestRequestWithRollup),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/__rollupMask/`,
      '_buildURLPath requests __rollupMask dimension when rollup is present'
    );
  });

  test('_buildQuery', function (assert) {
    assert.expect(6);

    assert.deepEqual(
      Adapter._buildQuery(TestRequest),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
      },
      '_buildQuery correctly built the query object for the provided request'
    );

    let noFiltersAndNoHavings: RequestV2 = {
      ...TestRequest,
      filters: [
        {
          field: 'table1.dateTime',
          parameters: { grain: 'grain1' },
          type: 'timeDimension',
          operator: 'bet',
          values: ['2015-01-03', '2015-01-04'],
        },
      ],
    };
    assert.deepEqual(
      Adapter._buildQuery(noFiltersAndNoHavings),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        metrics: 'm1,m2,r(p=123)',
        format: 'json',
      },
      '_buildQuery correctly built the query object for a request with no metric/dimension filters'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, { format: 'jsonApi' }),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'jsonApi',
      },
      '_buildQuery sets non default format if format is set in the options object'
    );

    let sortRequest: RequestV2 = {
      ...TestRequest,
      sorts: [{ type: 'metric', field: 'm1', parameters: {}, direction: 'desc' }],
    };
    assert.deepEqual(
      Adapter._buildQuery(sortRequest),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        format: 'json',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        sort: 'm1|desc',
      },
      '_buildQuery correctly built the query object for a request with sort'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, { cache: false }),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
        _cache: false,
      },
      '_buildQuery correctly built the query object for a request without caching'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequestWithRollup),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        rollupTo: 'dateTime,d1,d2',
        rollupGrandTotal: true,
        format: 'json',
      },
      '_buildQuery adds correct rollup params'
    );
  });

  test('_buildQuery with catchAll Query Params', function (assert) {
    assert.expect(1);

    let options = {
      page: 1,
      perPage: 100,
      queryParams: {
        perPage: 150,
        topN: 150,
      },
    };

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, options),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
        page: 1,
        perPage: 150,
        topN: 150,
      },
      '_buildQuery correctly built the query object for a request catching all unsupported query params'
    );
  });

  test('_buildQuery with pagination', function (assert) {
    assert.expect(4);

    assert.deepEqual(
      Adapter._buildQuery(TestRequest),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
      },
      '_buildQuery correctly builds the query object for the provided request ' +
        'without any pagination options when options passed in are undefined'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, {}),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
      },
      '_buildQuery correctly builds the query object for the provided request ' +
        'without any pagination options when options passed in are empty'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, { page: 1, perPage: 100 }),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
        page: 1,
        perPage: 100,
      },
      '_buildQuery correctly builds query with pagination options when options are defined'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, { format: 'csv' }),
      {
        dateTime: '2015-01-03/2015-01-04T00:00:00.000',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'csv',
      },
      '_buildQuery correctly builds query with provided format setting'
    );
  });

  test('urlForFindQuery', function (assert) {
    assert.expect(7);

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequest)),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&format=json`,
      'urlForFindQuery correctly built the URL for the provided request'
    );

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequest, { format: 'csv' })),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&format=csv`,
      'urlForFindQuery correctly built the URL for the provided request with the format option'
    );

    let onlyDateFilter: RequestV2 = {
      ...TestRequest,
      filters: [
        {
          field: 'table1.dateTime',
          parameters: { grain: 'grain1' },
          type: 'timeDimension',
          operator: 'bet',
          values: ['2015-01-03', '2015-01-04'],
        },
      ],
    };
    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(onlyDateFilter)),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&format=json`,
      'urlForFindQuery correctly built the URL for a request with no filters'
    );

    let requestWithSort: RequestV2 = {
      ...TestRequest,
      filters: [
        {
          field: 'table1.dateTime',
          parameters: { grain: 'grain1' },
          type: 'timeDimension',
          operator: 'bet',
          values: ['2015-01-03', '2015-01-04'],
        },
      ],
      sorts: [
        {
          type: 'metric',
          field: 'm1',
          parameters: {},
          direction: 'desc',
        },
        {
          type: 'metric',
          field: 'm2',
          parameters: {},
          direction: 'desc',
        },
      ],
    };
    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(requestWithSort)),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&sort=m1|desc,m2|desc&format=json`,
      'urlForFindQuery correctly built the URL for a request with sort'
    );

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequest, { cache: false })),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&format=json&_cache=false`,
      'urlForFindQuery correctly built the URL for the provided request with the cache option'
    );

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequest, { dataSourceName: 'bardTwo' })),
      `${HOST2}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&format=json`,
      'uriForFindQuery renders alternative host name if option is given'
    );

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequestWithRollup)),
      HOST +
        '/v1/data/table1/grain1/d1;show=id/d2;show=desc/__rollupMask/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&rollupTo=dateTime,d1,d2&rollupGrandTotal=true&format=json',
      'urlForFindQuery correctly built the URL for the provided request with the rollup is enabled'
    );
  });

  test('urlForDownloadQuery', async function (assert) {
    assert.expect(6);
    assert.equal(
      decodeURIComponent(await taskFor(Adapter.urlForDownloadQuery).perform(TestRequest)),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&format=json`,
      'urlForDownloadQuery correctly built the URL for the provided request'
    );

    assert.equal(
      decodeURIComponent(await taskFor(Adapter.urlForDownloadQuery).perform(TestRequest, { format: 'csv' })),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&format=csv`,
      'urlForDownloadQuery correctly built the URL for the provided request with the format option'
    );

    let onlyDateFilter: RequestV2 = {
      ...TestRequest,
      filters: [
        {
          field: 'table1.dateTime',
          parameters: { grain: 'grain1' },
          type: 'timeDimension',
          operator: 'bet',
          values: ['2015-01-03', '2015-01-04'],
        },
      ],
    };
    assert.equal(
      decodeURIComponent(await taskFor(Adapter.urlForDownloadQuery).perform(onlyDateFilter)),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&format=json`,
      'urlForDownloadQuery correctly built the URL for a request with only date filter'
    );

    let requestWithSort: RequestV2 = {
      ...TestRequest,
      filters: [
        {
          field: 'table1.dateTime',
          parameters: { grain: 'grain1' },
          type: 'timeDimension',
          operator: 'bet',
          values: ['2015-01-03', '2015-01-04'],
        },
      ],
      sorts: [
        { type: 'metric', field: 'm1', parameters: {}, direction: 'desc' },
        { type: 'metric', field: 'm2', parameters: {}, direction: 'desc' },
      ],
    };
    assert.equal(
      decodeURIComponent(await taskFor(Adapter.urlForDownloadQuery).perform(requestWithSort)),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&sort=m1|desc,m2|desc&format=json`,
      'urlForDownloadQuery correctly built the URL for a request with sort'
    );

    assert.equal(
      decodeURIComponent(await taskFor(Adapter.urlForDownloadQuery).perform(TestRequest, { cache: false })),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&format=json&_cache=false`,
      'urlForDownloadQuery correctly built the URL for the provided request with the cache option'
    );

    assert.equal(
      decodeURIComponent(
        await taskFor(Adapter.urlForDownloadQuery).perform(TestRequest, { dataSourceName: 'bardTwo' })
      ),
      `${HOST2}/v1/data/table1/grain1/d1;show=id/d2;show=desc/?dateTime=2015-01-03/2015-01-04T00:00:00.000&metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&format=json`,
      'urlForDownloadQuery renders alternative host name if option is given'
    );
  });

  test('fetchDataForRequest', function (assert) {
    assert.expect(1);

    return taskFor(Adapter.fetchDataForRequest)
      .perform(TestRequest)
      .then(function (result) {
        return assert.deepEqual(result, Response, 'Ajax GET returns the response object for TEST Request');
      });
  });

  test('fetchDataForRequest with pagination options', async function (assert) {
    assert.expect(1);
    const result = await taskFor(Adapter.fetchDataForRequest).perform(TestRequest, {
      page: 1,
      perPage: 100,
    });

    assert.deepEqual(
      result,
      {
        rows: [{ table: 'table1', grain: 'grain1' }],
        meta: {
          pagination: {
            page: '1',
            perPage: '100',
          },
          test: true,
        },
      },
      'Ajax GET returns the response object for TEST Request'
    );
  });

  test('fetchDataForRequest with client id options', async function (assert) {
    assert.expect(2);

    // Setting up assert for default clientId
    Server.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/`, (request) => {
      assert.equal(request.requestHeaders.clientid, 'UI', 'Client id defaults to "UI"');

      return MockBardResponse;
    });

    // Sending request for default clientId
    await taskFor(Adapter.fetchDataForRequest).perform(TestRequest);
    // Setting up assert for provided clientId
    Server.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/`, (request1) => {
      assert.equal(request1.requestHeaders.clientid, 'test id', 'Client id is set to value given in options');

      return MockBardResponse;
    });
    await taskFor(Adapter.fetchDataForRequest).perform(TestRequest, {
      clientId: 'test id',
    });
  });

  test('fetchDataForRequest with custom headers', async function (assert) {
    assert.expect(2);

    Server.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=desc/`, (request) => {
      assert.equal(request.requestHeaders.foo, 'bar', 'custom header `foo` was sent with the request');

      assert.equal(request.requestHeaders.baz, 'qux', 'custom header `baz` was sent with the request');

      return MockBardResponse;
    });

    await taskFor(Adapter.fetchDataForRequest).perform(TestRequest, {
      customHeaders: {
        foo: 'bar',
        baz: 'qux',
      },
    });
  });

  test('fetchDataForRequest with alternative datasource', async function (assert) {
    assert.expect(1);

    Server.get(`${HOST2}/v1/data/table1/grain1/d1;show=id/d2;show=desc/`, (request) => {
      assert.ok(request.responseURL.startsWith(HOST2), 'Alternative host was accessed');

      return MockBardResponse;
    });

    await taskFor(Adapter.fetchDataForRequest).perform(TestRequest, { dataSourceName: 'bardTwo' });
  });
});

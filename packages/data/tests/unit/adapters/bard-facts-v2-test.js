import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';
import config from 'ember-get-config';
import { assign } from '@ember/polyfills';

const HOST = config.navi.dataSources[0].uri;
const HOST2 = config.navi.dataSources[1].uri;

const TestRequest = {
    table: 'table1',
    limit: null,
    requestVersion: '2.0',
    filters: [
      {
        field: 'dateTime',
        parameters: {},
        type: 'timeDimension',
        operator: 'bet',
        values: ['2015-01-03', '2015-01-04']
      },
      {
        field: 'd3',
        parameters: {},
        type: 'dimension',
        operator: 'in',
        values: ['v1', 'v2']
      },
      {
        field: 'd4',
        parameters: {},
        type: 'dimension',
        operator: 'in',
        values: ['v3', 'v4']
      },
      {
        field: 'd5',
        parameters: {},
        type: 'dimension',
        operator: 'notnull',
        values: ['']
      },
      {
        field: 'm1',
        parameters: {},
        type: 'metric',
        operator: 'gt',
        values: [0]
      }
    ],
    columns: [
      {
        field: 'dateTime',
        parameters: {
          grain: 'grain1'
        },
        type: 'timeDimension'
      },
      {
        field: 'm1',
        parameters: {},
        type: 'metric'
      },
      {
        field: 'm2',
        parameters: {},
        type: 'metric'
      },
      {
        field: 'r',
        parameters: { p: '123', as: 'a' },
        type: 'metric'
      },
      {
        field: 'd1',
        parameters: {},
        type: 'dimension'
      },
      {
        field: 'd2',
        parameters: {},
        type: 'dimension'
      }
    ],
    sorts: []
  },
  Response = {
    rows: [
      {
        table: 'table1',
        grain: 'grain1'
      }
    ],
    meta: {
      test: true
    }
  },
  MockBardResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify(Response)];

let Adapter,
  Server,
  aliasFunction = alias => (alias === 'a' ? 'r(p=123)' : alias);

module('Unit | Bard Facts V2 Adapter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Adapter = this.owner.lookup('adapter:bard-facts-v2');

    //setup Pretender
    Server = new Pretender(function() {
      this.get(`${HOST}/v1/data/table1/grain1/d1/d2/`, function(request) {
        if (request.queryParams.page && request.queryParams.perPage) {
          let paginatedResponse = assign({}, Response);
          paginatedResponse.meta.pagination = {
            page: request.queryParams.page,
            perPage: request.queryParams.perPage
          };
          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(paginatedResponse)];
        }

        return MockBardResponse;
      });
    });
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  test('_buildDimensionsPath', function(assert) {
    assert.expect(4);

    let singleDim = {
      columns: [{ field: 'd1', type: 'dimension', parameters: {} }]
    };
    assert.equal(
      Adapter._buildDimensionsPath(singleDim),
      '/d1',
      '_buildDimensionsPath built the correct string for a single dimension'
    );

    let manyDims = {
      columns: [
        { field: 'd1', type: 'dimension', parameters: {} },
        { field: 'd2', type: 'dimension', parameters: {} }
      ]
    };
    assert.equal(
      Adapter._buildDimensionsPath(manyDims),
      '/d1/d2',
      '_buildDimensionsPath built the correct string for many dimensions'
    );

    let duplicateDims = {
      columns: [
        { field: 'd1', type: 'dimension', parameters: {} },
        { field: 'd2', type: 'dimension', parameters: {} },
        { field: 'd1', type: 'dimension', parameters: {} }
      ]
    };
    assert.equal(
      Adapter._buildDimensionsPath(duplicateDims),
      '/d1/d2',
      '_buildDimensionsPath built the correct string for duplicate dimensions'
    );

    let noDims = {};
    assert.equal(
      Adapter._buildDimensionsPath(noDims),
      '',
      '_buildDimensionsPath built the correct string for no dimensions'
    );
  });

  test('_buildDateTimeParam', function(assert) {
    assert.expect(2);

    let singleInterval = {
      filters: [
        {
          field: 'dateTime',
          parameters: {},
          operator: 'bet',
          values: ['start', 'end']
        }
      ]
    };
    assert.equal(
      Adapter._buildDateTimeParam(singleInterval),
      'start/end',
      '_buildDateTimeParam built the correct string for a single interval'
    );

    let manyIntervals = {
      filters: [
        {
          field: 'dateTime',
          parameters: {},
          operator: 'bet',
          values: ['start1', 'end1']
        },
        {
          field: 'dateTime',
          parameters: {},
          operator: 'bet',
          values: ['start2', 'end2']
        }
      ]
    };
    assert.equal(
      Adapter._buildDateTimeParam(manyIntervals),
      'start1/end1,start2/end2',
      '_buildDateTimeParam built the correct string for many intervals'
    );
  });

  test('_buildMetricsParam', function(assert) {
    assert.expect(5);

    let singleMetric = {
      columns: [
        {
          field: 'm1',
          parameters: {},
          type: 'metric'
        }
      ]
    };
    assert.equal(
      Adapter._buildMetricsParam(singleMetric),
      'm1',
      '_buildMetricsParam built the correct string for a single metric'
    );

    let manyMetrics = {
      columns: [
        {
          field: 'm1',
          parameters: {},
          type: 'metric'
        },
        {
          field: 'm2',
          parameters: {},
          type: 'metric'
        }
      ]
    };
    assert.equal(
      Adapter._buildMetricsParam(manyMetrics),
      'm1,m2',
      '_buildMetricsParam built the correct string for many metrics'
    );

    let differentParams = {
      columns: [
        { field: 'm1', parameters: {}, type: 'metric' },
        { field: 'm2', parameters: {}, type: 'metric' },
        { field: 'r', parameters: { p: '123', as: 'm1' }, type: 'metric' },
        { field: 'r', parameters: { p: 'xyz', as: 'm2' }, type: 'metric' }
      ]
    };
    assert.equal(
      Adapter._buildMetricsParam(differentParams),
      'm1,m2,r(p=123),r(p=xyz)',
      '_buildMetricsParam built the correct string for different parameters'
    );

    let duplicateMetrics = {
      columns: [
        { field: 'm1', parameters: {}, type: 'metric' },
        { field: 'm2', parameters: {}, type: 'metric' },
        { field: 'm1', parameters: {}, type: 'metric' },
        { field: 'r', parameters: { p: '123', as: 'm1' }, type: 'metric' },
        { field: 'r', parameters: { p: '123', as: 'm2' }, type: 'metric' }
      ]
    };
    assert.equal(
      Adapter._buildMetricsParam(duplicateMetrics),
      'm1,m2,r(p=123)',
      '_buildMetricsParam built the correct string for duplicate metrics'
    );

    let nullParams = {
      columns: [
        { field: 'm1', parameters: {}, type: 'metric' },
        { field: 'm2', parameters: {}, type: 'metric' },
        { field: 'r', parameters: { p: '123', q: 'bar' }, type: 'metric' },
        { field: 'r', parameters: { p: 'xyz', q: null }, type: 'metric' },
        { field: 'r', parameters: { p: 'tuv', q: undefined }, type: 'metric' }
      ]
    };
    assert.equal(
      Adapter._buildMetricsParam(nullParams),
      'm1,m2,r(p=123,q=bar),r(p=xyz),r(p=tuv)',
      '_buildMetricsParam built correctly with null parameter values'
    );
  });

  test('_buildFiltersParam', function(assert) {
    assert.expect(7);

    let singleFilter = {
      filters: [{ field: 'd1.desc', parameters: {}, type: 'dimension', operator: 'in', values: ['v1', 'v2'] }]
    };
    assert.equal(
      Adapter._buildFiltersParam(singleFilter),
      'd1|desc-in["v1","v2"]',
      '_buildFiltersParam built the correct string for a single filter'
    );

    let manyFilters = {
      filters: [
        { field: 'd1.desc', parameters: {}, type: 'dimension', operator: 'in', values: ['v1', 'v2'] },
        { field: 'd2.id', parameters: {}, type: 'dimension', operator: 'notin', values: ['v3', 'v4'] }
      ]
    };
    assert.equal(
      Adapter._buildFiltersParam(manyFilters),
      'd1|desc-in["v1","v2"],d2|id-notin["v3","v4"]',
      '_buildFiltersParam built the correct string for many filters'
    );

    let emptyFilters = { filters: [] };
    assert.equal(
      Adapter._buildFiltersParam(emptyFilters),
      undefined,
      '_buildFiltersParam returns undefined with empty filters'
    );

    let noDimensionFilters = { filters: [{ type: 'metric' }] };
    assert.equal(
      Adapter._buildFiltersParam(noDimensionFilters),
      undefined,
      '_buildFiltersParam returns undefined with only filters of non-dimension types'
    );

    let commaFilters = {
      filters: [
        { field: 'd3.id', parameters: {}, type: 'dimension', operator: 'in', values: ['with, comma', 'no comma'] }
      ]
    };
    assert.equal(
      Adapter._buildFiltersParam(commaFilters),
      'd3|id-in["with, comma","no comma"]',
      '_buildFiltersParam quotes values correctly with commas'
    );

    let noIdFilters = {
      filters: [{ field: 'd3', parameters: {}, type: 'dimension', operator: 'in', values: ['with, comma', 'no comma'] }]
    };
    assert.equal(
      Adapter._buildFiltersParam(noIdFilters),
      'd3|id-in["with, comma","no comma"]',
      '_buildFiltersParam defaults to "id" field'
    );

    let quoteFilters = {
      filters: [
        { field: 'd3.id', parameters: {}, type: 'dimension', operator: 'in', values: ['with "quote"', 'but why'] }
      ]
    };
    assert.equal(
      Adapter._buildFiltersParam(quoteFilters),
      'd3|id-in["with ""quote""","but why"]',
      '_buildFiltersParam correctly escapes " in filters'
    );
  });

  test('_buildSortParam', function(assert) {
    assert.expect(7);

    let singleSort = {
      sorts: [
        {
          field: 'm1',
          parameters: {},
          direction: 'asc'
        }
      ]
    };
    assert.equal(
      Adapter._buildSortParam(singleSort),
      'm1|asc',
      '_buildSortParam built the correct string for a single sort'
    );

    let sortNoDirection = {
      sorts: [
        {
          field: 'm1'
        }
      ]
    };
    assert.equal(
      Adapter._buildSortParam(sortNoDirection),
      'm1|desc',
      '_buildSortParam uses desc as default sort direction'
    );

    let manySorts = {
      sorts: [
        {
          field: 'm1',
          direction: 'asc'
        },
        {
          field: 'm2',
          direction: 'asc'
        }
      ]
    };
    assert.equal(
      Adapter._buildSortParam(manySorts),
      'm1|asc,m2|asc',
      '_buildSortParam built the correct string for multiple sorts'
    );

    assert.equal(
      Adapter._buildSortParam(
        {
          sorts: [
            {
              field: 'a',
              direction: 'asc'
            }
          ]
        },
        aliasFunction
      ),
      'r(p=123)|asc',
      'sort param with aliases work'
    );

    assert.equal(
      Adapter._buildSortParam(
        {
          sorts: [
            {
              field: 'a',
              direction: 'asc'
            },
            {
              field: 'm1',
              direction: 'desc'
            }
          ]
        },
        aliasFunction
      ),
      'r(p=123)|asc,m1|desc',
      'sort param with aliases mixed with non aliases work'
    );

    let emptySorts = { sorts: [] };
    assert.equal(Adapter._buildSortParam(emptySorts), undefined, '_buildSortParam returns undefined with empty sort');

    let invalidSort = {
      sorts: [
        { field: 'valid1' },
        { field: 'valid2', direction: 'asc' },
        { field: 'valid3', direction: 'desc' },
        { field: 'invalid', direction: 'foo' }
      ]
    };
    assert.throws(
      () => {
        Adapter._buildSortParam(invalidSort);
      },
      /'foo' must be a valid sort direction \(desc,asc\)/,
      '_buildSortParam throws error when invalid sort is given'
    );
  });

  test('_buildHavingParam', function(assert) {
    assert.expect(6);

    let singleHaving = {
      filters: [
        {
          field: 'm1',
          type: 'metric',
          operator: 'gt',
          values: [0]
        }
      ]
    };
    assert.equal(
      Adapter._buildHavingParam(singleHaving),
      'm1-gt[0]',
      '_buildHavingParam built the correct string for a single having'
    );

    let manyHavings = {
      filters: [
        {
          field: 'm1',
          type: 'metric',
          operator: 'gt',
          values: [0]
        },
        {
          field: 'm2',
          type: 'metric',
          operator: 'lte',
          values: [10]
        }
      ]
    };
    assert.equal(
      Adapter._buildHavingParam(manyHavings),
      'm1-gt[0],m2-lte[10]',
      '_buildHavingParam built the correct string for multiple having'
    );

    let emptyHavings = { filters: [] };
    assert.equal(
      Adapter._buildHavingParam(emptyHavings),
      undefined,
      '_buildHavingParam returns undefined with empty having'
    );

    let onlyDimFilters = { filters: [{ field: 'foo', type: 'dimension', operator: 'gt', values: [0] }] };
    assert.equal(
      Adapter._buildHavingParam(onlyDimFilters),
      undefined,
      '_buildHavingParam returns undefined with only dimension filters in request'
    );

    let havingValueArray = {
      filters: [
        {
          field: 'm1',
          type: 'metric',
          operator: 'gt',
          values: [1, 2, 3]
        }
      ]
    };
    assert.equal(
      Adapter._buildHavingParam(havingValueArray),
      'm1-gt[1,2,3]',
      '_buildHavingParam built the correct string when having a `values` array'
    );

    let aliasedHaving = {
      filters: [
        {
          field: 'm1',
          type: 'metric',
          operator: 'gt',
          values: [1, 2, 3]
        },
        {
          field: 'a',
          type: 'metric',
          operator: 'lt',
          values: [50]
        }
      ]
    };

    assert.equal(
      Adapter._buildHavingParam(aliasedHaving, aliasFunction),
      'm1-gt[1,2,3],r(p=123)-lt[50]',
      '_buildHavingParam built the correct string when having a `values` array'
    );
  });

  test('_buildURLPath', function(assert) {
    assert.expect(2);

    assert.equal(
      Adapter._buildURLPath(TestRequest),
      `${HOST}/v1/data/table1/grain1/d1/d2/`,
      '_buildURLPath correctly built the URL path for the provided request when a host is not configured'
    );

    assert.equal(
      Adapter._buildURLPath(TestRequest, { dataSourceName: 'blockhead' }),
      `${HOST2}/v1/data/table1/grain1/d1/d2/`,
      '_buildURLPath correctly built the URL path for the provided request when a host is configured'
    );
  });

  test('_buildQuery', function(assert) {
    assert.expect(7);

    assert.deepEqual(
      Adapter._buildQuery(TestRequest),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json'
      },
      '_buildQuery correctly built the query object for the provided request'
    );

    let noFiltersAndNoHavings = assign({}, TestRequest, {
      filters: [
        {
          field: 'dateTime',
          parameters: {},
          type: 'timeDimension',
          operator: 'bet',
          values: ['2015-01-03', '2015-01-04']
        }
      ]
    });
    assert.deepEqual(
      Adapter._buildQuery(noFiltersAndNoHavings),
      {
        dateTime: '2015-01-03/2015-01-04',
        metrics: 'm1,m2,r(p=123)',
        format: 'json'
      },
      '_buildQuery correctly built the query object for a request with no filters and no having'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, { format: 'jsonApi' }),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'jsonApi'
      },
      '_buildQuery sets non default format if format is set in the options object'
    );

    let sortRequest = assign({}, TestRequest, { sorts: [{ field: 'm1' }] });
    assert.deepEqual(
      Adapter._buildQuery(sortRequest),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        format: 'json',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        sort: 'm1|desc'
      },
      '_buildQuery correctly built the query object for a request with sort'
    );

    sortRequest = assign({}, TestRequest, { sorts: [{ field: 'a' }] });
    assert.deepEqual(
      Adapter._buildQuery(sortRequest),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        format: 'json',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        sort: 'r(p=123)|desc'
      },
      '_buildQuery correctly built the query object for an aliased with sort'
    );

    const aliasedHaving = {
      field: 'a',
      type: 'metric',
      operator: 'lt',
      values: [50]
    };
    const havingRequest = assign({}, TestRequest, {
      filters: assign([], TestRequest.filters).concat(aliasedHaving)
    });

    assert.deepEqual(
      Adapter._buildQuery(havingRequest),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        format: 'json',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0],r(p=123)-lt[50]'
      },
      '_buildQuery correctly built the query object for an aliased having'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, { cache: false }),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
        _cache: false
      },
      '_buildQuery correctly built the query object for a request without caching'
    );
  });

  test('_buildQuery with catchAll Query Params', function(assert) {
    assert.expect(1);

    let options = {
      page: 1,
      perPage: 100,
      queryParams: {
        perPage: 150,
        topN: 150
      }
    };

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, options),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
        page: 1,
        perPage: 150,
        topN: 150
      },
      '_buildQuery correctly built the query object for a request catching all unsupported query params'
    );
  });

  test('_buildQuery with pagination', function(assert) {
    assert.expect(4);

    assert.deepEqual(
      Adapter._buildQuery(TestRequest),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json'
      },
      '_buildQuery correctly builds the query object for the provided request ' +
        'without any pagination options when options passed in are undefined'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, {}),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json'
      },
      '_buildQuery correctly builds the query object for the provided request ' +
        'without any pagination options when options passed in are empty'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, { page: 1, perPage: 100 }),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'json',
        page: 1,
        perPage: 100
      },
      '_buildQuery correctly builds query with pagination options when options are defined'
    );

    assert.deepEqual(
      Adapter._buildQuery(TestRequest, { format: 'csv' }),
      {
        dateTime: '2015-01-03/2015-01-04',
        filters: 'd3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notnull[""]',
        metrics: 'm1,m2,r(p=123)',
        having: 'm1-gt[0]',
        format: 'csv'
      },
      '_buildQuery correctly builds query with provided format setting'
    );
  });

  test('urlForFindQuery', function(assert) {
    assert.expect(7);

    assert.throws(
      () => {
        Adapter.urlForFindQuery({ requestVersion: 'v1' });
      },
      /Request for bard-facts-v2 adapter must be version 2/,
      'urlForFindQuery fails assertion if v1 request is passed in'
    );

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequest)),
      HOST +
        '/v1/data/table1/grain1/d1/d2/?dateTime=2015-01-03/2015-01-04&' +
        'metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&' +
        'format=json',
      'urlForFindQuery correctly built the URL for the provided request'
    );

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequest, { format: 'csv' })),
      HOST +
        '/v1/data/table1/grain1/d1/d2/?dateTime=2015-01-03/2015-01-04&' +
        'metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&' +
        'format=csv',
      'urlForFindQuery correctly built the URL for the provided request with the format option'
    );

    let onlyDateFilter = assign({}, TestRequest, {
      filters: [{ field: 'dateTime', type: 'timeDimension', operator: 'bet', values: ['2015-01-03', '2015-01-04'] }]
    });
    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(onlyDateFilter)),
      HOST + '/v1/data/table1/grain1/d1/d2/?dateTime=2015-01-03/2015-01-04&' + 'metrics=m1,m2,r(p=123)&format=json',
      'urlForFindQuery correctly built the URL for a request with no filters'
    );

    let requestWithSort = assign({}, TestRequest, {
      filters: [{ field: 'dateTime', type: 'timeDimension', operator: 'bet', values: ['2015-01-03', '2015-01-04'] }],
      sorts: [{ field: 'm1' }, { field: 'm2' }]
    });
    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(requestWithSort)),
      HOST +
        '/v1/data/table1/grain1/d1/d2/?dateTime=2015-01-03/2015-01-04&' +
        'metrics=m1,m2,r(p=123)&sort=m1|desc,m2|desc&format=json',
      'urlForFindQuery correctly built the URL for a request with sort'
    );

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequest, { cache: false })),
      HOST +
        '/v1/data/table1/grain1/d1/d2/?dateTime=2015-01-03/2015-01-04&' +
        'metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&' +
        'format=json&_cache=false',
      'urlForFindQuery correctly built the URL for the provided request with the cache option'
    );

    assert.equal(
      decodeURIComponent(Adapter.urlForFindQuery(TestRequest, { dataSourceName: 'blockhead' })),
      HOST2 +
        '/v1/data/table1/grain1/d1/d2/?dateTime=2015-01-03/2015-01-04&' +
        'metrics=m1,m2,r(p=123)&filters=d3|id-in["v1","v2"],d4|id-in["v3","v4"],d5|id-notin[""]&having=m1-gt[0]&' +
        'format=json',
      'uriForFindQuery renders alternative host name if option is given'
    );
  });

  test('fetchDataForRequest', function(assert) {
    assert.expect(2);

    assert.throws(
      () => {
        Adapter.fetchDataForRequest({ requestVersion: 'v1' });
      },
      /Request for bard-facts-v2 adapter must be version 2/,
      'fetchDataForRequest fails assertion if v1 request is passed in'
    );

    return Adapter.fetchDataForRequest(TestRequest).then(function(result) {
      return assert.deepEqual(result, Response, 'Ajax GET returns the response object for TEST Request');
    });
  });

  test('fetchDataForRequest with pagination options', function(assert) {
    assert.expect(1);
    return Adapter.fetchDataForRequest(TestRequest, {
      page: 1,
      perPage: 100
    }).then(function(result) {
      return assert.deepEqual(
        result,
        {
          rows: [
            {
              table: 'table1',
              grain: 'grain1'
            }
          ],
          meta: {
            pagination: {
              page: '1',
              perPage: '100'
            },
            test: true
          }
        },
        'Ajax GET returns the response object for TEST Request'
      );
    });
  });

  test('fetchDataForRequest with client id options', function(assert) {
    assert.expect(2);

    // Setting up assert for default clientId
    Server.get(`${HOST}/v1/data/table1/grain1/d1/d2/`, request => {
      assert.equal(request.requestHeaders.clientid, 'UI', 'Client id defaults to "UI"');

      return MockBardResponse;
    });

    // Sending request for default clientId
    return Adapter.fetchDataForRequest(TestRequest).then(() => {
      // Setting up assert for provided clientId
      Server.get(`${HOST}/v1/data/table1/grain1/d1/d2/`, request => {
        assert.equal(request.requestHeaders.clientid, 'test id', 'Client id is set to value given in options');

        return MockBardResponse;
      });

      // Sending request for provided clientId
      return Adapter.fetchDataForRequest(TestRequest, {
        clientId: 'test id'
      });
    });
  });

  test('fetchDataForRequest with custom headers', function(assert) {
    assert.expect(2);

    Server.get(`${HOST}/v1/data/table1/grain1/d1/d2/`, request => {
      assert.equal(request.requestHeaders.foo, 'bar', 'custom header `foo` was sent with the request');

      assert.equal(request.requestHeaders.baz, 'qux', 'custom header `baz` was sent with the request');

      return MockBardResponse;
    });

    return Adapter.fetchDataForRequest(TestRequest, {
      customHeaders: {
        foo: 'bar',
        baz: 'qux'
      }
    });
  });

  test('fetchDataForRequest with alternative datasource', function(assert) {
    assert.expect(1);

    Server.get(`${HOST2}/v1/data/table1/grain1/d1/d2/`, request => {
      assert.ok(request.url.startsWith(HOST2), 'Alternative host was accessed');

      return MockBardResponse;
    });

    return Adapter.fetchDataForRequest(TestRequest, { dataSourceName: 'blockhead' });
  });
});

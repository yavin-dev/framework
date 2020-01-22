import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';
import config from 'ember-get-config';
import metadataRoutes from '../../../helpers/metadata-routes';
import { assign } from '@ember/polyfills';

const HOST = config.navi.dataSources[0].uri;

const Response = {
  rows: [{ id: 'v1', description: 'value1' }, { id: 'v2', description: 'value2' }],
  meta: { test: true }
};

const MockBardResponse = [200, { 'Content-Type': 'application/json' }, JSON.stringify(Response)];

const Response2 = {
  rows: [{ id: 'v1', description: 'value1' }],
  meta: { test: true }
};

const MockBardResponse2 = [200, { 'Content-Type': 'application/json' }, JSON.stringify(Response2)];

let Adapter, Server;

module('Unit | Adapter | Dimensions | Bard', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Adapter = this.owner.lookup('Adapter:dimensions/bard');

    //setup Pretender
    Server = new Pretender(function() {
      this.get(`${HOST}/v1/dimensions/dimensionOne/values/`, function(request) {
        if (request.queryParams.page && request.queryParams.perPage) {
          let paginatedResponse = assign({}, Response);

          paginatedResponse.meta.pagination = {
            page: request.queryParams.page,
            perPage: request.queryParams.perPage
          };

          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(paginatedResponse)];
        } else if (request.queryParams.filters === 'dimensionOne|id-in["v1"]') {
          return MockBardResponse2;
        }
        return MockBardResponse;
      });

      this.get(`${HOST}/v1/dimensions/dimensionOne/search/`, function(request) {
        if (request.queryParams.page && request.queryParams.perPage) {
          let paginatedResponse = assign({}, Response);

          paginatedResponse.meta.pagination = {
            page: request.queryParams.page,
            perPage: request.queryParams.perPage
          };

          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(paginatedResponse)];
        } else if (request.queryParams.query === 'v1') {
          return MockBardResponse2;
        }
        return MockBardResponse;
      });
    });

    //Load metadata
    Server.map(metadataRoutes);
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  test('_buildUrl', function(assert) {
    assert.expect(2);

    assert.equal(
      Adapter._buildUrl('dimensionOne'),
      `${HOST}/v1/dimensions/dimensionOne/values/`,
      '_buildUrl correctly built the URL for the provided dimension when a host is configured'
    );

    assert.equal(
      Adapter._buildUrl('dimensionOne', 'search'),
      `${HOST}/v1/dimensions/dimensionOne/search/`,
      '_buildUrl correctly built the URL for the provided dimension and `search` path'
    );
  });

  test('_buildFilterQuery', function(assert) {
    assert.expect(7);

    assert.deepEqual(
      Adapter._buildFilterQuery('dimensionOne', { values: 'v1' }),
      { filters: 'dimensionOne|id-in["v1"]' },
      'correctly built filters for object with one string value'
    );

    assert.deepEqual(
      Adapter._buildFilterQuery('dimensionOne', { values: 'v1,v2,v3' }),
      { filters: 'dimensionOne|id-in["v1","v2","v3"]' },
      'correctly built the query for object with csv string values'
    );

    assert.deepEqual(
      Adapter._buildFilterQuery('dimensionOne', { values: ['v1', 'v2', 'v3'] }),
      { filters: 'dimensionOne|id-in["v1","v2","v3"]' },
      'correctly built the query for object with array of values'
    );

    assert.deepEqual(
      Adapter._buildFilterQuery('dimensionOne', [
        { field: 'id', operator: 'contains', values: [1, 3] },
        { field: 'id', operator: 'contains', values: [2] }
      ]),
      { filters: 'dimensionOne|id-contains["1","3"],dimensionOne|id-contains["2"]' },
      'AND filter is generated given a query with multiple filters and OR filter for multiple values'
    );

    assert.deepEqual(
      Adapter._buildFilterQuery('dimensionOne', {
        field: 'description',
        values: ['value1,value2']
      }),
      { filters: 'dimensionOne|desc-in["value1,value2"]' },
      'correctly built the query object when given an array of values'
    );

    assert.deepEqual(
      Adapter._buildFilterQuery('dimensionOne', {
        field: 'id',
        operator: 'in',
        values: ['yes, comma', 'no comma']
      }),
      { filters: 'dimensionOne|id-in["yes, comma","no comma"]' },
      'correctly wraps values, even with commas'
    );

    assert.deepEqual(
      Adapter._buildFilterQuery('dimensionOne', {
        field: 'id',
        operator: 'in',
        values: ['ok', 'weird "quote" value', 'but why']
      }),
      { filters: 'dimensionOne|id-in["ok","weird ""quote"" value","but why"]' },
      'correctly wraps values, even with quotes'
    );
  });

  test('_buildSearchQuery', function(assert) {
    assert.expect(3);

    assert.deepEqual(
      Adapter._buildSearchQuery('dimensionOne', { values: 'v1' }),
      { query: 'v1' },
      '_buildSearchQuery correctly built the query object for the provided dimension filters'
    );

    assert.deepEqual(
      Adapter._buildSearchQuery('dimensionOne', { values: ['foo', 'bar'] }),
      { query: 'foo bar' },
      '_buildSearchQuery correctly built the query object when given an array of values'
    );

    assert.deepEqual(
      Adapter._buildSearchQuery('dimensionOne', { values: ['foo,bar'] }),
      { query: 'foo,bar' },
      '_buildSearchQuery correctly built the query object when given a value containing a comma'
    );
  });

  test('all', function(assert) {
    assert.expect(1);

    return Adapter.all('dimensionOne').then(result => {
      assert.deepEqual(result, Response, 'Ajax GET returns the response object for Test dimension without any filters');
    });
  });

  test('find', function(assert) {
    assert.expect(1);

    return Adapter.find('dimensionOne', { values: 'v1' }).then(function(result) {
      return assert.deepEqual(
        result,
        Response2,
        'Ajax GET /values returns the response object for Test dimension and filters'
      );
    });
  });

  test('search', function(assert) {
    assert.expect(1);

    return Adapter.search('dimensionOne', { values: 'v1' }).then(function(result) {
      return assert.deepEqual(
        result,
        Response2,
        'Ajax GET /search returns the response object for Test dimension and query'
      );
    });
  });

  test('findById', function(assert) {
    assert.expect(1);

    return Adapter.findById('dimensionOne', 'v1').then(function(result) {
      return assert.deepEqual(result, Response2, 'Ajax GET returns the response object for Test dimension and filters');
    });
  });

  test('find with client id options', function(assert) {
    assert.expect(2);

    // Setting up assert for default clientId
    Server.get(`${HOST}/v1/dimensions/dimensionOne/values/`, request => {
      assert.equal(request.requestHeaders.clientid, 'UI', 'Client id defaults to "UI"');
      return MockBardResponse;
    });

    // Sending request for default clientId
    return Adapter.find('dimensionOne', { values: 'v1' }).then(() => {
      // Setting up assert for provided clientId
      Server.get(`${HOST}/v1/dimensions/dimensionOne/values/`, request => {
        assert.equal(request.requestHeaders.clientid, 'test id', 'Client id is set to value given in options');
        return MockBardResponse;
      });

      // Sending request for provided clientId
      return Adapter.find(
        'dimensionOne',
        { values: 'v1' },
        {
          clientId: 'test id'
        }
      );
    });
  });

  test('pushMany', function(assert) {
    assert.expect(1);

    assert.throws(() => Adapter.pushMany(), 'pushMany is not supported in the fili adapter');
  });
});

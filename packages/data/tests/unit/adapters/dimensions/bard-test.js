import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from "pretender";
import config from 'ember-get-config';
import metadataRoutes from '../../../helpers/metadata-routes';
import $ from 'jquery';

const HOST = config.navi.dataSources[0].uri;

const Response = {
  rows: [
    { id: 'v1', description: 'value1' },
    { id: 'v2', description: 'value2' }
  ],
  meta: { test: true }
};

const MockBardResponse = [
  200,
  {"Content-Type": "application/json"},
  JSON.stringify(Response)
];

const Response2 = {
  rows: [
    { id: 'v1', description: 'value1' }
  ],
  meta: { test: true }
};

const MockBardResponse2 = [
  200,
  {"Content-Type": "application/json"},
  JSON.stringify(Response2)
];

let Adapter, Server;

module('Unit | Adapter | Dimensions | Bard', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Adapter = this.owner.lookup('Adapter:dimensions/bard');

    //setup Pretender
    Server = new Pretender(function() {
      this.get(`${HOST}/v1/dimensions/dimensionOne/values/`, function (request) {
        if(request.queryParams.page && request.queryParams.perPage) {
          let paginatedResponse = $.extend({}, Response);

          paginatedResponse.meta.pagination = {
            page: request.queryParams.page,
            perPage: request.queryParams.perPage
          };

          return [
            200,
            {"Content-Type": "application/json"},
            JSON.stringify(paginatedResponse)
          ];
        } else if (request.queryParams.filters === 'dimensionOne|id-in[v1]') {
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

    assert.equal(Adapter._buildUrl('dimensionOne'),
      `${HOST}/v1/dimensions/dimensionOne/values/`,
      '_buildUrl correctly built the URL for the provided dimension when a host is configured');

    let prevDS = config.navi.dataSources;
    config.navi.dataSources = A();

    assert.equal(Adapter._buildUrl('dimensionOne'),
      `${HOST}/v1/dimensions/dimensionOne/values/`,
      '_buildUrl correctly built the URL for the provided dimension when a host is not configured');

    config.navi.dataSources = prevDS;
  });

  test('_buildFilterQuery', function(assert) {
    assert.expect(3);

    assert.deepEqual(Adapter._buildFilterQuery('dimensionOne', { values: 'v1' }),
      { filters:  'dimensionOne|id-in[v1]' },
      '_buildFilterQuery correctly built the query object for the provided dimension filters');

    assert.deepEqual(Adapter._buildFilterQuery('dimensionOne', {field: 'id', operator: 'contains', values: [1, 2]}),
      { filters: 'dimensionOne|id-contains[1],dimensionOne|id-contains[2]' },
      'AND filter query is generated given a query with "and" booleanOperation and an array of ids');

    assert.deepEqual(Adapter._buildFilterQuery('dimensionOne', { field: 'description', values: ['value1,value2'] }),
      {filters: 'dimensionOne|desc-in[value1,value2]'},
      '_buildFilterQuery correctly built the query object when given an array of values');
  });

  test('all', function(assert) {
    assert.expect(1);

    return Adapter.all('dimensionOne').then(result => {
      assert.deepEqual(result,
        Response,
        'Ajax GET returns the response object for Test dimension without any filters');
    });
  });

  test('find', function(assert) {
    assert.expect(1);

    return Adapter.find('dimensionOne', {values: 'v1'}).then(function(result) {
      return assert.deepEqual(
        result,
        Response2,
        'Ajax GET returns the response object for Test dimension and filters'
      );
    });
  });

  test('findById', function(assert) {
    assert.expect(1);

    return Adapter.findById('dimensionOne', 'v1').then(function(result) {
      return assert.deepEqual(result,
        Response2,
        'Ajax GET returns the response object for Test dimension and filters');
    });
  });

  test('find with client id options', function(assert) {
    assert.expect(2);

    // Setting up assert for default clientId
    Server.get(`${HOST}/v1/dimensions/dimensionOne/values/`, request => {
      assert.equal(request.requestHeaders.clientid,
        'UI',
        'Client id defaults to "UI"');
      return MockBardResponse;
    });

    // Sending request for default clientId
    return Adapter.find('dimensionOne', {values: 'v1'}).then( () => {
      // Setting up assert for provided clientId
      Server.get(`${HOST}/v1/dimensions/dimensionOne/values/`, (request) => {
        assert.equal(request.requestHeaders.clientid,
          'test id',
          'Client id is set to value given in options');
        return MockBardResponse;
      });

      // Sending request for provided clientId
      return Adapter.find('dimensionOne', {values: 'v1'}, {
        clientId: 'test id'
      });
    });
  });

  test('pushMany', function(assert) {
    assert.expect(1);

    assert.throws(() => Adapter.pushMany(),
      'pushMany is not supported in the fili adapter');
  });
});

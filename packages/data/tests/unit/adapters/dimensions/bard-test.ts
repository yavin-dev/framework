import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import { Response } from 'miragejs';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type { TestContext as Context } from 'ember-test-helpers';
import type BardDimensionAdapter from 'navi-data/adapters/dimensions/bard';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { Server } from 'miragejs';
import { taskFor } from 'ember-concurrency-ts';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  adapter: BardDimensionAdapter;
  server: Server;
  dimensionOne: DimensionMetadataModel;
  naviMetadata: NaviMetadataService;
}

const HOST = config.navi.dataSources[0].uri;

module('Unit | Adapter | Dimensions | Bard', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.adapter = this.owner.lookup('adapter:dimensions/bard');
    this.naviMetadata = this.owner.lookup('service:navi-metadata');
    await this.naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
    await this.naviMetadata.loadMetadata({ dataSourceName: 'bardTwo' });
  });

  test('_buildUrl', function (this: TestContext, assert) {
    const ageColumn = {
      columnMetadata: this.naviMetadata.getById('dimension', 'age', 'bardOne') as DimensionMetadataModel,
      parameters: { field: 'id' },
    };

    assert.equal(
      this.adapter._buildUrl(ageColumn),
      `${HOST}/v1/dimensions/age/values/`,
      '_buildUrl correctly built the URL for the provided dimension when a host is configured'
    );

    assert.equal(
      this.adapter._buildUrl(ageColumn, 'search'),
      `${HOST}/v1/dimensions/age/search/`,
      '_buildUrl correctly built the URL for the provided dimension and `search` path'
    );
  });

  test('_buildFilterQuery', function (this: TestContext, assert) {
    const ageColumn = {
      columnMetadata: this.naviMetadata.getById('dimension', 'age', 'bardOne') as DimensionMetadataModel,
      parameters: { field: 'id' },
    };

    assert.deepEqual(
      this.adapter._buildFilterQuery(ageColumn, [{ operator: 'in', values: ['v1'] }]),
      { filters: 'age|id-in["v1"]' },
      'correctly built filters for object with one string value'
    );

    assert.deepEqual(
      this.adapter._buildFilterQuery(ageColumn, [{ operator: 'in', values: ['v1', 'v2', 'v3'] }]),
      { filters: 'age|id-in["v1","v2","v3"]' },
      'correctly built the query for object with array of values'
    );

    assert.deepEqual(
      this.adapter._buildFilterQuery(ageColumn, [
        { operator: 'contains', values: [1, 3] },
        { operator: 'contains', values: [2] },
      ]),
      { filters: 'age|id-contains["1","3"],age|id-contains["2"]' },
      'AND filter is generated given a query with multiple filters and OR filter for multiple values'
    );

    assert.deepEqual(
      this.adapter._buildFilterQuery({ ...ageColumn, parameters: { field: 'desc' } }, [
        {
          operator: 'in',
          values: ['value1,value2'],
        },
      ]),
      { filters: 'age|desc-in["value1,value2"]' },
      'correctly built the query object when given an array of values'
    );

    assert.deepEqual(
      this.adapter._buildFilterQuery(ageColumn, [
        {
          operator: 'in',
          values: ['yes, comma', 'no comma'],
        },
      ]),
      { filters: 'age|id-in["yes, comma","no comma"]' },
      'correctly wraps values, even with commas'
    );

    assert.deepEqual(
      this.adapter._buildFilterQuery(ageColumn, [
        {
          operator: 'in',
          values: ['ok', 'weird "quote" value', 'but why'],
        },
      ]),
      { filters: 'age|id-in["ok","weird ""quote"" value","but why"]' },
      'correctly wraps values, even with quotes'
    );

    const recipeColumn = {
      columnMetadata: this.naviMetadata.getById('dimension', 'recipe', 'bardTwo') as DimensionMetadataModel,
      parameters: { field: 'id' },
    };
    assert.deepEqual(
      this.adapter._buildFilterQuery(recipeColumn, [{ operator: 'in', values: ['v4'] }]),
      { filters: 'recipe|id-in["v4"]' },
      'correctly built filters for dimension in bardTwo datasource'
    );
  });

  test('all', async function (this: TestContext, assert) {
    const containerColumn = {
      columnMetadata: this.naviMetadata.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel,
      parameters: { field: 'id' },
    };

    const result = await taskFor(this.adapter.all).perform(containerColumn);
    assert.deepEqual(
      result,
      {
        rows: [
          { description: 'Bag', id: '1' },
          { description: 'Bank', id: '2' },
          { description: 'Saddle Bag', id: '3' },
          { description: 'Retainer', id: '4' },
        ],
      },
      '`all` returns all dimension values'
    );
  });

  test('find', async function (this: TestContext, assert) {
    const containerColumn = {
      columnMetadata: this.naviMetadata.getById('dimension', 'container', 'bardTwo') as DimensionMetadataModel,
      parameters: { field: 'id' },
    };
    const result = await taskFor(this.adapter.find).perform(containerColumn, [{ operator: 'in', values: ['1'] }]);
    assert.deepEqual(
      result,
      {
        rows: [{ description: 'Bag', id: '1' }],
      },
      '`find` returns filtered dimension values'
    );
  });

  test('search', async function (this: TestContext, assert) {
    const containerColumn = {
      columnMetadata: this.naviMetadata.getById('dimension', 'age', 'bardOne') as DimensionMetadataModel,
      parameters: { field: 'id' },
    };

    const result = await taskFor(this.adapter.search).perform(containerColumn, 'a');
    assert.deepEqual(
      result,
      {
        rows: [
          {
            description: 'All Other',
            id: '-3',
          },
          {
            description: '65 and over',
            id: '10',
          },
          {
            description: 'Not Available',
            id: '-2',
          },
        ],
      },
      '`search` returns dimension values that match the search term'
    );
  });

  test('findById', async function (this: TestContext, assert) {
    const result = await taskFor(this.adapter.findById).perform('container', '1', { dataSourceName: 'bardTwo' });
    assert.deepEqual(
      result,
      {
        rows: [{ description: 'Bag', id: '1' }],
      },
      '`findById` returns dimension values that match the id field'
    );
  });

  test('find with client id options', async function (this: TestContext, assert) {
    assert.expect(2);

    const ageColumn = {
      columnMetadata: this.naviMetadata.getById('dimension', 'age', 'bardOne') as DimensionMetadataModel,
      parameters: { field: 'id' },
    };

    // Setting up assert for default clientId
    this.server.get(`${HOST}/v1/dimensions/age/values/`, (_schema, request) => {
      assert.equal(request.requestHeaders.clientid, 'UI', 'Client id defaults to "UI"');
      return new Response(200);
    });

    // Sending request for default clientId
    await taskFor(this.adapter.find).perform(ageColumn, [{ operator: 'in', values: ['1'] }]);

    // Setting up assert for provided clientId
    this.server.get(`${HOST}/v1/dimensions/age/values/`, (_schema, request) => {
      assert.equal(request.requestHeaders.clientid, 'test id', 'Client id is set to value given in options');
      return new Response(200);
    });

    // Sending request for provided clientId
    await taskFor(this.adapter.find).perform(ageColumn, [{ operator: 'in', values: ['1'] }], { clientId: 'test id' });
  });

  test('searchUtil task calls and transforms search results', async function (this: TestContext, assert) {
    assert.expect(1);
    const dimensionsToSearch = {
      rows: [
        {
          id: '1',
          description: 'foo bar',
        },
        {
          id: '2',
          description: 'nope',
        },
        {
          id: '3',
          description: 'foo bar foo',
        },
        {
          id: 'foo4',
          description: 'nah',
        },
        {
          id: '5',
          description: 'nadda',
        },
      ],
      meta: { some: 'metaData' },
    };

    const results = this.adapter._searchDimensions(dimensionsToSearch, 'foo');
    assert.deepEqual(
      results,
      {
        rows: [
          {
            id: 'foo4',
            description: 'nah',
          },
          {
            id: '1',
            description: 'foo bar',
          },
          {
            id: '3',
            description: 'foo bar foo',
          },
        ],
        meta: { some: 'metaData' },
      },
      'Returns expected search results and returns results as a FiliDimensionResult, passing through meta prop'
    );
  });
});

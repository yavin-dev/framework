import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Pretender from 'pretender';
import metadataRoutes from 'navi-data/test-support/helpers/metadata-routes';

let Service, Server;

module('Unit | Service | navi-definition-search-provider', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
    Server = new Pretender(metadataRoutes);
    Service = this.owner.lookup('service:navi-search/navi-definition-search-provider');
  });

  hooks.afterEach(async function () {
    Server.shutdown();
  });

  test('search definition of a dimension', async function (assert) {
    assert.expect(3);
    metadataRoutes.bind(Server);
    const results = await Service.search.perform('age');

    const expectedResults = [
      {
        id: 'age',
        name: 'Age',
      },
    ];

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    assert.deepEqual(
      results.data.map((result) => ({ id: result.id, name: result.name })),
      expectedResults,
      'Result contains the expected properties and values'
    );
  });

  test('search definition of a metric', async function (assert) {
    assert.expect(3);
    metadataRoutes.bind(Server);
    const results = await Service.search.perform('time');

    const makeDateTime = (table) => ({ id: `${table}.dateTime`, name: 'Date Time' });
    const expectedResults = [
      ...['network', 'tableA', 'tableB', 'protected', 'tableC'].map((table) => makeDateTime(table)),
      {
        id: 'timeSpent',
        name: 'Time Spent',
      },
      {
        id: 'dayAvgTimeSpent',
        name: 'Time Spent (Daily Avg)',
      },
    ];

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    assert.deepEqual(
      results.data.map((result) => ({ id: result.id, name: result.name })),
      expectedResults,
      'Result contains the the expected properties and values'
    );
  });

  test('search definition of a table', async function (assert) {
    assert.expect(3);
    const results = await Service.search.perform('tableA');

    const expectedResults = [
      {
        id: 'tableA',
        name: 'Table A',
        description: 'Table A',
      },
      {
        description: undefined,
        id: 'tableA.dateTime',
        name: 'Date Time',
      },
    ];

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    assert.deepEqual(
      results.data.map((result) => ({ id: result.id, name: result.name, description: result.description })),
      expectedResults,
      'Result contains the the expected properties and values'
    );
  });

  test('search does not return a definition', async function (assert) {
    assert.expect(3);
    const results = await Service.search.perform('something');

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    assert.equal(results.data.length, 0, 'Does not return any results');
  });

  test('search with empty parameters', async function (assert) {
    assert.expect(3);
    const results = await Service.search.perform();

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    assert.equal(results.data.length, 0, 'Does not return any results');
  });

  test('search with empty query', async function (assert) {
    assert.expect(3);
    const results = await Service.search.perform('');

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    assert.equal(results.data.length, 0, 'Does not return any results');
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Pretender from 'pretender';
import metadataRoutes from '../../../helpers/metadata-routes';

let Service, Server;

module('Unit | Service | navi-definition-search-provider', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    Server = new Pretender(metadataRoutes);
    Service = this.owner.lookup('service:navi-search/navi-definition-search-provider');
  });

  hooks.afterEach(async function() {
    Server.shutdown();
  });

  test('search definition of a dimension', async function(assert) {
    assert.expect(3);
    metadataRoutes.bind(Server);
    const results = await Service.search.perform('dimensionOne');

    const expectedResults = [
      {
        name: 'dimensionOne',
        longName: 'Dimension One',
        description: 'This is Dimension One'
      }
    ];

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    results.data.forEach((result, index) => {
      assert.ok(
        Object.keys(expectedResults[index]).every(key => result[key] === expectedResults[index][key]),
        'Result contains the the expected properties and values'
      );
    });
  });

  test('search definition of a metric', async function(assert) {
    assert.expect(3);
    metadataRoutes.bind(Server);
    const results = await Service.search.perform('metricOne');

    const expectedResults = [
      {
        name: 'metricOne',
        longName: 'Metric One',
        description: 'This is Metric One'
      }
    ];

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    results.data.forEach((result, index) => {
      assert.ok(
        Object.keys(expectedResults[index]).every(key => result[key] === expectedResults[index][key]),
        'Result contains the the expected properties and values'
      );
    });
  });

  test('search definition of a table', async function(assert) {
    assert.expect(3);
    const results = await Service.search.perform('tableA');

    const expectedResults = [
      {
        name: 'tableA',
        longName: 'Table A',
        description: 'Table A'
      }
    ];

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    results.data.forEach((result, index) => {
      assert.ok(
        Object.keys(expectedResults[index]).every(key => result[key] === expectedResults[index][key]),
        'Result contains the the expected properties and values'
      );
    });
  });

  test('search does not return a definition', async function(assert) {
    assert.expect(3);
    const results = await Service.search.perform('something');

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    assert.equal(results.data.length, 0, 'Does not return any results');
  });

  test('search with empty parameters', async function(assert) {
    assert.expect(3);
    const results = await Service.search.perform();

    assert.equal(results.component, 'navi-search-result/definition', 'Result contains correct display component name');
    assert.equal(results.title, 'Definition', 'Result contains correct title for the search result section');
    assert.equal(results.data.length, 0, 'Does not return any results');
  });
});

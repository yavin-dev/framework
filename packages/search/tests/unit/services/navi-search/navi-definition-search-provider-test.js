import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Pretender from 'pretender';
import metadataRoutes from '../../../helpers/metadata-routes';

let Service, MetadataService, Server;

module('Unit | Service | navi-definition-search-provider', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
    Server = new Pretender(metadataRoutes);
    Service = this.owner.lookup('service:navi-search/navi-definition-search-provider');
  });

  hooks.afterEach(async function() {
    Server.shutdown();
  });

  test('test', async function(assert) {
    assert.expect(1);
    metadataRoutes.bind(Server)(1);
    MetadataService.set('loadedDataSources', ['dummy']);
    const results = await Service.search.perform('pageViews');

    assert.equal(results.component, 'navi-search-result/definition');
  });
});

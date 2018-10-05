import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';
import metadataRoutes, { Host, Tables } from '../../helpers/metadata-routes';

let Adapter, Server;

module('Unit | Bard Metadata Adapter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Adapter = this.owner.lookup('adapter:bard-metadata');

    //setup Pretender
    Server = new Pretender(metadataRoutes);
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  /*
   * Test whether the url path is built correctly
   */
  test('_buildURLPath', function(assert) {
    assert.expect(1);

    assert.equal(
      Adapter._buildURLPath('table', ''),
      `${Host}/v1/tables/`,
      '_buildURLPath correctly built the URL path'
    );
  });

  /**
   * Test whether the adapter returns the response it gets
   */
  test('fetchMetadata', function(assert) {
    assert.expect(1);

    return Adapter.fetchAll('table').then(function(result) {
      return assert.deepEqual(result, { tables: Tables }, 'fetchMetadata correctly requested metadata');
    });
  });
});

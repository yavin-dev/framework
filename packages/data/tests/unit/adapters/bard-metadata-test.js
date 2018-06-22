import { moduleFor, test } from 'ember-qunit';
import Pretender from 'pretender';
import metadataRoutes, { Host, Tables } from '../../helpers/metadata-routes';

let Adapter, Server;

moduleFor('adapter:bard-metadata', 'Unit | Bard Metadata Adapter', {
  needs: ['service:ajax'],

  beforeEach() {
    Adapter = this.subject();

    //setup Pretender
    Server = new Pretender(metadataRoutes);
  },
  afterEach() {
    //shutdown pretender
    Server.shutdown();
  }
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
    return assert.deepEqual(
      result,
      { tables: Tables },
      'fetchMetadata correctly requested metadata'
    );
  });
});

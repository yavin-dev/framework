import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';

module('Unit | Service | navi-metadata-apollo', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('_buildURLPath', function(assert) {
    const service = this.owner.lookup('service:navi-metadata-apollo');
    assert.equal(service._buildURLPath(), `${config.navi.dataSources[0].uri}/graphql`, 'URL path is built correctly');
  });
});

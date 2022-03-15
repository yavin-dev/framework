import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import type NaviElideApolloService from 'navi-data/services/navi-elide-apollo';

module('Unit | Service | navi-elide-apollo', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('_buildURLPath', function (assert) {
    const service: NaviElideApolloService = this.owner.lookup('service:navi-elide-apollo');
    assert.equal(service._buildURLPath('elideOne'), `${config.navi.dataSources[2].uri}`, 'URL path is built correctly');
  });
});

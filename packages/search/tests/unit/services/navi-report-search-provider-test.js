import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | navi-report-search-provider', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let service = this.owner.lookup('service:navi-search/navi-report-search-provider');
    assert.ok(service);
  });

  test('search', function(assert) {
    let service = this.owner.lookup('service:navi-search/navi-report-search-provider');
    service.search({ title: 'H', author: 'ramvish', request: 'Revenue' }).then(function() {
      assert.ok(false);
    });
    assert.ok(true);
  });
});

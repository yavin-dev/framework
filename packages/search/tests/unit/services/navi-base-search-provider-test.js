import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | navi-base-search-provider', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const service = this.owner.lookup('service:navi-base-search-provider');
    assert.ok(service);
  });

  test('Cannot call search from base class', function(assert) {
    const service = this.owner.lookup('service:navi-base-search-provider');
    try {
      service.search();
    } catch (error) {
      assert.ok(
        error.message.includes('Search method must be called from a subclass'),
        'Search cannot be called from base provider.'
      );
    }
  });

  test('Must override display component in subclass.', function(assert) {
    const service = this.owner.lookup('service:navi-base-search-provider');
    try {
      service.displayComponentName;
    } catch (error) {
      assert.ok(
        error.message.includes('Display component name must be defined in a subclass'),
        'Display component name must be defined in a subclass'
      );
    }
  });
});

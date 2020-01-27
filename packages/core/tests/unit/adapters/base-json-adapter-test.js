import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | Base Json Adapter', function(hooks) {
  setupTest(hooks);

  test('ajaxOptions', function(assert) {
    assert.expect(3);

    const adapter = this.owner.lookup('adapter:base-json-adapter');
    const options = adapter.ajaxOptions();

    assert.deepEqual(
      options.headers,
      { Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
      'The headers must specify jsonapi'
    );

    assert.deepEqual(options.crossDomain, true, 'Crossdomain is enabled');
    assert.deepEqual(options.xhrFields, { withCredentials: true }, 'xhrFields includes withCredentials');
  });
});

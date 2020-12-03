import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | Base Json Adapter', function(hooks) {
  setupTest(hooks);

  test('ajaxOptions - content', function(assert) {
    const adapter = this.owner.lookup('adapter:base-json-adapter');
    const options = adapter.ajaxOptions('path', 'POST', { data: {}, contentType: 'application/vnd.api+json' });
    assert.deepEqual(
      options.headers,
      { Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' },
      'The headers must specify jsonapi'
    );
    assert.equal(
      options.contentType,
      'application/vnd.api+json',
      '`contentType` setting is set when content is present'
    );
    assert.equal(options.crossDomain, true, 'Crossdomain is enabled');
    assert.deepEqual(options.xhrFields, { withCredentials: true }, 'xhrFields includes withCredentials');
  });

  test('ajaxOptions - no content', function(assert) {
    const adapter = this.owner.lookup('adapter:base-json-adapter');
    const options = adapter.ajaxOptions('path', 'DELETE');
    assert.deepEqual(
      options.headers,
      { Accept: 'application/vnd.api+json' },
      '`Content-Type` header is not set when there is no content'
    );
    assert.equal(options.contentType, undefined, '`contentType` setting is `undefined` when content is not present');
  });
});

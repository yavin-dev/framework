import { module, test } from 'qunit';
import { isForbidden } from 'dummy/helpers/is-forbidden';
import { FetchError } from '@yavin/client/plugins/bard/adapter/facts';

module('Unit | Helper | is forbidden', function () {
  test('it returns true with rejected promise with forbidden error', function (assert) {
    assert.expect(4);
    assert.ok(isForbidden(new FetchError(403, 'forbid')), 'returns true if forbidden error');
    assert.notOk(isForbidden({ error: 'Not Found' }), 'returns false for general errors');
    assert.notOk(isForbidden(new FetchError(400, 'bad request')), 'returns false for bad requests');
    assert.notOk(isForbidden(new FetchError(500, 'server error')), 'returns false for server errors');
  });

  test('it returns false with other data types', function (assert) {
    assert.expect(4);
    assert.notOk(isForbidden(null));
    assert.notOk(isForbidden(undefined));
    assert.notOk(isForbidden({ data: 'foo' }));
    assert.notOk(isForbidden('bullhokey'));
  });
});

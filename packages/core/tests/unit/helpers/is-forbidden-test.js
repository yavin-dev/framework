import { module, test } from 'qunit';
import { isForbidden } from 'dummy/helpers/is-forbidden';
import { FetchError } from '@yavin/client/errors/fetch-error';
import NaviAdapterError from '@yavin/client/errors/navi-adapter-error';

module('Unit | Helper | is forbidden', function () {
  test('it returns true with rejected promise with forbidden error', function (assert) {
    assert.expect(7);
    assert.ok(isForbidden(new FetchError('url', 403, 'forbid')), 'returns true if forbidden error');
    assert.ok(isForbidden(new NaviAdapterError('forbid', [{ status: '403' }])), 'returns true if forbidden error');
    assert.ok(
      isForbidden(new NaviAdapterError('forbidden', [{ status: 'hmm' }, { status: '403' }])),
      'returns true if forbidden error'
    );
    assert.notOk(
      isForbidden(new NaviAdapterError('unknown error', [{ status: 'hmm' }])),
      'returns true if forbidden error'
    );
    assert.notOk(isForbidden({ error: 'Not Found' }), 'returns false for general errors');
    assert.notOk(isForbidden(new FetchError('url', 400, 'bad request')), 'returns false for bad requests');
    assert.notOk(isForbidden(new FetchError('url', 500, 'server error')), 'returns false for server errors');
  });

  test('it returns false with other data types', function (assert) {
    assert.expect(4);
    assert.notOk(isForbidden(null));
    assert.notOk(isForbidden(undefined));
    assert.notOk(isForbidden({ data: 'foo' }));
    assert.notOk(isForbidden('bullhokey'));
  });
});

import { module, test } from 'qunit';
import { FetchError } from '@yavin/client/errors/fetch-error';

module('Unit | Errors | Fetch Error', function () {
  test('it properly hydrates properties', function (assert) {
    assert.expect(6);
    const error = new FetchError('https://domain', 401, 'not logged in');
    assert.strictEqual(error.url, 'https://domain', 'url is populated correctly');
    assert.strictEqual(error.status, 401, 'status is populated correctly');
    assert.strictEqual(error.payload, 'not logged in', 'payload is populated correctly');
    assert.strictEqual(
      `${error}`,
      'FetchError: HTTP401 - "not logged in" while fetching https://domain',
      'toString() serializes correctly'
    );

    const error2 = new FetchError('https://domain2', 403, { description: 'not allowed' });
    assert.deepEqual(error2.payload, { description: 'not allowed' }, 'payload is populated correctly');
    assert.strictEqual(
      `${error2}`,
      'FetchError: HTTP403 - {"description":"not allowed"} while fetching https://domain2',
      'toString() serializes correctly'
    );
  });
});

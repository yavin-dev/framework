import Cache from 'navi-data/utils/classes/cache';
import { module, test } from 'qunit';

module('Unit | Utils | Cache Class', function () {
  test('cache stores and returns records correctly', async function (assert) {
    assert.expect(5);

    assert.ok(new Cache<string>((id: number) => `${id}`), 'can make cache if getCacheKey function given');

    const cache = new Cache<string>((id: number) => `${id}`);

    const cacheId = cache.getCacheId(0);
    const cacheRecord = 'zero';
    assert.deepEqual(cacheId, '0', 'correctly calls getCacheId function from cache');
    cache.addToCache(cacheId, cacheRecord);

    assert.deepEqual(cache.checkCache(cacheId), 'zero', 'checking for values in cache returns values added to cache');
    assert.deepEqual(cache.checkCache('1'), undefined, 'checking for values not in cache returns undefined');

    const cache2 = new Cache<{ word: string; letters: number }>((letter: string) => `${letter}`);
    const recordA = { word: 'apple', letters: 5 };
    cache2.addToCache('a', recordA);
    assert.deepEqual(cache2.checkCache('a'), recordA, 'cache works as expected for complex record types');
  });

  test('cache honors maximum size constraint', async function (assert) {
    assert.expect(7);

    const cache = new Cache<string>((id: number) => `${id}`, 3);

    cache.addToCache('2', 'two');
    cache.addToCache('1', 'one');
    cache.addToCache('0', 'zero');

    assert.deepEqual(cache.checkCache('0'), 'zero', '0 is in cache');
    assert.deepEqual(cache.checkCache('1'), 'one', '1 is in cache');
    assert.deepEqual(cache.checkCache('2'), 'two', '2 is in cache');

    cache.addToCache('3', 'three');
    assert.deepEqual(cache.checkCache('3'), 'three', '3 is in cache');

    assert.deepEqual(cache.checkCache('0'), undefined, 'least recently accessed item in cache is removed');
    assert.deepEqual(cache.checkCache('1'), 'one', 'other item (1) is still in cache');
    assert.deepEqual(cache.checkCache('2'), 'two', 'other item (2) is still in cache');
  });

  test('cache honors timeout constraint', async function (assert) {
    assert.expect(1);

    const cache = new Cache<string>((id: number) => `${id}`, 3, 0);

    cache.addToCache('7', 'seven');

    assert.deepEqual(cache.checkCache('7'), undefined, 'item (7) has timed out of cache');
  });
});

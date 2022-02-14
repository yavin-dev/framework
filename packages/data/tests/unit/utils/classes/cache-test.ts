import Cache from 'navi-data/utils/classes/cache';
import { module, test } from 'qunit';

module('Unit | Utils | Cache Class', function () {
  test('cache stores and returns records correctly', async function (assert) {
    assert.expect(6);

    // setup cache (key : record :: '0' : 'zero')
    const cache = new Cache<string>((id: number) => `${id}`);

    // try calling getCacheKey
    const cacheId = cache.getCacheKey(0);
    const cacheRecord = 'zero';
    assert.deepEqual(cacheId, '0', 'correctly calls getCacheId function from cache');

    // check records
    cache.setItem(cacheId, cacheRecord);
    assert.deepEqual(cache.getItem(cacheId), 'zero', 'checking for values in cache returns values added to cache');
    assert.deepEqual(cache.getItem('1'), undefined, 'checking for values not in cache returns undefined');

    // try a complex record type
    const cache2 = new Cache<{ word: string; letters: number }>((letter: string) => `${letter}`);
    const recordA = { word: 'apple', letters: 5 };
    cache2.setItem('a', recordA);
    assert.deepEqual(cache2.getItem('a'), recordA, 'cache works as expected for complex record types');

    // call getItem with something not in cache
    const recordB = { word: 'banana', letters: 6 };
    assert.deepEqual(
      cache2.getItem('b', (_cacheKey: string) => recordB),
      recordB,
      'fallback function gets called'
    );
    assert.ok(cache2.has('b'), 'item from callback is in cache');
  });

  test('cache honors maximum size constraint', async function (assert) {
    assert.expect(7);

    // setup cache (key : record :: '0' : 'zero')
    const cache = new Cache<string>((id: number) => `${id}`, 3);

    cache.setItem('2', 'two');
    cache.setItem('1', 'one');
    cache.setItem('0', 'zero');

    assert.deepEqual(cache.getItem('0'), 'zero', '0 is in cache');
    await new Promise((r) => setTimeout(r, 2));
    assert.deepEqual(cache.getItem('1'), 'one', '1 is in cache');
    await new Promise((r) => setTimeout(r, 2));
    assert.deepEqual(cache.getItem('2'), 'two', '2 is in cache');

    cache.setItem('3', 'three');
    assert.deepEqual(cache.getItem('3'), 'three', '3 is in cache');

    assert.deepEqual(cache.getItem('0'), undefined, 'least recently accessed item in cache is removed');
    assert.deepEqual(cache.getItem('1'), 'one', 'other item (1) is still in cache');
    assert.deepEqual(cache.getItem('2'), 'two', 'other item (2) is still in cache');
  });

  test('cache honors timeout constraint', async function (assert) {
    assert.expect(1);

    const cache = new Cache<string>((id: number) => `${id}`, 3, 1);

    cache.setItem('7', 'seven');

    await new Promise((r) => setTimeout(r, 2));

    assert.deepEqual(cache.getItem('7'), undefined, 'item (7) has timed out of cache');
  });
});

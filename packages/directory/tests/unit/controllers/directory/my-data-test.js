import { module, test } from 'qunit';
import { set } from '@ember/object';
import { A as arr } from '@ember/array';
import { resolve } from 'rsvp';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | my-data', function(hooks) {
  setupTest(hooks);

  test('search results are filtered based on search query', function(assert) {
    assert.expect(2);

    const controller = this.owner.lookup('controller:directory/my-data');

    set(controller, 'directory', { q: 'test' });
    set(
      controller,
      'sortedItems',
      resolve([{ id: 1, title: 'test1' }, { id: 2, title: 'second' }, { id: 3, title: 'test3' }])
    );

    controller.get('searchResults').then(results => {
      assert.deepEqual(arr(results).mapBy('id'), [1, 3], 'The results are filtered based on the search query `q`');
    });

    set(controller, 'directory', { q: 'se' });
    controller.get('searchResults').then(results => {
      assert.deepEqual(arr(results).mapBy('id'), [2], 'The results changes when the search query `q` changes');
    });
  });
});

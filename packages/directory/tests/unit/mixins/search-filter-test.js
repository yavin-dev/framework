import EmberObject from '@ember/object';
import SearchFilterMixin from 'navi-directory/mixins/search-filter';
import { module, test } from 'qunit';
import { set } from '@ember/object';
import { A as arr } from '@ember/array';
import { resolve } from 'rsvp';

module('Unit | Mixin | search-filter', function() {
  test('search results are filtered based on search query', function(assert) {
    assert.expect(2);

    // TODO: Replace mixin
    // eslint-disable-next-line ember/no-new-mixins
    let SearchFilterObject = EmberObject.extend(SearchFilterMixin);
    let subject = SearchFilterObject.create();
    set(subject, 'directory', { q: 'test' });
    set(
      subject,
      'sortedItems',
      resolve([{ id: 1, title: 'test1' }, { id: 2, title: 'second' }, { id: 3, title: 'test3' }])
    );

    subject.get('searchResults').then(results => {
      assert.deepEqual(arr(results).mapBy('id'), [1, 3], 'The results are filtered based on the search query `q`');
    });

    set(subject, 'directory', { q: 'se' });
    subject.get('searchResults').then(results => {
      assert.deepEqual(arr(results).mapBy('id'), [2], 'The results changes when the search query `q` changes');
    });
  });
});

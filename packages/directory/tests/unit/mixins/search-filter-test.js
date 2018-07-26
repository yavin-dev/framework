import EmberObject from '@ember/object';
import SearchFilterMixin from 'navi-directory/mixins/search-filter';
import { module, test } from 'qunit';
import { set } from '@ember/object';
import { A as arr } from '@ember/array';

module('Unit | Mixin | search-filter', function() {
  test('search results are filtered based on search query', function (assert) {
    assert.expect(2);

    let SearchFilterObject = EmberObject.extend(SearchFilterMixin);
    let subject = SearchFilterObject.create();
    set(subject, 'directory', { q: 'test' });
    set(subject, 'model', [
      { id: 1, title: 'test1' },
      { id: 2, title: 'second' },
      { id: 3, title: 'test3' },
    ]);

    assert.deepEqual(arr(subject.get('searchResults')).mapBy('id'),
      [ 1, 3 ],
      'The results are filtered based on the search query `q`');

    set(subject, 'directory', { q: 'se' });
    assert.deepEqual(arr(subject.get('searchResults')).mapBy('id'),
      [ 2 ],
      'The results changes when the search query `q` changes');
  });
});

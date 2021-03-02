import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | comma separated list', function (hooks) {
  setupRenderingTest(hooks);

  test('comma separated list', async function (assert) {
    assert.expect(5);

    let list = A([]);
    this.set('list', list);
    await render(hbs`
          {{~#comma-separated-list list=list as |item| ~}}
              <span class='custom-element'>{{item}}</span>
          {{~/comma-separated-list~}}
      `);

    assert.dom().hasText('', 'An empty array returns an empty element');

    run(() => list.pushObject('one'));
    assert.dom().hasText('one', 'A single string is returned');

    run(() => list.pushObject('two'));
    assert.dom().hasText('one and two', 'Two strings are returned with an "and" between, and no ","');

    run(() => list.pushObject('three'));
    assert.dom().hasText('one, two, and three', 'Three strings are turned into a comma separated list');

    const customElementText = findAll('.custom-element').map((el) => el.textContent.trim());
    assert.deepEqual(
      customElementText,
      ['one', 'two', 'three'],
      'The individual list items can have extra html applied to them'
    );
  });
});

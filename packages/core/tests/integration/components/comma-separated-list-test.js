import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('comma-separated-list', 'Integration | Component | comma separated list', {
  integration: true
});

test('comma separated list', function(assert) {
  assert.expect(5);

  let list = A([]);
  this.set('list', list);
  this.render(hbs`
        {{~#comma-separated-list list=list as |item| ~}}
            <span class='custom-element'>{{item}}</span>
        {{~/comma-separated-list~}}
    `);

  assert.equal(
    this.$()
      .text()
      .trim(),
    '',
    'An empty array returns an empty element'
  );

  run(() => list.pushObject('one'));
  assert.equal(
    this.$()
      .text()
      .trim(),
    'one',
    'A single string is returned'
  );

  run(() => list.pushObject('two'));
  assert.equal(
    this.$()
      .text()
      .trim(),
    'one and two',
    'Two strings are returned with an "and" between, and no ","'
  );

  run(() => list.pushObject('three'));
  assert.equal(
    this.$()
      .text()
      .trim(),
    'one, two, and three',
    'Three strings are turned into a comma separated list'
  );

  let customElementText = this.$('.custom-element')
    .toArray()
    .map(el =>
      this.$(el)
        .text()
        .trim()
    );
  assert.deepEqual(
    customElementText,
    ['one', 'two', 'three'],
    'The individual list items can have extra html applied to them'
  );
});

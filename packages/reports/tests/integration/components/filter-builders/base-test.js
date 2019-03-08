import { A } from '@ember/array';
import Component from '@ember/component';
import { moduleForComponent, test } from 'ember-qunit';
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';

const filter = {
  subject: {
    longName: 'Device Type'
  },
  operator: {
    id: 'in',
    longName: 'Equals',
    valuesComponent: 'mock/values-component'
  },
  values: [1, 2, 3]
};

const supportedOperators = [
  { id: 'in', longName: 'Equals', valuesComponent: 'mock/values-component' },
  {
    id: 'notin',
    longName: 'Not Equals',
    valuesComponent: 'mock/values-component'
  },
  {
    id: 'null',
    longName: 'Is Empty',
    valuesComponent: 'mock/another-values-component'
  }
];

moduleForComponent('filter-builders/base', 'Integration | Component | filter-builders/base', {
  integration: true,

  beforeEach() {
    /*
     * Normally supportedOperators will be provided by the child class,
     * but to simplify testing we pass it in
     */
    this.setProperties({
      filter,
      supportedOperators
    });
    this.register(
      'component:mock/values-component',
      Component.extend({
        classNames: 'mock-value-component'
      })
    );
    this.register('component:mock/another-values-component', Component.extend());
  }
});

test('it renders', function(assert) {
  assert.expect(4);

  this.render(hbs`{{filter-builders/base filter=filter supportedOperators=supportedOperators }}`);

  assert.equal(
    this.$('.filter-builder__subject')
      .text()
      .trim(),
    filter.subject.longName,
    "Subject's long name is display in filter builder"
  );

  assert.equal(
    this.$('.filter-builder__operator .ember-power-select-selected-item')
      .text()
      .trim(),
    filter.operator.longName,
    'The filter current operator is selected by default'
  );

  clickTrigger();
  assert.deepEqual(
    $('.ember-power-select-option')
      .map(function() {
        return $(this)
          .text()
          .trim();
      })
      .get(),
    A(supportedOperators).mapBy('longName'),
    'All supported operators show up as options in the operator selector'
  );

  assert.ok(
    this.$('.mock-value-component').is(':visible'),
    'The component specified by the filter operator is rendered'
  );
});

test('changing operator', function(assert) {
  assert.expect(3);

  this.set('onUpdateFilter', changeSet => {
    assert.equal(changeSet.operator, 'notin', 'Selected operator is given to action');

    assert.notOk(
      'values' in changeSet,
      'Values is not reset when changing between operator with the same valuesComponent'
    );
  });

  this.render(
    hbs`{{filter-builders/base filter=filter supportedOperators=supportedOperators onUpdateFilter=(action onUpdateFilter)}}`
  );

  /* == Operator with same valuesComponent == */
  clickTrigger();
  nativeMouseUp($('.ember-power-select-option:contains(Not Equals)')[0]);

  /* == Operator with different valuesComponent == */
  this.set('onUpdateFilter', changeSet => {
    assert.deepEqual(changeSet.values, [], 'Values is reset when changing between operators to avoid conflicts');
  });
  clickTrigger();
  nativeMouseUp($('.ember-power-select-option:contains(Is Empty)')[0]);
});

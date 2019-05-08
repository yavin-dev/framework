import { moduleForComponent, test } from 'ember-qunit';
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

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
  },
  {
    id: 'contains',
    longName: 'Contains',
    valuesComponent: 'mock/values-component',
    showFields: true
  }
];

const requestFragment = {
  dimension: {
    name: 'deviceType',
    fields: [{ name: 'id' }, { name: 'desc' }, { name: 'foo' }],
    primaryKeyFieldName: 'id'
  }
};

moduleForComponent('filter-builders/dimension', 'Integration | Component | filter-builders/dimension', {
  integration: true,

  beforeEach() {
    /*
     * Normally supportedOperators will be provided by the child class,
     * but to simplify testing we pass it in
     */
    this.setProperties({
      filter,
      supportedOperators,
      requestFragment
    });
    this.register(
      'component:mock/values-component',
      Ember.Component.extend({
        classNames: 'mock-value-component'
      })
    );
    this.register('component:mock/another-values-component', Ember.Component.extend());
  }
});

test('changing operator with field', function(assert) {
  assert.expect(6);

  this.set('onUpdateFilter', changeSet => {
    assert.equal(changeSet.operator, 'contains', 'Selected operator is given to action');

    this.set('filter.operator', this.supportedOperators.find(oper => oper.id === changeSet.operator));
  });

  this.render(
    hbs`{{filter-builders/dimension filter=filter requestFragment=requestFragment supportedOperators=supportedOperators onUpdateFilter=(action onUpdateFilter)}}`
  );

  clickTrigger();
  nativeMouseUp($('.ember-power-select-option:contains(Contains)')[0]);

  assert.ok(this.$('.filter-builder-dimension__field').is(':visible'), 'Field dropdown is shown');

  this.set('onUpdateFilter', changeSet => {
    assert.equal(changeSet.field, 'desc', 'Selected field is given to action');

    this.set('filter.field', changeSet.field);
  });

  clickTrigger('.filter-builder-dimension__field');
  nativeMouseUp($('.ember-power-select-option:contains(desc)')[0]);

  this.set('onUpdateFilter', changeSet => {
    assert.equal(changeSet.operator, 'notin', 'Selected operator is given to action');
    assert.equal(changeSet.field, 'id', 'field is switched back to id');

    this.set('filter.operator', this.supportedOperators.find(oper => oper.id === changeSet.operator));
    this.set('filter.field', changeSet.field);
  });

  clickTrigger('.filter-builder-dimension__operator');
  nativeMouseUp($('.ember-power-select-option:contains(Not Equals)')[0]);

  assert.notOk(this.$('.filter-builder__field').is(':visible'), 'Field dropdown is gone');
});

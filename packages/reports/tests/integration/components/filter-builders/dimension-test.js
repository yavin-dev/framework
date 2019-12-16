import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import Component from '@ember/component';
import $ from 'jquery';
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

module('Integration | Component | filter-builders/dimension', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    /*
     * Normally supportedOperators will be provided by the child class,
     * but to simplify testing we pass it in
     */
    this.setProperties({
      filter,
      supportedOperators,
      requestFragment
    });
    this.owner.register(
      'component:mock/values-component',
      Component.extend({
        classNames: 'mock-value-component',
        layout: hbs`<div>dimension values</div>`
      })
    );
    this.owner.register('component:mock/another-values-component', Component.extend());
  });

  test('collapsed', async function(assert) {
    assert.expect(2);

    await render(hbs`<FilterBuilders::Dimension
      @filter={{this.filter}}
      @supportedOperators={{this.supportedOperators}}
      @requestFragment={{this.requestFragment}}
      @isCollapsed={{true}} />`);

    assert
      .dom('.filter-builder')
      .hasText(
        `${filter.subject.longName} ${filter.operator.longName.toLowerCase()} dimension values`,
        'Rendered correctly when collapsed'
      );

    const field = 'desc',
      filterWithDescField = {
        subject: {
          longName: 'Device Type'
        },
        operator: {
          id: 'contains',
          longName: 'Contains',
          valuesComponent: 'mock/values-component',
          showFields: true
        },
        field,
        values: [1, 2, 3]
      };

    this.set('filter', filterWithDescField);

    assert
      .dom('.filter-builder')
      .hasText(
        `${
          filterWithDescField.subject.longName
        } (${field}) ${filterWithDescField.operator.longName.toLowerCase()} dimension values`,
        'Rendered correctly with field when collapsed'
      );
  });

  test('changing operator with field', async function(assert) {
    assert.expect(6);

    this.set('onUpdateFilter', changeSet => {
      assert.equal(changeSet.operator, 'contains', 'Selected operator is given to action');

      this.set('filter.operator', this.supportedOperators.find(oper => oper.id === changeSet.operator));
    });

    await render(
      hbs`{{filter-builders/dimension filter=filter requestFragment=requestFragment supportedOperators=supportedOperators onUpdateFilter=(action onUpdateFilter)}}`
    );

    await clickTrigger();
    await nativeMouseUp($('.ember-power-select-option:contains(Contains)')[0]);

    assert.dom('.filter-builder-dimension__field').exists('Field dropdown is shown');

    this.set('onUpdateFilter', changeSet => {
      assert.equal(changeSet.field, 'desc', 'Selected field is given to action');

      this.set('filter.field', changeSet.field);
    });

    await clickTrigger('.filter-builder-dimension__field');
    await nativeMouseUp($('.ember-power-select-option:contains(desc)')[0]);

    this.set('onUpdateFilter', changeSet => {
      assert.equal(changeSet.operator, 'notin', 'Selected operator is given to action');
      assert.equal(changeSet.field, 'id', 'field is switched back to id');

      this.set('filter.operator', this.supportedOperators.find(oper => oper.id === changeSet.operator));
      this.set('filter.field', changeSet.field);
    });

    await clickTrigger('.filter-builder-dimension__operator');
    await nativeMouseUp($('.ember-power-select-option:contains(Not Equals)')[0]);

    assert.dom('.filter-builder__field').doesNotExist('Field dropdown is gone');
  });
});

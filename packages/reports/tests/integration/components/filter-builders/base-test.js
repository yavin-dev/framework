import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { A as arr } from '@ember/array';
import Component from '@ember/component';
import BaseFilterBuilderComponent from 'navi-reports/components/filter-builders/base';
import $ from 'jquery';

const requestFragment = {
  type: 'dimension',
  columnMetadata: {
    name: 'Device Type'
  }
};

const filter = {
  subject: requestFragment,
  operator: {
    id: 'in',
    name: 'Equals',
    valuesComponent: 'mock/values-component'
  },
  values: [1, 2, 3]
};
const supportedOperators = [
  { id: 'in', name: 'Equals', valuesComponent: 'mock/values-component' },
  {
    id: 'notin',
    name: 'Not Equals',
    valuesComponent: 'mock/values-component'
  },
  {
    id: 'null',
    name: 'Is Empty',
    valuesComponent: 'mock/another-values-component'
  }
];

const TEMPLATE = hbs`
<FilterBuilders::Base
  @onUpdateFilter={{this.onUpdateFilter}}
  @isCollapsed={{this.isCollapsed}} 
/>`;
module('Integration | Component | filter-builders/base', function(hooks) {
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
      'component:filter-builders/base',
      class extends BaseFilterBuilderComponent {
        get filter() {
          return filter;
        }
        get supportedOperators() {
          return supportedOperators;
        }
        get requestFragment() {
          return requestFragment;
        }
      }
    );
    this.owner.register(
      'component:mock/values-component',
      Component.extend({
        classNames: 'mock-value-component',
        layout: hbs`<div>Test</div>`
      })
    );
    this.owner.register('component:mock/another-values-component', Component.extend());
  });

  test('it renders', async function(assert) {
    assert.expect(4);

    await render(TEMPLATE);

    assert
      .dom('.filter-builder__subject')
      .hasText(filter.subject.columnMetadata.name, "Subject's name is display in filter builder");

    assert
      .dom('.filter-builder__operator .ember-power-select-selected-item')
      .hasText(filter.operator.name, 'The filter current operator is selected by default');

    assert.dom('.mock-value-component').isVisible('The component specified by the filter operator is rendered');

    await clickTrigger();
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent.trim()),
      arr(supportedOperators).mapBy('name'),
      'All supported operators show up as options in the operator selector'
    );
  });

  test('collapsed', async function(assert) {
    assert.expect(1);

    this.set('isCollapsed', true);
    await render(TEMPLATE);

    assert
      .dom('.filter-builder')
      .hasText(
        `${filter.subject.columnMetadata.name} ${filter.operator.name.toLowerCase()} Test`,
        'Rendered correctly when collapsed'
      );
  });

  test('changing operator', async function(assert) {
    assert.expect(3);

    this.set('onUpdateFilter', changeSet => {
      assert.equal(changeSet.operator, 'notin', 'Selected operator is given to action');

      assert.notOk(
        'values' in changeSet,
        'Values is not reset when changing between operator with the same valuesComponent'
      );
    });

    await render(TEMPLATE);

    /* == Operator with same valuesComponent == */
    await clickTrigger();
    await nativeMouseUp($('.ember-power-select-option:contains(Not Equals)')[0]);

    /* == Operator with different valuesComponent == */
    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet.values, [], 'Values is reset when changing between operators to avoid conflicts');
    });
    await clickTrigger();
    await nativeMouseUp($('.ember-power-select-option:contains(Is Empty)')[0]);
  });
});

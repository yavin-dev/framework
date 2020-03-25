import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import $ from 'jquery';
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';

const filter = {
  subject: {
    name: 'Device Type'
  },
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

module('Integration | Component | filter-builders/base', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    /*
     * Normally supportedOperators will be provided by the child class,
     * but to simplify testing we pass it in
     */
    this.setProperties({
      filter,
      supportedOperators
    });
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

    await render(hbs`{{filter-builders/base filter=filter supportedOperators=supportedOperators }}`);

    assert
      .dom('.filter-builder__subject')
      .hasText(filter.subject.name, "Subject's long name is display in filter builder");

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

    await render(hbs`<FilterBuilders::Base
      @filter={{this.filter}}
      @supportedOperators={{this.supportedOperators}}
      @isCollapsed={{true}} />`);

    assert
      .dom('.filter-builder')
      .hasText(
        `${filter.subject.name} ${filter.operator.name.toLowerCase()} Test`,
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

    await render(
      hbs`{{filter-builders/base filter=filter supportedOperators=supportedOperators onUpdateFilter=(action onUpdateFilter)}}`
    );

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

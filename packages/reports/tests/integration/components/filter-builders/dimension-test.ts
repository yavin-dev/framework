import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import Component from '@ember/component';
import { A as arr } from '@ember/array';
import { TestContext } from 'ember-test-helpers';
import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

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
  },
  {
    id: 'contains',
    name: 'Contains',
    valuesComponent: 'mock/values-component',
    showFields: true
  }
];

let metadataService: { loadMetadata: () => any };

module('Integration | Component | filter-builders/dimension', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    /*
     * Normally supportedOperators will be provided by the child class,
     * but to simplify testing we pass it in
     */
    const factory = this.owner.lookup('service:fragment-factory');

    metadataService = this.owner.lookup('service:navi-metadata');
    await metadataService.loadMetadata();
    let filter = factory.createFilter('dimension', 'bardOne', 'userDeviceType', { field: 'id' }, 'in', [1, 2, 3]);
    this.setProperties({
      filter,
      supportedOperators
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

    assert.dom('.filter-builder').hasText(
      `${this.filter.columnMetadata.name} ${arr(supportedOperators)
        .findBy('id', this.filter.operator)
        .name.toLowerCase()} dimension values`,
      'Rendered correctly when collapsed'
    );

    const factory = this.owner.lookup('service:fragment-factory');
    const field = 'desc',
      filterWithDescField = factory.createFilter('dimension', 'bardOne', 'userDeviceType', { field: field }, 'in', [
        1,
        2,
        3
      ]);

    this.set('filter', filterWithDescField);

    assert.dom('.filter-builder').hasText(
      `${filterWithDescField.columnMetadata.name}
         ${arr(supportedOperators)
           .findBy('id', filterWithDescField.operator)
           .name.toLowerCase()} dimension values`,
      'Rendered correctly with field when collapsed'
    );
  });

  skip('changing operator with field', async function(assert) {
    assert.expect(6);

    this.set('onUpdateFilter', changeSet => {
      assert.equal(changeSet.operator, 'contains', 'Selected operator is given to action');

      this.set(
        'filter.operator',
        this.supportedOperators.find(oper => oper.id === changeSet.operator)
      );
    });

    await render(
      hbs`{{filter-builders/dimension filter=this.filter supportedOperators=supportedOperators onUpdateFilter=(action onUpdateFilter)}}`
    );

    await clickTrigger();
    await nativeMouseUp($('.ember-power-select-option:contains(Contains)')[0]);

    assert.dom('.filter-builder-dimension__field').exists('Field dropdown is shown');

    this.set('onUpdateFilter', changeSet => {
      assert.equal(changeSet.field, 'desc', 'Selected field is given to action');

      this.set('this.filter.field', changeSet.field);
    });

    await clickTrigger('.filter-builder-dimension__field');
    await nativeMouseUp($('.ember-power-select-option:contains(desc)')[0]);

    this.set('onUpdateFilter', changeSet => {
      assert.equal(changeSet.operator, 'notin', 'Selected operator is given to action');
      assert.equal(changeSet.field, 'id', 'field is switched back to id');

      this.set(
        'this.filter.operator',
        this.supportedOperators.find(oper => oper.id === changeSet.operator)
      );
      this.set('this.filter.field', changeSet.field);
    });

    await clickTrigger('.filter-builder-dimension__operator');
    await nativeMouseUp($('.ember-power-select-option:contains(Not Equals)')[0]);

    assert.dom('.filter-builder__field').doesNotExist('Field dropdown is gone');
  });
});

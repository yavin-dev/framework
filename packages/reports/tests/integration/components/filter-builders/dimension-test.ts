import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
// @ts-ignore
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { TestContext as Context } from 'ember-test-helpers';
import hbs from 'htmlbars-inline-precompile';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import FilterFragment from 'navi-core/models/request/filter';

interface TestContext extends Context {
  filter: FilterFragment;
}
const TEMPLATE = hbs`
  <FilterBuilders::Dimension
    @filter={{this.filter}}
    @isCollapsed={{this.isCollapsed}}
  />`;

module('Integration | Component | filter-builders/dimension', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const factory = this.owner.lookup('service:fragment-factory');
    this.set(
      'filter',
      factory.createFilter('dimension', 'bardOne', 'userDeviceType', { field: 'id' }, 'in', [1, 2, 3])
    );
    this.set('isCollapsed', false);
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('it renders', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert
      .dom('.filter-builder__subject')
      .hasText(`${this.filter.columnMetadata.name} id`, "Subject's name is display in filter builder");

    assert
      .dom('.filter-builder__operator-trigger .ember-power-select-selected-item')
      .hasText('Equals', 'The filter current operator is selected by default');

    assert.deepEqual(
      findAll('.filter-values--dimension-select__trigger .ember-power-select-multiple-option').map((el) =>
        el.textContent
          ?.split('\n')
          .map((l) => l.trim())
          .join('')
      ),
      ['×1', '×2', '×3'],
      'The filter values are rendered correctly'
    );

    await clickTrigger('.filter-builder__operator');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['Equals', 'Not Equals', 'Is Empty', 'Is Not Empty', 'Contains'],
      'All supported operators show up as options in the operator selector'
    );
  });

  test('collapsed', async function (this: TestContext, assert) {
    this.set('isCollapsed', true);
    await render(TEMPLATE);

    assert
      .dom('.filter-builder')
      .hasText(`${await this.filter.displayNiceName} equals 1 2 3`, 'Rendered correctly when collapsed');
  });
});

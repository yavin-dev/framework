import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
// @ts-ignore
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/services/fragment-factory';

interface TestContext extends Context {
  filter: FilterFragment;
}
const TEMPLATE = hbs`<FilterBuilders::Metric 
  @filter={{this.filter}} 
  @isCollapsed={{this.isCollapsed}} 
/>`;

module('Integration | Component | filter-builders/metric', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const factory: FragmentFactory = this.owner.lookup('service:fragment-factory');
    this.set('filter', factory.createFilter('metric', 'bardOne', 'pageViews', {}, 'gt', [30]));
    this.set('isCollapsed', false);
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('displayName', async function(this: TestContext, assert) {
    await render(TEMPLATE);

    assert
      .dom('.filter-builder__subject')
      .hasText(this.filter.displayName, "Subject's name is display in filter builder");

    assert
      .dom('.filter-builder__operator .ember-power-select-selected-item')
      .hasText('Greater than (>)', 'The filter current operator is selected by default');
    assert.dom('.filter-values--value-input').hasValue('30', 'The filter values are rendered correctly');

    await clickTrigger();
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent?.trim()),
      [
        'Greater than (>)',
        'Greater than or equals (>=)',
        'Less than (<)',
        'Less than or equals (<=)',
        'Equals (=)',
        'Not equals (!=)',
        'Between (<=>)',
        'Not between (!<=>)'
      ],
      'All supported operators show up as options in the operator selector'
    );
  });

  test('collapsed', async function(assert) {
    this.set('isCollapsed', true);
    await render(TEMPLATE);

    assert.dom('.filter-builder').hasText('Page Views greater than (>) 30', 'Rendered correctly when collapsed');
  });
});

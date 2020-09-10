import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
// @ts-ignore
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { TestContext as Context } from 'ember-test-helpers';
import hbs from 'htmlbars-inline-precompile';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';

interface TestContext extends Context {
  filter: FilterFragment;
}

module('Integration | Component | filter-builders/date-dimension', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const factory = this.owner.lookup('service:fragment-factory');
    this.set(
      'filter',
      factory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'gte', ['2020-09-08'])
    );

    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('it renders', async function(this: TestContext, assert) {
    await render(hbs`
        <FilterBuilders::DateDimension
          @filter={{this.filter}}
          @isCollapsed={{false}} />
        />`);

    assert
      .dom('.filter-builder__subject')
      .hasText(this.filter.columnMetadata.name, "Subject's name is display in filter builder");

    assert
      .dom('.filter-builder__operator .ember-power-select-selected-item')
      .hasText('Since (>=)', 'The filter current operator is selected by default');

    await clickTrigger();
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent?.trim()),
      ['Since (>=)', 'Before (<)', 'Between (<=>)'],
      'All supported operators show up as options in the operator selector'
    );
  });

  test('collapsed', async function(this: TestContext, assert) {
    await render(hbs`<FilterBuilders::DateDimension
      @filter={{this.filter}}
      @isCollapsed={{true}} />
    `);

    assert
      .dom('.filter-builder')
      .hasText(`${this.filter.columnMetadata.name} since (>=) Sep 08, 2020`, 'Rendered correctly when collapsed');
  });
});

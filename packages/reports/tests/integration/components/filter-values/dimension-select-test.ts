import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { clickTrigger, selectChoose, selectSearch, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import AgeValues from 'navi-data/mirage/bard-lite/dimensions/age';
import ContainerValues from 'navi-data/mirage/bard-lite/dimensions/container';
import config from 'ember-get-config';
import { TestContext as Context } from 'ember-test-helpers';
import $ from 'jquery';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/services/fragment-factory';
import { Server, Request } from 'miragejs';

interface TestContext extends Context {
  server: Server;
  fragmentFactory: FragmentFactory;
  filter: FilterFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

const HOST = config.navi.dataSources[0].uri;

module('Integration | Component | filter values/dimension select', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', [
      '1',
      '2',
      '3',
    ]);
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardOne' });
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardTwo' });
  });

  test('it renders', async function (this: TestContext, assert) {
    await render(hbs`<FilterValues::DimensionSelect @filter={{this.filter}} @isCollapsed={{this.isCollapsed}} />`);

    // Open value selector
    await clickTrigger();

    const selectedValueText = findAll('.ember-power-select-multiple-option span:nth-of-type(2)').map((el) =>
      el.textContent?.trim()
    );
    const expectedValueDimensions = AgeValues.filter(({ id }) => this.filter.values.includes(id));

    assert.deepEqual(
      selectedValueText,
      expectedValueDimensions.map(({ id }) => id),
      'Filter value ids are converted into full dimension objects and displayed as selected'
    );

    let optionText = findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      expectedOptionText = AgeValues.map(({ id }) => id);
    /*
     * Since ember-collection is used for rendering the dropdown options,
     * some later options may be cropped from the DOM, so just check the first 10
     */
    optionText.length = 10;
    expectedOptionText.length = 10;

    assert.deepEqual(
      optionText,
      expectedOptionText,
      'Given Age as the filter subject, all age values are present in the value selector'
    );

    this.set('isCollapsed', true);

    assert.dom().hasText('1 2 3', 'Selected values are rendered correctly when collapsed');
  });

  test('it works for dimensions from other datasources', async function (this: TestContext, assert) {
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardTwo', 'container', { field: 'id' }, 'in', [
      '1',
      '2',
      '3',
    ]);

    await render(hbs`
      <FilterValues::DimensionSelect 
        @filter={{this.filter}} 
        @isCollapsed={{this.isCollapsed}} 
      />
    `);

    // Open value selector
    await clickTrigger();

    const selectedValueText = findAll('.ember-power-select-multiple-option span:nth-of-type(2)').map((el) =>
      el.textContent?.trim()
    );
    const expectedValueDimensions = ContainerValues.filter(({ id }) => this.filter.values.includes(id));
    assert.deepEqual(
      selectedValueText,
      expectedValueDimensions.map(({ id }) => id),
      'Filter value ids are converted into full dimension objects and displayed as selected'
    );

    const optionText = findAll('.ember-power-select-option').map((el) => el.textContent?.trim());
    const expectedOptionText = ContainerValues.map(({ id }) => id);

    /*
     * Since ember-collection is used for rendering the dropdown options,
     * some later options may be cropped from the DOM, so just check the first 10
     */
    optionText.length = 10;
    expectedOptionText.length = 10;

    assert.deepEqual(
      optionText,
      expectedOptionText,
      'Given Age as the filter subject, all age values are present in the value selector'
    );

    this.set('isCollapsed', true);

    assert.dom().hasText('1 2 3', 'Selected values are rendered correctly when collapsed');
  });

  test('no values', async function (this: TestContext, assert) {
    this.server.get(`${HOST}/v1/dimensions/age/values`, (_schema: TODO, request: Request) => {
      if (request.queryParams.filters === 'age|id-in[]') {
        assert.notOk(true, 'dimension-select should not request dimension values when the filter has no values');
      }

      return { rows: [] };
    });

    this.filter = this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', []);

    await render(hbs`<FilterValues::DimensionSelect @filter={{this.filter}} />`);

    assert
      .dom('input')
      .hasAttribute('placeholder', 'Age (id) Values', 'The dimension display name is used as the placeholder text');
  });

  test('changing values', async function (this: TestContext, assert) {
    assert.expect(1);

    this.onUpdateFilter = (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(
        changeSet.values,
        [...this.filter.values, '5'],
        'The newly selected value is added to existing values and given to action'
      );
    };

    await render(
      hbs`<FilterValues::DimensionSelect @filter={{this.filter}} @onUpdateFilter={{this.onUpdateFilter}} />`
    );

    await selectChoose('.filter-values--dimension-select__trigger', 5);
  });

  test('error state', async function (assert) {
    await render(hbs`<FilterValues::DimensionSelect @filter={{this.filter}} @isCollapsed={{this.isCollapsed}} />`);
    assert.dom('.filter-values--dimension-select--error').isNotVisible('The input should not have error state');

    this.set('filter.values', undefined);
    assert.dom('.filter-values--dimension-select--error').isVisible('The input should have error state');

    this.set('isCollapsed', true);
    assert.dom('.filter-values--selected-error').exists('Error is rendered correctly when collapsed');
  });

  test('filters stay applied while selecting', async function (this: TestContext, assert) {
    assert.expect(2);
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardTwo', 'container', { field: 'desc' }, 'in', []);

    const searchTerm = 'Bag';

    this.onUpdateFilter = (changeSet: Partial<FilterFragment>) => {
      this.set('filter.values', changeSet.values);
    };

    await render(
      hbs`<FilterValues::DimensionSelect @filter={{this.filter}} @onUpdateFilter={{this.onUpdateFilter}} />`
    );

    await clickTrigger();
    await selectSearch('.filter-values--dimension-select__trigger', searchTerm);

    const visibleOptions = () =>
      findAll('.ember-power-select-option')
        .filter((el) => (el as HTMLElement).offsetParent !== null) // only visible elements
        .map((el) => el.textContent?.trim())
        .sort();

    const expectedValueDimensions = ContainerValues.map(({ description }) => description).filter((desc) =>
      desc.includes(searchTerm)
    );

    assert.deepEqual(visibleOptions(), expectedValueDimensions, `Only values containing '${searchTerm}' are displayed`);

    await nativeMouseUp($(`.ember-power-select-option:contains(Bag)`)[0]);

    assert.deepEqual(
      visibleOptions(),
      expectedValueDimensions,
      `Only values containing ${searchTerm} are displayed, even after changing selection`
    );
  });
});

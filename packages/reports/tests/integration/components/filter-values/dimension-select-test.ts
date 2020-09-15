import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, fillIn, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
//@ts-ignore
import AgeValues from 'navi-data/mirage/bard-lite/dimensions/age';
//@ts-ignore
import ContainerValues from 'navi-data/mirage/bard-lite/dimensions/container';
import config from 'ember-get-config';
import { TestContext as Context } from 'ember-test-helpers';
import $ from 'jquery';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/services/fragment-factory';
import { Server, Request } from 'miragejs';
import { FilterConfig } from 'navi-reports/components/filter-builders/base';
import { A as arr } from '@ember/array';

interface TestContext extends Context {
  server: Server;
  fragmentFactory: FragmentFactory;
  filter: FilterConfig;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

const HOST = config.navi.dataSources[0].uri;

function createFilterConfig(filter: FilterFragment): FilterConfig {
  return {
    subject: filter,
    operator: filter.operator,
    values: arr(filter.values)
  };
}

module('Integration | Component | filter values/dimension select', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    this.fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = createFilterConfig(
      this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', ['1', '2', '3'])
    );
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('it renders', async function(this: TestContext, assert) {
    assert.expect(3);

    await render(hbs`<FilterValues::DimensionSelect @filter={{this.filter}} @isCollapsed={{this.isCollapsed}} />`);

    // Open value selector
    await clickTrigger();

    let selectedValueText = findAll('.ember-power-select-multiple-option span:nth-of-type(2)').map(el =>
        el.textContent?.trim()
      ),
      expectedValueDimensions = AgeValues.filter((age: { id: string }) => this.filter.values.includes(age.id));

    assert.deepEqual(
      selectedValueText,
      expectedValueDimensions.map((age: { description: string; id: string }) => `${age.description} (${age.id})`),
      'Filter value ids are converted into full dimension objects and displayed as selected'
    );

    let optionText = findAll('.ember-power-select-option').map(el => el.textContent?.trim()),
      expectedOptionText = AgeValues.map(
        (age: { description: string; id: string }) => `${age.description} (${age.id})`
      );

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

    assert.dom().hasText('under 13 (1) 13-17 (2) 18-20 (3)', 'Selected values are rendered correctly when collapsed');
  });

  test('it works for dimensions from other datasources', async function(this: TestContext, assert) {
    assert.expect(3);
    await this.owner.lookup('service:navi-metadata').loadMetadata({ dataSourceName: 'bardTwo' });

    this.filter = createFilterConfig(
      this.fragmentFactory.createFilter('dimension', 'bardTwo', 'container', { field: 'id' }, 'in', ['1', '2', '3'])
    );

    await render(hbs`
      <FilterValues::DimensionSelect 
        @filter={{this.filter}} 
        @isCollapsed={{this.isCollapsed}} 
      />
    `);

    // Open value selector
    await clickTrigger();

    let selectedValueText = findAll('.ember-power-select-multiple-option span:nth-of-type(2)').map(el =>
        el.textContent?.trim()
      ),
      expectedValueDimensions = ContainerValues.filter((container: { id: string }) =>
        this.filter.values.includes(container.id)
      );

    assert.deepEqual(
      selectedValueText,
      expectedValueDimensions.map(
        (container: { description: string; id: string }) => `${container.description} (${container.id})`
      ),
      'Filter value ids are converted into full dimension objects and displayed as selected'
    );

    let optionText = findAll('.ember-power-select-option').map(el => el.textContent?.trim()),
      expectedOptionText = ContainerValues.map(
        (container: { description: string; id: string }) => `${container.description} (${container.id})`
      );

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

    assert.dom().hasText('Bag (1) Bank (2) Saddle Bag (3)', 'Selected values are rendered correctly when collapsed');
  });

  test('no values', async function(this: TestContext, assert) {
    assert.expect(1);

    this.server.get(`${HOST}/v1/dimensions/age/values`, (_schema: TODO, request: Request) => {
      if (request.queryParams.filters === 'age|id-in[]') {
        assert.notOk(true, 'dimension-select should not request dimension values when the filter has no values');
      }

      return { rows: [] };
    });

    this.filter = createFilterConfig(
      this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', [])
    );

    await render(hbs`<FilterValues::DimensionSelect @filter={{this.filter}} />`);

    assert
      .dom('input')
      .hasAttribute('placeholder', 'Age Values', 'The dimension long name is used as the placeholder text');
  });

  test('changing values', async function(this: TestContext, assert) {
    assert.expect(1);

    this.onUpdateFilter = (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(
        changeSet.values,
        [...this.filter.subject.values, '5'],
        'The newly selected value is added to existing values and given to action'
      );
    };

    await render(
      hbs`<FilterValues::DimensionSelect @filter={{this.filter}} @onUpdateFilter={{this.onUpdateFilter}} />`
    );

    // Select a new value
    await clickTrigger();
    await nativeMouseUp($('.ember-power-select-option:contains(25-29)')[0]);
    // Assert handled in action
  });

  test('error state', async function(assert) {
    assert.expect(3);

    await render(hbs`<FilterValues::DimensionSelect @filter={{this.filter}} @isCollapsed={{this.isCollapsed}} />`);
    assert.dom('.filter-values--dimension-select--error').isNotVisible('The input should not have error state');

    this.set('filter.validations', { attrs: { rawValues: { isInvalid: true } } });
    assert.dom('.filter-values--dimension-select--error').isVisible('The input should have error state');

    this.set('isCollapsed', true);
    assert.dom('.filter-values--selected-error').exists('Error is rendered correctly when collapsed');
  });

  test('filters stay applied while selecting', async function(this: TestContext, assert) {
    assert.expect(2);
    this.filter = createFilterConfig(
      this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', [])
    );

    const searchTerm = '5';
    const selectedId = '5';

    this.onUpdateFilter = (changeSet: Partial<FilterFragment>) => {
      this.set('filter.values', changeSet.values);
    };

    await render(
      hbs`<FilterValues::DimensionSelect @filter={{this.filter}} @onUpdateFilter={{this.onUpdateFilter}} />`
    );

    await clickTrigger();
    await fillIn('.ember-power-select-trigger-multiple-input', searchTerm);
    await triggerEvent('.ember-power-select-trigger-multiple-input', 'keyup');

    let visibleOptions = () =>
      findAll('.ember-power-select-option')
        .filter(el => (el as HTMLElement).offsetParent !== null) // only visible elements
        .map(el => el.textContent?.trim());

    const expectedValueDimensions = AgeValues.map(
      (age: { description: string; id: string }) => `${age.description} (${age.id})`
    ).filter((str: string) => str.includes(searchTerm));

    assert.deepEqual(visibleOptions(), expectedValueDimensions, `Only values containing '${searchTerm}' are displayed`);

    await nativeMouseUp($(`.ember-power-select-option:contains("(${selectedId})")`)[0]);

    assert.deepEqual(
      visibleOptions(),
      expectedValueDimensions,
      `Only values containing ${searchTerm} are displayed, even after changing selection`
    );
  });
});

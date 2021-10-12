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
import Service from '@ember/service';
import NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import { task, TaskGenerator } from 'ember-concurrency';
import type NaviDimensionModel from 'navi-data/models/navi-dimension';
import type { TestContext as Context } from 'ember-test-helpers';
import type FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import type FragmentFactory from 'navi-core/services/fragment-factory';
import type { Server, Request } from 'miragejs';
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type { Factory } from 'navi-data/models/native-with-create';

interface TestContext extends Context {
  server: Server;
  fragmentFactory: FragmentFactory;
  filter: FilterFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
  dimensionModelFactory: Factory<typeof NaviDimensionModel>;
}

const HOST = config.navi.dataSources[0].uri;

const TEMPLATE = hbs`
<FilterValues::DimensionSelect
  @filter={{this.filter}}
  @isCollapsed={{this.isCollapsed}}
  @onUpdateFilter={{this.onUpdateFilter}}
/>
`;

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
    this.dimensionModelFactory = this.owner.factoryFor('model:navi-dimension');
  });

  test('it renders', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    // Open value selector
    await clickTrigger();

    const selectedValueText = findAll(
      '.ember-power-select-option[aria-selected=true] .filter-values--dimension-select__option-value'
    ).map((el) => el.textContent?.trim());

    const expectedValueDimensions = AgeValues.filter(({ id }) => this.filter.values.includes(id));

    assert.deepEqual(
      selectedValueText,
      expectedValueDimensions.map(({ id }) => id),
      'Filter value ids are converted into full dimension objects and displayed as selected'
    );

    const optionText = findAll('.ember-power-select-option').map((el) =>
      el.textContent
        ?.trim()
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s)
    );
    const expectedOptionText = AgeValues.map(({ id, description }) => [id, `description: ${description}`]);
    /*
     * Since vertical-collection is used for rendering the dropdown options,
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

    await render(TEMPLATE);

    // Open value selector
    await clickTrigger();

    const selectedValueText = findAll(
      '.ember-power-select-option[aria-selected=true] .filter-values--dimension-select__option-value'
    ).map((el) => el.textContent?.trim());

    const expectedValueDimensions = ContainerValues.filter(({ id }) => this.filter.values.includes(id));
    assert.deepEqual(
      selectedValueText,
      expectedValueDimensions.map(({ id }) => id),
      'Filter value ids are converted into full dimension objects and displayed as selected'
    );

    const optionText = findAll('.ember-power-select-option').map((el) =>
      el.textContent
        ?.trim()
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s)
    );
    const expectedOptionText = ContainerValues.map(({ id, description }) => [id, `description: ${description}`]);

    /*
     * Since vertical-collection is used for rendering the dropdown options,
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

    await render(TEMPLATE);

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

    await render(TEMPLATE);

    await selectChoose('.filter-values--dimension-select__trigger', 5);
  });

  test('error state', async function (assert) {
    await render(TEMPLATE);
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

    await render(TEMPLATE);

    await clickTrigger();
    await selectSearch('.filter-values--dimension-select__trigger', searchTerm);

    const visibleOptions = () =>
      findAll('.ember-power-select-option')
        .filter((el) => (el as HTMLElement).offsetParent !== null) // only visible elements
        .map((el) =>
          el.textContent
            ?.trim()
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s)
        );

    const expectedValueDimensions = ContainerValues.filter(({ description }) =>
      description.includes(searchTerm)
    ).map(({ id, description }) => [description, `id: ${id}`]);

    assert.deepEqual(visibleOptions(), expectedValueDimensions, `Only values containing '${searchTerm}' are displayed`);

    await nativeMouseUp('.ember-power-select-option div[title="Bag"]');

    assert.deepEqual(
      visibleOptions(),
      expectedValueDimensions,
      `Only values containing ${searchTerm} are displayed, even after changing selection`
    );
  });

  test('sort is applied numerically', async function (this: TestContext, assert) {
    assert.expect(1);
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', []);
    const factory = this.dimensionModelFactory;

    class MockDimensions extends Service {
      @task *all(dimensionColumn: DimensionColumn): TaskGenerator<NaviDimensionModel[]> {
        const rawValues = ['1', '3', '2', '11', '111'];
        const values = rawValues.map((value) => factory.create({ value, dimensionColumn }));
        return yield NaviDimensionResponse.create({ values });
      }
    }

    this.owner.register('service:navi-dimension', MockDimensions);
    await render(TEMPLATE);

    // Open value selector
    await clickTrigger();
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['1', '2', '3', '11', '111'],
      'Sort is applied numerically for string number dimensions'
    );
  });

  test('sort is applied lexicographically', async function (this: TestContext, assert) {
    assert.expect(1);
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', []);
    const factory = this.dimensionModelFactory;

    class MockDimensions extends Service {
      @task *all(dimensionColumn: DimensionColumn): TaskGenerator<NaviDimensionModel[]> {
        const rawValues = ['1', '3', '2', '11', '111', 'stringvalue'];
        const values = rawValues.map((value) => factory.create({ value, dimensionColumn }));
        return yield NaviDimensionResponse.create({ values });
      }
    }

    this.owner.register('service:navi-dimension', MockDimensions);
    await render(TEMPLATE);

    // Open value selector
    await clickTrigger();
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['1', '11', '111', '2', '3', 'stringvalue'],
      'Sort is applied lexicographically if not all string values are numbers'
    );
  });

  test('sort is applied to search', async function (this: TestContext, assert) {
    assert.expect(1);
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardOne', 'property', { field: 'id' }, 'in', []);
    const factory = this.dimensionModelFactory;

    class MockDimensions extends Service {
      @task *search(dimensionColumn: DimensionColumn): TaskGenerator<NaviDimensionModel[]> {
        const rawValues = ['1', '3', '2', '11', '111'];
        const values = rawValues.map((value) => factory.create({ value: `Property ${value}`, dimensionColumn }));
        return yield NaviDimensionResponse.create({ values });
      }
    }

    this.owner.register('service:navi-dimension', MockDimensions);
    await render(TEMPLATE);

    await clickTrigger(); // open
    await selectSearch('.filter-values--dimension-select__trigger', 'Property');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['Property 1', 'Property 11', 'Property 111', 'Property 2', 'Property 3'],
      'Sort is applied as number for string number dimensions'
    );
  });

  test('local search', async function (this: TestContext, assert) {
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', []);
    await render(TEMPLATE);

    await selectSearch('.filter-values--dimension-select__trigger', '10');
    assert.deepEqual(
      findAll('.filter-values--dimension-select__option').map((el) => [
        el.querySelector('.filter-values--dimension-select__option-value')?.textContent?.trim(),
        el.querySelector('.filter-values--dimension-select__option-context')?.textContent?.trim(),
      ]),
      [['10', 'description: 65 and over']],
      'For small cardinality dimensions, local search uses dimension values'
    );

    await selectSearch('.filter-values--dimension-select__trigger', 'Un');
    assert.deepEqual(
      findAll('.filter-values--dimension-select__option').map((el) => [
        el.querySelector('.filter-values--dimension-select__option-value')?.textContent?.trim(),
        el.querySelector('.filter-values--dimension-select__option-context')?.textContent?.trim(),
      ]),
      [
        ['-1', 'description: Unknown'],
        ['1', 'description: under 13'],
      ],
      'For small cardinality dimensions, local search uses context values'
    );
  });

  test('changing dimension parameters', async function (this: TestContext, assert) {
    this.filter = this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', []);
    await render(TEMPLATE);

    await selectSearch('.filter-values--dimension-select__trigger', '10');
    assert.deepEqual(
      findAll('.filter-values--dimension-select__option').map((el) => [
        el.querySelector('.filter-values--dimension-select__option-value')?.textContent?.trim(),
        el.querySelector('.filter-values--dimension-select__option-context')?.textContent?.trim(),
      ]),
      [['10', 'description: 65 and over']],
      '`dimension-select` fetches values for initial dimension field'
    );
    //close select
    await clickTrigger();

    //change field to `description`
    this.set(
      'filter',
      this.fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'description' }, 'in', [])
    );

    await selectSearch('.filter-values--dimension-select__trigger', 'over');
    assert.deepEqual(
      findAll('.filter-values--dimension-select__option').map((el) => [
        el.querySelector('.filter-values--dimension-select__option-value')?.textContent?.trim(),
        el.querySelector('.filter-values--dimension-select__option-context')?.textContent?.trim(),
      ]),
      [['65 and over', 'id: 10']],
      '`dimension-select` fetches values for new dimension field'
    );
  });
});

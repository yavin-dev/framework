import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import $ from 'jquery';
import { render, click, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { assertTooltipRendered, assertTooltipNotRendered, assertTooltipContent } from 'ember-tooltips/test-support';
import config from 'ember-get-config';
import { clickItem, clickItemFilter, getItem, getAll } from 'navi-reports/test-support/report-builder';

let Store, MetadataService, Age;

const TEMPLATE = hbs`<DimensionSelector
  @request={{this.request}}
  @onAddDimension={{this.onAddDimension}}
  @onAddDimensionFilter={{this.onAddDimensionFilter}}
/>`;

module('Integration | Component | dimension selector', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:navi-metadata');

    this.set('onAddDimension', () => {});
    this.set('onAddDimensionFilter', () => {});

    await MetadataService.loadMetadata();
    Age = MetadataService.getById('dimension', 'age', 'bardOne');

    //set report object
    this.set(
      'request',
      Store.createFragment('bard-request-v2/request', {
        table: 'tableA',
        dataSource: 'bardOne',
        filters: [
          {
            field: 'age',
            parameters: { field: 'id' },
            type: 'dimension',
            source: 'bardOne',
            operator: 'in',
            values: [1],
          },
        ],
      })
    );
  });

  test('it renders', async function (assert) {
    assert.expect(3);

    await render(TEMPLATE);

    assert.dom('.checkbox-selector--dimension').isVisible('The dimension selector component is rendered');

    assert
      .dom('.navi-list-selector')
      .isVisible('a navi-list-selector component is rendered as part of the dimension selector');

    assert.dom('.grouped-list').exists('a grouped-list component is rendered as part of the dimension selector');
  });

  test('groups', async function (assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.grouped-list__group-header').map((el) => el.textContent.trim()),
      ['test (27)', 'Asset (4)', 'Date (1)'],
      'The groups rendered by the component include dimension groups and Date'
    );
  });

  test('add dimension', async function (assert) {
    assert.expect(2);

    await render(TEMPLATE);

    this.set('onAddDimension', (item) => {
      assert.equal(item.name, 'Gender', 'the gender dimension item is passed as a param to the action');
    });

    //addDimension when an unselected dimension is clicked
    await clickItem('dimension', 'Gender');

    //clicking again adds again
    await clickItem('dimension', 'Gender');
  });

  test('filter icon', async function (assert) {
    assert.expect(3);

    await render(TEMPLATE);

    const { item: age, reset: resetAge } = await getItem('dimension', 'Age');
    assert
      .dom(age.querySelector('.grouped-list__filter'))
      .hasClass('grouped-list__filter--active', 'The filter icon with the age dimension has the active class');
    await resetAge();

    const { item: gender, reset: resetGender } = await getItem('dimension', 'Gender');
    assert
      .dom(gender.querySelector('.grouped-list__filter'))
      .doesNotHaveClass(
        'grouped-list__filter--active',
        'The filter icon with the gender dimension does not have the active class'
      );
    await resetGender();

    this.set('onAddDimensionFilter', (dimension) => {
      assert.deepEqual(dimension, Age, 'The age dimension is passed to the action when filter icon is clicked');
    });

    await clickItemFilter('dimension', 'Age');
  });

  test('tooltip', async function (assert) {
    assert.expect(3);

    await render(TEMPLATE);

    this.server.get(`${config.navi.dataSources[0].uri}/v1/dimensions/age`, function () {
      return {
        name: 'age',
        longName: 'Age',
        cardinality: 100,
        category: 'test',
        datatype: 'text',
        storageStrategy: 'loaded',
        description: 'foo',
      };
    });
    assertTooltipNotRendered(assert);

    await click($('.grouped-list__group-header:contains(test)')[0]);
    // triggerTooltipTargetEvent will not work for hidden element

    const { item: age, reset: resetAge } = await getItem('dimension', 'Age');
    await triggerEvent(age.querySelector('.grouped-list__item-info'), 'mouseenter');

    assertTooltipRendered(assert);
    assertTooltipContent(assert, {
      contentString: 'foo',
    });
    await resetAge();
  });

  test('ranked search', async function (assert) {
    assert.expect(2);

    await render(TEMPLATE);

    const allDimensions = await getAll('dimension');
    assert.deepEqual(
      allDimensions.filter((dim) => dim.includes('Country')),
      ['Property Country', 'User Country'],
      'Initially the country dimensions are ordered alphabetically'
    );

    const filteredDimensions = await getAll('dimension', 'count');

    assert.deepEqual(
      filteredDimensions,
      ['User Country', 'Property Country'],
      'The search results are ranked based on relevance'
    );
  });
});

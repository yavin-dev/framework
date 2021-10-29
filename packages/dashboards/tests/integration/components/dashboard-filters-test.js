import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import { A as arr } from '@ember/array';

let Store, MetadataService;

const serializedFilter1 = {
  field: 'age',
  operator: 'in',
  parameters: {
    field: 'id',
  },
  type: 'dimension',
  values: ['1', '2'],
};
const mockFragment1 = {
  ...serializedFilter1,
  source: 'bardOne',
  columnMetadata: {
    name: 'Age',
    primaryKeyFieldName: 'id',
    cardinality: 'SMALL',
  },
};
const mockFragment2 = {
  type: 'dimension',
  field: 'currency',
  operator: 'contains',
  parameters: {
    field: 'desc',
  },
  values: ['3', '4'],
  source: 'bardOne',
  columnMetadata: {
    name: 'Currency',
    primaryKeyFieldName: 'id',
    cardinality: 'SMALL',
  },
};
const dashboard = { filters: [mockFragment1, mockFragment2] };

module('Integration | Component | dashboard filters', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata();

    this.set('dashboard', dashboard);
    this.setProperties({
      onUpdateFilter: () => null,
      onRemoveFilter: () => null,
      onAddFilter: () => null,
    });

    await render(hbs`
      <DashboardFilters
        @dashboard={{this.dashboard}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @onRemoveFilter={{this.onRemoveFilter}}
        @onAddFilter={{this.onAddFilter}}
      />`);
  });

  test('it renders empty', async function (assert) {
    assert.expect(1);

    this.set('dashboard', { filters: [] });

    assert
      .dom()
      .hasText('Filters No Filters Configured', 'When no filters are provided, only no filters msg is rendered');
  });

  test('toggle collapse', async function (assert) {
    assert.expect(2);

    assert.dom('.dashboard-filters--collapsed').isVisible('Filters component is collapsed initially');

    await click('.dashboard-filters__expand-button');

    assert.dom('.dashboard-filters--expanded').isVisible('Filters component expands when expand button is clicked');
  });

  test('it renders all filters attached to the dashboard', async function (assert) {
    assert.expect(2);

    assert
      .dom('.filter-collection--collapsed')
      .hasText('Age (id) equals 1 2 Currency (desc) contains 3 4', 'The filters are rendered correctly when collapsed');

    await click('.dashboard-filters__expand-button');

    assert
      .dom('.dashboard-filters-collection .filter-collection__row')
      .exists({ count: 2 }, 'A filter collection row is rendered for each filter when expanded');
  });

  test('A filter can be added', async function (assert) {
    this.set('dashboard', {
      filters: arr([]),
      widgets: Promise.resolve([
        {
          requests: arr([
            {
              table: 'a',
              tableMetadata: {
                id: 'a',
                dimensions: [
                  { id: 'productFamily', name: 'Product Family', category: 'cat1', primaryKeyFieldName: 'id' },
                  { id: 'dim2', name: 'dim2', category: 'cat2', primaryKeyFieldName: 'id' },
                ],
                timeDimensions: [],
              },
              dataSource: 'bardOne',
            },
          ]),
        },

        {
          requests: arr([
            {
              table: 'b',
              tableMetadata: {
                id: 'b',
                dimensions: [
                  { id: 'dim3', name: 'dim3', category: 'cat2', primaryKeyFieldName: 'id' },
                  { id: 'dim1', name: 'dim1', category: 'cat1', primaryKeyFieldName: 'id' },
                ],
                timeDimensions: [],
              },
              dataSource: 'bardOne',
            },
          ]),
        },
      ]),
    });

    this.set('onAddFilter', (dimension) => {
      const filter = Store.createFragment('request/filter', {
        type: 'dimension',
        field: dimension.field,
        parameters: {
          field: 'id',
        },
        operator: 'in',
        values: [],
        source: 'bardOne',
      });

      this.dashboard.filters.pushObject(filter);
    });

    assert
      .dom('.dashboard-filters--expanded__add-filter-button')
      .doesNotExist('add filter button is not visible when collapsed initially');

    await click('.dashboard-filters__expand-button');

    assert
      .dom('.dashboard-filters--expanded__add-filter-button')
      .isDisabled('add filter button is disabled when adding a new filter');

    assert
      .dom('.dashboard-filters--expanded-add-row')
      .exists('new filter row exits after expanding when no filters exists');

    assert
      .dom('.dashboard-filters--expanded-add-row__close')
      .isDisabled('removing new filter row is disable if it is the only filter');

    await selectChoose('.dashboard-filters--expanded-add-row__dimension-selector', '.ember-power-select-option', 1);

    assert
      .dom('.dashboard-filters--expanded__add-filter-button')
      .isNotDisabled('add filter button is enabled after a new filter column is selected');

    assert.dom('.filter-collection__remove').isNotDisabled('removing filter row is enabled once a column is selected');

    assert.dom('.dashboard-filters--expanded-add-row').isNotVisible('add row vanishes after selecting a column');

    assert.dom('.filter-builder__subject').hasText('Product Family id');

    await click('.dashboard-filters--expanded__add-filter-button');

    assert
      .dom('.dashboard-filters--expanded-add-row')
      .exists('new filter row exists after clicking add new filter button');

    assert
      .dom('.dashboard-filters--expanded__add-filter-button')
      .isDisabled('add filter button is disabled when adding a new filter');

    assert
      .dom('.dashboard-filters--expanded-add-row__close')
      .isNotDisabled('removing new filter row is enabled if it is not the only filter');

    await click('.dashboard-filters--expanded-add-row__close');

    assert
      .dom('.dashboard-filters--expanded-add-row')
      .doesNotExist('new filter row is removed after clicking remove button');
  });

  test('updating a filter', async function (assert) {
    assert.expect(2);

    this.set('onUpdateFilter', (filter, changeSet) => {
      assert.deepEqual(filter.serialize(), serializedFilter1, 'Filter to update is given to action');
      assert.deepEqual(
        changeSet,
        {
          operator: 'isnull',
          values: [true],
        },
        'Operator update is requested'
      );
    });

    await click('.dashboard-filters__expand-button');
    await selectChoose('.filter-builder__operator-trigger', 'Is Empty');
  });

  test('remove a filter', async function (assert) {
    assert.expect(1);

    this.set('onRemoveFilter', (filter) => {
      assert.deepEqual(
        filter.serialize(),
        serializedFilter1,
        'When clicking remove icon, remove action is sent with selected filter'
      );
    });

    await click('.dashboard-filters__expand-button');
    await click('.filter-collection__remove');
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import $ from 'jquery';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import { A as arr } from '@ember/array';

let Store, MetadataService;

const filterFragment1 = {
    dimension: {
      id: 'age',
      name: 'Age',
      primaryKeyFieldName: 'id'
    },
    operator: 'in',
    field: 'id',
    rawValues: ['1', '2']
  },
  filterFragment2 = {
    dimension: {
      id: 'currency',
      name: 'Currency',
      primaryKeyFieldName: 'id'
    },
    operator: 'contains',
    field: 'desc',
    rawValues: ['3', '4']
  },
  dashboard = {
    filters: [filterFragment1, filterFragment2]
  };

module('Integration | Component | dashboard filters', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    await MetadataService.loadMetadata();

    this.set('dashboard', dashboard);
    this.setProperties({
      onUpdateFilter: () => null,
      onRemoveFilter: () => null,
      onAddFilter: () => null
    });

    await render(hbs`
      <DashboardFilters
        @dashboard={{this.dashboard}}
        @onUpdateFilter={{action this.onUpdateFilter}}
        @onRemoveFilter={{action this.onRemoveFilter}}
        @onAddFilter={{action this.onAddFilter}}
      />`);
  });

  test('it renders empty', async function(assert) {
    assert.expect(1);

    this.set('dashboard', {});

    assert.dom().hasText('Settings', 'When no filters are provided, only "Settings" is rendered');
  });

  test('toggle collapse', async function(assert) {
    assert.expect(2);

    assert.dom('.dashboard-filters--collapsed').isVisible('Filters component is collapsed initially');

    await click('.dashboard-filters__expand-button');

    assert.dom('.dashboard-filters--expanded').isVisible('Filters component expands when expand button is clicked');
  });

  test('it renders all filters attached to the dashboard', async function(assert) {
    assert.expect(2);

    assert
      .dom('.filter-collection--collapsed')
      .hasText(
        'Age equals under 13 (1) 13-17 (2) Currency (desc) contains 3 4',
        'The filters are rendered correctly when collapsed'
      );

    await click('.dashboard-filters__expand-button');

    assert
      .dom('.dashboard-filters-collection .filter-collection__row')
      .exists({ count: 2 }, 'A filter collection row is rendered for each filter when expanded');
  });

  test('A filter can be added', async function(assert) {
    assert.expect(10);

    this.set('dashboard', {
      filters: arr([]),
      widgets: Promise.resolve([
        {
          requests: arr([
            {
              logicalTable: {
                table: {
                  id: 'a',
                  dimensions: [
                    { id: 'productFamily', name: 'Product Family', category: 'cat1', primaryKeyFieldName: 'id' },
                    { id: 'dim2', name: 'dim2', category: 'cat2', primaryKeyFieldName: 'id' }
                  ]
                },
                timeGrain: 'day'
              }
            }
          ])
        },

        {
          requests: arr([
            {
              logicalTable: {
                table: {
                  id: 'b',
                  dimensions: [
                    { id: 'dim3', name: 'dim3', category: 'cat2', primaryKeyFieldName: 'id' },
                    { id: 'dim1', name: 'dim1', category: 'cat1', primaryKeyFieldName: 'id' }
                  ]
                },
                timeGrain: 'day'
              }
            }
          ])
        }
      ])
    });

    this.set('onAddFilter', dimension => {
      const filter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', dimension.dimension),
        operator: 'in'
      });

      this.get('dashboard.filters').pushObject(filter);
    });

    assert
      .dom('.dashboard-filters--expanded__add-filter-button')
      .isNotVisible('add filter button is not visible when collapsed initially');

    await click('.dashboard-filters__expand-button');

    assert
      .dom('.dashboard-filters--expanded__add-filter-button')
      .isVisible('add filter button is visible when expanded');

    await click('.dashboard-filters--expanded__add-filter-button');

    assert.dom('.dashboard-filters--expanded__add-filter-button').isNotVisible('add filter button vanishes');

    assert.dom('.dashboard-filters--expanded-add-row').isVisible('add row appears');

    await click('.dashboard-filters--expanded-add-row__close');

    assert.dom('.dashboard-filters--expanded__add-filter-button').isVisible('add filter button is back');

    await click('.dashboard-filters--expanded__add-filter-button');

    assert.dom('.dashboard-filters--expanded__add-filter-button').isNotVisible('add filter button vanishes again');

    assert.dom('.dashboard-filters--expanded-add-row').isVisible('add row appears again');

    await selectChoose('.dashboard-filters--expanded-add-row__dimension-selector', '.ember-power-select-option', 1);

    assert.dom('.dashboard-filters--expanded__add-filter-button').isVisible('add filter button appears again');

    assert.dom('.dashboard-filters--expanded-add-row').isNotVisible('add row vanishes again');

    assert.dom('.filter-builder-dimension__subject').hasText('Product Family');
  });

  test('updating a filter', async function(assert) {
    assert.expect(2);

    this.set('onUpdateFilter', (filter, changeSet) => {
      assert.equal(filter, filterFragment1, 'Filter to update is given to action');
      assert.deepEqual(
        changeSet,
        {
          field: 'id',
          operator: 'null',
          values: []
        },
        'Operator update is requested'
      );
    });

    await click('.dashboard-filters__expand-button');
    await clickTrigger(`#${$('.filter-builder-dimension__operator:eq(0)').attr('id')}`);
    await nativeMouseUp($('.ember-power-select-option:contains(Is Empty)')[0]);
  });

  test('remove a filter', async function(assert) {
    assert.expect(1);

    this.set('onRemoveFilter', filter => {
      assert.equal(filter, filterFragment1, 'When clicking remove icon, remove action is sent with selected filter');
    });

    await click('.dashboard-filters__expand-button');
    await click('.filter-collection__remove');
  });
});

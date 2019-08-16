import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import hbs from 'htmlbars-inline-precompile';
import { selectChoose } from 'ember-power-select/test-support';
import { A as arr } from '@ember/array';
import { get } from '@ember/object';

let Store, MetadataService;

module('Integration | Component | dashboard filters expanded', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  test('it renders all filters attached to the dashboard', async function(assert) {
    assert.expect(2);

    this.dashboard = {
      filters: [
        {
          dimension: {
            name: 'age',
            longName: 'Age'
          },
          operator: 'in',
          field: 'key',
          rawValues: ['age|4', 'age|7', 'age|9'],
          values: [
            { key: 'age|7', id: 'age|4', description: 'Something' },
            { key: 'age|4', id: 'age|7', description: 'ValueDesc' }
          ]
        },
        {
          dimension: {
            name: 'os',
            longName: 'Operating System'
          },
          operator: 'contains',
          field: 'id',
          rawValues: ['1', '2'],
          values: [{ id: '1', description: 'Something' }, { id: '2', description: 'ValueDesc' }]
        },
        {
          dimension: {
            name: 'currency',
            longName: 'Currency'
          },
          operator: 'notin',
          field: 'id',
          rawValues: ['1', '2'],
          values: [{ id: '2', description: 'ValueDesc' }]
        }
      ]
    };
    this.onUpdateFilter = () => null;
    this.onRemoveFilter = () => null;
    this.onAddFilter = () => null;
    await render(hbs`
      {{dashboard-filters-expanded 
        dashboard=dashboard 
        onUpdateFilter=(action onUpdateFilter)
        onRemoveFilter=(action onRemoveFilter)
        onAddFilter=(action onAddFilter)
      }}`);

    assert
      .dom('.dashboard-filter-collection')
      .isVisible('Filter collection is rendered when component is passed a dashboard with filters');

    assert
      .dom('.dashboard-filter-collection .filter-collection__row')
      .exists({ count: 3 }, 'A filter collection row is rendered for each filter');
  });

  test('A filter can be added', async function(assert) {
    assert.expect(9);

    this.dashboard = {
      filters: arr([]),
      widgets: Promise.resolve([
        {
          requests: arr([
            {
              logicalTable: {
                table: {
                  name: 'a',
                  timeGrain: 'day'
                },
                timeGrain: {
                  dimensions: [
                    { name: 'productFamily', longName: 'Product Family', category: 'cat1' },
                    { name: 'dim2', longName: 'dim2', category: 'cat2' }
                  ]
                }
              }
            }
          ])
        },

        {
          requests: arr([
            {
              logicalTable: {
                table: {
                  name: 'b',
                  timeGrain: 'day'
                },
                timeGrain: {
                  dimensions: [
                    { name: 'dim3', longName: 'dim3', category: 'cat2' },
                    { name: 'dim1', longName: 'dim1', category: 'cat1' }
                  ]
                }
              }
            }
          ])
        }
      ])
    };
    this.onUpdateFilter = () => null;
    this.onRemoveFilter = () => null;
    this.onAddFilter = function(dashboard, dimension) {
      const filter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', dimension.dimension),
        operator: 'in'
      });

      get(dashboard, 'filters').pushObject(filter);
    };
    await render(hbs`
      {{dashboard-filters-expanded 
        dashboard=dashboard 
        onUpdateFilter=(action onUpdateFilter)
        onRemoveFilter=(action onRemoveFilter)
        onAddFilter=(action onAddFilter)
      }}`);

    assert.dom('.dashboard-filters-expanded__add-filter-button').isVisible('add filter button visible');

    await click('.dashboard-filters-expanded__add-filter-button');

    assert.dom('.dashboard-filters-expanded__add-filter-button').isNotVisible('add filter button vanishes');

    assert.dom('.dashboard-filters-expanded-add-row').isVisible('add row appears');

    await click('.dashboard-filters-expanded-add-row__close');

    assert.dom('.dashboard-filters-expanded__add-filter-button').isVisible('add filter button is back');

    await click('.dashboard-filters-expanded__add-filter-button');

    assert.dom('.dashboard-filters-expanded__add-filter-button').isNotVisible('add filter button vanishes again');

    assert.dom('.dashboard-filters-expanded-add-row').isVisible('add row appears again');

    await selectChoose('.dashboard-filters-expanded-add-row__dimension-selector', '.ember-power-select-option', 1);

    assert.dom('.dashboard-filters-expanded__add-filter-button').isVisible('add filter button appears again');

    assert.dom('.dashboard-filters-expanded-add-row').isNotVisible('add row vanishes again');

    assert.dom('.filter-builder-dimension__subject').hasText('Product Family');
  });
});

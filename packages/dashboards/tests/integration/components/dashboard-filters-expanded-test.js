import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dashboard filters expanded', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const MetadataService = this.owner.lookup('service:bard-metadata');
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
    await render(hbs`{{dashboard-filters-expanded dashboard=dashboard}}`);

    assert
      .dom('.dashboard-filter-collection')
      .isVisible('Filter collection is rendered when component is passed a dashboard with filters');

    assert
      .dom('.dashboard-filter-collection .filter-collection__row')
      .exists({ count: 3 }, 'A filter collection row is rendered for each filter');
  });
});

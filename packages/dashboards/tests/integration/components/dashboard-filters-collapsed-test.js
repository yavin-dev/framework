import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | dashboard filters collapsed', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  test('it renders empty', async function(assert) {
    await render(hbs`{{dashboard-filters-collapsed}}`);

    assert.dom(this.element).hasText('', 'When no filters are provided, no text is rendered');
  });

  test('it renders all filters attached to the dashboard', async function(assert) {
    this.dashboard = {
      filters: [
        {
          dimension: {
            name: 'property',
            longName: 'Property'
          },
          operator: 'in',
          field: 'key',
          rawValues: ['property|4', 'property|7', 'property|9'],
          values: [
            { key: 'property|7', id: 'property|4', description: 'Something' },
            { key: 'property|4', id: 'property|7', description: 'ValueDesc' },
            { key: 'property|9', id: 'property|9' }
          ]
        },
        {
          dimension: {
            name: 'fish',
            longName: 'Fish'
          },
          operator: 'contains',
          field: 'id',
          rawValues: ['1', '2'],
          values: [{ id: '1', description: 'Something' }, { id: '2', description: 'ValueDesc' }]
        },
        {
          dimension: {
            name: 'dog',
            longName: 'Dog'
          },
          operator: 'notin',
          field: 'id',
          rawValues: ['1', '2'],
          values: [{ id: '2', description: 'ValueDesc' }]
        }
      ]
    };
    await render(hbs`{{dashboard-filters-collapsed dashboard=dashboard}}`);

    assert
      .dom(this.element)
      .hasText(
        'Property equals ValueDesc (property|7), Something (property|4), property|9 Fish contains Something (1), ValueDesc (2) Dog not equals 1, ValueDesc (2)',
        'All filters are correctly displayed'
      );
  });
});

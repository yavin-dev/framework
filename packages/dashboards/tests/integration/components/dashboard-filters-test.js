import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | dashboard filters', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  test('it renders empty', async function(assert) {
    await render(hbs`{{dashboard-filters}}`);

    assert.dom(this.element).hasText('Settings', 'When no filters are provided, only "Settings" is rendered');
  });

  test('it renders', async function(assert) {
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
      {{dashboard-filters 
        dashboard=dashboard 
        onUpdateFilter=(action onUpdateFilter)
        onRemoveFilter=(action onRemoveFilter)
        onAddFilter=(action onAddFilter)
      }}`);

    assert.dom('.dashboard-filters-collapsed').isVisible('Filters component is collapsed initially');

    await click('.dashboard-filters__expand-button');

    assert.dom('.dashboard-filters-expanded').isVisible('Filters component expands when expand button is clicked');
  });
});

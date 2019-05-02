import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dashboard-filters-collapsed', 'Integration | Component | dashboard filters collapsed', {
  integration: true
});

test('it renders empty', function(assert) {
  this.render(hbs`{{dashboard-filters-collapsed}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Settings',
    'When no filters are provided, only "Settings" is rendered'
  );
});

test('it renders all filters attached to the dashboard', function(assert) {
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
          { key: 'property|4', id: 'property|7', description: 'ValueDesc' }
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
  this.render(hbs`{{dashboard-filters-collapsed dashboard=dashboard}}`);

  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Settings Property equals ValueDesc (property|4), Something (property|7), property|9 Fish contains Something (1), ValueDesc (2) Dog not equals 1, ValueDesc (2)',
    'All filters are correctly displayed'
  );
});

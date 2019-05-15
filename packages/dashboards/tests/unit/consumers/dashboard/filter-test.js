import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { A as arr } from '@ember/array';

let consumer;

module('Unit | Consumer | dashboard/filter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    consumer = this.owner.factoryFor('consumer:dashboard/filter').create();
  });

  test('Update Filter', function(assert) {
    assert.expect(2);

    let filter = {
      field: 'key',
      dimension: {
        name: 'age'
      },
      operator: 'in',
      rawValues: ['age|4', 'age|7', 'age|9']
    };

    consumer.send('updateFilter', filter, { operator: 'notin', rawValues: [] });

    assert.deepEqual(
      filter,
      {
        field: 'key',
        dimension: {
          name: 'age'
        },
        operator: 'notin',
        rawValues: []
      },
      'updateFilter updates the properties based on the passed in changeset'
    );

    consumer.send('updateFilter', filter, {});

    assert.deepEqual(
      filter,
      {
        field: 'key',
        dimension: {
          name: 'age'
        },
        operator: 'notin',
        rawValues: []
      },
      "updateFilter doesn't change the filter when an empty changeSet is passed in"
    );
  });

  test('Remove Filter', function(assert) {
    assert.expect(2);

    let filter = {
        field: 'key',
        dimension: {
          name: 'age'
        },
        operator: 'in',
        rawValues: ['age|4', 'age|7', 'age|9']
      },
      dashboard = {
        title: 'Test Dashboard',
        filters: arr([filter])
      };

    consumer.send('removeFilter', dashboard, filter);

    assert.deepEqual(dashboard.filters, [], 'Filter is removed from dashboard');

    dashboard.filters = arr([{ name: 'Other Filter' }]);

    consumer.send('removeFilter', dashboard, filter);

    assert.deepEqual(
      dashboard.filters,
      [{ name: 'Other Filter' }],
      'No filters are removed if passed filter is not in the dashboard'
    );
  });
});

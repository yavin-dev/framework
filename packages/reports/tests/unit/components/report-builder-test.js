import { A as arr } from '@ember/array';
import { get, set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | Report Builder', function(hooks) {
  setupTest(hooks);

  test('allTables', function(assert) {
    assert.expect(1);

    let component = this.owner.factoryFor('component:report-builder').create();
    set(component, 'metadataService', {
      all: () =>
        arr([
          { name: '12345', id: '2', isFact: true },
          { name: '9876', id: '1', isFact: false },
          { name: 'DATASOURCE_B', id: '3', isFact: true },
          { name: 'DATASOURCE_A', id: '4', isFact: true },
          { name: 'table-B', id: '5', isFact: true },
          { name: 'Advertisement', id: '7', isFact: true },
          { name: 'table-A', id: '6', isFact: false },
          { name: 'advertisement', id: '8', isFact: true }
        ])
    });

    assert.deepEqual(
      get(component, 'allTables'),
      [
        { name: '12345', id: '2', isFact: true },
        { name: 'advertisement', id: '8', isFact: true },
        { name: 'Advertisement', id: '7', isFact: true },
        { name: 'DATASOURCE_A', id: '4', isFact: true },
        { name: 'DATASOURCE_B', id: '3', isFact: true },
        { name: 'table-B', id: '5', isFact: true }
      ],
      'List of tables are sorted alphabetically and filtered to fact tables'
    );
  });
});

import { A as arr } from '@ember/array';
import { get, set } from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | Report Builder', function(hooks) {
  setupTest(hooks);

  test('allTables', function(assert) {
    assert.expect(1);

    let component = run(() => this.owner.factoryFor('component:report-builder').create()),
      expectedOrdering = [
        { name: '12345', id: '2' },
        { name: '9876', id: '1' },
        { name: 'advertisement', id: '8' },
        { name: 'Advertisement', id: '7' },
        { name: 'DATASOURCE_A', id: '4' },
        { name: 'DATASOURCE_B', id: '3' },
        { name: 'table-A', id: '6' },
        { name: 'table-B', id: '5' }
      ];
    set(component, 'metadataService', {
      all: () =>
        arr([
          { name: '9876', id: '1' },
          { name: '12345', id: '2' },
          { name: 'DATASOURCE_B', id: '3' },
          { name: 'DATASOURCE_A', id: '4' },
          { name: 'table-B', id: '5' },
          { name: 'table-A', id: '6' },
          { name: 'Advertisement', id: '7' },
          { name: 'advertisement', id: '8' }
        ])
    });

    assert.deepEqual(get(component, 'allTables'), expectedOrdering, 'List of tables are sorted alphabetically');
  });
});

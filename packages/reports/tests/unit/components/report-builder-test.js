import { A as arr } from '@ember/array';
import { get, set } from '@ember/object';
import { run } from '@ember/runloop';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('report-builder', 'Unit | Component | Report Builder', {
  unit: true,
  needs: ['service:bard-metadata']
});

test('allTables', function(assert) {
  assert.expect(1);

  let component = run(() => this.subject()),
    expectedOrdering = [
      { longName: '12345', id: '2' },
      { longName: '9876', id: '1' },
      { longName: 'advertisement', id: '8' },
      { longName: 'Advertisement', id: '7' },
      { longName: 'DATASOURCE_A', id: '4' },
      { longName: 'DATASOURCE_B', id: '3' },
      { longName: 'table-A', id: '6' },
      { longName: 'table-B', id: '5' }
    ];
  set(component, 'metadataService', {
    all: () =>
      arr([
        { longName: '9876', id: '1' },
        { longName: '12345', id: '2' },
        { longName: 'DATASOURCE_B', id: '3' },
        { longName: 'DATASOURCE_A', id: '4' },
        { longName: 'table-B', id: '5' },
        { longName: 'table-A', id: '6' },
        { longName: 'Advertisement', id: '7' },
        { longName: 'advertisement', id: '8' }
      ])
  });

  assert.deepEqual(get(component, 'allTables'), expectedOrdering, 'List of tables are sorted alphabetically');
});

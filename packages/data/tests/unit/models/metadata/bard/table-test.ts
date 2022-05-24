import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import BardTableMetadataModel from 'navi-data/models/metadata/bard/table';
import type { BardTableMetadataPayload } from 'navi-data/models/metadata/bard/table';

let Payload: BardTableMetadataPayload, Table: BardTableMetadataModel;

module('Unit | Model | metadata/bard/table', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    Payload = {
      id: 'tableA',
      name: 'Table A',
      description: 'Table A',
      category: 'table',
      cardinality: 'LARGE',
      metricIds: ['pv'],
      isFact: true,
      dimensionIds: ['age'],
      timeDimensionIds: ['orderDate'],
      timeGrainIds: ['day', 'month', 'week'],
      requestConstraintIds: [],
      hasAllGrain: false,
      source: 'bardOne',
      tags: ['DISPLAY'],
    };

    Table = new BardTableMetadataModel(this.owner.lookup('service:client-injector'), Payload);
  });

  test('it properly hydrates properties', function (assert) {
    assert.expect(1);

    assert.deepEqual(Table['timeGrainIds'], ['day', 'week', 'month'], 'timeGrainIds property is hydrated properly');
  });

  test('it returns timegrains', function (assert) {
    assert.expect(1);

    assert.deepEqual(
      Table.timeGrains,
      [
        {
          id: 'day',
          name: 'Day',
        },
        {
          id: 'week',
          name: 'Week',
        },
        {
          id: 'month',
          name: 'Month',
        },
      ],
      'timegrains property is hydrated properly'
    );
  });
});

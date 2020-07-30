import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Store;

module('Unit | Serializer | Request V2', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('v1 normalization', async function(assert) {
    assert.expect(29);

    const requestV1 = {
      requestVersion: 'v1',
      logicalTable: {
        table: 'network',
        timeGrain: 'day'
      },
      intervals: [
        {
          end: 'current',
          start: 'P7D'
        }
      ],
      dimensions: [
        {
          dimension: 'age'
        },
        {
          dimension: 'platform'
        }
      ],
      filters: [
        {
          dimension: 'age',
          field: 'id',
          operator: 'in',
          values: ['2']
        },
        {
          dimension: 'platform',
          field: 'desc',
          operator: 'contains',
          values: ['win']
        }
      ],
      metrics: [
        {
          metric: 'revenue',
          parameters: {
            currency: 'USD',
            as: 'm1'
          }
        },
        {
          metric: 'revenue',
          parameters: {
            currency: 'CAD',
            as: 'm2'
          }
        },
        {
          metric: 'adClicks'
        }
      ],
      having: [
        {
          metric: 'm1',
          operator: 'lt',
          values: [24]
        },
        {
          metric: 'adClicks',
          operator: 'gt',
          values: [11]
        }
      ],
      sort: [
        {
          metric: 'dateTime',
          direction: 'desc'
        },
        {
          metric: 'm2',
          direction: 'asc'
        }
      ]
    };

    Store.pushPayload({
      data: {
        type: 'fragments-v2-mock',
        id: '99',
        attributes: { request: requestV1 }
      }
    });

    const {
      request: { filters, columns, sorts, table, requestVersion }
    } = Store.peekRecord('fragments-v2-mock', '99');

    assert.equal(table, 'network', 'table name is normalized correctly');

    assert.equal(requestVersion, '2.0', 'request version is set correctly');

    assert.equal(columns.length, 6, 'request has correct number of columns');

    assert.equal(columns.objectAt(0).columnMetadata.id, 'dateTime', 'dateTime column is normalized correctly');
    assert.equal(columns.objectAt(0).type, 'timeDimension', 'dateTime column type is set correctly');
    assert.deepEqual(columns.objectAt(0).parameters, { grain: 'day' }, 'dateTime column has correct parameters');

    assert.equal(columns.objectAt(1).columnMetadata.id, 'age', 'dimension columns are normalized correctly');
    assert.deepEqual(columns.objectAt(1).parameters, {}, 'dimension columns have no parameters');

    assert.equal(columns.objectAt(3).columnMetadata.id, 'revenue', 'metric columns are normalized correctly');
    assert.deepEqual(columns.objectAt(3).parameters, { currency: 'USD' }, 'metric columns have correct parameters');

    assert.equal(filters.length, 5, 'request has correct number of filter fragments');

    assert.equal(filters.objectAt(0).columnMetadata.id, 'dateTime', 'dateTime filter is normalized correctly');
    assert.equal(filters.objectAt(0).type, 'timeDimension', 'dateTime filter type is set correctly');
    assert.equal(filters.objectAt(0).operator, 'bet', 'dateTime filter operator is set correctly');
    assert.deepEqual(filters.objectAt(0).values, ['P7D', 'current'], 'dateTime filter values are set correctly');

    assert.equal(filters.objectAt(1).columnMetadata.id, 'age', 'dimension filters are normalized correctly');
    assert.deepEqual(
      filters.objectAt(1).parameters,
      { projection: 'id' },
      'dimension filter has correct `id` projection param'
    );
    assert.equal(filters.objectAt(1).operator, 'in', 'dimension filter operator are normalized correctly');
    assert.deepEqual(filters.objectAt(1).values, ['2'], 'dimension filter values are normalized correctly');

    assert.deepEqual(
      filters.objectAt(2).parameters,
      { projection: 'desc' },
      'dimension filter has correct `desc` projection param'
    );

    assert.equal(filters.objectAt(3).columnMetadata.id, 'revenue', 'metric filters are normalized correctly');
    assert.deepEqual(filters.objectAt(3).parameters, { currency: 'USD' }, 'metric filters have correct parameters');
    assert.equal(filters.objectAt(3).operator, 'lt', 'metric filter operator are normalized correctly');
    assert.deepEqual(filters.objectAt(3).values, [24], 'metric filter values are normalized correctly');

    assert.equal(sorts.length, 2, 'request has correct number of sort fragments');

    assert.equal(sorts.objectAt(0).columnMetadata.id, 'dateTime', 'dateTime sort is normalized correctly');
    assert.equal(sorts.objectAt(0).direction, 'desc', 'dateTime sort direction is normalized correctly');

    assert.equal(sorts.objectAt(1).columnMetadata.id, 'revenue', 'metric sorts are normalized correctly');
    assert.deepEqual(sorts.objectAt(1).parameters, { currency: 'CAD' }, 'metric sorts have correct parameters');
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { normalizeTableV2, TableVisMetadataPayload, TableVisualizationMetadata } from 'navi-core/serializers/table';
import { RequestV2 } from 'navi-data/adapters/facts/interface';

const defaultAttributes = {
  canAggregateSubtotal: undefined,
  format: undefined
};
const expected: TableVisualizationMetadata = {
  metadata: {
    columnAttributes: {
      '0': defaultAttributes,
      '1': {
        canAggregateSubtotal: undefined,
        format: '0.00'
      },
      '2': {
        canAggregateSubtotal: false,
        format: undefined
      },
      '3': {
        canAggregateSubtotal: undefined,
        format: ''
      },
      '4': defaultAttributes,
      '5': defaultAttributes,
      '6': defaultAttributes,
      '7': defaultAttributes
    },
    showTotals: {
      grandTotal: true,
      subtotal: 7
    }
  },
  type: 'table',
  version: 2
};

module('Unit | Serializer | table', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('normalizeTableV2', function(assert) {
    assert.expect(4);

    const initialMetadata: TableVisMetadataPayload = {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          { field: 'clicks', type: 'metric', hasCustomDisplayName: true, displayName: 'My clicks' },
          {
            field: { metric: 'pageViews', parameters: {} },
            type: 'metric',
            displayName: 'Page Views',
            format: '0.00',
            //@ts-expect-error
            foo: 'bar'
          },
          {
            attributes: { name: 'revenue', parameters: { currency: 'EUR' }, canAggregateSubtotal: false },
            type: 'metric',
            displayName: 'Revenue (EUR)'
          },
          { field: 'revenue(currency=USD)', type: 'metric', displayName: 'Revenue (USD)', format: '' },
          { field: 'gender', type: 'dimension', displayName: 'Gender' },
          { field: { dimension: 'age' }, type: 'dimension', displayName: 'Age' },
          {
            attributes: { name: 'platform' },
            type: 'dimension',
            displayName: 'Platform',
            //@ts-expect-error
            foo: 'bar'
          },
          { field: 'dateTime', type: 'dateTime', displayName: 'Date' }
        ],
        showTotals: {
          subtotal: 'dateTime',
          grandTotal: true
        }
      }
    };

    const TestRequest: RequestV2 = {
      table: 'table1',
      dataSource: 'test',
      limit: null,
      requestVersion: '2.0',
      filters: [],
      columns: [
        {
          field: 'table1.dateTime',
          parameters: {
            grain: 'grain1'
          },
          type: 'timeDimension'
        },
        {
          type: 'dimension',
          field: 'platform',
          parameters: {
            field: 'id'
          }
        },
        {
          type: 'metric',
          field: 'revenue',
          parameters: { currency: 'EUR' }
        },
        {
          type: 'dimension',
          field: 'age',
          parameters: {
            field: 'id'
          }
        },
        {
          type: 'dimension',
          field: 'gender',
          parameters: {
            field: 'id'
          }
        },
        {
          type: 'metric',
          field: 'revenue',
          parameters: { currency: 'USD' }
        },
        {
          type: 'metric',
          field: 'pageViews',
          parameters: {}
        },
        {
          type: 'metric',
          field: 'clicks',
          parameters: {}
        }
      ],
      sorts: []
    };

    const v2 = { version: 2, foo: 'ok' };
    assert.deepEqual(
      //@ts-expect-error
      normalizeTableV2({}, v2),
      //@ts-expect-error
      v2,
      'When version 2 is passed in, it does nothing'
    );

    const newMetadata = normalizeTableV2(TestRequest, initialMetadata);

    assert.deepEqual(
      TestRequest.columns.map(c => c.field),
      ['clicks', 'pageViews', 'revenue', 'revenue', 'gender', 'age', 'platform', 'table1.dateTime'],
      'The request columns are reordered based on the table ordering'
    );

    assert.deepEqual(
      TestRequest.columns.map(c => c.alias),
      ['My clicks', undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      'The alias is moved over if it is marked as a custom display name'
    );

    assert.deepEqual(newMetadata, expected, 'The metadata maps column ids to their attributes');
  });
});

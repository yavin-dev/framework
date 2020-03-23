import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { get, set } from '@ember/object';
import { run } from '@ember/runloop';

let Store;

module('Unit | Serializer | Request', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('having and sort serialization', function(assert) {
    assert.expect(4);
    let baseReport = {
      data: {
        type: 'report',
        id: '99',
        attributes: {
          request: {
            logicalTable: { table: 'network' },
            dimensions: [],
            filters: [],
            having: [],
            metrics: [
              {
                metric: 'revenue',
                parameters: {
                  currency: 'USD'
                }
              },
              {
                metric: 'revenue',
                parameters: {
                  currency: 'CAD'
                }
              },
              {
                metric: 'adClicks'
              }
            ]
          }
        }
      }
    };

    run(() => {
      Store.pushPayload(baseReport);
      let report = Store.peekRecord('report', '99');
      set(report, 'request.having', [
        {
          metric: {
            metric: { id: 'revenue' },
            parameters: { currency: 'USD' }
          },
          operator: 'lt',
          values: [2]
        },
        {
          metric: { metric: { id: 'adClicks' } },
          operator: 'gt',
          values: [1]
        }
      ]);

      let serializedReport = report.serialize();
      assert.deepEqual(
        serializedReport.data.attributes.request.having,
        [
          {
            metric: 'm1',
            operator: 'lt',
            values: [2]
          },
          {
            metric: 'adClicks',
            operator: 'gt',
            values: [1]
          }
        ],
        'serializes havings correctly'
      );
      set(report, 'request.having', [
        {
          metric: {
            metric: { id: 'revenue' },
            parameters: { currency: 'JPY' }
          },
          parameters: { currency: 'JPY' },
          operator: 'eq',
          values: [12]
        }
      ]);

      serializedReport = report.serialize();
      assert.deepEqual(
        serializedReport.data.attributes.request.having,
        [
          {
            metric: 'revenue(currency=JPY)',
            operator: 'eq',
            values: [12]
          }
        ],
        "Uses canonicalized name when can't find alias"
      );

      set(report, 'request.sort', [
        {
          metric: {
            metric: { id: 'revenue' },
            parameters: { currency: 'CAD' }
          },
          direction: 'asc'
        },
        {
          metric: { metric: { id: 'adClicks' } },
          direction: 'desc'
        }
      ]);

      serializedReport = report.serialize();
      assert.deepEqual(
        serializedReport.data.attributes.request.sort,
        [
          {
            metric: 'm2',
            direction: 'asc'
          },
          {
            metric: 'adClicks',
            direction: 'desc'
          }
        ],
        'Sort serializes parameterized metrics correctly'
      );

      set(report, 'request.sort', [
        {
          metric: {
            metric: { id: 'revenue' },
            parameters: { currency: 'JPY' }
          },
          direction: 'asc'
        }
      ]);

      serializedReport = report.serialize();
      assert.deepEqual(
        serializedReport.data.attributes.request.sort,
        [
          {
            metric: 'revenue(currency=JPY)',
            direction: 'asc'
          }
        ],
        'Sort serializes to canon name when alias is not found'
      );
    });
  });

  test('having and sort deserialization', function(assert) {
    assert.expect(12);
    let baseReport = {
      data: {
        type: 'report',
        id: '99',
        attributes: {
          request: {
            logicalTable: { table: 'network' },
            dimensions: [],
            filters: [],
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
              },
              {
                metric: 'adClicks',
                direction: 'desc'
              }
            ]
          }
        }
      }
    };

    run(() => {
      Store.pushPayload(baseReport);
      let report = Store.peekRecord('report', '99');
      let request = get(report, 'request');
      let having = get(request, 'having');
      let sort = get(request, 'sort');

      //havings
      assert.equal(
        get(having.objectAt(0), 'metric.metric.id'),
        'revenue',
        'base metric in metric.id in parameterized having'
      );
      assert.equal(get(having.objectAt(0), 'operator'), 'lt', 'having operator is preserved');
      assert.equal(
        get(having.objectAt(0), 'metric.parameters.currency'),
        'USD',
        'parameters are pulled out into their own property'
      );

      assert.equal(
        get(having.objectAt(1), 'metric.metric.id'),
        'adClicks',
        'Simple metrics are handled correctly in having'
      );
      assert.equal(get(having.objectAt(1), 'operator'), 'gt', 'operator is preserved for simple having metrics');

      //dateTime sort
      assert.equal(get(sort.objectAt(0), 'metric.metric.id'), 'dateTime', 'dateTime sort is deserialized properly');
      assert.equal(get(sort.objectAt(0), 'direction'), 'desc', 'dateTime sort direction is preserved');

      //other sorts
      assert.equal(
        get(sort.objectAt(1), 'metric.metric.id'),
        'revenue',
        'base metric in metric.id in parameterized sort'
      );
      assert.equal(get(sort.objectAt(1), 'direction'), 'asc', 'sort direction is preserved');
      assert.equal(
        get(sort.objectAt(1), 'metric.parameters.currency'),
        'CAD',
        'parameters are pulled out into their own property'
      );

      assert.equal(
        get(sort.objectAt(2), 'metric.metric.id'),
        'adClicks',
        'Simple metrics are handled correctly in sort'
      );
      assert.equal(get(sort.objectAt(2), 'direction'), 'desc', 'operator is preserved for simple sort metrics');
    });
  });

  test('multidatasource namespace normalization', async function(assert) {
    assert.expect(6);
    await this.owner.lookup('service:bard-metadata').loadMetadata({ dataSourceName: 'blockhead' });
    const request = {
      logicalTable: { table: 'inventory' },
      dataSource: 'blockhead',
      dimensions: [
        {
          dimension: 'container'
        },
        {
          dimension: 'item'
        }
      ],
      filters: [
        {
          dimension: 'container',
          field: 'id',
          operator: 'in',
          values: ['1']
        }
      ],
      metrics: [
        {
          metric: 'ownedQuantity',
          parameters: {
            as: 'm1'
          }
        },
        {
          metric: 'available',
          parameters: {
            as: 'm2'
          }
        },
        {
          metric: 'personalSold'
        }
      ],
      having: [
        {
          metric: 'm1',
          operator: 'lt',
          values: [24]
        },
        {
          metric: 'personalSold',
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
        },
        {
          metric: 'personalSold',
          direction: 'desc'
        }
      ]
    };

    const serializer = this.owner.lookup('serializer:bard-request/request'),
      type = this.owner.resolveRegistration('model:bard-request/request');

    const result = serializer.normalize(type, request);

    assert.equal(result.data.attributes.logicalTable.table.longName, 'Inventory', 'table meta is normalized correctly');
    assert.deepEqual(
      result.data.attributes.metrics.map(metric => metric.metric.longName),
      ['Quantity of thing', 'How many are available', 'Personally sold amount'],
      'metrics meta is normalized correctly'
    );

    assert.deepEqual(
      result.data.attributes.dimensions.map(dimension => dimension.dimension.longName),
      ['Container', 'Item'],
      'dimension meta is loaded correctly'
    );

    assert.deepEqual(
      result.data.attributes.filters.map(filter => filter.dimension.longName),
      ['Container'],
      'dimension meta is loaded correctly into filters'
    );

    assert.deepEqual(
      result.data.attributes.having.map(having => having.metric.metric.longName),
      ['Quantity of thing', 'Personally sold amount'],
      'metric meta is loaded correctly into havings'
    );

    assert.deepEqual(
      result.data.attributes.sort.map(sort => sort.metric.metric.longName || sort.metric.metric.name),
      ['dateTime', 'How many are available', 'Personally sold amount'],
      'metric meta is loaded correctly into sort'
    );
  });
});

import { module, test } from 'qunit';
import { toggleAlias, normalizeV1, normalizeV1toV2 } from 'navi-core/utils/request';

let request;

module('Unit | Utils | Request', function(hooks) {
  hooks.beforeEach(function() {
    request = {
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
          values: ['24']
        },
        {
          metric: 'm2',
          operator: 'gt',
          values: ['3']
        },
        {
          metric: 'adClicks',
          operator: 'gt',
          values: ['11']
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
  });

  test('toggleAlias', function(assert) {
    assert.expect(2);

    assert.deepEqual(toggleAlias(), [], 'returns an empty array when field is empty');

    let result = toggleAlias(
      request.having,
      {
        m1: 'revenue(currency=USD)',
        m2: 'revenue(currency=CAD)'
      },
      {
        'revenue(currency=USD)': request.metrics[0],
        'revenue(currency=CAD)': request.metrics[1],
        adClicks: request.metrics[2],
        dateTime: { metric: 'dateTime' }
      },
      'bardOne'
    );

    assert.deepEqual(
      result,
      [
        {
          metric: {
            metric: 'bardOne.revenue',
            parameters: {
              as: 'm1',
              currency: 'USD'
            }
          },
          operator: 'lt',
          values: ['24']
        },
        {
          metric: {
            metric: 'bardOne.revenue',
            parameters: {
              as: 'm2',
              currency: 'CAD'
            }
          },
          operator: 'gt',
          values: ['3']
        },
        {
          metric: {
            metric: 'bardOne.adClicks'
          },
          operator: 'gt',
          values: ['11']
        }
      ],
      'normalizes aliased metrics correctly'
    );
  });

  test('normalizeV1', function(assert) {
    assert.expect(7);

    const normalized = normalizeV1(request, 'bardOne');

    assert.equal(normalized.dataSource, 'bardOne', 'dataSource is set correctly');

    assert.equal(normalized.logicalTable.table, 'bardOne.network', 'table is normalized correctly');

    assert.deepEqual(
      normalized.metrics,
      [
        {
          metric: 'bardOne.revenue',
          parameters: {
            currency: 'USD'
          }
        },
        {
          metric: 'bardOne.revenue',
          parameters: {
            currency: 'CAD'
          }
        },
        {
          metric: 'bardOne.adClicks'
        }
      ],
      'metrics are normalized correctly'
    );

    assert.deepEqual(
      normalized.having,
      [
        {
          metric: {
            metric: 'bardOne.revenue',
            parameters: {
              currency: 'USD'
            }
          },
          operator: 'lt',
          values: ['24']
        },
        {
          metric: {
            metric: 'bardOne.revenue',
            parameters: {
              currency: 'CAD'
            }
          },
          operator: 'gt',
          values: ['3']
        },
        {
          metric: {
            metric: 'bardOne.adClicks'
          },
          operator: 'gt',
          values: ['11']
        }
      ],
      'having is normalized correctly'
    );

    assert.deepEqual(
      normalized.sort,
      [
        {
          direction: 'desc',
          metric: {
            metric: 'bardOne.dateTime'
          }
        },
        {
          direction: 'asc',
          metric: {
            metric: 'bardOne.revenue',
            parameters: {
              currency: 'CAD'
            }
          }
        }
      ],
      'sorts are normalized correctly'
    );

    assert.deepEqual(
      normalized.dimensions,
      [
        {
          dimension: 'bardOne.age'
        },
        {
          dimension: 'bardOne.platform'
        }
      ],
      'dimensions are normalized correctly'
    );

    assert.deepEqual(
      normalized.filters,
      [
        {
          dimension: 'bardOne.age',
          field: 'id',
          operator: 'in',
          values: ['2']
        },
        {
          dimension: 'bardOne.platform',
          field: 'desc',
          operator: 'contains',
          values: ['win']
        }
      ],
      'filters are normalized correctly'
    );
  });

  test('normalizeV1 when namespace is not passed in', function(assert) {
    assert.expect(7);

    const normalized = normalizeV1(request);

    assert.equal(normalized.dataSource, undefined, 'dataSource is not updated');

    assert.equal(normalized.logicalTable.table, 'network', 'table is normalized correctly');

    assert.deepEqual(
      normalized.metrics,
      [
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
      ],
      'metrics are normalized correctly'
    );

    assert.deepEqual(
      normalized.having,
      [
        {
          metric: {
            metric: 'revenue',
            parameters: {
              currency: 'USD'
            }
          },
          operator: 'lt',
          values: ['24']
        },
        {
          metric: {
            metric: 'revenue',
            parameters: {
              currency: 'CAD'
            }
          },
          operator: 'gt',
          values: ['3']
        },
        {
          metric: {
            metric: 'adClicks'
          },
          operator: 'gt',
          values: ['11']
        }
      ],
      'having is normalized correctly'
    );

    assert.deepEqual(
      normalized.sort,
      [
        {
          direction: 'desc',
          metric: {
            metric: 'dateTime'
          }
        },
        {
          direction: 'asc',
          metric: {
            metric: 'revenue',
            parameters: {
              currency: 'CAD'
            }
          }
        }
      ],
      'sorts are normalized correctly'
    );

    assert.deepEqual(
      normalized.dimensions,
      [
        {
          dimension: 'age'
        },
        {
          dimension: 'platform'
        }
      ],
      'dimensions are normalized correctly'
    );

    assert.deepEqual(
      normalized.filters,
      [
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
      'filters are normalized correctly'
    );
  });

  test('normalize v1 to v2', function(assert) {
    assert.expect(6);

    const normalized = normalizeV1toV2(request, 'bardOne');

    assert.equal(normalized.requestVersion, '2.0', 'requestVersion is set correctly');

    assert.equal(normalized.dataSource, 'bardOne', 'dataSource is set correctly');

    assert.equal(normalized.table, 'network', 'table is normalized correctly');

    assert.deepEqual(
      normalized.columns,
      [
        {
          field: 'dateTime',
          parameters: {
            grain: 'day'
          },
          type: 'timeDimension'
        },
        {
          field: 'age',
          type: 'dimension',
          parameters: {
            field: 'id'
          }
        },
        {
          field: 'platform',
          type: 'dimension',
          parameters: {
            field: 'id'
          }
        },
        {
          field: 'revenue',
          parameters: {
            currency: 'USD'
          },
          type: 'metric'
        },
        {
          field: 'revenue',
          parameters: {
            currency: 'CAD'
          },
          type: 'metric'
        },
        {
          field: 'adClicks',
          type: 'metric',
          parameters: {}
        }
      ],
      'columns are normalized correctly'
    );

    assert.deepEqual(
      normalized.filters,
      [
        {
          field: 'dateTime',
          operator: 'bet',
          type: 'timeDimension',
          values: ['P7D', 'current'],
          parameters: {
            grain: 'day'
          }
        },
        {
          field: 'age',
          operator: 'in',
          parameters: {
            field: 'id'
          },
          type: 'dimension',
          values: ['2']
        },
        {
          field: 'platform',
          operator: 'contains',
          parameters: {
            field: 'desc'
          },
          type: 'dimension',
          values: ['win']
        },
        {
          field: 'revenue',
          operator: 'lt',
          parameters: {
            currency: 'USD'
          },
          type: 'metric',
          values: ['24']
        },
        {
          field: 'revenue',
          operator: 'gt',
          parameters: {
            currency: 'CAD'
          },
          type: 'metric',
          values: ['3']
        },
        {
          field: 'adClicks',
          operator: 'gt',
          type: 'metric',
          values: ['11'],
          parameters: {}
        }
      ],
      'filters are normalized correctly'
    );

    assert.deepEqual(
      normalized.sorts,
      [
        {
          direction: 'desc',
          field: 'dateTime',
          type: 'timeDimension',
          parameters: {
            grain: 'day'
          }
        },
        {
          direction: 'asc',
          field: 'revenue',
          parameters: {
            currency: 'CAD'
          },
          type: 'metric'
        }
      ],
      'sorts are normalized correctly'
    );
  });

  test('normalize v1 to v2 when namespace is not passed in', function(assert) {
    assert.expect(6);

    const normalized = normalizeV1toV2(request);

    assert.equal(normalized.requestVersion, '2.0', 'requestVersion is set correctly');

    assert.equal(normalized.dataSource, undefined, 'dataSource is not set');

    assert.equal(normalized.table, 'network', 'table is normalized correctly');

    assert.deepEqual(
      normalized.columns,
      [
        {
          field: 'dateTime',
          parameters: {
            grain: 'day'
          },
          type: 'timeDimension'
        },
        {
          field: 'age',
          type: 'dimension',
          parameters: { field: 'id' }
        },
        {
          field: 'platform',
          type: 'dimension',
          parameters: { field: 'id' }
        },
        {
          field: 'revenue',
          parameters: {
            currency: 'USD'
          },
          type: 'metric'
        },
        {
          field: 'revenue',
          parameters: {
            currency: 'CAD'
          },
          type: 'metric'
        },
        {
          field: 'adClicks',
          type: 'metric',
          parameters: {}
        }
      ],
      'columns are normalized correctly'
    );

    assert.deepEqual(
      normalized.filters,
      [
        {
          field: 'dateTime',
          operator: 'bet',
          type: 'timeDimension',
          values: ['P7D', 'current'],
          parameters: {
            grain: 'day'
          }
        },
        {
          field: 'age',
          operator: 'in',
          parameters: {
            field: 'id'
          },
          type: 'dimension',
          values: ['2']
        },
        {
          field: 'platform',
          operator: 'contains',
          parameters: {
            field: 'desc'
          },
          type: 'dimension',
          values: ['win']
        },
        {
          field: 'revenue',
          operator: 'lt',
          parameters: {
            currency: 'USD'
          },
          type: 'metric',
          values: ['24']
        },
        {
          field: 'revenue',
          operator: 'gt',
          parameters: {
            currency: 'CAD'
          },
          type: 'metric',
          values: ['3']
        },
        {
          field: 'adClicks',
          operator: 'gt',
          type: 'metric',
          values: ['11'],
          parameters: {}
        }
      ],
      'filters are normalized correctly'
    );

    assert.deepEqual(
      normalized.sorts,
      [
        {
          direction: 'desc',
          field: 'dateTime',
          type: 'timeDimension',
          parameters: {
            grain: 'day'
          }
        },
        {
          direction: 'asc',
          field: 'revenue',
          parameters: {
            currency: 'CAD'
          },
          type: 'metric'
        }
      ],
      'sorts are normalized correctly'
    );
  });
});

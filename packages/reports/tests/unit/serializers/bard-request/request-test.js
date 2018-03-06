import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

const { getOwner, set, get } = Ember;

let Store;

moduleForModel('bard-request/request', 'Unit | Serializer | Request', {
  needs: [
    'model:user',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:report',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:bard-request/fragments/having',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'serializer:bard-request/fragments/metric',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'validator:request-time-grain',
    'validator:array-number',
    'service:bard-metadata',
    'adapter:bard-metadata',
    'serializer:report',
    'serializer:user',
    'serializer:bard-metadata',
    'serializer:bard-request/request',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:user',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'service:bard-dimensions',
    'adapter:dimensions/bard'
  ],

  beforeEach() {
    setupMock();
    Store = this.store();
    return getOwner(this).lookup('service:bard-metadata').loadMetadata();
  },

  afterEach() {
    teardownMock();
  }
});

test('having and sort serialization', function(assert) {
  assert.expect(4);
  let baseReport = {
    data: {
      type: 'report',
      id: '99',
      attributes: {
        request: {
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

  Ember.run(() => {
    Store.pushPayload(baseReport);
    let report = Store.peekRecord('report', '99');
    set(report, 'request.having', [
      {
        metric: {metric: {name: 'revenue'}, parameters: {currency: 'USD'}},
        operator: 'lt',
        values: [2]
      },
      {
        metric: {metric: {name: 'adClicks'}},
        operator: 'gt',
        values: [1]
      }
    ]);

    let serializedReport = report.serialize();
    assert.deepEqual(serializedReport.data.attributes.request.having, [
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
    'serializes havings correctly');
    set(report, 'request.having', [
      {
        metric: {metric: {name: 'revenue'}, parameters: {currency: 'JPY'}},
        parameters: {currency: 'JPY'},
        operator: 'eq',
        values: [12]
      }
    ]);

    serializedReport = report.serialize();
    assert.deepEqual(serializedReport.data.attributes.request.having, [
      {
        metric: 'revenue(currency=JPY)',
        operator: 'eq',
        values: [12]
      }
    ],
    'Uses canonicalized name when can\'t find alias');

    set(report, 'request.sort', [
      {
        metric: {metric: {name: 'revenue'}, parameters: {currency: 'CAD'}},
        direction: 'asc'
      },
      {
        metric: {metric: {name: 'adClicks'}},
        direction: 'desc'
      }
    ]
    );

    serializedReport = report.serialize();
    assert.deepEqual(serializedReport.data.attributes.request.sort, [
      {
        metric: 'm2',
        direction: 'asc'
      },
      {
        metric: 'adClicks',
        direction: 'desc'
      }
    ],
    'Sort serializes parameterized metrics correctly');

    set(report, 'request.sort', [
      {
        metric: {metric: {name: 'revenue'}, parameters: {currency: 'JPY'}},
        direction: 'asc'
      }
    ]);

    serializedReport = report.serialize();
    assert.deepEqual(serializedReport.data.attributes.request.sort, [
      {
        metric: 'revenue(currency=JPY)',
        direction: 'asc'
      }
    ],
    'Sort serializes to canon name when alias is not found');
  });
});


test('having and sort deserialization', function(assert) {
  assert.expect(10);
  let baseReport = {
    data: {
      type: 'report',
      id: '99',
      attributes: {
        request: {
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

  Ember.run(() => {
    Store.pushPayload(baseReport);
    let report = Store.peekRecord('report', '99');
    let request = get(report, 'request');
    let having = get(request, 'having');
    let sort = get(request, 'sort');
    assert.equal(get(having.objectAt(0), 'metric.metric.name'),
      'revenue',
      'base metric in metric.name in parameterized having');
    assert.equal(get(having.objectAt(0), 'operator'),
      'lt',
      'having operator is preserved');
    assert.equal(get(having.objectAt(0), 'metric.parameters.currency'),
      'USD',
      'parameters are pulled out into their own property');

    assert.equal(get(having.objectAt(1), 'metric.metric.name'),
      'adClicks',
      'Simple metrics are handled correctly in having');
    assert.equal(get(having.objectAt(1), 'operator'),
      'gt',
      'operator is preserved for simple having metrics');

    assert.equal(get(sort.objectAt(0), 'metric.metric.name'),
      'revenue',
      'base metric in metric.name in parameterized sort');
    assert.equal(get(sort.objectAt(0), 'direction'),
      'asc',
      'sort direction is preserved');
    assert.equal(get(sort.objectAt(0), 'metric.parameters.currency'),
      'CAD',
      'parameters are pulled out into their own property');

    assert.equal(get(sort.objectAt(1), 'metric.metric.name'),
      'adClicks',
      'Simple metrics are handled correctly in sort');
    assert.equal(get(sort.objectAt(1), 'direction'),
      'desc',
      'operator is preserved for simple sort metrics');
  });
});

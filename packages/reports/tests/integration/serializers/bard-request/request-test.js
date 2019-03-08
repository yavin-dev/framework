import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

let store, metaService;

moduleForComponent('serializer:bard-request/request', 'Integration | Serializer | Request Fragment', {
  integration: true,
  beforeEach() {
    setupMock();
    store = getOwner(this).lookup('service:store');
    metaService = getOwner(this).lookup('service:bard-metadata');
    return metaService.loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('Adds aliases to reports when serialized', function(assert) {
  assert.expect(1);
  return run(() => {
    let record = store.createFragment('bard-request/request', {
      metrics: [
        {
          metric: { name: 'navClicks' }
        },
        {
          metric: { name: 'revenue' },
          parameters: {
            currency: 'USD'
          }
        },
        {
          metric: { name: 'revenue' },
          parameters: {
            currency: 'CAD',
            as: 'preExistingAlias'
          }
        }
      ]
    });
    let serialized = record.serialize();

    assert.deepEqual(
      serialized.metrics,
      [
        {
          metric: 'navClicks'
        },
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
        }
      ],
      'Adds aliases to the correct metrics'
    );
  });
});

test('Removes aliases during normalization', function(assert) {
  assert.expect(3);
  let payload = {
    metrics: [
      {
        metric: 'navClicks'
      },
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
      }
    ]
  };
  run(() => {
    store.pushPayload('report', {
      data: {
        type: 'report',
        id: 999,
        attributes: {
          request: payload
        }
      }
    });
    let record = store.peekRecord('report', 999);
    let parameters = get(record, 'request.metrics').map(metric => get(metric, 'parameters'));
    assert.deepEqual(parameters.objectAt(0), {}, 'empty parameters in non parameterized metrics');
    assert.deepEqual(
      parameters.objectAt(1),
      { currency: 'USD' },
      'no `as` parameter in parameterized metrics, other params preserved'
    );
    assert.deepEqual(
      parameters.objectAt(2),
      { currency: 'CAD' },
      'no `as` parameter in parameterized metrics, other params preserved'
    );
  });
});

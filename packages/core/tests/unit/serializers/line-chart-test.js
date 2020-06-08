import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let Serializer, Model;

module('Unit | Serializer | line chart', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:line-chart');
    const store = this.owner.lookup('service:store');
    Model = store.modelFor('line-chart');
  });

  test('normalize', function(assert) {
    assert.expect(2);

    let initialMetaData = {
        type: 'line-chart',
        version: 1,
        metadata: {
          axis: {
            y: {
              series: {
                type: 'metric',
                config: {
                  metrics: ['m1']
                }
              }
            }
          }
        }
      },
      expectedPayload = {
        data: {
          id: null,
          relationships: {},
          type: 'line-chart',
          attributes: {
            type: 'line-chart',
            version: 1,
            metadata: {
              axis: {
                y: {
                  series: {
                    type: 'metric',
                    config: {
                      metrics: [{ metric: 'm1', parameters: {} }]
                    }
                  }
                }
              }
            }
          }
        }
      };

    assert.deepEqual(Serializer.normalize(), { data: null }, 'null is returned for an undefined response');

    assert.deepEqual(
      Serializer.normalize(Model, initialMetaData),
      expectedPayload,
      'Config with a metric name stored is successfully converted to an object for a non-parameterized metric'
    );
  });
});

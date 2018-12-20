import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('validator:request-metrics', 'Unit | Validator | request-metrics', {
  needs: ['validator:messages']
});

test('validate request-metrics', function(assert) {
  assert.expect(2);

  let Validator = this.subject(),
    request = {
      metrics: [
        {
          metric: { name: 'm1' },
          canonicalName: 'm1',
          toJSON() {
            return { metric: this.metric, canonicalName: this.canonicalName };
          }
        },
        {
          metric: { name: 'm2' },
          canonicalName: 'm2',
          toJSON() {
            return { metric: this.metric, canonicalName: this.canonicalName };
          }
        }
      ]
    };

  assert.equal(
    Validator.validate(
      [{ metric: { name: 'm1' }, canonicalName: 'm1' }, { metric: { name: 'm2' }, canonicalName: 'm2' }],
      { request }
    ),
    true,
    'request-metrics returns `true` when series metrics is equal to request metrics'
  );

  assert.equal(
    Validator.validate(
      Ember.A([
        {
          metric: { name: 'm1' },
          canonicalName: 'm1',
          toJSON() {
            return { metric: this.metric, canonicalName: this.canonicalName };
          }
        }
      ]),
      { request }
    ),
    false,
    'request-metrics returns `false` when series metric is not equal to request metrics'
  );
});

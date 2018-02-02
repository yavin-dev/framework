import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('validator:request-metric-exist', 'Unit | Validator | request-metric-exist', {
  needs: ['validator:messages']
});

test('validate request-metric-exist', function(assert) {
  assert.expect(2);

  let Validator = this.subject(),
      request = {
        metrics: Ember.A([
          { metric: { name: 'm1' } },
          { metric: { name: 'm2' } }
        ])
      };

  assert.equal(Validator.validate('m1', { request }),
    true,
    'request-metric-exist returns `true` when metric exists in request');

  assert.equal(Validator.validate('m3', { request }),
    false,
    'request-metric-exist returns `false` when metric does not exists in request');
});

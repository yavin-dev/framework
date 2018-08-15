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
          { metric: { name: 'm1' }, canonicalName: 'm1',toJSON() { return { metric: this.metric, canonicalName: this.canonicalName }; } },
          { metric: { name: 'm2' }, canonicalName: 'm2',toJSON() { return { metric: this.metric, canonicalName: this.canonicalName }; } }
        ])
      };

  assert.equal(Validator.validate({ metric: { name: 'm1' }, canonicalName: 'm1' }, { request }),
    true,
    'request-metric-exist returns `true` when metric exists in request');

  assert.equal(Validator.validate({ metric: { name: 'm3' }, canonicalName: 'm3' }, { request }),
    false,
    'request-metric-exist returns `false` when metric does not exists in request');
});

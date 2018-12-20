import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('validator:request-dimension-order', 'Unit | Validator | request-dimension-order', {
  needs: ['validator:messages']
});

test('validate request-dimension-order', function(assert) {
  assert.expect(2);

  let Validator = this.subject(),
    request = {
      dimensions: Ember.A([{ dimension: { name: 'd1' } }, { dimension: { name: 'd2' } }])
    };

  assert.equal(
    Validator.validate(Ember.A(['d1', 'd2']), { request }),
    true,
    'request-dimension-order returns `true` when dimension order matches request dimension order'
  );

  assert.equal(
    Validator.validate(Ember.A(['d2', 'd1']), { request }),
    false,
    'request-dimension-order returns `false` when dimension order does not match request dimension order'
  );
});

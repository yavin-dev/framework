import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | deliverable item', function(hooks) {
  setupTest(hooks);

  test('deliverable item model id', function(assert) {
    assert.expect(2);

    const id = 999;
    const tempId = 'abc1234';
    const model = run(() =>
      this.owner.lookup('service:store').createRecord('deliverable-item', {
        tempId
      })
    );

    assert.equal(model.get('modelId'), tempId, 'getId returns the tempId of the model when id is absent');

    model.set('id', id);

    assert.equal(model.get('modelId'), id, 'getId returns the id when present');
  });
});

import { moduleForModel, test } from 'ember-qunit';

moduleForModel('deliverable-item', 'Unit | Model | deliverable item', {
  needs: ['model:delivery-rule']
});

test('deliverable item model id', function(assert) {
  assert.expect(2);

  const id = 999;
  const tempId = 'abc1234';
  const model = this.subject({
    tempId
  });

  assert.equal(model.get('modelId'), tempId, 'getId returns the tempId of the model when id is absent');

  model.set('id', id);

  assert.equal(model.get('modelId'), id, 'getId returns the id when present');
});

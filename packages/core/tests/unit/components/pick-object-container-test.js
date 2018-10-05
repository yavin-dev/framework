import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('pick-object-container', 'Unit | Component | pick object container', {
  unit: true
});

test('stagePropertyChange action', function(assert) {
  assert.expect(3);

  let component = this.subject();

  component.send('stagePropertyChange', 'a', 1);
  assert.deepEqual(component.getStagedSelection(), { a: 1 }, 'Property is added to object when object is null');

  component.send('stagePropertyChange', 'b', 2);
  assert.deepEqual(
    component.getStagedSelection(),
    { a: 1, b: 2 },
    'Property is added to object when property is undefined'
  );

  component.send('stagePropertyChange', 'a', 3);
  assert.deepEqual(component.getStagedSelection(), { a: 3, b: 2 }, 'Property is updated when already defined');
});

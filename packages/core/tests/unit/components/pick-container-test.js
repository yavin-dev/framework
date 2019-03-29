import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | pick container', function(hooks) {
  setupTest(hooks);

  test('Registering', function(assert) {
    assert.expect(3);

    let component = this.owner.factoryFor('component:pick-container').create();

    assert.deepEqual(component.get('_registered'), {}, 'No components are registered by default');

    let myComponent = { test: 123 };
    component.register('myComponent', myComponent);

    assert.deepEqual(
      component.get('_registered'),
      { myComponent },
      'Calling register adds component to _registered hash'
    );

    assert.throws(
      () => {
        component.register('myComponent', 8);
      },
      new Error('Assertion Failed: myComponent is already registered'),
      'Error is thrown when registering the same component twice'
    );
  });

  test('One way selection binding', function(assert) {
    assert.expect(3);

    let component = this.owner.factoryFor('component:pick-container').create({ selection: 1 });

    assert.equal(component.get('_editableSelection'), 1, '_editableSelection starts equal to selection');

    component.set('_editableSelection', 2);
    assert.notEqual(
      component.get('_editableSelection'),
      component.get('selection'),
      '_editableSelection can be set without changing selection'
    );

    run(() => {
      component.set('selection', 3);
    });
    assert.equal(component.get('_editableSelection'), 3, 'Changing selection updates _editableSelection');
  });

  test('One way selection binding with complex objects', function(assert) {
    assert.expect(2);

    let component = this.owner.factoryFor('component:pick-container').create({
      selection: [1, 2, 3]
    });

    component.get('_editableSelection').push(4);
    assert.deepEqual(
      component.get('selection'),
      [1, 2, 3],
      'Selection is unaffected by changes to the underlying object'
    );

    assert.deepEqual(component.get('_editableSelection'), [1, 2, 3, 4], '_editableSelection can be changed');
  });

  test('Selection change overwrites staged change', function(assert) {
    assert.expect(2);

    let component = this.owner.factoryFor('component:pick-container').create({ selection: 1 });

    component.send('stageChanges', 2);
    assert.equal(component.get('_editableSelection'), 2, 'Staged changes are visible when selection remains the same');

    run(() => {
      component.set('selection', 3);
    });
    assert.equal(component.get('_editableSelection'), 3, 'Setting selection overwrites staged changes');
  });

  test('applyChanges does not reset form', function(assert) {
    assert.expect(2);

    let outsideSelection = 1,
      insideSelection = 2,
      component = this.owner.factoryFor('component:pick-container').create({ selection: outsideSelection });

    component.send('stageChanges', insideSelection);
    component.send('applyChanges');

    assert.equal(component.get('selection'), outsideSelection, 'Selection is unaffected by applied changes');

    assert.equal(component.get('_editableSelection'), insideSelection, 'Form state is not reset when applying changes');
  });

  test('Get staged selection', function(assert) {
    assert.expect(1);

    let component = this.owner.factoryFor('component:pick-container').create();

    component.send('stageChanges', 3);
    assert.equal(
      component.getStagedSelection(),
      3,
      'getStagedSelection() returns changes made through stageChanges action'
    );
  });
});

import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | Navi Date Picker', function(hooks) {
  setupTest(hooks);

  test('_isNewDateValue', function(assert) {
    assert.expect(3);

    let component = run(() => this.owner.factoryFor('component:navi-date-picker').create()),
      testDate1 = new Date(1995, 11, 17),
      testDate2 = new Date(2011, 11, 11);

    assert.equal(component._isNewDateValue(testDate1), false, 'Date is not the same when function was never called');

    assert.equal(
      component._isNewDateValue(testDate1),
      true,
      'Date is the same when given the same value twice in a row'
    );

    assert.equal(
      component._isNewDateValue(testDate2),
      false,
      'Date is not the same when called with two different dates'
    );
  });
});

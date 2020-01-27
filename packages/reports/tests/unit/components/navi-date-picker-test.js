import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';

module('Unit | Component | Navi Date Picker', function(hooks) {
  setupTest(hooks);

  test('_isDateSameAsLast', function(assert) {
    assert.expect(3);

    let component = run(() => this.owner.factoryFor('component:navi-date-picker').create()),
      testDate1 = moment('1995-11-17'),
      testDate2 = moment('1995-11-11');

    assert.equal(component._isDateSameAsLast(testDate1), false, 'Date is not the same when function was never called');

    assert.equal(
      component._isDateSameAsLast(testDate1),
      true,
      'Date is the same when given the same value twice in a row'
    );

    assert.equal(
      component._isDateSameAsLast(testDate2),
      false,
      'Date is not the same when called with two different dates'
    );
  });
});

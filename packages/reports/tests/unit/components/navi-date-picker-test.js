import { run } from '@ember/runloop';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('navi-date-picker', 'Unit | Component | Navi Date Picker', {
  unit: true,
  needs: ['component:bootstrap-datepicker-inline']
});

test('_isNewDateValue', function(assert) {
  assert.expect(3);

  let component = run(() => this.subject()),
    testDate1 = new Date(1995, 11, 17),
    testDate2 = new Date(2011, 11, 11);

  assert.equal(component._isNewDateValue(testDate1), false, 'Date is not the same when function was never called');

  assert.equal(component._isNewDateValue(testDate1), true, 'Date is the same when given the same value twice in a row');

  assert.equal(
    component._isNewDateValue(testDate2),
    false,
    'Date is not the same when called with two different dates'
  );
});

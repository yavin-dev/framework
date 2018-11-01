import { run } from '@ember/runloop';
import { test, moduleForComponent } from 'ember-qunit';
import Interval from 'navi-core/utils/classes/interval';

moduleForComponent('navi-date-range-picker', 'Unit | Component | Navi Date Range Picker', {
  unit: true,
  needs: ['component:bootstrap-datepicker-inline']
});

test('intervalInstance', function(assert) {
  assert.expect(2);

  let component = run(() => this.subject({ dateTimePeriod: 'day' })),
    stringInterval = '2018-10-31/2018-11-01',
    classInterval = Interval.parseFromStrings('2018-10-31', '2018-11-01');

  component.set('interval', stringInterval);
  assert.ok(
    classInterval.isEqual(component.get('intervalInstance')),
    'Interval Instance is created correctly from a string'
  );

  component.set('interval', classInterval);
  assert.ok(
    classInterval.isEqual(component.get('intervalInstance')),
    'Interval Instance returns the passed in interval class'
  );
});

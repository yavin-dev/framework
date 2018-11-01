import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Moment from 'moment';
import { A as arr } from '@ember/array';
import { run } from '@ember/runloop';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

moduleForComponent('filter-values/date', 'Integration | Component | filter values/date', {
  integration: true,

  beforeEach: function() {
    this.filter = { values: [] };
    this.request = { logicalTable: { timeGrain: { name: 'day' } } };
    this.onUpdateFilter = () => null;
    this.selectedDate = null;

    this.render(hbs`
      {{filter-values/date
        filter=filter
        request=request
        onUpdateFilter=(action onUpdateFilter)
        selectedDate=selectedDate
      }}`);
  }
});

test('Displayed text', function(assert) {
  assert.expect(2);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Select date',
    'The placeholder text is displayed when no date is selected'
  );

  run(() => {
    this.set('filter', { values: arr(['2018-10-31']) });
  });

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Oct 31, 2018',
    'The selected date is displayed'
  );
});

test('Apply changes', function(assert) {
  assert.expect(2);

  this.set('onUpdateFilter', changeSet => {
    assert.deepEqual(changeSet, { values: arr(['2018-10-31']) }, 'Date is sent to onUpdateFilter correctly');
  });
  this.set('selectedDate', new Moment('2018-10-31'));

  clickTrigger('.filter-values--date-dimension-select__trigger');
  $('.date-dimension-select__apply.btn.btn-primary').click();

  assert.notOk(
    $('.filter-values--date-dimension-select__dropdown').is(':visible'),
    'The dropdown closes after applying the selected date to the filter'
  );
});

test('Reset changes', function(assert) {
  assert.expect(3);

  this.set('selectedDate', new Moment('2018-10-31'));
  this.set('filter.values', arr(['2018-10-31']));

  clickTrigger('.filter-values--date-dimension-select__trigger');

  assert.equal($('.active.day')[0].innerText.trim(), '31', 'The selected date is active');

  $('.day:contains(20)').click();

  assert.equal($('.active.day')[0].innerText.trim(), '20', 'The selected day has been changed, but not saved yet.');

  $('.date-dimension-select__reset.btn.btn-secondary').click();

  assert.equal(
    $('.active.day')[0].innerText.trim(),
    '31',
    'The selected day is reset to the value stored in the filter'
  );
});

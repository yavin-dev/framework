import { moduleForComponent, test } from 'ember-qunit';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import Moment from 'moment';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dropdown-date-picker', 'Integration | Component | dropdown date picker', {
  integration: true
});

test('dropdown-date-picker', function(assert) {
  assert.expect(8);

  this.set('savedDate', '2018-12-25');
  this.set('actions', {
    onApply(date) {
      assert.equal(
        Moment(date).format('YYYY-MM-DD'),
        '2018-12-24',
        'The current selected date is sent to the onApply action'
      );
    }
  });

  this.render(hbs`
    {{#dropdown-date-picker
      savedDate=(moment savedDate)
      onApply=(action 'onApply')
    }}
      Dropdown Trigger
    {{/dropdown-date-picker}}
  `);

  assert.equal(
    $('.dropdown-date-picker__trigger')
      .text()
      .trim(),
    'Dropdown Trigger',
    'Trigger is displayed'
  );

  clickTrigger('.dropdown-date-picker__trigger');

  assert.ok(
    $('.navi-date-picker.day').is(':visible'),
    'The day time grain date picker is shown when the dropdown is open'
  );

  assert.ok($('.dropdown-date-picker__controls').is(':visible'), 'The controls for the date picker are shown');

  assert.equal(
    $('.active.day')[0].innerText.trim(),
    '25',
    'The saved date is passed to the date picker as the selected date'
  );

  $('.day:contains(24)').click();
  assert.equal($('.active.day')[0].innerText.trim(), '24', 'The selected date changed');

  $('.dropdown-date-picker__reset').click();
  assert.equal(
    $('.active.day')[0].innerText.trim(),
    '25',
    'The selected date is reset to the saved date after clicking reset'
  );

  $('.day:contains(24)').click();
  assert.equal($('.active.day')[0].innerText.trim(), '24', 'The selected date changed');

  $('.dropdown-date-picker__apply').click();
});

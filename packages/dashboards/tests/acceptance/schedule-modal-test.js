import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { teardownModal } from '../helpers/teardown-modal';
import { typeInInput } from '../helpers/ember-tag-input';

moduleForAcceptance('Acceptances | Navi Dashboard Schedule Modal', {
  afterEach() {
    teardownModal();
  }
});

test('schedule modal save new schedule', function(assert) {
  assert.expect(11);
  visit('/dashboards');

  // TriggerEvent does not work here, need to use jquery trigger mouseenter
  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));
  // Click "Schedule"
  click('.navi-collection__row:first-of-type .schedule .btn');

  andThen(() => {
    assert.ok(
      find('.schedule-modal__header .primary-header').is(':visible'),
      'Schedule modal pops up when action is clicked'
    );

    assert.notOk(
      find('.schedule-modal__delete-btn').is(':visible'),
      'The delete button is not present when creating a new schedule'
    );

    assert.equal(
      find('.schedule-modal__save-btn')
        .text()
        .trim(),
      'Save',
      'The save button says "Save" and not "Save Changes" when creating a new schedule'
    );

    assert.equal(
      find(
        '.schedule-modal__dropdown--frequency .ember-power-select-selected-item'
      ).get(0).innerText,
      'Week',
      'Frequency field is set to the default value when creating a new schedule'
    );

    assert.equal(
      find('.schedule-modal__input--recipients').val(),
      '',
      'Recipients field is empty when creating a new schedule'
    );

    assert.equal(
      find(
        '.schedule-modal__dropdown--format .ember-power-select-selected-item'
      ).get(0).innerText,
      'pdf',
      'Format field is set to the default value when creating a new schedule'
    );
  });

  // Set recipients to a new value
  andThen(() => {
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    $('.js-ember-tag-input-new').blur();
  });

  // Set frequency to Day
  click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
  click('.ember-power-select-option:contains(Day)');

  //Save the schedule
  click('.schedule-modal__save-btn');

  andThen(() => {
    assert.equal(
      find('.success .notification-text').text(),
      'Dashboard delivery schedule successfully saved!',
      'Successful notification is shown after clicking save'
    );

    // Check that all fields match the delivery rule we just saved
    assert.ok(
      find('.schedule-modal__delete-btn').is(':visible'),
      'The delete button is present after a delivery rule has been saved'
    );

    assert.equal(
      find('.schedule-modal__save-btn')
        .text()
        .trim(),
      'Save Changes',
      'The save button says "Save Changes" and not "Save" after a delivery rule has been saved'
    );

    assert.equal(
      find(
        '.schedule-modal__dropdown--frequency .ember-power-select-selected-item'
      ).get(0).innerText,
      'Day',
      'Frequency field is set by the saved delivery rule'
    );

    assert.equal(
      find('.schedule-modal__input--recipients .navi-email-tag')
        .text()
        .trim(),
      'navi_user@navi.io',
      'Recipients field is set by the saved delivery rule'
    );
  });
});

test('open schedule modal in dashboard view', function(assert) {
  assert.expect(1);
  visit('/dashboards/2/view');

  // TriggerEvent does not work here, need to use jquery trigger mouseenter
  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));
  // Click "Schedule"
  click('.schedule-action__button');

  andThen(() => {
    assert.ok(
      find('.schedule-modal__header').is(':visible'),
      'Schedule modal pops up when action is clicked'
    );
  });
});

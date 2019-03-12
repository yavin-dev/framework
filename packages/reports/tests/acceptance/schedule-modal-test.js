// jquery is still needed until ember-tag-input test helper typeInInput behaves with triggerEvent
/* eslint ember/no-global-jquery: 1 */
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { teardownModal } from '../helpers/teardown-modal';
import { typeInInput } from '../helpers/ember-tag-input';
import Mirage from 'ember-cli-mirage';
import Ember from 'ember';

moduleForAcceptance('Acceptances | Navi Report Schedule Modal', {
  beforeEach() {
    return visit('/reports');
  },
  afterEach() {
    teardownModal();
    server.shutdown();
  }
});

test('schedule modal save new schedule', function(assert) {
  assert.expect(11);

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
      find('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'Week',
      'Frequency field is set to the default value when creating a new schedule'
    );

    assert.equal(
      find('.schedule-modal__input--recipients').val(),
      '',
      'Recipients field is empty when creating a new schedule'
    );

    assert.equal(
      find('.schedule-modal__dropdown--format .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'csv',
      'Format field is set to the default value when creating a new schedule'
    );
  });

  // Set recipients to a new value
  andThen(() => {
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    triggerEvent('.js-ember-tag-input-new', 'blur');
  });

  // Set frequency to Day
  click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
  click('.ember-power-select-option:contains(Day)');

  //Save the schedule
  click('.schedule-modal__save-btn');

  andThen(() => {
    assert.equal(
      find('.success .notification-text')
        .text()
        .trim(),
      'Report delivery schedule successfully saved!',
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
      find('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
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

test('schedule modal save changes to existing schedule', function(assert) {
  assert.expect(5);

  // TriggerEvent does not work here, need to use jquery trigger mouseenter
  andThen(() => $('.navi-collection__row:nth-of-type(3)').trigger('mouseenter'));
  // Open an existing schedule
  click('.navi-collection__row:nth-of-type(3) .schedule .btn');

  // Add a new recipient
  andThen(() => {
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    triggerEvent('.js-ember-tag-input-new', 'blur');
  });

  // Set frequency to Day
  click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
  click('.ember-power-select-option:contains(Day)');

  //Save the schedule
  click('.schedule-modal__save-btn');

  andThen(() => {
    assert.equal(
      find('.notification-text ')
        .text()
        .trim(),
      'Report delivery schedule successfully saved!',
      'Successful notification is shown after clicking save'
    );

    // Check that all fields match the delivery rule we just saved
    assert.ok(
      find('.schedule-modal__delete-btn').is(':visible'),
      'The delete button is present after a schedule has been modified and saved'
    );

    assert.equal(
      find('.schedule-modal__save-btn')
        .text()
        .trim(),
      'Save Changes',
      'The save button says "Save Changes" and not "Save" after a schedule has been modified and saved'
    );

    assert.equal(
      find('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'Day',
      'Changes made to the frequency field are kept after clicking save changes'
    );

    assert.deepEqual(
      find('.schedule-modal__input--recipients .navi-email-tag')
        .toArray()
        .map(e => e.textContent.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io', 'navi_user@navi.io'],
      'Changes made to the recipients field are kept after clicking save changes'
    );
  });
});

test('schedule modal delete action', function(assert) {
  assert.expect(12);

  andThen(() => $('.navi-collection__row:nth-of-type(3)').trigger('mouseenter'));
  // Click "Schedule"
  click('.navi-collection__row:nth-of-type(3) .schedule .btn');

  andThen(() => {
    assert.ok(
      find('.schedule-modal__delete-btn').is(':visible'),
      'The delete button is present when there is an existing delivery rule'
    );

    assert.equal(
      find('.schedule-modal__save-btn')
        .text()
        .trim(),
      'Save Changes',
      'The save button says "Save Changes" and not "Save" when there is an existing delivery rule'
    );

    assert.equal(
      find('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'Month',
      'Frequency field is populated by existing delivery rule'
    );

    assert.deepEqual(
      find('.schedule-modal__input--recipients .navi-email-tag')
        .toArray()
        .map(e => e.textContent.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
      'Recipients field is populated by existing delivery rule'
    );

    assert.equal(
      find('.schedule-modal__dropdown--format .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'csv',
      'Format field is populated by existing delivery rule'
    );
  });

  click('.schedule-modal__delete-btn button');
  andThen(() => {
    assert.equal(
      find('.ember-modal-wrapper:nth-of-type(2) .primary-header')
        .text()
        .trim(),
      'Delete schedule for "Report 12"',
      'Delete confirmation modal pops up when delete is clicked'
    );
  });

  // Click confirm deletion
  click('.ember-modal-wrapper:nth-of-type(2) .btn-primary');

  // Reopen the same schedule modal
  andThen(() => {
    assert.notOk(
      find('.schedule-modal__header .primary-header').is(':visible'),
      'Schedule modal closes after deleting a schedule'
    );
    $('.navi-collection__row:nth-of-type(3)').trigger('mouseenter');
  });
  click('.navi-collection__row:nth-of-type(3) .schedule .btn');

  andThen(() => {
    assert.notOk(
      find('.schedule-modal__delete-btn').is(':visible'),
      'The delete button is not present after deleting the schedule'
    );

    assert.equal(
      find('.schedule-modal__save-btn')
        .text()
        .trim(),
      'Save',
      'The save button says "Save" and not "Save Changes" after the schedule has been deleted'
    );

    assert.equal(
      find('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'Week',
      'Frequency field is set to the default value after the schedule has been deleted'
    );

    assert.equal(
      find('.schedule-modal__input--recipients').val(),
      '',
      'Recipients field is empty after the schedule has been deleted'
    );

    assert.equal(
      find('.schedule-modal__dropdown--format .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'csv',
      'Format field is set to the default value after the schedule has been deleted'
    );
  });
});

test('schedule modal cancel existing schedule', function(assert) {
  assert.expect(3);

  // Open an existing schedule
  andThen(() => $('.navi-collection__row:nth-of-type(3)').trigger('mouseenter'));
  // Click "Schedule"
  click('.navi-collection__row:nth-of-type(3) .schedule .btn');

  // Set recipients to a new value
  andThen(() => {
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    triggerEvent('.js-ember-tag-input-new', 'blur');
    typeInInput('.js-ember-tag-input-new', 'test_user@navi.io');
    triggerEvent('.js-ember-tag-input-new', 'blur');
  });

  // Set frequency to Day
  click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
  click('.ember-power-select-option:contains(Day)');

  //Cancel changes to the schedule
  click('.schedule-modal__cancel-btn');

  // Reopen the same schedule modal
  andThen(() => {
    assert.notOk(
      find('.schedule-modal__header .primary-header').is(':visible'),
      'Schedule modal closes after clicking the cancel button'
    );
    $('.navi-collection__row:nth-of-type(3)').trigger('mouseenter');
  });
  click('.navi-collection__row:nth-of-type(3) .schedule .btn');

  andThen(() => {
    assert.equal(
      find('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'Month',
      'Frequency field changes to an existing schedule are discarded after clicking cancel'
    );

    assert.deepEqual(
      find('.schedule-modal__input--recipients .navi-email-tag')
        .toArray()
        .map(e => e.textContent.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
      'Recipients field changes to an existing schedule are discarded after clicking cancel'
    );
  });
});

test('schedule modal cancel new schedule', function(assert) {
  assert.expect(3);

  // Open a new schedule
  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));
  click('.navi-collection__row:first-of-type .schedule .btn');

  // Set recipients to a new value
  andThen(() => {
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    triggerEvent('.js-ember-tag-input-new', 'blur');
  });

  // Set frequency to Day
  click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
  click('.ember-power-select-option:contains(Day)');

  //Cancel changes to the schedule
  click('.schedule-modal__cancel-btn');

  // Reopen the same schedule modal
  $('.navi-collection__row:first-of-type').trigger('mouseenter');
  click('.navi-collection__row:first-of-type .schedule .btn');

  andThen(() => {
    assert.equal(
      find('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
        .get(0)
        .innerText.trim(),
      'Day',
      'Frequency field changes to a new schedule are kept but not saved to the store'
    );

    assert.deepEqual(
      find('.schedule-modal__input--recipients .navi-email-tag')
        .toArray()
        .map(e => e.textContent.trim()),
      ['navi_user@navi.io'],
      'Recipients field changes to a new schedule kept but not saved to the store'
    );

    assert.equal(
      find('.schedule-modal__save-btn')
        .text()
        .trim(),
      'Save',
      'The cancel button does not save a new delivery rule to the store'
    );
  });
});

test('schedule modal in report view', function(assert) {
  assert.expect(4);
  visit('/reports/1/view');
  andThen(() => assert.ok(find('.schedule-action__button').is(':visible'), 'Button shows up on saved, owned form'));

  click('.schedule-action__button');
  andThen(() =>
    assert.ok(
      find('.schedule-modal__header .primary-header').is(':visible'),
      'Schedule modal pops up when action is clicked'
    )
  );

  visit('/reports/new');
  andThen(() =>
    assert.notOk(find('.schedule-action__button').is(':visible'), "Button shouldn't show up on new reports")
  );

  visit('/reports/3/view');
  andThen(() =>
    assert.notOk(find('.schedule-action__button').is(':visible'), "Button shouldn't show up on unowned reports")
  );
});

test('schedule modal validations', function(assert) {
  assert.expect(9);

  // Open a new schedule
  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));
  click('.navi-collection__row:first-of-type .schedule .btn');

  andThen(() => {
    assert.ok(
      find('.schedule-modal__helper-recipients').is(':visible'),
      'Helper text is not highlighted red when creating a new schedule before attempting a save'
    );

    assert.ok(
      find('.schedule-modal__input--recipients').is(':visible'),
      'Recipients field is not highlighted red when creating a new schedule before attempting to save'
    );
  });

  //Attempt to save the schedule while recipients is empty
  click('.schedule-modal__save-btn');

  andThen(() => {
    assert.ok(
      find('.schedule-modal__recipients--invalid>.schedule-modal__helper-recipients').is(':visible'),
      'Helper text is highlighted red and save fails when attempting to save a schedule with no recipients'
    );

    assert.ok(
      find('.schedule-modal__recipients--invalid>.schedule-modal__input--recipients').is(':visible'),
      'Recipients field is highlighted red when creating a new schedule before attempting to save'
    );
  });

  // Set recipients to an invalid value
  andThen(() => {
    typeInInput('.js-ember-tag-input-new', 'test_user');
    $('.js-ember-tag-input-new').blur();
  });

  andThen(() => {
    assert.ok(
      find('.schedule-modal__recipients--invalid>.schedule-modal__helper-recipients').is(':visible'),
      'Helper text is still highlighted red when recipients is set to invalid email addresses'
    );

    assert.ok(
      find('.schedule-modal__recipients--invalid>.schedule-modal__input--recipients').is(':visible'),
      'Recipients field is still highlighted red when recipients is set to invalid email addresses'
    );
  });

  // Set recipients to a valid value
  click('.emberTagInput-remove');
  andThen(() => {
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io ');
    keyEvent('.js-ember-tag-input-new', 'keypress', 13);
  });

  andThen(() => {
    assert.notOk(
      find('.schedule-modal__recipients--invalid').is(':visible'),
      "Invalid recipients styles aren't applied after a valid list of recipients is entered"
    );
  });

  //Attempt to save the schedule now that recipients is valid
  click('.schedule-modal__save-btn');

  andThen(() => {
    assert.equal(
      find('.notification-text ')
        .text()
        .trim(),
      'Report delivery schedule successfully saved!',
      'Successful notification is shown after clicking save and the schedule is valid'
    );

    assert.deepEqual(
      find('.schedule-modal__input--recipients .navi-email-tag')
        .toArray()
        .map(e => e.textContent.trim()),
      ['navi_user@navi.io'],
      'The valid recipients were saved successfully'
    );
  });
});

test('schedule modal error when fetching existing schedule', function(assert) {
  assert.expect(6);

  //suppress errors and exceptions for this test because 500 response will throw an error
  let originalLoggerError = Ember.Logger.error,
    originalException = Ember.Test.adapter.exception;

  Ember.Logger.error = () => {};
  Ember.Test.adapter.exception = () => {};

  server.get('/deliveryRules/:id', { errors: ['The deliveryRules endpoint is down'] }, 500);

  // Open an existing schedule
  andThen(() => $('.navi-collection__row:nth-of-type(3)').trigger('mouseenter'));
  click('.navi-collection__row:nth-of-type(3) .schedule .btn');

  andThen(() => {
    assert.equal(
      find('.schedule-modal__notification.modal-notification.alert.failure')
        .text()
        .trim(),
      'Oops! An error occurred while fetching the schedule for this report.',
      'Error message is displayed when the server returns an error while fetching a schedule'
    );

    assert.ok(
      find('.schedule-modal__input--recipients .emberTagInput').is('.emberTagInput--readOnly'),
      'The recipients input field is disabled when there is an error fetching the schedule'
    );

    assert.ok(
      find('.schedule-modal__dropdown--frequency>.ember-basic-dropdown>.ember-power-select-trigger').attr(
        'aria-disabled'
      ),
      'The frequency field is disabled when there is an error fetching the schedule'
    );

    assert.notOk(
      find('.schedule-modal__save-btn').is(':visible'),
      'The save button is not available when there is an error fetching the schedule'
    );

    assert.notOk(
      find('.schedule-modal__delete-btn').is(':visible'),
      'The delete button is not available when there is an error fetching the schedule'
    );

    assert.ok(
      find('.schedule-modal__cancel-btn.btn-primary').is(':visible'),
      'The cancel button is the primary button on the modal when there is an error fetching the schedule'
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
});

test('schedule modal error when saving schedule', function(assert) {
  assert.expect(2);

  //suppress errors and exceptions for this test because 500 response will throw an error
  let originalLoggerError = Ember.Logger.error,
    originalException = Ember.Test.adapter.exception;

  Ember.Logger.error = () => {};
  Ember.Test.adapter.exception = () => {};

  server.post('/deliveryRules', () => {
    return new Mirage.Response(
      400,
      {},
      {
        errors: ['InvalidValueException: Invalid value: Invalid Email: must be a valid oath.com or yahoo-inc.com email']
      }
    );
  });

  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));
  click('.navi-collection__row:first-of-type .schedule .btn');

  andThen(() => {
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    triggerEvent('.js-ember-tag-input-new', 'blur');
  });

  //Save the schedule
  click('.schedule-modal__save-btn');

  andThen(() => {
    assert.equal(
      find('.failure .notification-text')
        .text()
        .trim(),
      'Must be a valid oath.com or yahoo-inc.com email',
      'failing notification is shown if server returns 400'
    );

    server.post('/deliveryRules', () => {
      return new Mirage.Response(500);
    });

    //Save the schedule
    click('.schedule-modal__save-btn');

    andThen(() => {
      assert.equal(
        find('.failure .notification-text')
          .text()
          .trim(),
        'Oops! There was an error updating your delivery settings',
        'failing notification is shown if server returns 500'
      );

      Ember.Logger.error = originalLoggerError;
      Ember.Test.adapter.exception = originalException;
    });
  });
});

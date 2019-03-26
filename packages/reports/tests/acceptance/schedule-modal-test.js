// jquery is still needed until ember-tag-input test helper typeInInput behaves with triggerEvent
/* eslint ember/no-global-jquery: 1 */
import { find, click, findAll, blur, visit, triggerEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { teardownModal } from '../helpers/teardown-modal';
import { findContains } from '../helpers/contains-helpers';
import Mirage from 'ember-cli-mirage';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Ember from 'ember';

module('Acceptance | Navi Report Schedule Modal', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(function() {
    teardownModal();
    server.shutdown();
  });

  test('schedule modal save new schedule', async function(assert) {
    assert.expect(11);
    await visit('/reports');

    // Click "Schedule"
    await triggerEvent('.navi-collection__row0', 'mouseover');
    await click('.navi-collection__row0 .schedule .btn');

    assert.dom('.schedule-modal__header .primary-header').isVisible('Schedule modal pops up when action is clicked');

    assert
      .dom('.schedule-modal__delete-btn')
      .isNotVisible('The delete button is not present when creating a new schedule');

    assert
      .dom('.schedule-modal__save-btn')
      .hasText('Save', 'The save button says "Save" and not "Save Changes" when creating a new schedule');

    assert
      .dom('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
      .hasText('Week', 'Frequency field is set to the default value when creating a new schedule');

    assert
      .dom('.schedule-modal__input--recipients')
      .hasText('', 'Recipients field is empty when creating a new schedule');

    assert
      .dom('.schedule-modal__dropdown--format .ember-power-select-selected-item')
      .hasText('csv', 'Format field is set to the default value when creating a new schedule');

    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    await click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
    await click(findContains('.ember-power-select-option:contains(Day)'));

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert
      .dom('.success .notification-text')
      .hasText('Report delivery schedule successfully saved!', 'Successful notification is shown after clicking save');

    // Check that all fields match the delivery rule we just saved
    assert
      .dom('.schedule-modal__delete-btn')
      .isVisible('The delete button is present after a delivery rule has been saved');

    assert
      .dom('.schedule-modal__save-btn')
      .hasText(
        'Save Changes',
        'The save button says "Save Changes" and not "Save" after a delivery rule has been saved'
      );

    assert
      .dom('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
      .hasText('Day', 'Frequency field is set by the saved delivery rule');

    assert
      .dom('.schedule-modal__input--recipients .navi-email-tag')
      .hasText('navi_user@navi.io', 'Recipients field is set by the saved delivery rule');
  });

  test('schedule modal save changes to existing schedule', async function(assert) {
    assert.expect(5);
    await visit('/reports');

    // Open an existing schedule
    await triggerEvent('.navi-collection__row2', 'mouseover');
    await click('.navi-collection__row2 .schedule .btn');

    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    await click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
    await click(findContains('.ember-power-select-option:contains(Day)'));

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert
      .dom('.notification-text ')
      .hasText('Report delivery schedule successfully saved!', 'Successful notification is shown after clicking save');

    // Check that all fields match the delivery rule we just saved
    assert
      .dom('.schedule-modal__delete-btn')
      .isVisible('The delete button is present after a schedule has been modified and saved');

    assert
      .dom('.schedule-modal__save-btn')
      .hasText(
        'Save Changes',
        'The save button says "Save Changes" and not "Save" after a schedule has been modified and saved'
      );

    assert
      .dom('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
      .hasText('Day', 'Changes made to the frequency field are kept after clicking save changes');

    assert.deepEqual(
      findAll('.schedule-modal__input--recipients .navi-email-tag').map(e => e.innerText.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io', 'navi_user@navi.io'],
      'Changes made to the recipients field are kept after clicking save changes'
    );
  });

  test('schedule modal delete action', async function(assert) {
    assert.expect(12);
    await visit('/reports');

    // Click "Schedule"
    await triggerEvent('.navi-collection__row2', 'mouseover');
    await click('.navi-collection__row2 .schedule .btn');

    assert
      .dom('.schedule-modal__delete-btn')
      .isVisible('The delete button is present when there is an existing delivery rule');

    assert
      .dom('.schedule-modal__save-btn')
      .hasText(
        'Save Changes',
        'The save button says "Save Changes" and not "Save" when there is an existing delivery rule'
      );

    assert
      .dom('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
      .hasText('Month', 'Frequency field is populated by existing delivery rule');

    assert.deepEqual(
      findAll('.schedule-modal__input--recipients .navi-email-tag').map(e => e.innerText.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
      'Recipients field is populated by existing delivery rule'
    );

    assert
      .dom('.schedule-modal__dropdown--format .ember-power-select-selected-item')
      .hasText('csv', 'Format field is populated by existing delivery rule');

    await click('.schedule-modal__delete-btn button');
    assert
      .dom('.ember-modal-wrapper:nth-of-type(2) .primary-header')
      .hasText('Delete schedule for "Report 12"', 'Delete confirmation modal pops up when delete is clicked');

    // Click confirm deletion
    await click('.ember-modal-wrapper:nth-of-type(2) .btn-primary');

    assert
      .dom('.schedule-modal__header .primary-header')
      .isNotVisible('Schedule modal closes after deleting a schedule');

    await triggerEvent('.navi-collection__row2', 'mouseover');
    await click('.navi-collection__row2 .schedule .btn');

    assert
      .dom('.schedule-modal__delete-btn')
      .isNotVisible('The delete button is not present after deleting the schedule');

    assert
      .dom('.schedule-modal__save-btn')
      .hasText('Save', 'The save button says "Save" and not "Save Changes" after the schedule has been deleted');

    assert
      .dom('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
      .hasText('Week', 'Frequency field is set to the default value after the schedule has been deleted');

    assert
      .dom('.schedule-modal__input--recipients')
      .hasText('', 'Recipients field is empty after the schedule has been deleted');

    assert
      .dom('.schedule-modal__dropdown--format .ember-power-select-selected-item')
      .hasText('csv', 'Format field is set to the default value after the schedule has been deleted');
  });

  test('schedule modal cancel existing schedule', async function(assert) {
    assert.expect(3);
    await visit('/reports');

    // Click "Schedule"
    await triggerEvent('.navi-collection__row2', 'mouseover');
    await click('.navi-collection__row2 .schedule .btn');

    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');
    typeInInput('.js-ember-tag-input-new', 'test_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    await click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
    await click(findContains('.ember-power-select-option:contains(Day)'));

    //Cancel changes to the schedule
    await click('.schedule-modal__cancel-btn');

    assert
      .dom('.schedule-modal__header .primary-header')
      .isNotVisible('Schedule modal closes after clicking the cancel button');
    await triggerEvent('.navi-collection__row2', 'mouseover');
    await click('.navi-collection__row2 .schedule .btn');

    assert
      .dom('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
      .hasText('Month', 'Frequency field changes to an existing schedule are discarded after clicking cancel');

    assert.deepEqual(
      findAll('.schedule-modal__input--recipients .navi-email-tag').map(e => e.innerText.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
      'Recipients field changes to an existing schedule are discarded after clicking cancel'
    );
  });

  test('schedule modal cancel new schedule', async function(assert) {
    assert.expect(3);
    await visit('/reports');

    await triggerEvent('.navi-collection__row0', 'mouseover');
    await click('.navi-collection__row0 .schedule .btn');

    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    await click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
    await click(findContains('.ember-power-select-option:contains(Day)'));

    //Cancel changes to the schedule
    await click('.schedule-modal__cancel-btn');

    // Reopen the same schedule modal
    await triggerEvent('.navi-collection__row0', 'mouseover');
    await click('.navi-collection__row0 .schedule .btn');

    assert
      .dom('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')
      .hasText('Day', 'Frequency field changes to a new schedule are kept but not saved to the store');

    assert.deepEqual(
      findAll('.schedule-modal__input--recipients .navi-email-tag').map(e => e.innerText.trim()),
      ['navi_user@navi.io'],
      'Recipients field changes to a new schedule kept but not saved to the store'
    );

    assert
      .dom('.schedule-modal__save-btn')
      .hasText('Save', 'The cancel button does not save a new delivery rule to the store');
  });

  test('schedule modal in report view', async function(assert) {
    assert.expect(4);
    await visit('/reports/1/view');
    assert.dom('.schedule-action__button').isVisible('Button shows up on saved, owned form');

    await click('.schedule-action__button');
    assert.dom('.schedule-modal__header .primary-header').isVisible('Schedule modal pops up when action is clicked');

    await visit('/reports/new');
    assert.dom('.schedule-action__button').isNotVisible("Button shouldn't show up on new reports");

    await visit('/reports/3/view');
    assert.dom('.schedule-action__button').isNotVisible("Button shouldn't show up on unowned reports");
  });

  test('schedule modal validations', async function(assert) {
    assert.expect(9);

    await visit('/reports');

    await triggerEvent('.navi-collection__row0', 'mouseover');
    await click('.navi-collection__row0 .schedule .btn');

    assert
      .dom('.schedule-modal__helper-recipients')
      .isVisible('Helper text is not highlighted red when creating a new schedule before attempting a save');

    assert
      .dom('.schedule-modal__input--recipients')
      .isVisible('Recipients field is not highlighted red when creating a new schedule before attempting to save');

    //Attempt to save the schedule while recipients is empty
    await click('.schedule-modal__save-btn');

    assert
      .dom('.schedule-modal__recipients--invalid>.schedule-modal__helper-recipients')
      .isVisible('Helper text is highlighted red and save fails when attempting to save a schedule with no recipients');

    assert
      .dom('.schedule-modal__recipients--invalid>.schedule-modal__input--recipients')
      .isVisible('Recipients field is highlighted red when creating a new schedule before attempting to save');

    typeInInput('.js-ember-tag-input-new', 'test_user');
    await blur('.js-ember-tag-input-new');

    assert
      .dom('.schedule-modal__recipients--invalid>.schedule-modal__helper-recipients')
      .isVisible('Helper text is still highlighted red when recipients is set to invalid email addresses');

    assert
      .dom('.schedule-modal__recipients--invalid>.schedule-modal__input--recipients')
      .isVisible('Recipients field is still highlighted red when recipients is set to invalid email addresses');

    // Set recipients to a valid value
    await click('.emberTagInput-remove');
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io ');
    await blur('.js-ember-tag-input-new');

    assert
      .dom('.schedule-modal__recipients--invalid')
      .isNotVisible("Invalid recipients styles aren't applied after a valid list of recipients is entered");

    //Attempt to save the schedule now that recipients is valid
    await click('.schedule-modal__save-btn');

    assert
      .dom('.notification-text ')
      .hasText(
        'Report delivery schedule successfully saved!',
        'Successful notification is shown after clicking save and the schedule is valid'
      );

    assert.deepEqual(
      findAll('.schedule-modal__input--recipients .navi-email-tag').map(e => e.innerText.trim()),
      ['navi_user@navi.io'],
      'The valid recipients were saved successfully'
    );
  });

  test('schedule modal error when fetching existing schedule', async function(assert) {
    assert.expect(6);

    //suppress errors and exceptions for this test because 500 response will throw an error
    let originalLoggerError = Ember.Logger.error,
      originalException = Ember.Test.adapter.exception;

    Ember.Logger.error = () => {};
    Ember.Test.adapter.exception = () => {};

    server.get('/deliveryRules/:id', { errors: ['The deliveryRules endpoint is down'] }, 500);

    await visit('/reports');
    await triggerEvent('.navi-collection__row2', 'mouseover');
    await click('.navi-collection__row2 .schedule .btn');

    assert
      .dom('.schedule-modal__notification.modal-notification.alert.failure')
      .hasText(
        'Oops! An error occurred while fetching the schedule for this report.',
        'Error message is displayed when the server returns an error while fetching a schedule'
      );

    assert
      .dom('.schedule-modal__input--recipients .emberTagInput')
      .hasClass(
        'emberTagInput--readOnly',
        'The recipients input field is disabled when there is an error fetching the schedule'
      );

    assert.ok(
      find('.schedule-modal__dropdown--frequency>.ember-basic-dropdown>.ember-power-select-trigger').getAttribute(
        'aria-disabled'
      ),
      'The frequency field is disabled when there is an error fetching the schedule'
    );

    assert
      .dom('.schedule-modal__save-btn')
      .isNotVisible('The save button is not available when there is an error fetching the schedule');

    assert
      .dom('.schedule-modal__delete-btn')
      .isNotVisible('The delete button is not available when there is an error fetching the schedule');

    assert
      .dom('.schedule-modal__cancel-btn.btn-primary')
      .isVisible('The cancel button is the primary button on the modal when there is an error fetching the schedule');

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

  test('schedule modal error when saving schedule', async function(assert) {
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
          errors: [
            'InvalidValueException: Invalid value: Invalid Email: must be a valid oath.com or yahoo-inc.com email'
          ]
        }
      );
    });
    await visit('/reports');
    await triggerEvent('.navi-collection__row0', 'mouseover');

    await click('.navi-collection__row0 .schedule .btn');

    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert.equal(
      find('.failure .notification-text').innerText.trim(),
      'Must be a valid oath.com or yahoo-inc.com email',
      'failing notification is shown if server returns 400'
    );

    server.post('/deliveryRules', () => {
      return new Mirage.Response(500);
    });

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert.equal(
      find('.failure .notification-text').innerText.trim(),
      'Oops! There was an error updating your delivery settings',
      'failing notification is shown if server returns 500'
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
});

/**
 * Set some text value in an input
 * The helper from ember-tag-input uses jquery
 * @param {String} selector
 * @param {String} text
 */
function typeInInput(selector, text) {
  let element = find(selector);
  if (element) {
    element.value = text;
  }
}

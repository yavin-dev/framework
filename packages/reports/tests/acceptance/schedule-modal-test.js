// jquery is still needed until ember-tag-input test helper typeInInput behaves with triggerEvent
/* eslint ember/no-global-jquery: 1 */
import { click, findAll, blur, visit, triggerEvent, waitFor, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import $ from 'jquery';
import Mirage from 'ember-cli-mirage';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import Ember from 'ember';
import config from 'ember-get-config';

let confirm;

module('Acceptance | Navi Report Schedule Modal', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(() => {
    confirm = window.confirm;
  });

  hooks.afterEach(() => {
    window.confirm = confirm;
  });

  test('schedule modal save new schedule', async function (assert) {
    assert.expect(14);
    await visit('/reports');

    // Click "Schedule"
    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-report-actions__schedule');

    assert.dom('.schedule__modal').exists('Schedule modal pops up when action is clicked');

    await click('.schedule__modal-new-delivery button');

    // Default View
    assert
      .dom('.schedule__modal-delete-btn')
      .isNotVisible('The delete button is not present when creating a new schedule');

    assert
      .dom('.schedule__modal-save-btn')
      .hasText('Save', 'The save button says "Save" and not "Save Changes" when creating a new schedule');

    assert
      .dom('.schedule__modal-frequency-trigger .ember-power-select-selected-item')
      .hasText('Week', 'Frequency field is set to the default value when creating a new schedule');

    assert
      .dom('.schedule__modal-input--recipients')
      .hasText('', 'Recipients field is empty when creating a new schedule');

    assert
      .dom('.schedule__modal-format-trigger .ember-power-select-selected-item')
      .hasText('csv', 'Format field is set to the default value when creating a new schedule');

    assert.dom('.schedule__modal-must-have-data-toggle').isNotChecked('mustHaveData is toggled off by default');

    // Enter email address
    await fillIn('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to 'Day'
    await click('.schedule__modal-frequency-trigger');
    await click($('.ember-power-select-option:contains(Day)')[0]);

    // Toggle mustHaveData to 'on'
    await click('.schedule__modal-must-have-data-toggle');

    //Save the schedule
    await click('.schedule__modal-save-btn');
    await waitFor('.alert');

    assert
      .dom('.alert')
      .hasText(
        `'Email delivered pdf every week' schedule successfully saved!`,
        'Successful notification is shown after clicking save'
      );

    assert.dom('.modal.is-active').isNotVisible('Modal closed on successful save');

    // Reopen the schedule modal
    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-report-actions__schedule');

    // Check that all fields match the delivery rule we just saved
    assert
      .dom('.schedule__modal-delete-btn')
      .isVisible('The delete button is present after a delivery rule has been saved');

    assert
      .dom('.schedule__modal-save-btn')
      .hasText(
        'Save Changes',
        'The save button says "Save Changes" and not "Save" after a delivery rule has been saved'
      );

    assert
      .dom('.schedule__modal-frequency-trigger .ember-power-select-selected-item')
      .hasText('Day', 'Frequency field is set by the saved delivery rule');

    assert
      .dom('.schedule__modal-input--recipients .tag')
      .hasText('navi_user@navi.io', 'Recipients field is set by the saved delivery rule');

    assert
      .dom('.schedule__modal-must-have-data-toggle')
      .isChecked('mustHaveData field is set by the saved delivery rule');
  });

  test('schedule modal with overwrite file toggle', async function (assert) {
    assert.expect(9);
    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'gsheet'];

    await visit('/reports');

    // Click "Schedule"
    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');

    assert.dom('.schedule__modal-overwrite').doesNotExist('No overwrite toggle for unsupported formats');

    await selectChoose('.schedule__modal-format-trigger', 'gsheet');

    assert.dom('.schedule__modal-overwrite').exists('Overwrite toggle for supported formats');

    assert.dom('.schedule__modal-overwrite-toggle').isNotChecked('overwrite is unchecked by default');

    assert.dom('.help-text').hasText('A new sheet will be created every month', 'Help text shows correct');

    await click('.schedule__modal-overwrite-toggle');

    assert.dom('.schedule__modal-overwrite-toggle').isChecked('overwrite toggles on when clicked');

    assert
      .dom('.help-text')
      .hasText('Data will be replaced in the same sheet every month', 'Help text shows correct when toggle is updated');

    await click('.schedule__modal-save-btn');
    await waitFor('.alert');

    assert
      .dom('.alert')
      .hasText(
        `'Email delivered csv every month' schedule successfully saved!`,
        'Successful notification is shown after clicking save'
      );

    assert.dom('.modal.is-active').isNotVisible('Modal closed on successful save');

    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');

    assert.dom('.schedule__modal-overwrite-toggle').isChecked('overwrite is saved and can be seen on reopen');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('schedule modal save changes to existing schedule', async function (assert) {
    assert.expect(9);
    await visit('/reports');

    // Open an existing schedule
    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');

    // The initial state of the Cancel button should say "Close"
    assert
      .dom('.schedule__modal-cancel-btn')
      .hasText('Close', 'The cancel button says "Close" upon opening the schedule modal');

    // Change the value of the mustHaveData toggle and make sure the model detects changes
    await click('.schedule__modal-must-have-data-toggle');
    assert
      .dom('.schedule__modal-cancel-btn')
      .hasText(
        'Cancel',
        'The cancel button says "Cancel" and not "Close" after a user modifies the state of the mustHaveData toggled'
      );

    // Reverting the changes are also detected by the model and reflected to the user
    await click('.schedule__modal-must-have-data-toggle');
    assert
      .dom('.schedule__modal-cancel-btn')
      .hasText(
        'Close',
        'The cancel button says "Close" after a user puts the mustHaveData toggle value back to its initial state'
      );

    // Enter emails
    await fillIn('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    await click('.schedule__modal-frequency-trigger');
    await click($('.ember-power-select-option:contains(Day)')[0]);

    //Save the schedule
    await click('.schedule__modal-save-btn');
    await waitFor('.alert');

    assert
      .dom('.alert ')
      .hasText(
        `'Email delivered csv every month' schedule successfully saved!`,
        'Successful notification is shown after clicking save'
      );

    assert.dom('.schedule__modal').doesNotExist('Modal closes after successful save');

    // Reopen the modal
    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');

    // Check that all fields match the delivery rule we just saved
    assert
      .dom('.schedule__modal-delete-btn')
      .isVisible('The delete button is present after a schedule has been modified and saved');

    assert
      .dom('.schedule__modal-save-btn')
      .hasText(
        'Save Changes',
        'The save button says "Save Changes" and not "Save" after a schedule has been modified and saved'
      );

    assert
      .dom('.schedule__modal-frequency-trigger .ember-power-select-selected-item')
      .hasText('Day', 'Changes made to the frequency field are kept after clicking save changes');

    assert.deepEqual(
      findAll('.schedule__modal-input--recipients .tag').map((e) => e.innerText.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io', 'navi_user@navi.io'],
      'Changes made to the recipients field are kept after clicking save changes'
    );
  });

  test('schedule modal delete action', async function (assert) {
    assert.expect(10);
    await visit('/reports');

    // Click "Schedule"
    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');

    assert
      .dom('.schedule__modal-delete-btn')
      .isVisible('The delete button is present when there is an existing delivery rule');

    assert
      .dom('.schedule__modal-save-btn')
      .hasText(
        'Save Changes',
        'The save button says "Save Changes" and not "Save" when there is an existing delivery rule'
      );

    assert
      .dom('.schedule__modal-frequency-trigger .ember-power-select-selected-item')
      .hasText('Month', 'Frequency field is populated by existing delivery rule');

    assert.deepEqual(
      findAll('.schedule__modal-input--recipients .tag').map((e) => e.innerText.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
      'Recipients field is populated by existing delivery rule'
    );

    assert.dom('.schedule__modal-format-trigger').hasText('csv', 'Format field is populated by existing delivery rule');

    await click('.schedule__modal-delete-btn');
    assert
      .dom('.delete__modal-details')
      .hasText('This action cannot be undone. This will permanently delete the delivery rule.');

    // Click confirm deletion
    await click('.delete__modal-delete-btn');

    assert.dom('.schedule .primary-header').isNotVisible('Schedule modal closes after deleting a schedule');

    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');

    assert
      .dom('.schedule__modal-delete-btn')
      .isNotVisible('The delete button is not present after deleting the schedule');

    assert
      .dom('.schedule__modal-save-btn')
      .isNotVisible('There is no schedule after deleting, so we have our no schedule state shown');

    assert
      .dom('.schedule__modal-no-schedule-new-delivery')
      .isVisible('Because we have no current schedule our no shedule no schedule new schedule button is visible');
  });

  test('schedule modal cancel existing schedule', async function (assert) {
    assert.expect(5);
    await visit('/reports');

    // Click "Schedule"
    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');

    await click('.schedule__modal-new-delivery button');

    assert.dom('.schedule__modal-must-have-data-toggle').isNotChecked('mustHaveData is false initially');

    await fillIn('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');
    await fillIn('.js-ember-tag-input-new', 'test_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    await click('.schedule__modal-frequency-trigger');
    await click($('.ember-power-select-option:contains(Day)')[0]);

    // Set mustHaveData to be true
    await click('.schedule__modal-must-have-data-toggle');

    window.confirm = () => {
      return true;
    };

    //Cancel changes to the schedule
    await click('.schedule__modal-cancel-btn');

    assert.dom('.schedule .primary-header').isNotVisible('Schedule modal closes after clicking the cancel button');

    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');

    assert
      .dom('.schedule__modal-frequency-trigger .ember-power-select-selected-item')
      .hasText('Month', 'Frequency field changes to an existing schedule are discarded after clicking cancel');

    assert
      .dom('.schedule__modal-must-have-data-toggle')
      .isNotChecked('mustHaveData changes to an existing schedule are discarded after clicking cancel');

    assert.deepEqual(
      findAll('.schedule__modal-input--recipients .tag').map((e) => e.innerText.trim()),
      ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
      'Recipients field changes to an existing schedule are discarded after clicking cancel'
    );
  });

  test('schedule modal cancel new schedule', async function (assert) {
    assert.expect(4);
    await visit('/reports');

    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-report-actions__schedule');

    await click('.schedule__modal-new-delivery button');

    // Enter an email
    await fillIn('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    await click('.schedule__modal-frequency-trigger');
    await click($('.ember-power-select-option:contains(Day)')[0]);

    // Set mustHaveData to be true
    await click('.schedule__modal-must-have-data-toggle');

    window.confirm = () => {
      return true;
    };

    // Cancel changes to the schedule
    await click('.schedule__modal-cancel-btn');

    // Reopen the same schedule modal
    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-report-actions__schedule');

    assert
      .dom('.schedule__modal-frequency-trigger .ember-power-select-selected-item')
      .hasText('Day', 'Frequency field changes to a new schedule are kept but not saved to the store');

    assert.deepEqual(
      findAll('.schedule__modal-input--recipients .tag').map((e) => e.innerText.trim()),
      ['navi_user@navi.io'],
      'Recipients field changes to a new schedule kept but not saved to the store'
    );

    assert
      .dom('.schedule__modal-must-have-data-toggle')
      .isChecked('mustHaveData field changes to a new schedule are kept but not saved to the store');

    assert
      .dom('.schedule__modal-save-btn')
      .hasText('Save', 'The cancel button does not save a new delivery rule to the store');
  });

  test('schedule modal in report view', async function (assert) {
    assert.expect(4);
    await visit('/reports/1/view');
    assert.dom('.report-actions__schedule-btn').isVisible('Button shows up on saved, owned form');

    await click('.report-actions__schedule-btn');
    assert.dom('.schedule__modal').exists('Schedule modal pops up when action is clicked');

    await visit('/reports/new');
    assert.dom('.report-actions__schedule-btn').isNotVisible("Button shouldn't show up on new reports");

    await visit('/reports/3/view');
    assert.dom('.report-actions__schedule-btn').isNotVisible("Button shouldn't show up on unowned reports");
  });

  test('schedule modal validations', async function (assert) {
    assert.expect(11);

    await visit('/reports');

    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-report-actions__schedule');

    await click('.schedule__modal-new-delivery button');

    assert
      .dom('.schedule__modal-helper-recipients')
      .isVisible('Helper text is not highlighted red when creating a new schedule before attempting a save');

    assert
      .dom('.schedule__modal-input--recipients')
      .isVisible('Recipients field is not highlighted red when creating a new schedule before attempting to save');

    //Attempt to save the schedule while recipients is empty
    assert.dom('.schedule__modal-save-btn').isDisabled('Save schedule button is disabled');

    assert
      .dom('.schedule__modal-recipients--invalid>.schedule__modal-helper-recipients')
      .isVisible('Helper text is highlighted red and save fails when attempting to save a schedule with no recipients');

    assert
      .dom('.schedule__modal-recipients--invalid>.schedule__modal-input--recipients')
      .isVisible('Recipients field is highlighted red when creating a new schedule before attempting to save');

    await fillIn('.js-ember-tag-input-new', 'test_user');
    await blur('.js-ember-tag-input-new');

    assert
      .dom('.schedule__modal-recipients--invalid>.schedule__modal-helper-recipients')
      .isVisible('Helper text is still highlighted red when recipients is set to invalid email addresses');

    assert
      .dom('.schedule__modal-recipients--invalid>.schedule__modal-input--recipients')
      .isVisible('Recipients field is still highlighted red when recipients is set to invalid email addresses');

    // Set recipients to a valid value
    await click('.navi-tag-input__tag-remove');
    await fillIn('.js-ember-tag-input-new', 'navi_user@navi.io ');
    await blur('.js-ember-tag-input-new');

    assert
      .dom('.schedule__modal-recipients--invalid')
      .isNotVisible("Invalid recipients styles aren't applied after a valid list of recipients is entered");

    //Attempt to save the schedule now that recipients is valid
    await click('.schedule__modal-save-btn');
    await waitFor('.alert');

    assert
      .dom('.alert')
      .hasText(
        `'Email delivered pdf every week' schedule successfully saved!`,
        'Successful notification is shown after clicking save and the schedule is valid'
      );

    assert.dom('.schedule .primary-header').isNotVisible('Schedule modal closes after deleting a schedule');

    // Reopen the modal
    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-report-actions__schedule');

    assert.deepEqual(
      findAll('.schedule__modal-input--recipients .tag').map((e) => e.innerText.trim()),
      ['navi_user@navi.io'],
      'The valid recipients were saved successfully'
    );
  });

  test('schedule modal error when fetching existing schedule', async function (assert) {
    assert.expect(6);

    //suppress errors and exceptions for this test because 500 response will throw an error
    let originalLoggerError = Ember.Logger.error,
      originalException = Ember.Test.adapter.exception;

    Ember.Logger.error = () => {};
    Ember.Test.adapter.exception = () => {};

    server.get('/deliveryRules/:id', { errors: ['The deliveryRules endpoint is down'] }, 500);

    await visit('/reports');
    await triggerEvent('.navi-collection__row2', 'mouseenter');
    await click('.navi-report-actions__schedule');
    await waitFor('.alert');

    assert
      .dom('.alert p')
      .hasText(
        'An error occurred while fetching your schedule(s) for this report.',
        'Error message is displayed when the server returns an error while fetching a schedule'
      );

    assert
      .dom('.schedule__modal-input--recipients .emberTagInput')
      .hasClass(
        'emberTagInput--readOnly',
        'The recipients input field is disabled when there is an error fetching the schedule'
      );

    assert
      .dom('.schedule__modal-frequency-trigger')
      .hasAttribute(
        'aria-disabled',
        'true',
        'The frequency field is disabled when there is an error fetching the schedule'
      );

    assert
      .dom('.schedule__modal-save-btn')
      .isNotVisible('The save button is not available when there is an error fetching the schedule');

    assert
      .dom('.schedule__modal-delete-btn')
      .isNotVisible('The delete button is not available when there is an error fetching the schedule');

    assert
      .dom('.schedule__modal-cancel-btn')
      .isVisible('The cancel button is the primary button on the modal when there is an error fetching the schedule');

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

  test('schedule modal error when saving schedule', async function (assert) {
    assert.expect(8);

    //suppress errors and exceptions for this test because 500 response will throw an error
    let originalLoggerError = Ember.Logger.error,
      originalException = Ember.Test.adapter.exception;

    Ember.Logger.error = () => {};
    Ember.Test.adapter.exception = () => {};

    await visit('/reports');
    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-report-actions__schedule');

    await click('.schedule__modal-no-schedule-new-delivery');

    await fillIn('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    server.post('/deliveryRules', () => {
      return new Mirage.Response(
        400,
        {},
        {
          errors: [
            'InvalidValueException: Invalid Email: must be a valid oath.com or yahoo-inc.com email',
            'InvalidValueException: Invalid Recipients: cannot schedule report with unauthorized users',
          ],
        }
      );
    });

    //Save the schedule
    await click('.schedule__modal-save-btn');
    await waitFor('.alert');

    let errors = findAll('.alert p');
    assert.equal(errors[1].innerText, 'Invalid recipients: cannot schedule report with unauthorized users');
    assert.equal(errors[0].innerText, 'Invalid email: must be a valid oath.com or yahoo-inc.com email');
    assert.equal(errors.length, 2, 'failing notifications are shown if server returns 400');

    server.post('/deliveryRules', () => {
      return new Mirage.Response(500);
    });

    //Save the schedule
    await click('.schedule__modal-save-btn');
    await waitFor('.alert');

    assert
      .dom('.alert p')
      .includesText(
        `There was an error updating your delivery settings for schedule 'Email delivered pdf every week'`,
        'failing notification is shown if server returns 500'
      );

    server.post('/deliveryRules', () => {
      return new Mirage.Response(
        401,
        {},
        {
          errors: [
            {
              status: 401,
              title: 'Invalid Recipients',
              detail: 'cannot schedule report with unauthorized users',
            },
            {
              status: 401,
              title: 'Invalid Email',
              detail: 'must be a valid oath.com or yahoo-inc.com email',
            },
            {
              status: 401,
              title: 'Invalid Something Else',
              detail: '',
            },
            {
              status: 401,
              title: 'Invalid Something Else',
              detail: '',
            },
          ],
        }
      );
    });

    //Save the schedule
    await click('.schedule__modal-save-btn');
    await waitFor('.alert');

    errors = findAll('.alert p');
    assert.equal(errors[0].innerText, 'Cannot schedule report with unauthorized users');
    assert.equal(errors[1].innerText, 'Must be a valid oath.com or yahoo-inc.com email');
    assert.equal(
      errors[2].innerText,
      `There was an error updating your delivery settings for schedule 'Email delivered pdf every week'`
    );
    assert.equal(errors.length, 3, 'all errors show up formatted correctly for object-type errors');

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

  test('schedule modal invalid report', async function (assert) {
    assert.expect(3);
    await visit('/reports');

    // Click "Schedule"
    await triggerEvent('.navi-collection__row3', 'mouseenter');
    await click('.navi-report-actions__schedule');

    await click('.schedule__modal-new-delivery button');

    assert
      .dom('.schedule__modal .alert')
      .hasText(
        'Unable to schedule invalid report. Please fix errors before proceeding.',
        'Error is displayed when validation fails'
      );

    assert.dom('.schedule__modal-cancel-btn').hasText('Close', 'The close button says "Close"');

    window.confirm = () => {
      return true;
    };
    await click('.schedule__modal-cancel-btn');

    assert.dom('.schedule__modal-header').isNotVisible('Schedule modal closes after clicking the close button');
  });
});

import { blur, click, fillIn, find, findAll, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptances | Navi Dashboard Schedule Modal', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('schedule modal save new schedule', async function(assert) {
    assert.expect(12);
    await visit('/dashboards');

    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-collection__row0 .schedule .schedule-action__button');

    assert.dom('.schedule-modal__header .primary-header').isVisible('Schedule modal pops up when action is clicked');

    assert
      .dom('.schedule-modal__delete-btn')
      .isNotVisible('The delete button is not present when creating a new schedule');

    assert
      .dom('.schedule-modal__save-btn')
      .hasText('Save', 'The save button says "Save" and not "Save Changes" when creating a new schedule');

    assert.equal(
      find('.schedule-modal__dropdown--frequency').selectedOptions[0].textContent.trim(),
      'Week',
      'Frequency field is set to the default value when creating a new schedule'
    );

    assert
      .dom('.schedule-modal__input--recipients input')
      .hasNoValue('Recipients field is empty when creating a new schedule');

    assert.equal(
      find('.schedule-modal__dropdown--format').selectedOptions[0].textContent.trim(),
      'pdf',
      'Format field is set to the default value when creating a new schedule'
    );

    await click('.schedule-modal__dropdown--format');
    assert.deepEqual(
      findAll('.schedule-modal__dropdown--format option').map(el => el.textContent.trim()),
      ['pdf', 'png'],
      'Schedule format should have correct options'
    );

    await fillIn('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    const select = find('.schedule-modal__dropdown--frequency');
    await click('select');
    select.selectedIndex = 0;
    await triggerEvent(select, 'change');

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert
      .dom('.success .notification-text')
      .hasText(
        'Dashboard delivery schedule successfully saved!',
        'Successful notification is shown after clicking save'
      );

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

    assert.equal(
      find('.schedule-modal__dropdown--frequency').selectedOptions[0].textContent.trim(),
      'Day',
      'Frequency field is set by the saved delivery rule'
    );

    assert
      .dom('.schedule-modal__input--recipients .navi-email-tag')
      .hasText('navi_user@navi.io', 'Recipients field is set by the saved delivery rule');
  });

  test('schedule modal in dashboard view', async function(assert) {
    assert.expect(4);
    await visit('/dashboards/2/view');

    // Click "Schedule"
    await click('.schedule-action__button');

    assert.dom('.schedule-modal__header').isVisible('Schedule modal pops up when action is clicked');

    assert.equal(
      find('.schedule-modal__dropdown--frequency').selectedOptions[0].textContent.trim(),
      'Week',
      'Frequency field is set to Week'
    );

    // Set frequency to Day
    const select = find('.schedule-modal__dropdown--frequency');
    await click('select');
    select.selectedIndex = 0;
    await triggerEvent(select, 'change');

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert
      .dom('.success .notification-text')
      .hasText(
        'Dashboard delivery schedule successfully saved!',
        'Successful notification is shown after clicking save'
      );

    // Close the modal
    await click('.schedule-modal__cancel-btn');

    // Reopen the modal
    await click('.schedule-action__button');

    assert.equal(
      find('.schedule-modal__dropdown--frequency').selectedOptions[0].textContent.trim(),
      'Day',
      'Changes are saved'
    );
  });
});

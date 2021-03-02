import { blur, click, fillIn, findAll, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import $ from 'jquery';

module('Acceptances | Navi Dashboard Schedule Modal', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('schedule modal save new schedule', async function (assert) {
    assert.expect(12);
    await visit('/dashboards');

    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.schedule');

    assert.dom('.schedule__modal-header').isVisible('Schedule modal pops up when action is clicked');

    assert
      .dom('.schedule-modal__delete-btn')
      .isNotVisible('The delete button is not present when creating a new schedule');

    assert
      .dom('.schedule-modal__save-btn')
      .hasText('Save', 'The save button says "Save" and not "Save Changes" when creating a new schedule');

    assert
      .dom('.schedule-modal__frequency-trigger .ember-power-select-selected-item')
      .hasText('Week', 'Frequency field is set to the default value when creating a new schedule');

    assert
      .dom('.schedule-modal__input--recipients input')
      .hasNoValue('Recipients field is empty when creating a new schedule');

    assert
      .dom('.schedule-modal__format-trigger .ember-power-select-selected-item')
      .hasText('pdf', 'Format field is set to the default value when creating a new schedule');

    await click('.schedule-modal__format-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['pdf', 'png'],
      'Schedule format should have correct options'
    );

    await fillIn('.js-ember-tag-input-new', 'navi_user@navi.io');
    await blur('.js-ember-tag-input-new');

    // Set frequency to Day
    await click('.schedule-modal__frequency-trigger');
    await click($('.ember-power-select-option:contains(Day)')[0]);

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert
      .dom('.alert')
      .hasText(
        'Dashboard delivery schedule successfully saved!',
        'Successful notification is shown after clicking save'
      );

    //Reopen the modal because it closed when saved
    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.schedule');

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
      .dom('.schedule-modal__frequency-trigger .ember-power-select-selected-item')
      .hasText('Day', 'Frequency field is set by the saved delivery rule');

    assert
      .dom('.schedule-modal__input--recipients .tag')
      .hasText('navi_user@navi.io', 'Recipients field is set by the saved delivery rule');
  });

  test('schedule modal in dashboard view', async function (assert) {
    assert.expect(4);
    await visit('/dashboards/2/view');

    // Click "Schedule"
    await click('.schedule-action__button');

    assert.dom('.schedule__modal-header').isVisible('Schedule modal pops up when action is clicked');

    assert
      .dom('.schedule-modal__frequency-trigger .ember-power-select-selected-item')
      .hasText('Week', 'Frequency field is set to Week');

    // Set frequency to Day
    await click('.schedule-modal__frequency-trigger');
    await click($('.ember-power-select-option:contains(Day)')[0]);

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert
      .dom('.alert')
      .hasText(
        'Dashboard delivery schedule successfully saved!',
        'Successful notification is shown after clicking save'
      );

    // Reopen the modal
    await click('.schedule-action__button');

    assert
      .dom('.schedule-modal__frequency-trigger .ember-power-select-selected-item')
      .hasText('Day', 'Changes are saved');
  });
});

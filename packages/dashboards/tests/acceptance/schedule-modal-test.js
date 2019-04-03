import { click, find, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { teardownModal } from '../helpers/teardown-modal';
import { typeInInput } from '../helpers/ember-tag-input';

module('Acceptances | Navi Dashboard Schedule Modal', function(hooks) {
  setupApplicationTest(hooks);

  hooks.afterEach(function() {
    teardownModal();
    server.shutdown();
  });

  test('schedule modal save new schedule', async function(assert) {
    assert.expect(11);
    await visit('/dashboards');

    // Click "Schedule"
    await click('.navi-collection__row:first-of-type .schedule .btn');

    assert.ok(
      find('.schedule-modal__header .primary-header').is(':visible'),
      'Schedule modal pops up when action is clicked'
    );

    assert.notOk(
      find('.schedule-modal__delete-btn').is(':visible'),
      'The delete button is not present when creating a new schedule'
    );

    assert
      .dom('.schedule-modal__save-btn')
      .hasText('Save', 'The save button says "Save" and not "Save Changes" when creating a new schedule');

    assert.equal(
      findAll('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')[0].innerText.trim(),
      'Week',
      'Frequency field is set to the default value when creating a new schedule'
    );

    assert
      .dom('.schedule-modal__input--recipients')
      .hasValue('', 'Recipients field is empty when creating a new schedule');

    assert.equal(
      findAll('.schedule-modal__dropdown--format .ember-power-select-selected-item')[0].innerText.trim(),
      'pdf',
      'Format field is set to the default value when creating a new schedule'
    );
    typeInInput('.js-ember-tag-input-new', 'navi_user@navi.io');
    $('.js-ember-tag-input-new').blur();

    // Set frequency to Day
    await click('.schedule-modal__dropdown--frequency .ember-power-select-trigger');
    await click('.ember-power-select-option:contains(Day)');

    //Save the schedule
    await click('.schedule-modal__save-btn');

    assert
      .dom('.success .notification-text')
      .hasText(
        'Dashboard delivery schedule successfully saved!',
        'Successful notification is shown after clicking save'
      );

    // Check that all fields match the delivery rule we just saved
    assert.ok(
      find('.schedule-modal__delete-btn').is(':visible'),
      'The delete button is present after a delivery rule has been saved'
    );

    assert
      .dom('.schedule-modal__save-btn')
      .hasText(
        'Save Changes',
        'The save button says "Save Changes" and not "Save" after a delivery rule has been saved'
      );

    assert.equal(
      findAll('.schedule-modal__dropdown--frequency .ember-power-select-selected-item')[0].innerText.trim(),
      'Day',
      'Frequency field is set by the saved delivery rule'
    );

    assert
      .dom('.schedule-modal__input--recipients .navi-email-tag')
      .hasText('navi_user@navi.io', 'Recipients field is set by the saved delivery rule');
  });

  test('open schedule modal in dashboard view', async function(assert) {
    assert.expect(1);
    await visit('/dashboards/2/view');

    // Click "Schedule"
    await click('.schedule-action__button');

    assert.ok(find('.schedule-modal__header').is(':visible'), 'Schedule modal pops up when action is clicked');
  });
});

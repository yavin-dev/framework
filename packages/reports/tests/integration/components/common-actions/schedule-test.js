import { resolve } from 'rsvp';
import $ from 'jquery';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, blur, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { nativeMouseUp } from 'ember-power-select/test-support/helpers';
import config from 'ember-get-config';
import RSVP from 'rsvp';

const DeliveryRule = {
  frequency: 'Week',
  format: { type: 'csv' },
  recipients: ['test@oath.com', 'rule@oath.com'],
};
const TestModel = {
  constructor: { modelName: 'report' },
  title: 'Test Test',
  deliveryRuleForUser: new RSVP.Promise((resolve) => resolve(DeliveryRule)),
};
const unscheduledModel = {
  title: 'Test Test',
  deliveryRuleForUser: new RSVP.Promise((resolve) => resolve(null)),
  constructor: {
    modelName: 'report',
  },
};

const TEMPLATE = hbs`
<CommonActions::Schedule
  @model={{this.model}}
  @isValidForSchedule={{this.isValidForSchedule}}
  @onSave={{this.onSaveAction}}
  @onRevert={{this.onRevertAction}}
  @onDelete={{this.onDeleteAction}}
  as |toggleModal|
>
  <button
    type="button"
    class="schedule-action__button"
    {{on "click" toggleModal}}
  >
    <NaviIcon @icon="clock-o" class="navi-report__action-icon" />
  </button>
</CommonActions::Schedule>
`;

module('Integration | Component | common actions/schedule', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('isValidForSchedule', () => Promise.resolve(true));
    this.set('onSaveAction', () => {});
    this.set('onRevertAction', () => {});
    this.set('onDeleteAction', () => {});
  });

  test('it renders', async function (assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert.ok($('.schedule-action__button').is(':visible'), 'Schedule Modal component is rendered');

    assert.ok($('.navi-report__action-icon').is(':visible'), 'A schedule icon is rendered in the component');
  });

  test('schedule modal - not valid', async function (assert) {
    assert.expect(1);
    this.set('model', TestModel);
    this.set('isValidForSchedule', () => Promise.resolve(false));

    await render(TEMPLATE);
    await click('.schedule-action__button');

    assert
      .dom('.schedule__modal .alert')
      .hasText('Please validate the report to enable scheduling.', 'Error is displayed when validation fails');
  });

  test('schedule modal', async function (assert) {
    assert.expect(8);

    this.set('model', unscheduledModel);

    await render(TEMPLATE);

    await click('.schedule-action__button');

    assert.ok($('.modal.is-active').is(':visible'), 'Schedule Modal component is rendered when the button is clicked');

    assert.dom('.schedule__modal .alert').doesNotExist('Error is not displayed when item is valid');

    assert
      .dom('.schedule__modal-header')
      .hasText('Schedule Report', 'The primary header makes use of the category of page appropriately');

    assert.deepEqual(
      findAll('.input-group label').map((el) => el.textContent.trim()),
      ['Recipients', 'Frequency', 'Format', 'Only send if data is present', ''],
      'Schedule Modal has all the expected sections'
    );

    assert
      .dom('.schedule__modal-input--recipients')
      .exists('Schedule Modal component renders an text area for recipients');

    assert.dom('.schedule__modal-frequency-trigger').hasText('Week', 'Week is the default frequency value');

    assert.dom('.schedule__modal-format-trigger').hasText('csv', '`.csv` is the default format value');

    assert.dom('.schedule__modal-rejected').doesNotExist('rejected error does not show');
  });

  test('schedule modal - delivery rule passed in', async function (assert) {
    assert.expect(2);
    this.set('model', TestModel);

    await render(TEMPLATE);

    await click('.schedule-action__button');

    assert.deepEqual(
      $('.schedule__modal-input--recipients .tag')
        .toArray()
        .map((e) => e.textContent.trim()),
      ['test@oath.com', 'rule@oath.com'],
      'The recipients are fetched from the delivery rule'
    );

    assert.equal(
      $('.schedule__modal-frequency-trigger').text().trim(),
      'Week',
      'The frequency is fetched from the delivery rule'
    );
  });

  test('onSave Action', async function (assert) {
    assert.expect(9);

    this.set('model', unscheduledModel);

    await render(TEMPLATE);

    //Open modal
    await click('.schedule-action__button');

    assert
      .dom('.schedule__modal-save-btn')
      .hasText('Save', 'The save button says `Save` when model does not have a delivery rule for the current user');

    assert.ok($('.schedule__modal-save-btn').attr('disabled'), 'The save button should be disabled initially');

    assert.dom('.schedule__modal-cancel-btn').hasText('Cancel', 'Show cancel button before save a delivery rule');

    assert
      .dom('.schedule__modal-delete-btn')
      .isNotVisible('The delete button is not available when model does not have a delivery rule for the current user');

    await fillIn('.js-ember-tag-input-new', 'test1@navi.io');
    await blur('.js-ember-tag-input-new');

    await click('.schedule__modal-frequency-trigger');
    await nativeMouseUp($('.ember-power-select-option:contains(Month)')[0]);

    assert.notOk(
      $('.schedule__modal-save-btn').attr('disabled'),
      'The save button should be enabled after making valid changes'
    );

    this.set('onSaveAction', (rule) => {
      assert.equal(rule.get('frequency'), 'month', 'Selected frequency is updated in the delivery rule');

      assert.deepEqual(
        rule.get('recipients'),
        ['test1@navi.io'],
        'Recipients entered in the text area is set in the delivery rule'
      );

      assert.ok(true, 'OnSave action is called');

      rule.rollbackAttributes();

      return resolve();
    });

    //Click save after modal is open
    await click('.schedule__modal-save-btn');

    assert.equal(
      $('.schedule__modal-cancel-btn').text().trim(),
      'Close',
      'Show close button after save a delivery rule'
    );
  });

  test('onRevert Action', async function (assert) {
    assert.expect(1);

    this.set('model', TestModel);

    await render(TEMPLATE);

    //Open modal
    await click('.schedule-action__button');

    this.set('onRevertAction', () => {
      assert.ok(true, 'OnRevert action is called');
    });

    //Click cancel after modal is open
    await click('.schedule__modal-cancel-btn');
  });

  test('onDelete action', async function (assert) {
    assert.expect(2);

    this.set('deliveryRule', DeliveryRule);

    this.set('model', TestModel);

    this.set('onDeleteAction', () => {
      assert.ok(true, 'OnDelete action is called');
    });

    await render(TEMPLATE);

    await click('.schedule-action__button');

    assert.equal(
      $('.schedule__modal-delete-btn').length,
      1,
      'Delete button is shown when deliveryRule is present for current user'
    );

    await click('.schedule__modal-delete-btn');

    await click('.delete__modal-delete-btn');
  });

  test('frequency options - default', async function (assert) {
    assert.expect(1);

    this.set('model', TestModel);
    await render(TEMPLATE);

    await click('.schedule-action__button');

    await click('.schedule__modal-frequency-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['Day', 'Week', 'Month', 'Quarter', 'Year'],
      'Schedule frequency should have correct default options'
    );
  });

  test('frequency options - config schedule', async function (assert) {
    assert.expect(1);

    let originalSchedule = config.navi.schedule;
    config.navi.schedule = { frequencies: ['day', 'week', 'month'] };

    this.set('model', TestModel);
    await render(TEMPLATE);

    await click('.schedule-action__button');

    await click('.schedule__modal-frequency-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['Day', 'Week', 'Month'],
      'Schedule frequency should have correct options'
    );
    config.navi.schedule = originalSchedule;
  });

  test('format options - config formats', async function (assert) {
    assert.expect(1);

    let originalSchedule = config.navi.schedule;
    config.navi.schedule = { formats: ['csv', 'test'] };

    this.set('model', TestModel);
    await render(TEMPLATE);

    await click('.schedule-action__button');

    await click('.schedule__modal-format-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['csv', 'test'],
      'Schedule format should have correct options'
    );
    config.navi.schedule = originalSchedule;
  });

  test('format options - fallback to `exportFileTypes`', async function (assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['pdf', 'png'];
    this.set('model', TestModel);
    await render(TEMPLATE);

    await click('.schedule-action__button');

    await click('.schedule__modal-format-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['csv', 'pdf', 'png'],
      'Schedule format should have correct options'
    );

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('format options - config exportFileTypes is empty', async function (assert) {
    assert.expect(2);

    let originalFeatureFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = [];

    this.set('model', TestModel);

    await render(TEMPLATE);

    await click('.schedule-action__button');

    assert
      .dom('.schedule__modal-format-trigger')
      .hasAttribute('aria-disabled', 'true', 'The formats dropdown is disabled by default');
    assert
      .dom('.schedule__modal-format-trigger .ember-power-select-selected-item')
      .includesText('csv', 'Schedule format should have correct default option');

    config.navi.FEATURES.exportFileTypes = originalFeatureFlag;
  });
});

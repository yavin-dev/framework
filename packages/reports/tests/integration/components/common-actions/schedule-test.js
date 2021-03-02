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
  title: 'Test Test',
  deliveryRuleForUser: new RSVP.Promise((resolve) => resolve(DeliveryRule)),
};
const unscheduledModel = {
  title: 'Test Test',
  deliveryRuleForUser: new RSVP.Promise((resolve) => resolve(null)),
};

const TEMPLATE = hbs`
<CommonActions::Schedule
  @model={{this.model}}
  @onSave={{this.onSaveAction}}
  @onRevert={{this.onRevertAction}}
  @onDelete={{this.onDeleteAction}}
  @disabled={{this.isDisabled}}
  as |toggleModal|
>
  <button
    type="button"
    class="schedule-action__button"
    disabled={{this.isDisabled}}
    {{on "click" toggleModal}}
  >
    <NaviIcon @icon="clock-o" class="navi-report__action-icon" />
  </button> 
</CommonActions::Schedule>
`;

module('Integration | Component | common actions/schedule', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('onSaveAction', () => {});
    this.set('onRevertAction', () => {});
    this.set('onDeleteAction', () => {});
  });

  test('schedule modal - test disabled', async function (assert) {
    assert.expect(1);
    this.set('model', TestModel);

    await render(TEMPLATE);

    this.set('isDisabled', false);

    assert.notOk(
      $('.schedule-action__button').is(':disabled'),
      'Schedule is enabled when the disabled is set to false'
    );
  });

  test('schedule modal - test enabled', async function (assert) {
    assert.expect(1);
    this.set('model', TestModel);

    await render(TEMPLATE);

    this.set('isDisabled', true);

    assert.ok($('.schedule-action__button').is(':disabled'), 'Schedule is enabled when the disabled is set to false');
  });

  test('it renders', async function (assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert.ok($('.schedule-action__button').is(':visible'), 'Schedule Modal component is rendered');

    assert.ok($('.navi-report__action-icon').is(':visible'), 'A schedule icon is rendered in the component');
  });

  test('schedule modal', async function (assert) {
    assert.expect(9);

    this.set('model', unscheduledModel);

    await render(TEMPLATE);

    await click('.schedule-action__button');

    assert.ok($('.modal.is-active').is(':visible'), 'Schedule Modal component is rendered when the button is clicked');

    assert.equal(
      $('.schedule__modal-header').text().trim(),
      'Schedule report',
      'The primary header makes use of the category of page appropriately'
    );

    assert.deepEqual(
      $('.input-group label')
        .toArray()
        .map((el) => $(el).text().trim()),
      ['Recipients', 'Frequency', 'Format', 'Only send if data is present', ''],
      'Schedule Modal has all the expected sections'
    );

    assert.ok(
      $('.schedule-modal__input--recipients').is(':visible'),
      'Schedule Modal component renders an text area for recipients'
    );

    assert.ok(
      $('.schedule-modal__frequency-trigger').is(':visible'),
      'Schedule Modal component renders an dropdown for frequencies'
    );

    assert.ok(
      $('.schedule-modal__format-trigger').is(':visible'),
      'Schedule Modal component renders an dropdown for formats'
    );

    assert.equal($('.schedule-modal__frequency-trigger').text().trim(), 'Week', 'Week is the default frequency value');

    assert.equal($('.schedule-modal__format-trigger').text().trim(), 'csv', '`.csv` is the default format value');

    assert.notOk($('.schedule-modal__rejected').is(':visible'), 'rejected error does not show');
  });

  test('schedule modal - delivery rule passed in', async function (assert) {
    assert.expect(2);
    this.set('model', TestModel);

    await render(TEMPLATE);

    await click('.schedule-action__button');

    assert.deepEqual(
      $('.schedule-modal__input--recipients .tag')
        .toArray()
        .map((e) => e.textContent.trim()),
      ['test@oath.com', 'rule@oath.com'],
      'The recipients are fetched from the delivery rule'
    );

    assert.equal(
      $('.schedule-modal__frequency-trigger').text().trim(),
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
      .dom('.schedule-modal__save-btn')
      .hasText('Save', 'The save button says `Save` when model does not have a delivery rule for the current user');

    assert.ok($('.schedule-modal__save-btn').attr('disabled'), 'The save button should be disabled initially');

    assert.dom('.schedule-modal__cancel-btn').hasText('Cancel', 'Show cancel button before save a delivery rule');

    assert
      .dom('.schedule-modal__delete-btn')
      .isNotVisible('The delete button is not available when model does not have a delivery rule for the current user');

    await fillIn('.js-ember-tag-input-new', 'test1@navi.io');
    await blur('.js-ember-tag-input-new');

    await click('.schedule-modal__frequency-trigger');
    await nativeMouseUp($('.ember-power-select-option:contains(Month)')[0]);

    assert.notOk(
      $('.schedule-modal__save-btn').attr('disabled'),
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
    await click('.schedule-modal__save-btn');

    assert.equal(
      $('.schedule-modal__cancel-btn').text().trim(),
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
    await click('.schedule-modal__cancel-btn');
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
      $('.schedule-modal__delete-btn').length,
      1,
      'Delete button is shown when deliveryRule is present for current user'
    );

    await click('.schedule-modal__delete-btn');

    await click('.delete__delete-btn');
  });

  test('frequency options - default', async function (assert) {
    assert.expect(1);

    this.set('model', TestModel);
    await render(TEMPLATE);

    await click('.schedule-action__button');

    await click('.schedule-modal__frequency-trigger');
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

    await click('.schedule-modal__frequency-trigger');
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

    await click('.schedule-modal__format-trigger');
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

    await click('.schedule-modal__format-trigger');
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
      .dom('.schedule-modal__format-trigger')
      .hasAttribute('aria-disabled', 'true', 'The formats dropdown is disabled by default');
    assert
      .dom('.schedule-modal__format-trigger .ember-power-select-selected-item')
      .includesText('csv', 'Schedule format should have correct default option');

    config.navi.FEATURES.exportFileTypes = originalFeatureFlag;
  });
});

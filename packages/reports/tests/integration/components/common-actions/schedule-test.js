import { resolve } from 'rsvp';
import $ from 'jquery';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, blur, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { nativeMouseUp } from 'ember-power-select/test-support/helpers';
import config from 'ember-get-config';
const DeliveryRule = {
  frequency: 'Week',
  format: { type: 'csv' },
  recipients: ['test@oath.com', 'rule@oath.com'],
  delivery: 'email',
  name: 'Email delivered csv every week',
  isDisabled: false,
  validations: { isValid: true },
};
const NoDelivery = {
  frequency: 'Week',
  delivery: 'none',
  format: { type: 'csv' },
  recipients: ['test@oath.com', 'rule@oath.com'],
  name: 'No delivery csv every week',
  isDisabled: false,
  validations: { isValid: true },
};
const NoDeliveryModel = {
  constructor: { modelName: 'report' },
  title: 'Test Test',
  deliveryRulesForUser: Promise.resolve([NoDelivery]),
};
const TestModel = {
  constructor: { modelName: 'report' },
  title: 'Test Test',
  deliveryRulesForUser: Promise.resolve([DeliveryRule]),
};
const errorModel = {
  constructor: { modelName: 'report' },
  title: 'Test Test',
  get deliveryRulesForUser() {
    return Promise.reject([DeliveryRule]);
  },
};
const unscheduledModel = {
  title: 'Test Test',
  deliveryRulesForUser: Promise.resolve([]),
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

    assert.dom('.schedule-action__button').isVisible('Schedule Modal component is rendered');

    assert.dom('.navi-report__action-icon').isVisible('A schedule icon is rendered in the component');
  });

  test('schedule modal when valid', async function (assert) {
    assert.expect(9);

    this.set('model', unscheduledModel);

    await render(TEMPLATE);
    await click('.schedule-action__button');

    assert.dom('.modal.is-active').isVisible('Schedule Modal component is rendered when the button is clicked');

    await click('.schedule__modal-new-delivery button');

    assert.dom('.schedule__modal .alert').doesNotExist('Error is not displayed when item is valid');

    assert
      .dom('.schedule__modal-header')
      .hasText('Schedule Report', 'The primary header makes use of the category of page appropriately');

    assert.deepEqual(
      findAll('.input-group label').map((el) => el.textContent.trim()),
      [
        'Schedule Name',
        'Delivery',
        'Recipients',
        'Format',
        'Frequency',
        'Only send if data is present',
        '',
        'Status',
        '',
      ],
      'Schedule Modal has all the expected sections'
    );

    assert
      .dom('.schedule__modal-input--recipients')
      .exists('Schedule Modal component renders an text area for recipients');

    assert.dom('.schedule__modal-frequency-trigger').hasText('Week', 'Week is the default frequency value');

    assert.dom('.schedule__modal-format-trigger').hasText('csv', '`.csv` is the default format value');

    assert.dom('.schedule__modal-rejected').doesNotExist('rejected error does not show');

    assert.dom('.schedule__modal-overwrite').doesNotExist('Overwrite switch not shown for non overwritable types');
  });

  test('schedule modal when invalid', async function (assert) {
    assert.expect(10);

    this.set('model', unscheduledModel);
    this.set('isValidForSchedule', () => Promise.resolve(false));

    await render(TEMPLATE);

    await click('.schedule-action__button');

    assert.dom('.modal.is-active').isVisible('Schedule Modal component is rendered when the button is clicked');

    assert
      .dom('.schedule__modal-header')
      .hasText('Schedule Report', 'The primary header makes use of the category of page appropriately');

    await click('.schedule__modal-new-delivery button');

    assert
      .dom('.schedule__modal .alert')
      .hasText(
        'Unable to schedule invalid report. Please fix errors before proceeding.',
        'Error is displayed when validation fails'
      );

    assert.dom('.schedule__modal-input--recipients').doesNotExist('Input for recipients is not rendered');

    assert.dom('.schedule__modal-frequency-trigger').doesNotExist('Frequency selector is not rendered');

    assert.dom('.schedule__modal-format-trigger').doesNotExist('Format selector is not rendered');

    assert.dom('.schedule__modal-rejected').doesNotExist('rejected error does not show');

    assert.dom('.schedule__modal-cancel-btn').hasText('Close', 'Close button is rendered');

    assert.dom('.schedule__modal-save-btn').doesNotExist('Save button is not rendered');

    assert.dom('.schedule__modal-delete-btn').doesNotExist('Delete button is not rendered');
  });

  test('schedule modal - delivery rule passed in when valid', async function (assert) {
    assert.expect(2);
    this.set('model', TestModel);

    await render(TEMPLATE);

    await click('.schedule-action__button');

    assert.deepEqual(
      findAll('.schedule__modal-input--recipients .tag').map((el) => el.textContent.trim()),
      ['test@oath.com', 'rule@oath.com'],
      'The recipients are fetched from the delivery rule'
    );

    assert.dom('.schedule__modal-frequency-trigger').hasText('Week', 'The frequency is fetched from the delivery rule');
  });

  test('schedule modal - delivery rule passed in when invalid', async function (assert) {
    assert.expect(4);
    this.set('model', TestModel);
    this.set('isValidForSchedule', () => Promise.resolve(false));

    await render(TEMPLATE);

    await click('.schedule-action__button');
    assert.deepEqual(
      findAll('.schedule__modal-input--recipients .tag').map((el) => el.textContent.trim()),
      ['test@oath.com', 'rule@oath.com'],
      'The recipients are fetched from the delivery rule'
    );

    assert.dom('.schedule__modal-frequency-trigger').hasText('Week', 'The frequency is fetched from the delivery rule');

    assert.dom('.schedule__modal-save-btn').exists('Save button is rendered');

    assert.dom('.schedule__modal-delete-btn').exists('Delete button is rendered');
  });

  test('onSave Action', async function (assert) {
    assert.expect(9);

    this.set('model', unscheduledModel);

    await render(TEMPLATE);

    //Open modal
    await click('.schedule-action__button');

    await click('.schedule__modal-new-delivery button');

    assert
      .dom('.schedule__modal-save-btn')
      .hasText('Save', 'The save button says `Save` when model does not have a delivery rule for the current user');

    assert.dom('.schedule__modal-save-btn').isDisabled('The save button should be disabled initially');

    assert.dom('.schedule__modal-cancel-btn').hasText('Cancel', 'Show cancel button before save a delivery rule');

    assert
      .dom('.schedule__modal-delete-btn')
      .isNotVisible('The delete button is not available when model does not have a delivery rule for the current user');

    await fillIn('.js-ember-tag-input-new', 'test1@navi.io');
    await blur('.js-ember-tag-input-new');

    await click('.schedule__modal-frequency-trigger');
    await nativeMouseUp($('.ember-power-select-option:contains(Month)')[0]);

    assert.dom('.schedule__modal-save-btn').isEnabled('The save button should be enabled after making valid changes');

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

    assert.dom('.schedule__modal-cancel-btn').hasText('Close', 'Show close button after save a delivery rule');
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

    assert
      .dom('.schedule__modal-delete-btn')
      .exists({ count: 1 }, 'Delete button is shown when deliveryRule is present for current user');

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

  test('format options - with csv to `exportFileTypes`', async function (assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];
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

  test('format options - with csv to `exportFileTypes` and sort the format types', async function (assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['pdf', 'csv', 'png'];
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

  test('format options - onChange', async function (assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['pdf', 'png'];
    this.set('model', TestModel);
    await render(TEMPLATE);

    await click('.schedule-action__button');

    await click('.schedule__modal-format-trigger');

    assert.dom('.schedule__modal-format-trigger').hasText('csv', 'Schedule format should have correct default option');
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
    assert.dom('.schedule__modal-format-trigger').hasText('csv', 'Schedule format should have correct default option');

    config.navi.FEATURES.exportFileTypes = originalFeatureFlag;
  });

  test('error fetching delivery rule when valid', async function (assert) {
    assert.expect(11);

    this.set('model', errorModel);

    await render(TEMPLATE);
    await click('.schedule-action__button');

    assert.dom('.modal.is-active').isVisible('Schedule Modal component is rendered when the button is clicked');

    assert
      .dom('.schedule__modal-header')
      .hasText('Schedule Report', 'The primary header makes use of the category of page appropriately');

    assert
      .dom('.schedule__modal .alert')
      .hasText(
        'Error An error occurred while fetching your schedule(s) for this report.',
        'Error is displayed correctly'
      );

    assert.deepEqual(
      findAll('.input-group label').map((el) => el.textContent.trim()),
      [
        'Schedule Name',
        'Delivery',
        'Recipients',
        'Format',
        'Frequency',
        'Only send if data is present',
        '',
        'Status',
        '',
      ],
      'Schedule Modal has all the expected sections'
    );

    assert
      .dom('.schedule__modal-input--recipients')
      .exists('Schedule Modal component renders an text area for recipients');

    assert.dom('.schedule__modal-frequency-trigger').hasText('Week', 'Week is the default frequency value');

    assert.dom('.schedule__modal-format-trigger').hasText('csv', '`.csv` is the default format value');

    assert.dom('.schedule__modal-rejected').doesNotExist('rejected error does not show');

    assert.dom('.schedule__modal-cancel-btn').hasText('Cancel', 'Cancel button is rendered');

    assert.dom('.schedule__modal-save-btn').doesNotExist('Save button is not rendered');

    assert.dom('.schedule__modal-delete-btn').doesNotExist('Delete button is not rendered');
  });

  test('error fetching delivery rule when invalid', async function (assert) {
    assert.expect(10);

    this.set('model', errorModel);
    this.set('isValidForSchedule', () => Promise.resolve(false));

    await render(TEMPLATE);
    await click('.schedule-action__button');

    assert.dom('.modal.is-active').isVisible('Schedule Modal component is rendered when the button is clicked');

    assert
      .dom('.schedule__modal-header')
      .hasText('Schedule Report', 'The primary header makes use of the category of page appropriately');

    assert.deepEqual(
      findAll('.schedule__modal .alert p').map((el) => el.textContent.trim()),
      [
        'An error occurred while fetching your schedule(s) for this report.',
        'Unable to schedule invalid report. Please fix errors before proceeding.',
      ],
      'Both fetching and invalid errors are displayed'
    );

    assert.dom('.schedule__modal-input--recipients').doesNotExist('Input for recipients is not rendered');

    assert.dom('.schedule__modal-frequency-trigger').doesNotExist('Frequency selector is not rendered');

    assert.dom('.schedule__modal-format-trigger').doesNotExist('Format selector is not rendered');

    assert.dom('.schedule__modal-rejected').doesNotExist('rejected error does not show');

    assert.dom('.schedule__modal-cancel-btn').hasText('Close', 'Close button is rendered');

    assert.dom('.schedule__modal-save-btn').doesNotExist('Save button is not rendered');

    assert.dom('.schedule__modal-delete-btn').doesNotExist('Delete button is not rendered');
  });

  test('Change to no delivery', async function (assert) {
    assert.expect(2);

    this.set('model', TestModel);

    await render(TEMPLATE);
    await click('.schedule-action__button');

    await click('.schedule__modal-new-delivery button');

    assert.deepEqual(
      findAll('.input-group label').map((el) => el.textContent.trim()),
      [
        'Schedule Name',
        'Delivery',
        'Recipients',
        'Format',
        'Frequency',
        'Only send if data is present',
        '',
        'Status',
        '',
      ],
      'Schedule Modal has all the expected sections'
    );

    await click('.schedule__modal-delivery-trigger');
    await nativeMouseUp($('.ember-power-select-option:contains(None)')[0]);

    assert.deepEqual(
      findAll('.input-group label').map((el) => el.textContent.trim()),
      ['Schedule Name', 'Delivery', 'Frequency', 'Status', ''],
      'Schedule Modal has all the expected sections'
    );
  });

  test('No Delivery Schedule', async function (assert) {
    assert.expect(1);

    this.set('model', NoDeliveryModel);

    await render(TEMPLATE);
    await click('.schedule-action__button');

    assert.deepEqual(
      findAll('.input-group label').map((el) => el.textContent.trim()),
      ['Schedule Name', 'Delivery', 'Frequency', 'Status', ''],
      'Schedule Modal has all the expected sections'
    );
  });

  test('overwrite file toggle', async function (assert) {
    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['gsheet'];

    const testDR = {
      frequency: 'week',
      format: { type: 'gsheet' },
      recipients: ['test@oath.com', 'rule@oath.com'],
      isDisabled: false,
      failureCount: 0,
      name: 'Gsheet delivered every week',
    };

    this.set('model', {
      constructor: { modelName: 'report' },
      title: 'Test the overwrite',
      deliveryRulesForUser: Promise.resolve([testDR]),
    });
    await render(TEMPLATE);

    debugger;
    await click('.schedule-action__button');

    assert.dom('.schedule__modal-overwrite').exists('Overwrite control exists');

    await click('.schedule__modal-overwrite-toggle');

    assert.ok(testDR.format.options.overwriteFile, 'overwrite file toggled on');

    await click('.schedule__modal-overwrite-toggle');

    assert.notOk(testDR.format.options.overwriteFile, 'overwrite file toggled off');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });
});

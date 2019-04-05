import { resolve } from 'rsvp';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import { typeInInput } from '../../../helpers/ember-tag-input';
import config from 'ember-get-config';

const DeliveryRule = {
  frequency: 'Week',
  format: { type: 'csv' },
  recipients: ['test@oath.com', 'rule@oath.com']
};
const TestModel = {
  title: 'Test Test',
  deliveryRuleForUser: {
    isFulfilled: true,
    content: DeliveryRule
  }
};
const unscheduledModel = {
  title: 'Test Test',
  deliveryRuleForUser: {
    isFulfilled: true,
    content: null
  }
};

module('Integration | Component | common actions/schedule', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('onSaveAction', () => {});
    this.set('onRevertAction', () => {});
    this.set('onDeleteAction', () => {});
  });

  test('schedule modal - test disabled', async function(assert) {
    assert.expect(1);
    this.set('model', TestModel);

    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
              disabled=isDisabled
          }}
      `);

    this.set('isDisabled', false);

    assert.notOk(
      this.$('.schedule-action__button').is(':disabled'),
      'Scedule is enabled when the disabled is set to false'
    );
  });

  test('schedule modal - test enabled', async function(assert) {
    assert.expect(1);
    this.set('model', TestModel);

    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
              disabled=isDisabled
          }}
      `);

    this.set('isDisabled', true);

    assert.ok(
      this.$('.schedule-action__button').is(':disabled'),
      'Schedule is enabled when the disabled is set to false'
    );
  });

  test('it renders', async function(assert) {
    assert.expect(3);

    await render(
      hbs`{{common-actions/schedule onSave=(action onSaveAction) onRevert=(action onRevertAction) onDelete=(action onDeleteAction)}}`
    );

    assert.ok(this.$('.schedule-action__button').is(':visible'), 'Schedule Modal component is rendered');

    assert.ok(this.$('.schedule-action__icon').is(':visible'), 'A schedule icon is rendered in the component');

    // Template block usage:
    await render(hbs`
      {{#common-actions/schedule
          onSave=(action onSaveAction)
          onRevert=(action onRevertAction)
          onDelete=(action onDeleteAction)
      }}
        Schedule
      {{/common-actions/schedule}}
      `);

    assert
      .dom('.schedule-action__icon-label')
      .hasText('Schedule', 'When used in block mode, the text `Schedule` is displayed');
  });

  test('schedule modal', async function(assert) {
    assert.expect(9);

    this.set('model', unscheduledModel);

    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
          }}
      `);

    run(async () => {
      await click('.schedule-action__button');
    });

    assert.ok($('.navi-modal').is(':visible'), 'Schedule Modal component is rendered when the button is clicked');

    assert.equal(
      $('.primary-header')
        .text()
        .trim(),
      'Schedule "Test Test"',
      'The primary header makes use of the modelName appropriately'
    );

    assert.deepEqual(
      $('.schedule-modal__label')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Recipients', 'Frequency', 'Format'],
      'Schedule Modal has all the expected sections'
    );

    assert.ok(
      $('.schedule-modal__input--recipients').is(':visible'),
      'Schedule Modal component renders an text area for recipients'
    );

    assert.ok(
      $('.schedule-modal__dropdown--frequency').is(':visible'),
      'Schedule Modal component renders an dropdown for frequencies'
    );

    assert.ok(
      $('.schedule-modal__dropdown--format').is(':visible'),
      'Schedule Modal component renders an dropdown for formats'
    );

    assert.equal(
      $('.schedule-modal__dropdown--frequency')
        .text()
        .trim(),
      'Week',
      'Week is the default frequency value'
    );

    assert.equal(
      $('.schedule-modal__dropdown--format')
        .text()
        .trim(),
      'csv',
      '`.csv` is the default format value'
    );

    assert.notOk($('.schedule-modal__rejected').is(':visible'), 'rejected error does not show');
  });

  test('schedule modal - delivery rule passed in', async function(assert) {
    assert.expect(2);
    this.set('model', TestModel);

    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
          }}
      `);

    run(async () => {
      await click('.schedule-action__button');
    });

    assert.deepEqual(
      $('.schedule-modal__input--recipients .navi-email-tag')
        .toArray()
        .map(e => e.textContent.trim()),
      ['test@oath.com', 'rule@oath.com'],
      'The recipients are fetched from the delivery rule'
    );

    assert.equal(
      $('.schedule-modal__dropdown--frequency')
        .text()
        .trim(),
      'Week',
      'The frequency is fetched from the delivery rule'
    );
  });

  test('onSave Action', async function(assert) {
    assert.expect(9);

    this.set('model', unscheduledModel);

    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
          }}
      `);

    //Open modal
    run(async () => {
      await click('.schedule-action__button');
    });

    assert.equal(
      $('.schedule-modal__save-btn')
        .text()
        .trim(),
      'Save',
      'The save button says `Save` when model does not have a delivery rule for the current user'
    );

    assert.ok($('.schedule-modal__save-btn').attr('disabled'), 'The save button should be disabled initially');

    assert.equal(
      $('.schedule-modal__cancel-btn')
        .text()
        .trim(),
      'Cancel',
      'Show cancel button before save a delivery rule'
    );

    assert.equal(
      $('.schedule-modal__delete-btn').length,
      0,
      'The delete button is not available when model does not have a delivery rule for the current user'
    );

    run(() => {
      typeInInput('.js-ember-tag-input-new', 'test1@navi.io');
      $('.js-ember-tag-input-new').blur();

      clickTrigger('.schedule-modal__dropdown--frequency');
      nativeMouseUp($('.ember-power-select-option:contains(Month)')[0]);
    });

    assert.notOk(
      $('.schedule-modal__save-btn').attr('disabled'),
      'The save button should be enabled after making valid changes'
    );

    this.set('onSaveAction', rule => {
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
    run(() => {
      $('.schedule-modal__save-btn').click();
    });

    assert.equal(
      $('.schedule-modal__cancel-btn')
        .text()
        .trim(),
      'Close',
      'Show close button after save a delivery rule'
    );
  });

  test('onRevert Action', async function(assert) {
    assert.expect(1);

    this.set('model', TestModel);

    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
          }}
      `);

    //Open modal
    run(async () => {
      await click('.schedule-action__button');
    });

    this.set('onRevertAction', () => {
      assert.ok(true, 'OnRevert action is called');
    });

    //Click cancel after modal is open
    run(() => {
      $('.schedule-modal__cancel-btn').click();
    });
  });

  test('onDelete action', async function(assert) {
    assert.expect(2);

    this.set('deliveryRule', DeliveryRule);

    this.set('model', TestModel);

    this.set('onDeleteAction', () => {
      assert.ok(true, 'OnDelete action is called');
    });

    await render(
      hbsWithModal(
        `
        {{common-actions/schedule
            model=model
            onSave=(action onSaveAction)
            onRevert=(action onRevertAction)
            onDelete=(action onDeleteAction)
        }}
    `,
        this.owner
      )
    );

    run(async () => {
      await click('.schedule-action__button');
    });

    assert.equal(
      $('.schedule-modal__delete-btn').length,
      1,
      'Delete button is shown when deliveryRule is present for current user'
    );

    run(() => {
      $('.btn-container button:contains(Delete)').click();
    });

    return settled().then(() => {
      $('.btn-container button:contains(Confirm)').click();
    });
  });

  test('frequency options - default', async function(assert) {
    assert.expect(1);

    this.set('model', TestModel);
    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
              disabled=isDisabled
          }}
      `);

    run(async () => {
      await click('.schedule-action__button');
    });

    run(() => {
      clickTrigger('.schedule-modal__dropdown--frequency');
      assert.deepEqual(
        $('.ember-power-select-option')
          .map((i, el) =>
            $(el)
              .text()
              .trim()
          )
          .toArray(),
        ['Day', 'Week', 'Month', 'Quarter', 'Year'],
        'Schedule frequency should have correct default options'
      );
    });
  });

  test('frequency options - config schedule', async function(assert) {
    assert.expect(1);

    let originalSchedule = config.navi.schedule;
    config.navi.schedule = { frequencies: ['day', 'week', 'month'] };

    this.set('model', TestModel);
    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
              disabled=isDisabled
          }}
      `);

    run(async () => {
      await click('.schedule-action__button');
    });

    run(() => {
      clickTrigger('.schedule-modal__dropdown--frequency');
      assert.deepEqual(
        $('.ember-power-select-option')
          .map((i, el) =>
            $(el)
              .text()
              .trim()
          )
          .toArray(),
        ['Day', 'Week', 'Month'],
        'Schedule frequency should have correct options'
      );
      config.navi.schedule = originalSchedule;
    });
  });

  test('format options - config formats', async function(assert) {
    assert.expect(1);

    let originalSchedule = config.navi.schedule;
    config.navi.schedule = { formats: ['csv', 'test'] };

    this.set('model', TestModel);
    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
              disabled=isDisabled
          }}
      `);

    run(async () => {
      await click('.schedule-action__button');
    });

    run(() => {
      clickTrigger('.schedule-modal__dropdown--format');
      assert.deepEqual(
        $('.ember-power-select-option')
          .map((i, el) =>
            $(el)
              .text()
              .trim()
          )
          .toArray(),
        ['csv', 'test'],
        'Schedule format should have correct options'
      );
      config.navi.schedule = originalSchedule;
    });
  });

  test('format options - config enableMultipleExport', async function(assert) {
    assert.expect(3);

    let originalFeatureFlag = config.navi.FEATURES.enableMultipleExport;
    config.navi.FEATURES.enableMultipleExport = true;

    this.set('model', TestModel);
    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
              disabled=isDisabled
          }}
      `);

    run(async () => {
      await click('.schedule-action__button');
    });

    run(() => {
      clickTrigger('.schedule-modal__dropdown--format');
      assert.deepEqual(
        $('.ember-power-select-option')
          .map((i, el) =>
            $(el)
              .text()
              .trim()
          )
          .toArray(),
        ['csv', 'pdf'],
        'Schedule format should have correct options'
      );
    });

    config.navi.FEATURES.enableMultipleExport = false;

    await render(hbs`
          {{common-actions/schedule
              model=model
              onSave=(action onSaveAction)
              onRevert=(action onRevertAction)
              onDelete=(action onDeleteAction)
              disabled=isDisabled
          }}
      `);

    run(async () => {
      await click('.schedule-action__button');
    });

    run(() => {
      assert.ok(
        $('.schedule-modal__dropdown--format .ember-power-select-trigger').attr('aria-disabled'),
        'The formats dropdown is disabled by default'
      );
      assert.deepEqual(
        $('.schedule-modal__dropdown--format .ember-power-select-selected-item')
          .text()
          .trim(),
        'csv',
        'Schedule format should have correct default option'
      );

      config.navi.FEATURES.enableMultipleExport = originalFeatureFlag;
    });
  });
});

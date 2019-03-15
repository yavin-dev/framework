import { reject } from 'rsvp';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';

let Template;

const MockRequest = {
    serialize: () => 'abc'
  },
  MockUrl = 'navi.io/api';

module('Integration | Component | common actions/get api', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.MockRequest = MockRequest;

    Template = hbsWithModal(
      `
      {{#common-actions/get-api
        request=MockRequest
        buttonClassNames=buttonClassNames
        beforeAction=beforeAction
      }}
        Get API
      {{/common-actions/get-api}}
    `,
      this.owner
    );

    // Mock fact service
    this.owner.register(
      'service:bard-facts',
      Service.extend({
        getURL: () => MockUrl
      })
    );
  });

  test('Component renders', async function(assert) {
    assert.expect(1);

    await render(Template);

    assert.equal(find('.get-api').textContent.trim(), 'Get API', 'Component yields given text');
  });

  test('Custom button classes', async function(assert) {
    assert.expect(1);

    this.set('buttonClassNames', 'a-custom-class');
    await render(Template);

    assert.ok(this.$('button').is('.a-custom-class'), 'Class names for the button element can be configured');
  });

  test('beforeAction', async function(assert) {
    assert.expect(3);

    this.set('beforeAction', () => {
      assert.step('beforeAction is called');
    });
    await render(Template);

    run(async () => {
      await click('.get-api > button');
    });

    // Check if modal was opened
    if (this.$('.ember-modal-dialog').is(':visible')) {
      assert.step('Copy modal is opened');
    }

    assert.verifySteps(
      ['beforeAction is called', 'Copy modal is opened'],
      'beforeAction is called before modal is opened'
    );
  });

  test('beforeAction - prevent modal', async function(assert) {
    assert.expect(2);

    this.set('beforeAction', () => {
      assert.ok(true, 'Component can accept an extra action to run before opening the modal');

      return reject();
    });
    await render(Template);

    run(async () => {
      await click('.get-api > button');
    });

    assert.notOk(
      this.$('.ember-modal-dialog').is(':visible'),
      'Copy modal does not open if `beforeAction` returns a rejected promise'
    );
  });

  test('Modal', async function(assert) {
    assert.expect(5);

    await render(Template);

    assert.notOk(
      this.$('.ember-modal-dialog').is(':visible'),
      'Copy modal is not visible before clicking the component'
    );

    run(async () => {
      await click('.get-api > button');
    });

    assert.ok(this.$('.ember-modal-dialog').is(':visible'), 'Copy modal dialog pops up on clicking the component');

    assert.equal(
      find('.navi-modal__header--secondary').textContent.trim(),
      'Select the Copy button to copy to clipboard.',
      'Secondary header is visible with instructions'
    );

    assert.equal(find('.navi-modal__input').value, MockUrl, 'Modal input box has link to the current page');

    let buttons = this.$('.btn-container .btn');
    assert.deepEqual(
      buttons
        .map(function() {
          return this.textContent.trim();
        })
        .get(),
      ['Copy Link', 'Run API Query in New Tab', 'Cancel'],
      'Copy, New Tab, and Cancel buttons are rendered'
    );
  });

  test('Copy Link Notification', async function(assert) {
    assert.expect(2);

    await render(Template);

    run(async () => {
      await click('.get-api > button');
    });

    assert.notOk(
      this.$('.modal-notification').is(':visible'),
      'Copy notification is not visible before clicking copy button'
    );

    // Click Copy Link
    run(() => {
      this.$('.btn-container button:contains(Copy Link)').click();
    });

    assert.ok(
      this.$('.modal-notification').is(':visible'),
      'Copy notification message is shown after clicking copy button'
    );
  });

  test('Cancel button', async function(assert) {
    assert.expect(3);

    await render(Template);

    assert.notOk(
      this.$('.ember-modal-dialog').is(':visible'),
      'Copy modal is not visible before clicking the component'
    );

    // Click component
    run(async () => {
      await click('.get-api > button');
    });

    assert.ok(this.$('.ember-modal-dialog').is(':visible'), 'Copy modal dialog pops up on clicking the component');

    // Click Cancel
    run(() => {
      this.$('.btn-container button:contains(Cancel)').click();
    });

    assert.notOk(this.$('.ember-modal-dialog').is(':visible'), 'Copy modal is closed after clicking cancel button');
  });
});

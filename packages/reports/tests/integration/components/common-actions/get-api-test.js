import { reject } from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

let Template;

const MockRequest = {
    serialize: () => 'abc'
  },
  MockUrl = 'navi.io/api';

module('Integration | Component | common actions/get api', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.MockRequest = MockRequest;

    Template = hbs`
      <CommonActions::GetApi
        @request={{this.MockRequest}}
        @buttonClassNames={{this.buttonClassNames}}
        @beforeAction={{this.beforeAction}}
      >
        Get API
      </CommonActions::GetApi>
    `;

    // Mock fact service
    this.owner.register(
      'service:navi-facts',
      Service.extend({
        getURL: () => MockUrl
      })
    );
  });

  test('Component renders', async function(assert) {
    assert.expect(1);

    await render(Template);

    assert.dom('.get-api').hasText('Get API', 'Component yields given text');
  });

  test('Custom button classes', async function(assert) {
    assert.expect(1);

    this.set('buttonClassNames', 'a-custom-class');
    await render(Template);

    assert.ok($('button').is('.a-custom-class'), 'Class names for the button element can be configured');
  });

  test('beforeAction', async function(assert) {
    assert.expect(3);

    this.set('beforeAction', () => {
      assert.step('beforeAction is called');
    });
    await render(Template);

    await click('.get-api > button');

    // Check if modal was opened
    if ($('.ember-modal-dialog').is(':visible')) {
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

    await click('.get-api > button');

    assert
      .dom('.ember-modal-dialog')
      .isNotVisible('Copy modal does not open if `beforeAction` returns a rejected promise');
  });

  test('Modal', async function(assert) {
    assert.expect(5);

    await render(Template);

    assert.dom('.ember-modal-dialog').isNotVisible('Copy modal is not visible before clicking the component');

    await click('.get-api > button');

    assert.dom('.ember-modal-dialog').isVisible('Copy modal dialog pops up on clicking the component');

    assert
      .dom('.navi-modal__header--secondary')
      .hasText('Select the Copy button to copy to clipboard.', 'Secondary header is visible with instructions');

    assert.dom('.navi-modal__input').hasValue(MockUrl, 'Modal input box has link to the current page');

    let buttons = findAll('.btn-container .btn');
    assert.deepEqual(
      buttons.map(el => el.textContent.trim()),
      ['Copy Link', 'Run API Query in New Tab', 'Cancel'],
      'Copy, New Tab, and Cancel buttons are rendered'
    );
  });

  test('Copy Link Notification', async function(assert) {
    assert.expect(2);

    await render(Template);

    await click('.get-api > button');

    assert.dom('.modal-notification').isNotVisible('Copy notification is not visible before clicking copy button');

    // Click Copy Link
    await click($('.btn-container button:contains(Copy Link)')[0]);

    assert.dom('.modal-notification').isVisible('Copy notification message is shown after clicking copy button');
  });

  test('Cancel button', async function(assert) {
    assert.expect(3);

    await render(Template);

    assert.dom('.ember-modal-dialog').isNotVisible('Copy modal is not visible before clicking the component');

    // Click component
    await click('.get-api > button');

    assert.dom('.ember-modal-dialog').isVisible('Copy modal dialog pops up on clicking the component');

    // Click Cancel
    await click($('.btn-container button:contains(Cancel)')[0]);

    assert.dom('.ember-modal-dialog').isNotVisible('Copy modal is closed after clicking cancel button');
  });
});

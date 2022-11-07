import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { typeInInput } from '../../helpers/ember-tag-input';

const EMAILS = ['toonlink@naviapp.io', 'midna@naviapp.io'];

module('Integration | Component | navi email input', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.emails = EMAILS;
  });

  test('render emails', async function (assert) {
    assert.expect(1);

    await render(hbs`
    <NaviEmailInput
      @emails={{this.emails}}
    />
  `);

    assert.deepEqual(
      $('.navi-email-input .tag')
        .toArray()
        .map((e) => e.textContent.trim()),
      EMAILS,
      'An email tag is rendered for each given email'
    );
  });

  test('add email', async function (assert) {
    assert.expect(1);

    const newEmail = 'wolflinkamibo@naviapp.io';

    this.onUpdateEmails = (emails) => {
      assert.deepEqual(
        emails,
        [...EMAILS, newEmail],
        'onUpdateEmails action is called with newly typed email added to the end'
      );
    };

    await render(hbs`
      <NaviEmailInput
        @emails={{this.emails}}
        @onUpdateEmails={{this.onUpdateEmails}}
      />
    `);

    typeInInput('.js-ember-tag-input-new', newEmail);
    $('.js-ember-tag-input-new').blur();
  });

  test('remove email', async function (assert) {
    assert.expect(1);

    this.onUpdateEmails = (emails) => {
      assert.deepEqual(emails, EMAILS.slice(1), 'onUpdateEmails action is called with removed email excluded');
    };

    await render(hbs`
      <NaviEmailInput
        @emails={{this.emails}}
        @onUpdateEmails={{this.onUpdateEmails}}
      />
    `);

    await click('.navi-tag-input__tag-remove');
  });

  test('paste a list of emails', async function (assert) {
    assert.expect(4);

    async function paste(text) {
      const selector = '.js-ember-tag-input-new';
      await triggerEvent(selector, 'paste', {
        clipboardData: {
          getData: () => text,
        },
      });
    }

    const newEmails = ['wolflinkamibo@naviapp.io', 'zelda@naviapp.io'];

    this.onUpdateEmails = (emails) => {
      this.set('emails', emails);
      assert.step(emails.join(','));
    };

    await render(hbs`
      <NaviEmailInput
        @emails={{this.emails}}
        @onUpdateEmails={{this.onUpdateEmails}}
      />
    `);

    await paste(newEmails.join(','));
    assert.verifySteps(
      [[...EMAILS, newEmails[0]].join(','), [...EMAILS, ...newEmails].join(',')],
      'onUpdateEmails action is called for every email in the comma-separated string'
    );
    assert.deepEqual(
      $('.navi-email-input .tag')
        .toArray()
        .map((e) => e.textContent.trim()),
      [...EMAILS, ...newEmails],
      'all email tags are rendered correctly'
    );
  });
});

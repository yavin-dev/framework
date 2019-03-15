import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { typeInInput } from '../../helpers/ember-tag-input';

const EMAILS = ['toonlink@naviapp.io', 'midna@naviapp.io'];

module('Integration | Component | navi email input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.emails = EMAILS;
  });

  test('render emails', async function(assert) {
    assert.expect(1);

    await render(hbs`{{navi-email-input emails=emails}}`);

    assert.deepEqual(
      this.$('.navi-email-input .navi-email-tag')
        .toArray()
        .map(e => e.textContent.trim()),
      EMAILS,
      'An email tag is rendered for each given email'
    );
  });

  test('add email', async function(assert) {
    assert.expect(1);

    const newEmail = 'wolflinkamibo@naviapp.io';

    this.onUpdateEmails = emails => {
      assert.deepEqual(
        emails,
        [...EMAILS, newEmail],
        'onUpdateEmails action is called with newly typed email added to the end'
      );
    };

    await render(hbs`{{navi-email-input emails=emails onUpdateEmails=(action onUpdateEmails)}}`);

    typeInInput('.js-ember-tag-input-new', newEmail);
    this.$('.js-ember-tag-input-new').blur();
  });

  test('remove email', async function(assert) {
    assert.expect(1);

    this.onUpdateEmails = emails => {
      assert.deepEqual(emails, EMAILS.slice(1), 'onUpdateEmails action is called with removed email excluded');
    };

    await render(hbs`{{navi-email-input emails=emails onUpdateEmails=(action onUpdateEmails)}}`);

    await click(find('.emberTagInput-remove'));
  });
});

import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { typeInInput } from '../../helpers/ember-tag-input';

const EMAILS = ['toonlink@naviapp.io', 'midna@naviapp.io'];

moduleForComponent('navi-email-input', 'Integration | Component | navi email input', {
  integration: true,

  beforeEach() {
    this.emails = EMAILS;
  }
});

test('render emails', function(assert) {
  assert.expect(1);

  this.render(hbs`{{navi-email-input emails=emails}}`);

  assert.deepEqual(
    this.$('.navi-email-input .navi-email-tag')
      .toArray()
      .map(e => e.textContent.trim()),
    EMAILS,
    'An email tag is rendered for each given email'
  );
});

test('add email', function(assert) {
  assert.expect(1);

  const newEmail = 'wolflinkamibo@naviapp.io';

  this.onUpdateEmails = emails => {
    assert.deepEqual(
      emails,
      [...EMAILS, newEmail],
      'onUpdateEmails action is called with newly typed email added to the end'
    );
  };

  this.render(hbs`{{navi-email-input emails=emails onUpdateEmails=(action onUpdateEmails)}}`);

  typeInInput('.js-ember-tag-input-new', newEmail);
  this.$('.js-ember-tag-input-new').blur();
});

test('remove email', function(assert) {
  assert.expect(1);

  this.onUpdateEmails = emails => {
    assert.deepEqual(emails, EMAILS.slice(1), 'onUpdateEmails action is called with removed email excluded');
  };

  this.render(hbs`{{navi-email-input emails=emails onUpdateEmails=(action onUpdateEmails)}}`);

  this.$('.emberTagInput-remove:eq(0)').click();
});

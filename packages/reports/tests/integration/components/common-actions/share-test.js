import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';

let Template;

moduleForComponent('common-actions/share', 'Integration | Component | common actions/share', {
  integration: true,

  beforeEach() {
    Template = hbsWithModal(
      `
      {{#common-actions/share
        pageTitle=pageTitle
        buildUrl=buildUrl
        classNames='share'
        disabled=isDisabled
      }}
        Share Report
      {{/common-actions/share}}
    `,
      getOwner(this)
    );
  }
});

test('Component renders', function(assert) {
  assert.expect(1);

  this.render(Template);

  assert.equal(
    this.$('.share')
      .text()
      .trim(),
    'Share Report',
    'Component yields given text'
  );
});

test('Component is enabled / disabled', function(assert) {
  assert.expect(2);

  this.set('isDisabled', true);

  this.render(Template);

  assert.ok(this.$('button:contains("Share")').prop('disabled'), 'Share is disabled when the disabled is set to true');

  this.set('isDisabled', false);

  assert.notOk(
    this.$('button:contains("Share")').prop('disabled'),
    'Share is enabled when the disabled is set to false'
  );
});

test('Modal', function(assert) {
  assert.expect(6);

  let pageTitle = 'Snowpeak Ruins';
  this.set('pageTitle', pageTitle);

  this.render(Template);

  assert.notOk($('.ember-modal-dialog').is(':visible'), 'Share modal is not visible before clicking the component');

  run(() => {
    this.$('.share > button').click();
  });

  assert.ok($('.ember-modal-dialog').is(':visible'), 'Share modal dialog pops up on clicking the component');

  assert.equal(
    $('.primary-header')
      .text()
      .trim(),
    `Share "${pageTitle}"`,
    'Given page title appears in modal header'
  );

  assert.equal(
    $('.secondary-header')
      .text()
      .trim(),
    'Select the Copy button to copy to clipboard.',
    'Secondary header is visible with instructions'
  );

  assert.equal($('.modal-input-box').val(), document.location.href, 'Modal input box has link to the current page');

  let buttons = $('.btn-container .btn');
  assert.deepEqual(
    buttons
      .map(function() {
        return this.textContent.trim();
      })
      .get(),
    ['Copy Link', 'Cancel'],
    'Copy and Cancel buttons are rendered'
  );
});

test('Copy Link Notification', function(assert) {
  assert.expect(2);

  this.render(Template);

  run(() => {
    this.$('.share > button').click();
  });

  assert.notOk($('.modal-notification').is(':visible'), 'Copy notification is not visible before clicking copy button');

  // Click Copy Link
  run(() => {
    $('.btn-container button:contains(Copy Link)').click();
  });

  assert.ok($('.modal-notification').is(':visible'), 'Copy notification message is shown after clicking copy button');
});

test('Cancel button', function(assert) {
  assert.expect(3);

  this.render(Template);

  assert.notOk($('.ember-modal-dialog').is(':visible'), 'Share modal is not visible before clicking the component');

  // Click component
  run(() => {
    this.$('.share > button').click();
  });

  assert.ok($('.ember-modal-dialog').is(':visible'), 'Share modal dialog pops up on clicking the component');

  // Click Cancel
  run(() => {
    $('.btn-container button:contains(Cancel)').click();
  });

  assert.notOk($('.ember-modal-dialog').is(':visible'), 'Share modal is closed after clicking cancel button');
});

test('buildUrl option', function(assert) {
  assert.expect(1);

  this.set('buildUrl', () => 'www.navi.com/customUrlToShare');

  this.render(Template);

  // Click component
  run(() => {
    this.$('.share > button').click();
  });

  assert.equal($('.modal-input-box').val(), 'www.navi.com/customUrlToShare', 'buildUrl option allows custom url logic');
});

import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';
import wait from 'ember-test-helpers/wait';

let Template;

moduleForComponent('common-actions/delete', 'Integration | Component | common actions/delete', {
  integration: true,
  beforeEach() {
    Template = hbsWithModal(
      `
      {{#common-actions/delete
        model=widget
        warnMsg='Are you sure you want to delete the widget?'
        deleteAction=(action deleteWidget)
        classNames='delete'
      }}
        Delete
      {{/common-actions/delete}}
    `,
      getOwner(this)
    );

    set(this, 'widget', {
      id: 10,
      title: 'The Wind Waker',
      constructor: { modelName: 'testWidget' }
    });

    set(this, 'deleteWidget', () => {});
  }
});

test('confirm modal', function(assert) {
  assert.expect(5);

  this.render(Template);

  assert.notOk(!!$('.ember-modal-dialog').length, 'Modal is not visible at the start');

  run(() => {
    this.$('.delete > button').click();
  });

  assert.ok(!!$('.ember-modal-dialog').length, 'Modal is visible after clicking the delete action');

  assert.equal(
    $('.primary-header')
      .text()
      .trim(),
    'Delete "The Wind Waker"',
    'Widget title is included in modal header'
  );

  assert.equal(
    $('.secondary-header')
      .text()
      .trim(),
    'Are you sure you want to delete the widget?',
    'Warning message is included in the widget modal'
  );

  run(() => {
    $('button:contains(Cancel)').click();
  });

  assert.notOk(!!$('.ember-modal-dialog').length, 'Modal is closed after clicking cancel button');
});

test('delete action', function(assert) {
  assert.expect(1);

  this.set('deleteWidget', widget => {
    assert.equal(widget, get(this, 'widget'), 'the selected widget is passed to the action');
  });

  this.render(Template);

  run(() => {
    this.$('.delete > button').click();
  });

  return wait().then(() => {
    $('button:contains(Confirm)').click();
  });
});

test('default warning message', function(assert) {
  assert.expect(1);

  this.render(
    hbsWithModal(
      `
    {{#common-actions/delete
        model=widget
        deleteAction=(action deleteWidget)
        classNames='delete'
    }}
        Delete
    {{/common-actions/delete}}
   `,
      getOwner(this)
    )
  );

  run(() => {
    this.$('.delete > button').click();
  });

  assert.equal(
    $('.secondary-header')
      .text()
      .trim(),
    'Are you sure you want to delete this test-widget?',
    'Default warning message is included in widget modal'
  );
});

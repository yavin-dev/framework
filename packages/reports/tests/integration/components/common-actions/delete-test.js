import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click } from '@ember/test-helpers';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';

let Template;

module('Integration | Component | common actions/delete', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
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
      this.owner
    );

    set(this, 'widget', {
      id: 10,
      title: 'The Wind Waker',
      constructor: { modelName: 'testWidget' }
    });

    set(this, 'deleteWidget', () => {});
  });

  test('confirm modal', async function(assert) {
    assert.expect(5);

    await render(Template);

    assert.notOk(!!$('.ember-modal-dialog').length, 'Modal is not visible at the start');

    run(async () => {
      await click('.delete > button');
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

  test('delete action', async function(assert) {
    assert.expect(1);

    this.set('deleteWidget', widget => {
      assert.equal(widget, get(this, 'widget'), 'the selected widget is passed to the action');
    });

    await render(Template);

    run(async () => {
      await click('.delete > button');
    });

    return settled().then(() => {
      $('button:contains(Confirm)').click();
    });
  });

  test('default warning message', async function(assert) {
    assert.expect(1);

    await render(
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
        this.owner
      )
    );

    run(async () => {
      await click('.delete > button');
    });

    assert.equal(
      $('.secondary-header')
        .text()
        .trim(),
      'Are you sure you want to delete this test-widget?',
      'Default warning message is included in widget modal'
    );
  });
});

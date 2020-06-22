import $ from 'jquery';
import { set, get } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let Template;

module('Integration | Component | common actions/delete', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    Template = hbs`
      <CommonActions::Delete
        class="delete"
        @model={{this.widget}}
        @warnMsg="Are you sure you want to delete the widget?"
        @deleteAction={{this.deleteWidget}}
      >
        Delete
      </CommonActions::Delete>
    `;

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

    assert.dom('.ember-modal-dialog').isNotVisible('Modal is not visible at the start');

    await click('.delete > button');

    assert.dom('.ember-modal-dialog').isVisible('Modal is visible after clicking the delete action');

    assert.dom('.primary-header').includesText('Delete "The Wind Waker"', 'Widget title is included in modal header');

    assert
      .dom('.secondary-header')
      .includesText('Are you sure you want to delete the widget?', 'Warning message is included in the widget modal');

    await click($('button:contains(Cancel)')[0]);

    assert.dom('.ember-modal-dialog').isNotVisible('Modal is closed after clicking cancel button');
  });

  test('delete action', async function(assert) {
    assert.expect(1);

    this.set('deleteWidget', widget => {
      assert.equal(widget, get(this, 'widget'), 'the selected widget is passed to the action');
    });

    await render(Template);
    await click('.delete > button');

    await click($('button:contains(Confirm)')[0]);
  });

  test('default warning message', async function(assert) {
    assert.expect(1);

    await render(hbs`
      <CommonActions::Delete
        class="delete"
        @model={{this.widget}}
        @deleteAction={{this.deleteWidget}}
      >
          Delete
      </CommonActions::Delete>
    `);

    await click('.delete > button');

    assert
      .dom('.secondary-header')
      .includesText(
        'Are you sure you want to delete this test-widget?',
        'Default warning message is included in widget modal'
      );
  });
});

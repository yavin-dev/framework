import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let Template;

module('Integration | Component | common actions/delete', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    Template = hbs`
      <CommonActions::Delete
        class="delete"
        @model={{this.widget}}
        @deleteAction={{this.deleteWidget}}
      >
        Delete
      </CommonActions::Delete>
    `;

    set(this, 'widget', {
      id: 10,
      title: 'The Wind Waker',
      constructor: { modelName: 'test-widget' },
    });

    set(this, 'deleteWidget', () => {});
  });

  test('confirm modal', async function (assert) {
    await render(Template);

    assert.dom('.delete__modal').doesNotExist('Modal is not visible at the start');

    await click('.delete__action-btn');

    assert.dom('.delete__modal').exists('Modal is visible after clicking the delete action');

    assert
      .dom('.delete__modal-details')
      .hasText(
        'This action cannot be undone. This will permanently delete the The Wind Waker test widget.',
        'The Widget title is included in modal header'
      );

    await click('.delete__cancel-btn');

    assert.dom('.delete__modal').doesNotExist('Modal is closed after clicking cancel button');
  });

  test('delete action', async function (assert) {
    assert.expect(1);

    this.set('deleteWidget', (widget) => {
      assert.equal(widget, this.widget, 'the selected widget is passed to the action');
    });

    await render(Template);
    await click('.delete__action-btn');
    await click('.delete__delete-btn');
  });
});

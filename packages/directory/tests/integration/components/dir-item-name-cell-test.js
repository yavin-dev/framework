import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { set } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dir-item-name-cell', function(hooks) {
  setupRenderingTest(hooks);

  test('dir-item-name-cell', async function(assert) {
    assert.expect(5);

    let report = {
        title: 'Report 1',
        id: 1,
        isFavorite: true,
        constructor: {
          modelName: 'report'
        }
      },
      dashboard = {
        title: 'Dashboard 1',
        id: 2,
        isFavorite: false,
        constructor: {
          modelName: 'dashboard'
        }
      };
    set(this, 'item', report);
    await render(hbs`<DirItemNameCell @value={{this.item}} />`);

    assert.ok(this.element.querySelector('.fa-file-text'), 'The correct icon is used for a report');

    assert.dom(this.element).hasText('Report 1', "The item's title is displayed in the component");

    assert.ok(this.element.querySelector('.fa-star'), 'The favorite icon is shown for a favorited item');

    set(this, 'item', dashboard);
    await render(hbs`<DirItemNameCell @value={{this.item}} />`);

    assert.ok(this.element.querySelector('.fa-th-large'), 'The correct icon is used for a dashboard');

    assert.notOk(
      this.element.querySelector('.fa-star'),
      'The favorite icon is not shown for a item that is not a favorite'
    );
  });

  test('unsaved report label', async function(assert) {
    assert.expect(2);

    let report = {
      title: 'Untitled Report',
      id: null,
      tempId: 'd8828a30-c2ab-11e8-9028-e546f1b5f84f',
      isFavorite: false,
      constructor: {
        modelName: 'report'
      }
    };

    set(this, 'item', report);
    await render(hbs`<DirItemNameCell @value={{this.item}} />`);

    assert.ok(
      this.element.querySelector('.dir-item-name-cell__unsaved-label'),
      'The unsaved label is shown for an unsaved item'
    );

    set(report, 'id', 2);
    set(report, 'tempId', undefined);

    await render(hbs`<DirItemNameCell @value={{this.item}} />`);

    assert.notOk(
      this.element.querySelector('.dir-item-name-cell__unsaved-label'),
      'The unsaved label is not shown for a saved item'
    );
  });
});

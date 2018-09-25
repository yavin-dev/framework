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
        serialize() {
          return {
            data: {
              type: 'reports'
            }
          };
        }
      },
      dashboard = {
        title: 'Dashboard 1',
        id: 2,
        isFavorite: false,
        serialize() {
          return {
            data: {
              type: 'dashboards'
            }
          };
        }
      };
    set(this, 'item', report);
    await render(hbs`{{dir-item-name-cell value=item}}`);

    assert.ok(this.element.querySelector('.dir-icon__reports'), 'The correct icon is used for a report');

    assert.equal(this.element.textContent.trim(), 'Report 1', "The item's title is displayed in the component");

    assert.ok(this.element.querySelector('.dir-icon__favorites'), 'The favorite icon is shown for a favorited item');

    set(this, 'item', dashboard);
    await render(hbs`{{dir-item-name-cell value=item}}`);

    assert.ok(this.element.querySelector('.dir-icon__dashboards'), 'The correct icon is used for a dashboard');

    assert.notOk(
      this.element.querySelector('.dir-icon__favorites'),
      'The favorite icon is not shown for a item that is not a favorite'
    );
  });
});

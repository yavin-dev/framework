import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { set } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | dir-asset-row-actions', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(function () {
    // eslint-disable-next-line ember/no-private-routing-service -- TODO fix private router service
    const router = this.owner.lookup('router:main');
    router.startRouting(true);
  });

  test('renders correct component', async function (assert) {
    assert.expect(2);

    let row = {
        rowId: '123',
      },
      report = {
        title: 'Report 1',
        id: 1,
        isFavorite: true,
        constructor: {
          modelName: 'report',
        },
      },
      dashboard = {
        title: 'Dashboard 1',
        id: 2,
        isFavorite: false,
        constructor: {
          modelName: 'dashboard',
        },
      };
    set(this, 'item', report);
    set(this, 'row', row);

    await render(hbs`
      <div class="row" data-row-id="123">
        <DirAssetRowActions @row={{this.row}} @value={{this.item}} />
      </div>
    `);
    await triggerEvent('.row', 'mouseenter');

    assert.dom('.navi-report-actions').exists('The correct component is rendered for a report');

    set(this, 'item', dashboard);

    await render(hbs`
      <div class="row" data-row-id="123">
        <DirAssetRowActions @row={{this.row}} @value={{this.item}} />
      </div>
    `);
    await triggerEvent('.row', 'mouseenter');

    assert.dom('.dashboard-actions').exists('The correct component is rendered for a dashboard');
  });
});

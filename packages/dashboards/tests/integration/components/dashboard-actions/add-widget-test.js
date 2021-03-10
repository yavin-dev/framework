import { A as arr } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

const DASHBOARD_ID = 12;

module('Integration | Component | dashboard actions/add widget', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.set(
      'reports',
      arr([
        { id: 1, title: 'Report 1' },
        { id: 2, title: 'Report 2' },
      ])
    );
    this.set('dashboard', { id: DASHBOARD_ID });
    this.set('onAdd', () => null);

    await render(hbs`
      <DashboardActions::AddWidget
        @reports={{this.reports}}
        @dashboard={{this.dashboard}}
        @addWidgetToDashboard={{this.onAdd}}
        as |toggleModal|
      > 
        <button 
          type="button"
          class="add-widget__action-btn" 
          {{on "click" toggleModal}}
        >
          Add Widget
        </button>
      </DashboardActions::AddWidget>
    `);
  });

  test('it renders', async function (assert) {
    assert.dom('.add-widget__action-btn').hasText('Add Widget', 'Template component is yielded');
    assert.dom('.add-widget__modal').doesNotExist('The add widget modal is not visible in the beginning');
  });

  test('report selector', async function (assert) {
    assert.expect(4);

    await click('.add-widget__action-btn');

    assert
      .dom('.add-widget__report-select-trigger')
      .hasText('Create new...', 'Create new option is selected by default in the dropdown');

    await click('.add-widget__report-select-trigger');

    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent.trim()),
      ['Create new...', 'Report 1', 'Report 2'],
      'The user`s report titles are shown in the dropdown along with create new'
    );

    assert.deepEqual(
      findAll('.ember-power-select-group .ember-power-select-option').map((el) => el.textContent.trim()),
      ['Report 1', 'Report 2'],
      'The user`s report titles are shown under a group in the dropdown'
    );

    assert
      .dom('.ember-power-select-group-name')
      .hasText('My Reports', 'The user`s report titles are shown under a group name `My Reports` in the dropdown');

    // Clean up
    await click('.add-widget__cancel-btn');
  });
});

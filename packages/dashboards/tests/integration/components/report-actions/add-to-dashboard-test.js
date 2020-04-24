import { A as arr } from '@ember/array';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, findAll, render, click } from '@ember/test-helpers';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import $ from 'jquery';

let Template;

module('Integration | Component | report actions/add to dashboard', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Template = hbs`
      {{#report-actions/add-to-dashboard
        report=report
        dashboards=dashboards
        classNames='report-control add-to-dashboard'
        onAddToDashboard=(action addToDashboard)
        onAddToNewDashboard=(action addToNewDashboard)
      }}
        Add to Dashboard
      {{/report-actions/add-to-dashboard}}
    `;

    set(this, 'report', {
      id: 1,
      title: 'Buzz Blob',
      author: 'navi_user'
    });

    set(
      this,
      'dashboards',
      arr([
        {
          id: 1,
          title: 'Tumblr Goals Dashboard'
        },
        {
          id: 2,
          title: 'Dashboard 2'
        }
      ])
    );

    set(this, 'addToDashboard', () => undefined);
    set(this, 'addToNewDashboard', () => undefined);
  });

  test('component renders', async function(assert) {
    await render(Template);
    assert.dom('.add-to-dashboard').hasText('Add to Dashboard', 'Template content is yielded');
  });

  test('component`s Modal', async function(assert) {
    assert.expect(3);

    await render(Template);

    assert
      .dom('.ember-modal-dialog')
      .isNotVisible('add to dashboard report action modal is not visible before clicking the component');

    await click('.report-control');

    assert
      .dom('.ember-modal-dialog')
      .isVisible('add to dashboard report modal dialog pops up on clicking the component');

    assert
      .dom('.add-to-dashboard-modal .text-input')
      .hasValue('Buzz Blob', 'the report title is displayed as the default name for widget title');
  });

  test('create vs select', async function(assert) {
    assert.expect(6);

    await render(Template);
    await click('.report-control');

    assert.dom('.add-to-dashboard-modal .dashboard-select').isVisible('Dashboard selector is shown by default');

    assert
      .dom('.add-to-dashboard-modal .text-input.dashboard-title')
      .isNotVisible('Dashboard title input is not shown by default');

    assert
      .dom('.add-to-dashboard-modal button.dashboard-action-text')
      .hasText('Create new dashboard', 'Create new dashboard link is also shown by default');

    await click('.add-to-dashboard-modal button.dashboard-action-text');

    assert
      .dom('.add-to-dashboard-modal .text-input.dashboard-title')
      .isVisible('Dashboard title input is shown when create dashboard link is clicked');

    assert
      .dom('.add-to-dashboard-modal .ember-power-select')
      .isNotVisible('Dashboard selector is hidden after link click');

    assert
      .dom('.add-to-dashboard-modal button.dashboard-action-text')
      .hasText('Select from my dashboards', 'Select from my dashboards link is also shown after link click');
  });

  test('dropdown options', async function(assert) {
    assert.expect(2);

    await render(Template);
    await click('.report-control');
    await clickTrigger('.add-to-dashboard-modal');

    assert
      .dom('.add-to-dashboard-modal .ember-power-select-group .ember-power-select-group-name')
      .hasText('My Dashboards', 'The user`s dashboards are grouped under `My Dashboards`');

    assert.deepEqual(
      findAll('.add-to-dashboard-modal .ember-power-select-option').map(el => el.textContent.trim()),
      ['Tumblr Goals Dashboard', 'Dashboard 2'],
      'The user`s dashboard titles are shown in the dropdown'
    );

    // Clean up
    await click('.primary-header');
    await click($('button:contains(Cancel)')[0]);
  });

  test('addToDashboard action', async function(assert) {
    assert.expect(4);

    this.set('addToDashboard', (dashboardId, widgetTitle) => {
      assert.equal(dashboardId, '1', 'the selected dashboard id is passed to the action');

      assert.equal(widgetTitle, 'Buzz Blob', 'The value in the input field is passed as widget title to the action');
    });

    await render(Template);
    await click('.report-control');

    assert
      .dom('.add-to-dashboard-modal .btn.add-to-dashboard')
      .isDisabled('`Add To Dashboard` Button is disabled by default');

    await selectChoose('.add-to-dashboard-modal', 'Tumblr');

    assert
      .dom('.add-to-dashboard-modal .btn.add-to-dashboard')
      .isNotDisabled('`Add To Dashboard` Button is not disabled once a dashboard is selected');

    await click('.add-to-dashboard-modal .btn.add-to-dashboard');
  });

  test('addToNewDashboard action', async function(assert) {
    assert.expect(2);

    this.set('addToNewDashboard', (dashboardTitle, widgetTitle) => {
      assert.equal(dashboardTitle, 'Tri Force Heroes', 'the entered dashboard title is passed to the action');

      assert.equal(widgetTitle, 'Buzz Blob', 'The value in the input field is passed as widget title to the action');
    });

    await render(Template);
    await click('.report-control');

    await click('.add-to-dashboard-modal button.dashboard-action-text');
    await fillIn('input.dashboard-title', 'Tri Force Heroes');
    await click('.add-to-dashboard-modal .btn.add-to-dashboard');
  });

  test('one way widget title', async function(assert) {
    assert.expect(2);

    this.set('addToDashboard', (dashboardId, widgetTitle) => {
      assert.equal(
        widgetTitle,
        'ChuChu',
        'The value in the input field is passed as widget title without changing the report title'
      );
    });

    await render(Template);
    await click('.report-control');
    await fillIn('input.widget-title', 'ChuChu');

    await selectChoose('.add-to-dashboard-modal', 'Tumblr');

    assert.equal(this.get('report.title'), 'Buzz Blob', 'Report Title remains unchanged as `Buzz Blob`');

    await click('.add-to-dashboard-modal .btn.add-to-dashboard');
  });
});

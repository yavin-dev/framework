import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find } from '@ember/test-helpers';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { clickTrigger as toggleSelector, nativeMouseUp as toggleOption } from 'ember-power-select/test-support/helpers';

let Template;

module('Integration | Component | report actions/add to dashboard', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();

    Template = hbsWithModal(
      `
      {{#report-actions/add-to-dashboard
        report=report
        dashboards=dashboards
        classNames='report-control add-to-dashboard'
        onAddToDashboard=(action addToDashboard)
        onAddToNewDashboard=(action addToNewDashboard)
      }}
        Add to Dashboard
      {{/report-actions/add-to-dashboard}}
    `,
      this.owner
    );

    set(this, 'report', {
      id: 1,
      title: 'Buzz Blob',
      author: 'navi_user'
    });

    set(
      this,
      'dashboards',
      A([
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

    set(this, 'addToDashboard', () => {});
    set(this, 'addToNewDashboard', () => {});
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('component renders', async function(assert) {
    await render(Template);

    assert.dom('*').hasText('Add to Dashboard', 'Template content is yielded');
  });

  test('component`s Modal', async function(assert) {
    assert.expect(3);

    await render(Template);

    assert.notOk(
      !!$('.ember-modal-dialog').length,
      'add to dashboard report action modal is not visible before clicking the component'
    );

    await click('.report-control');

    return settled().then(() => {
      assert.ok(
        !!$('.ember-modal-dialog').length,
        'add to dashboard report modal dialog pops up on clicking the component'
      );

      assert.equal(
        $('.add-to-dashboard-modal .text-input').val(),
        'Buzz Blob',
        'the report title is displayed as the default name for widget title'
      );
    });
  });

  test('create vs select', async function(assert) {
    assert.expect(6);

    await render(Template);
    await click('.report-control');

    return settled().then(() => {
      assert.ok(
        $('.add-to-dashboard-modal .dashboard-select').is(':visible'),
        'Dashboard selector is shown by default'
      );

      assert.notOk(
        $('.add-to-dashboard-modal .text-input.dashboard-title').is(':visible'),
        'Dashboard title input is not shown by default'
      );

      assert.equal(
        $('.add-to-dashboard-modal a.dashboard-action-text')
          .text()
          .trim(),
        'Create new dashboard',
        'Create new dashboard link is also shown by default'
      );

      $('.add-to-dashboard-modal a.dashboard-action-text').click();

      return settled().then(() => {
        assert.ok(
          $('.add-to-dashboard-modal .text-input.dashboard-title').is(':visible'),
          'Dashboard title input is shown when create dashboard link is clicked'
        );

        assert.notOk(
          $('.add-to-dashboard-modal .ember-power-select').is(':visible'),
          'Dashboard selector is hidden after link click'
        );

        assert.equal(
          $('.add-to-dashboard-modal a.dashboard-action-text')
            .text()
            .trim(),
          'Select from my dashboards',
          'Select from my dashboards link is also shown after link click'
        );
      });
    });
  });

  test('dropdown options', async function(assert) {
    assert.expect(2);

    await render(Template);
    await click('.report-control');
    toggleSelector('.add-to-dashboard-modal');

    return settled().then(() => {
      assert.equal(
        $('.add-to-dashboard-modal .ember-power-select-group .ember-power-select-group-name')
          .text()
          .trim(),
        'My Dashboards',
        'The user`s dashboards are grouped under `My Dashboards`'
      );

      assert.deepEqual(
        $('.add-to-dashboard-modal .ember-power-select-option')
          .toArray()
          .map(el =>
            $(el)
              .text()
              .trim()
          ),
        ['Tumblr Goals Dashboard', 'Dashboard 2'],
        'The user`s dashboard titles are shown in the dropdown'
      );
    });
  });

  test('addToDashboard action', async function(assert) {
    assert.expect(4);

    this.set('addToDashboard', (dashboardId, widgetTitle) => {
      assert.equal(dashboardId, '1', 'the selected dashboard id is passed to the action');

      assert.equal(widgetTitle, 'Buzz Blob', 'The value in the input field is passed as widget title to the action');
    });

    await render(Template);
    await click('.report-control');

    return settled().then(() => {
      assert.ok(
        $('.add-to-dashboard-modal .btn.add-to-dashboard').is(':disabled'),
        '`Add To Dashboard` Button is disabled by default'
      );

      toggleSelector('.add-to-dashboard-modal');
      toggleOption($('.add-to-dashboard-modal .ember-power-select-option:contains(Tumblr)')[0]);

      assert.notOk(
        $('.add-to-dashboard-modal .btn.add-to-dashboard').is(':disabled'),
        '`Add To Dashboard` Button is not disabled once a dashboard is selected'
      );

      $('.add-to-dashboard-modal .btn.add-to-dashboard').click();
    });
  });

  test('addToNewDashboard action', async function(assert) {
    assert.expect(2);

    this.set('addToNewDashboard', (dashboardTitle, widgetTitle) => {
      assert.equal(dashboardTitle, 'Tri Force Heroes', 'the entered dashboard title is passed to the action');

      assert.equal(widgetTitle, 'Buzz Blob', 'The value in the input field is passed as widget title to the action');
    });

    await render(Template);
    await click('.report-control');

    return settled().then(() => {
      $('.add-to-dashboard-modal a.dashboard-action-text').click();
      return settled().then(() => {
        $('input.dashboard-title')
          .val('Tri Force Heroes')
          .change();
        return settled().then(() => {
          $('.add-to-dashboard-modal .btn.add-to-dashboard').click();
        });
      });
    });
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

    return settled().then(() => {
      $('input.widget-title')
        .val('ChuChu')
        .change();
      return settled().then(() => {
        assert.equal(this.get('report.title'), 'Buzz Blob', 'Report Title remains unchanged as `Buzz Blob`');
        $('.add-to-dashboard-modal .btn.add-to-dashboard').click();
      });
    });
  });
});

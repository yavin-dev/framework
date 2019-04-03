import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find } from '@ember/test-helpers';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { clickTrigger as toggleSelector } from 'ember-power-select/test-support/helpers';

const DASHBOARD_ID = 12;

let Template;

module('Integration | Component | dashboard actions/add widget', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Template = hbsWithModal(
      `
      {{#dashboard-actions/add-widget
        classNames='dashboard-control add-widget'
        reports=reports
        dashboard=dashboard
      }}
        Add Widget
      {{/dashboard-actions/add-widget}}
    `,
      this.owner
    );

    this.set(
      'reports',
      A([
        {
          id: 1,
          title: 'Report 1'
        },
        {
          id: 2,
          title: 'Report 2'
        }
      ])
    );

    this.set('dashboard', { id: DASHBOARD_ID });
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', async function(assert) {
    assert.expect(2);

    await render(Template);

    return settled().then(() => {
      assert.dom('*').hasText('Add Widget', 'Template component is yielded');

      assert.notOk($('.ember-modal-dialog').is(':visible'), 'The add widget modal is not visible in the beginning');
    });
  });

  test('report selector', async function(assert) {
    assert.expect(4);

    await render(Template);
    await click('.dashboard-control');

    assert.equal(
      $('.add-widget-modal .ember-power-select-selected-item')
        .text()
        .trim(),
      'Create new...',
      'Create new option is selected by default in the dropdown'
    );

    toggleSelector('.add-widget-modal');

    return settled().then(() => {
      assert.deepEqual(
        $('.add-widget-modal .ember-power-select-option')
          .toArray()
          .map(el =>
            $(el)
              .text()
              .trim()
          ),
        ['Create new...', 'Report 1', 'Report 2'],
        'The user`s report titles are shown in the dropdown along with create new'
      );

      assert.deepEqual(
        $('.add-widget-modal .ember-power-select-group .ember-power-select-option')
          .toArray()
          .map(el =>
            $(el)
              .text()
              .trim()
          ),
        ['Report 1', 'Report 2'],
        'The user`s report titles are shown under a group in the dropdown'
      );

      assert.deepEqual(
        $('.add-widget-modal .ember-power-select-group .ember-power-select-group-name')
          .text()
          .trim(),
        'My Reports',
        'The user`s report titles are shown under a group name `My Reports` in the dropdown'
      );
    });
  });
});

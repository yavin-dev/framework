import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';
import wait from 'ember-test-helpers/wait';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { clickTrigger as toggleSelector } from '../../../helpers/ember-power-select';

const DASHBOARD_ID = 12;

let Template;

moduleForComponent(
  'dashboard-actions/add-widget',
  'Integration | Component | dashboard actions/add widget',
  {
    integration: true,
    beforeEach() {
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
        Ember.getOwner(this)
      );

      this.set(
        'reports',
        Ember.A([
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
    },
    afterEach() {
      teardownMock();
    }
  }
);

test('it renders', function(assert) {
  assert.expect(2);

  this.render(Template);

  return wait().then(() => {
    assert.equal(
      this.$()
        .text()
        .trim(),
      'Add Widget',
      'Template component is yielded'
    );

    assert.notOk(
      $('.ember-modal-dialog').is(':visible'),
      'The add widget modal is not visible in the beginning'
    );
  });
});

test('report selector', function(assert) {
  assert.expect(4);

  this.render(Template);
  this.$('.dashboard-control').click();

  assert.equal(
    $('.add-widget-modal .ember-power-select-selected-item')
      .text()
      .trim(),
    'Create new...',
    'Create new option is selected by default in the dropdown'
  );

  toggleSelector('.add-widget-modal');

  return wait().then(() => {
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
      $(
        '.add-widget-modal .ember-power-select-group .ember-power-select-option'
      )
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
      $(
        '.add-widget-modal .ember-power-select-group .ember-power-select-group-name'
      )
        .text()
        .trim(),
      'My Reports',
      'The user`s report titles are shown under a group name `My Reports` in the dropdown'
    );
  });
});

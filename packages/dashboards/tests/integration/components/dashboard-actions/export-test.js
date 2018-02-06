import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('dashboard-actions/export', 'Integration | Component | dashboard actions/export', {
  integration: true
});

test('export href', function(assert) {
  assert.expect(1);

  this.dashboard = { id: 123 };

  this.render(`
    {{dashboard-actions/export
      dashboard=dashboard
    }}
  `);

  assert.equal(this.$('a').attr('href'),
    '/export?dashboardId=123',
    'Export actions links to export service and gives the dashboard id');
});

test('disabled', function(assert) {
  assert.expect(1);

  this.render(`
    {{dashboard-actions/export
      disabled=true
    }}
  `);

  assert.equal(this.$('a').attr('href'),
    'unsafe:javascript:void(0);',
    'When disabled, the export action href has no effect');
});

test('notifications', function(assert) {
  assert.expect(1);

  this.mockNotifications = {
    add({ message }) {
      assert.equal(message,
        'The download should begin soon.',
        'A notification is added when export is clicked.');
    }
  };

  this.render(`
    {{dashboard-actions/export
      disabled=true
      naviNotifications=mockNotifications
    }}
  `);

  this.$('a').click();
});

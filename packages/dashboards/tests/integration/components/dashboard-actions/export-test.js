import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('dashboard-actions/export', 'Integration | Component | dashboard actions/export', {
  integration: true
});

test('export href', function(assert) {
  assert.expect(1);

  this.dashboard = { id: 123, title: 'Akkala Tech Lab Weekly Reports' };

  this.render(`
    {{dashboard-actions/export
      dashboard=dashboard
    }}
  `);

  assert.equal(
    this.$('a').attr('href'),
    '/export?dashboard=123',
    'Export actions links to export service and gives the dashboard id'
  );
});

test('export filename', function(assert) {
  assert.expect(1);

  this.dashboard = { id: 123, title: 'Akkala Tech Lab Weekly Reports' };

  this.render(`
    {{dashboard-actions/export
      dashboard=dashboard
    }}
  `);

  assert.equal(
    this.$('a').attr('download'),
    'akkala-tech-lab-weekly-reports-dashboard',
    'Download attribute is set to the dasherized dashboard name, appended with -dashboard'
  );
});

test('disabled', function(assert) {
  assert.expect(1);

  this.dashboard = { id: 123, title: 'Akkala Tech Lab Weekly Reports' };

  this.render(`
    {{dashboard-actions/export
      dashboard=dashboard
      disabled=true
    }}
  `);

  assert.equal(
    this.$('a').attr('href'),
    'unsafe:javascript:void(0);',
    'When disabled, the export action href has no effect'
  );
});

test('notifications', function(assert) {
  assert.expect(1);

  this.dashboard = { id: 123, title: 'Akkala Tech Lab Weekly Reports' };

  this.mockNotifications = {
    add({ message }) {
      assert.equal(message, 'The download should begin soon.', 'A notification is added when export is clicked.');
    }
  };

  this.render(`
    {{dashboard-actions/export
      dashboard=dashboard
      naviNotifications=mockNotifications
    }}
  `);

  this.$('a').click();
});

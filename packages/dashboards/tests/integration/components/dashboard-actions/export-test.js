import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dashboard actions/export', function(hooks) {
  setupRenderingTest(hooks);

  test('export href', async function(assert) {
    assert.expect(1);

    this.dashboard = { id: 123, title: 'Akkala Tech Lab Weekly Reports' };

    await render(hbs`
      {{dashboard-actions/export
        dashboard=dashboard
      }}
    `);

    assert
      .dom('a')
      .hasAttribute(
        'href',
        '/export?dashboard=123',
        'Export actions links to export service and gives the dashboard id'
      );
  });

  test('export filename', async function(assert) {
    assert.expect(1);

    this.dashboard = { id: 123, title: 'Akkala Tech Lab Weekly Reports' };

    await render(hbs`
      {{dashboard-actions/export
        dashboard=dashboard
      }}
    `);

    assert
      .dom('a')
      .hasAttribute(
        'download',
        'akkala-tech-lab-weekly-reports-dashboard',
        'Download attribute is set to the dasherized dashboard name, appended with -dashboard'
      );
  });

  test('disabled', async function(assert) {
    assert.expect(1);

    this.dashboard = { id: 123, title: 'Akkala Tech Lab Weekly Reports' };

    await render(hbs`
      {{dashboard-actions/export
        dashboard=dashboard
        disabled=true
      }}
    `);

    assert
      .dom('a')
      .hasAttribute('href', 'unsafe:javascript:void(0);', 'When disabled, the export action href has no effect');
  });

  test('notifications', async function(assert) {
    assert.expect(1);

    this.dashboard = { id: 123, title: 'Akkala Tech Lab Weekly Reports' };

    this.mockNotifications = {
      add({ message }) {
        assert.equal(message, 'The download should begin soon.', 'A notification is added when export is clicked.');
      }
    };

    await render(hbs`
      {{dashboard-actions/export
        dashboard=dashboard
        naviNotifications=mockNotifications
      }}
    `);

    await click('a');
  });
});

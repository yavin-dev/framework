import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import Service from '@ember/service';

const TEMPLATE = hbs`
  <DashboardActions::Export
    @model={{this.dashboard}}
    @disabled={{this.disabled}}
  >
    Export
  </DashboardActions::Export>
`;

module('Integration | Component | dashboard actions/export', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.set('dashboard', {
      id: 123,
      title: 'Akkala Tech Lab Weekly Reports',
      validations: { isTruelyValid: true },
    });
    this.set('disabled', false);
    await render(TEMPLATE);
  });

  test('export links', async function (assert) {
    assert.expect(4);

    assert.dom('.menu-trigger').hasText('Export', 'Component yields content as expected');

    await triggerEvent('.menu-trigger', 'mouseenter');
    assert.notOk(!!$('.menu-content a:contains("CSV")').length, 'Export to CSV is not available for dashboards');

    await click($('.menu-content a:contains("PDF")')[0]);
    assert
      .dom('.export__download-link')
      .hasAttribute('href', '/export?dashboard=123', 'Export to PDF action generates a correct download link');

    await click($('.menu-content a:contains("PNG")')[0]);
    assert
      .dom('.export__download-link')
      .hasAttribute(
        'href',
        '/export?dashboard=123&fileType=png',
        'Export to PNG action generates a correct download link'
      );
  });

  test('export filename', async function (assert) {
    assert.expect(1);

    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("PDF")')[0]);
    assert
      .dom('.export__download-link')
      .hasAttribute(
        'download',
        'akkala-tech-lab-weekly-reports-dashboard',
        'Download attribute is set to the dasherized dashboard name, appended with -dashboard'
      );
  });

  test('disabled', async function (assert) {
    assert.expect(1);

    this.set('disabled', true);
    await render(TEMPLATE);

    assert.dom('.menu-content').doesNotExist('Dropdown should not be visible');
  });

  test('invalid', async function (assert) {
    assert.expect(3);

    class MockNotifications extends Service {
      add({ title }) {
        assert.step(title);
      }
      clear() {
        return true;
      }
    }
    this.owner.register('service:navi-notifications', MockNotifications);

    this.set('dashboard', {
      validations: { isTruelyValid: false },
      constructor: { modelName: 'dashboard' },
    });
    await render(TEMPLATE);

    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("PDF")')[0]);
    assert.verifySteps(
      ['Your PDF download should begin shortly', 'Please validate the dashboard and try again.'],
      'An error notification is added for an invalid dashboard'
    );
  });

  test('GSheet Notification', async function (assert) {
    assert.expect(2);

    let addCalls = 0;
    class MockNotifications extends Service {
      add({ title }) {
        addCalls++;
        if (addCalls === 1) {
          assert.equal(
            title,
            'We are building your spreadsheet and sending it to Google Drive. Keep an eye out for the email!',
            'A notification is added for the clicked export type'
          );
        } else {
          assert.equal(title, 'Your export has finished!', 'Second notification after ajax call comes back');
        }
      }
      clear() {
        return true;
      }
    }
    this.owner.register('service:navi-notifications', MockNotifications);

    await render(TEMPLATE);
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("Google Sheet")')[0]);
  });
});

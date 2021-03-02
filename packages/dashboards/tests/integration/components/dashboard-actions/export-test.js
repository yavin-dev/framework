import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';

const TEMPLATE = hbs`
  <DashboardActions::Export
    @dashboard={{this.dashboard}}
    @disabled={{this.disabled}}
  >
    Export
  </DashboardActions::Export>
`;

module('Integration | Component | dashboard actions/export', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.set('dashboard', { id: 123, title: 'Akkala Tech Lab Weekly Reports' });
    this.set('disabled', false);
    await render(TEMPLATE);
  });

  test('export links', async function (assert) {
    assert.expect(4);

    assert.dom('.ember-basic-dropdown-trigger').hasText('Export', 'Component yields content as expected');

    await clickTrigger();

    assert.notOk(
      !!$('.multiple-format-export__dropdown a:contains("CSV")').length,
      'Export to CSV is not available for dashboards'
    );

    assert.equal(
      $('.multiple-format-export__dropdown a:contains("PDF")').attr('href'),
      '/export?dashboard=123',
      'Export to PDF action has a correct download link'
    );

    assert.equal(
      $('.multiple-format-export__dropdown a:contains("PNG")').attr('href'),
      '/export?dashboard=123&fileType=png',
      'Export to PNG action has a correct download link'
    );
  });

  test('export filename', async function (assert) {
    assert.expect(1);

    await clickTrigger();
    assert.equal(
      $('.multiple-format-export__dropdown a:contains("PDF")').attr('download'),
      'akkala-tech-lab-weekly-reports-dashboard',
      'Download attribute is set to the dasherized dashboard name, appended with -dashboard'
    );
  });

  test('disabled', async function (assert) {
    assert.expect(1);

    this.set('disabled', true);
    await render(TEMPLATE);
    await clickTrigger();

    assert.dom('.ember-basic-dropdown-content-placeholder').isNotVisible('Dropdown should not be visible');
  });
});

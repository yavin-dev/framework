import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import NaviAdapterError from 'navi-data/errors/navi-adapter-error';

module('Integration | Component | routes/reports-report-error', function (hooks) {
  setupRenderingTest(hooks);

  test('no args', async function (assert) {
    await render(hbs`
      <Routes::ReportsReportError/>
    `);

    assert
      .dom('.routes-reports-report-error__message')
      .hasText('Oops! There was an error with your request.', 'component renders message without args');

    assert
      .dom('.routes-reports-report-error__error-list')
      .hasText('Unexpected Error', 'component renders details without args');
  });

  test('error args', async function (assert) {
    this.set('error', new Error('Something bad'));
    await render(hbs`
      <Routes::ReportsReportError
        @error={{this.error}}
      />
    `);

    assert
      .dom('.routes-reports-report-error__message')
      .hasText('Oops! There was an error with your request.', 'component renders message with Error');

    assert
      .dom('.routes-reports-report-error__error-list')
      .hasText('Unexpected Error', 'component renders details with Error');
  });

  test('adapter error arg', async function (assert) {
    this.set('error', new NaviAdapterError('Request Error', [{ detail: 'Error Detail' }]));
    await render(hbs`
      <Routes::ReportsReportError
        @error={{this.error}}
      />
    `);

    assert
      .dom('.routes-reports-report-error__message')
      .hasText('Oops! There was an error with your request.', 'component renders message with NaviAdapterError');

    assert
      .dom('.routes-reports-report-error__error-list')
      .hasText('Error Detail', 'component renders details with NaviAdapterError');
  });
});

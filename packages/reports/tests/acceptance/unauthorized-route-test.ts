import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL, click, setupOnerror } from '@ember/test-helpers';
import config from 'ember-get-config';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import type { Server } from 'miragejs';
import type { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { Response } from 'ember-cli-mirage';
import { clickItem } from 'navi-reports/test-support/report-builder';

interface TestContext extends Context {
  server: Server;
}

module('Acceptance | Navi Report | Unauthorized Route', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('saved report - change to unauthorized fact', async function (assert) {
    assert.expect(5);
    setupOnerror(() => null);
    await visit('/reports/1/view');
    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Protected Table"]');
    await animationsSettled();
    await click('.navi-report__run-btn');

    // route transitions to unauthorized
    assert.equal(currentURL(), '/reports/1/unauthorized', 'check to see if we are on the unauthorized route');
    // main content shows unauthorized message
    assert.dom('.navi-report-invalid__unauthorized').exists('unauthorized component is loaded');

    // make a valid report again
    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Network"]');
    await click('.navi-report__run-btn');
    await click('.visualization-toggle__option-icon[title="Table"]');

    // check report loading succeeded
    assert.equal(currentURL(), '/reports/1/view', 'user is transitioned back to the view route');
    assert.dom('.navi-report-invalid__unauthorized').doesNotExist('unauthorized component is loaded');
    assert.dom('.table-widget').exists('Data table visualization loads');
  });

  test('saved report - change to unauthorized metadata', async function (this: TestContext, assert) {
    assert.expect(7);
    setupOnerror(() => null);
    this.server.urlPrefix = `${config.navi.dataSources[1].uri}/v1`;
    this.server.get('/tables', () => new Response(403));
    await visit('/reports/1/view');
    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard Two"]');
    await animationsSettled();

    // route stays on edit
    assert.ok(currentURL().endsWith('view'), 'Stay on view route when trying to configure forbidden datasource');
    // main content doesn't show unauthorized
    assert.dom('.navi-report-invalid__unauthorized').doesNotExist('unauthorized component is not loaded');

    // side bar shows unauthorized message
    assert.dom('.navi-info-message__title').hasText('Access Denied', 'Shows unauthorized message');
    assert
      .dom('.navi-info-message__tech-details-content')
      .hasText(
        'You are not authorized to access this resource FetchError: HTTP403 - {} while fetching https://data2.naviapp.io/v1/tables/?format=fullview',
        'shows unauthorized details'
      );

    // make a valid report again
    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard One"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Network"]');
    await animationsSettled();
    await click('.navi-report__run-btn');
    await click('.visualization-toggle__option-icon[title="Table"]');

    // check report loading succeeded
    assert.equal(currentURL(), '/reports/1/view', 'check to see if we are on the view route');
    assert.dom('.navi-report-invalid__unauthorized').doesNotExist('unauthorized component is loaded');
    assert.dom('.table-widget').exists('Data table visualization loads');
  });

  test('new report - unauthorized metadata', async function (this: TestContext, assert) {
    assert.expect(4);
    setupOnerror(() => null);
    this.server.urlPrefix = `${config.navi.dataSources[1].uri}/v1`;
    this.server.get('/tables', () => new Response(403));
    await visit('/reports/new');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard Two"]');

    // route stays on edit
    assert.ok(currentURL().endsWith('edit'), 'Stay on edit route when trying to configure forbidden datasource');
    // main content doesn't show unauthorized
    assert.dom('.navi-report-invalid__unauthorized').doesNotExist('unauthorized component is not loaded');

    // side bar shows unauthorized message
    assert.dom('.navi-info-message__title').hasText('Access Denied', 'Shows unauthorized message');
    assert
      .dom('.navi-info-message__tech-details-content')
      .hasText(
        'You are not authorized to access this resource FetchError: HTTP403 - {} while fetching https://data2.naviapp.io/v1/tables/?format=fullview',
        'shows unauthorized details'
      );
  });

  test('new report - unauthorized fact', async function (this: TestContext, assert) {
    assert.expect(2);
    setupOnerror(() => null);
    await visit('/reports/new');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard One"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Protected Table"]');
    await animationsSettled();
    await clickItem('metric', 'Ad Clicks');
    await click('.navi-report__run-btn');

    // route transitions to unauthorized
    assert.ok(currentURL().endsWith('unauthorized'), 'Unauthorized request transition to the unauthorized route');
    // main content shows unauthorized message
    assert.dom('.navi-report-invalid__unauthorized').exists('unauthorized component is loaded');
  });

  test('saved report - unauthorized metadata', async function (this: TestContext, assert) {
    assert.expect(4);
    setupOnerror(() => null);
    this.server.urlPrefix = `${config.navi.dataSources[1].uri}/v1`;
    this.server.get('/tables', () => new Response(403));
    this.server.get('/metricFunctions', () => new Response(403));
    await visit('/reports/12/view');

    // route transitions to unauthorized
    assert.equal(currentURL(), '/reports/12/unauthorized', 'Unauthorized request transition to the unauthorized route');
    // main content shows unauthorized message
    assert.dom('.navi-report-invalid__unauthorized').exists('unauthorized component is loaded');

    // side bar shows unauthorized message
    assert.dom('.navi-info-message__title').hasText('Access Denied');
    assert
      .dom('.navi-info-message__tech-details-content')
      .hasText(
        'You are not authorized to access this resource FetchError: HTTP403 - {} while fetching https://data2.naviapp.io/v1/tables/?format=fullview',
        'shows unauthorized details'
      );
  });

  test('saved report - unauthorized fact', async function (assert) {
    assert.expect(2);
    await visit('/reports/15/view');
    // route transitions to unauthorized
    assert.equal(currentURL(), '/reports/15/unauthorized', 'Unauthorized request transition to the unauthorized route');
    // main content shows unauthorized message
    assert.dom('.navi-report-invalid__unauthorized').exists('unauthorized component is loaded');
  });
});

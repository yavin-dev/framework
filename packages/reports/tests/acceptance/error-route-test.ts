import { module, test } from 'qunit';
import { visit, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Server, Response } from 'miragejs';
import config from 'ember-get-config';
import { TestContext as Context } from 'ember-test-helpers';

interface TestContext extends Context {
  server: Server;
}

module('Acceptance | Navi Report | Error Route', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Error data request', async function (this: TestContext, assert) {
    this.server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    this.server.get(
      '/data/*path',
      () => new Response(400, {}, { description: 'Cannot merge mismatched time grains month and day' })
    );

    await visit('/reports/5/view');

    assert
      .dom('.routes-reports-report-error')
      .hasText(
        'Oops! There was an error with your request. Cannot merge mismatched time grains month and day',
        'An error message is displayed for an invalid request'
      );

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map((e) => e.textContent),
      ['Date Time (day)', 'Ad Clicks', 'Nav Link Clicks'],
      'The column config is displayed in the error route'
    );
  });

  test('Rate Limited data request', async function (this: TestContext, assert) {
    this.server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    this.server.get(
      '/data/*path',
      () => new Response(429, {}, `Rate limit reached. Reject ${config.navi.dataSources[0].uri}/v1/data/network/day`)
    );

    await visit('/reports/5/view');

    assert
      .dom('.routes-reports-report-error')
      .hasText(
        'Oops! There was an error with your request. Rate limit reached, please try again later.',
        'An error message is displayed for an rate limited request'
      );
  });
});

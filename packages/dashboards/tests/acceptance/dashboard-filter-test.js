import { click, fillIn, visit, triggerKeyEvent } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { module, test } from 'qunit';
import config from 'ember-get-config';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Dashboard Filters', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Test dashbaord filter flow', async function(assert) {
    await visit('/dashboards/1/view');

    let dataRequests = [];

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.pretender.handledRequest = (verb, url, req) => {
      if (verb == 'GET' && url.includes('/v1/data')) {
        dataRequests.push(req);
      }
    };

    await click('.dashboard-filters__expand-button');
    await click('.dashboard-filters-expanded__add-filter-button');

    await selectChoose('.dashboard-dimension-selector', 'Property');

    await fillIn('.filter-builder-dimension__values input', '1');
    await selectChoose('.filter-builder-dimension__values', '.item-row', 0);

    assert.ok(
      dataRequests.every(request => request.queryParams.filters == 'property|id-in[1]'),
      'each widget request has the right filter with property in 1'
    );
    dataRequests = [];

    await fillIn('.filter-builder-dimension__values input', '2');
    await selectChoose('.filter-builder-dimension__values', '.item-row', 0);

    assert.ok(
      dataRequests.every(request => request.queryParams.filters == 'property|id-in[1,2]'),
      'each widget request has the right filter with values of both 1 and 2'
    );

    await click('.dashboard-filters-expanded__add-filter-button');
    await selectChoose('.dashboard-dimension-selector', 'Platform');

    await selectChoose('.filter-collection__row:nth-child(2) .filter-builder-dimension__operator', 'Contains');
    await selectChoose('.filter-builder-dimension__field', 'desc');
    await fillIn('.filter-collection__row:nth-child(2) .filter-builder-dimension__values input', 'win');
    dataRequests = [];
    await triggerKeyEvent(
      '.filter-collection__row:nth-child(2) .filter-builder-dimension__values input',
      'keydown',
      'Enter'
    );

    assert.ok(
      dataRequests.every(request => request.queryParams.filters == 'platform|desc-contains[win],property|id-in[1,2]'),
      'each widget request has both filters present after new one is added'
    );
    dataRequests = [];

    await click('.filter-collection__remove:nth-child(1)');

    assert.ok(
      dataRequests.every(request => request.queryParams.filters == 'platform|desc-contains[win]'),
      'each widget request has the right filters after one has been removed'
    );
    dataRequests = [];

    //test dashboard has the filter on save
    let dashboardBody = {};

    server.urlPrefix = config.navi.appPersistence.uri;
    server.pretender.handledRequest = (verb, url, req) => {
      if (verb == 'PATCH' && url.includes('/dashboards/1')) {
        dashboardBody = JSON.parse(req.requestBody);
      }
    };

    await click('.navi-dashboard__save-button');

    assert.deepEqual(
      dashboardBody.data.attributes.filters,
      [{ dimension: 'platform', field: 'desc', operator: 'contains', values: ['win'] }],
      'Correct filters are saved with the dashboard'
    );
  });
});

import { click, fillIn, visit, triggerKeyEvent, findAll, currentURL } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { module, test } from 'qunit';
import config from 'ember-get-config';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Dashboard Filters', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('dashboard filter flow', async function(assert) {
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
    assert.equal(dataRequests.length, 3, 'three data requests were made (one for each widget)');
    dataRequests = [];

    await fillIn('.filter-builder-dimension__values input', '2');
    await selectChoose('.filter-builder-dimension__values', '.item-row', 0);

    assert.ok(
      dataRequests.every(request => request.queryParams.filters == 'property|id-in[1,2]'),
      'each widget request has the right filter with values of both 1 and 2'
    );
    assert.equal(dataRequests.length, 3, 'three data requests were made (one for each widget)');

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
    assert.equal(dataRequests.length, 3, 'three data requests were made (one for each widget)');
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

  test('dashboard filter query params - model changes query params', async function(assert) {
    assert.expect(12);

    const INITIAL_FILTERS = [
      {
        dimension: 'Property',
        operator: 'contains',
        rawValues: ['114', '100001']
      },
      {
        dimension: 'Property',
        operator: 'not equals',
        rawValues: ['1']
      },
      {
        dimension: 'Property',
        operator: 'not equals',
        rawValues: ['2', '3', '4']
      },
      {
        dimension: 'EventId',
        operator: 'equals',
        rawValues: ['1']
      }
    ];

    await visit('/dashboards/2/view');
    assert.equal(currentURL(), '/dashboards/2/view', 'No query params set');
    assert.deepEqual(
      extractCollapsedFilters(),
      INITIAL_FILTERS,
      'Filters reflect clean dashboard state with no query params'
    );

    //Remove 3/4 of filters and change operator of remaining one
    await click('.dashboard-filters__expand-button');
    await click('.filter-collection__remove');
    await click('.filter-collection__remove');
    await click(findAll('.filter-collection__remove')[1]);
    await selectChoose('.filter-builder-dimension__operator', 'Equals');
    await click('.dashboard-filters__expand-button');

    //Ensure that filters are changed
    const dirtyURL = currentURL();
    const dirtyFilters = extractCollapsedFilters();
    assert.deepEqual(
      dirtyFilters,
      [
        {
          dimension: 'Property',
          operator: 'equals',
          rawValues: ['2', '3', '4']
        }
      ],
      'Filters are changed from their initial state'
    );
    assert.ok(
      dirtyURL.startsWith('/dashboards/2/view?filters='),
      'Changes to the filters cause the filters to be compressed as a query param'
    );
    assert.dom('.navi-dashboard__save-dialogue').isVisible('The dashboard is in a dirty state');

    //Go back to dashboards index view and return to dashboard still in dirty state
    await click('.navi-dashboard__breadcrumb-link');
    assert.equal(currentURL(), '/dashboards', 'Routed back to dashboards route with no active query params');
    await click('.navi-collection__row1 a');
    assert.equal(
      currentURL(),
      dirtyURL,
      'Returning to index view and back to the dashboard keeps dirty state and query params'
    );
    assert.deepEqual(extractCollapsedFilters(), dirtyFilters, 'Filters are in same dirty state');
    assert.dom('.navi-dashboard__save-dialogue').isVisible('The dashboard is still in a dirty state');

    //Revert to clean state and check if query params are removed
    await click('.navi-dashboard__revert-button');
    assert.equal(currentURL(), '/dashboards/2/view', 'No query params set after revert');
    assert.deepEqual(extractCollapsedFilters(), INITIAL_FILTERS, 'Filters are back to original state');
    assert.dom('.navi-dashboard__save-dialogue').isNotVisible('The dashboard is in a clean state');
  });

  test('dashboard filter query params - query params change model on load', async function(assert) {
    assert.expect(5);

    const dirtyURL =
      '/dashboards/2/view?filters=EQbwOsBmCWA2AuBTATgZwgLgNrmAE2gFtEA7VaAexMwgAdkLaV4BPCAGgkZQEN4LkNYNGrBOwAG49YAV0Tpg2CACYOEAMxrgAFggBdcTESw8Q6KeABfPZeBA';
    const filters = [
      {
        dimension: 'Property',
        operator: 'equals',
        rawValues: ['2', '3', '4']
      }
    ];

    //Load filters from query params
    await visit(dirtyURL);
    assert.equal(currentURL(), dirtyURL, 'Query params are set');
    assert.deepEqual(
      extractCollapsedFilters(),
      filters,
      'Model loads in a dirty state with the filters from the query params'
    );
    assert
      .dom('.navi-dashboard__save-dialogue')
      .isVisible('The dashboard loads in a dirty state when query params are set');

    //Save the dashboard, making it clean with the filters set by the query params
    await click('.navi-dashboard__save-button');
    assert.equal(currentURL(), '/dashboards/2/view', 'Query params are removed once dashboard is in a clean state');
    assert.deepEqual(
      extractCollapsedFilters(),
      filters,
      'Filters did not change even though query params were removed'
    );
  });
});

/**
 * Find collapsed filter elements and pull out dimension, operator, and rawValues
 * to return in an object that is easily compared
 *
 * @function extractCollapsedFilters
 * @returns {Object}
 */
function extractCollapsedFilters() {
  return findAll('.dashboard-filters-collapsed-filter').map(el => ({
    dimension: el.querySelector('.dashboard-filters-collapsed-filter__dimension').textContent.trim(),
    operator: el.querySelector('.dashboard-filters-collapsed-filter__operator').textContent.trim(),
    rawValues: [...el.querySelectorAll('.dashboard-filters-collapsed-filter__value')].map(
      elm => elm.textContent.trim().match(/\d+/)[0]
    )
  }));
}

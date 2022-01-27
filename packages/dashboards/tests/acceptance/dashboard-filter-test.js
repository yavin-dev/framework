import { click, fillIn, visit, triggerKeyEvent, find, findAll, currentURL } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { module, test } from 'qunit';
import config from 'ember-get-config';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

let CompressionService, confirm;

module('Acceptance | Dashboard Filters', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    CompressionService = this.owner.lookup('service:compression');
    confirm = window.confirm;
  });

  hooks.afterEach(function () {
    window.confirm = confirm;
  });

  test('dashboard filter flow', async function (assert) {
    await visit('/dashboards/1/view');

    let dataRequests = [];

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.pretender.handledRequest = (verb, url, req) => {
      if (url.includes('/v1/data')) {
        dataRequests.push(req);
      }
      return { rows: [] };
    };

    await click('.dashboard-filters__expand-button');

    await selectChoose('.dashboard-dimension-selector', 'Property');

    await fillIn('.filter-values--dimension-select__trigger input', '1');
    await selectChoose('.filter-values--dimension-select__trigger', '1');

    assert.ok(
      dataRequests.every((request) => request.queryParams.filters == 'property|id-in["1"]'),
      'each widget request has the right filter with property in 1'
    );
    assert.equal(dataRequests.length, 3, 'three data requests were made (one for each widget)');
    dataRequests = [];

    await fillIn('.filter-values--dimension-select__trigger input', '2');
    await selectChoose('.filter-values--dimension-select__trigger', '2');

    assert.ok(
      dataRequests.every((request) => request.queryParams.filters == 'property|id-in["1","2"]'),
      'each widget request has the right filter with values of both 1 and 2'
    );
    assert.equal(dataRequests.length, 3, 'three data requests were made (one for each widget)');

    await click('.dashboard-filters--expanded__add-filter-button');
    await selectChoose('.dashboard-dimension-selector', 'Platform');

    await selectChoose('.filter-collection__row:nth-child(2) .filter-builder__operator-trigger', 'Contains');
    await fillIn('.filter-collection__row:nth-child(2) .filter-builder__values input', 'win');
    dataRequests = [];
    await triggerKeyEvent('.filter-collection__row:nth-child(2) .filter-builder__values input', 'keydown', 'Enter');

    assert.ok(
      dataRequests.every(
        (request) => request.queryParams.filters === 'property|id-in["1","2"],platform|id-contains["win"]'
      ),
      'each widget request has both filters present after new one is added'
    );
    assert.equal(dataRequests.length, 3, 'three data requests were made (one for each widget)');
    dataRequests = [];

    await click('.filter-collection__remove:nth-child(1)');

    assert.ok(
      dataRequests.every((request) => request.queryParams.filters == 'platform|id-contains["win"]'),
      'each widget request has the right filters after one has been removed'
    );

    //test date filter
    await click('.dashboard-filters--expanded__add-filter-button');
    await selectChoose('.dashboard-dimension-selector', 'Date Time');
    await selectChoose(findAll('.dropdown-parameter-picker')[1], 'Day');
    await selectChoose(findAll('.filter-builder__operator-trigger')[1], 'In The Past');
    dataRequests = [];
    await fillIn('.filter-values--lookback-input__value', '7');

    assert.ok(
      dataRequests.every((request) => request.queryParams.dateTime === 'P7D/current'),
      'each widget request has the right date filter'
    );
    assert.equal(dataRequests.length, 3, 'three data requests were made (one for each widget)');

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
      [
        { type: 'dimension', dimension: 'bardOne.platform', field: 'id', operator: 'contains', values: ['win'] },
        {
          dimension: 'bardOne.network.dateTime',
          field: 'day',
          operator: 'bet',
          type: 'timeDimension',
          values: ['P7D', 'current'],
        },
      ],
      'Correct filters are saved with the dashboard'
    );
  });

  test('adding dimension with key primary id field creates correct request', async function (assert) {
    await visit('/dashboards/1/view');

    let dataRequests = [];

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.pretender.handledRequest = (verb, url, req) => {
      if (url.includes('/v1/data')) {
        dataRequests.push(req);
      }
      return { rows: [] };
    };

    await click('.dashboard-filters__expand-button');

    await selectChoose('.dashboard-dimension-selector', 'Multi System Id');

    await fillIn('.filter-values--dimension-select__trigger input', '1');
    await selectChoose('.filter-values--dimension-select__trigger', '1');
    assert.ok(
      dataRequests.every((request) => request.queryParams.filters == 'multiSystemId|key-in["1"]'),
      'each widget request has the filter added using the key field'
    );
    assert.equal(dataRequests.length, 3, 'three data requests were made (one for each widget)');
  });

  test('dashboard filter query params - ui changes update the model', async function (assert) {
    assert.expect(13);

    window.confirm = () => {
      assert.step('confirm called');
      return true;
    };

    const INITIAL_FILTERS = [
      {
        dimension: 'Date Time (Day)',
        operator: 'in the past',
        rawValues: ['7'],
      },
      {
        dimension: 'Property (id)',
        operator: 'contains',
        rawValues: ['114', '100001'],
      },
      {
        dimension: 'Property (id)',
        operator: 'not equals',
        rawValues: ['1'],
      },
      {
        dimension: 'Property (id)',
        operator: 'not equals',
        rawValues: ['2', '3'],
      },
      {
        dimension: 'EventId (id)',
        operator: 'equals',
        rawValues: ['1'],
      },
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
    await click('.filter-collection__remove');
    await click(findAll('.filter-collection__remove')[1]);
    await selectChoose('.filter-builder__operator-trigger', 'Equals');
    await click('.dashboard-filters__expand-button');

    //Ensure that filters are changed
    const dirtyURL = currentURL();
    const dirtyFilters = extractCollapsedFilters();
    assert.deepEqual(
      dirtyFilters,
      [
        {
          dimension: 'Property (id)',
          operator: 'equals',
          rawValues: ['2', '3'],
        },
      ],
      'Filters are changed from their initial state'
    );
    assert.ok(
      dirtyURL.startsWith('/dashboards/2/view?filters='),
      'Changes to the filters cause the filters to be compressed as a query param'
    );
    assert.dom('.navi-dashboard__save-dialogue').isVisible('The dashboard is in a dirty state');

    //Go back to dashboards index view and return to dashboard still in dirty state
    await click('.dashboard-header__breadcrumb-link');
    assert.equal(currentURL(), '/dashboards', 'Routed back to dashboards route with no active query params');
    assert.verifySteps(['confirm called']);

    //Capture requests to check their format
    let dataRequests = [];
    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.pretender.handledRequest = (verb, url, req) => {
      if (url.includes('/v1/data')) {
        dataRequests.push(req);
      }
      return { rows: [] };
    };

    await click('.navi-collection__row1 a');
    assert.equal(
      currentURL(),
      '/dashboards/2/view',
      'Returning to index view and back to the dashboard clears the dirty state and query params'
    );
    assert.deepEqual(extractCollapsedFilters(), INITIAL_FILTERS, 'Initial filters are present');
    assert.dom('.navi-dashboard__save-dialogue').isNotVisible('The dashboard is in a clean state');

    assert.deepEqual(
      dataRequests.map((req) => req.queryParams.filters),
      [
        'property|id-contains["114","100001"],property|id-notin["1"],property|id-notin["2","3"]',
        'property|id-contains["114","100001"],property|id-notin["1"],property|id-notin["2","3"]',
      ],
      'The requests are sent with the initial filters'
    );

    assert.deepEqual(
      dataRequests.map((req) => req.queryParams.dateTime),
      ['P7D/current', 'P7D/current'],
      'The requests are sent with the initial date filters'
    );
  });

  test('dashboard filter query params - query params change model on load', async function (assert) {
    assert.expect(7);

    const dirtyURL =
      '/dashboards/2/view?filters=N4IgZglgNgLgpgJwM4gFwG1QHsAOiCGMWCaIEAdiADQgBu%2BUArnChiAEzUgDMIAujUhwoAE1I4EuRDACeXHPgT4AtnHjI0oIaNIQxAXxqy8pERFXkkELJRpIsjBAGM4pAEaKRAeXKv9ffSA';
    const filters = [
      {
        dimension: 'Property (id)',
        operator: 'equals',
        rawValues: ['2', '3'],
      },
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
    assert.dom('.navi-notifications').isNotVisible('No notifications on query param decompression success');

    //Save the dashboard, making it clean with the filters set by the query params
    await click('.navi-dashboard__save-button');
    assert.equal(currentURL(), '/dashboards/2/view', 'Query params are removed once dashboard is in a clean state');
    assert.deepEqual(
      extractCollapsedFilters(),
      filters,
      'Filters did not change even though query params were removed'
    );

    await visit('/dashboards/2/view?filters=blahblahblah_this_isnt_valid');
    assert
      .dom('.alert.is-danger')
      .hasText(
        'Error decoding filter query params. Using default dashboard filters.',
        'Notification shown when error decompressing filter query params'
      );
  });

  test('dashboard filter query params - returns cached dashboard widget data on filter add', async function (assert) {
    assert.expect(9);

    let dataRequests = [];
    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.pretender.handledRequest = (verb, url, req) => {
      if (url.includes('/v1/data')) {
        dataRequests.push(req);
      }

      return { rows: [] };
    };

    await visit('/dashboards/1/view');
    assert.equal(currentURL(), '/dashboards/1/view', 'No query params are set');

    assert.equal(dataRequests.length, 3, 'Three requests have been run since route entry');

    //Add a filter with no values
    await click('.dashboard-filters__expand-button');
    await selectChoose('.dashboard-dimension-selector', 'Property');

    let decompressed = await CompressionService.decompress(currentURL().split('=')[1]);
    assert.deepEqual(
      decompressed,
      {
        filters: [
          {
            type: 'dimension',
            field: 'property',
            parameters: {
              field: 'id',
            },
            operator: 'in',
            values: [],
            source: 'bardOne',
          },
        ],
      },
      'A filter with no values was added'
    );
    assert.equal(dataRequests.length, 3, 'No new requests run on filter add (model hook should use cached data)');

    //Remove the filter with no values
    await click('.filter-collection__remove');
    assert.equal(
      dataRequests.length,
      3,
      'No new requests run on empty filter remove (model hook should use cached data)'
    );

    await selectChoose('.dashboard-dimension-selector', 'Property');

    assert.equal(dataRequests.length, 3, 'No new requests run on filter add (model hook should use cached data)');

    //Add a value to the filter
    await fillIn('.filter-values--dimension-select__trigger input', '1');
    await selectChoose('.filter-values--dimension-select__trigger', '1');

    decompressed = await CompressionService.decompress(currentURL().split('=')[1]);
    assert.deepEqual(
      decompressed,
      {
        filters: [
          {
            type: 'dimension',
            field: 'property',
            parameters: {
              field: 'id',
            },
            operator: 'in',
            values: ['1'],
            source: 'bardOne',
          },
        ],
      },
      'A value was added to the filter'
    );
    assert.equal(dataRequests.length, 6, 'New requests are sent once filter values are set');

    //Remove the filter with a value
    await click('.filter-collection__remove');
    assert.equal(dataRequests.length, 9, 'New requests run when nonempty filter is removed');
  });

  test('dashboard filter query params - visiting route with one more filter and same empty filter', async function (assert) {
    /**
     * This is to test a specific corner case where a new filter is added (no values) and then the user pastes a
     * link to the same dashboard with the same filters except has one more added filter with a value
     */
    assert.expect(6);

    let dataRequests = [];
    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.pretender.handledRequest = (verb, url, req) => {
      if (url.includes('/v1/data')) {
        dataRequests.push(req);
      }
      return { rows: [] };
    };

    await visit('/dashboards/1/view');
    assert.equal(currentURL(), '/dashboards/1/view', 'No query params are set');

    assert.equal(dataRequests.length, 3, 'Three requests have been run since route entry');

    //Add a filter with no values
    await click('.dashboard-filters__expand-button');
    await selectChoose('.dashboard-dimension-selector', 'Property');

    let decompressed = await CompressionService.decompress(currentURL().split('=')[1]);
    assert.deepEqual(
      decompressed,
      {
        filters: [
          {
            type: 'dimension',
            field: 'property',
            parameters: {
              field: 'id',
            },
            operator: 'in',
            values: [],
            source: 'bardOne',
          },
        ],
      },
      'A filter with no values was added'
    );
    assert.equal(dataRequests.length, 3, 'No new requests run on filter add (model hook should use cached data)');

    await visit(
      '/dashboards/1/view?filters=N4IgZglgNgLgpgJwM4gFwG1QHsAOiCGMWCaIEAdiADQgBu%2BUArnChgLo2RxQAmpOCXIhgBPaiBz4E%2BALZx4yNKC69SEPgF8aovKR4Q55JBCyUaSLIwQBjOKQBGUngHlydrdjzSiJVGTN0DMys6CAAtADMIBzgENx8fvgA5nY0ktJyCqzKcap%2B6iBaIDp2fvqGxqbiFla2Dk6u7mwaQA'
    );
    assert.equal(
      dataRequests.length,
      6,
      'New requests run when entering query params with one new filter and the same empty filter'
    );

    decompressed = await CompressionService.decompress(currentURL().split('=')[1]);
    assert.deepEqual(
      decompressed,
      {
        filters: [
          {
            type: 'dimension',
            field: 'property',
            parameters: {
              field: 'id',
            },
            operator: 'in',
            values: [],
            source: 'bardOne',
          },
          {
            type: 'dimension',
            field: 'age',
            parameters: {
              field: 'id',
            },
            operator: 'in',
            values: ['-3'],
            source: 'bardOne',
          },
        ],
      },
      'The expected filters are set in the query params'
    );
  });

  test('breadcrumbs in subroute also have query params', async function (assert) {
    assert.expect(2);
    await visit(
      '/dashboards/1/view?filters=EQbwOsBmCWA2AuBTATgZwgLgNrmAE2gFtEA7VaAexMwgAdkLaV4BPCAGgkZQEN4LkNYNGrBOwAG49YAV0Tpg2ALriYiWHiHRNwAL7tcBYmUqiMEHgHNEHLk2R8BW0eKmz5mLBAC0AZggqEGoaWjq6SrrAQA'
    );

    // hover css events are hard
    find('.navi-widget__actions').style.visibility = 'visible';
    await click('.navi-widget__edit-btn');

    assert.equal(currentURL(), '/dashboards/1/widgets/1/view', 'Successfully followed exploring widget link');

    assert
      .dom(findAll('.navi-report-widget__breadcrumb-link')[1])
      .hasAttribute(
        'href',
        '/dashboards/1?filters=EQbwOsBmCWA2AuBTATgZwgLgNrmAE2gFtEA7VaAexMwgAdkLaV4BPCAGgkZQEN4LkNYNGrBOwAG49YAV0Tpg2ALriYiWHiHRNwAL7tcBYmUqiMEHgHNEHLk2R8BW0eKmz5mLBAC0AZggqEGoaWjq6SrrAQA'
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
  return findAll('.filter-collection--collapsed-item').map((el) => ({
    dimension: el.querySelector('.filter-dimension--collapsed').textContent.trim(),
    operator: el.querySelector('.filter-operator--collapsed').textContent.trim(),
    rawValues: [...el.querySelectorAll('.filter-values--collapsed')].map(
      (elm) => elm.textContent.trim().match(/\d+/)[0]
    ),
  }));
}

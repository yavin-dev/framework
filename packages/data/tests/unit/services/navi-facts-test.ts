import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender, { Server as PretenderServer } from 'pretender';
import config from 'ember-get-config';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import NaviFactsService from 'navi-data/services/navi-facts';
import { TestContext } from 'ember-test-helpers';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';

let Service: NaviFactsService, Server: PretenderServer;

const TestRequest: RequestV2 = {
  table: 'table1',
  requestVersion: '2.0',
  columns: [
    { type: 'timeDimension', field: 'table1.dateTime', parameters: { grain: 'grain1' } },
    { type: 'metric', field: 'm1', parameters: {} },
    { type: 'metric', field: 'm2', parameters: {} },
    { type: 'dimension', field: 'd1', parameters: { field: 'id' } },
    { type: 'dimension', field: 'd2', parameters: { field: 'id' } }
  ],
  filters: [
    {
      type: 'timeDimension',
      field: 'table1.dateTime',
      parameters: {
        grain: 'grain1'
      },
      operator: 'bet',
      values: ['2015-01-03', '2015-01-04']
    },
    {
      type: 'dimension',
      field: 'd3',
      parameters: { field: 'id' },
      operator: 'in',
      values: ['v1', 'v2']
    },
    {
      type: 'dimension',
      field: 'd4',
      parameters: { field: 'id' },
      operator: 'in',
      values: ['v3', 'v4']
    },
    {
      type: 'metric',
      field: 'm1',
      parameters: {},
      operator: 'gt',
      values: [0]
    }
  ],
  sorts: [],
  dataSource: 'bardOne'
};

const Response: ResponseV1 = {
  rows: [
    {
      dateTime: undefined,
      'd1|id': undefined,
      'd2|id': undefined,
      m1: undefined,
      m2: undefined
    }
  ],
  meta: {
    //@ts-expect-error
    test: true
  }
};

const HOST = config.navi.dataSources[0].uri;

module('Unit | Service | Navi Facts', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    Service = this.owner.lookup('service:navi-facts');

    //setup Pretender
    Server = new Pretender(function() {
      this.get(`${HOST}/v1/data/table1/grain1/d1/d2/`, function(request) {
        if (request.queryParams.page && request.queryParams.perPage) {
          return [
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              rows: [],
              meta: {
                paginated: {
                  page: request.queryParams.page,
                  perPage: request.queryParams.perPage
                }
              }
            })
          ];
        } else {
          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(Response)];
        }
      });
    });
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  test('Service Exists', function(assert) {
    assert.ok(!!Service, 'Service exists');
  });

  test('getURL', function(assert) {
    assert.expect(2);

    assert.deepEqual(
      Service.getURL(TestRequest),
      `${HOST}/v1/data/table1/grain1/d1/d2/?` +
        'dateTime=2015-01-03%2F2015-01-04&metrics=m1%2Cm2&' +
        'filters=d3%7Cid-in%5B%22v1%22%2C%22v2%22%5D%2Cd4%7Cid-in%5B%22v3%22%2C%22v4%22%5D&having=m1-gt%5B0%5D&' +
        'format=json',
      'Service returns the url when requested'
    );

    assert.deepEqual(
      Service.getURL(TestRequest, { format: 'jsonApi' }),
      `${HOST}/v1/data/table1/grain1/d1/d2/?` +
        'dateTime=2015-01-03%2F2015-01-04&metrics=m1%2Cm2&' +
        'filters=d3%7Cid-in%5B%22v1%22%2C%22v2%22%5D%2Cd4%7Cid-in%5B%22v3%22%2C%22v4%22%5D&having=m1-gt%5B0%5D&' +
        'format=jsonApi',
      'Service returns the url when requested with format'
    );
  });

  test('fetch', function(assert) {
    assert.expect(3);

    return Service.fetch(TestRequest).then(function(model) {
      assert.deepEqual(
        model.response,
        {
          rows: [
            {
              'd1(field=id)': undefined,
              'd2(field=id)': undefined,
              m1: undefined,
              m2: undefined,
              'table1.dateTime(grain=grain1)': undefined
            }
          ],
          meta: {
            //@ts-expect-error
            test: true
          }
        },
        'Fetch returns a navi response model object for TestRequest'
      );

      assert.deepEqual(model.request, TestRequest, 'Fetch returns a navi response model object with the TestRequest');

      assert.deepEqual(
        model._factService,
        Service,
        'Fetch returns a navi response model object with the service instance'
      );
    });
  });

  test('fetch with pagination', async function(assert) {
    assert.expect(1);
    const model = await Service.fetch(TestRequest, { page: 2, perPage: 10 });
    assert.deepEqual(
      model.response,
      {
        rows: [],
        meta: {
          //@ts-expect-error
          paginated: {
            page: '2',
            perPage: '10'
          }
        }
      },
      'Fetch returns a navi response model object for the paginated request'
    );
  });

  test('fetch and catch error', function(assert) {
    assert.expect(2);

    // Return an error
    Server.get(`${HOST}/v1/data/table1/grain1/d1/d2/`, () => {
      return [
        507,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          reason: 'Result set too large.  Try reducing interval or dimensions.',
          description: 'Result set too large: 1541214 > 100000'
        })
      ];
    });

    return Service.fetch(TestRequest).catch(response => {
      assert.ok(true, 'A request error falls into the promise catch block');

      assert.equal(
        response.payload.reason,
        'Result set too large.  Try reducing interval or dimensions.',
        'error is passed to catch block'
      );
    });
  });

  skip('request builder', function(assert) {
    // TODO: Remove request builder?
    assert.expect(2);

    /*
    let requestBuilder = Service.request({
      metrics: [
        {
          metric: 'pageViews',
          parameters: {
            type: 'dimension'
          }
        }
      ]
    });

    let newRequest = requestBuilder.addMetrics({ metric: 'adClicks' });

    assert.deepEqual(
      newRequest.metrics,
      [
        {
          metric: 'pageViews',
          parameters: {
            type: 'dimension'
          }
        },
        {
          metric: 'adClicks'
        }
      ],
      'Request returns a builder interface that allows extension'
    );

    assert.notEqual(Service.request(newRequest), newRequest, 'Each call to request returns a new builder instance');
    */
  });

  test('fetchNext', function(assert) {
    assert.expect(2);

    const originalFetch = Service.fetch;
    //@ts-expect-error
    Service.fetch = (request, options) => {
      assert.equal(options?.page, 3, 'FetchNext calls fetch with updated options');
    };

    const response: ResponseV1 = {
      rows: [],
      meta: {
        //@ts-expect-error
        pagination: {
          currentPage: 2,
          perPage: 10,
          numberOfResults: 30
        }
      }
    };
    const request = {} as RequestV2;

    Service.fetchNext(response, request);

    //@ts-expect-error
    response.meta.pagination.currentPage = 3;
    assert.equal(Service.fetchNext(response, request), null, 'fetchNext returns null when the last page is reached');

    Service.fetch = originalFetch;
  });

  test('fetchPrevious', function(assert) {
    assert.expect(2);

    const originalFetch = Service.fetch;
    //@ts-expect-error
    Service.fetch = (_request, options) => {
      assert.equal(options?.page, 1, 'FetchPrevious calls fetch with updated options');
    };

    const response: ResponseV1 = {
      rows: [],
      meta: {
        //@ts-expect-error
        pagination: {
          currentPage: 2,
          perPage: 10,
          numberOfResults: 30
        }
      }
    };
    const request = {} as RequestV2;

    Service.fetchPrevious(response, request);

    //@ts-expect-error
    response.meta.pagination.currentPage = 1;
    assert.equal(
      Service.fetchPrevious(response, request),
      null,
      'fetchPrevious returns null when the first page is reached'
    );

    Service.fetch = originalFetch;
  });
});

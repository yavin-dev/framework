import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender, { Server as PretenderServer } from 'pretender';
import config from 'ember-get-config';
import { RequestOptions } from 'navi-data/adapters/facts/interface';
import { RequestV2 } from '@yavin/client/request';
import NaviFactsService from 'navi-data/services/navi-facts';
import { TestContext } from 'ember-test-helpers';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import NaviAdapterError from 'navi-data/errors/navi-adapter-error';
import { task, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

let Server: PretenderServer;

const TestRequest: RequestV2 = {
  table: 'table1',
  requestVersion: '2.0',
  columns: [
    { type: 'timeDimension', field: 'table1.dateTime', parameters: { grain: 'grain1' } },
    { type: 'metric', field: 'm1', parameters: {} },
    { type: 'metric', field: 'm2', parameters: {} },
    { type: 'dimension', field: 'd1', parameters: { field: 'id' } },
    { type: 'dimension', field: 'd2', parameters: { field: 'id' } },
  ],
  filters: [
    {
      type: 'timeDimension',
      field: 'table1.dateTime',
      parameters: {
        grain: 'grain1',
      },
      operator: 'bet',
      values: ['2015-01-03', '2015-01-04'],
    },
    {
      type: 'dimension',
      field: 'd3',
      parameters: { field: 'id' },
      operator: 'in',
      values: ['v1', 'v2'],
    },
    {
      type: 'dimension',
      field: 'd4',
      parameters: { field: 'id' },
      operator: 'in',
      values: ['v3', 'v4'],
    },
    {
      type: 'metric',
      field: 'm1',
      parameters: {},
      operator: 'gt',
      values: [0],
    },
  ],
  sorts: [],
  dataSource: 'bardOne',
};

const Response: ResponseV1 = {
  rows: [
    {
      dateTime: undefined,
      'd1|id': undefined,
      'd2|id': undefined,
      m1: undefined,
      m2: undefined,
    },
  ],
  meta: {
    //@ts-expect-error
    test: true,
  },
};

const HOST = config.navi.dataSources[0].uri;

function assertRequest(context: TestContext, callback: (request: RequestV2, options?: RequestOptions) => void) {
  const originalNaviFacts = context.owner.factoryFor('service:navi-facts').class;
  class TestService extends originalNaviFacts {
    @task *fetch(request: RequestV2, options?: RequestOptions): TaskGenerator<unknown> {
      callback(request, options);
      return yield {};
    }
  }
  context.owner.unregister('service:navi-facts');
  context.owner.register('service:navi-facts', TestService);
}

module('Unit | Service | Navi Facts', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    //setup Pretender
    Server = new Pretender(function () {
      this.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/`, function (request) {
        if (request.queryParams.page && request.queryParams.perPage) {
          return [
            200,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              rows: [],
              meta: {
                paginated: {
                  page: request.queryParams.page,
                  perPage: request.queryParams.perPage,
                },
              },
            }),
          ];
        } else {
          return [200, { 'Content-Type': 'application/json' }, JSON.stringify(Response)];
        }
      });
    });
  });

  hooks.afterEach(function () {
    //shutdown pretender
    Server.shutdown();
  });

  test('Service Exists', function (assert) {
    const service: NaviFactsService = this.owner.lookup('service:navi-facts');
    assert.ok(!!service, 'Service exists');
  });

  test('getURL', function (assert) {
    const service: NaviFactsService = this.owner.lookup('service:navi-facts');
    assert.deepEqual(
      service.getURL(TestRequest),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/?` +
        'dateTime=2015-01-03%2F2015-01-04T00%3A00%3A00.000&metrics=m1%2Cm2&' +
        'filters=d3%7Cid-in%5B%22v1%22%2C%22v2%22%5D%2Cd4%7Cid-in%5B%22v3%22%2C%22v4%22%5D&having=m1-gt%5B0%5D&' +
        'format=json',
      'Service returns the url when requested'
    );

    assert.deepEqual(
      service.getURL(TestRequest, { format: 'jsonApi' }),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/?` +
        'dateTime=2015-01-03%2F2015-01-04T00%3A00%3A00.000&metrics=m1%2Cm2&' +
        'filters=d3%7Cid-in%5B%22v1%22%2C%22v2%22%5D%2Cd4%7Cid-in%5B%22v3%22%2C%22v4%22%5D&having=m1-gt%5B0%5D&' +
        'format=jsonApi',
      'Service returns the url when requested with format'
    );
  });

  test('fetch', async function (assert) {
    const service: NaviFactsService = this.owner.lookup('service:navi-facts');
    const model = await taskFor(service.fetch).perform(TestRequest);
    const { rows, meta } = model.response as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      {
        rows: [
          {
            'd1(field=id)': undefined,
            'd2(field=id)': undefined,
            m1: undefined,
            m2: undefined,
            'table1.dateTime(grain=grain1)': undefined,
          },
        ],
        meta: {
          test: true,
        },
      },
      'Fetch returns a navi response model object for TestRequest'
    );

    assert.deepEqual(model.request, TestRequest, 'Fetch returns a navi response model object with the TestRequest');

    assert.deepEqual(
      model['factService'],
      service,
      'Fetch returns a navi response model object with the service instance'
    );
  });

  test('fetch with pagination', async function (assert) {
    const service: NaviFactsService = this.owner.lookup('service:navi-facts');
    const model = await taskFor(service.fetch).perform(TestRequest, { page: 2, perPage: 10 });
    const { rows, meta } = model.response as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      {
        rows: [],
        meta: {
          paginated: {
            page: '2',
            perPage: '10',
          },
        },
      },
      'Fetch returns a navi response model object for the paginated request'
    );
  });

  test('fetch and catch error', async function (assert) {
    assert.expect(6);

    const service: NaviFactsService = this.owner.lookup('service:navi-facts');
    // Return an error object
    Server.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/`, () => {
      return [
        507,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          description: 'Result set too large.  Try reducing interval or dimensions.',
        }),
      ];
    });

    await taskFor(service.fetch)
      .perform(TestRequest)
      .catch((response: NaviAdapterError) => {
        assert.ok(true, 'A request error falls into the promise catch block');
        assert.equal(
          response.details[0],
          'Result set too large.  Try reducing interval or dimensions.',
          'error is passed to catch block'
        );
      });

    // Return an error string
    Server.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/`, () => {
      return [500, { 'Content-Type': 'text/plain' }, 'Server Error'];
    });

    await taskFor(service.fetch)
      .perform(TestRequest)
      .catch((response: NaviAdapterError) => {
        assert.ok(true, 'A request error falls into the promise catch block');
        assert.equal(response.details[0], 'Server Error', 'String error extracted');
      });

    await taskFor(service.fetch)
      .perform({ ...TestRequest, filters: [] })
      .catch((response: NaviAdapterError) => {
        assert.ok(true, 'A request error falls into the promise catch block');
        assert.equal(
          response.details[0],
          `Exactly one 'table1.dateTime' filter is required, you have 0`,
          'Adapter error is shown'
        );
      });
  });

  test('fetchNext', async function (assert) {
    assert.expect(2);

    assertRequest(this, (_request, options) => {
      assert.equal(options?.page, 3, 'fetchNext calls fetch with updated options');
    });
    const service: NaviFactsService = this.owner.lookup('service:navi-facts');

    const response = new NaviFactResponse(this.owner.lookup('service:client-injector'), {
      rows: [],
      meta: {
        pagination: {
          currentPage: 2,
          rowsPerPage: 10,
          numberOfResults: 30,
        },
      },
    });
    const request = {} as RequestV2;

    await taskFor(service.fetchNext).perform(response, request);

    //@ts-ignore
    response.meta.pagination.currentPage = 3;
    assert.equal(
      await taskFor(service.fetchNext).perform(response, request),
      null,
      'fetchNext returns null when the last page is reached'
    );
  });

  test('fetchPrevious', async function (assert) {
    assert.expect(2);

    assertRequest(this, (_request, options) => {
      assert.equal(options?.page, 1, 'fetchPrevious calls fetch with updated options');
    });
    const service: NaviFactsService = this.owner.lookup('service:navi-facts');

    const response = new NaviFactResponse(this.owner.lookup('service:client-injector'), {
      rows: [],
      meta: {
        pagination: {
          currentPage: 2,
          rowsPerPage: 10,
          numberOfResults: 30,
        },
      },
    });
    const request = {} as RequestV2;

    await taskFor(service.fetchPrevious).perform(response, request);

    //@ts-ignore
    response.meta.pagination.currentPage = 1;
    assert.equal(
      await taskFor(service.fetchPrevious).perform(response, request),
      null,
      'fetchPrevious returns null when the first page is reached'
    );
  });
});

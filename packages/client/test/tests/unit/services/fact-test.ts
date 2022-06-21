import { module, test } from 'qunit';
import type { RequestOptions } from '@yavin/client/adapters/facts/interface';
import type { RequestV2 } from '@yavin/client/request';
import NaviFactsService from '@yavin/client/services/fact';
import { ResponseV1 } from '@yavin/client/serializers/facts/interface';
import NaviFactResponse from '@yavin/client/models/navi-fact-response';
import NaviAdapterError from '@yavin/client/errors/navi-adapter-error';
import setupServer, { WithServer } from '../../helpers/server';
import { rest } from 'msw';
import { mockConfig } from '../../helpers/config';
import { Mock, nullInjector } from '../../helpers/injector';
import { ClientConfig } from '@yavin/client/config/datasources';
import { Injector, setInjector } from '@yavin/client/models/native-with-create';
import { DataSourcePluginConfig } from '@yavin/client/config/datasource-plugins';
import FiliFactsAdapter from '@yavin/client/plugins/fili/adapters/facts';
import FiliFactsSerializer from '@yavin/client/plugins/fili/serializers/facts';
import MetadataService from '@yavin/client/services/interfaces/metadata';

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

const config = mockConfig();
const HOST = config.dataSources[0].uri;
let FactsService: NaviFactsService;
let injector: Injector;

function assertRequest(callback: (request: RequestV2, options?: RequestOptions) => void) {
  class TestService extends NaviFactsService {
    //@ts-expect-error - override base fetch method
    *fetchTask(request: RequestV2, options?: RequestOptions) {
      yield Promise.resolve(callback(request, options));
      return null;
    }
  }
  return new TestService(injector);
}

module('Unit | Service | Fact', function (hooks) {
  setupServer(hooks);

  hooks.beforeEach(function (this: WithServer) {
    this.server.use(
      rest.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/`, (req, res, ctx) => {
        const queryParams = new URL(req.url).searchParams;
        const page = queryParams.get('page');
        const perPage = queryParams.get('perPage');
        if (page && perPage) {
          return res(
            ctx.json({
              rows: [],
              meta: {
                paginated: {
                  page,
                  perPage,
                },
              },
            })
          );
        } else {
          return res(ctx.json(Response));
        }
      })
    );

    FactsService = new NaviFactsService(nullInjector);
    injector = Mock()
      .config(new ClientConfig(config))
      .decorator({ applyGlobalDecorators: (request) => request })
      .facts(FactsService)
      .meta({ getById: () => null } as unknown as MetadataService)
      .plugin(
        (injector) =>
          new DataSourcePluginConfig(injector, {
            //@ts-expect-error - only fact config
            bard: {
              facts: {
                adapter: (injector) => new FiliFactsAdapter(injector),
                serializer: (injector) => new FiliFactsSerializer(injector),
              },
            },
          })
      )
      .build();

    setInjector(FactsService, injector);
  });

  test('Service Exists', function (assert) {
    assert.ok(!!FactsService, 'Service exists');
  });

  test('getURL', function (assert) {
    assert.deepEqual(
      FactsService.getURL(TestRequest),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/?` +
        'dateTime=2015-01-03%2F2015-01-04T00%3A00%3A00.000&metrics=m1%2Cm2&' +
        'filters=d3%7Cid-in%5B%22v1%22%2C%22v2%22%5D%2Cd4%7Cid-in%5B%22v3%22%2C%22v4%22%5D&having=m1-gt%5B0%5D&' +
        'format=json',
      'Service returns the url when requested'
    );

    assert.deepEqual(
      FactsService.getURL(TestRequest, { format: 'jsonApi' }),
      `${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/?` +
        'dateTime=2015-01-03%2F2015-01-04T00%3A00%3A00.000&metrics=m1%2Cm2&' +
        'filters=d3%7Cid-in%5B%22v1%22%2C%22v2%22%5D%2Cd4%7Cid-in%5B%22v3%22%2C%22v4%22%5D&having=m1-gt%5B0%5D&' +
        'format=jsonApi',
      'Service returns the url when requested with format'
    );
  });

  test('fetch', async function (assert) {
    const model = await FactsService.fetch(TestRequest);
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
      FactsService,
      'Fetch returns a navi response model object with the service instance'
    );
  });

  test('fetch with pagination', async function (assert) {
    const model = await FactsService.fetch(TestRequest, { page: 2, perPage: 10 });
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

  test('fetch and catch error', async function (this: WithServer, assert) {
    assert.expect(6);

    // Return an error object
    this.server.use(
      rest.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/`, (_req, res, ctx) => {
        return res(
          ctx.status(507),
          ctx.json({
            description: 'Result set too large. Try reducing interval or dimensions.',
          })
        );
      })
    );

    await FactsService.fetch(TestRequest).catch((response: NaviAdapterError) => {
      assert.ok(true, 'A request error falls into the promise catch block');
      assert.equal(
        response.details[0],
        'Result set too large. Try reducing interval or dimensions.',
        'error is passed to catch block'
      );
    });

    // Return an error string
    this.server.use(
      rest.get(`${HOST}/v1/data/table1/grain1/d1;show=id/d2;show=id/`, (req, res, ctx) => {
        return res(ctx.status(500), ctx.text('Server Error'));
      })
    );

    await FactsService.fetch(TestRequest).catch((response: NaviAdapterError) => {
      assert.ok(true, 'A request error falls into the promise catch block');
      assert.equal(response.details[0], 'Server Error', 'String error extracted');
    });

    await FactsService.fetch({ ...TestRequest, filters: [] }).catch((response: NaviAdapterError) => {
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

    const service = assertRequest((_request, options) => {
      assert.equal(options?.page, 3, 'fetchNext calls fetch with updated options');
    });

    const response = new NaviFactResponse(nullInjector, {
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

    await service.fetchNext(response, request);

    //@ts-ignore
    response.meta.pagination.currentPage = 3;
    assert.equal(
      await service.fetchNext(response, request),
      null,
      'fetchNext returns null when the last page is reached'
    );
  });

  test('fetchPrevious', async function (assert) {
    assert.expect(2);

    const service = assertRequest((_request, options) => {
      assert.equal(options?.page, 1, 'fetchPrevious calls fetch with updated options');
    });

    const response = new NaviFactResponse(nullInjector, {
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

    await service.fetchPrevious(response, request);

    //@ts-ignore
    response.meta.pagination.currentPage = 1;
    assert.equal(
      await service.fetchPrevious(response, request),
      null,
      'fetchPrevious returns null when the first page is reached'
    );
  });
});

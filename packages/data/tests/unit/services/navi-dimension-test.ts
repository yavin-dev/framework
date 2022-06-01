import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import GraphQLScenario from 'navi-data/mirage/scenarios/elide-one';
import { taskFor } from 'ember-concurrency-ts';
import config from 'ember-get-config';
import EmberObject from '@ember/object';
import DimensionMetadataModel, { DimensionColumn } from 'navi-data/models/metadata/dimension';
import NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import type NaviDimensionAdapter from 'navi-data/adapters/dimensions/interface';
import type { TestContext as Context } from 'ember-test-helpers';
import type { DimensionFilter } from 'navi-data/adapters/dimensions/interface';
import type NaviDimensionService from 'navi-data/services/navi-dimension';
import type { Options } from 'navi-data/adapters/dimensions/interface';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { Server } from 'miragejs';
import type { AsyncQueryResponse } from 'navi-data/adapters/facts/interface';
import type NaviDimensionSerializer from 'navi-data/serializers/dimensions/interface';
import type { ResponseV1 } from 'navi-data/serializers/facts/interface';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  server: Server;
}

//Mock data source
declare module 'navi-config' {
  // eslint-disable-next-line ember/no-test-import-export
  export interface DataSourceRegistry {
    mock: BaseDataSource<'mock'>;
  }
}

module('Unit | Service | navi-dimension', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.metadataService = this.owner.lookup('service:navi-metadata');
    GraphQLScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });
  });

  test('all', async function (this: TestContext, assert) {
    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'table0.dimension0',
      'elideOne'
    ) as DimensionMetadataModel;
    const expectedDimensionModels = [
      'Awesome Concrete Table',
      'Handcrafted Concrete Mouse',
      'Handcrafted Frozen Mouse',
      'Licensed Soft Ball',
    ].map(
      (dimVal) =>
        new NaviDimensionModel(this.owner.lookup('service:client-injector'), {
          value: dimVal,
          dimensionColumn: { columnMetadata },
          suggestions: {},
        })
    );
    const all = await taskFor(service.all).perform({ columnMetadata });

    assert.deepEqual(all.values, expectedDimensionModels, '`all` gets all the unfiltered values for a dimension');
  });

  test('all - pagination - generic', async function (this: TestContext, assert) {
    assert.expect(15);
    let originalDataSources = config.navi.dataSources;
    const dataSourceType = 'mock';
    const dataSourceName = 'test-example';

    config.navi.dataSources = [
      { type: dataSourceType, uri: 'fake', name: dataSourceName, displayName: dataSourceName },
    ];

    let call = 0;
    let adapterCallback = (_call: number, _options: Options): void => undefined;
    class MockAdapter extends EmberObject implements Pick<NaviDimensionAdapter, 'all'> {
      async all(_dimension: DimensionColumn, options: Options): Promise<AsyncQueryResponse> {
        adapterCallback(call++, options);
        //@ts-expect-error - mock query response
        return Promise.resolve({});
      }
    }
    this.owner.register(`adapter:dimensions/${dataSourceType}`, MockAdapter);

    let serializerCallback = (_call: number, _options: Options): ResponseV1['meta'] => ({});
    const { owner } = this;
    class MockSerializer extends EmberObject implements NaviDimensionSerializer {
      normalize(_dimension: DimensionColumn, _rawPayload: unknown, options: Options): NaviDimensionResponse {
        const meta = serializerCallback(call++, options);
        //@ts-expect-error
        return new NaviDimensionResponse(owner, { meta: meta });
      }
    }
    this.owner.register(`serializer:dimensions/${dataSourceType}`, MockSerializer);

    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = { source: dataSourceName } as DimensionMetadataModel;

    adapterCallback = (call, options) => {
      if (call === 0) {
        assert.deepEqual(options, {}, 'No options are passed on first call');
      } else if (call === 2) {
        assert.deepEqual(
          options,
          { page: 2, perPage: 9 },
          'The service uses the pagination options returned from the fetch to get the next page'
        );
      } else if (call === 4) {
        assert.deepEqual(
          options,
          { page: 3, perPage: 9 },
          'The service uses the pagination options returned from the fetch until all pages are fetched'
        );
      } else {
        throw new Error('Adapter callback missed');
      }
    };
    serializerCallback = (call, options) => {
      if (call === 1) {
        assert.deepEqual(options, {}, 'No options are passed on first call');
        return { pagination: { currentPage: 1, rowsPerPage: 9, numberOfResults: 20 } };
      } else if (call === 3) {
        assert.deepEqual(options, { page: 2, perPage: 9 }, 'The pagination options are forwarded to the serializer');
        return { pagination: { currentPage: 2, rowsPerPage: 9, numberOfResults: 20 } };
      } else if (call === 5) {
        assert.deepEqual(options, { page: 3, perPage: 9 }, 'The pagination options are forwarded to the serializer');
        return {};
      } else {
        throw new Error('Serializer callback missed');
      }
    };
    call = 0;
    await taskFor(service.all).perform({ columnMetadata });
    assert.strictEqual(call, 6, 'It took 3 calls to adapter/serializer to page through all the data');

    adapterCallback = (call, options) => {
      if (call === 0) {
        assert.deepEqual(options, {}, 'No options are passed on first call');
      } else {
        throw new Error('Adapter callback missed');
      }
    };
    serializerCallback = (call, options) => {
      if (call === 1) {
        assert.deepEqual(options, {}, 'No options are passed on first call');
        return {};
      } else {
        throw new Error('Serializer callback missed');
      }
    };
    call = 0;
    await taskFor(service.all).perform({ columnMetadata });
    assert.strictEqual(
      call,
      2,
      'The service called adapter and serializer then stopped because no pagination options were returned'
    );

    adapterCallback = (call, options) => {
      if (call === 0) {
        assert.deepEqual(options, { page: 1, perPage: 4 }, 'Page and perPage are present');
      } else if (call === 2) {
        assert.deepEqual(options, { page: 2, perPage: 4 }, 'The next page is fetched using original pageSize');
      } else {
        throw new Error('Adapter callback missed');
      }
    };
    serializerCallback = (call, options) => {
      if (call === 1) {
        assert.deepEqual(options, { page: 1, perPage: 4 }, 'Page and perPage are present');
        return { pagination: { currentPage: 1, rowsPerPage: 4, numberOfResults: 5 } };
      } else if (call === 3) {
        assert.deepEqual(options, { page: 2, perPage: 4 }, 'The next page is fetched using original pageSize');
        return {};
      } else {
        throw new Error('Serializer callback missed');
      }
    };
    call = 0;
    await taskFor(service.all).perform({ columnMetadata }, { perPage: 4, page: 1 });
    assert.strictEqual(call, 4, 'It took 2 calls to adapter/serializer to page through all the data');

    config.navi.dataSources = originalDataSources;
  });

  test('all - pagination - elide', async function (this: TestContext, assert) {
    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'table0.dimension0',
      'elideOne'
    ) as DimensionMetadataModel;
    const all = await taskFor(service.all).perform({ columnMetadata });

    assert.strictEqual(all.values.length, 4, 'There are 4 results');
    assert.strictEqual(
      //@ts-expect-error -- the type does not expect a length property
      this.server.db.elideAsyncQueries.length,
      1,
      'Only one asyncQueries is created because response fits in one page'
    );
    this.server.db.elideAsyncQueries.remove();

    const allPageBy1 = await taskFor(service.all).perform({ columnMetadata }, { perPage: 1 });
    assert.strictEqual(
      //@ts-expect-error -- the type does not expect a length property
      this.server.db.elideAsyncQueries.length,
      4,
      'Four asyncQueries are created because the page size is 1 and there are 4 results'
    );
    assert.deepEqual(allPageBy1.values, all.values, '`all` with paging gets the same values as without');
  });

  test('all - pagination - fili', async function (this: TestContext, assert) {
    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });
    const columnMetadata = this.metadataService.getById('dimension', 'age', 'bardOne') as DimensionMetadataModel;

    let dataRequestsCount = 0;
    this.server.pretender.handledRequest = (_, url) => {
      if (url.includes('/v1/dimensions')) {
        dataRequestsCount++;
      }
    };
    const all = await taskFor(service.all).perform({ columnMetadata });

    assert.strictEqual(all.values.length, 13, 'There are 13 results');
    assert.strictEqual(dataRequestsCount, 1, 'Only one dimension request is created because response fits in one page');

    service.clearCache();

    dataRequestsCount = 0;
    const allPageBy2 = await taskFor(service.all).perform({ columnMetadata }, { perPage: 1, page: 1 });
    assert.strictEqual(allPageBy2.values.length, 13, 'There are 13 results');
    assert.strictEqual(
      dataRequestsCount,
      13,
      '13 dimension requests are created because the page size is 1 and there are 13 results'
    );
  });

  test('all - enum', async function (this: TestContext, assert) {
    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'table0.dimension1',
      'elideOne'
    ) as DimensionMetadataModel;
    const expectedDimensionModels = [
      'Practical Frozen Fish (enum)',
      'Practical Concrete Chair (enum)',
      'Awesome Steel Chicken (enum)',
      'Tasty Fresh Towels (enum)',
      'Intelligent Steel Pizza (enum)',
    ].map(
      (dimVal) =>
        new NaviDimensionModel(this.owner.lookup('service:client-injector'), {
          value: dimVal,
          dimensionColumn: { columnMetadata },
          suggestions: {},
        })
    );
    const all = await taskFor(service.all).perform({ columnMetadata });

    assert.deepEqual(
      all.values,
      expectedDimensionModels,
      '`all` gets all the unfiltered values for a dimension with enum values'
    );
  });

  test('find', async function (this: TestContext, assert) {
    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'table0.dimension0',
      'elideOne'
    ) as DimensionMetadataModel;
    const findValues = ['Awesome Plastic Fish', 'Refined Fresh Bacon'];
    const filters: DimensionFilter[] = [{ operator: 'in', values: findValues }];
    const expectedDimensionModels = findValues.map(
      (dimVal) =>
        new NaviDimensionModel(this.owner.lookup('service:client-injector'), {
          value: dimVal,
          dimensionColumn: { columnMetadata },
          suggestions: {},
        })
    );
    const find = await taskFor(service.find).perform({ columnMetadata }, filters);
    assert.deepEqual(
      find.values,
      expectedDimensionModels,
      '`find` gets all the values for a dimension that match the specified filter'
    );
  });

  test('search', async function (this: TestContext, assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const columnMetadata = this.metadataService.getById(
      'dimension',
      'table0.dimension0',
      'elideOne'
    ) as DimensionMetadataModel;
    const search = await taskFor(service.search).perform({ columnMetadata }, 'plastic');
    const expectedDimensionModels = ['Awesome Plastic Fish', 'Licensed Plastic Pants'].map(
      (dimVal) =>
        new NaviDimensionModel(this.owner.lookup('service:client-injector'), {
          value: dimVal,
          dimensionColumn: { columnMetadata },
          suggestions: {},
        })
    );
    assert.deepEqual(
      search.values,
      expectedDimensionModels,
      '`search` gets all the values for a dimension that contain the query case insensitively'
    );

    const noResultSearch = await taskFor(service.search).perform({ columnMetadata }, 'fuggedaboutit');
    assert.deepEqual(noResultSearch.values, [], 'Empty array is returned when no values are found');
  });

  test('caching', async function (this: TestContext, assert) {
    assert.expect(3);

    const service = this.owner.lookup('service:navi-dimension') as NaviDimensionService;
    const metadataService = this.metadataService; // makes typescript happy
    await metadataService.loadMetadata({ dataSourceName: 'bardOne' });

    // runs appropriate task in the navi-dimension service for given dimension ID and set of params
    async function runServiceTask(dimensionID: string, searchParams?: string) {
      const columnMetadata = metadataService.getById('dimension', dimensionID, 'bardOne') as DimensionMetadataModel;
      if (searchParams) {
        return await taskFor(service.search).perform({ columnMetadata }, searchParams);
      }
      return await taskFor(service.all).perform({ columnMetadata });
    }

    // mock endpoint and keep track of number of calls to it
    let dataRequestsCount = 0;
    this.server.pretender.handledRequest = (_, url) => {
      if (url.includes('/v1/dimensions')) {
        dataRequestsCount++;
      }
    };

    // setup cache
    await runServiceTask('age');
    await runServiceTask('browser');
    await runServiceTask('currency');
    await runServiceTask('gender');
    await runServiceTask('lang');
    assert.deepEqual(dataRequestsCount, 5, "'all' task successfully called 5 times");

    // cached queries do not make another call
    await runServiceTask('age');
    await runServiceTask('currency');
    await runServiceTask('lang');
    assert.deepEqual(dataRequestsCount, 5, 'data fetching tasks are not called when items are cached');

    // calling 'search' after calling 'all'
    await runServiceTask('browser', '1');
    assert.deepEqual(dataRequestsCount, 5, "doesn't trigger data fetch");
  });
});

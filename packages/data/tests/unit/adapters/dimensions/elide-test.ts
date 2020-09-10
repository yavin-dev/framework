import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ElideDimensionAdapter from 'navi-data/adapters/dimensions/elide';
import { DimensionColumn } from 'navi-data/adapters/dimensions/interface';
import { RequestV2, AsyncQueryResponse, QueryStatus, RequestOptions } from 'navi-data/adapters/facts/interface';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { TestContext as Context } from 'ember-test-helpers';
import ElideOneScenario from 'navi-data/mirage/scenarios/elide-one';
import ElideTwoScenario from 'navi-data/mirage/scenarios/elide-two';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Server } from 'miragejs';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  server: Server;
}

const fakeResponse: AsyncQueryResponse = {
  asyncQuery: { edges: [{ node: { id: '1', query: 'foo', status: QueryStatus.COMPLETE, result: null } }] }
};

module('Unit | Adapter | Dimensions | Elide', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    this.metadataService = this.owner.lookup('service:navi-metadata');
    ElideOneScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });

    //reset the db so we can set the db up for the elideTwo scenario
    this.server.db.emptyData();
    //reset the indexes used by the mirage factories
    //@ts-ignore
    this.server.factorySequences = {};
    ElideTwoScenario(this.server);
    await this.metadataService.loadMetadata({ dataSourceName: 'elideTwo' });
  });

  test('find', async function(this: TestContext, assert) {
    assert.expect(2);

    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension1',
        'elideTwo'
      ) as DimensionMetadataModel,
      parameters: {
        foo: 'bar'
      }
    };

    const originalFactAdapter = this.owner.factoryFor('adapter:facts/elide').class;
    const expectedRequest: RequestV2 = {
      columns: [{ field: 'table0.dimension1', parameters: { foo: 'bar' }, type: 'dimension' }],
      filters: [
        {
          field: 'table0.dimension1',
          parameters: { foo: 'bar' },
          type: 'dimension',
          operator: 'in',
          values: ['v1', 'v2']
        }
      ],
      sorts: [],
      table: 'table0',
      limit: null,
      dataSource: 'elideTwo',
      requestVersion: '2.0'
    };
    const expectedOptions = {
      timeout: 30000,
      page: 6,
      perPage: 24
    };

    class TestAdapter extends originalFactAdapter {
      fetchDataForRequest(request: RequestV2, options?: RequestOptions) {
        assert.deepEqual(request, expectedRequest, 'Correct request is sent to elide fact adapter for find');

        assert.deepEqual(options, expectedOptions, 'Options are passed through to the fact adapter');
        return Promise.resolve(fakeResponse);
      }
    }
    this.owner.unregister('adapter:facts/elide');
    this.owner.register('adapter:facts/elide', TestAdapter);
    const adapter = this.owner.lookup('adapter:dimensions/elide');

    await adapter.find(TestDimensionColumn, [{ operator: 'in', values: ['v1', 'v2'] }], expectedOptions);
  });

  test('all', async function(this: TestContext, assert) {
    assert.expect(2);

    const originalFactAdapter = this.owner.factoryFor('adapter:facts/elide').class;
    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension1',
        'elideTwo'
      ) as DimensionMetadataModel,
      parameters: {
        foo: 'baz'
      }
    };
    const expectedRequest: RequestV2 = {
      columns: [{ field: 'table0.dimension1', parameters: { foo: 'baz' }, type: 'dimension' }],
      filters: [],
      sorts: [],
      table: 'table0',
      limit: null,
      dataSource: 'elideTwo',
      requestVersion: '2.0'
    };
    const expectedOptions = {
      timeout: 30000
    };
    class TestAdapter extends originalFactAdapter {
      fetchDataForRequest(request: RequestV2, options?: RequestOptions) {
        assert.deepEqual(
          request,
          expectedRequest,
          'Correct request is sent to elide fact adapter for all dimension values'
        );

        assert.deepEqual(options, expectedOptions, 'Options are passed through to the fact adapter');
        return Promise.resolve(fakeResponse);
      }
    }

    this.owner.unregister('adapter:facts/elide');
    this.owner.register('adapter:facts/elide', TestAdapter);

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');
    await adapter.all(TestDimensionColumn, expectedOptions);
  });

  test('search', async function(this: TestContext, assert) {
    assert.expect(2);

    const originalFactAdapter = this.owner.factoryFor('adapter:facts/elide').class;
    const TestDimensionColumn: DimensionColumn = {
      columnMetadata: this.metadataService.getById(
        'dimension',
        'table0.dimension2',
        'elideOne'
      ) as DimensionMetadataModel,
      parameters: {
        bang: 'boom'
      }
    };
    const query = 'something';

    const expectedRequest: RequestV2 = {
      columns: [{ field: 'table0.dimension2', parameters: { bang: 'boom' }, type: 'dimension' }],
      filters: [
        {
          field: 'table0.dimension2',
          parameters: { bang: 'boom' },
          type: 'dimension',
          operator: 'eq',
          values: ['*something*']
        }
      ],
      sorts: [],
      table: 'table0',
      limit: null,
      dataSource: 'elideOne',
      requestVersion: '2.0'
    };
    const expectedOptions = {
      timeout: 30000,
      perPage: 48
    };

    class TestAdapter extends originalFactAdapter {
      fetchDataForRequest(request: RequestV2, options?: RequestOptions) {
        assert.deepEqual(
          request,
          expectedRequest,
          'Correct request is sent to elide fact adapter for search of dimension values'
        );

        assert.deepEqual(options, expectedOptions, 'Options are passed through to the fact adapter');
        return Promise.resolve(fakeResponse);
      }
    }

    this.owner.unregister('adapter:facts/elide');
    this.owner.register('adapter:facts/elide', TestAdapter);

    const adapter: ElideDimensionAdapter = this.owner.lookup('adapter:dimensions/elide');
    await adapter.search(TestDimensionColumn, query, expectedOptions);
  });
});

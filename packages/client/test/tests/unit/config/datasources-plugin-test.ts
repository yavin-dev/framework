import { DataSourcePluginConfig } from '@yavin/client/config/datasource-plugins';
import { ClientConfig } from '@yavin/client/config/datasources';
import { Injector } from '@yavin/client/models/native-with-create';
import { module, test } from 'qunit';

const mockDataSource = { name: 'mockInstance', type: 'mock', displayName: 'Mocked', uri: 'mock://' };

//@ts-expect-error - partial config
const mockConfig = new ClientConfig({ dataSources: [mockDataSource] });
const mockInjector = {
  lookup: (type: string) => (type === 'config' ? mockConfig : undefined),
} as unknown as Injector;
let callCount: Record<string, number>;
let PluginConfig: DataSourcePluginConfig;

module('Unit | Config | Datasource Plugins', function (hooks) {
  hooks.beforeEach(function (assert) {
    callCount = {};
    const returnMock = (mock: string) => {
      callCount[mock] = 0;
      return (injector: Injector) => {
        callCount[mock] = callCount[mock] + 1;
        assert.strictEqual(injector, mockInjector, 'injector is passed in to create function');
        return mock;
      };
    };
    PluginConfig = new DataSourcePluginConfig(mockInjector, {
      mock: {
        //@ts-expect-error - mock dimensions plugin
        dimensions: { adapter: returnMock('mock:d:a'), serializer: returnMock('mock:d:s') },
        //@ts-expect-error - mock facts plugin
        facts: { adapter: returnMock('mock:f:a'), serializer: returnMock('mock:f:s') },
        //@ts-expect-error - mock metadata plugin
        metadata: { adapter: returnMock('mock:m:a'), serializer: returnMock('mock:m:s') },
      },
    });
  });

  test('adapterFor', function (assert) {
    assert.expect(6);
    assert.equal(
      PluginConfig.adapterFor('mockInstance', 'facts'),
      'mock:f:a',
      'the facts adapter for mockInstance is instantiated'
    );
    assert.equal(
      PluginConfig.adapterFor('mockInstance', 'metadata'),
      'mock:m:a',
      'the metadata adapter for mockInstance is instantiated'
    );
    assert.equal(
      PluginConfig.adapterFor('mockInstance', 'dimensions'),
      'mock:d:a',
      'the dimensions adapter for mockInstance is instantiated'
    );
  });

  test('serializerFor', function (assert) {
    assert.expect(6);
    assert.equal(
      PluginConfig.serializerFor('mockInstance', 'facts'),
      'mock:f:s',
      'the facts serializer for mockInstance is instantiated'
    );
    assert.equal(
      PluginConfig.serializerFor('mockInstance', 'metadata'),
      'mock:m:s',
      'the metadata serializer for mockInstance is instantiated'
    );
    assert.equal(
      PluginConfig.serializerFor('mockInstance', 'dimensions'),
      'mock:d:s',
      'the dimensions serializer for mockInstance is instantiated'
    );
  });

  test('lazy lookups', function (assert) {
    assert.expect(5);
    const mockFactsAdapter = 'mock:f:a';
    assert.strictEqual(callCount[mockFactsAdapter], 0, 'No instances are created until looked up');
    const first = PluginConfig.adapterFor('mockInstance', 'facts') as unknown as string;
    assert.strictEqual(callCount[mockFactsAdapter], 1, 'An instance is created');
    const second = PluginConfig.adapterFor('mockInstance', 'facts') as unknown as string;
    assert.strictEqual(first, second, 'The same instance is returned on subsequent calls');
    assert.strictEqual(callCount[mockFactsAdapter], 1, 'No new instances are created');
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import type YavinClientService from 'navi-data/services/yavin-client';
import type { YavinClientConfig } from '@yavin/client/config/datasources';
import { DataSourcePlugins } from '@yavin/client/config/datasource-plugins';

let YavinClient: YavinClientService;
module('Unit | Service | yavin-client', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    YavinClient = this.owner.lookup('service:yavin-client');
  });

  test('service plugins', function (assert) {
    assert.strictEqual(
      YavinClient.facts,
      this.owner.lookup('service:navi-facts'),
      'the facts service can be overriden'
    );
    assert.strictEqual(
      YavinClient.metadata,
      this.owner.lookup('service:navi-metadata'),
      'the metadata service can be overriden'
    );
    assert.strictEqual(
      YavinClient.dimensions,
      this.owner.lookup('service:navi-dimension'),
      'the dimension service can be overriden'
    );
  });

  test('client config', function (assert) {
    assert.expect(6);
    const { clientConfig } = YavinClient;
    Object.keys(clientConfig).forEach((key: keyof YavinClientConfig) => {
      assert.deepEqual(clientConfig[key], config.navi[key], `The ${key} config is equal`);
    });
  });

  test('plugin config', function (assert) {
    assert.expect(24);
    const { pluginConfig } = YavinClient;
    const services: (keyof DataSourcePlugins)[] = ['facts', 'metadata', 'dimensions'];
    const equals = <const>[
      ['bardOne', 'bardTwo'], // same dataSource types return same objects
      ['bardOne', 'bardOne'], // adapters/serializers return the same instance for same dataSource
      ['elideOne', 'elideTwo'], // same dataSource types return same objects
    ];
    equals.forEach(([left, right]) => {
      services.forEach((service) => {
        assert.strictEqual(
          pluginConfig.adapterFor(left, service),
          pluginConfig.adapterFor(right, service),
          `the ${left} and ${right} ${service} adapters are equal`
        );

        assert.strictEqual(
          pluginConfig.serializerFor(left, service),
          pluginConfig.serializerFor(right, service),
          `the ${left} and ${right} ${service} serializers are equal`
        );
      });
    });

    services.forEach((service) => {
      assert.notEqual(
        pluginConfig.adapterFor('bardOne', service),
        pluginConfig.adapterFor('elideOne', service),
        `the bardOne and elideOne data sources return different ${service} adapters`
      );
      assert.notEqual(
        pluginConfig.serializerFor('bardOne', service),
        pluginConfig.serializerFor('elideOne', service),
        `the bardOne and elideOne data sources return different ${service} serializers`
      );
    });
  });
});

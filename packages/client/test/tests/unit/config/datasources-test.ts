import { module, test } from 'qunit';
import { ClientConfig } from '@yavin/client/config/datasources';
import { mockConfig } from '../../helpers/config';

const configJson = mockConfig();
let clientConfig: ClientConfig;

module('Unit | Config | Config', function (hooks) {
  hooks.beforeEach(function () {
    clientConfig = new ClientConfig(configJson);
  });
  test('getDataSource correctly returns datasource object', function (assert) {
    assert.deepEqual(
      clientConfig.getDataSource('bardOne'),
      configJson.dataSources.find((s) => s.name === 'bardOne'),
      'datasource is fetched from config'
    );
    assert.deepEqual(
      clientConfig.getDataSource('bardTwo'),
      configJson.dataSources.find((s) => s.name === 'bardTwo'),
      'Other datasource is fetched from config'
    );
    assert.deepEqual(
      clientConfig.getDataSource('elideOne.DemoNamespace'),
      {
        name: 'elideOne.DemoNamespace',
        displayName: 'Demo Namespace',
        description: 'Demo Namespace Description',
        type: 'elide',
        uri: 'https://data.naviapp.io/graphql',
      },
      'Datasource with namespace is fetched from config'
    );

    assert.throws(
      () => {
        //@ts-expect-error - no args
        clientConfig.getDataSource();
      },
      /getDataSource should be given a data source name to lookup/,
      'Data source name must be provided'
    );
    assert.throws(
      () => {
        clientConfig.getDataSource('wowie');
      },
      /Datasource "wowie" should be configured in the navi environment/,
      'Assertion fails when nonexistent datasource is requested'
    );
    assert.throws(
      () => {
        clientConfig.getDataSource('elideOne.wowie');
      },
      /Namespace "wowie" should be configured for datasource "elideOne" in the navi environment/,
      'Assertion fails when nonexistent namespace is requested'
    );
  });

  test('getDefaultDataSource returns correct source object depending on configuration', function (assert) {
    const defaultDataSource = configJson.defaultDataSource;

    assert.deepEqual(
      clientConfig.getDefaultDataSource(),
      configJson.dataSources.find((d) => d.name === defaultDataSource),
      'Gets the default datasource that is configured'
    );

    clientConfig.defaultDataSource = undefined;

    assert.equal(
      clientConfig.getDefaultDataSource(),
      configJson.dataSources[0],
      'uses first configured datasource as default datasource with no default datasource configured'
    );
  });

  test('configHost gets correct source object uri depending on configuration', function (assert) {
    assert.equal(
      clientConfig.configHost({ dataSourceName: 'bardOne' }),
      'https://data.naviapp.io',
      'bardOne host is correctly configured'
    );
    assert.equal(
      clientConfig.configHost({ dataSourceName: 'bardTwo' }),
      'https://data2.naviapp.com',
      'bardTwo is correctly configured'
    );
    assert.equal(
      clientConfig.configHost({}),
      'https://data.naviapp.io',
      'default host is correctly returned if datasource is not specified'
    );

    clientConfig.defaultDataSource = undefined;
    assert.equal(
      clientConfig.configHost({}),
      'https://data.naviapp.io',
      'returns first host if default is unspecified'
    );
  });
});

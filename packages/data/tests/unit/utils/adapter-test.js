import { module, test } from 'qunit';
import config from 'ember-get-config';
import { set } from '@ember/object';
import { getDefaultDataSourceName, configHost, getDataSource, getDefaultDataSource } from 'navi-data/utils/adapter';

module('Unit - Utils - Adapter Utils', function () {
  test('getDataSource correctly returns datasource object', function (assert) {
    const {
      navi: { dataSources },
    } = config;

    assert.deepEqual(
      getDataSource('bardOne'),
      dataSources.find((s) => s.name === 'bardOne'),
      'datasource is fetched from config'
    );
    assert.deepEqual(
      getDataSource('bardTwo'),
      dataSources.find((s) => s.name === 'bardTwo'),
      'Other datasource is fetched from config'
    );

    assert.throws(
      () => {
        getDataSource();
      },
      /getDataSource should be given a data source name to lookup/,
      'Data source name must be provided'
    );
    assert.throws(
      () => {
        getDataSource('wowie');
      },
      /Datasource wowie should be configured in the navi environment/,
      'Assertion fails when nonexistent datasource is requested'
    );
  });

  test('getDefaultDataSource returns correct source object depending on configuration', function (assert) {
    const {
      navi: { defaultDataSource, dataSources },
    } = config;

    assert.deepEqual(
      getDefaultDataSource(),
      dataSources.find((d) => d.name === defaultDataSource),
      'Gets the default datasource that is configured'
    );

    const oldDefault = defaultDataSource;
    set(config, 'navi.defaultDataSource', undefined);

    assert.equal(
      getDefaultDataSource(),
      dataSources[0],
      'uses first configured datasource as default datasource with no default datasource configured'
    );
    set(config, 'navi.defaultDataSource', oldDefault);
  });

  test('getDefaultDataSourceName gets correct source object name depending on configuration', function (assert) {
    assert.equal(getDefaultDataSourceName(), 'bardOne', 'Gets the default datasource that is configured');

    const oldDefault = config.navi.defaultDataSource;
    set(config, 'navi.defaultDataSource', undefined);

    assert.equal(getDefaultDataSourceName(), 'bardOne', 'uses first configured datasource as default datasourcename');
    set(config, 'navi.defaultDataSource', oldDefault);
  });

  test('configHost gets correct source object depending on configuration', function (assert) {
    assert.equal(
      configHost({ dataSourceName: 'bardOne' }),
      'https://data.naviapp.io',
      'bardOne host is correctly configured'
    );
    assert.equal(
      configHost({ dataSourceName: 'bardTwo' }),
      'https://data2.naviapp.com',
      'bardTwo is correctly configured'
    );
    assert.equal(
      configHost({}),
      'https://data.naviapp.io',
      'default host is correctly returned if datasource is not specified'
    );

    const oldDefault = config.navi.defaultDataSource;
    set(config, 'navi.defaultDataSource', undefined);
    assert.equal(configHost({}), 'https://data.naviapp.io', 'returns first host if default is unspecified');

    set(config, 'navi.defaultDataSource', oldDefault);
  });
});

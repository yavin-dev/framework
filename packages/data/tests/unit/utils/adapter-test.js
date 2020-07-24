import { module, test } from 'qunit';
import config from 'ember-get-config';
import { set } from '@ember/object';
import { getDefaultDataSourceName, configHost, getDataSource } from 'navi-data/utils/adapter';

module('Unit - Utils - Adapter Utils', function() {
  test('getDataSource correctly returns datasource object', function(assert) {
    const {
      navi: { dataSources, defaultDataSource }
    } = config;
    const defaultDataSourceObj = defaultDataSource
      ? dataSources.find(d => d.name === defaultDataSource)
      : dataSources[0];

    assert.deepEqual(
      getDataSource('dummy'),
      dataSources.find(s => s.name === 'dummy'),
      'datasource is fetched from config'
    );
    assert.deepEqual(
      getDataSource('blockhead'),
      dataSources.find(s => s.name === 'blockhead'),
      'Other datasource is fetched from config'
    );

    assert.deepEqual(getDataSource(), defaultDataSourceObj, 'Default data source is returned when no name is given');
    assert.deepEqual(
      getDataSource('nonexistent'),
      defaultDataSourceObj,
      'Default data source is returned when invalid name is given'
    );
  });

  test('getDefaultDataSourceName gets correct source object depending on configuration', function(assert) {
    assert.equal(getDefaultDataSourceName(), 'dummy', 'Gets the default datasource that is configured');

    const oldDefault = config.navi.defaultDataSource;
    set(config, 'navi.defaultDataSource', undefined);

    assert.equal(getDefaultDataSourceName(), 'dummy', 'uses first configured datasource as default datasourcename');
    set(config, 'navi.defaultDataSource', oldDefault);
  });

  test('configHost gets correct source object depending on configuration', function(assert) {
    assert.equal(
      configHost({ dataSourceName: 'dummy' }),
      'https://data.naviapp.io',
      'dummy host is correctly configured'
    );
    assert.equal(
      configHost({ dataSourceName: 'blockhead' }),
      'https://data2.naviapp.com',
      'blockhead is correctly configured'
    );
    assert.equal(
      configHost({ dataSourceName: 'foobar' }),
      'https://data.naviapp.io',
      'unconfigured host returns default'
    );
    assert.equal(
      configHost({}),
      'https://data.naviapp.io',
      'dummy host is correctly returned if datasource is not specified'
    );

    const oldDefault = config.navi.defaultDataSource;
    set(config, 'navi.defaultDataSource', undefined);
    assert.equal(configHost({}), 'https://data.naviapp.io', 'returns first host if default is unspcified');

    set(config, 'navi.defaultDataSource', oldDefault);
  });
});

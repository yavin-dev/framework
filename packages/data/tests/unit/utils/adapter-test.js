import { module, test } from 'qunit';
import config from 'ember-get-config';
import { set } from '@ember/object';
import { getDefaultDataSourceName, configHost, getDataSource, getDefaultDataSource } from 'navi-data/utils/adapter';

module('Unit - Utils - Adapter Utils', function() {
  test('getDataSource correctly returns datasource object', function(assert) {
    const {
      navi: { dataSources }
    } = config;

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

  test('getDefaultDataSource returns correct source object depending on configuration', function(assert) {
    const {
      navi: { defaultDataSource, dataSources }
    } = config;

    assert.deepEqual(
      getDefaultDataSource(),
      dataSources.find(d => d.name === defaultDataSource),
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

  test('getDefaultDataSourceName gets correct source object name depending on configuration', function(assert) {
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
      configHost({}),
      'https://data.naviapp.io',
      'default host is correctly returned if datasource is not specified'
    );

    const oldDefault = config.navi.defaultDataSource;
    set(config, 'navi.defaultDataSource', undefined);
    assert.equal(configHost({}), 'https://data.naviapp.io', 'returns first host if default is unspecified');

    set(config, 'navi.defaultDataSource', oldDefault);
  });

  test('queryStrForField', function(assert) {
    assert.equal(
      queryStrForField('foo', { bar: 'baz' }),
      'foo(bar: baz)',
      'Field with parameter is formatted correctly'
    );
    assert.equal(
      queryStrForField('foo', { bar: 'baz', bang: 'boom' }),
      'foo(bar: baz,bang: boom)',
      'Field with multiple parameters is formatted correctly'
    );
    assert.equal(queryStrForField('foo'), 'foo', 'Name is returned for field with no parameters');
  });
});

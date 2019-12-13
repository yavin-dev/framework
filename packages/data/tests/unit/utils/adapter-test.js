import { module, test } from 'qunit';
import config from 'ember-get-config';
import { set } from '@ember/object';
import { getHost, getDefaultDataSourceName, configHost } from 'navi-data/utils/adapter';

module('Unit - Utils - Adapter Utils', function() {
  test('getHost gets correct host depending on configuration', function(assert) {
    assert.equal(getHost('dummy'), 'https://data.naviapp.io', 'dummy host is fetched correctly');
    assert.equal(getHost('blockhead'), 'https://data2.naviapp.com', 'blockhead host is fetched correctly');
    assert.equal(getHost('foo'), 'https://data.naviapp.io', 'unknown host grabs first one');
  });

  test('getDefaultDatasource gets correct source object depending on configuration', function(assert) {
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
      'blockhead is correclty configured'
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

import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from '../../../initializers/config';
import { module, test } from 'qunit';
import config from 'navi-app/config/environment';

let registry, application;

module('Unit | Initializers | config', function(hooks) {
  hooks.beforeEach(function() {
    run(function() {
      application = Application.create();
      registry = application.registry;
      application.deferReadiness();
    });
  });

  test('App settings', function(assert) {
    assert.expect(3);

    initialize(registry, application);

    assert.deepEqual(config.navi.user, window.NAVI_APP.user, 'Navi user has been configured');

    assert.deepEqual(config.navi.dataSources, window.NAVI_APP.dataSources, 'Navi api host has been configured');

    assert.deepEqual(
      config.navi.appPersistence,
      window.NAVI_APP.appPersistence,
      'Navi persistence api host has been configured'
    );
  });
});

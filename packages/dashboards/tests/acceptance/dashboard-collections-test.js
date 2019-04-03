import { findAll, visit } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Mirage from 'ember-cli-mirage';

let Application, OriginalLoggerError, OriginalTestAdapterException;

module('Acceptance | Dashboard Collections', function(hooks) {
  hooks.beforeEach(function() {
    Application = startApp();
    wait();
  });

  hooks.afterEach(function() {
    server.shutdown();
    run(Application, 'destroy');
  });

  test('dashobard-collection success', async function(assert) {
    assert.expect(2);

    await visit('/dashboardCollections/1');
    assert.notOk(!!findAll('.error').length, 'Error message not present when route is successfully loaded');

    assert.ok(
      !!findAll('.navi-collection').length,
      'the dashboard collection component is rendered when route is successfully loaded'
    );
  });

  test('dashboard-collection error', async function(assert) {
    assert.expect(2);

    // Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
    OriginalLoggerError = Ember.Logger.error;
    OriginalTestAdapterException = Ember.Test.adapter.exception;
    Ember.Logger.error = function() {};
    Ember.Test.adapter.exception = function() {};

    server.get('/dashboardCollections/:id', () => {
      return new Mirage.Response(500);
    });

    await visit('/dashboardCollections/1');
    assert.ok(!!findAll('.error').length, 'Error message is present when route encounters an error');

    assert.notOk(!!findAll('.navi-collection').length, 'Navi dashboard collection component is not rendered');

    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });

  test('dashboard-collection loading', async function(assert) {
    assert.expect(1);

    await visit('/dashboardCollections/loading');

    assert.ok(!!findAll('.loader-container').length, 'Loader is present when visiting loading route');
  });
});

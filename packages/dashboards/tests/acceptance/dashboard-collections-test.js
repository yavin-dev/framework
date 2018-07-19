import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Mirage from 'ember-cli-mirage';

let Application, OriginalLoggerError, OriginalTestAdapterException;

module('Acceptance | Dashboard Collections', {
  beforeEach: function() {
    Application = startApp();
    wait();
  },

  afterEach: function() {
    server.shutdown();
    Ember.run(Application, 'destroy');
  }
});

test('dashobard-collection success', function(assert) {
  assert.expect(2);

  visit('/dashboardCollections/1');
  andThen(function() {
    assert.notOk(
      !!find('.error').length,
      'Error message not present when route is successfully loaded'
    );

    assert.ok(
      !!find('.navi-collection').length,
      'the dashboard collection component is rendered when route is successfully loaded'
    );
  });
});

test('dashboard-collection error', function(assert) {
  assert.expect(2);

  // Allow testing of errors - https://github.com/emberjs/ember.js/issues/11469
  OriginalLoggerError = Ember.Logger.error;
  OriginalTestAdapterException = Ember.Test.adapter.exception;
  Ember.Logger.error = function() {};
  Ember.Test.adapter.exception = function() {};

  server.get('/dashboardCollections/:id', () => {
    return new Mirage.Response(500);
  });

  visit('/dashboardCollections/1');
  andThen(function() {
    assert.ok(
      !!find('.error').length,
      'Error message is present when route encounters an error'
    );

    assert.notOk(
      !!find('.navi-collection').length,
      'Navi dashboard collection component is not rendered'
    );

    Ember.Logger.error = OriginalLoggerError;
    Ember.Test.adapter.exception = OriginalTestAdapterException;
  });
});

test('dashboard-collection loading', function(assert) {
  assert.expect(1);

  visit('/dashboardCollections/loading');

  andThen(function() {
    assert.ok(
      !!find('.loader-container').length,
      'Loader is present when visiting loading route'
    );
  });
});

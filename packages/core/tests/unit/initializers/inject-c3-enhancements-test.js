import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from 'dummy/initializers/inject-c3-enhancements';
import { module, test } from 'qunit';
import c3 from 'c3';

let App;
module('Unit | Initializer | inject c3 enhancements', function(hooks) {
  hooks.beforeEach(function() {
    run(() => {
      App = Application.create();
      App.deferReadiness();
    });
  });

  hooks.afterEach(function() {
    run(App, 'destroy');
  });

  test('function overrides', function(assert) {
    initialize(App);
    assert.notOk(c3.chart.internal.fn.isCustomX(), 'initializer injected custom method');
  });
});

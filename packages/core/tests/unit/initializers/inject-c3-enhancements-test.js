import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from 'dummy/initializers/inject-c3-enhancements';
import { module, test } from 'qunit';
import c3 from 'c3';
import destroyApp from '../../helpers/destroy-app';

module('Unit | Initializer | inject c3 enhancements', function(hooks) {
  hooks.beforeEach(function() {
    run(() => {
      this.application = Application.create();
      this.application.deferReadiness();
    });
  });

  hooks.afterEach(function() {
    destroyApp(this.application);
  });

  test('function overrides', function(assert) {
    initialize(this.application);
    assert.notOk(c3.chart.internal.fn.isCustomX(), 'initializer injected custom method');
  });
});

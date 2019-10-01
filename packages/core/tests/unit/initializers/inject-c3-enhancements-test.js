import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from 'dummy/initializers/inject-c3-enhancements';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import c3 from 'c3';

module('Unit | Initializer | inject c3 enhancements', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.TestApplication = Application.extend();
    this.TestApplication.initializer({
      name: 'c3 enhancements initializer',
      initialize
    });
    this.application = this.TestApplication.create({ autoboot: false });
  });

  hooks.afterEach(function() {
    run(this.application, 'destroy');
  });

  test('function overrides', async function(assert) {
    await this.application.boot();

    assert.notOk(c3.chart.internal.fn.isCustomX(), 'initializer injected custom method');
  });
});

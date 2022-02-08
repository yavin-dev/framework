import Application from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import visV2 from 'dummy/initializers/visualization-v2-transform';
import type { TestContext as Context } from 'ember-test-helpers';

interface TestContext extends Context {
  TestApplication: typeof Application;
  application: Application;
}

module('Unit | Initializer | visualization-v2-transform', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    class MockApplication extends Application {}
    this.TestApplication = MockApplication;
    this.TestApplication.initializer({
      name: visV2.name,
      initialize: visV2.initialize,
    });
    this.application = this.TestApplication.create({ autoboot: false });
  });

  hooks.afterEach(function () {
    run(this.application, 'destroy');
  });

  test('it works', async function (assert) {
    await this.application.boot();

    // TODO: Test that vis-v2 lookups are polymorphic but fall back to generic model
    assert.ok(true);
  });
});

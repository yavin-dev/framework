import Application from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import visV2 from 'navi-core/initializers/visualization-v2-transform';
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
    assert.expect(7);
    await this.application.boot();

    const transform = this.owner.lookup('transform:-mf-fragment$visualization$vizModelType');

    const map = {
      'line-chart': 'line-chart',
      'bar-chart': 'bar-chart',
      'goal-gauge': 'goal-gauge',
      'metric-label': 'metric-label',
      'pie-chart': 'pie-chart',
      table: 'table',
      'model-that-does-not-exist': 'visualization-v2',
    };

    Object.entries(map).forEach(([modelInputType, expectedModel]) => {
      const actualModel = transform.modelNameFor({ type: modelInputType });
      assert.strictEqual(
        actualModel,
        expectedModel,
        `${modelInputType} should map to ${expectedModel} (was ${actualModel})`
      );
    });
  });
});

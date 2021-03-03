import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Route | reports/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('reports model', function (assert) {
    assert.expect(2);

    return settled().then(() => {
      let route = this.owner.lookup('route:reports/index');

      return run(() => {
        return route.model().then((model) => {
          return model.get('reports').then((reports) => {
            assert.deepEqual(reports.mapBy('id'), ['1', '2', '4'], 'Routes model returns the reports');

            assert.deepEqual(
              reports.mapBy('title'),
              ['Hyrule News', 'Hyrule Ad&Nav Clicks', 'Report 12'],
              'Model contains user reports and favorite reports'
            );
          });
        });
      });
    });
  });
});

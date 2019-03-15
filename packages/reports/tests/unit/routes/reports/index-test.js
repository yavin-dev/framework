import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

module('Unit | Route | reports/index', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('reports model', function(assert) {
    assert.expect(2);

    return settled().then(() => {
      let route = this.owner.lookup('route:reports/index');

      return run(() => {
        return route.model().then(model => {
          return model.get('reports').then(reports => {
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

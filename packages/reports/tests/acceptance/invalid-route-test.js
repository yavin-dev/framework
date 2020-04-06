import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit, findAll, currentURL, click } from '@ember/test-helpers';
import config from 'ember-get-config';
import { clickItemFilter } from 'navi-reports/test-support/report-builder';

module('Acceptance | Navi Report | Invalid Route', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Error data request', async function(assert) {
    assert.expect(2);
    const originalFeatureFlag = config.navi.FEATURES.enableRequestPreview;
    config.navi.FEATURES.enableRequestPreview = true;

    await visit('/reports/5/view');

    await clickItemFilter('metric', 'Ad Clicks');
    await click('.navi-report__run-btn');

    assert.ok(currentURL().endsWith('/invalid'), 'We are on the edit report route');

    assert.deepEqual(
      findAll('.navi-column-config-item__name').map(e => e.textContent),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'The column config is displayed in the error route'
    );

    config.navi.FEATURES.enableRequestPreview = originalFeatureFlag;
  });
});

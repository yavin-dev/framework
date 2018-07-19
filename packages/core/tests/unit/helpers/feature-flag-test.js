import { featureFlag } from '../../../helpers/feature-flag';
import { module, test } from 'qunit';
import config from 'ember-get-config';

module('Unit | Helper | feature flag');

test('flag value is returned', function(assert) {
  let originalFeatures = config.navi.FEATURES;

  config.navi.FEATURES = {};
  assert.equal(
    featureFlag('dashboards'),
    false,
    'False value is returned when the feature flag is not defined'
  );

  config.navi.FEATURES = { dashboards: true };
  assert.equal(
    featureFlag('dashboards'),
    true,
    'Feature flag value is returned'
  );

  config.navi.FEATURES = originalFeatures;
});

import Ember from 'ember';
import ExtendedMetadataMixin from 'navi-data/mixins/extended-metadata';
import { moduleFor, test } from 'ember-qunit';
import Pretender from 'pretender';

import metadataRoutes, { MetricOne } from '../../helpers/metadata-routes';

const { get, getOwner, setOwner } = Ember;

let Server;

moduleFor('mixin:extended-metadata', 'Unit | Mixin | extended metadata', {
  needs: [
    'adapter:bard-metadata',
    'service:bard-metadata',
    'service:keg',
    'service:ajax',
    'model:metadata/metric'
  ],

  beforeEach() {
    //setup Pretender
    Server = new Pretender(metadataRoutes);
  },
  afterEach() {
    //shutdown pretender
    Server.shutdown();
  }
});

test('load extended metadata correctly', function(assert) {
  assert.expect(1);

  let ExtendedMetadataObject = Ember.Object.extend(ExtendedMetadataMixin, {
    type: 'metric',
    name: 'metricOne'
  });
  let subject = ExtendedMetadataObject.create();
  setOwner(subject, getOwner(this));

  return get(subject, 'extended').then(() => {
    assert.deepEqual(
      get(subject, 'extended.content'),
      MetricOne,
      'extended property should load correct data'
    );
  });
});

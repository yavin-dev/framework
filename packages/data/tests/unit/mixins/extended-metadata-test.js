import EmberObject, { get } from '@ember/object';
import { setOwner } from '@ember/application';
import ExtendedMetadataMixin from 'navi-data/mixins/extended-metadata';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender from "pretender";

import metadataRoutes, {
  MetricOne
} from '../../helpers/metadata-routes';

let Server;

module('Unit | Mixin | extended metadata', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    //setup Pretender
    Server = new Pretender(metadataRoutes);
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  test('load extended metadata correctly', function(assert) {
    assert.expect(1);

    let ExtendedMetadataObject = EmberObject.extend(ExtendedMetadataMixin, {
      type: 'metric',
      name: 'metricOne'
    });
    let subject = ExtendedMetadataObject.create();
    setOwner(subject, this.owner);

    return get(subject, 'extended').then(() => {
      assert.deepEqual(get(subject, 'extended.content'),
        MetricOne,
        'extended property should load correct data');
    });
  });
});

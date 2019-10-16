import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Component | table config', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('dimensions', function(assert) {
    assert.expect(1);

    let request = {
      dimensions: [
        { dimension: { name: 'os', longName: 'Operating System' } },
        { dimension: { name: 'age', longName: 'Age' } }
      ]
    };

    assert.deepEqual(
      A(
        this.owner
          .factoryFor('component:navi-visualization-config/table')
          .create({ request })
          .get('dimensions')
      ).mapBy('longName'),
      ['Operating System', 'Age'],
      'The metadata for each of the dimensions in the request is fetched using the metadata service'
    );
  });
});

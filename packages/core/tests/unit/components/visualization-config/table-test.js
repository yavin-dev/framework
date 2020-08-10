import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Component | table config', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('dimensions', function(assert) {
    assert.expect(1);

    let request = {
      dimensions: [{ dimension: { id: 'os', name: 'Operating System' } }, { dimension: { id: 'age', name: 'Age' } }]
    };

    assert.deepEqual(
      A(
        this.owner
          .factoryFor('component:navi-visualization-config/table')
          .create({ request })
          .get('dimensions')
      ).mapBy('name'),
      ['Operating System', 'Age'],
      'The metadata for each of the dimensions in the request is fetched using the metadata service'
    );
  });
});

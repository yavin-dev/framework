import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

module('Unit | Component | table config', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
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
          .factoryFor('component:visualization-config/table')
          .create({ request })
          .get('dimensions')
      ).mapBy('longName'),
      ['Operating System', 'Age'],
      'The metadata for each of the dimensions in the request is fetched using the metadata service'
    );
  });
});

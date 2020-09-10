import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { createGlimmerComponent } from 'navi-core/test-support';

module('Unit | Component | dir-item-name-cell', function(hooks) {
  setupTest(hooks);

  test('links are constructed correctly', function(assert) {
    assert.expect(2);

    const args = {
      value: {
        constructor: {
          modelName: 'report'
        },
        modelId: '12345'
      }
    };
    let unsavedReportComponent = createGlimmerComponent('component:dir-item-name-cell', args);

    assert.equal(
      unsavedReportComponent.itemLink,
      'reports.report',
      'Component builds the link based on the type of the model correctly'
    );

    assert.equal(unsavedReportComponent.itemId, '12345', 'Component uses the modelId to construct the link');
  });
});

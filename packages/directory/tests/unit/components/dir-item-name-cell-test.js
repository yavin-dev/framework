import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | dir-item-name-cell', function(hooks) {
  setupTest(hooks);

  test('links are constructed correctly', function(assert) {
    assert.expect(2);

    const subject = this.owner.factoryFor('component:dir-item-name-cell');

    let unsavedReportComponent = subject.create({
      value: {
        serialize() {
          return { data: { type: 'reports' } };
        },
        modelId: '12345'
      }
    });

    assert.equal(
      unsavedReportComponent.get('itemLink'),
      'reports.report',
      'Component builds the link based on the type of the model correctly'
    );

    assert.equal(unsavedReportComponent.get('itemId'), '12345', 'Component uses the modelId to construct the link');
  });
});

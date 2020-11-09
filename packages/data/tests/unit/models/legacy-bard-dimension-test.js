import { module, test } from 'qunit';
import { isEqual } from '@ember/utils';
import BardDimension from 'navi-data/models/legacy-bard-dimension';

module('Unit | Model | Legacy Bard Dimension', function() {
  test('toString', function(assert) {
    assert.expect(1);
    let factory = BardDimension.extend().reopenClass({
      dimensionName: 'testDimension'
    });

    assert.equal(
      factory.toString(),
      'dimension model factory: testDimension',
      'toString correctly provides a description of the dimension model factory'
    );
  });

  test('isEqual', function(assert) {
    let dim1 = BardDimension.extend().reopenClass({
      dimensionName: 'testDimension1',
      identifierField: 'key'
    });

    assert.ok(
      isEqual(dim1.create({ key: 'foo', id: '1' }), dim1.create({ key: 'foo', id: '2' })),
      'Two fields that are identified by the same field and same name are equal'
    );

    assert.notOk(
      isEqual(dim1.create({ key: 'foo', id: '2' }), dim1.create({ key: 'bar', id: '2' })),
      'Two fields that are identified by the same field and have different name but different key should not be equal'
    );
  });
});

import { module, test } from 'qunit';
import { isEqual } from '@ember/utils';
import BardDimension from 'navi-data/models/bard-dimension';

module('Unit | Model | Bard Dimension', function() {
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
      isEqual(new dim1({ key: 'foo', id: '1' }), new dim1({ key: 'foo', id: '2' })),
      'Two fields that are identified by the same field and same name are equal'
    );

    assert.notOk(
      isEqual(new dim1({ key: 'foo', id: '2' }), new dim1({ key: 'bar', id: '2' })),
      'Two fields that are identified by the same field and have different name but different key should not be equal'
    );
  });
});

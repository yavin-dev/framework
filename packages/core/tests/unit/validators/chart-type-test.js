import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | chart-type', function(hooks) {
  setupTest(hooks);

  test('validate chart-type', function(assert) {
    assert.expect(3);

    let Validator = this.owner.lookup('validator:chart-type');

    assert.equal(Validator.validate('dimension'), true, 'chart-type returns `true` for dimension series');

    assert.equal(Validator.validate('metric'), true, 'chart-type returns `true` for metric series');

    assert.equal(Validator.validate('some-other-type'), false, 'chart-type returns `false` for unsupported chart type');
  });
});

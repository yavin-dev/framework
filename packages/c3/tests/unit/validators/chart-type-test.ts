import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | chart-type', function (hooks) {
  setupTest(hooks);

  test('validate chart-type', function (assert) {
    const Validator = this.owner.lookup('validator:chart-type');

    assert.true(Validator.validate('dimension'), 'chart-type returns `true` for dimension series');
    assert.true(Validator.validate('metric'), 'chart-type returns `true` for metric series');
    assert.false(Validator.validate('some-other-type'), 'chart-type returns `false` for unsupported chart type');
  });
});

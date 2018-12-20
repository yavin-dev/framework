import { moduleFor, test } from 'ember-qunit';

moduleFor('validator:chart-type', 'Unit | Validator | chart-type', {
  needs: ['validator:messages']
});

test('validate chart-type', function(assert) {
  assert.expect(3);

  let Validator = this.subject();

  assert.equal(Validator.validate('dimension'), true, 'chart-type returns `true` for dimension series');

  assert.equal(Validator.validate('metric'), true, 'chart-type returns `true` for metric series');

  assert.equal(Validator.validate('some-other-type'), false, 'chart-type returns `false` for unsupported chart type');
});

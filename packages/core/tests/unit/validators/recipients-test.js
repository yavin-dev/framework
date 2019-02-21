import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | recipients', function(hooks) {
  setupTest(hooks);

  test('validate recipients', function(assert) {
    assert.expect(4);

    let Validator = this.owner.lookup('validator:recipients'),
      badArray0 = A(['']),
      badArray1 = A(['name@domain', 'test@123.con']),
      emptyArr = A([]),
      badEmails = 'Array contents are not valid email addresses',
      emptyText = 'There must be at least one valid email address';

    assert.equal(
      Validator.validate(emptyArr, {
        invalidEmailMsg: badEmails,
        noRecipientsMsg: emptyText
      }),
      'There must be at least one valid email address',
      'Array is empty'
    );

    assert.equal(
      Validator.validate(badArray0, {
        invalidEmailMsg: badEmails,
        noRecipientsMsg: emptyText
      }),
      'There must be at least one valid email address',
      'Array has an empty string'
    );

    assert.equal(
      Validator.validate(badArray1, {
        invalidEmailMsg: badEmails,
        noRecipientsMsg: emptyText
      }),
      'Array contents are not valid email addresses',
      'Array has values that are almost valid email addresses'
    );

    let regArray = A(['user@navi.io', 'link@hyrule.com']),
      messageText = 'All array contents are valid email addresses';

    assert.equal(
      Validator.validate(regArray, {
        invalidEmailMsg: messageText,
        noRecipientsMsg: emptyText
      }),
      true,
      'Array contents are valid email addresses'
    );
  });
});

import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

moduleFor('validator:recipients', 'Unit | Validator | recipients', {
  needs: ['validator:messages']
});

test('validate recipients', function(assert) {
  assert.expect(4);

  let Validator = this.subject(),
    badArray0 = Ember.A(['']),
    badArray1 = Ember.A(['name@domain', 'test@123.con']),
    emptyArr = Ember.A([]),
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

  let regArray = Ember.A(['user@navi.io', 'link@hyrule.com']),
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

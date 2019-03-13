import { isValidMoment } from 'dummy/helpers/is-valid-moment';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Helper | is valid moment', function() {
  test('it works', function(assert) {
    assert.expect(5);

    assert.ok(isValidMoment('2/3/2015'), 'helper returns true for a valid date');

    assert.ok(isValidMoment(moment()), 'helper returns true for a valid moment object');

    assert.notOk(isValidMoment('invalid'), 'helper returns false for an invalid date');

    assert.notOk(isValidMoment(null), 'helper returns false for null');

    assert.notOk(isValidMoment(), 'helper returns false for undefined');
  });
});

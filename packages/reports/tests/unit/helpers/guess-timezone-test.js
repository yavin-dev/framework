import { guessTimezone } from 'dummy/helpers/guess-timezone';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Helper | guess timezone', function() {
  test('guess timezone', function(assert) {
    assert.expect(1);

    assert.equal(guessTimezone(), moment.tz.guess(), 'The helper returns the timezone guessed by moment');
  });
});

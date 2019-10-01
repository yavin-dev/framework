import moment from 'moment';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';

let Validator, TestInterval;

module('Unit | Validator | interval', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Validator = this.owner.lookup('validator:interval');
    TestInterval = new Interval(new Duration('P7D'), 'current');
  });

  test('no options', function(assert) {
    assert.expect(1);

    assert.equal(Validator.validate(TestInterval), true, 'validate returns true when options are empty');
  });

  test('ascending', function(assert) {
    assert.expect(4);

    let descendingInterval = new Interval(moment('2015', 'YYYY'), moment('1990', 'YYYY')),
      ascendingInterval = TestInterval,
      message = () => 'This field date should be before end date';

    assert.equal(
      Validator.validate(descendingInterval, { message }),
      true,
      'descending interval is valid when no `ascending` property is set'
    );

    assert.equal(
      Validator.validate(descendingInterval, { ascending: true, message }),
      'This field date should be before end date',
      'descending interval has correct error when `ascending` is set'
    );

    assert.equal(
      Validator.validate(null, { ascending: true, message }),
      'This field date should be before end date',
      'null value is not considered ascending'
    );

    assert.equal(
      Validator.validate(ascendingInterval, { ascending: true, message }),
      true,
      'ascending interval is valid'
    );
  });

  test('next', function(assert) {
    assert.expect(1);

    let currentnextInterval = new Interval('current', 'next'),
      message = () => 'date should be before end date';

    assert.equal(Validator.validate(currentnextInterval, { message }), true, 'next after current is a valid interval');
  });
});

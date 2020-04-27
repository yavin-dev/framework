import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';
import DateUtils from 'navi-data/utils/date';

module('Unit | Transform | moment', function(hooks) {
  setupTest(hooks);

  test('deserialize', function(assert) {
    assert.expect(2);

    let transform = this.owner.lookup('transform:moment');

    let date = '2015-04-10 00:00:00.000',
      expectedMoment = moment.utc(date, DateUtils.API_DATE_FORMAT_STRING),
      actualMoment = transform.deserialize(date);

    assert.ok(actualMoment.isSame(expectedMoment), 'transform correctly deserialized a string to a moment object');

    assert.equal(transform.deserialize(undefined), null, 'transform deserializes non dates to null');
  });

  test('serialize', function(assert) {
    assert.expect(2);

    let transform = this.owner.lookup('transform:moment');

    let expectedDate = '2015-04-10 00:00:00.000',
      testMoment = moment.utc(expectedDate, DateUtils.API_DATE_FORMAT_STRING),
      actualDate = transform.serialize(testMoment);

    assert.equal(actualDate, expectedDate, 'transform correctly serialized a moment into a date string');

    assert.equal(transform.serialize(undefined), null, 'transform serializes non moment objects to null');
  });
});

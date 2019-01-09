import { moduleForModel, test } from 'ember-qunit';
import moment from 'moment';
import DateUtils from 'navi-core/utils/date';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import { setupMock, teardownMock } from '../../../../helpers/mirage-helper';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';

var Store;

moduleForModel('fragments-mock', 'Unit | Model Fragment | BardRequest - Interval', {
  needs: [
    'transform:fragment',
    'transform:fragment-array',
    'transform:table',
    'transform:moment',
    'model:bard-request/fragments/interval',
    'serializer:bard-request/fragments/interval',
    'validator:presence',
    'validator:interval'
  ],

  beforeEach() {
    //Set up testing environment
    let interval = {
      id: 'all',
      start: 'P7D',
      end: '2015-08-20 00:00:00.000'
    };

    setupMock();
    Store = getOwner(this).lookup('service:store');

    //Add instances to the store
    run(() => {
      Store.pushPayload({
        data: {
          id: 1,
          type: 'fragments-mock',
          attributes: {
            intervals: [interval]
          }
        }
      });
    });
  },
  afterEach() {
    teardownMock();
  }
});

test('Model using the Interval Fragment', function(assert) {
  assert.expect(3);

  let mockModel = Store.peekRecord('fragments-mock', 1),
    startDate = moment('1951-07-21 00:00:00.000', DateUtils.API_DATE_FORMAT_STRING),
    endDate = moment('2015-08-20 00:00:00.000', DateUtils.API_DATE_FORMAT_STRING),
    interval = new Interval(startDate, endDate);

  run(() => {
    /* == Getter Method == */
    assert.ok(
      mockModel.get('intervals.firstObject.interval').isEqual(new Interval(new Duration('P7D'), endDate)),
      'The interval property is set based on start and end in payload'
    );

    /* == Setter Method == */
    mockModel.get('intervals.firstObject').set('interval', interval);
  });

  assert.ok(
    mockModel.get('intervals.firstObject.interval').isEqual(interval),
    'The interval property is as set using the setter'
  );

  /* == Serialize == */
  assert.deepEqual(
    mockModel.serialize().data.attributes.intervals,
    [
      {
        end: endDate.format(DateUtils.API_DATE_FORMAT_STRING),
        start: startDate.format(DateUtils.API_DATE_FORMAT_STRING)
      }
    ],
    'The model object was serialized into start and end strings'
  );
});

test('Interval Validations', function(assert) {
  assert.expect(8);

  let interval = run(() => Store.peekRecord('fragments-mock', 1).get('intervals.firstObject'));

  return interval.validate().then(({ validations }) => {
    assert.ok(validations.get('isValid'), 'Interval is valid');
    assert.equal(validations.get('messages').length, 0, 'There are no validation errors');

    interval.set('interval', undefined);
    return interval.validate().then(({ validations }) => {
      assert.ok(!validations.get('isValid'), 'Undefined interval is invalid');

      assert.equal(validations.get('messages').length, 1, 'Undefined interval has one validation error');

      assert.equal(
        validations.get('messages').objectAt(0),
        'Please select a date range',
        'Interval cannot be empty is a part of the error messages'
      );

      /* == Check interval with end before start == */
      interval.set('interval', new Interval(moment('2015', 'YYYY'), moment('1990', 'YYYY')));
      return interval.validate().then(({ validations }) => {
        assert.ok(!validations.get('isValid'), 'Descending interval is invalid');

        assert.equal(validations.get('messages').length, 1, 'Descending interval has one validation error');

        assert.equal(
          validations.get('messages').objectAt(0),
          'The start date should be before end date',
          'Start Date should be before end date is a part of the error messages'
        );
      });
    });
  });
});

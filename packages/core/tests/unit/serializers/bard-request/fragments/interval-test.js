import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';
import Interval from 'navi-data/utils/classes/interval';
import Duration from 'navi-data/utils/classes/duration';

let Serializer, Model;

module('Unit | Serializer | Interval Fragment', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:bard-request/fragments/interval');
    Model = this.owner.factoryFor('model:bard-request/fragments/interval').class;
  });

  test('serializing record', function(assert) {
    assert.expect(3);

    run(() => {
      let record = this.owner.lookup('service:store').createFragment('bard-request/fragments/interval', {
        interval: new Interval(moment('11-09-2015', 'MM-DD-YYYY'), moment('11-16-2015', 'MM-DD-YYYY'))
      });

      assert.deepEqual(
        record.serialize(),
        {
          start: '2015-11-09 00:00:00.000',
          end: '2015-11-16 00:00:00.000'
        },
        'the serializer transforms moments to start/end when serializing'
      );

      record = this.owner.lookup('service:store').createFragment('bard-request/fragments/interval', {
        interval: new Interval(new Duration('P7D'), 'current')
      });

      assert.deepEqual(
        record.serialize(),
        {
          start: 'P7D',
          end: 'current'
        },
        'the serializer transforms durations and macros to start/end when serializing'
      );

      record = this.owner.lookup('service:store').createFragment('bard-request/fragments/interval', {
        interval: new Interval('current', 'next')
      });

      assert.deepEqual(
        record.serialize(),
        {
          start: 'current',
          end: 'next'
        },
        'the serializer transforms current and next to start/end when serializing'
      );
    });
  });

  test('normalizing record', function(assert) {
    assert.expect(3);

    let payload = {
      start: '2015-11-09 00:00:00.000',
      end: '2015-11-16 00:00:00.000'
    };

    Serializer.normalize(Model, payload);

    assert.ok(
      payload.interval.isEqual(new Interval(moment('11-09-2015', 'MM-DD-YYYY'), moment('11-16-2015', 'MM-DD-YYYY'))),
      'the serializer transforms start/end to moments when deserializing'
    );

    payload = {
      start: 'P7D',
      end: 'current'
    };

    Serializer.normalize(Model, payload);

    assert.ok(
      payload.interval.isEqual(new Interval(new Duration('P7D'), 'current')),
      'the serializer transforms start/end to durations and macros when deserializing'
    );

    payload = {
      start: 'current',
      end: 'next'
    };

    Serializer.normalize(Model, payload);
    assert.ok(
      payload.interval.isEqual(new Interval('current', 'next')),
      'the serializer transforms start/end to current and next when deserializing'
    );
  });
});
